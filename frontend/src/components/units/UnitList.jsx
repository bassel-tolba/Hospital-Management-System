import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, Select, InputNumber, Tag, Tooltip } from "antd";
import { useUnitStore } from "../../services/unit.service";
// *** ADDED: Import useAuthStore ***
import { useAuthStore } from "../../services/auth.service"; // Adjust the path as necessary
import {
	SearchOutlined,
	EditOutlined,
	DeleteOutlined,
	PlusOutlined,
	HomeOutlined,
	EnvironmentOutlined,
	InfoCircleOutlined,
	// UserOutlined, // UserOutlined was imported but not used
} from "@ant-design/icons";
import { UnitType } from "../../models/UnitType";
import { Row, Col } from "antd";

const { Title } = Typography;
const { Option } = Select;

const UnitList = () => {
	const { units, loading, total, searchUnits, deleteUnit, createUnit, updateUnit, setLoading } = useUnitStore();
	// *** ADDED: Get user and hasAuthority from auth store ***
	const { user, hasAuthority } = useAuthStore();

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedUnit, setSelectedUnit] = useState(null);
	const [form] = Form.useForm();
	const [searchTerm, setSearchTerm] = useState("");
	const [locationType, setLocationType] = useState("custom");

	useEffect(() => {
		fetchUnits();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchTerm]); // Added searchTerm dependency for search trigger

	const fetchUnits = async () => {
		setLoading(true);
		try {
			// searchUnits maps to GET /api/units/search -> permitAll() - No specific permission check needed for viewing/searching
			await searchUnits(searchTerm);
		} catch (error) {
			console.error("Error fetching units:", error);
		} finally {
			setLoading(false);
		}
	};

	// No permission check needed for showModal itself, checks are applied on the buttons triggering it and the save action inside.
	const showModal = (unit) => {
		setSelectedUnit(unit);
		if (unit) {
			form.setFieldsValue({
				name: unit.name,
				unitType: unit.unitType,
				location: unit.location,
				description: unit.description,
			});
			const locationValues = unit.location ? unit.location.split("-") : [];
			if (locationValues.length === 2 && (locationValues[0] === "floor" || locationValues[0] === "place")) {
				setLocationType(locationValues[0]);
				form.setFieldsValue({
					locationNumber: parseInt(locationValues[1], 10), // Added radix 10
				});
			} else {
				setLocationType("custom");
			}
		} else {
			setLocationType("custom");
			form.resetFields();
		}
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedUnit(null);
		form.resetFields();
		setLocationType("custom");
	};

	const handleLocationTypeChange = (value) => {
		setLocationType(value);
		if (value !== "custom") {
			form.setFieldsValue({ location: `${value}-`, locationNumber: undefined }); // Clear number when switching type
		} else {
			form.setFieldsValue({ location: "" });
		}
	};

	const handleLocationNumberChange = (value) => {
		if (locationType !== "custom") {
			form.setFieldsValue({ location: `${locationType}-${value}` });
		}
	};

	const handleFormSubmit = async () => {
		// Permission check happens on the modal submit button's disabled state.
		// This function only runs if the button is enabled and clicked.
		try {
			const values = await form.validateFields();
			if (selectedUnit) {
				// updateUnit maps to PUT /api/units/{id} -> requires UPDATE_UNIT
				// Check is implicitly done by the button state
				await updateUnit(selectedUnit.id, values);
			} else {
				// createUnit maps to POST /api/units -> requires CREATE_UNIT
				// Check is implicitly done by the button state
				await createUnit(values);
			}
			await fetchUnits(); // Refetch after successful operation
			setIsModalVisible(false);
		} catch (error) {
			console.error("Error submitting form:", error);
			// Handle error feedback to user if necessary
		}
	};

	const handleDelete = async (unitId) => {
		// deleteUnit maps to DELETE /api/units/{id} -> requires DELETE_UNIT
		// Check is done on the button that triggers this handler
		try {
			await deleteUnit(unitId);
			await fetchUnits(); // Refetch after successful deletion
		} catch (error) {
			console.error("Error deleting unit:", error);
			// Handle error feedback to user if necessary
		}
	};

	// Renamed handleSearch parameter for clarity and consistency
	const handleSearchTrigger = (value) => {
		setSearchTerm(value);
		// fetchUnits will be called by useEffect dependency change
	};

	const getUnitTypeColor = (unitType) => {
		const colors = {
			APARTMENT: "blue",
			HOUSE: "green",
			OFFICE: "geekblue",
			RETAIL: "orange",
			WARD: "purple", // Example addition
			CLINIC: "cyan", // Example addition
		};
		// Added safety check for undefined unitType
		return unitType ? colors[unitType] || "default" : "default";
	};

	const columns = [
		{
			title: "Unit Name",
			dataIndex: "name",
			key: "name",
			render: (text) => (
				<Space>
					<HomeOutlined />
					<span>{text || "N/A"}</span>
				</Space>
			),
		},
		{
			title: "Unit Type",
			dataIndex: "unitType",
			key: "unitType",
			// Added safety check for undefined displayName and key
			render: (unitType) =>
				unitType && UnitType[unitType] ? <Tag color={getUnitTypeColor(unitType)}>{UnitType[unitType].displayName}</Tag> : <Tag>N/A</Tag>,
		},
		{
			title: "Location",
			dataIndex: "location",
			key: "location",
			render: (location) => (
				<Space>
					<EnvironmentOutlined />
					<span>{location || "N/A"}</span>
				</Space>
			),
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
			ellipsis: {
				// Use Antd ellipsis for better handling
				tooltip: true,
			},
			render: (description) => description || "No description",
		},
		{
			title: "Actions",
			key: "actions",
			// Fixed width can help prevent layout shifts
			width: 120,
			render: (text, record) => (
				<Space size="middle">
					{/* *** MODIFIED: Check UPDATE_UNIT permission for Edit button *** */}
					{user && hasAuthority("UPDATE_UNIT") && (
						<Tooltip title="Edit Unit">
							<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)} size="small" />
						</Tooltip>
					)}
					{/* *** MODIFIED: Check DELETE_UNIT permission for Delete button *** */}
					{user && hasAuthority("DELETE_UNIT") && (
						<Tooltip title="Delete Unit">
							<Button danger type="primary" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} size="small" />
						</Tooltip>
					)}
					{/* Render nothing or placeholder if no actions allowed */}
					{!(user && hasAuthority("UPDATE_UNIT")) && !(user && hasAuthority("DELETE_UNIT")) && (
						<span style={{ color: "#ccc" }}>No actions</span>
					)}
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 24 }}>
			<Title level={2}>
				<Space>
					<HomeOutlined />
					Unit Management
				</Space>
			</Title>

			<Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
				{/* Search - No permission check needed */}
				<Col xs={24} sm={12} md={8} lg={6}>
					<Input.Search placeholder="Search Units..." onSearch={handleSearchTrigger} enterButton prefix={<SearchOutlined />} />
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					{/* *** MODIFIED: Check CREATE_UNIT permission for Add button *** */}
					{user && hasAuthority("CREATE_UNIT") && (
						<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)} block>
							Add New Unit
						</Button>
					)}
				</Col>
			</Row>

			{/* Table - No permission check needed for viewing data based on permitAll() */}
			<Table
				columns={columns}
				dataSource={units}
				loading={loading}
				rowKey="id"
				pagination={false} // Assuming pagination is handled elsewhere if needed (total is available)
				scroll={{ x: true }} // Keep horizontal scroll for smaller screens
			/>

			<Modal
				title={
					<Space>
						{selectedUnit ? <EditOutlined /> : <PlusOutlined />}
						{selectedUnit ? "Edit Unit" : "Add New Unit"}
					</Space>
				}
				open={isModalVisible} // Use 'open' prop instead of 'visible' for newer Antd versions
				onCancel={handleCancel}
				destroyOnClose // Reset form state when modal is closed
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					// *** MODIFIED: Disable Save/Update button based on permissions ***
					<Button
						key="submit"
						type="primary"
						onClick={handleFormSubmit}
						disabled={!user || (selectedUnit ? !hasAuthority("UPDATE_UNIT") : !hasAuthority("CREATE_UNIT"))}
						loading={loading} // Show loading state on button during submit
					>
						{selectedUnit ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical" name="unitForm">
					<Row gutter={[16, 0]}>
						{" "}
						{/* Reduced gutter for tighter spacing */}
						<Col xs={24} sm={12}>
							<Form.Item label="Unit Name" name="name" rules={[{ required: true, message: "Please enter unit name" }]}>
								<Input prefix={<HomeOutlined />} placeholder="Enter unit name" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Unit Type" name="unitType" rules={[{ required: true, message: "Please select a unit type" }]}>
								<Select placeholder="Select a unit type">
									{Object.keys(UnitType).map((key) => (
										<Option key={key} value={key}>
											<Tag color={getUnitTypeColor(key)}>{UnitType[key].displayName}</Tag>
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={[16, 0]}>
						<Col xs={24} sm={12}>
							<Form.Item label="Location Type">
								{/* Changed to Select directly */}
								<Select value={locationType} onChange={handleLocationTypeChange}>
									<Option value="floor">Floor</Option>
									<Option value="place">Place</Option>
									<Option value="custom">Custom</Option>
								</Select>
							</Form.Item>
						</Col>
						{/* Conditional rendering based on locationType state */}
						{locationType !== "custom" ? (
							<Col xs={24} sm={12}>
								<Form.Item
									label="Location Number"
									name="locationNumber" // Separate field for number part
									rules={[{ required: true, message: "Please enter location number" }]}>
									<InputNumber style={{ width: "100%" }} onChange={handleLocationNumberChange} min={1} placeholder="Enter number" />
								</Form.Item>
								{/* Hidden field to store the combined value */}
								<Form.Item name="location" hidden>
									<Input />
								</Form.Item>
							</Col>
						) : (
							<Col xs={24} sm={12}>
								<Form.Item
									label="Custom Location"
									name="location"
									rules={[{ required: true, message: "Please enter custom location" }]}>
									<Input prefix={<EnvironmentOutlined />} placeholder="e.g., Building A, North Wing" />
								</Form.Item>
							</Col>
						)}
					</Row>

					<Row gutter={[16, 0]}>
						<Col span={24}>
							<Form.Item label="Description" name="description">
								<Input.TextArea placeholder="Optional: Add a description" rows={3} showCount maxLength={500} />
							</Form.Item>
						</Col>
					</Row>
					{/* Hidden field to store ID for update operations if needed */}
					{selectedUnit && (
						<Form.Item name="id" initialValue={selectedUnit.id} hidden>
							<Input />
						</Form.Item>
					)}
				</Form>
			</Modal>
		</div>
	);
};

export default UnitList;
