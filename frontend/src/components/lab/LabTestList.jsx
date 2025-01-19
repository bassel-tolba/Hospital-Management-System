import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, notification, Divider, Tooltip, Select } from "antd";
import { useAuthStore } from "../../services/auth.service";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useLabStore } from "../../services/lab.service";
import LabTestTableBuilder from "./LabTestTableBuilder"; // Import the table builder

const { Title } = Typography;

const LabTestList = () => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedLabTest, setSelectedLabTest] = useState(null);
	const [form] = Form.useForm();
	const { labTests, loading, error, fetchLabTests, createLabTest } = useLabStore();
	const user = useAuthStore((state) => state.user);
	const [searchTerm, setSearchTerm] = useState("");
	const [testCodeSearch, setTestCodeSearch] = useState("");
	const [tableData, setTableData] = useState(null); // State for table data
	const [initialTableData, setInitialTableData] = useState(null);

	useEffect(() => {
		fetchLabTests(searchTerm, testCodeSearch);
	}, [searchTerm, testCodeSearch, fetchLabTests]);

	const showModal = (labTest) => {
		setSelectedLabTest(labTest);
		if (labTest) {
			setInitialTableData(labTest.structureMap?.table);
			form.setFieldsValue(labTest);
		} else {
			setInitialTableData(null);
			form.resetFields();
		}
		setIsModalVisible(true);
	};
	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedLabTest(null);
		form.resetFields();
		setInitialTableData(null);
		setTableData(null); //clear the table data
	};

	const handleTableChange = (data) => {
		setTableData(data); // Store table data from builder
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();

			const labTestData = { ...values, structureMap: { table: tableData } };

			if (selectedLabTest) {
				//logic to update is not needed yet just create will do for now
			} else {
				const createdLabTest = await createLabTest(labTestData);
				if (createdLabTest) {
					fetchLabTests(searchTerm, testCodeSearch);
				}
			}
			setIsModalVisible(false);
			setSelectedLabTest(null);
			form.resetFields();
			setInitialTableData(null);
			setTableData(null); //clear the table data
		} catch (error) {
			notification.error({
				message: "Error",
				description: `Failed to save lab test: ${error.message}`,
			});
		}
	};
	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
	};
	const handleTestCodeSearch = (e) => {
		setTestCodeSearch(e.target.value);
	};

	const columns = [
		{
			title: "Test Name",
			dataIndex: "testName",
			key: "testName",
		},
		{
			title: "Test Code",
			dataIndex: "testCode",
			key: "testCode",
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
		},
		{
			title: "Reference Range",
			dataIndex: "referenceRange",
			key: "referenceRange",
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
						Edit
					</Button>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 20 }}>
			<Title level={2}>Lab Tests</Title>
			<Space style={{ marginBottom: 16 }}>
				<Input placeholder="Search by Test Name" value={searchTerm} onChange={handleSearch} />
				<Input placeholder="Search by Test Code" value={testCodeSearch} onChange={handleTestCodeSearch} />
				<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
					Add New Lab Test
				</Button>
			</Space>
			<Table columns={columns} dataSource={labTests} loading={loading} rowKey="id" />
			<Modal
				title={selectedLabTest ? "Edit Lab Test" : "Add Lab Test"}
				open={isModalVisible}
				onCancel={handleCancel}
				width={800}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleFormSubmit}>
						{selectedLabTest ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical">
					<Form.Item label="Test Name" name="testName" rules={[{ required: true, message: "Please enter the test name" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Test Code" name="testCode" rules={[{ required: true, message: "Please enter the test code" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Price" name="price" rules={[{ required: true, message: "Please enter the price" }]}>
						<Input type="number" />
					</Form.Item>
					<Form.Item label="Description" name="description" rules={[{ required: true, message: "Please enter the description" }]}>
						<Input.TextArea rows={4} />
					</Form.Item>
					<Form.Item
						label="Reference Range"
						name="referenceRange"
						rules={[
							{
								required: true,
								message: "Please enter the reference range",
							},
						]}>
						<Input.TextArea rows={4} />
					</Form.Item>
					<Divider>Define Result Structure</Divider>
					<LabTestTableBuilder onTableChange={handleTableChange} initialTableData={initialTableData} />
				</Form>
			</Modal>
		</div>
	);
};

export default LabTestList;
