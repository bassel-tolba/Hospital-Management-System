import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, DatePicker, Select, AutoComplete, notification, List, Grid, InputNumber } from "antd";
// --- i18n ---
import { useTranslation } from "react-i18next";
// --- End i18n ---
import { useAdmissionStore } from "../../services/admission.service";
import { usePatientStore } from "../../services/patient.service";
import { useBedStore } from "../../services/bed.service";
import { useRoomStore } from "../../services/room.service";
import { useUnitStore } from "../../services/unit.service";
import { useAuthStore } from "../../services/auth.service";
import { QuestionCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import admissionDocsContent from "../../docs/admission";

const { Title } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

// --- DEBUGGING ---
const DEBUG_MODE = true; // Keep debugging logs for now
const logDebug = (...args) => {
	if (DEBUG_MODE) console.log("[DEBUG AdmissionList]", ...args);
};
const logError = (...args) => {
	console.error("[ERROR AdmissionList]", ...args);
};
const logWarn = (...args) => {
	console.warn("[WARN AdmissionList]", ...args);
};
// --- END DEBUGGING ---

const AdmissionList = () => {
	logDebug("Component Rendering / Re-rendering");

	// --- i18n Hook ---
	const { t } = useTranslation();
	// --- End i18n Hook ---

	// ... (Keep all existing state, hooks, store usages) ...
	const {
		admissions,
		admissionTypes,
		loading,
		error,
		total,
		searchAdmissions,
		deleteAdmission,
		createAdmission,
		updateAdmission,
		setLoading,
		setAdmissions,
		fetchAllAdmissionTypes,
		createAdmissionType,
		updateAdmissionType,
		deleteAdmissionType,
	} = useAdmissionStore();
	const { patients, searchPatients } = usePatientStore();
	const { beds, searchBeds, freeAllExpiredBeds } = useBedStore();
	const { rooms, fetchAllRooms } = useRoomStore();
	const { units, fetchAllUnits } = useUnitStore();
	const { user, hasAuthority } = useAuthStore();

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedAdmission, setSelectedAdmission] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const [patientOptions, setPatientOptions] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [filteredRooms, setFilteredRooms] = useState([]);
	const [filteredBeds, setFilteredBeds] = useState([]);
	const [selectedUnit, setSelectedUnit] = useState(null);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [selectedPatientId, setSelectedPatientId] = useState(null);
	const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
	const [selectedAdmissionType, setSelectedAdmissionType] = useState(null);
	const [typeForm] = Form.useForm();

	const canCreateAdmission = hasAuthority("CREATE_ADMISSION");
	// const canReadAdmission = hasAuthority("READ_ADMISSION"); // Not used directly for rendering logic
	const canUpdateAdmission = hasAuthority("UPDATE_ADMISSION");
	const canDeleteAdmission = hasAuthority("DELETE_ADMISSION");

	const [showDocs, setShowDocs] = useState(false);
	const screens = useBreakpoint();

	const getResponsivePadding = () => (screens.xs ? "8px" : screens.sm ? "12px" : "24px");
	const getResponsiveMargin = () => (screens.xs ? "8px 0" : screens.sm ? "12px 0" : "24px 16px");

	// --- Effects (Keep existing logic, logging can remain) ---
	useEffect(() => {
		logDebug("[useEffect AdmissionTypes] Attempting to fetch admission types...");
		fetchAllAdmissionTypes().catch((fetchError) => logError(t("admission.error.fetchTypesFailed"), fetchError)); // Use specific error key if needed
	}, [fetchAllAdmissionTypes]);

	useEffect(() => {
		logDebug("[useEffect AdmissionTypes] Admission Types State Updated:", admissionTypes);
		if (DEBUG_MODE && admissionTypes?.length > 0) console.table(admissionTypes);
	}, [admissionTypes]);
	useEffect(() => {
		logDebug("[useEffect Units] Fetching units...");
		fetchAllUnits();
	}, [fetchAllUnits]);
	useEffect(() => {
		logDebug("[useEffect Rooms] Fetching rooms...");
		fetchAllRooms();
	}, [fetchAllRooms]);
	useEffect(() => {
		logDebug("[useEffect Beds] Fetching initial batch of beds...");
		searchBeds({ size: 1000 })
			.then(() => logDebug("[useEffect Beds] Initial bed fetch potentially successful."))
			.catch((error) => logError(t("admission.error.fetchBedsMount"), error)); // i18n
	}, [searchBeds, t]); // Added t dependency
	useEffect(() => {
		logDebug("[useEffect Admissions] Fetching admissions with params:", { ...searchParams, page, size });
		fetchAdmissions();
	}, [page, size, searchParams]); // Removed fetchAdmissions from dependencies

	const fetchAdmissions = async () => {
		logDebug("[fetchAdmissions] Starting fetch...");
		setLoading(true);
		try {
			await searchAdmissions({ ...searchParams, page, size });
			logDebug("[fetchAdmissions] Search successful.");
		} catch (fetchError) {
			logError("[fetchAdmissions] Search FAILED:", fetchError);
			notification.error({
				message: t("common.error"),
				// Assuming a JSON key like: "admission.notification.fetchFailed": "فشل جلب القبول: {{message}}"
				description: t("admission.notification.fetchFailed", { message: fetchError.message }), // i18n - Use specific key
			});
		} finally {
			logDebug("[fetchAdmissions] Setting loading false.");
			setLoading(false);
		}
	};

	// --- Main Admission Modal Logic ---
	const showModal = (admission) => {
		// ... (keep internal logic, no translatable strings here) ...
		logDebug("[showModal Main] Opening modal for admission:", admission);
		setSelectedAdmission(admission);
		if (admission) {
			const bed = beds?.find((b) => b.id === admission.bedId);
			const room = rooms?.content?.find((r) => r.id === bed?.roomId);
			const unitId = room?.unitId;
			const roomId = bed?.roomId;
			const bedId = bed?.id;
			setSelectedUnit(unitId);
			setSelectedRoom(roomId);
			setSelectedPatientId(admission.patientId);
			logDebug("[showModal Main] Edit Mode - Initial state:", { unitId, roomId, bedId, patientId: admission.patientId });
			if (unitId) fetchFilteredBeds(unitId, roomId);
			if (unitId) setFilteredRooms(rooms?.content?.filter((r) => r.unitId === unitId));
			const formValues = {
				/* ... */
			};
			form.setFieldsValue(formValues);
		} else {
			logDebug("[showModal Main] Add Mode - Resetting form and state.");
			form.resetFields();
			setSelectedUnit(null);
			setSelectedRoom(null);
			setFilteredRooms([]);
			setFilteredBeds([]);
			setSelectedPatientId(null);
		}
		setIsModalVisible(true);
		setPatientSearchTerm("");
		setPatientOptions([]);
		logDebug("[showModal Main] Modal visibility set to true.");
	};

	// --- Admission Type Modal Logic ---
	const showTypeModal = (admissionType) => {
		// ... (keep internal logic) ...
		logDebug("[DEBUG AdmissionList Type Modal] showTypeModal called with:", admissionType);
		setSelectedAdmissionType(admissionType);
		if (admissionType) {
			logDebug("[DEBUG AdmissionList Type Modal] Edit mode. Setting form values:", admissionType);
			typeForm.setFieldsValue(admissionType);
		} else {
			logDebug("[DEBUG AdmissionList Type Modal] Add mode. Resetting form.");
			typeForm.resetFields();
		}
		setIsTypeModalVisible(true);
		logDebug("[DEBUG AdmissionList Type Modal] isTypeModalVisible set to true.");
	};

	const handleTypeCancel = () => {
		// ... (keep internal logic) ...
		logDebug("[DEBUG AdmissionList Type Modal] handleTypeCancel called.");
		setIsTypeModalVisible(false);
		setSelectedAdmissionType(null);
		typeForm.resetFields();
		logDebug("[DEBUG AdmissionList Type Modal] Modal closed, state reset.");
	};

	const handleTypeFormSubmit = async () => {
		// ... (keep internal logic before try) ...
		logDebug("[DEBUG AdmissionList handleTypeFormSubmit] Attempting to submit type form...");
		try {
			const values = await typeForm.validateFields();
			logDebug("[DEBUG AdmissionList handleTypeFormSubmit] Validation SUCCESS. Validated Values:", values);
			setLoading(true);
			if (selectedAdmissionType) {
				await updateAdmissionType(selectedAdmissionType.id, values);
				notification.success({
					message: t("common.success"),
					description: t("admission.notification.typeUpdated"), // i18n
				});
			} else {
				await createAdmissionType(values);
				notification.success({
					message: t("common.success"),
					description: t("admission.notification.typeCreated"), // i18n
				});
			}
			await fetchAllAdmissionTypes();
			setIsTypeModalVisible(false);
			typeForm.resetFields();
			setSelectedAdmissionType(null);
		} catch (errorInfo) {
			logError("[DEBUG AdmissionList handleTypeFormSubmit] FAILED.");
			if (errorInfo && errorInfo.errorFields) {
				logWarn("[DEBUG AdmissionList handleTypeFormSubmit] Validation FAILED.");
				notification.error({
					message: t("common.validationError"),
					// Add a key like "admission.notification.checkFormFields": "Please check form fields for errors."
					description: t("admission.notification.checkFormFields", "Please check the form fields for errors."), // i18n - Provide default
				});
			} else {
				logError("[DEBUG AdmissionList handleTypeFormSubmit] API Save/Update Error or Unexpected Error:", errorInfo);
				notification.error({
					message: t("common.saveError"),
					// Assuming key: "admission.notification.typeSaveFailed": "Failed to save admission type: {{message}}"
					description: t("admission.notification.typeSaveFailed", { message: errorInfo.message || t("common.unknownError") }), // i18n - Use specific key
				});
			}
		} finally {
			setLoading(false);
		}
	};

	const handleTypeDelete = async (admissionTypeId) => {
		logDebug("[DEBUG AdmissionList Type Modal] handleTypeDelete called for ID:", admissionTypeId);
		Modal.confirm({
			// Assuming key: "admission.confirm.deleteTypeTitle": "Are you sure you want to delete this admission type?"
			title: t("admission.confirm.deleteTypeTitle", "Are you sure you want to delete this admission type?"), // i18n - Provide default
			content: t("admission.confirm.deleteContent"), // i18n - Reused from main delete
			okText: t("admission.confirm.deleteOk"), // i18n
			okType: "danger",
			cancelText: t("admission.confirm.deleteCancel"), // i18n
			onOk: async () => {
				logDebug("[DEBUG AdmissionList Type Modal] Deletion Confirmed for ID:", admissionTypeId);
				try {
					setLoading(true);
					await deleteAdmissionType(admissionTypeId);
					notification.success({
						message: t("common.success"),
						description: t("admission.notification.typeDeleted"), // i18n
					});
					await fetchAllAdmissionTypes();
					if (selectedAdmissionType && selectedAdmissionType.id === admissionTypeId) {
						setSelectedAdmissionType(null);
						typeForm.resetFields();
					}
				} catch (deleteError) {
					logError("[DEBUG AdmissionList Type Modal] Delete FAILED:", deleteError);
					notification.error({
						message: t("common.error"),
						// Assuming key: "admission.notification.typeDeleteFailed": "Failed to delete admission type: {{message}}"
						description: t("admission.notification.typeDeleteFailed", { message: deleteError.message || t("common.unknownError") }), // i18n - Use specific key
					});
				} finally {
					setLoading(false);
				}
			},
			onCancel() {
				/* ... keep log ... */
			},
		});
	};
	// --- End Admission Type Modal Logic ---

	const handleCancel = () => {
		// ... (keep internal logic) ...
		logDebug("[handleCancel Main] Closing main modal.");
		setIsModalVisible(false);
		setSelectedAdmission(null);
		form.resetFields();
		setPatientSearchTerm("");
		setPatientOptions([]);
		setSelectedUnit(null);
		setSelectedRoom(null);
		setFilteredRooms([]);
		setFilteredBeds([]);
		setSelectedPatientId(null);
	};

	// --- Patient Search Logic (Keep logs, strings are mostly dynamic data) ---
	const handlePatientSearch = async (value) => {
		logDebug("[handlePatientSearch] Searching for:", value);
		setPatientSearchTerm(value);
		if (value && value.length > 1) {
			try {
				const searchResults = await searchPatients({ searchTerm: value, page: 0, size: 10 });
				const options =
					searchResults?.content?.map((patient) => ({
						label: `${patient.firstName} ${patient.lastName} (ID: ${patient.id})`,
						value: patient.id,
					})) || [];
				logDebug("[handlePatientSearch] Results found:", options);
				setPatientOptions(options);
			} catch (error) {
				logError(t("admission.error.patientSearchFailed"), error); // i18n
				setPatientOptions([]);
			}
		} else {
			logDebug("[handlePatientSearch] Search term too short or empty, clearing options.");
			setPatientOptions([]);
		}
	};
	const handlePatientSelect = (patientId, option) => {
		/* ... keep existing code ... */
	};

	// --- Bed/Room Fetching Logic (Keep logs) ---
	const fetchFilteredBeds = async (unitId, roomId) => {
		logDebug("[fetchFilteredBeds] Fetching for Unit:", unitId, "Room:", roomId);
		if (!unitId || !roomId) {
			logWarn("[fetchFilteredBeds] UnitId or RoomId missing, clearing beds.");
			setFilteredBeds([]);
			return;
		}
		try {
			const response = await searchBeds({ unitId, roomId, size: 100 });
			logDebug("[fetchFilteredBeds] Response received:", response);
			setFilteredBeds(response?.content || []);
		} catch (error) {
			logError(t("admission.error.fetchFilteredBedsFailed"), error); // i18n
			setFilteredBeds([]);
		}
	};
	const handleUnitChangeModal = async (unitId) => {
		/* ... keep existing code ... */
	};
	const handleRoomChangeModal = async (roomId) => {
		/* ... keep existing code ... */
	};

	// --- Main Form Submit ---
	const handleFormSubmit = async () => {
		// ... (keep internal logic before try) ...
		logDebug("[handleFormSubmit Main] Attempting main form submission...");
		try {
			const values = await form.validateFields();
			const patientIdToSubmit = selectedPatientId || values.patientId;
			if (!patientIdToSubmit) {
				logError("[handleFormSubmit Main] Patient ID is missing!");
				// Assuming key: "admission.notification.patientRequired": "Patient selection is required."
				notification.error({
					message: t("common.error"),
					description: t("admission.notification.patientRequired", "Patient selection is required."),
				}); // i18n - provide default
				return;
			}
			const formattedAdmissionDate = values.admissionDate ? values.admissionDate.format("YYYY-MM-DDTHH:mm:ss") : null;
			const admissionData = { ...values, admissionDate: formattedAdmissionDate, patientId: patientIdToSubmit };
			delete admissionData.unitId;
			delete admissionData.roomId;
			setLoading(true);
			if (selectedAdmission) {
				await updateAdmission(selectedAdmission.id, admissionData);
				notification.success({
					message: t("common.success"),
					description: t("admission.notification.updated"), // i18n
				});
			} else {
				await createAdmission(admissionData);
				notification.success({
					message: t("common.success"),
					description: t("admission.notification.created"), // i18n
				});
			}
			await freeAllExpiredBeds();
			await fetchAdmissions();
			setIsModalVisible(false);
			// ... (reset state logic) ...
			setSelectedAdmission(null);
			form.resetFields();
			setPatientSearchTerm("");
			setPatientOptions([]);
			setSelectedUnit(null);
			setSelectedRoom(null);
			setFilteredRooms([]);
			setFilteredBeds([]);
			setSelectedPatientId(null);
		} catch (errorInfo) {
			logError("[handleFormSubmit Main] FAILED.");
			if (errorInfo && errorInfo.errorFields) {
				logWarn("[handleFormSubmit Main] Validation FAILED.");
				notification.error({
					message: t("common.validationError"),
					// Use the same checkFormFields key as type modal or create a specific one
					description: t("admission.notification.checkFormFields", "Please check the form fields for errors."), // i18n - Provide default
				});
			} else {
				logError("[handleFormSubmit Main] API Save/Update Error or Unexpected Error:", errorInfo);
				notification.error({
					message: t("common.saveError"),
					// Assuming key: "admission.notification.saveFailed": "Failed to save admission: {{message}}"
					description: t("admission.notification.saveFailed", { message: errorInfo.message || t("common.unknownError") }), // i18n - Use specific key
				});
			}
		} finally {
			setLoading(false);
		}
	};

	// --- End Admission ---
	const handleEndAdmission = async (admission) => {
		// ... (keep internal logic before try) ...
		logDebug("[handleEndAdmission] Ending admission:", admission);
		try {
			const dischargeDate = moment().format("YYYY-MM-DDTHH:mm:ss");
			const updatedAdmissionData = { dischargeDate: dischargeDate };
			setLoading(true);
			await updateAdmission(admission.id, updatedAdmissionData);
			notification.success({
				message: t("common.success"),
				description: t("admission.notification.ended"), // i18n
			});
			await freeAllExpiredBeds();
			await fetchAdmissions();
		} catch (endError) {
			logError("[handleEndAdmission] Failed to end admission:", endError);
			notification.error({
				message: t("common.error"),
				// Assuming key: "admission.notification.endFailed": "Failed to end admission: {{message}}"
				description: t("admission.notification.endFailed", { message: endError.message || t("common.unknownError") }), // i18n - Use specific key
			});
		} finally {
			setLoading(false);
		}
	};

	// --- Delete Admission ---
	const handleDelete = async (admissionId) => {
		logDebug("[handleDelete] Deleting admission ID:", admissionId);
		Modal.confirm({
			title: t("admission.confirm.deleteTitle"), // i18n
			content: t("admission.confirm.deleteContent"), // i18n
			okText: t("admission.confirm.deleteOk"), // i18n
			okType: "danger",
			cancelText: t("admission.confirm.deleteCancel"), // i18n
			onOk: async () => {
				logDebug("[handleDelete] Deletion Confirmed for ID:", admissionId);
				try {
					setLoading(true);
					await deleteAdmission(admissionId);
					notification.success({
						message: t("common.success"),
						description: t("admission.notification.deleted"), // i18n
					});
					await fetchAdmissions();
				} catch (deleteError) {
					logError(t("admission.error.deleteFailed"), deleteError); // i18n
					notification.error({
						message: t("common.error"),
						// Assuming key: "admission.notification.deleteFailed": "Failed to delete admission: {{message}}"
						description: t("admission.notification.deleteFailed", { message: deleteError.message || t("common.unknownError") }), // i18n - Use specific key
					});
				} finally {
					setLoading(false);
				}
			},
			onCancel() {
				/* ... keep log ... */
			},
		});
	};

	// --- Search Filters (Keep logs) ---
	const handleSearchUnitFilter = (unitId) => {
		/* ... keep existing code ... */
	};
	const handleSearchRoomFilter = (roomId) => {
		/* ... keep existing code ... */
	};
	const handleSearchBedFilter = (bedId) => {
		/* ... keep existing code ... */
	};
	const handleSearchPatientFilter = (value) => {
		/* ... keep existing code ... */
	};

	// --- Table Change Handler (Keep logs) ---
	const handleTableChange = (pagination) => {
		/* ... keep existing code ... */
	};

	// --- Docs Toggle ---
	const toggleDocs = () => {
		setShowDocs(!showDocs);
	};

	// --- Define Columns (with i18n mapped to your JSON) ---
	const columns = [
		{
			title: t("admission.table.admissionDate"), // i18n
			dataIndex: "admissionDate",
			key: "admissionDate",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : t("common.notAvailable")), // i18n
		},
		{
			title: t("admission.table.dischargeDate"), // i18n
			dataIndex: "dischargeDate",
			key: "dischargeDate",
			render: (text) =>
				text ? (
					moment(text).format("YYYY-MM-DD HH:mm:ss")
				) : (
					<Typography.Text type="success">{t("admission.table.statusOpen")}</Typography.Text>
				), // i18n
		},
		{ title: t("admission.table.patient"), dataIndex: "patientName", key: "patientName" }, // i18n
		{ title: t("admission.table.admissionType"), dataIndex: "admissionTypeName", key: "admissionTypeName" }, // i18n
		{
			title: t("admission.table.bed"), // i18n
			dataIndex: "bedId",
			key: "bedId",
			render: (bedId) => {
				const bed = beds?.find((b) => b.id === bedId);
				return bed ? `${bed.bedNumber} (${t("common.room")}: ${bed.roomId || t("common.notAvailable")})` : t("common.notAvailable"); // i18n
			},
		},
		{
			title: t("admission.table.actions"), // i18n
			key: "actions",
			render: (text, record) => {
				const actionButtons = [];
				if (canUpdateAdmission) {
					actionButtons.push(
						<Button key="edit" type="primary" onClick={() => showModal(record)} size="small">
							{t("common.edit")} {/* i18n */}
						</Button>
					);
				}
				if (canDeleteAdmission) {
					actionButtons.push(
						<Button key="delete" type="danger" onClick={() => handleDelete(record.id)} size="small">
							{t("common.delete")} {/* i18n */}
						</Button>
					);
				}
				if (!record.dischargeDate) {
					actionButtons.push(
						<Button key="end" type="default" onClick={() => handleEndAdmission(record)} size="small">
							{t("admission.action.end")} {/* i18n */}
						</Button>
					);
				}
				return <Space size="small">{actionButtons}</Space>;
			},
		},
	].filter(Boolean);

	logDebug("Rendering JSX...");
	return (
		<div style={{ padding: getResponsivePadding() }}>
			<Title level={2} style={{ margin: getResponsiveMargin() }}>
				{t("admission.list.title")} {/* i18n */}
				<Button type="link" icon={<QuestionCircleOutlined />} onClick={toggleDocs} />
			</Title>

			{/* Docs Modal */}
			<Modal
				title={t("admission.docs.title")} // i18n
				open={showDocs}
				onCancel={toggleDocs}
				footer={[
					<Button key="close" onClick={toggleDocs}>
						{t("common.close")}
					</Button>,
				]} // i18n
				width="80%">
				<ReactMarkdown remarkPlugins={[remarkGfm]}>{admissionDocsContent}</ReactMarkdown>
			</Modal>

			{/* Search and Add Buttons */}
			<Space style={{ marginBottom: 16 }} direction={screens.xs ? "vertical" : "horizontal"} size="middle" wrap>
				<AutoComplete
					style={{ width: screens.xs ? "100%" : "300px" }}
					options={patientOptions}
					onSearch={handlePatientSearch}
					onSelect={handleSearchPatientFilter}
					placeholder={t("admission.search.patientPlaceholder")} // i18n
					allowClear
					filterOption={false}
					value={patientSearchTerm}
					onChange={(value) => setPatientSearchTerm(value)}
				/>
				<Space wrap>
					{canCreateAdmission && (
						<Button type="primary" onClick={() => showModal(null)}>
							{t("admission.action.addNew")} {/* i18n */}
						</Button>
					)}
					<Button type="primary" onClick={() => showTypeModal(null)}>
						{t("admission.action.manageTypes")} {/* i18n */}
					</Button>
				</Space>
			</Space>

			{/* Admission Table */}
			<Table
				columns={columns}
				dataSource={admissions}
				loading={loading}
				rowKey="id"
				pagination={{
					current: page + 1,
					pageSize: size,
					total: total,
					showSizeChanger: true,
					// Match variables in your JSON key common.pagination.totalItems
					showTotal: (total, range) => t("common.pagination.totalItems", { range0: range[0], range1: range[1], total: total }), // i18n
					onChange: handleTableChange,
				}}
				scroll={{ x: "max-content" }}
			/>

			{/* Modal for Adding/Editing Admissions */}
			<Modal
				title={selectedAdmission ? t("admission.modal.editTitle") : t("admission.modal.addTitle")} // i18n
				open={isModalVisible}
				onCancel={handleCancel}
				onOk={handleFormSubmit}
				// Use common.update and common.save for button text
				okText={selectedAdmission ? t("common.update") : t("common.save")} // i18n
				confirmLoading={loading}
				width={screens.xs ? "95%" : "80%"}
				style={{ maxWidth: screens.xs ? "95vw" : "900px" }}
				styles={{ body: { padding: getResponsivePadding() } }}
				destroyOnClose>
				<Form
					form={form}
					layout={screens.xs ? "vertical" : "horizontal"}
					labelCol={!screens.xs ? { span: 6 } : {}}
					wrapperCol={!screens.xs ? { span: 18 } : {}}>
					{/* Patient Selection */}
					<Form.Item
						label={t("admission.form.patientLabel")} // i18n
						name="patientId"
						rules={[{ required: true, message: t("admission.validation.patientRequired") }]} // i18n
					>
						<AutoComplete
							style={{ width: "100%" }}
							options={patientOptions}
							onSearch={handlePatientSearch}
							onSelect={handlePatientSelect}
							placeholder={t("admission.form.patientPlaceholder")} // i18n
							filterOption={false}>
							{selectedAdmission && selectedPatientId && !patientOptions.some((opt) => opt.value === selectedPatientId) && (
								<Option key={selectedPatientId} value={selectedPatientId}>
									{selectedAdmission.patientName || `${t("common.patientId", "Patient ID")}: ${selectedPatientId}`}{" "}
									{/* i18n - Provide default */}
								</Option>
							)}
						</AutoComplete>
					</Form.Item>

					{/* Admission Type */}
					<Form.Item
						label={t("admission.form.admissionTypeLabel")} // i18n
						name="admissionTypeId"
						rules={[{ required: true, message: t("admission.validation.admissionTypeRequired") }]} // i18n
					>
						<Select placeholder={t("admission.form.admissionTypePlaceholder")} style={{ width: "100%" }} loading={loading}>
							{" "}
							{/* i18n */}
							{admissionTypes?.map((type) => (
								<Option key={type.id} value={type.id}>
									{type.name}
								</Option>
							))}
						</Select>
					</Form.Item>

					{/* Unit Selection */}
					<Form.Item
						label={t("admission.form.unitLabel")} // i18n
						name="unitId"
						rules={[{ required: true, message: t("admission.validation.unitRequired") }]} // i18n
					>
						<Select
							placeholder={t("admission.form.unitPlaceholder")}
							onChange={handleUnitChangeModal}
							style={{ width: "100%" }}
							loading={loading}
							value={selectedUnit}>
							{" "}
							{/* i18n */}
							{units?.map((unit) => (
								<Option key={unit.id} value={unit.id}>
									{unit.name}
								</Option>
							))}
						</Select>
					</Form.Item>

					{/* Room Selection */}
					<Form.Item
						label={t("admission.form.roomLabel")} // i18n
						name="roomId"
						rules={[{ required: true, message: t("admission.validation.roomRequired") }]} // i18n
					>
						<Select
							placeholder={t("admission.form.roomPlaceholder")} // i18n
							onChange={handleRoomChangeModal}
							disabled={!selectedUnit || loading}
							style={{ width: "100%" }}
							loading={loading && selectedUnit}
							value={selectedRoom}>
							{filteredRooms?.map((room) => (
								<Option key={room.id} value={room.id}>
									{room.roomNumber}
								</Option>
							))}
						</Select>
					</Form.Item>

					{/* Bed Selection */}
					<Form.Item
						label={t("admission.form.bedLabel")} // i18n
						name="bedId"
						rules={[{ required: true, message: t("admission.validation.bedRequired") }]} // i18n
					>
						<Select
							placeholder={t("admission.form.bedPlaceholder")} // i18n
							disabled={!selectedRoom || loading}
							style={{ width: "100%" }}
							loading={loading && selectedRoom}>
							{filteredBeds?.map((bed) => (
								<Option key={bed.id} value={bed.id} disabled={bed.occupied && bed.id !== selectedAdmission?.bedId}>
									{bed.bedNumber}
									{bed.occupied && bed.id !== selectedAdmission?.bedId ? ` (${t("admission.form.bedOccupied")})` : ""} {/* i18n */}
								</Option>
							))}
						</Select>
					</Form.Item>

					{/* Admission Date */}
					<Form.Item
						label={t("admission.form.admissionDateLabel")} // i18n
						name="admissionDate"
						rules={[{ required: true, message: t("admission.validation.admissionDateRequired") }]} // i18n
					>
						<DatePicker showTime style={{ width: "100%" }} format="YYYY-MM-DD HH:mm:ss" />
					</Form.Item>
				</Form>
			</Modal>

			{/* Modal for Managing Admission Types */}
			<Modal
				title={selectedAdmissionType ? t("admission.typeModal.editTitle") : t("admission.typeModal.addTitle")} // i18n
				open={isTypeModalVisible}
				onCancel={handleTypeCancel}
				onOk={handleTypeFormSubmit}
				okText={selectedAdmissionType ? t("common.update") : t("common.save")} // i18n
				confirmLoading={loading}
				width={screens.xs ? "95%" : "80%"}
				style={{ maxWidth: screens.xs ? "95vw" : "600px" }}
				styles={{ body: { padding: getResponsivePadding() } }}
				destroyOnClose>
				<Form form={typeForm} layout="vertical">
					<Form.Item
						label={t("admission.typeForm.nameLabel")} // i18n
						name="name"
						rules={[{ required: true, message: t("admission.validation.typeNameRequired") }]} // i18n
					>
						<Input
							// Use label as placeholder if specific placeholder key is missing
							placeholder={t("admission.typeForm.namePlaceholder", t("admission.typeForm.nameLabel"))} // i18n - Provide default
							onChange={(e) => logDebug("[DEBUG AdmissionList Type Form] Name Input Changed:", e.target.value)}
							onBlur={() =>
								logDebug("[DEBUG AdmissionList Type Form] Name Input Blurred. Current form value:", typeForm.getFieldValue("name"))
							}
						/>
					</Form.Item>
					<Form.Item
						label={t("admission.typeForm.priceLabel")} // i18n
						name="price"
						rules={[
							{ required: true, message: t("admission.validation.typePriceRequired") }, // i18n
							{ type: "number", message: t("admission.validation.typePriceNumber") }, // i18n
						]}>
						<InputNumber
							style={{ width: "100%" }}
							// Use label as placeholder if specific placeholder key is missing
							placeholder={t("admission.typeForm.pricePlaceholder", t("admission.typeForm.priceLabel"))} // i18n - Provide default
							min={0}
							onChange={(value) => logDebug("[DEBUG AdmissionList Type Form] Price Input Changed:", value)}
							onBlur={() =>
								logDebug("[DEBUG AdmissionList Type Form] Price Input Blurred. Current form value:", typeForm.getFieldValue("price"))
							}
						/>
					</Form.Item>
				</Form>
				{/* List of Existing Admission Types */}
				<Title level={5} style={{ marginTop: "20px", marginBottom: "10px" }}>
					{t("admission.typeModal.existingTypesTitle")}
				</Title>{" "}
				{/* i18n */}
				<List
					itemLayout="horizontal"
					dataSource={admissionTypes}
					loading={loading}
					style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #f0f0f0", padding: "8px" }}
					renderItem={(item) => (
						<List.Item
							actions={[
								<Button type="link" onClick={() => showTypeModal(item)} size="small">
									{t("common.edit")}
								</Button>, // i18n
								<Button type="link" danger onClick={() => handleTypeDelete(item.id)} size="small">
									{t("common.delete")}
								</Button>, // i18n
							]}>
							<List.Item.Meta
								title={item.name}
								description={t("admission.typeModal.priceDescription", {
									price: item.price != null ? item.price.toFixed(2) : t("common.notAvailable"),
								})} // i18n
							/>
						</List.Item>
					)}
				/>
			</Modal>
		</div>
	);
};

export default AdmissionList;
