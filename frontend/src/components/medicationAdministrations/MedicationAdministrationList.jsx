// MedicationAdministrationList.js
import React, { useState, useEffect, useCallback } from "react";
import {
	Table,
	Button,
	Space,
	Typography,
	Modal,
	Form,
	Select,
	Input,
	AutoComplete,
	Tooltip,
	Pagination,
	// Removed Card as we'll use direct layout
	Descriptions,
	Tag,
	Row,
	Col,
	message,
	notification,
	Alert,
} from "antd";
import { useMedicationAdministrationStore } from "../../services/medicationAdministration.service";
import { usePrescriptionStore } from "../../services/prescription.service";
import { usePatientStore } from "../../services/patient.service";
import { useUserStore } from "../../services/user.service";
import { useAuthStore } from "../../services/auth.service";
import { useMedicationStore } from "../../services/medication.service";
import { DeleteOutlined, MedicineBoxOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { format, formatDistance, isToday, isYesterday, differenceInDays, differenceInMonths } from "date-fns";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

// --- Helper Functions (unchanged) ---
const formatRelativeTime = (localDateTime) => {
	if (!localDateTime) return "N/A";
	const date = new Date(localDateTime);
	const now = new Date();
	if (isToday(date)) return format(date, "HH:mm");
	if (isYesterday(date)) return "Yesterday";
	const daysAgo = differenceInDays(now, date);
	if (daysAgo > 1 && daysAgo < 30) return `${daysAgo} days ago`;
	const monthsAgo = differenceInMonths(now, date);
	if (monthsAgo >= 1) return `${monthsAgo} month${monthsAgo > 1 ? "s" : ""} ago`;
	return formatDistance(date, now, { addSuffix: true });
};

const formatExactTime = (localDateTime) => {
	if (!localDateTime) return "N/A";
	const date = new Date(localDateTime);
	return format(date, "dd MMM yyyy, HH:mm:ss");
};

const isPrescriptionValid = (prescription) => {
	if (!prescription || !prescription.expirationDate) return false;
	let expirationDate;
	if (dayjs.isDayjs(prescription.expirationDate)) {
		expirationDate = prescription.expirationDate;
	} else if (typeof prescription.expirationDate === "string") {
		const parsedDate = dayjs(prescription.expirationDate);
		if (!parsedDate.isValid()) return false;
		expirationDate = parsedDate;
	} else {
		return false;
	}
	const todayEndOfDay = dayjs().endOf("day");
	return expirationDate.valueOf() >= todayEndOfDay.valueOf();
};
// --- End Helper Functions ---

const MedicationAdministrationList = () => {
	// --- Store Hooks ---
	const {
		medicationAdministrations,
		loading,
		total,
		searchMedicationAdministrations,
		deleteMedicationAdministration,
		createMedicationAdministration,
		setLoading,
	} = useMedicationAdministrationStore();
	const { fetchPrescriptionsByPatientId } = usePrescriptionStore();
	const { searchPatients } = usePatientStore();
	const { getAllUsers } = useUserStore();
	const { user, hasAuthority } = useAuthStore();
	const { fetchAllMedications } = useMedicationStore();

	// --- State Variables ---
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [patientOptions, setPatientOptions] = useState([]);
	const [selectedPatient, setSelectedPatient] = useState(null); // Patient selected in main filter
	const [prescriptionOptions, setPrescriptionOptions] = useState([]);
	const [selectedPrescription, setSelectedPrescription] = useState(null); // Prescription selected in modal
	const [selectedMedication, setSelectedMedication] = useState(null); // Medication derived from selection
	const [selectedPrescribedMedication, setSelectedPrescribedMedication] = useState(null); // PrescribedMedication selected in modal
	const [calculatedPrice, setCalculatedPrice] = useState(null);
	const [fetchedUsers, setFetchedUsers] = useState({});
	const [fetchedMedications, setFetchedMedications] = useState({});
	const [amount, setAmount] = useState(null); // Amount in modal
	const [prescriptionDetails, setPrescriptionDetails] = useState(null); // Prescription details for modal

	// --- Derived Permission Flags ---
	const canCreateMedicationAdministration = user && hasAuthority("CREATE_MEDICATION_ADMINISTRATION");
	const canReadMedicationAdministration = user && hasAuthority("READ_MEDICATION_ADMINISTRATION");
	const canDeleteMedicationAdministration = user && hasAuthority("DELETE_MEDICATION_ADMINISTRATION");

	// --- Data Fetching Callbacks & Effects (largely unchanged logic) ---
	const fetchAllUsersWithMap = useCallback(async () => {
		if (!canReadMedicationAdministration && !canCreateMedicationAdministration) return {};
		try {
			const allUsers = await getAllUsers();
			const userMap = {};
			allUsers?.forEach((u) => (userMap[u.id] = u));
			setFetchedUsers(userMap);
			return userMap;
		} catch (error) {
			console.error("Failed to fetch users:", error);
			return {};
		}
	}, [getAllUsers, canReadMedicationAdministration, canCreateMedicationAdministration]);

	const fetchAllMedicationsWithMap = useCallback(async () => {
		if (!canReadMedicationAdministration && !canCreateMedicationAdministration) return {};
		try {
			const allMedications = await fetchAllMedications();
			const medicationMap = {};
			allMedications?.forEach((m) => (medicationMap[m.id] = m));
			setFetchedMedications(medicationMap);
			return medicationMap;
		} catch (error) {
			console.error("Failed to fetch medications:", error);
			return {};
		}
	}, [fetchAllMedications, canReadMedicationAdministration, canCreateMedicationAdministration]);

	useEffect(() => {
		fetchAllUsersWithMap();
		fetchAllMedicationsWithMap();
	}, [fetchAllUsersWithMap, fetchAllMedicationsWithMap]);

	const fetchAdministrationsForPatient = useCallback(
		async (patientId, page = 1, size = 10) => {
			if (!patientId || !canReadMedicationAdministration) {
				useMedicationAdministrationStore.setState({ medicationAdministrations: [], total: 0 });
				return;
			}
			setLoading(true);
			try {
				await searchMedicationAdministrations({ patientId, page: page - 1, size });
			} catch (error) {
				console.error("Failed to fetch medication administrations:", error);
				notification.error({
					message: "Error Fetching Administrations",
					description: `Could not load administrations. ${error?.message || ""}`,
				});
				useMedicationAdministrationStore.setState({ medicationAdministrations: [], total: 0 });
			} finally {
				setLoading(false);
			}
		},
		[searchMedicationAdministrations, setLoading, canReadMedicationAdministration]
	);

	const handlePageChange = (page, pageSize) => {
		if (!selectedPatient || !canReadMedicationAdministration) return;
		setCurrentPage(page);
		setPageSize(pageSize);
		fetchAdministrationsForPatient(selectedPatient.id, page, pageSize);
	};

	const handlePatientSearch = async (value) => {
		if (!value) {
			setPatientOptions([]);
			return;
		}
		try {
			const searchResults = await searchPatients({ searchTerm: value, page: 0, size: 10 });
			setPatientOptions(
				searchResults?.content?.map((p) => ({
					label: `${p.firstName} ${p.lastName} (ID: ${p.id})`,
					value: p.id,
					patient: p,
				})) || []
			);
		} catch (error) {
			console.error("Failed to search patients:", error);
			setPatientOptions([]);
		}
	};

	const fetchPrescriptionsForPatient = async (patientId) => {
		if (!patientId || !canCreateMedicationAdministration) return;
		try {
			const response = await fetchPrescriptionsByPatientId(patientId, 0, 9999999);
			const filteredPrescriptions = response?.content?.filter((p) => isPrescriptionValid(p)) ?? [];
			setPrescriptionOptions(
				filteredPrescriptions.map((p) => ({
					label: `ID: ${p.id} (Expires: ${dayjs(p.expirationDate).format("DD MMM YYYY")})`,
					value: p.id,
					prescription: p,
				}))
			);
		} catch (error) {
			console.error("Failed to fetch prescriptions:", error);
			notification.error({
				message: "Error Fetching Prescriptions",
				description: `Could not load valid prescriptions. ${error?.message || ""}`,
			});
			setPrescriptionOptions([]);
		}
	};

	const handleMainPatientSelect = (value, option) => {
		const selectedPatientData = option?.patient;
		setSelectedPatient(selectedPatientData);

		// Clear dependent state for the main page & modal form
		setSelectedPrescription(null);
		setPrescriptionDetails(null);
		setSelectedMedication(null);
		setSelectedPrescribedMedication(null);
		setPrescriptionOptions([]);
		setCalculatedPrice(null);
		setAmount(null);
		form.resetFields();

		if (selectedPatientData) {
			if (canReadMedicationAdministration) {
				setCurrentPage(1);
				fetchAdministrationsForPatient(selectedPatientData.id, 1, pageSize);
			} else {
				useMedicationAdministrationStore.setState({ medicationAdministrations: [], total: 0 });
			}
			if (canCreateMedicationAdministration) {
				fetchPrescriptionsForPatient(selectedPatientData.id);
			}
		} else {
			useMedicationAdministrationStore.setState({ medicationAdministrations: [], total: 0 });
			setPrescriptionOptions([]);
		}
	};

	const handleModalPatientSelect = async (value, option) => {
		const selectedPatientData = option?.patient;
		form.setFieldsValue({ patientId: value });

		// Reset modal state dependent on patient
		setSelectedPrescription(null);
		setPrescriptionDetails(null);
		setSelectedMedication(null);
		setSelectedPrescribedMedication(null);
		setPrescriptionOptions([]);
		setCalculatedPrice(null);
		setAmount(null);
		form.resetFields(["prescriptionId", "medicationId", "amount"]);

		if (selectedPatientData && canCreateMedicationAdministration) {
			await fetchPrescriptionsForPatient(selectedPatientData.id);
		} else {
			setPrescriptionOptions([]);
		}
	};

	const handlePrescriptionSelect = (value, option) => {
		if (!canCreateMedicationAdministration) return;
		const selectedPrescriptionData = option?.prescription;
		setSelectedPrescription(selectedPrescriptionData);
		form.setFieldsValue({ prescriptionId: value });
		setPrescriptionDetails(selectedPrescriptionData);

		setSelectedPrescribedMedication(null);
		setSelectedMedication(null);
		setCalculatedPrice(null);
		setAmount(null);
		form.resetFields(["medicationId", "amount", "prescribedMedicationId"]); // Also reset prescribedMedicationId hidden field if used
	};

	const handlePrescribedMedicationSelect = (value, option) => {
		if (!canCreateMedicationAdministration) return;
		const selectedPrescribedMedData = option?.prescribedMedication;
		setSelectedPrescribedMedication(selectedPrescribedMedData);
		const medicationId = selectedPrescribedMedData?.medicationId;
		const medication = fetchedMedications[medicationId];
		setSelectedMedication(medication);
		form.setFieldsValue({ medicationId: medicationId }); // Set hidden field

		if (selectedPrescribedMedData && !selectedPrescribedMedData.expired && selectedPrescribedMedData.amount) {
			const prescribedAmount = selectedPrescribedMedData.amount;
			form.setFieldsValue({ amount: prescribedAmount });
			setAmount(prescribedAmount);
			calculatePrice(medicationId, prescribedAmount);
		} else {
			form.resetFields(["amount"]);
			setAmount(null);
			calculatePrice(medicationId, null);
		}
	};

	const handleClearPrescription = () => {
		setSelectedPrescription(null);
		setPrescriptionDetails(null);
		setSelectedPrescribedMedication(null);
		setSelectedMedication(null);
		form.resetFields(["prescriptionId", "medicationId", "amount", "prescribedMedicationId"]);
		setAmount(null);
		setCalculatedPrice(null);
	};

	const showModal = () => {
		if (!canCreateMedicationAdministration) {
			notification.warning({ message: "Permission Denied", description: "You cannot add administrations." });
			return;
		}

		form.resetFields();
		setSelectedPrescription(null);
		setPrescriptionDetails(null);
		setSelectedMedication(null);
		setSelectedPrescribedMedication(null);
		setCalculatedPrice(null);
		setAmount(null);
		setPatientOptions([]);

		if (user) {
			form.setFieldsValue({ userId: user.id });
		} else {
			console.error("User data is not available.");
			notification.error({ message: "Error", description: "User information missing." });
			return;
		}

		if (selectedPatient) {
			form.setFieldsValue({ patientId: selectedPatient.id });
			setPatientOptions([
				{
					label: `${selectedPatient.firstName} ${selectedPatient.lastName} (ID: ${selectedPatient.id})`,
					value: selectedPatient.id,
					patient: selectedPatient,
				},
			]);
			// Fetch prescriptions for this patient if not already fetched or if needed refresh
			fetchPrescriptionsForPatient(selectedPatient.id);
		} else {
			// Clear patient field if none selected on main page
			form.resetFields(["patientId"]);
			setPrescriptionOptions([]); // Ensure prescriptions are cleared too
		}

		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		form.resetFields();
		setSelectedPrescription(null);
		setPrescriptionDetails(null);
		setSelectedMedication(null);
		setSelectedPrescribedMedication(null);
		setPatientOptions([]);
		setPrescriptionOptions([]);
		setCalculatedPrice(null);
		setAmount(null);
	};

	const handleFormSubmit = async () => {
		if (!canCreateMedicationAdministration) {
			notification.error({ message: "Permission Denied", description: "Cannot save." });
			return;
		}
		try {
			const values = await form.validateFields();
			const payload = { ...values };

			if (!payload.patientId || !payload.userId || !payload.medicationId || !payload.amount) {
				throw new Error("Missing required information.");
			}

			payload.calculatedPrice = calculatedPrice;
			if (selectedPrescribedMedication) {
				payload.prescribedMedicationId = selectedPrescribedMedication.id;
			}

			setLoading(true);
			await createMedicationAdministration(payload);
			setLoading(false);

			if (selectedPatient?.id === payload.patientId && canReadMedicationAdministration) {
				fetchAdministrationsForPatient(payload.patientId, currentPage, pageSize);
			}

			setIsModalVisible(false);
			handleCancel();
			message.success("Administration Saved!");
		} catch (error) {
			setLoading(false);
			console.error("Error submitting form:", error);
			if (error.errorFields) {
				notification.warning({ message: "Validation Error", description: "Check form fields." });
			} else {
				notification.error({ message: "Save Error", description: `Failed to save: ${error.message || "Try again."}` });
			}
		}
	};

	const handleDelete = async (administrationId, patientId) => {
		if (!canDeleteMedicationAdministration) {
			notification.error({ message: "Permission Denied", description: "Cannot delete." });
			return;
		}
		Modal.confirm({
			title: "Confirm Delete",
			content: "Delete this administration record?",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			onOk: async () => {
				try {
					setLoading(true);
					await deleteMedicationAdministration(administrationId);
					setLoading(false);
					message.success("Administration Deleted!");
					if (selectedPatient?.id === patientId && canReadMedicationAdministration) {
						const newTotal = total - 1;
						const newMaxPage = Math.ceil(newTotal / pageSize);
						const pageToFetch = currentPage > newMaxPage ? Math.max(1, newMaxPage) : currentPage;
						if (pageToFetch !== currentPage) setCurrentPage(pageToFetch);
						fetchAdministrationsForPatient(patientId, pageToFetch, pageSize);
					}
				} catch (error) {
					setLoading(false);
					console.error("Error deleting:", error);
					notification.error({ message: "Deletion Error", description: `Could not delete: ${error.message || "Try again."}` });
				}
			},
		});
	};

	const getUserName = useCallback((userId) => fetchedUsers[userId]?.username ?? "N/A", [fetchedUsers]);
	const getMedicationName = useCallback((medicationId) => fetchedMedications[medicationId]?.name ?? "N/A", [fetchedMedications]);

	const calculatePrice = (medicationId, currentAmount) => {
		// Same calculation logic as before
		if (!medicationId || !currentAmount || currentAmount <= 0) {
			setCalculatedPrice(null);
			form.setFieldsValue({ calculatedPrice: null });
			return;
		}
		try {
			const medication = fetchedMedications[medicationId];
			if (medication && medication.price != null && medication.amountPerUnit != null) {
				const price = parseFloat(medication.price);
				const amountVal = parseFloat(currentAmount);
				const amountPerUnit = parseFloat(medication.amountPerUnit);
				let calculated = null;

				if (!isNaN(price) && !isNaN(amountVal) && !isNaN(amountPerUnit) && amountPerUnit > 0) {
					const pricePerBaseUnit = price / amountPerUnit;
					calculated = pricePerBaseUnit * amountVal;
				} else if (!isNaN(price) && !isNaN(amountVal) && amountPerUnit === 1) {
					calculated = price * amountVal;
				}

				if (calculated !== null) {
					setCalculatedPrice(calculated.toFixed(2));
					form.setFieldsValue({ calculatedPrice: calculated.toFixed(2) });
				} else {
					setCalculatedPrice(null);
					form.setFieldsValue({ calculatedPrice: null });
				}
			} else {
				setCalculatedPrice(null);
				form.setFieldsValue({ calculatedPrice: null });
			}
		} catch (error) {
			console.error("Error calculating price:", error);
			setCalculatedPrice(null);
			form.setFieldsValue({ calculatedPrice: null });
		}
	};

	const onAmountChange = (event) => {
		if (!canCreateMedicationAdministration) return;
		const newAmount = event.target.value;
		setAmount(newAmount);
		const medicationId = form.getFieldValue("medicationId");
		calculatePrice(medicationId, newAmount);
	};

	const isPrescribed = (prescriptionId) => !!prescriptionId;

	// --- Table Columns Definition (similar structure to MedicationList) ---
	const columns = [
		{
			title: (
				<>
					Medication{" "}
					<Tooltip title="Blue icon: via prescription">
						<MedicineBoxOutlined style={{ marginLeft: 4, color: "#1890ff", verticalAlign: "middle", cursor: "help" }} />
					</Tooltip>
				</>
			),
			dataIndex: "medicationId",
			key: "medicationName",
			render: (medicationId, record) => {
				if (!canReadMedicationAdministration) return <Text disabled>***</Text>;
				const name = getMedicationName(medicationId);
				const prescribed = isPrescribed(record.prescriptionId);
				return (
					<>
						{name} {prescribed && <MedicineBoxOutlined style={{ marginLeft: 4, color: "#1890ff", verticalAlign: "middle" }} />}
					</>
				);
			},
		},
		{
			title: "Amount",
			dataIndex: "amount",
			key: "amount",
			render: (text) => (canReadMedicationAdministration ? text : <Text disabled>***</Text>),
		},
		{
			title: "Price (£)",
			dataIndex: "calculatedPrice",
			key: "calculatedPrice",
			align: "right",
			render: (text) => (canReadMedicationAdministration && text != null ? `£${parseFloat(text).toFixed(2)}` : <Text disabled>***</Text>),
			responsive: ["sm"], // Show on sm screens and up
		},
		{
			title: "Admin Time",
			dataIndex: "administrationTime",
			key: "administrationTime",
			render: (text) =>
				canReadMedicationAdministration ? (
					<Tooltip title={formatExactTime(text)}>{formatRelativeTime(text)}</Tooltip>
				) : (
					<Text disabled>***</Text>
				),
			responsive: ["md"], // Show on md screens and up
		},
		{
			title: "Admin By",
			dataIndex: "userId",
			key: "user",
			render: (userId) => (canReadMedicationAdministration ? getUserName(userId) : <Text disabled>***</Text>),
			responsive: ["lg"], // Show on lg screens and up
		},
		{
			title: "Actions",
			key: "actions",
			align: "center",
			render: (text, record) => (
				<Space size="small">
					{canDeleteMedicationAdministration && (
						<Tooltip title="Delete Record">
							<Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id, record.patientId)} size="small" />
						</Tooltip>
					)}
					{/* Placeholder if no actions */}
					{!canDeleteMedicationAdministration && <Text disabled>-</Text>}
				</Space>
			),
		},
	];

	// Top-level check for read permission
	if (!canReadMedicationAdministration && !loading) {
		return (
			<div style={{ padding: 20, textAlign: "center" }}>
				<Alert
					message="Access Denied"
					description="You cannot view medication administrations."
					type="error"
					showIcon
					icon={<LockOutlined />}
				/>
			</div>
		);
	}

	// --- JSX Render (Structure similar to MedicationList) ---
	return (
		<div style={{ padding: "16px" }}>
			{" "}
			{/* Reduced padding */}
			<Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
				<Col>
					<Title level={3}>Medication Administrations</Title>
				</Col>
				{/* Optional: Add Help Popover here if needed */}
			</Row>
			{/* Controls Row */}
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={18} md={16}>
					{" "}
					{/* Spans similar to MedicationList */}
					<AutoComplete
						options={patientOptions}
						onSearch={handlePatientSearch}
						onSelect={handleMainPatientSelect}
						placeholder="Filter by Patient Name or ID..."
						style={{ width: "100%" }}
						allowClear
						onClear={() => handleMainPatientSelect(null, null)}
						disabled={!canReadMedicationAdministration || loading}
						value={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName} (ID: ${selectedPatient.id})` : undefined}
						filterOption={false}>
						<Input prefix={<UserOutlined />} />
					</AutoComplete>
				</Col>
				<Col xs={24} sm={6} md={8}>
					{" "}
					{/* Spans similar to MedicationList */}
					{canCreateMedicationAdministration && (
						<Button
							type="primary"
							icon={<MedicineBoxOutlined />}
							onClick={showModal}
							disabled={loading || !selectedPatient} // Also disable if no patient selected
							style={{ width: "100%" }} // Make button full width on small screens
							title={!selectedPatient ? "Select a patient first" : "Add New Administration"}>
							Add New
						</Button>
					)}
				</Col>
			</Row>
			{/* Message area */}
			{!selectedPatient && canReadMedicationAdministration && (
				<Alert
					message="Select a patient using the filter above to view or add administrations."
					type="info"
					showIcon
					style={{ marginBottom: 16 }}
				/>
			)}
			{/* Table Section */}
			{selectedPatient && canReadMedicationAdministration && (
				<>
					{/* Wrapper div for horizontal scrolling on small screens */}
					<div style={{ overflowX: "auto", margin: "0 -16px", padding: "0 16px" }}>
						<Table
							columns={columns}
							dataSource={medicationAdministrations}
							loading={loading}
							rowKey="id"
							pagination={false}
							size="small" // Compact table
							style={{ minWidth: 600 }} // Minimum width before scroll applies
						/>
					</div>

					{/* Pagination */}
					{total > 0 && (
						<Pagination
							current={currentPage}
							pageSize={pageSize}
							total={total}
							onChange={handlePageChange}
							showSizeChanger
							onShowSizeChange={handlePageChange}
							style={{ marginTop: 16, textAlign: "right" }}
							size="small" // Compact pagination
						/>
					)}
				</>
			)}
			{/* Modal for Adding */}
			<Modal
				title="Add New Administration"
				open={isModalVisible}
				onCancel={handleCancel}
				width={800}
				destroyOnClose
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					canCreateMedicationAdministration && (
						<Button key="submit" type="primary" loading={loading} onClick={handleFormSubmit}>
							Save Administration
						</Button>
					),
				]}>
				{/* Form inside modal using Row/Col */}
				<Form form={form} layout="vertical" name="administrationForm">
					{/* Hidden fields */}
					<Form.Item name="userId" hidden>
						<Input />
					</Form.Item>
					<Form.Item name="medicationId" hidden>
						<Input />
					</Form.Item>
					<Form.Item name="calculatedPrice" hidden>
						<Input />
					</Form.Item>

					<Row gutter={16}>
						{/* Patient Selection (Modal specific) */}
						<Col xs={24} sm={12}>
							<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Patient required" }]}>
								<AutoComplete
									options={patientOptions}
									onSearch={handlePatientSearch}
									onSelect={handleModalPatientSelect}
									placeholder="Search/select patient"
									disabled={!canCreateMedicationAdministration || loading}
									filterOption={false}
									allowClear={false} // Require patient in modal
									// Pre-filled by showModal if patient selected on main page
								/>
							</Form.Item>
						</Col>

						{/* Prescription Selection */}
						<Col xs={24} sm={12}>
							<Form.Item label="Link to Prescription (Optional)" name="prescriptionId">
								<Select
									placeholder={prescriptionOptions.length > 0 ? "Select if applicable" : "No valid prescriptions"}
									disabled={!canCreateMedicationAdministration || loading || prescriptionOptions.length === 0}
									options={prescriptionOptions}
									onSelect={handlePrescriptionSelect}
									filterOption={(input, option) => option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false}
									allowClear
									onClear={handleClearPrescription}
								/>
							</Form.Item>
						</Col>
					</Row>

					{/* Prescription Details Card (Conditional) */}
					{selectedPrescription && (
						// Using Descriptions directly without extra Card for simplicity
						<Descriptions
							bordered
							size="small"
							column={1}
							title="Selected Prescription Details"
							style={{ margin: "16px 0", background: "#f9f9f9", padding: "8px" }}>
							<Descriptions.Item label="Prescription Note">{prescriptionDetails?.note || "N/A"}</Descriptions.Item>
							<Descriptions.Item label="Select Prescribed Medication">
								{/* Use Form.Item directly inside Descriptions.Item for validation */}
								<Form.Item
									name="prescribedMedicationId" // Bind to form state if needed, or handle selection directly
									noStyle // Prevent default Item styling
									rules={[{ required: true, message: "Select medication" }]}>
									<Select
										placeholder="Select medication"
										style={{ width: "100%" }}
										disabled={!canCreateMedicationAdministration || loading}
										onSelect={handlePrescribedMedicationSelect}
										options={prescriptionDetails?.prescribedMedications?.map((pm) => ({
											label: `${pm.medicationName} (${pm.dosage} ${pm.route}) ${pm.expired ? "[Administered]" : ""}`,
											value: pm.id,
											prescribedMedication: pm,
											disabled: pm.expired,
										}))}
										filterOption={false}
										allowClear={false}
									/>
								</Form.Item>
							</Descriptions.Item>

							{selectedPrescribedMedication && (
								<>
									<Descriptions.Item label="Selected Med">{selectedPrescribedMedication.medicationName}</Descriptions.Item>
									<Descriptions.Item label="Dosage">{selectedPrescribedMedication.dosage}</Descriptions.Item>
									<Descriptions.Item label="Route">{selectedPrescribedMedication.route}</Descriptions.Item>
									<Descriptions.Item label="Prescribed Amt">{selectedPrescribedMedication.amount}</Descriptions.Item>
								</>
							)}
						</Descriptions>
					)}

					{/* Amount and Price (Conditional) */}
					{selectedMedication && (
						<Row gutter={16}>
							<Col xs={24} sm={12}>
								<Form.Item
									label={`Amount Administered ${
										selectedMedication?.pricingUnit ? `(in ${selectedMedication.pricingUnit.replace("PER_", "")})` : ""
									}`}
									name="amount"
									rules={[
										{ required: true, message: "Amount required" },
										{ type: "number", min: 0.0001, message: "Amount must be positive", transform: (value) => Number(value) },
									]}>
									<Input
										type="number"
										min={0}
										step="any"
										onChange={onAmountChange}
										disabled={!canCreateMedicationAdministration || loading}
										placeholder={`Enter amount (${selectedMedication?.pricingUnit?.replace("PER_", "") || "units"})`}
									/>
								</Form.Item>
							</Col>
							<Col xs={24} sm={12}>
								<Form.Item label="Calculated Price (£)">
									<Input value={calculatedPrice ? `£${calculatedPrice}` : "N/A"} disabled />
								</Form.Item>
							</Col>
						</Row>
					)}

					{/* Administering User */}
					<Row gutter={16}>
						<Col xs={24}>
							<Form.Item label="Administered By">
								<Input disabled value={user ? `${user.firstName} ${user.lastName} (${user.username})` : "N/A"} />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default MedicationAdministrationList;
