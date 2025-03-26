import React, { useState, useEffect } from "react";
import {
	Table,
	Input,
	Button,
	Space,
	Typography,
	Modal,
	Form,
	notification,
	Divider,
	Tooltip,
	Row,
	Col,
	Popconfirm,
	Alert, // Import Alert
} from "antd";
import { useAuthStore } from "../../services/auth.service";
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useLabStore } from "../../services/lab.service";
import LabTestTableBuilder from "./LabTestTableBuilder";

const { Title } = Typography;

const LabTestList = () => {
	// ... (rest of your component state and functions) ...
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isViewModalVisible, setIsViewModalVisible] = useState(false);
	const [selectedLabTest, setSelectedLabTest] = useState(null);
	const [form] = Form.useForm();
	const { labTests, loading, error, fetchLabTests, createLabTest, updateLabTest, deleteLabTest } = useLabStore(); // Add deleteLabTest
	const { hasAuthority } = useAuthStore();
	const [searchTerm, setSearchTerm] = useState("");
	const [tableData, setTableData] = useState(null);
	const [initialTableData, setInitialTableData] = useState(null);
	const [viewTableData, setViewTableData] = useState(null);
	const [viewInitialTableData, setViewInitialTableData] = useState(null);

	// Permission Checks
	const canCreateLabTest = hasAuthority("CREATE_LAB_TEST");
	const canReadLabTest = hasAuthority("READ_LAB_TEST");
	const canUpdateLabTest = hasAuthority("UPDATE_LAB_TEST");
	const canDeleteLabTest = hasAuthority("DELETE_LAB_TEST"); // Add delete permission check

	useEffect(() => {
		if (canReadLabTest) {
			fetchLabTests(searchTerm);
		} else {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to view lab tests.",
			});
		}
	}, [searchTerm, fetchLabTests, canReadLabTest]);

	const showModal = (labTest) => {
		const hasPermission = labTest ? canUpdateLabTest : canCreateLabTest;

		if (!hasPermission) {
			notification.error({
				message: "Permission Denied",
				description: `You do not have permission to ${labTest ? "update" : "create"} lab tests.`,
			});
			return;
		}

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
	const showViewModal = (labTest) => {
		if (!canReadLabTest) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to view lab tests.",
			});
			return;
		}
		setSelectedLabTest(labTest);
		if (labTest) {
			setViewTableData(labTest.structureMap?.table);
			form.setFieldsValue(labTest);
		} else {
			setViewTableData(null);
			form.resetFields();
		}
		setIsViewModalVisible(true);
	};
	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedLabTest(null);
		form.resetFields();
		setInitialTableData(null);
		setTableData(null);
	};

	const handleViewCancel = () => {
		setIsViewModalVisible(false);
		setSelectedLabTest(null);
		form.resetFields();
		setViewTableData(null);
	};
	const handleTableChange = (data) => {
		setTableData(data);
	};

	const handleFormSubmit = async () => {
		const hasPermission = selectedLabTest ? canUpdateLabTest : canCreateLabTest;
		if (!hasPermission) {
			notification.error({
				message: "Permission Denied",
				description: `You do not have permission to ${selectedLabTest ? "update" : "create"} lab tests.`,
			});
			return;
		}
		try {
			const values = await form.validateFields();
			const labTestData = { ...values, structureMap: { table: tableData } };

			if (selectedLabTest) {
				const updatedLabTest = await updateLabTest(selectedLabTest.id, labTestData);
				if (updatedLabTest) {
					fetchLabTests(searchTerm);
				}
			} else {
				const createdLabTest = await createLabTest(labTestData);
				if (createdLabTest) {
					fetchLabTests(searchTerm);
				}
			}
			setIsModalVisible(false);
			setSelectedLabTest(null);
			form.resetFields();
			setInitialTableData(null);
			setTableData(null);
		} catch (error) {
			notification.error({
				message: "Error",
				description: `Failed to ${selectedLabTest ? "update" : "save"} lab test: ${error.message}`,
			});
		}
	};
	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
	};
	const handleDelete = async (id) => {
		if (!canDeleteLabTest) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to delete lab tests.",
			});
			return;
		}

		try {
			await deleteLabTest(id); // Call the service function
			fetchLabTests(searchTerm); // Refresh the list after deletion
		} catch (error) {}
	};

	const columns = [
		{
			title: "Test Name",
			dataIndex: "testName",
			key: "testName",
			render: (text) => (canReadLabTest ? text : "***"),
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			render: (text) => (canReadLabTest ? text : "***"),
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
			render: (text) =>
				canReadLabTest ? <Tooltip title={text}>{text && text.length > 50 ? `${text.substring(0, 50)}...` : text}</Tooltip> : "***",
		},
		{
			title: "Action",
			key: "action",
			render: (_, record) => (
				<Space size="middle">
					{canReadLabTest && (
						<Button type="default" icon={<EyeOutlined />} onClick={() => showViewModal(record)}>
							View
						</Button>
					)}
					{canUpdateLabTest && (
						<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record)}>
							Edit
						</Button>
					)}
					{/* Improved Delete Button with Confirmation */}
					{canDeleteLabTest && (
						<Popconfirm
							title={
								<div>
									<p>
										<b>Deleting a lab test is generally not recommended.</b>
									</p>
									<p>It can lead to data inconsistencies if results are associated with this test.</p>
									<p>Are you sure you want to proceed?</p>
									<p style={{ color: "red" }}>Note: If this lab test is linked to any lab results, deletion is not possible.</p>
								</div>
							}
							onConfirm={() => handleDelete(record.id)}
							okText="Yes, Delete"
							cancelText="No"
							okButtonProps={{ danger: true }} // Make "Yes" button red
						>
							<Button type="default" danger icon={<DeleteOutlined />}>
								Delete
							</Button>
						</Popconfirm>
					)}
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 20 }}>
			<Title level={2}>Lab Tests</Title>
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12} md={8}>
					<Input
						placeholder="Search by Test Name"
						value={searchTerm}
						onChange={handleSearch}
						style={{ width: "100%" }}
						disabled={!canReadLabTest}
					/>
				</Col>
				<Col xs={24} sm={12} md={8}>
					{canCreateLabTest && (
						<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)} block>
							Add New Lab Test
						</Button>
					)}
				</Col>
			</Row>
			<Table
				columns={columns}
				dataSource={canReadLabTest ? labTests : []}
				loading={loading}
				rowKey="id"
				scroll={{ x: true }}
				pagination={{ pageSize: 10, responsive: true }}
			/>
			{/* Edit/Add Modal */}
			<Modal
				title={selectedLabTest ? "Edit Lab Test" : "Add Lab Test"}
				open={isModalVisible}
				onCancel={handleCancel}
				width="90%"
				style={{ maxWidth: 800 }}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					(selectedLabTest ? canUpdateLabTest : canCreateLabTest) && (
						<Button key="submit" type="primary" onClick={handleFormSubmit}>
							{selectedLabTest ? "Update" : "Save"}
						</Button>
					),
				]}>
				<Form form={form} layout="vertical">
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12}>
							<Form.Item label="Test Name" name="testName" rules={[{ required: true, message: "Please enter the test name" }]}>
								<Input disabled={!(selectedLabTest ? canUpdateLabTest : canCreateLabTest)} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Price" name="price" rules={[{ required: true, message: "Please enter the price" }]}>
								<Input type="number" disabled={!(selectedLabTest ? canUpdateLabTest : canCreateLabTest)} />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item label="Description" name="description" rules={[{ required: true, message: "Please enter the description" }]}>
						<Input.TextArea rows={4} disabled={!(selectedLabTest ? canUpdateLabTest : canCreateLabTest)} />
					</Form.Item>

					<Divider>Define Result Structure</Divider>
					{(selectedLabTest ? canUpdateLabTest : canCreateLabTest) && (
						<>
							{/* Note for Editing */}
							{selectedLabTest && (
								<Alert
									message="Important: When editing the table structure, make sure to click 'Generate JSON' to save your changes."
									type="info"
									showIcon
									style={{ marginBottom: 16 }}
								/>
							)}
							<LabTestTableBuilder onTableChange={handleTableChange} initialTableData={initialTableData} />
						</>
					)}
				</Form>
			</Modal>
			{/*view modal*/}
			<Modal
				title={`View Lab Test: ${selectedLabTest?.testName}`}
				open={isViewModalVisible}
				onCancel={handleViewCancel}
				width="90%"
				style={{ maxWidth: 800 }}
				footer={[
					<Button key="cancel" onClick={handleViewCancel}>
						Cancel
					</Button>,
				]}>
				<Form form={form} layout="vertical">
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12}>
							<Form.Item label="Test Name">
								<Input value={selectedLabTest?.testName} readOnly />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Price">
								<Input value={selectedLabTest?.price} readOnly type="number" />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item label="Description">
						<Input.TextArea value={selectedLabTest?.description} rows={4} readOnly />
					</Form.Item>
					<Divider>Result Structure</Divider>
					{canReadLabTest && viewTableData ? <ViewLabTestTable data={viewTableData} /> : <p>No structure defined for this test.</p>}
					{!canReadLabTest && <p>You do not have permission to view this data.</p>}
				</Form>
			</Modal>
		</div>
	);
};

const ViewLabTestTable = ({ data }) => {
	if (!data || !data.headers || !data.rows) {
		return <p>No table data available</p>;
	}
	const columns = data.headers.map((header) => ({
		title: header,
		dataIndex: header,
		key: header,
		render: (text) => <p>{text}</p>,
	}));

	const dataSource = data.rows.map((row) => {
		const rowObj = {};
		data.headers.forEach((header, index) => {
			rowObj[header] = row[index];
		});
		return rowObj;
	});
	return <Table columns={columns} dataSource={dataSource} bordered />;
};
export default LabTestList;
