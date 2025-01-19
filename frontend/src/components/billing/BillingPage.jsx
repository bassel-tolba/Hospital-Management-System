import React, { useEffect, useState } from "react";
import {
	Table,
	Spin,
	Alert,
	Typography,
	Pagination,
	Card,
	Col,
	Row,
	Modal,
	Form,
	Input,
	Button,
	DatePicker,
	AutoComplete,
	Space,
	notification,
} from "antd";
import { useBillingStore } from "../../services/billing.service";
import { useAuthStore } from "../../services/auth.service";
import { usePatientStore } from "../../services/patient.service";
import moment from "moment";
import html2pdf from "html2pdf.js";
import { FileTextOutlined } from "@ant-design/icons";

const { Title } = Typography;

const BillingPage = () => {
	const {
		billings,
		activeBill,
		loading,
		error,
		fetchBillings,
		fetchActiveBill,
		page,
		pageSize,
		totalElements,
		setPage,
		fetchBillingById,
		clearError,
		createPayment,
		updateBilling,
		resetBillings, // Add the resetBillings function
	} = useBillingStore();

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedBill, setSelectedBill] = useState(null);
	const [paymentForm] = Form.useForm();

	const user = useAuthStore((state) => state.user);
	const { patients, searchPatients } = usePatientStore();
	const [patientOptions, setPatientOptions] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [searchParams, setSearchParams] = useState({});

	useEffect(() => {
		if (user && user.token) {
		}
		// eslint-disable-next-line
	}, [user]);

	// Clear billings when component mounts
	useEffect(() => {
		resetBillings();
		// eslint-disable-next-line
	}, []);

	const handleBillClick = async (id) => {
		const billingData = await fetchBillingById(id);
		if (billingData) {
			setSelectedBill(billingData);
			setIsModalVisible(true);
		}
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedBill(null);
		paymentForm.resetFields();
	};

	const exportPdf = async (billHtml, billId) => {
		if (!billHtml) {
			notification.error({
				message: "Error",
				description: "No bill content available to export.",
			});
			return;
		}

		try {
			const options = {
				margin: 10,
				filename: `bill_${billId}_${moment().format("YYYY-MM-DD_HH-mm-ss")}.pdf`,
				image: { type: "jpeg", quality: 0.98 },
				html2canvas: { scale: 2 },
				jsPDF: { unit: "mm", format: "a4", orientation: "p" },
			};

			await html2pdf().from(billHtml).set(options).save();

			notification.success({
				message: "Success",
				description: "PDF exported successfully!",
			});
		} catch (error) {
			console.error("Error generating PDF:", error);
			notification.error({
				message: "Error",
				description: `Failed to generate PDF: ${error.message}`,
			});
		}
	};

	const columns = [
		{
			title: "Bill ID",
			dataIndex: "id",
			key: "id",
		},
		{
			title: "Bill Date",
			dataIndex: "billDate",
			key: "billDate",
			render: (text) => new Date(text).toLocaleString(),
		},
		{
			title: "Total Amount",
			dataIndex: "totalAmount",
			key: "totalAmount",
			render: (text) => `$${text.toFixed(2)}`,
		},
		{
			title: "Action",
			key: "action",
			render: (_, record) => (
				<Space size="middle">
					<span style={{ cursor: "pointer", color: "blue" }} onClick={() => handleBillClick(record.id)}>
						View Bill
					</span>
					<Button
						type="default"
						icon={<FileTextOutlined />}
						onClick={() => exportPdf(record.bill, record.id)} // Corrected
					>
						Export PDF
					</Button>
				</Space>
			),
		},
	];
	const handlePatientSearch = async (value) => {
		setPatientSearchTerm(value);
		if (value) {
			try {
				const searchResults = await searchPatients({ searchTerm: value, page: 0, size: 10 });
				setPatientOptions(
					searchResults?.content?.map((patient) => ({
						label: `${patient.firstName} ${patient.lastName}`,
						value: patient.id,
					})) || []
				);
			} catch (error) {
				console.error("Failed to search patients:", error);
				setPatientOptions([]);
			}
		} else {
			setPatientOptions([]);
		}
	};

	const handleSearchPatientFilter = (patientId) => {
		setSearchParams({ ...searchParams, patientId: patientId });
		setPage(0);
		fetchBillings(0, pageSize, patientId);
		fetchActiveBill(patientId);
	};

	const handlePageChange = (newPage) => {
		setPage(newPage - 1); // Adjust for zero based page.
		fetchBillings(newPage - 1, pageSize, searchParams.patientId);
	};

	const onFinish = async (values) => {
		try {
			const paymentData = {
				amount: parseFloat(values.amount),
				paymentMethod: values.paymentMethod,
				paymentDate: moment(values.paymentDate).format("YYYY-MM-DDTHH:mm:ss"),
			};

			await createPayment(selectedBill.id, paymentData);
			const updatedBilling = await fetchBillingById(selectedBill.id);
			setSelectedBill(updatedBilling);
			updateBilling(selectedBill.id);
			paymentForm.resetFields();
		} catch (error) {
			console.error("Payment creation failed", error);
		}
	};

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: "20px" }}>
				<Spin size="large" />
			</div>
		);
	}

	if (error) {
		return <Alert message="Error Fetching Billings" description={error} type="error" closable onClose={clearError} />;
	}

	return (
		<div style={{ padding: "20px" }}>
			<Row justify="space-between" align="middle" style={{ marginBottom: "20px" }}>
				<Col>
					<Title level={2}>Billing Page</Title>
				</Col>
				{activeBill && (
					<Col>
						<Card title="Active Bill" style={{ width: 400 }}>
							<p>
								<strong>Bill ID:</strong> {activeBill.id}
							</p>
							<p>
								<strong>Bill Date:</strong> {new Date(activeBill.billDate).toLocaleString()}
							</p>
							<p>
								<strong>Total Amount:</strong> ${activeBill.totalAmount.toFixed(2)}
							</p>
							<Space size="middle">
								<span style={{ cursor: "pointer", color: "blue", marginTop: "10px" }} onClick={() => handleBillClick(activeBill.id)}>
									View Bill
								</span>
								<Button type="default" icon={<FileTextOutlined />} onClick={() => exportPdf(activeBill.bill, activeBill.id)}>
									Export PDF
								</Button>
							</Space>
						</Card>
					</Col>
				)}
			</Row>
			<Space style={{ marginBottom: 16 }}>
				<AutoComplete
					style={{ width: 300 }}
					options={patientOptions}
					onSearch={handlePatientSearch}
					placeholder="Search for a patient"
					filterOption={false}
					onSelect={handleSearchPatientFilter}
				/>
			</Space>

			<Table columns={columns} dataSource={billings} rowKey={(record) => record.id} pagination={false} />

			{billings && billings.length > 0 && (
				<Pagination
					current={page + 1}
					pageSize={pageSize}
					total={totalElements}
					onChange={handlePageChange}
					style={{ marginTop: "20px", textAlign: "center" }}
				/>
			)}

			{selectedBill && (
				<Modal title={`Bill Details - ID: ${selectedBill.id}`} open={isModalVisible} onCancel={handleCancel} footer={null} width={900}>
					<div dangerouslySetInnerHTML={{ __html: selectedBill.bill }} />

					<Title level={4} style={{ marginTop: 20 }}>
						Add Payment
					</Title>

					<Form form={paymentForm} layout="vertical" onFinish={onFinish}>
						<Row gutter={16}>
							<Col span={12}>
								<Form.Item name="amount" label="Amount" rules={[{ required: true, message: "Please enter payment amount!" }]}>
									<Input type="number" placeholder="Enter amount" />
								</Form.Item>
							</Col>

							<Col span={12}>
								<Form.Item
									name="paymentMethod"
									label="Payment Method"
									rules={[{ required: true, message: "Please select payment method" }]}>
									<Input type="text" placeholder="Enter payment method" />
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									name="paymentDate"
									label="Payment Date"
									rules={[{ required: true, message: "Please select payment date" }]}>
									<DatePicker style={{ width: "100%" }} showTime format="YYYY-MM-DD HH:mm:ss" />
								</Form.Item>
							</Col>
						</Row>
						<Form.Item>
							<Button type="primary" htmlType="submit">
								Add Payment
							</Button>
						</Form.Item>
					</Form>
					<Button
						type="default"
						icon={<FileTextOutlined />}
						style={{ marginTop: "15px" }}
						onClick={() => exportPdf(selectedBill.bill, selectedBill.id)}>
						Export PDF
					</Button>
				</Modal>
			)}
		</div>
	);
};

export default BillingPage;
