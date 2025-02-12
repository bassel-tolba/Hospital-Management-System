import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, Select, InputNumber, Tag, Tooltip } from "antd";
import { useUnitStore } from "../../services/unit.service";
import {
	SearchOutlined,
	EditOutlined,
	DeleteOutlined,
	PlusOutlined,
	HomeOutlined,
	EnvironmentOutlined,
	InfoCircleOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { UnitType } from "../../models/UnitType";
import { Row, Col } from "antd";

const { Title } = Typography;
const { Option } = Select;

const UnitList = () => {
	const { units, loading, total, searchUnits, deleteUnit, createUnit, updateUnit, setLoading } = useUnitStore();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedUnit, setSelectedUnit] = useState(null);
	const [form] = Form.useForm();
	const [searchTerm, setSearchTerm] = useState("");
	const [locationType, setLocationType] = useState("custom");

	useEffect(() => {
		fetchUnits();
	}, []);

	const fetchUnits = async () => {
		setLoading(true);
		try {
			await searchUnits(searchTerm);
		} catch (error) {
			console.error("Error fetching units:", error);
		} finally {
			setLoading(false);
		}
	};

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
			if (locationValues.length == 2 && (locationValues[0] == "floor" || locationValues[0] == "place")) {
				setLocationType(locationValues[0]);
				form.setFieldsValue({
					locationNumber: parseInt(locationValues[1]),
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
			form.setFieldsValue({ location: `${value}-` });
		} else {
			form.setFieldsValue({ location: "" });
		}
	};

	const handleLocationNumberChange = (value) => {
		if (locationType != "custom") {
			form.setFieldsValue({ location: `${locationType}-${value}` });
		}
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			if (selectedUnit) {
				await updateUnit(selectedUnit.id, values);
			} else {
				await createUnit(values);
			}
			fetchUnits();
			setIsModalVisible(false);
		} catch (error) {
			console.error("Error submitting form:", error);
		}
	};

	const handleDelete = async (unitId) => {
		try {
			await deleteUnit(unitId);
			fetchUnits();
		} catch (error) {
			console.error("Error deleting unit:", error);
		}
	};

	const handleSearch = (value) => {
		setSearchTerm(value);
		fetchUnits();
	};

	const getUnitTypeColor = (unitType) => {
		const colors = {
			APARTMENT: "blue",
			HOUSE: "green",
			OFFICE: "geekblue",
			RETAIL: "orange",
			// Add more types as needed
		};
		return colors[unitType] || "default";
	};

	const columns = [
		{
			title: "Unit Name",
			dataIndex: "name",
			key: "name",
			render: (text) => (
				<Space>
					<HomeOutlined />
					<span>{text}</span>
				</Space>
			),
		},
		{
			title: "Unit Type",
			dataIndex: "unitType",
			key: "unitType",
			render: (unitType) => <Tag color={getUnitTypeColor(unitType)}>{unitType ? UnitType[unitType].displayName : "N/A"}</Tag>,
		},
		{
			title: "Location",
			dataIndex: "location",
			key: "location",
			render: (location) => (
				<Space>
					<EnvironmentOutlined />
					<span>{location}</span>
				</Space>
			),
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
			render: (description) => (
				<Tooltip title={description}>
					{description ? description.slice(0, 50) + (description.length > 50 ? "..." : "") : "No description"}
				</Tooltip>
			),
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					<Tooltip title="Edit Unit">
						<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)} />
					</Tooltip>
					<Tooltip title="Delete Unit">
						<Button danger type="primary" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
					</Tooltip>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 24 }}>
			<Title level={2}>
				<Space>
					<HomeOutlined />
					Unit List
				</Space>
			</Title>

			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12} md={8}>
					<Input.Search placeholder="Search by Unit Name..." onSearch={handleSearch} prefix={<SearchOutlined />} />
				</Col>
				<Col xs={24} sm={12} md={8}>
					<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)} block>
						Add New Unit
					</Button>
				</Col>
			</Row>

			<Table columns={columns} dataSource={units} loading={loading} rowKey="id" pagination={false} scroll={{ x: true }} />

			<Modal
				title={
					<Space>
						{selectedUnit ? <EditOutlined /> : <PlusOutlined />}
						{selectedUnit ? "Edit Unit" : "Add New Unit"}
					</Space>
				}
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleFormSubmit}>
						{selectedUnit ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical">
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={24} md={12}>
							<Form.Item label="Unit Name" name="name" rules={[{ required: true, message: "Please enter unit name" }]}>
								<Input prefix={<HomeOutlined />} placeholder="Enter unit name" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={24} md={12}>
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

					<Row gutter={[16, 16]}>
						<Col xs={24} sm={24} md={12}>
							<Form.Item label="Location Type">
								<Select defaultValue="custom" onChange={handleLocationTypeChange}>
									<Option value="floor">Floor</Option>
									<Option value="place">Place</Option>
									<Option value="custom">Custom</Option>
								</Select>
							</Form.Item>
						</Col>
						{locationType !== "custom" ? (
							<Col xs={24} sm={24} md={12}>
								<Form.Item label="Location Number">
									<InputNumber style={{ width: "100%" }} onChange={handleLocationNumberChange} min={1} />
								</Form.Item>
							</Col>
						) : (
							<Col xs={24} sm={24} md={12}>
								<Form.Item label="Custom Location" name="location">
									<Input prefix={<EnvironmentOutlined />} placeholder="Enter custom location" />
								</Form.Item>
							</Col>
						)}
					</Row>

					<Row gutter={[16, 16]}>
						<Col span={24}>
							<Form.Item label="Description" name="description">
								<Input.TextArea placeholder="Enter description" rows={4} showCount maxLength={500} />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default UnitList;
