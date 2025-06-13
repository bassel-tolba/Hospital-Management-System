import React, { useState, useEffect, useRef } from "react";
import {
	Table,
	Input,
	Button,
	Space,
	Typography,
	Modal,
	Form,
	Select,
	InputNumber,
	Row,
	Col,
	Alert,
	Divider,
	Steps,
	DatePicker,
	Tooltip,
} from "antd";
import {
	SearchOutlined,
	EditOutlined,
	DeleteOutlined,
	PlusOutlined,
	HistoryOutlined,
	UnorderedListOutlined,
	EditTwoTone,
	DeleteTwoTone,
	InfoCircleOutlined,
	LockOutlined,
	PrinterOutlined,
	QuestionCircleOutlined, // A better icon for a help button
} from "@ant-design/icons";
import MedicationHistory from "./MedicationHistory";
import AllMedicationHistory from "./AllMedicationHistory";
import { useMedicationStore } from "../../services/medication.service";
import { useAuthStore } from "../../services/auth.service";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { RangePicker } = DatePicker;

const MedicationList = () => {
	const { user, hasAuthority } = useAuthStore();

	const {
		medications,
		loading,
		total,
		searchMedications,
		createMedication,
		updateMedication,
		setLoading,
		addBatch,
		updateBatch,
		deleteBatch,
		getBatchesForMedication,
	} = useMedicationStore();

	const [medicationBatches, setMedicationBatches] = useState([]);
	const [medicationBatchesLoading, setMedicationBatchesLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isStockModalVisible, setIsStockModalVisible] = useState(false);
	const [selectedMedication, setSelectedMedication] = useState(null);
	const [selectedBatch, setSelectedBatch] = useState(null);
	const [stockChangeQuantity, setStockChangeQuantity] = useState(0);
	const [purchasePrice, setPurchasePrice] = useState(0);
	const [form] = Form.useForm();
	const [batchForm] = Form.useForm();
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const [pricingUnit, setPricingUnit] = useState("PER_MG");
	const [price, setPrice] = useState(0);
	const [amountPerUnit, setAmountPerUnit] = useState(1);
	const [message, setMessage] = useState("");
	const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
	const [isAllHistoryVisible, setIsAllHistoryVisible] = useState(false);
	const [isBatchModalVisible, setIsBatchModalVisible] = useState(false);
	const [isEditBatchModalVisible, setIsEditBatchModalVisible] = useState(false);
	const [isHelpModalVisible, setIsHelpModalVisible] = useState(false); // State for the new help modal

	// State for batch filtering
	const [batchStartDate, setBatchStartDate] = useState(null);
	const [batchEndDate, setBatchEndDate] = useState(null);
	const printableBatchContentRef = useRef(null);

	// Derived permission flags for cleaner JSX
	const canReadMedication = user && hasAuthority("READ_MEDICATION");
	const canCreateMedication = user && hasAuthority("CREATE_MEDICATION");
	const canUpdateMedication = user && hasAuthority("UPDATE_MEDICATION");
	const canDeleteMedication = user && hasAuthority("DELETE_MEDICATION");
	const canUpdateStock = user && hasAuthority("UPDATE_MEDICATION_STOCK");
	const canReadHistory = user && hasAuthority("READ_MEDICATION_HISTORY");
	const canDeleteBatchPerm = user && (hasAuthority("UPDATE_MEDICATION_STOCK") || hasAuthority("DELETE_MEDICATION"));

	useEffect(() => {
		if (canReadMedication) {
			fetchMedications();
		} else {
			setLoading(false);
		}
	}, [page, size, searchParams, canReadMedication]);

	useEffect(() => {
		const fetchBatches = async () => {
			if (isBatchModalVisible && selectedMedication && canReadMedication) {
				setMedicationBatchesLoading(true);
				try {
					const batches = await getBatchesForMedication(selectedMedication.id, {
						startDate: batchStartDate,
						endDate: batchEndDate,
					});
					const mappedBatches = batches.map((batch) => ({ ...batch, key: batch.id }));
					setMedicationBatches(mappedBatches);
				} catch (error) {
					console.error("Error fetching batches:", error);
				} finally {
					setMedicationBatchesLoading(false);
				}
			}
		};
		fetchBatches();
	}, [isBatchModalVisible, selectedMedication, batchStartDate, batchEndDate, getBatchesForMedication, canReadMedication]);

	const fetchMedications = async () => {
		setLoading(true);
		await searchMedications({ ...searchParams, page, size });
		setLoading(false);
	};

	const showModal = (medication) => {
		if ((medication && !canUpdateMedication) || (!medication && !canCreateMedication)) return;
		setSelectedMedication(medication);
		if (medication) {
			form.setFieldsValue(medication);
			setPricingUnit(medication.pricingUnit);
			setPrice(medication.price);
			setAmountPerUnit(medication.amountPerUnit);
		} else {
			form.resetFields();
			setPricingUnit("PER_MG");
			setPrice(0);
			setAmountPerUnit(1);
		}
		setIsModalVisible(true);
	};

	const showStockModal = (medication) => {
		if (!canUpdateStock) return;
		setSelectedMedication(medication);
		setStockChangeQuantity(0);
		setPurchasePrice(0);
		setIsStockModalVisible(true);
	};

	const showBatchesModal = (medication) => {
		if (!canReadMedication) return;
		setSelectedMedication(medication);
		setIsBatchModalVisible(true);
	};

	const handleBatchesModalClose = () => {
		setIsBatchModalVisible(false);
		setSelectedMedication(null);
		setMedicationBatches([]);
		setSelectedBatch(null);
		setBatchStartDate(null);
		setBatchEndDate(null);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedMedication(null);
		form.resetFields();
		setMessage("");
	};

	const handleStockModalCancel = () => {
		setIsStockModalVisible(false);
		setSelectedMedication(null);
		setStockChangeQuantity(0);
		setPurchasePrice(0);
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			if (selectedMedication) {
				if (!canUpdateMedication) throw new Error("Permission denied");
				await updateMedication(selectedMedication.id, values);
			} else {
				if (!canCreateMedication) throw new Error("Permission denied");
				await createMedication(values);
			}
			fetchMedications();
			setIsModalVisible(false);
			setSelectedMedication(null);
			form.resetFields();
			setMessage("");
		} catch (error) {
			console.log("Error submitting form:", error);
		}
	};

	const handleStockChangeSubmit = async () => {
		try {
			if (!canUpdateStock) throw new Error("Permission denied");
			const batchData = { quantity: stockChangeQuantity, purchasePrice: purchasePrice };
			await addBatch(selectedMedication.id, batchData);
			fetchMedications();
			setIsStockModalVisible(false);
			setSelectedMedication(null);
			setStockChangeQuantity(0);
			setPurchasePrice(0);
		} catch (error) {
			console.error("Error adding batch:", error);
		}
	};

	const handleDelete = (medicationId) => {
		if (!canDeleteMedication) {
			Modal.error({ title: "Permission Denied", content: "You do not have permission to delete medications." });
			return;
		}
		Modal.warning({
			title: "Deletion Not Allowed",
			content: (
				<div>
					<p>
						Medications cannot be permanently deleted once they are created to maintain data integrity with patient records and
						prescriptions.
					</p>
					<p>
						<b>What to do instead:</b> Use the "Edit" button to correct details or simply discontinue its use. For critical removal,
						contact an administrator.
					</p>
				</div>
			),
			okText: "OK",
		});
	};

	const handleSearch = (value) => {
		if (!canReadMedication) return;
		setSearchParams({ ...searchParams, searchTerm: value });
		setPage(0);
	};

	const handleTableChange = (pagination) => {
		if (!canReadMedication) return;
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	const updateMessage = () => {
		const name = form.getFieldValue("name") || "[Name]";
		const dosage = form.getFieldValue("dosage") || "[Dosage]";
		const unit = pricingUnit;
		const numberOfUnits = amountPerUnit || 0;
		const unitPrice = price || 0;
		const totalPrice = (unitPrice * numberOfUnits).toFixed(2);
		setMessage(
			`A medication named '${name}' with dosage '${dosage}' will have a total selling price of £${totalPrice} ( ${numberOfUnits} ${unit.toLowerCase()} x £${unitPrice} per ${unit.toLowerCase()} ).`,
		);
	};

	const showHistoryModal = (medication) => {
		if (!canReadHistory) return;
		setSelectedMedication(medication);
		setIsHistoryModalVisible(true);
	};

	const handleHistoryModalClose = () => {
		setIsHistoryModalVisible(false);
		setSelectedMedication(null);
	};

	const showAllHistory = () => {
		if (!canReadHistory) return;
		setIsAllHistoryVisible(true);
	};

	const handleAllHistoryClose = () => {
		setIsAllHistoryVisible(false);
	};

	const handleEditBatch = (batch) => {
		if (!canUpdateStock) return;
		setSelectedBatch(batch);
		batchForm.setFieldsValue({ purchasePrice: batch.purchasePrice });
		setIsEditBatchModalVisible(true);
	};

	const handleDeleteBatch = async (batchId) => {
		if (!canDeleteBatchPerm) {
			Modal.error({ title: "Permission Denied", content: "You do not have permission to delete medication batches." });
			return;
		}
		Modal.confirm({
			title: "Confirm Delete",
			content: "Are you sure you want to delete this batch? This action cannot be undone.",
			okText: "Delete",
			okType: "danger",
			onOk: async () => {
				try {
					await deleteBatch(batchId);
					if (selectedMedication && canReadMedication) {
						const batches = await getBatchesForMedication(selectedMedication.id, { startDate: batchStartDate, endDate: batchEndDate });
						setMedicationBatches(batches.map((b) => ({ ...b, key: b.id })));
					}
				} catch (error) {
					console.error("Error deleting batch:", error);
				}
			},
		});
	};

	const handleUpdateBatch = async () => {
		try {
			if (!canUpdateStock) throw new Error("Permission denied");
			const values = await batchForm.validateFields();
			await updateBatch(selectedBatch.id, { purchasePrice: values.purchasePrice });
			if (selectedMedication && canReadMedication) {
				const batches = await getBatchesForMedication(selectedMedication.id, { startDate: batchStartDate, endDate: batchEndDate });
				setMedicationBatches(batches.map((b) => ({ ...b, key: b.id })));
			}
			setIsEditBatchModalVisible(false);
			setSelectedBatch(null);
			batchForm.resetFields();
		} catch (error) {
			console.error("Error updating batch:", error);
		}
	};

	const handleBatchDateChange = (dates) => {
		if (dates && dates.length === 2) {
			setBatchStartDate(dates[0].format("YYYY-MM-DD HH:mm:ss"));
			setBatchEndDate(dates[1].format("YYYY-MM-DD HH:mm:ss"));
		} else {
			setBatchStartDate(null);
			setBatchEndDate(null);
		}
	};

	const handlePrintBatches = () => {
		if (printableBatchContentRef.current) {
			const printWindow = window.open("", "", "height=800,width=1000");
			printWindow.document.write("<html><head><title>Medication Batches Report</title>");
			printWindow.document.write(
				`<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif;margin:20px}h1{text-align:center;margin-bottom:20px;color:#1890ff}h2{font-size:16px;color:#333}table{width:100%;border-collapse:collapse}th,td{border:1px solid #f0f0f0;padding:8px 12px;text-align:left}th{background-color:#fafafa;font-weight:500}.no-print{display:none!important}.report-footer{text-align:right;margin-top:20px;font-size:12px;color:#888}</style>`,
			);
			printWindow.document.write("</head><body>");
			printWindow.document.write(`<h1>Batches Report for ${selectedMedication?.name}</h1>`);
			if (batchStartDate && batchEndDate) {
				printWindow.document.write(`<h2>Date Range: ${moment(batchStartDate).format("lll")} to ${moment(batchEndDate).format("lll")}</h2>`);
			}
			printWindow.document.write(printableBatchContentRef.current.innerHTML);
			printWindow.document.write(`<div class="report-footer">Report generated on: ${moment().format("YYYY-MM-DD HH:mm:ss")}</div>`);
			printWindow.document.write("</body></html>");
			printWindow.document.close();
			printWindow.focus();
			printWindow.print();
		}
	};

	const columns = [
		{ title: "Name", dataIndex: "name", key: "name" },
		{ title: "Dosage", dataIndex: "dosage", key: "dosage" },
		{
			title: "Price",
			key: "price",
			render: (text, record) => (
				<Text strong style={{ color: "#1890ff" }}>
					£{(record.price * record.amountPerUnit).toFixed(2)}
				</Text>
			),
		},
		{ title: "Stock", key: "stock", dataIndex: "stock" },
		{
			title: "Batches",
			key: "batches",
			render: (text, record) =>
				canReadMedication ? (
					<Tooltip title="View Batches">
						<Button icon={<UnorderedListOutlined />} onClick={() => showBatchesModal(record)} />
					</Tooltip>
				) : (
					<Text disabled>N/A</Text>
				),
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{canUpdateMedication && (
						<Tooltip title="Edit">
							<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)} />
						</Tooltip>
					)}
					{canUpdateStock && (
						<Tooltip title="Add Batch">
							<Button type="default" icon={<PlusOutlined />} onClick={() => showStockModal(record)} />
						</Tooltip>
					)}
					{canReadHistory && (
						<Tooltip title="History">
							<Button type="default" icon={<HistoryOutlined />} onClick={() => showHistoryModal(record)} />
						</Tooltip>
					)}
					{canDeleteMedication && (
						<Tooltip title="Delete">
							<Button type="dashed" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
						</Tooltip>
					)}
					{!canUpdateMedication && !canUpdateStock && !canReadHistory && !canDeleteMedication && <Text disabled>No Actions</Text>}
				</Space>
			),
		},
	];

	const batchColumns = [
		{
			title: "Purchase Date",
			dataIndex: "purchaseDate",
			key: "purchaseDate",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
		},
		{ title: "Purchase Price", dataIndex: "purchasePrice", key: "purchasePrice", render: (text) => `£${text.toFixed(2)}` },
		{ title: "Initial Qty", dataIndex: "quantity", key: "quantity" },
		{ title: "Remaining Qty", dataIndex: "remainingQuantity", key: "remainingQuantity" },
		{
			title: "Actions",
			key: "actions",
			className: "no-print",
			render: (text, record) => (
				<Space size="middle">
					{canUpdateStock && (
						<Tooltip title="Edit Batch">
							<Button type="primary" icon={<EditTwoTone />} onClick={() => handleEditBatch(record)} size="small" />
						</Tooltip>
					)}
					{canDeleteBatchPerm && (
						<Tooltip title="Delete Batch">
							<Button type="primary" icon={<DeleteTwoTone />} onClick={() => handleDeleteBatch(record.id)} size="small" danger />
						</Tooltip>
					)}
					{!canUpdateStock && !canDeleteBatchPerm && <Text disabled>N/A</Text>}
				</Space>
			),
		},
	];

	if (!canReadMedication && !loading) {
		return (
			<div style={{ padding: 20, textAlign: "center" }}>
				<Alert
					message="Access Denied"
					description="You do not have permission to view medications."
					type="error"
					showIcon
					icon={<LockOutlined />}
				/>
			</div>
		);
	}

	return (
		<div className="main-container" style={{ padding: 20 }}>
			<Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
				<Col>
					<Title level={2}>Medication Management</Title>
				</Col>
				<Col>
					<Button type="default" icon={<QuestionCircleOutlined />} onClick={() => setIsHelpModalVisible(true)}>
						Help
					</Button>
				</Col>
			</Row>
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={18}>
					<Input.Search placeholder="Search by name..." onSearch={handleSearch} style={{ width: "100%" }} allowClear />
				</Col>
				<Col xs={24} sm={6}>
					{canCreateMedication && (
						<Button type="primary" block icon={<PlusOutlined />} onClick={() => showModal(null)}>
							New Medication
						</Button>
					)}
				</Col>
			</Row>
			<Row justify="end" style={{ marginBottom: 16 }}>
				{canReadHistory && (
					<Button type="default" icon={<UnorderedListOutlined />} onClick={showAllHistory}>
						View All History
					</Button>
				)}
			</Row>

			<div style={{ overflowX: "auto" }}>
				<Table
					columns={columns}
					dataSource={medications}
					loading={loading}
					rowKey="id"
					onChange={handleTableChange}
					pagination={{ current: page + 1, pageSize: size, total, showSizeChanger: true, pageSizeOptions: ["10", "20", "50", "100"] }}
				/>
			</div>

			<Modal
				title={selectedMedication ? "Edit Medication" : "Add New Medication"}
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button
						key="submit"
						type="primary"
						onClick={handleFormSubmit}
						disabled={!user || (selectedMedication ? !canUpdateMedication : !canCreateMedication)}>
						{selectedMedication ? "Update" : "Save"}
					</Button>,
				]}
				width="70%">
				<Form form={form} layout="vertical" onValuesChange={updateMessage}>
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Name" name="name" rules={[{ required: true }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Dosage" name="dosage" rules={[{ required: true }]}>
								<Input placeholder="e.g., 500mg, 10ml" />
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col xs={24} sm={8}>
							<Form.Item label="Pricing Unit" name="pricingUnit" rules={[{ required: true }]} initialValue="PER_MG">
								<Select onChange={(value) => setPricingUnit(value)}>
									<Option value="PER_MG">PER_MG</Option>
									<Option value="PER_ML">PER_ML</Option>
									<Option value="PER_TABLET">PER_TABLET</Option>
									<Option value="PER_CAPSULE">PER_CAPSULE</Option>
									<Option value="PER_DOSE">PER_DOSE</Option>
									<Option value="PER_VIAL">PER_VIAL</Option>
									<Option value="PER_UNIT">PER_UNIT</Option>
									<Option value="PER_PEN">PER_PEN</Option>
									<Option value="PER_GRAM">PER_GRAM</Option>
									<Option value="PER_PATCH">PER_PATCH</Option>
									<Option value="PER_INHALER">PER_INHALER</Option>
									<Option value="PER_BOX">PER_BOX</Option>
									<Option value="PER_PACK">PER_PACK</Option>
								</Select>
							</Form.Item>
						</Col>
						<Col xs={24} sm={8}>
							<Form.Item label={`Price per ${pricingUnit.toLowerCase()}`} name="price" rules={[{ required: true }]}>
								<InputNumber min={0} step={0.01} onChange={(val) => setPrice(val)} style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={8}>
							<Form.Item label={`Amount of ${pricingUnit.toLowerCase()}s`} name="amountPerUnit" rules={[{ required: true }]}>
								<InputNumber min={1} onChange={(val) => setAmountPerUnit(val)} style={{ width: "100%" }} />
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col span={24}>
							<Form.Item label="Image URL" name="imageURL">
								<Input placeholder="https://example.com/image.png" />
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col span={24}>
							<Alert message={message} type="info" showIcon />
						</Col>
					</Row>
				</Form>
			</Modal>

			<Modal
				title={`Add Batch to ${selectedMedication?.name}`}
				visible={isStockModalVisible}
				onCancel={handleStockModalCancel}
				footer={[
					<Button key="cancel" onClick={handleStockModalCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleStockChangeSubmit} disabled={!canUpdateStock}>
						Add Batch
					</Button>,
				]}>
				<Form layout="vertical">
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Quantity" rules={[{ required: true }]}>
								<InputNumber value={stockChangeQuantity} onChange={setStockChangeQuantity} min={1} style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Purchase Price (per unit)" rules={[{ required: true }]}>
								<InputNumber value={purchasePrice} onChange={setPurchasePrice} min={0} step={0.01} style={{ width: "100%" }} />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>

			<Modal
				title={`Batches for ${selectedMedication?.name}`}
				visible={isBatchModalVisible}
				onCancel={handleBatchesModalClose}
				footer={null}
				width="80%">
				<Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
					<Col>
						<RangePicker showTime format="YYYY-MM-DD HH:mm:ss" onChange={handleBatchDateChange} />
					</Col>
					<Col>
						<Button type="default" icon={<PrinterOutlined />} onClick={handlePrintBatches}>
							Print Report
						</Button>
					</Col>
				</Row>
				<div ref={printableBatchContentRef}>
					<Table columns={batchColumns} dataSource={medicationBatches} loading={medicationBatchesLoading} rowKey="id" pagination={false} />
				</div>
			</Modal>

			<Modal
				title="Edit Batch"
				visible={isEditBatchModalVisible}
				onCancel={() => {
					setIsEditBatchModalVisible(false);
					setSelectedBatch(null);
					batchForm.resetFields();
				}}
				onOk={handleUpdateBatch}
				okButtonProps={{ disabled: !canUpdateStock }}
				okText="Update"
				cancelText="Cancel">
				<Form form={batchForm} layout="vertical">
					<Form.Item label="Purchase Price" name="purchasePrice" rules={[{ required: true }]}>
						<InputNumber min={0} step={0.01} style={{ width: "100%" }} />
					</Form.Item>
				</Form>
			</Modal>

			<MedicationHistory
				medicationId={selectedMedication?.id}
				medicationName={selectedMedication?.name}
				visible={isHistoryModalVisible}
				onClose={handleHistoryModalClose}
			/>
			<AllMedicationHistory visible={isAllHistoryVisible} onClose={handleAllHistoryClose} />

			<Modal
				title={
					<>
						<InfoCircleOutlined style={{ marginRight: 8, color: "#1890ff" }} /> Medication Guide
					</>
				}
				visible={isHelpModalVisible}
				onCancel={() => setIsHelpModalVisible(false)}
				footer={null}
				width="60%">
				<Steps direction="vertical" current={-1} style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "20px" }}>
					<Step
						title="Adding a New Medication"
						description={
							<div>
								<p>
									Click "New Medication" to open a form for entering the medication's details. Each field is critical for correct
									pricing and tracking.
								</p>
								<Divider />
								<Title level={5}>Fields Explained:</Title>
								<ul>
									<li>
										<b>Name & Dosage:</b> The medication's brand/generic name and its strength (e.g., "Amoxicillin", "500mg").{" "}
										<Text strong>Important:</Text> Create a separate medication entry for each different dosage (e.g., Amoxicillin
										250mg, Amoxicillin 500mg).
									</li>
									<li>
										<b>Pricing Unit:</b> How the medication is sold (e.g., PER_TABLET, PER_BOX). This is crucial for calculating
										the selling price.
									</li>
									<li>
										<b>Price per Unit:</b> The price for <Text strong>one</Text> of the selected pricing units.
									</li>
									<li>
										<b>Amount of Units:</b> How many of the pricing units are in this specific medication package. For example, a
										box (PER_BOX) might contain 30 tablets.
									</li>
									<li>
										<b>Image URL:</b> An optional link to an image of the medication.
									</li>
								</ul>
								<Alert
									message="The system automatically calculates the total selling price by multiplying the 'Price per Unit' by the 'Amount of Units'."
									type="info"
									showIcon
								/>
							</div>
						}
					/>
					<Step
						title="Editing a Medication"
						description={
							<p>
								Click the "Edit" button (<EditOutlined />) on any medication row to modify its details. You can change any aspect of
								the medication, including its name, dosage, and pricing structure.
							</p>
						}
					/>
					<Step
						title="Adding a Batch (Inventory)"
						description={
							<div>
								<p>
									Batches track your inventory and purchase costs. Click "Add Batch" (<PlusOutlined />) on a medication to record a
									new shipment.
								</p>
								<ol>
									<li>
										<b>Quantity:</b> The number of sellable units (e.g., tablets, boxes) you received.
									</li>
									<li>
										<b>Purchase Price (per unit):</b> The cost you paid for <Text strong>one</Text> unit in this batch. This is
										for your internal records and differs from the selling price.
									</li>
								</ol>
								<Alert
									message="Total stock is automatically calculated from all available batches. The system uses a First-In, First-Out (FIFO) method for dispensing."
									type="warning"
									showIcon
								/>
							</div>
						}
					/>
					<Step
						title="Viewing Batches"
						description={
							<div>
								<p>
									Click "View Batches" to see a detailed list of all inventory batches for a medication. This view shows purchase
									dates, costs, and remaining quantities.
								</p>
								<Divider />
								<Title level={5}>Filtering and Printing</Title>
								<ul>
									<li>
										<b>Filter by Date:</b> Use the date range picker at the top of the window to show only batches purchased
										within a specific timeframe.
									</li>
									<li>
										<b>Print Report:</b> Click the "Print Report" button (<PrinterOutlined />) to generate a clean, printable
										summary of the batches currently displayed. This report will respect any date filters you have applied.
									</li>
								</ul>
							</div>
						}
					/>
					<Step
						title="Editing & Deleting Batches"
						description={
							<div>
								<p>Within the "View Batches" window, you can manage individual batches:</p>
								<ul>
									<li>
										<b>
											Edit (<EditTwoTone />
											):
										</b>{" "}
										Allows you to correct the purchase price of a batch.
									</li>
									<li>
										<b>
											Delete (<DeleteTwoTone />
											):
										</b>{" "}
										Permanently removes a batch record.{" "}
										<Text strong>This is only possible if no units from the batch have been dispensed.</Text>
									</li>
								</ul>
							</div>
						}
					/>
					<Step
						title="Medication History"
						description={
							<p>
								Click "History" (<HistoryOutlined />) to see a log of all changes for a single medication. Use the "View All History"
								button at the top for a comprehensive log across all medications.
							</p>
						}
					/>
					<Step
						title="Deleting Medications"
						description={
							<Alert
								message="Medications generally cannot be deleted to ensure data integrity with patient records and prescriptions. Instead, 'Edit' the medication if its details are wrong, or simply stop adding new batches if it is no longer in use."
								type="error"
								showIcon
							/>
						}
					/>
				</Steps>
			</Modal>
		</div>
	);
};

export default MedicationList;
