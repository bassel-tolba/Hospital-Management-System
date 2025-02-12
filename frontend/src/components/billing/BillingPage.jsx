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
import { useAuthStore } from "../../services/auth.service"; // Import useAuthStore
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
	const canDeleteBilling = hasAuthority("DELETE_BILLING"); //though you did not use it here, it's good practice to define all relevant permissions

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
			render: (text) => (canReadBilling ? text : "***"), // Data masking
		},
		{
			title: "Bill Date",
			dataIndex: "billDate",
			key: "billDate",
			render: (text) => (canReadBilling ? new Date(text).toLocaleString() : "***"), // Data masking
		},

		{
			title: "Action",
			key: "action",
			render: (_, record) =>
				canReadBilling ? ( // Conditionally render actions based on read permission
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
		// Check BOTH create and update permissions
		if (!canCreateBilling || !canUpdateBilling) {
			notification.warn({
				message: "Permissions Required",
				description: "You need both CREATE_BILLING and UPDATE_BILLING permissions to add payments.",
			});
			return; // Stop the function if permissions are missing
		}
		try {
			const paymentData = {
				amount: parseFloat(values.amount),
				paymentMethod: values.paymentMethod,
				paymentDate: moment(values.paymentDate).format("YYYY-MM-DDTHH:mm:ss"),
			};

			await createPayment(selectedBill.id, paymentData);
			notification.success({
				message: "Success",
				description: "Payment created successfully!",
			});
			const updatedBilling = await fetchBillingById(selectedBill.id);
			setSelectedBill(updatedBilling);
			updateBilling(selectedBill.id); // Consider whether you *really* need this separate update call
			paymentForm.resetFields();
		} catch (error) {
			console.error("Payment creation failed", error);
			notification.error({
				message: "Error",
				description: `Failed to create payment: ${error.message}`,
			});
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
				{activeBill &&
					canReadBilling && ( // Show active bill only if read permission exists
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
					disabled={!canReadBilling} // Disable if no read permission
					filterOption={false}
					onSelect={handleSearchPatientFilter}
				/>
			</Space>
			<div style={{ margin: "0 -16px" }}>
				<Table
					columns={columns}
					dataSource={canReadBilling ? billings : []} // Show empty data if no read permission
					rowKey={(record) => record.id}
					pagination={false}
					scroll={{ x: "max-content" }}
				/>
			</div>

			{billings &&
				billings.length > 0 &&
				canReadBilling && ( //Conditional rendering of pagination
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
