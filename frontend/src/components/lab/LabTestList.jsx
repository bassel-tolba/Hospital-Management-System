import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, notification, Divider, Tooltip, Row, Col } from "antd";
import { useAuthStore } from "../../services/auth.service";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { useLabStore } from "../../services/lab.service";
import LabTestTableBuilder from "./LabTestTableBuilder"; // Import the table builder

const { Title } = Typography;

const LabTestList = () => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isViewModalVisible, setIsViewModalVisible] = useState(false);
	const [selectedLabTest, setSelectedLabTest] = useState(null);
	const [form] = Form.useForm();
	const { labTests, loading, error, fetchLabTests, createLabTest } = useLabStore();
	const { hasAuthority } = useAuthStore(); // Use hasAuthority
	const [searchTerm, setSearchTerm] = useState("");
	const [tableData, setTableData] = useState(null); // State for table data
	const [initialTableData, setInitialTableData] = useState(null);
	const [viewTableData, setViewTableData] = useState(null);
	const [viewInitialTableData, setViewInitialTableData] = useState(null);

	// Permission Checks
	const canCreateLabTest = hasAuthority("CREATE_LAB_TEST");
	const canReadLabTest = hasAuthority("READ_LAB_TEST");

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
		if (!canCreateLabTest) {
			// Check permission BEFORE opening modal
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to create lab tests.",
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
			//check permission before viewing data
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
		setTableData(null); //clear the table data
	};

	const handleViewCancel = () => {
		setIsViewModalVisible(false);
		setSelectedLabTest(null);
		form.resetFields();
		setViewTableData(null);
	};
	const handleTableChange = (data) => {
		setTableData(data); // Store table data from builder
	};

	const handleFormSubmit = async () => {
		if (!canCreateLabTest) {
			// Double-check permission before submission
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to create lab tests.",
			});
			return;
		}
		try {
			const values = await form.validateFields();

			const labTestData = { ...values, structureMap: { table: tableData } };

			if (selectedLabTest) {
				//logic to update is not needed yet just create will do for now
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

	const columns = [
		{
			title: "Test Name",
			dataIndex: "testName",
			key: "testName",
			render: (text) => (canReadLabTest ? text : "***"), // Data masking
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			render: (text) => (canReadLabTest ? text : "***"), // Data masking
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
			render: (text) =>
				canReadLabTest ? <Tooltip title={text}>{text && text.length > 50 ? `${text.substring(0, 50)}...` : text}</Tooltip> : "***", // Data masking
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
						<Button type="default" icon={<PlusOutlined />} onClick={() => showModal(null)} block>
							Add New Lab Test
						</Button>
					)}
				</Col>
			</Row>
			<Table
				columns={columns}
				dataSource={canReadLabTest ? labTests : []} // Conditionally display data
				loading={loading}
				rowKey="id"
				scroll={{ x: true }} // Enable horizontal scrolling for small screens
				pagination={{ pageSize: 10, responsive: true }}
			/>
			<Modal
				title={selectedLabTest ? "Edit Lab Test" : "Add Lab Test"}
				open={isModalVisible}
				onCancel={handleCancel}
				width="90%" // Make modal width responsive
				style={{ maxWidth: 800 }} // Set a maximum width for larger screens
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					canCreateLabTest && (
						<Button key="submit" type="default" onClick={handleFormSubmit}>
							{selectedLabTest ? "Update" : "Save"}
						</Button>
					),
				]}>
				<Form form={form} layout="vertical">
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12}>
							<Form.Item label="Test Name" name="testName" rules={[{ required: true, message: "Please enter the test name" }]}>
								<Input disabled={!canCreateLabTest} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Price" name="price" rules={[{ required: true, message: "Please enter the price" }]}>
								<Input type="number" disabled={!canCreateLabTest} />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item label="Description" name="description" rules={[{ required: true, message: "Please enter the description" }]}>
						<Input.TextArea rows={4} disabled={!canCreateLabTest} />
					</Form.Item>

					<Divider>Define Result Structure</Divider>
					{canCreateLabTest && <LabTestTableBuilder onTableChange={handleTableChange} initialTableData={initialTableData} />}
				</Form>
			</Modal>
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
