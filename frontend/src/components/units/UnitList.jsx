import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, Select } from "antd";
import { useUnitStore } from "../../services/unit.service";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { UnitType } from "../../models/UnitType"; // Import the UnitType enum

const { Title } = Typography;
const { Option } = Select;

const UnitList = () => {
	const { units, loading, total, searchUnits, deleteUnit, createUnit, updateUnit, getAllUnits, setLoading } = useUnitStore();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedUnit, setSelectedUnit] = useState(null);
	const [form] = Form.useForm();
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		console.log("useEffect: Component mounted or dependencies changed");
		fetchUnits();
	}, []);

	const fetchUnits = async () => {
		console.log("fetchUnits: Fetching units from server");
		setLoading(true);
		try {
			// Perform an empty search before fetching all units
			await searchUnits("");
			await getAllUnits();
			console.log("fetchUnits: Units received:", units);
		} catch (error) {
			console.error("fetchUnits: error in getting units:", error);
		} finally {
			setLoading(false);
		}
	};

	const showModal = (unit) => {
		console.log("showModal: Opening modal, unit:", unit);
		setSelectedUnit(unit);
		if (unit) {
			form.setFieldsValue({
				name: unit.unitType, // Set the form value from unitType
			});
		} else {
			form.resetFields();
		}

		setIsModalVisible(true);
	};

	const handleCancel = () => {
		console.log("handleCancel: Closing modal");
		setIsModalVisible(false);
		setSelectedUnit(null);
		form.resetFields();
	};

	const handleFormSubmit = async () => {
		console.log("handleFormSubmit: Submitting form");
		try {
			const values = await form.validateFields();
			const unitData = { ...values };
			if (selectedUnit) {
				console.log("handleFormSubmit: Updating unit with id:", selectedUnit.id, "data", unitData);
				await updateUnit(selectedUnit.id, unitData);
			} else {
				console.log("handleFormSubmit: Creating new unit:", unitData);
				await createUnit(unitData);
			}
			fetchUnits();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedUnit(null);
		} catch (error) {
			console.log("error in handle form submit", error);
		}
	};

	const handleDelete = async (unitId) => {
		console.log("handleDelete: Deleting unit with id:", unitId);
		try {
			await deleteUnit(unitId);
			fetchUnits();
		} catch (error) {
			console.error("Error deleting unit:", error);
		}
	};
	const handleSearch = async (value) => {
		console.log("handleSearch: Searching units with value:", value);
		setSearchTerm(value);
		try {
			await searchUnits(value);
		} catch (error) {
			console.log("error in handle search submit", error);
		}
	};

	const columns = [
		{
			title: "Unit Type",
			dataIndex: "name", // Changed from "unitType" to "name"
			key: "unitType",
			render: (text) => {
				console.log("render: Rendering unitType:", text);
				const unitType = UnitType[text];
				const displayName = unitType ? unitType.displayName : text;
				console.log("render: Display name:", displayName);
				return displayName;
			},
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
						Edit
					</Button>
					<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
						Delete
					</Button>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 20 }}>
			<Title level={2}>Unit List</Title>
			<Space style={{ marginBottom: 16 }}>
				<Input.Search placeholder="Search by Unit Name..." onSearch={handleSearch} style={{ width: 300 }} />
				<Button type="primary" onClick={() => showModal(null)}>
					Add New Unit
				</Button>
			</Space>

			<Table columns={columns} dataSource={units} loading={loading} rowKey="id" pagination={false} />
			<Modal
				title={selectedUnit ? "Edit Unit" : "Add Unit"}
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
					<Form.Item label="Unit Type" name="name" rules={[{ required: true, message: "Please select a unit type" }]}>
						<Select placeholder="Select a unit type">
							{Object.keys(UnitType).map((key) => (
								<Option key={key} value={key}>
									{UnitType[key].displayName}
								</Option>
							))}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default UnitList;
