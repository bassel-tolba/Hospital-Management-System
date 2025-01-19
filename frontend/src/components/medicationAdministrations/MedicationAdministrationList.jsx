import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Space, Typography, Modal, Form, Select, Input, AutoComplete, Tooltip, Pagination, Card, Descriptions, Tag } from "antd";
import { useMedicationAdministrationStore } from "../../services/medicationAdministration.service";
import { usePrescriptionStore } from "../../services/prescription.service";
import { usePatientStore } from "../../services/patient.service";
import { useUserStore } from "../../services/user.service";
import { useAuthStore } from "../../services/auth.service";
import { useMedicationStore } from "../../services/medication.service";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { format, formatDistance, isToday, isYesterday, differenceInDays, differenceInMonths } from "date-fns";

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
	const { fetchAllPrescriptions, fetchPrescriptionsByPatientId } = usePrescriptionStore();
	const { searchPatients, getAllPatients } = usePatientStore();
	const { users, getAllUsers } = useUserStore();
	const { user } = useAuthStore();
	const { medications, fetchAllMedications } = useMedicationStore();

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedAdministration, setSelectedAdministration] = useState(null);
	const [form] = Form.useForm();
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const [patientFilter, setPatientFilter] = useState(null);
	const [patientOptions, setPatientOptions] = useState([]);
	const [selectedPatient, setSelectedPatient] = useState(null);
	const [prescriptionOptions, setPrescriptionOptions] = useState([]);
	const [selectedPrescription, setSelectedPrescription] = useState(null);
	const [selectedMedication, setSelectedMedication] = useState(null);
	const [selectedPrescribedMedication, setSelectedPrescribedMedication] = useState(null);
	const [calculatedPrice, setCalculatedPrice] = useState(null);
	const [patients, setPatients] = useState([]);
	const [prescriptions, setPrescriptions] = useState([]);
	const [fetchedUsers, setFetchedUsers] = useState({});
	const [fetchedMedications, setFetchedMedications] = useState({});
	const [amount, setAmount] = useState(null);
	const [prescriptionDetails, setPrescriptionDetails] = useState(null);
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

	const fetchAdministrations = useCallback(async () => {
		setLoading(true);
		await searchMedicationAdministrations({
			...searchParams,
			page: currentPage - 1,
			size: pageSize,
			patientId: patientFilter,
		});
		setLoading(false);
	}, [searchParams, currentPage, pageSize, patientFilter, searchMedicationAdministrations, setLoading]);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			await getAllUsers();
			await fetchAdministrations();
			const allPatients = await getAllPatients();
			setPatients(allPatients || []);
			const allPrescriptions = await fetchAllPrescriptions();
			setPrescriptions(allPrescriptions || []);
			await fetchAllMedications();
			// Pre-fetch all users and medications
			const fetchedUsers = await fetchAllUsersWithMap();
			setFetchedUsers(fetchedUsers);
			const fetchedMedications = await fetchAllMedicationsWithMap();
			setFetchedMedications(fetchedMedications);
			setLoading(false);
		};
		fetchData();
	}, [
		currentPage,
		pageSize,
		searchParams,
		patientFilter,
		getAllUsers,
		fetchAllMedications,
		fetchAdministrations,
		fetchAllUsersWithMap,
		fetchAllMedicationsWithMap,
		setLoading,
	]);

	const handlePageChange = (page, pageSize) => {
		setCurrentPage(page);
		setPageSize(pageSize);
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

	const handlePatientSelect = async (value, option) => {
		const selectedPatient = option?.patient;
		setSelectedPatient(selectedPatient);
		form.setFieldsValue({ patientId: value });
		if (selectedPatient) {
			await fetchPrescriptionsForPatient(selectedPatient.id);
		}
		setPrescriptionDetails(null);
		setSelectedMedication(null);
		setSelectedPrescribedMedication(null);
	};
	const fetchPrescriptionsForPatient = async (patientId) => {
		try {
			const response = await fetchPrescriptionsByPatientId(patientId, 0, 10);
			setPrescriptionOptions(
				response?.content?.map((prescription) => {
					return {
						label: `Prescription ID: ${prescription.id}`,
						value: prescription.id,
						prescription,
					};
				}) || []
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
		if (selectedPrescription?.prescribedMedications && selectedPrescription.prescribedMedications.length === 1) {
			const prescribedMedication = selectedPrescription.prescribedMedications[0];
			setSelectedPrescribedMedication(prescribedMedication);
			const medicationName = prescribedMedication?.medicationName;
			const medicationId = prescribedMedication?.medicationId;
			setSelectedMedication(medications?.find((m) => m.id === medicationId));
			form.setFieldsValue({ medicationId: medicationId });
			calculatePrice(medicationId);
		} else {
			setSelectedMedication(null);
			setCalculatedPrice(null);
		}
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
		setSelectedAdministration(administration);
		setSelectedPatient(null);
		setSelectedPrescription(null);
		setPrescriptionOptions([]);
		setPrescriptionDetails(null);
		setSelectedMedication(null);
		setSelectedPrescribedMedication(null);
		setCalculatedPrice(null);
		setAmount(null);
		if (administration) {
			form.setFieldsValue(administration);
			setAmount(administration.amount);
			const patient = patients?.find((p) => p.id === administration.patientId);

			if (patient) {
				form.setFieldsValue({ patientId: patient.id });
				setSelectedPatient(patient);
				fetchPrescriptionsForPatient(patient.id);
			}
			if (administration.prescriptionId) {
				const prescription = prescriptions?.find((p) => p.id === administration.prescriptionId);
				if (prescription) {
					setSelectedPrescription(prescription);
					form.setFieldsValue({ prescriptionId: prescription.id });
					setPrescriptionDetails(prescription);
					if (prescription?.prescribedMedications && prescription.prescribedMedications.length === 1) {
						const prescribedMedication = prescription.prescribedMedications[0];
						setSelectedPrescribedMedication(prescribedMedication);
						const medicationId = prescribedMedication?.medicationId;
						setSelectedMedication(medications?.find((m) => m.id === medicationId));
						form.setFieldsValue({ medicationId: medicationId });
						calculatePrice(medicationId);
					}
				}
			}

			const medicationId = administration.medicationId;
			if (medicationId) {
				setSelectedMedication(medications?.find((m) => m.id === medicationId));
				calculatePrice(medicationId);
			}
		} else {
			form.resetFields();
			if (user) {
				form.setFieldsValue({ userId: user.id });
			}
		}
		setIsModalVisible(true);
		setPatientOptions([]);
		setPrescriptionDetails(null);
		setAmount(null);
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
			if (selectedAdministration) {
				// await updateMedicationAdministration(selectedAdministration.id, values);
			} else {
				await createMedicationAdministration(payload);
			}
			fetchAdministrations();
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
		} catch (error) {
			console.log("error in handle form submit", error);
		}
	};

	const handleDelete = async (administrationId) => {
		try {
			await deleteMedicationAdministration(administrationId);
			fetchAdministrations();
		} catch (error) {
			console.error("Error deleting administration:", error);
		}
	};

	const handlePatientFilterChange = (value) => {
		setPatientFilter(value);
		setCurrentPage(1);
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
		const newAmount = event.target.value;
		setAmount(newAmount);
		calculatePrice(selectedMedication?.id || form.getFieldValue("medicationId"));
	};

	const getPatientName = (prescriptionId, record) => {
		const prescription = prescriptions?.find((p) => p.id === prescriptionId);
		const patientId = prescription?.patientId || record.patientId;
		const patient = patients?.find((p) => p.id === patientId);
		return patient ? `${patient.firstName} ${patient.lastName}` : "N/A";
	};
	const getMedicationName = (medicationId, prescriptionId) => {
		let medication;
		if (prescriptionId) {
			const prescription = prescriptions?.find((p) => p.id === prescriptionId);
			if (prescription?.prescribedMedications?.[0]?.medicationId) {
				medication = fetchedMedications[prescription?.prescribedMedications?.[0]?.medicationId];
			}
		} else if (medicationId) {
			medication = fetchedMedications[medicationId];
		}

		return medication ? medication.name : "N/A";
	};
	const isPrescribed = (prescriptionId) => {
		return !!prescriptionId;
	};
	const columns = [
		{
			title: "Patient",
			dataIndex: "prescriptionId",
			key: "patientId",
			render: (prescriptionId, record) => getPatientName(prescriptionId, record),
		},
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
		},
		{
			title: "Calculated Price",
			dataIndex: "calculatedPrice",
			key: "calculatedPrice",
		},
		{
			title: "Administration Time",
			dataIndex: "administrationTime",
			key: "administrationTime",
			render: (text) => <Tooltip title={formatExactTime(text)}>{formatRelativeTime(text)}</Tooltip>,
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
						Edit
					</Button>
					<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
						Delete
					</Button>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 20 }}>
			<Title level={2}>Medication Administration List</Title>
			<Space style={{ marginBottom: 16 }}>
				<Select placeholder="Filter by Patient" style={{ width: 200 }} onChange={handlePatientFilterChange} allowClear>
					{patients?.map((patient) => (
						<Option key={patient.id} value={patient.id}>
							{`${patient.firstName} ${patient.lastName}`}
						</Option>
					))}
				</Select>
				<Button type="primary" onClick={() => showModal(null)}>
					Add New Administration
				</Button>
			</Space>
			<Table columns={columns} dataSource={medicationAdministrations} loading={loading} rowKey="id" pagination={false} />
			<Pagination current={currentPage} pageSize={pageSize} total={total} onChange={handlePageChange} style={{ marginTop: 20 }} />

			<Modal
				title={selectedAdministration ? "Edit Administration" : "Add Administration"}
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleFormSubmit}>
						{selectedAdministration ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical">
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
							placeholder="Search for a patient"
							filterOption={false}
						/>
					</Form.Item>
					<Form.Item label="Prescription" name="prescriptionId">
						<Select
							placeholder="Select a prescription"
							options={prescriptionOptions}
							onSelect={handlePrescriptionSelect}
							filterOption={false}
							allowClear></Select>
					</Form.Item>
					{prescriptionDetails && (
						<Card title="Prescription Details" style={{ marginTop: 16 }}>
							<Descriptions bordered column={1}>
								<Descriptions.Item label="Note">{prescriptionDetails.note}</Descriptions.Item>
								{prescriptionDetails?.prescribedMedications?.length > 1 && (
									<Descriptions.Item label="Select Medication">
										<Select
											placeholder="Select a medication"
											style={{ width: "100%" }}
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
								)}
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
								{prescriptionDetails?.prescribedMedications?.length === 1 &&
									prescriptionDetails?.prescribedMedications?.map((medication, index) => (
										<div key={index}>
											<Descriptions.Item label="Medication ID">{medication.medicationId}</Descriptions.Item>
											<Descriptions.Item label="Dosage">{medication.dosage}</Descriptions.Item>
											<Descriptions.Item label="Route">{medication.route}</Descriptions.Item>
											<Descriptions.Item label="Amount">{medication.amount}</Descriptions.Item>
										</div>
									))}
							</Descriptions>
						</Card>
					)}

					{user ? (
						<Form.Item label="User" name="userId">
							<Input disabled value={`${user.firstName} ${user.lastName}`} />
						</Form.Item>
					) : (
						<Form.Item label="User" name="userId" rules={[{ required: true, message: "Please select a user" }]}>
							<Select placeholder="Select a user">
								{users?.map((user) => (
									<Option key={user.id} value={user.id}>
										{`${user.firstName} ${user.lastName}`}
									</Option>
								))}
							</Select>
						</Form.Item>
					)}
					<Form.Item label="Amount" name="amount" rules={[{ required: true, message: "Please enter an amount" }]}>
						<Input type="number" onChange={onAmountChange} />
					</Form.Item>
					{calculatedPrice !== null && <Form.Item label={`Calculated price: ${calculatedPrice}`}></Form.Item>}
					<Form.Item label="Medication" name="medicationId" style={{ display: "none" }}></Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default MedicationAdministrationList;
