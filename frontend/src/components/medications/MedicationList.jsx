import React, { useState, useEffect } from "react";
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
	Tooltip,
	Steps,
	Menu,
	Popover,
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
	LockOutlined, // Import LockOutlined for access denied
} from "@ant-design/icons";
import MedicationHistory from "./MedicationHistory";
import AllMedicationHistory from "./AllMedicationHistory";
import { useMedicationStore } from "../../services/medication.service";
import { useAuthStore } from "../../services/auth.service"; // <-- Added Auth Store import

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

const MedicationList = () => {
	const { user, hasAuthority } = useAuthStore(); // <-- Get user and hasAuthority

	const {
		medications,
		loading,
		total,
		searchMedications,
		// deleteMedication, // Not directly used by the delete button logic currently
		createMedication,
		updateMedication,
		setLoading,
		addBatch,
		updateBatch,
		deleteBatch,
		getBatchesForMedication,
	} = useMedicationStore();
	const [medicationBatches, setMedicationBatches] = useState([]);
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
	// const [isInfoModalVisible, setIsInfoModalVisible] = useState(false); // Removed Info Modal State

	// Derived permission flags for cleaner JSX
	const canReadMedication = user && hasAuthority("READ_MEDICATION");
	const canCreateMedication = user && hasAuthority("CREATE_MEDICATION");
	const canUpdateMedication = user && hasAuthority("UPDATE_MEDICATION");
	const canDeleteMedication = user && hasAuthority("DELETE_MEDICATION");
	const canUpdateStock = user && hasAuthority("UPDATE_MEDICATION_STOCK");
	const canReadHistory = user && hasAuthority("READ_MEDICATION_HISTORY");
	const canDeleteBatchPerm = user && (hasAuthority("UPDATE_MEDICATION_STOCK") || hasAuthority("DELETE_MEDICATION"));

	useEffect(() => {
		// Fetch only if user has permission to read
		if (canReadMedication) {
			fetchMedications();
		} else {
			// Optionally clear data or set loading state appropriately
			// medications = []; // Reset data if needed
			setLoading(false);
		}
	}, [page, size, searchParams, canReadMedication]); // Add canReadMedication dependency

	const fetchMedications = async () => {
		setLoading(true);
		// No need for inner check here, already handled by useEffect guard
		await searchMedications({ ...searchParams, page, size });
		setLoading(false);
	};

	const showModal = (medication) => {
		// Check permission before showing modal for editing/creating
		if (medication && !canUpdateMedication) return; // Don't show edit modal if no update permission
		if (!medication && !canCreateMedication) return; // Don't show add modal if no create permission

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
		// Check permission before showing stock modal
		if (!canUpdateStock) return;

		setSelectedMedication(medication);
		setStockChangeQuantity(0);
		setPurchasePrice(0);
		setIsStockModalVisible(true);
	};
	const showBatchesModal = async (medication) => {
		// Check permission before fetching/showing batches
		if (!canReadMedication) return;

		setSelectedMedication(medication);
		setIsBatchModalVisible(true);

		try {
			const batches = await getBatchesForMedication(medication.id);
			const mappedBatches = batches.map((batch) => ({
				...batch,
				key: batch.id,
			}));
			setMedicationBatches(mappedBatches);
		} catch (error) {
			console.error("Error fetching batches:", error);
		}
	};
	const handleBatchesModalClose = () => {
		setIsBatchModalVisible(false);
		setSelectedMedication(null);
		setMedicationBatches([]);
		setSelectedBatch(null);
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
		// Permissions checked via button disabled state below
		try {
			const values = await form.validateFields();
			if (selectedMedication) {
				// Check UPDATE_MEDICATION again just in case state changed
				if (!canUpdateMedication) throw new Error("Permission denied");
				await updateMedication(selectedMedication.id, values);
			} else {
				// Check CREATE_MEDICATION again just in case state changed
				if (!canCreateMedication) throw new Error("Permission denied");
				await createMedication(values);
			}
			fetchMedications(); // Re-fetch if possible
			setIsModalVisible(false);
			setSelectedMedication(null);
			form.resetFields();
			setMessage("");
		} catch (error) {
			console.log("Error submitting form:", error);
			// TODO: Show user-friendly error message
		}
	};

	const handleStockChangeSubmit = async () => {
		// Permission checked via button disabled state below
		try {
			// Check UPDATE_MEDICATION_STOCK again
			if (!canUpdateStock) throw new Error("Permission denied");
			const batchData = {
				quantity: stockChangeQuantity,
				purchasePrice: purchasePrice,
			};
			await addBatch(selectedMedication.id, batchData);
			fetchMedications(); // Re-fetch if possible
			setIsStockModalVisible(false);
			setSelectedMedication(null);
			setStockChangeQuantity(0);
			setPurchasePrice(0);
		} catch (error) {
			console.error("Error adding batch:", error);
			// TODO: Show user-friendly error message
		}
	};

	const handleDelete = (medicationId) => {
		// Check DELETE_MEDICATION before showing the warning (reflects intent)
		if (!canDeleteMedication) {
			Modal.error({ title: "Permission Denied", content: "You do not have permission to delete medications." });
			return;
		}

		// Original warning logic
		Modal.warning({
			title: "Deletion Not Allowed",
			content: (
				<div>
					<p>
						Medications cannot be permanently deleted once they are created. This is because they might be associated with patient
						records, prescriptions, batch information, or other important data within the system. Deleting a medication could cause
						inconsistencies and data loss.
					</p>
					<p>What you can do:</p>
					<ul>
						<li>Update: You can modify the medication's details (name, dosage, etc.) using the "Edit" button.</li>
						<li>
							Discontinue Use: If you no longer need the medication, simply stop using it. It will remain in the system for historical
							records, but you can filter it out of your active views if needed.
						</li>
					</ul>
					<p>
						If you absolutely believe the medication must be removed: Please contact the system administrator or the project developer.
						They can assess the situation and determine if a safe removal is possible, taking into account all data dependencies. This is
						generally not recommended.
					</p>
				</div>
			),
			okText: "OK",
		});
		// Original code did not call deleteMedication(medicationId);
	};

	const handleSearch = (value) => {
		// Search only possible if user can read
		if (!canReadMedication) return;
		setSearchParams({ ...searchParams, searchTerm: value });
		setPage(0);
	};

	const handleTableChange = (pagination) => {
		// Pagination only relevant if user can read
		if (!canReadMedication) return;
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	const onPriceUnitChange = (value) => {
		setPricingUnit(value);
	};

	const onPriceChange = (value) => {
		setPrice(value);
		updateMessage();
	};

	const onAmountPerUnitChange = (value) => {
		setAmountPerUnit(value);
		updateMessage();
	};

	const getCalculatedPrice = () => {
		if (price && amountPerUnit) {
			return (price * amountPerUnit).toFixed(2);
		}
		return "0.00";
	};

	const updateMessage = () => {
		const name = form.getFieldValue("name");
		const dosage = form.getFieldValue("dosage");
		const unit = pricingUnit;
		const numberOfUnits = amountPerUnit;
		const unitPrice = price;
		const totalPrice = getCalculatedPrice();

		const newMessage = `You are adding/editing a medicine named ${name} that has a dosage of ${dosage} and has ${numberOfUnits} ${unit} with a price of ${unitPrice} per ${unit} and a total price of ${totalPrice}.`;

		setMessage(newMessage);
	};

	const showHistoryModal = (medication) => {
		// Check permission before showing history
		if (!canReadHistory) return;
		setSelectedMedication(medication);
		setIsHistoryModalVisible(true);
	};

	const handleHistoryModalClose = () => {
		setIsHistoryModalVisible(false);
		setSelectedMedication(null);
	};

	const showAllHistory = () => {
		// Check permission before showing all history
		if (!canReadHistory) return;
		setIsAllHistoryVisible(true);
	};

	const handleAllHistoryClose = () => {
		setIsAllHistoryVisible(false);
	};
	const handleEditBatch = (batch) => {
		// Check permission before showing edit batch modal
		if (!canUpdateStock) return;
		setSelectedBatch(batch);
		batchForm.setFieldsValue({ purchasePrice: batch.purchasePrice });
		setIsEditBatchModalVisible(true);
	};

	const handleDeleteBatch = async (batchId) => {
		// Check permission before attempting delete
		if (!canDeleteBatchPerm) {
			Modal.error({ title: "Permission Denied", content: "You do not have permission to delete medication batches." });
			return;
		}

		Modal.confirm({
			title: "Confirm Delete",
			content: "Are you sure you want to delete this batch? This action cannot be undone.",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			onOk: async () => {
				try {
					await deleteBatch(batchId);
					if (selectedMedication && canReadMedication) {
						// Check read perm before fetching again
						const batches = await getBatchesForMedication(selectedMedication.id);
						const mappedBatches = batches.map((batch) => ({
							...batch,
							key: batch.id,
						}));
						setMedicationBatches(mappedBatches);
					}
				} catch (error) {
					console.error("Error deleting batch:", error);
					// TODO: Show user-friendly error message
				}
			},
		});
	};

	const handleUpdateBatch = async () => {
		// Permission checked via button disabled state below
		try {
			// Check UPDATE_MEDICATION_STOCK again
			if (!canUpdateStock) throw new Error("Permission denied");
			const values = await batchForm.validateFields();
			await updateBatch(selectedBatch.id, {
				purchasePrice: values.purchasePrice,
			});
			if (selectedMedication && canReadMedication) {
				// Check read perm before fetching again
				const batches = await getBatchesForMedication(selectedMedication.id);
				const mappedBatches = batches.map((batch) => ({
					...batch,
					key: batch.id,
				}));
				setMedicationBatches(mappedBatches);
			}
			setIsEditBatchModalVisible(false);
			setSelectedBatch(null);
			batchForm.resetFields();
		} catch (error) {
			console.error("Error updating batch:", error);
			// TODO: Show user-friendly error message
		}
	};

	// Removed showInfoModal and handleInfoModalClose

	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Dosage",
			dataIndex: "dosage",
			key: "dosage",
		},
		{
			title: "Price",
			key: "price",
			render: (text, record) => (
				<Text strong style={{ color: "#1890ff" }}>
					{record.price * record.amountPerUnit} Pounds
				</Text>
			),
		},
		{
			title: "Stock",
			key: "stock",
			dataIndex: "stock",
		},
		{
			title: "Batches",
			key: "batches",
			// Conditionally render based on READ_MEDICATION
			render: (text, record) =>
				canReadMedication ? (
					<Button type="default" onClick={() => showBatchesModal(record)}>
						View Batches
					</Button>
				) : (
					<Text disabled>N/A</Text> // Or null if you prefer to hide completely
				),
		},
		{
			title: "Actions",
			key: "actions",
			// Conditionally render actions based on permissions
			render: (text, record) => (
				<Space size="middle">
					{canUpdateMedication && (
						<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
							Edit
						</Button>
					)}
					{canUpdateStock && (
						<Button type="default" icon={<PlusOutlined />} onClick={() => showStockModal(record)}>
							Add Batch
						</Button>
					)}
					{canReadHistory && (
						<Button type="default" icon={<HistoryOutlined />} onClick={() => showHistoryModal(record)}>
							History
						</Button>
					)}
					{canDeleteMedication && (
						<Button
							type="dashed"
							danger
							icon={<DeleteOutlined />}
							onClick={() => handleDelete(record.id)}
							title="Medications cannot be deleted directly. Click for more information."
							// style={{ opacity: 0.9 }} // Opacity might not be needed if hidden based on permission
						>
							Delete
						</Button>
					)}
					{/* Show placeholder if no actions are available */}
					{!canUpdateMedication && !canUpdateStock && !canReadHistory && !canDeleteMedication && <Text disabled>No Actions Permitted</Text>}
				</Space>
			),
		},
	];
	const batchColumns = [
		{
			title: "Purchase Date",
			dataIndex: "purchaseDate",
			key: "purchaseDate",
			render: (text) => (text ? new Date(text).toLocaleString() : "N/A"),
		},
		{
			title: "Purchase Price",
			dataIndex: "purchasePrice",
			key: "purchasePrice",
			render: (text) => `£${text.toFixed(2)}`,
		},
		{
			title: "Quantity",
			dataIndex: "quantity",
			key: "quantity",
		},
		{
			title: "Remaining Quantity",
			dataIndex: "remainingQuantity",
			key: "remainingQuantity",
		},
		{
			title: "Actions",
			key: "actions",
			// Conditionally render batch actions
			render: (text, record) => (
				<Space size="middle">
					{canUpdateStock && <Button type="primary" icon={<EditTwoTone />} onClick={() => handleEditBatch(record)} size="small" />}
					{canDeleteBatchPerm && (
						<Button type="primary" icon={<DeleteTwoTone />} onClick={() => handleDeleteBatch(record.id)} size="small" danger />
					)}
					{/* Show placeholder if no actions are available */}
					{!canUpdateStock && !canDeleteBatchPerm && <Text disabled>N/A</Text>}
				</Space>
			),
		},
	];
	const helpContent = (
		// ... (help content remains unchanged) ...
		<Steps direction="vertical" current={-1} style={{ maxHeight: "600px", overflowY: "auto", paddingRight: "20px" }}>
			{" "}
			{/* Added padding */}
			{/* current=-1 shows all steps */}
			<Step
				title="Adding a New Medication"
				description={
					<div>
						<p>
							To add a new medication, click the "Add New Medication" button. This will open a form where you'll enter the medication's
							details.
						</p>
						<Divider />
						<Title level={5}>Fields:</Title>
						<ul>
							<li>Name: The common name of the medication (e.g., "Amoxicillin").</li>
							<li>
								Dosage: The strength of the medication (e.g., "250mg", "500mg", "10ml").
								<span style={{ color: "red" }}>Important:</span> If you have the *same* medication but with *different* dosages,
								create a *separate* medication entry for *each* dosage. For example:
								<ul>
									<li>Amoxicillin 250mg</li>
									<li>Amoxicillin 500mg</li>
								</ul>
								Use a consistent format (like "MedicationName Dosage") to make it clear.
							</li>
							<li>
								Pricing Unit: This is *how* you sell the medication. It is *critical* for correct pricing. Choose the unit that
								matches how you price the medication:
								<ul>
									<li>PER_MG: Price per milligram.</li>
									<li>PER_ML: Price per milliliter (for liquids).</li>
									<li>PER_TABLET: Price per individual tablet.</li>
									<li>PER_DOSE: Price per dose (if a dose is a standard unit).</li>
									<li>PER_VIAL: Price per vial.</li>
									<li>PER_UNIT: A general-purpose unit.</li>
									<li>PER_PEN: For pre-filled pens (e.g., insulin).</li>
									<li>PER_GRAM: Price per gram.</li>
									<li>PER_CAPSULE: Price per capsule.</li>
									<li>PER_PATCH: Price per transdermal patch.</li>
									<li>PER_INHALER: Price per inhaler.</li>
									<li>PER_BOX: Price for a whole box.</li>
									<li>PER_PACK: Price for a whole pack.</li>
								</ul>
							</li>
							<li>
								Price: The price of *one* of the selected "Pricing Unit". For example, if the Pricing Unit is PER_MG, this is the
								price of *one* milligram. If it's PER_BOX, this is the price of *one* box.
							</li>
							<li>
								Amount Per Unit: How many of the "Pricing Unit" are in *this* medication. This determines the total *selling* price.
								<ul>
									<li>If you choose PER_MG and the medication contains 500mg, enter `500`.</li>
									<li>If you choose PER_ML and the medication contains 10ml, enter `10`.</li>
									<li>If you choose PER_TABLET, enter `1` (because you're selling one tablet at a time).</li>
									<li>If you choose PER_BOX and you're adding information for *one* box, enter `1`.</li>
								</ul>
							</li>
							<li>Image URL: Add here the url of the image you want to display for the medication.</li>
						</ul>
						<Divider />
						<p>The total selling price (displayed in the table) is calculated automatically: `Price` * `Amount Per Unit`.</p>
					</div>
				}
			/>
			<Step
				title="Editing a Medication"
				description={
					<div>
						<p>
							To edit an existing medication, click the "Edit" button next to the medication in the table. This will open the same form
							as adding a medication, but the fields will be pre-filled with the medication's current information. You can change any of
							the fields and click "Update" to save the changes.
						</p>
						<Alert
							message="You can change *any* detail of a medication, including its name, dosage, pricing unit, and price."
							type="info"
							showIcon
							style={{ marginBottom: "16px" }}
						/>
					</div>
				}
			/>
			<Step
				title="Adding a Batch"
				description={
					<div>
						<p>Batches are used to track your *inventory* and the *purchase price* you paid. To add a new batch:</p>
						<ol>
							<li>Click the "Add Batch" button next to the medication you want to add stock to.</li>
							<li>
								Enter the Quantity: This is the number of *units* you received in this batch. This refers to the number of sellable
								items (tablets, boxes, vials, etc.), *not* the total milligrams or milliliters.
							</li>
							<li>
								Enter the Purchase Price (per unit): This is the price you paid for *one* unit of the medication in this batch (e.g.,
								the price per tablet, per box). This is for your internal records and is *different* from the selling price.
							</li>
							<li>Click "Add Batch" to save.</li>
						</ol>
						<Alert
							message="The system automatically calculates the total stock of a medication by adding up the remaining quantities of all its batches. You don't enter the total stock directly."
							type="info"
							showIcon
							style={{ marginBottom: "16px" }}
						/>
						<Alert
							message="The system uses the First-In, First-Out (FIFO) method.  This means that when medication is dispensed, the system assumes the oldest batch (the first one you added) is used first."
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
						<p>To see the details of all batches for a medication, click the "View Batches" button. This will open a table showing:</p>
						<ul>
							<li>Purchase Date: When you received the batch.</li>
							<li>Purchase Price: The price you paid per unit.</li>
							<li>Quantity: The number of units in the batch.</li>
							<li>Remaining Quantity: The number of units left in the batch.</li>
						</ul>
					</div>
				}
			/>
			<Step
				title="Editing/Deleting Batches"
				description={
					<div>
						<p>You can edit the purchase price of a batch or delete a batch entirely.</p>
						<ul>
							<li>Edit Batch: click edit to change the batch purchase price.</li>
							<li>Delete Batch: To delete a batch click delete to delete the batch (this cannot be undone).</li>
						</ul>
					</div>
				}
			/>
			<Step
				title="Searching Medications"
				description={
					<p>
						Use the search bar at the top of the page to find medications by name. Type in part or all of the medication name, and the
						table will update to show only matching medications.
					</p>
				}
			/>
			<Step
				title="Medication History"
				description={
					<div>
						<p>
							Click the "History" button next to a medication to view a detailed history of all changes made to that medication,
							including batch additions, updates, and usage.
						</p>
						<p>Click the "View All History" button to see a combined history of all medications.</p>
					</div>
				}
			/>
			<Step
				title="Deleting Medications"
				description={
					<div>
						<Alert
							message="Medications cannot generally be deleted.  This is to prevent data loss and maintain the integrity of records.  If a medication is associated with prescriptions, batches, or patient data, it cannot be removed."
							type="error"
							showIcon
							style={{ marginBottom: "16px" }}
						/>
						<p>Instead of deleting, you can:</p>
						<ul>
							<li>Edit: Modify the medication's details if something is incorrect.</li>
							<li>Discontinue Use: Simply stop using the medication. It will remain in the system for historical purposes.</li>
						</ul>
						<p>
							If you believe a medication *must* be deleted (e.g., it was created in error and has *no* associated data), contact your
							system administrator.
						</p>
					</div>
				}
			/>
		</Steps>
	);

	// Top-level check: If user cannot read medications, show access denied message
	if (!canReadMedication && !loading) {
		// Check !loading to avoid flicker during initial auth check
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
					<Title level={2}>Medication List</Title>
				</Col>
				<Col>
					{/* Help button is always visible */}
					<Popover content={helpContent} title="Medication Page Help" trigger="click">
						<Button type="default" icon={<InfoCircleOutlined />}>
							Help
						</Button>
					</Popover>
				</Col>
			</Row>

			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={18}>
					{/* Search bar requires READ_MEDICATION (implicitly handled by top-level check) */}
					<Input.Search placeholder="Search by name..." onSearch={handleSearch} style={{ width: "100%" }} />
				</Col>
				<Col xs={24} sm={6}>
					{/* Conditionally render Add button */}
					{canCreateMedication && (
						<Button type="primary" block onClick={() => showModal(null)}>
							Add New Medication
						</Button>
					)}
				</Col>
			</Row>
			<Row justify="end" style={{ marginBottom: 16 }}>
				{/* Conditionally render View All History button */}
				{canReadHistory && (
					<Button type="default" icon={<UnorderedListOutlined />} onClick={showAllHistory}>
						View All History
					</Button>
				)}
			</Row>

			<div style={{ overflowX: "auto", margin: "0 -16px" }}>
				{/* Table rendering is implicitly handled by top-level check */}
				<Table
					columns={columns} // Columns now have internal permission checks
					dataSource={medications}
					loading={loading}
					rowKey="id"
					pagination={{
						current: page + 1,
						pageSize: size,
						total: total,
						onChange: handleTableChange,
					}}
				/>
			</div>

			{/* Add/Edit Modal */}
			<Modal
				title={selectedMedication ? "Edit Medication" : "Add Medication"}
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
						// Disable button based on permission and mode (add vs edit)
						disabled={!user || (selectedMedication ? !canUpdateMedication : !canCreateMedication)}>
						{selectedMedication ? "Update" : "Save"}
					</Button>,
				]}
				width="70%">
				<Form form={form} layout="vertical">
					{/* Form fields are implicitly enabled/disabled by modal visibility & button state */}
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Name" name="name" rules={[{ required: true, message: "Please input name" }]}>
								<Input onChange={updateMessage} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Dosage" name="dosage" rules={[{ required: true, message: "Please input dosage" }]}>
								<Input onChange={updateMessage} />
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Pricing Unit" name="pricingUnit" rules={[{ required: true, message: "Please input pricing unit" }]}>
								<Select
									value={pricingUnit}
									onChange={(e) => {
										onPriceUnitChange(e);
										updateMessage();
									}}>
									<Option value="PER_MG">PER_MG</Option>
									<Option value="PER_ML">PER_ML</Option>
									<Option value="PER_DOSE">PER_DOSE</Option>
									<Option value="PER_VIAL">PER_VIAL</Option>
									<Option value="PER_UNIT">PER_UNIT</Option>
									<Option value="PER_PEN">PER_PEN</Option>
									<Option value="PER_GRAM">PER_GRAM</Option>
									<Option value="PER_TABLET">PER_TABLET</Option>
									<Option value="PER_CAPSULE">PER_CAPSULE</Option>
									<Option value="PER_PATCH">PER_PATCH</Option>
									<Option value="PER_INHALER">PER_INHALER</Option>
									<Option value="PER_BOX">PER_BOX</Option>
									<Option value="PER_PACK">PER_PACK</Option>
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Price" name="price" rules={[{ required: true, message: "Please input price" }]}>
								<Input type="number" value={price} onChange={(e) => onPriceChange(e.target.value)} />
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Image URL" name="imageURL" rules={[{ required: true, message: "Please input Image URL" }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item
								label={`And this unit has ${amountPerUnit} ${pricingUnit} in it`}
								name="amountPerUnit"
								rules={[{ required: true, message: "Please input amount per unit" }]}>
								<Input type="number" value={amountPerUnit} onChange={(e) => onAmountPerUnitChange(e.target.value)} />
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24}>
							<Alert message={message} type="info" showIcon />
						</Col>
					</Row>
				</Form>
			</Modal>

			{/* Add Batch Modal */}
			<Modal
				title="Add Batch"
				visible={isStockModalVisible}
				onCancel={handleStockModalCancel}
				footer={[
					<Button key="cancel" onClick={handleStockModalCancel}>
						Cancel
					</Button>,
					<Button
						key="submit"
						type="default"
						onClick={handleStockChangeSubmit}
						// Disable button based on permission
						disabled={!canUpdateStock}>
						Add Batch
					</Button>,
				]}>
				<Form layout="vertical">
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: "Please input quantity" }]}>
								<InputNumber
									value={stockChangeQuantity}
									onChange={(value) => setStockChangeQuantity(value)}
									min={1}
									style={{ width: "100%" }}
								/>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item
								label="Purchase Price (per unit)"
								name="purchasePrice"
								rules={[{ required: true, message: "Please input purchase price" }]}>
								<InputNumber value={purchasePrice} onChange={(value) => setPurchasePrice(value)} min={0} style={{ width: "100%" }} />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>

			{/* View Batches Modal */}
			<Modal
				title={`Batches for ${selectedMedication?.name}`}
				visible={isBatchModalVisible}
				onCancel={handleBatchesModalClose}
				footer={null} // Actions are in the table now
				width="70%">
				<Table columns={batchColumns} dataSource={medicationBatches} rowKey="id" pagination={false} />
			</Modal>

			{/* Edit Batch Modal */}
			<Modal
				title="Edit Batch"
				visible={isEditBatchModalVisible}
				onCancel={() => {
					setIsEditBatchModalVisible(false);
					setSelectedBatch(null);
					batchForm.resetFields();
				}}
				onOk={handleUpdateBatch}
				// Disable OK button based on permission
				okButtonProps={{ disabled: !canUpdateStock }}
				okText="Update"
				cancelText="Cancel">
				<Form form={batchForm} layout="vertical">
					<Form.Item label="Purchase Price" name="purchasePrice" rules={[{ required: true, message: "Please input purchase price" }]}>
						<InputNumber min={0} style={{ width: "100%" }} />
					</Form.Item>
				</Form>
			</Modal>

			{/* History Modals are conditionally opened based on permission checks */}
			<MedicationHistory
				medicationId={selectedMedication?.id}
				medicationName={selectedMedication?.name}
				visible={isHistoryModalVisible}
				onClose={handleHistoryModalClose}
			/>
			<AllMedicationHistory visible={isAllHistoryVisible} onClose={handleAllHistoryClose} />
			{/* Removed Info Modal */}
		</div>
	);
};

export default MedicationList;
