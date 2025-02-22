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
	Card,
	Descriptions,
	Tag,
	Row,
	Col,
	message,
	notification,
} from "antd";
import { useMedicationAdministrationStore } from "../../services/medicationAdministration.service";
import { usePrescriptionStore } from "../../services/prescription.service";
import { usePatientStore } from "../../services/patient.service";
import { useUserStore } from "../../services/user.service";
import { useAuthStore } from "../../services/auth.service";
import { useMedicationStore } from "../../services/medication.service";
import { DeleteOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import { format, formatDistance, isToday, isYesterday, differenceInDays, differenceInMonths } from "date-fns";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

const formatRelativeTime = (localDateTime) => {
	if (!localDateTime) return "N/A";

	const date = new Date(localDateTime); // Convert to a date object
	const now = new Date();

	if (isToday(date)) {
		return format(date, "HH:mm"); // Display the exact time for today
	}

	if (isYesterday(date)) {
		return "Yesterday";
	}

	const daysAgo = differenceInDays(now, date);
	if (daysAgo > 1 && daysAgo < 30) {
		return `${daysAgo} days ago`;
	}

	const monthsAgo = differenceInMonths(now, date);
	if (monthsAgo >= 1) {
		return `${monthsAgo} month ago`;
	}

	return formatDistance(date, now, { addSuffix: true });
};

const formatExactTime = (localDateTime) => {
	if (!localDateTime) return "N/A";

	const date = new Date(localDateTime);
	return format(date, "dd MMM yyyy, HH:mm:ss");
};
const MedicationAdministrationList = () => {
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
	const { users, getAllUsers } = useUserStore();
	const { user, hasAuthority } = useAuthStore(); // Get hasAuthority
	const { medications, fetchAllMedications } = useMedicationStore();

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedAdministration, setSelectedAdministration] = useState(null);
	const [form] = Form.useForm();
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [searchParams, setSearchParams] = useState({}); //Keep for future searching options
	const [patientOptions, setPatientOptions] = useState([]);
	const [selectedPatient, setSelectedPatient] = useState(null);
	const [prescriptionOptions, setPrescriptionOptions] = useState([]);
	const [selectedPrescription, setSelectedPrescription] = useState(null);
	const [selectedMedication, setSelectedMedication] = useState(null);
	const [selectedPrescribedMedication, setSelectedPrescribedMedication] = useState(null);
	const [calculatedPrice, setCalculatedPrice] = useState(null);
	const [fetchedUsers, setFetchedUsers] = useState({});
	const [fetchedMedications, setFetchedMedications] = useState({});
	const [amount, setAmount] = useState(null);
	const [prescriptionDetails, setPrescriptionDetails] = useState(null);
	const [administrationsTotal, setAdministrationsTotal] = useState(0);

	// Define permission checks
	const canCreateMedicationAdministration = hasAuthority("CREATE_MEDICATION_ADMINISTRATION");
	const canReadMedicationAdministration = hasAuthority("READ_MEDICATION_ADMINISTRATION");
	const canDeleteMedicationAdministration = hasAuthority("DELETE_MEDICATION_ADMINISTRATION");

	// Use useCallback to memoize functions that are dependencies of useEffect
	const fetchAllUsersWithMap = useCallback(async () => {
		const allUsers = await getAllUsers();
		const userMap = {};
		allUsers?.forEach((user) => (userMap[user.id] = user));
		return userMap;
	}, [getAllUsers]);

	const fetchAllMedicationsWithMap = useCallback(async () => {
		const allMedications = await fetchAllMedications();
		const medicationMap = {};
		allMedications?.forEach((medication) => (medicationMap[medication.id] = medication));
		return medicationMap;
	}, [fetchAllMedications]);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				await getAllUsers();
				await fetchAllMedications();
				// Pre-fetch all users and medications
				const fetchedUsers = await fetchAllUsersWithMap();
				setFetchedUsers(fetchedUsers);
				const fetchedMedications = await fetchAllMedicationsWithMap();
				setFetchedMedications(fetchedMedications);
			} catch (error) {
				notification.error({
					message: "Error",
					description: `Failed to fetch  data: ${error.message}`,
				});
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [getAllUsers, fetchAllMedications, fetchAllUsersWithMap, fetchAllMedicationsWithMap, setLoading]);

	const handlePageChange = (page, pageSize) => {
		setCurrentPage(page);
		setPageSize(pageSize);
		fetchAdministrationsForPatient(selectedPatient.id, page, pageSize);
	};

	const handlePatientSearch = async (value) => {
		if (value) {
			try {
				const searchResults = await searchPatients({ searchTerm: value, page: 0, size: 10 }); // Use page 0 and size 10 for initial search
				setPatientOptions(
					searchResults?.content?.map((patient) => ({
						label: `${patient.firstName} ${patient.lastName}`,
						value: patient.id,
						patient,
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
	const fetchAdministrationsForPatient = useCallback(
		async (patientId, page = 1, size = 10) => {
			if (!patientId) return;

			try {
				const response = await searchMedicationAdministrations({ patientId, page: page - 1, size });
				setAdministrationsTotal(response.total); // Use total from the response
			} catch (error) {
				console.error("Failed to fetch medication administrations:", error);
				// Handle error appropriately
			}
		},
		[searchMedicationAdministrations]
	);

	const handlePatientSelect = async (value, option) => {
		const selectedPatient = option?.patient;
		setSelectedPatient(selectedPatient);
		form.setFieldsValue({ patientId: value });

		// Reset other selections ONLY when a patient is selected
		setPrescriptionDetails(null);
		setSelectedMedication(null);
		setSelectedPrescribedMedication(null);
		setPrescriptionOptions([]); // Clear previous prescriptions
		setCalculatedPrice(null);
		setAmount(null);

		if (selectedPatient) {
			// Fetch prescriptions for the selected patient
			await fetchPrescriptionsForPatient(selectedPatient.id); // AWAIT here

			// Fetch medication administrations for the selected patient
			await fetchAdministrationsForPatient(selectedPatient.id);
		}

		// DO NOT clear prescriptionOptions here.  It's now handled above, before fetching.
	};
	const fetchPrescriptionsForPatient = async (patientId) => {
		try {
			const response = await fetchPrescriptionsByPatientId(patientId, 0, 9999999);
			// Correctly handle the Page object and filter prescriptions
			const filteredPrescriptions = response?.content?.filter((prescription) => isPrescriptionValid(prescription)) ?? [];

			setPrescriptionOptions(
				filteredPrescriptions.map((prescription) => ({
					label: `Prescription ID: ${prescription.id}`,
					value: prescription.id,
					prescription,
				}))
			);
		} catch (error) {
			console.error("Failed to fetch prescriptions:", error);
			setPrescriptionOptions([]);
		}
	};

	const handlePrescriptionSelect = (value, option) => {
		const selectedPrescription = option?.prescription;
		setSelectedPrescription(selectedPrescription);
		form.setFieldsValue({ prescriptionId: value });
		setPrescriptionDetails(selectedPrescription);
		setSelectedPrescribedMedication(null);
		setSelectedMedication(null);
		setCalculatedPrice(null);
	};

	const handlePrescribedMedicationSelect = (value, option) => {
		const selectedPrescribedMedication = option?.prescribedMedication;
		setSelectedPrescribedMedication(selectedPrescribedMedication);
		const medicationId = selectedPrescribedMedication?.medicationId;
		setSelectedMedication(medications?.find((m) => m.id === medicationId));
		form.setFieldsValue({ medicationId: medicationId });
		calculatePrice(medicationId);
	};

	const showModal = (administration) => {
		//Removed the update logic in this function
		setSelectedAdministration(administration);
		form.resetFields();

		if (user) {
			form.setFieldsValue({ userId: user.id });
		}

		setIsModalVisible(true);
		setPatientOptions([]); // Clear previous patient options
		setPrescriptionDetails(null); //clear if im adding not updating
		setAmount(null); //clear
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedAdministration(null);
		setSelectedPatient(null);
		setSelectedPrescription(null);
		setPrescriptionDetails(null);
		setSelectedMedication(null);
		setSelectedPrescribedMedication(null);
		form.resetFields();
		setPatientOptions([]);
		setPrescriptionOptions([]);
		setPrescriptionDetails(null);
		setSelectedMedication(null);
		setCalculatedPrice(null);
		setAmount(null);
	};

	const handleFormSubmit = async () => {
		//Removed Update Logic from submit
		if (!canCreateMedicationAdministration) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to create medication administrations.",
			});
			return;
		}
		try {
			const values = await form.validateFields();
			const payload = {
				...values,
			};

			if (selectedPatient) {
				payload.patientId = selectedPatient.id;
			}
			if (selectedMedication) {
				payload.medicationId = selectedMedication.id;
				payload.calculatedPrice = calculatedPrice;
			}
			if (selectedPrescription) {
				payload.prescriptionId = selectedPrescription.id;
				if (selectedPrescribedMedication) {
					payload.prescribedMedicationId = selectedPrescribedMedication.id;
				}
			}

			payload.amount = amount;

			await createMedicationAdministration(payload);

			if (selectedPatient?.id) fetchAdministrationsForPatient(selectedPatient.id); //refresh only this patient admins
			setIsModalVisible(false);
			setSelectedAdministration(null);
			form.resetFields();
			setSelectedPatient(null);
			setSelectedPrescription(null);
			setPrescriptionDetails(null);
			setSelectedMedication(null);
			setSelectedPrescribedMedication(null);
			setPatientOptions([]);
			setPrescriptionOptions([]);
			setSelectedMedication(null);
			setCalculatedPrice(null);
			setAmount(null);
			message.success("Administration Saved Successfully!");
		} catch (error) {
			console.log("error in handle form submit", error);
			notification.error({
				message: "Error",
				description: "There was an error when saving the administration",
			});
		}
	};

	const handleDelete = async (administrationId) => {
		if (!canDeleteMedicationAdministration) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to delete medication administrations.",
			});
			return;
		}
		try {
			await deleteMedicationAdministration(administrationId);
			if (selectedPatient?.id) fetchAdministrationsForPatient(selectedPatient.id); //refresh list
			message.success("Administration Deleted Successfully!");
		} catch (error) {
			console.error("Error deleting administration:", error);
			notification.error({
				message: "Error",
				description: "There was an error when deleting the administration",
			});
		}
	};

	const getUserName = (userId) => {
		const user = fetchedUsers[userId];
		return user ? `${user.firstName} ${user.lastName}` : "N/A";
	};

	const calculatePrice = (medicationId) => {
		try {
			const medication = medications?.find((med) => med.id === medicationId);
			const currentAmount = form.getFieldValue("amount") || amount;
			if (medication && currentAmount) {
				const calculated = parseFloat(medication.price) * currentAmount * medication.amountPerUnit;
				setCalculatedPrice(calculated.toFixed(2));
			} else {
				setCalculatedPrice(null);
			}
		} catch (error) {
			setCalculatedPrice(null);
		}
	};

	const onAmountChange = (event) => {
		if (!canCreateMedicationAdministration) return;
		const newAmount = event.target.value;
		setAmount(newAmount);
		calculatePrice(selectedMedication?.id || form.getFieldValue("medicationId"));
	};

	const isPrescribed = (prescriptionId) => {
		return !!prescriptionId;
	};
	const isPrescriptionValid = (prescription) => {
		if (!prescription || !prescription.expirationDate) {
			return false;
		}
		let expirationDate;

		//Handle dayjs Object
		if (dayjs.isDayjs(prescription.expirationDate)) {
			expirationDate = prescription.expirationDate;
		}

		// Handle string expirationDate
		else if (typeof prescription.expirationDate === "string") {
			const parsedDate = dayjs(prescription.expirationDate);
			if (parsedDate.isValid()) {
				expirationDate = parsedDate;
			} else {
				return false;
			}
		} else {
			return false;
		}

		// Get today's date at the start of the day
		const todayStartOfDay = dayjs().endOf("day");

		// Compare timestamps directly
		return expirationDate.valueOf() >= todayStartOfDay.valueOf();
	};

	const columns = [
		{
			title: (
				<>
					Medication
					<Tooltip title="Prescribed medications that was adminstrated">
						<span style={{ marginLeft: 5, cursor: "pointer" }}>*</span>
					</Tooltip>
				</>
			),
			dataIndex: "medicationName",
			key: "medicationName",
			render: (medicationName, record) => {
				if (!canReadMedicationAdministration) {
					// Data masking and conditional rendering
					return "***";
				}
				const isPrescribedValue = isPrescribed(record.prescriptionId);
				//const fetchedMedicationName = getMedicationName(record.medicationId, record.prescriptionId);
				return (
					<>
						{medicationName} {isPrescribedValue && <MedicineBoxOutlined style={{ marginLeft: 5, color: "#1890ff" }} />}
					</>
				);
			},
		},
		{
			title: "User",
			dataIndex: "user",
			key: "user",
		},
		{
			title: "Amount",
			dataIndex: "amount",
			key: "amount",
			render: (text) => (canReadMedicationAdministration ? text : "***"), // Data masking
		},
		{
			title: "Calculated Price",
			dataIndex: "calculatedPrice",
			key: "calculatedPrice",
			render: (text) => (canReadMedicationAdministration ? text : "***"), // Data masking
		},
		{
			title: "Administration Time",
			dataIndex: "administrationTime",
			key: "administrationTime",
			render: (text) => (canReadMedicationAdministration ? <Tooltip title={formatExactTime(text)}>{formatRelativeTime(text)}</Tooltip> : "***"), // Data masking
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{canDeleteMedicationAdministration && (
						<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
							Delete
						</Button>
					)}
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 20 }}>
			<Title level={2}>Medication Administration List</Title>
			<Space style={{ marginBottom: 16 }}>
				{canCreateMedicationAdministration && (
					<Button type="default" onClick={() => showModal(null)}>
						Add New Administration
					</Button>
				)}
			</Space>
			<Form layout="inline" style={{ marginBottom: 16 }}>
				<Form.Item label="Filter by Patient" name="patientFilter">
					<AutoComplete
						options={patientOptions}
						onSearch={handlePatientSearch}
						onSelect={handlePatientSelect}
						placeholder="Search for a patient"
						style={{ width: 200 }}
						allowClear
						disabled={!canReadMedicationAdministration}
					/>
				</Form.Item>
			</Form>

			<Table columns={columns} dataSource={medicationAdministrations} loading={loading} rowKey="id" pagination={false} />
			{selectedPatient && (
				<Pagination
					current={currentPage}
					pageSize={pageSize}
					total={administrationsTotal}
					onChange={handlePageChange}
					style={{ marginTop: 20 }}
				/>
			)}

			<Modal
				title={"Add Administration"}
				open={isModalVisible}
				onCancel={handleCancel}
				width={800} // Increased modal width
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					canCreateMedicationAdministration && (
						<Button key="submit" type="default" onClick={handleFormSubmit}>
							Save
						</Button>
					),
				]}>
				<Card style={{ padding: 20 }}>
					<Form form={form} layout="vertical">
						<Row gutter={[16, 16]}>
							<Col xs={24} sm={12}>
								<Form.Item
									label="Patient"
									name="patientId"
									rules={[
										{
											required: true,
											message: "Please select a patient",
										},
									]}>
									<AutoComplete
										options={patientOptions}
										onSearch={handlePatientSearch}
										onSelect={handlePatientSelect}
										disabled={!canCreateMedicationAdministration}
										placeholder="Search for a patient"
										filterOption={false}
									/>
								</Form.Item>
							</Col>
							<Col xs={24} sm={12}>
								<Form.Item label="Prescription" name="prescriptionId">
									<Select
										placeholder="Select a prescription"
										disabled={!canCreateMedicationAdministration}
										options={prescriptionOptions.map((option) => ({
											...option,
											label: (
												<>
													{option.label}
													{!isPrescriptionValid(option.prescription) && (
														<Tag style={{ marginLeft: 8 }} color="red">
															Expired
														</Tag>
													)}
												</>
											),
										}))}
										onSelect={handlePrescriptionSelect}
										filterOption={false}
										allowClear></Select>
								</Form.Item>
							</Col>
						</Row>
						{prescriptionDetails && (
							<Card title="Prescription Details" style={{ marginTop: 16 }}>
								<Descriptions bordered column={1}>
									<Descriptions.Item label="Note">{prescriptionDetails.note}</Descriptions.Item>
									<Descriptions.Item label="Select Medication">
										<Select
											placeholder="Select a medication"
											style={{ width: "100%" }}
											disabled={!canCreateMedicationAdministration}
											onSelect={handlePrescribedMedicationSelect}
											options={prescriptionDetails?.prescribedMedications?.map((prescribedMedication) => ({
												label: (
													<>
														{prescribedMedication.medicationName}
														{prescribedMedication.expired && (
															<Tag style={{ marginLeft: 8 }} color="red">
																Administered
															</Tag>
														)}
														{!isPrescriptionValid(prescriptionDetails) && (
															<Tag style={{ marginLeft: 8 }} color="red">
																Expired
															</Tag>
														)}
													</>
												),
												value: prescribedMedication.id,
												prescribedMedication,
												disabled: prescribedMedication.expired,
											}))}
											filterOption={false}
											allowClear
										/>
									</Descriptions.Item>

									{selectedPrescribedMedication && (
										<div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
											<Descriptions column={1}>
												<Descriptions.Item label="Name">
													<div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
														{selectedPrescribedMedication.medicationName}
													</div>
												</Descriptions.Item>
												<Descriptions.Item label="Dosage">
													<div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
														{selectedPrescribedMedication.dosage}
													</div>
												</Descriptions.Item>
												<Descriptions.Item label="Route">
													<div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
														{selectedPrescribedMedication.route}
													</div>
												</Descriptions.Item>
												<Descriptions.Item label="Amount">
													<div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
														{selectedPrescribedMedication.amount}
													</div>
												</Descriptions.Item>
											</Descriptions>
										</div>
									)}
								</Descriptions>
							</Card>
						)}
						<Row gutter={[16, 16]}>
							<Col xs={24} sm={12}>
								{user ? (
									<Form.Item label="User" name="userId">
										<Input disabled value={`${user.firstName} ${user.lastName}`} />
									</Form.Item>
								) : (
									<Form.Item label="User" name="userId" rules={[{ required: true, message: "Please select a user" }]}>
										<Select placeholder="Select a user" disabled={!canCreateMedicationAdministration}>
											{users?.map((user) => (
												<Option key={user.id} value={user.id}>
													{`${user.firstName} ${user.lastName}`}
												</Option>
											))}
										</Select>
									</Form.Item>
								)}
							</Col>
							<Col xs={24} sm={12}>
								<Form.Item label="Amount" name="amount" rules={[{ required: true, message: "Please enter an amount" }]}>
									<Input type="number" onChange={onAmountChange} disabled={!canCreateMedicationAdministration} />
								</Form.Item>
							</Col>
						</Row>
						{calculatedPrice !== null && <Form.Item label={`Calculated price: ${calculatedPrice}`}></Form.Item>}
						<Form.Item label="Medication" name="medicationId" style={{ display: "none" }}></Form.Item>
					</Form>
				</Card>
			</Modal>
		</div>
	);
};

export default MedicationAdministrationList;
