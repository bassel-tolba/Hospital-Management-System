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
	// DatePicker,  <--  Keep DatePicker
	AutoComplete,
	Space,
	notification,
} from "antd";
import { DatePicker } from "antd"; // Import DatePicker here separately
import { useBillingStore } from "../../services/billing.service";
import { useAuthStore } from "../../services/auth.service";
import { usePatientStore } from "../../services/patient.service";
// import moment from "moment-timezone"; // Remove moment-timezone
import html2pdf from "html2pdf.js";
import { FileTextOutlined } from "@ant-design/icons";

const { Title } = Typography;

const BillingPage = () => {
	// ... (other state and hooks) ...
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
		resetBillings,
	} = useBillingStore();

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedBill, setSelectedBill] = useState(null);
	const [paymentForm] = Form.useForm();

	const { user, hasAuthority } = useAuthStore(); // Use hasAuthority from useAuthStore
	const { patients, searchPatients } = usePatientStore();
	const [patientOptions, setPatientOptions] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [searchParams, setSearchParams] = useState({});

	// Permission checks
	const canCreateBilling = hasAuthority("CREATE_BILLING");
	const canReadBilling = hasAuthority("READ_BILLING");
	const canUpdateBilling = hasAuthority("UPDATE_BILLING");
	const canDeleteBilling = hasAuthority("DELETE_BILLING");

	useEffect(() => {
		if (user && user.token) {
		}
		// eslint-disable-next-line
	}, [user]);

	useEffect(() => {
		resetBillings();
		// eslint-disable-next-line
	}, []);

	const handleBillClick = async (id) => {
		if (!canReadBilling) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to view billings.",
			});
			return;
		}
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
		if (!canReadBilling) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to export billing.",
			});
			return;
		}
		if (!billHtml) {
			notification.error({
				message: "Error",
				description: "No bill content available to export.",
			});
			return;
		}
		const date = new Date();

		try {
			const options = {
				margin: 10,
				filename: `bill_${billId}_${formatDate(date)}.pdf`,
				image: { type: "jpeg", quality: 1 },
				html2canvas: { scale: 3 },
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
			render: (text) => (canReadBilling ? text : "***"),
		},
		{
			title: "Bill Date",
			dataIndex: "billDate",
			key: "billDate",
			render: (text) => (canReadBilling ? new Date(text).toLocaleString() : "***"),
		},

		{
			title: "Action",
			key: "action",
			render: (_, record) =>
				canReadBilling ? (
					<Space size="middle">
						<Button type="link" onClick={() => handleBillClick(record.id)}>
							View Bill
						</Button>
						<Button type="default" icon={<FileTextOutlined />} onClick={() => exportPdf(record.bill, record.id)}>
							Export PDF
						</Button>
					</Space>
				) : null,
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
		if (!canReadBilling) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to view billings.",
			});
			return;
		}
		setSearchParams({ ...searchParams, patientId: patientId });
		setPage(0);
		fetchBillings(0, pageSize, patientId);
		fetchActiveBill(patientId);
	};

	const handlePageChange = (newPage) => {
		setPage(newPage - 1);
		fetchBillings(newPage - 1, pageSize, searchParams.patientId);
	};
	const onFinish = async (values) => {
		if (!canCreateBilling || !canUpdateBilling) {
			notification.warn({ message: "Permissions Required", description: "Need CREATE_BILLING & UPDATE_BILLING." });
			return;
		}

		try {
			// 1. Get the Date object from the DatePicker (it's already a Date object)
			const jsDate = values.paymentDate;

			// 2. Check if a date was selected
			if (!jsDate) {
				notification.error({ message: "Error", description: "Please select a payment date." });
				return;
			}

			console.log("Raw jsDate from DatePicker:", jsDate);

			// 3. Format for the backend (ISO 8601 with timezone offset)
			const paymentDateString = jsDate.toISOString(); // Use toISOString()
			console.log("Formatted Date String (ISO):", paymentDateString);

			// 4. Create paymentData
			const paymentData = {
				amount: parseFloat(values.amount),
				paymentMethod: values.paymentMethod,
				paymentDate: paymentDateString, // Send the ISO string
			};

			// 5. Send to backend
			await createPayment(selectedBill.id, paymentData);
			notification.success({ message: "Success", description: "Payment created!" });
			const updatedBilling = await fetchBillingById(selectedBill.id);
			setSelectedBill(updatedBilling);
			paymentForm.resetFields();
		} catch (error) {
			console.error("Payment creation failed", error);
			notification.error({ message: "Error", description: `Failed: ${error.message}` });
		}
	};

	const formatDate = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const seconds = String(date.getSeconds()).padStart(2, "0");

		return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
	};

	// ... (rest of your component, including the JSX) ...

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
				{activeBill && canReadBilling && (
					<Col xs={24} sm={24} md={12} lg={8} xl={6}>
						<Card title="Active Bill" style={{ width: "100%" }}>
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
								<Button type="link" onClick={() => handleBillClick(activeBill.id)}>
									View Bill
								</Button>
								<Button type="default" icon={<FileTextOutlined />} onClick={() => exportPdf(activeBill.bill, activeBill.id)}>
									Export PDF
								</Button>
							</Space>
						</Card>
					</Col>
				)}
			</Row>
			<Space style={{ marginBottom: 16, display: "block" }}>
				<AutoComplete
					style={{ width: "100%", maxWidth: 400 }}
					options={patientOptions}
					onSearch={handlePatientSearch}
					placeholder="Search for a patient"
					disabled={!canReadBilling}
					filterOption={false}
					onSelect={handleSearchPatientFilter}
				/>
			</Space>
			<div style={{ margin: "0 -16px" }}>
				<Table
					columns={columns}
					dataSource={canReadBilling ? billings : []}
					rowKey={(record) => record.id}
					pagination={false}
					scroll={{ x: "max-content" }}
				/>
			</div>

			{billings && billings.length > 0 && canReadBilling && (
				<Pagination
					current={page + 1}
					pageSize={pageSize}
					total={totalElements}
					onChange={handlePageChange}
					style={{ marginTop: "20px", textAlign: "center" }}
				/>
			)}

			{selectedBill && (
				<Modal
					title={`Bill Details - ID: ${selectedBill.id}`}
					open={isModalVisible}
					onCancel={handleCancel}
					footer={null}
					width="90%"
					bodyStyle={{ overflowX: "auto" }}>
					<div dangerouslySetInnerHTML={{ __html: selectedBill.bill }} />

					<Title level={4} style={{ marginTop: 20 }}>
						Add Payment
					</Title>
					{(!canCreateBilling || !canUpdateBilling) && (
						<Alert
							message="Permissions Required"
							description="You need both CREATE_BILLING and UPDATE_BILLING permissions to add payments."
							type="warning"
							showIcon
							style={{ marginBottom: 16 }}
						/>
					)}
					<Form form={paymentForm} layout="vertical" onFinish={onFinish}>
						<Row gutter={24}>
							<Col xs={24} sm={12} md={8}>
								<Form.Item name="amount" label="Amount" rules={[{ required: true, message: "Please enter payment amount!" }]}>
									<Input type="number" placeholder="Enter amount" disabled={!canCreateBilling || !canUpdateBilling} />
								</Form.Item>
							</Col>
							<Col xs={24} sm={12} md={8}>
								<Form.Item
									name="paymentMethod"
									label="Payment Method"
									rules={[{ required: true, message: "Please select payment method" }]}>
									<Input type="text" placeholder="Enter payment method" disabled={!canCreateBilling || !canUpdateBilling} />
								</Form.Item>
							</Col>
							<Col xs={24} sm={12} md={8}>
								<Form.Item
									name="paymentDate"
									label="Payment Date"
									rules={[{ required: true, message: "Please select payment date" }]}>
									<DatePicker
										style={{ width: "100%" }}
										showTime
										format="YYYY-MM-DD HH:mm:ss"
										disabled={!canCreateBilling || !canUpdateBilling}
									/>
								</Form.Item>
							</Col>
						</Row>
						<Form.Item>
							<Button type="default" htmlType="submit" disabled={!canCreateBilling || !canUpdateBilling}>
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
