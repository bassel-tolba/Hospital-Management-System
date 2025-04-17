// src/components/admissions/AdmissionList.js

import React, { useState, useEffect } from "react";
import {
	Table,
	Input,
	Button,
	Space,
	Typography,
	Modal,
	Form,
	DatePicker,
	Select,
	AutoComplete,
	notification,
	List,
	Grid,
	InputNumber,
	Result, // Import Result for permission denied message
} from "antd";
import { useAdmissionStore } from "../../services/admission.service";
import { usePatientStore } from "../../services/patient.service";
import { useBedStore } from "../../services/bed.service";
import { useRoomStore } from "../../services/room.service";
import { useUnitStore } from "../../services/unit.service";
import { useAuthStore } from "../../services/auth.service";
import { QuestionCircleOutlined, LockOutlined } from "@ant-design/icons"; // Import LockOutlined
import moment from "moment";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import admissionDocsContent from "../../docs/admission";
import { useTranslation } from "react-i18next"; // Import useTranslation

const { Title } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const AdmissionList = () => {
	const { t } = useTranslation(); // Instantiate useTranslation
	const {
		admissions,
		admissionTypes,
		loading,
		error, // Keep error state from store if needed elsewhere
		total,
		searchAdmissions,
		deleteAdmission,
		createAdmission,
		updateAdmission,
		setLoading,
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

	// --- Permission Checks ---
	const canReadAdmission = user && hasAuthority("READ_ADMISSION");
	const canCreateAdmission = user && hasAuthority("CREATE_ADMISSION");
	const canUpdateAdmission = user && hasAuthority("UPDATE_ADMISSION");
	const canDeleteAdmission = user && hasAuthority("DELETE_ADMISSION");
	const canManageAdmissionTypes = user && hasAuthority("MANAGE_ADMISSION_TYPES"); // Assuming a new permission
	// --- End Permission Checks ---

	const [showDocs, setShowDocs] = useState(false);

	const screens = useBreakpoint();

	const getResponsivePadding = () => (screens.xs ? "8px" : screens.sm ? "12px" : "24px");
	const getResponsiveMargin = () => (screens.xs ? "8px 0" : screens.sm ? "12px 0" : "24px 16px");

	useEffect(() => {
		if (canManageAdmissionTypes || canCreateAdmission || canUpdateAdmission) {
			fetchAllAdmissionTypes();
		}
	}, [fetchAllAdmissionTypes, canManageAdmissionTypes, canCreateAdmission, canUpdateAdmission]);

	useEffect(() => {
		if (canReadAdmission || canCreateAdmission || canUpdateAdmission) {
			fetchAllUnits();
			fetchAllRooms();
			const fetchAllBeds = async () => {
				try {
					await searchBeds({ size: 1000 });
				} catch (err) {
					// Changed variable name
					console.error(t("admission.error.fetchBedsMount"), err); // Use translated console error
				}
			};
			fetchAllBeds();
		}
	}, [fetchAllUnits, fetchAllRooms, searchBeds, canReadAdmission, canCreateAdmission, canUpdateAdmission, t]); // Added t dependency

	useEffect(() => {
		if (canReadAdmission) {
			fetchAdmissions();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, size, searchParams, canReadAdmission]); // Add canReadAdmission dependency

	const fetchAdmissions = async () => {
		if (!canReadAdmission) return;
		setLoading(true);
		try {
			await searchAdmissions({ ...searchParams, page, size });
		} catch (err) {
			notification.error({
				message: t("error"), // Use existing translation
				description: `${t("admission.notification.fetchFailedPrefix")} ${err.message}`, // Translate prefix
			});
		} finally {
			setLoading(false);
		}
	};

	const showModal = (admission) => {
		if (admission && !canUpdateAdmission) {
			notification.warning({
				message: t("admission.notification.permissionDeniedTitle"),
				description: t("admission.notification.permissionDeniedEdit"),
			});
			return;
		}
		if (!admission && !canCreateAdmission) {
			notification.warning({
				message: t("admission.notification.permissionDeniedTitle"),
				description: t("admission.notification.permissionDeniedAdd"),
			});
			return;
		}

		setSelectedAdmission(admission);
		if (admission) {
			const bed = beds?.find((bed) => bed.id === admission.bedId);
			const room = rooms?.content?.find((room) => room.id === bed?.roomId);
			const unitId = room?.unitId;
			setSelectedUnit(unitId);
			setSelectedRoom(bed?.roomId);
			setSelectedPatientId(admission.patientId);

			if (unitId) {
				fetchFilteredBeds(unitId, bed?.roomId);
				setFilteredRooms(rooms?.content?.filter((r) => r.unitId === unitId));
			} else {
				setFilteredRooms([]);
				setFilteredBeds([]);
			}

			form.setFieldsValue({
				...admission,
				admissionDate: admission.admissionDate ? moment(admission.admissionDate) : null,
				unitId: unitId,
				roomId: bed?.roomId,
				bedId: bed?.id,
				patientId: admission.patientId,
				admissionTypeId: admission.admissionTypeId,
			});
			if (admission.patientId && admission.patientName) {
				setPatientOptions([{ label: admission.patientName, value: admission.patientId }]);
				setPatientSearchTerm(admission.patientName);
			} else {
				setPatientOptions([]);
				setPatientSearchTerm("");
			}
		} else {
			form.resetFields();
			setSelectedUnit(null);
			setSelectedRoom(null);
			setFilteredRooms([]);
			setFilteredBeds([]);
			setSelectedPatientId(null);
			setPatientSearchTerm("");
			setPatientOptions([]);
		}
		setIsModalVisible(true);
	};

	const showTypeModal = (admissionType) => {
		if (!canManageAdmissionTypes) {
			notification.warning({
				message: t("admission.notification.permissionDeniedTitle"),
				description: t("admission.notification.permissionDeniedManageTypes"),
			});
			return;
		}
		setSelectedAdmissionType(admissionType);
		if (admissionType) {
			typeForm.setFieldsValue(admissionType);
		} else {
			typeForm.resetFields();
		}
		setIsTypeModalVisible(true);
	};

	const handleTypeCancel = () => {
		setIsTypeModalVisible(false);
		setSelectedAdmissionType(null);
		typeForm.resetFields();
	};

	const handleCancel = () => {
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

	const handlePatientSearch = async (value) => {
		setPatientSearchTerm(value);
		if (value) {
			try {
				const searchResults = await searchPatients({
					searchTerm: value,
					page: 0,
					size: 10,
				});
				setPatientOptions(
					searchResults?.content?.map((patient) => ({
						label: `${patient.firstName} ${patient.lastName}`,
						value: patient.id,
					})) || []
				);
			} catch (err) {
				console.error(t("admission.error.patientSearchFailed"), err); // Translate console error
				setPatientOptions([]);
			}
		} else {
			setPatientOptions([]);
		}
	};

	const handlePatientSelect = (patientId, option) => {
		setSelectedPatientId(patientId);
		if (option) {
			setPatientSearchTerm(option.label);
		}
	};

	const fetchFilteredBeds = async (unitId, roomId) => {
		try {
			const response = await searchBeds({ unitId, roomId, isOccupied: false, size: 1000 }); // Also fetch available beds
			// Combine with the current bed if editing and it was occupied
			const currentBed = selectedAdmission && selectedAdmission.bedId ? beds?.find((b) => b.id === selectedAdmission.bedId) : null;
			let allFilteredBeds = response?.content || [];
			if (currentBed && !allFilteredBeds.some((b) => b.id === currentBed.id)) {
				allFilteredBeds = [currentBed, ...allFilteredBeds]; // Add current bed if not already present
			}
			setFilteredBeds(allFilteredBeds);
		} catch (err) {
			console.error(t("admission.error.fetchFilteredBedsFailed"), err); // Translate console error
			setFilteredBeds([]);
		}
	};

	const handleUnitChangeModal = async (unitId) => {
		setSelectedUnit(unitId);
		setSelectedRoom(null);
		setFilteredBeds([]);
		form.setFieldsValue({ ...form.getFieldsValue(), roomId: null, bedId: null });
		if (rooms?.content) {
			setFilteredRooms(rooms?.content?.filter((room) => room.unitId === unitId));
		}
	};

	const handleRoomChangeModal = async (roomId) => {
		setSelectedRoom(roomId);
		form.setFieldsValue({ ...form.getFieldsValue(), bedId: null });
		if (selectedUnit && roomId) {
			fetchFilteredBeds(selectedUnit, roomId);
		} else {
			setFilteredBeds([]);
		}
	};

	const handleTypeFormSubmit = async () => {
		if (!canManageAdmissionTypes) return;
		try {
			const values = await typeForm.validateFields();
			setLoading(true);
			if (selectedAdmissionType) {
				await updateAdmissionType(selectedAdmissionType.id, values);
				notification.success({
					message: t("success"), // Use existing translation
					description: t("admission.notification.typeUpdated"),
				});
			} else {
				await createAdmissionType(values);
				notification.success({
					message: t("success"),
					description: t("admission.notification.typeCreated"),
				});
			}
			setIsTypeModalVisible(false);
			typeForm.resetFields();
			setSelectedAdmissionType(null);
			fetchAllAdmissionTypes();
		} catch (err) {
			notification.error({
				message: t("error"),
				description: `${t("admission.notification.typeSaveFailedPrefix")} ${err?.message || t("common.unknownError")}`, // Use translated unknownError
			});
			console.error(t("admission.error.saveTypeFailed"), err); // Translate console error
		} finally {
			setLoading(false);
		}
	};

	const handleTypeDelete = async (admissionTypeId) => {
		if (!canManageAdmissionTypes) return;
		try {
			setLoading(true);
			await deleteAdmissionType(admissionTypeId);
			notification.success({
				message: t("success"),
				description: t("admission.notification.typeDeleted"),
			});
			fetchAllAdmissionTypes();
		} catch (err) {
			notification.error({
				message: t("error"),
				description: `${t("admission.notification.typeDeleteFailedPrefix")} ${err?.message || t("common.unknownError")}`,
			});
			console.error(t("admission.error.deleteTypeFailed"), err); // Translate console error
		} finally {
			setLoading(false);
		}
	};

	const handleFormSubmit = async () => {
		if ((selectedAdmission && !canUpdateAdmission) || (!selectedAdmission && !canCreateAdmission)) {
			notification.error({
				message: t("admission.notification.permissionDeniedTitle"),
				description: t("admission.notification.permissionDeniedAction"),
			});
			return;
		}
		try {
			const values = await form.validateFields();
			const formattedAdmissionDate = values.admissionDate ? values.admissionDate.toISOString() : null;

			const admissionData = {
				patientId: selectedPatientId,
				admissionTypeId: values.admissionTypeId,
				bedId: values.bedId,
				admissionDate: formattedAdmissionDate,
			};
			setLoading(true);
			if (selectedAdmission) {
				await updateAdmission(selectedAdmission.id, admissionData);
				notification.success({
					message: t("success"),
					description: t("admission.notification.updated"),
				});
			} else {
				await createAdmission(admissionData);
				notification.success({
					message: t("success"),
					description: t("admission.notification.created"),
				});
			}

			await freeAllExpiredBeds(); // Should ideally have its own permission check in the store/backend
			fetchAdmissions();
			setIsModalVisible(false);
			handleCancel();
		} catch (err) {
			notification.error({
				message: t("error"),
				description: `${t("admission.notification.saveFailedPrefix")} ${err?.message || t("common.unknownError")}`,
			});
			console.error(t("admission.error.saveFailed"), err); // Translate console error
		} finally {
			setLoading(false);
		}
	};

	const handleEndAdmission = async (admission) => {
		if (!canUpdateAdmission) {
			notification.warning({
				message: t("admission.notification.permissionDeniedTitle"),
				description: t("admission.notification.permissionDeniedUpdate"),
			});
			return;
		}
		try {
			setLoading(true);
			const dischargeDate = moment().toISOString();
			const updatedAdmissionData = {
				dischargeDate: dischargeDate,
				patientId: admission.patientId,
				admissionTypeId: admission.admissionTypeId,
				bedId: admission.bedId,
				admissionDate: admission.admissionDate,
			};

			await updateAdmission(admission.id, updatedAdmissionData);
			notification.success({
				message: t("success"),
				description: t("admission.notification.ended"),
			});

			await freeAllExpiredBeds();
			fetchAdmissions();
		} catch (err) {
			notification.error({
				message: t("error"),
				description: `${t("admission.notification.endFailedPrefix")} ${err.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (admissionId) => {
		if (!canDeleteAdmission) {
			notification.warning({
				message: t("admission.notification.permissionDeniedTitle"),
				description: t("admission.notification.permissionDeniedDelete"),
			});
			return;
		}
		Modal.confirm({
			title: t("admission.confirm.deleteTitle"),
			content: t("admission.confirm.deleteContent"),
			okText: t("admission.confirm.deleteOk"),
			okType: "danger",
			cancelText: t("admission.confirm.deleteCancel"), // Use existing "no" translation? Let's make specific
			onOk: async () => {
				try {
					setLoading(true);
					await deleteAdmission(admissionId);
					notification.success({
						message: t("success"),
						description: t("admission.notification.deleted"),
					});
					fetchAdmissions();
				} catch (err) {
					notification.error({
						message: t("error"),
						description: `${t("admission.notification.deleteFailedPrefix")} ${err?.message || t("common.unknownError")}`,
					});
					console.error(t("admission.error.deleteFailed"), err); // Translate console error
				} finally {
					setLoading(false);
				}
			},
		});
	};

	const handleSearchPatientFilter = (value) => {
		setSearchParams({ ...searchParams, patientId: value });
		setPage(0);
	};

	const handleTableChange = (pagination) => {
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	const toggleDocs = () => {
		setShowDocs(!showDocs);
	};

	const getActionColumn = () => {
		if (!canUpdateAdmission && !canDeleteAdmission) {
			return null;
		}

		return {
			title: t("admission.table.actions"), // Translate
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{canUpdateAdmission && (
						<Button key="edit" type="link" onClick={() => showModal(record)} style={{ padding: 0 }}>
							{t("common.edit")}
						</Button>
					)}
					{canUpdateAdmission &&
						record.dischargeDate === null && ( // Only show 'End' if not already discharged
							<Button key="end" type="link" onClick={() => handleEndAdmission(record)} style={{ padding: 0 }}>
								{t("admission.action.end")}
							</Button>
						)}
					{canDeleteAdmission && (
						<Button key="delete" type="link" danger onClick={() => handleDelete(record.id)} style={{ padding: 0 }}>
							{t("common.delete")}
						</Button>
					)}
				</Space>
			),
		};
	};

	const columns = [
		{
			title: t("admission.table.admissionDate"), // Translate
			dataIndex: "admissionDate",
			key: "admissionDate",
			render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
		},
		{
			title: t("admission.table.dischargeDate"), // Translate
			dataIndex: "dischargeDate",
			key: "dischargeDate",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : t("admission.table.statusOpen")), // Translate 'Open'
		},
		{ title: t("admission.table.patient"), dataIndex: "patientName", key: "patientName" }, // Translate
		{ title: t("admission.table.admissionType"), dataIndex: "admissionTypeName", key: "admissionTypeName" }, // Translate
		{
			title: t("admission.table.bed"), // Translate
			dataIndex: "bedId",
			key: "bedId",
			render: (bedId) => {
				const bed = beds?.find((b) => b.id === bedId);
				return bed ? bed.bedNumber : t("common.notAvailable"); // Translate 'N/A'
			},
		},
		getActionColumn(),
	].filter(Boolean);

	// --- Render Section ---

	if (!canReadAdmission) {
		return (
			<div style={{ padding: getResponsivePadding(), textAlign: "center" }}>
				<Result
					status="403"
					title={t("common.permissionDenied403Title")} // Translate
					subTitle={t("common.permissionDenied403Subtitle")} // Translate
					icon={<LockOutlined />}
				/>
			</div>
		);
	}

	return (
		<div style={{ padding: getResponsivePadding() }}>
			<Title level={2} style={{ margin: getResponsiveMargin() }}>
				{t("admission.list.title")} {/* Translate */}
				<Button type="link" icon={<QuestionCircleOutlined />} onClick={toggleDocs} aria-label={t("common.viewDocumentation")} />{" "}
				{/* Add aria-label */}
			</Title>

			<Modal
				title={t("admission.docs.title")} // Translate
				open={showDocs}
				onCancel={toggleDocs}
				footer={[
					<Button key="close" onClick={toggleDocs}>
						{t("common.close")} {/* Translate */}
					</Button>,
				]}
				width="80%">
				<ReactMarkdown remarkPlugins={[remarkGfm]}>{admissionDocsContent}</ReactMarkdown>
			</Modal>

			<Space style={{ marginBottom: 16 }} direction={screens.xs ? "vertical" : "horizontal"} wrap size="middle">
				<AutoComplete
					style={{ width: screens.xs ? "100%" : "300px" }}
					options={patientOptions}
					onSearch={handlePatientSearch}
					placeholder={t("admission.search.patientPlaceholder")} // Translate
					filterOption={false}
					onSelect={handleSearchPatientFilter}
					allowClear
				/>
				<Space wrap>
					{canCreateAdmission && (
						<Button type="primary" onClick={() => showModal(null)}>
							{t("admission.action.addNew")} {/* Translate */}
						</Button>
					)}
					{canManageAdmissionTypes && (
						<Button type="default" onClick={() => showTypeModal(null)}>
							{t("admission.action.manageTypes")} {/* Translate */}
						</Button>
					)}
				</Space>
			</Space>

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
					pageSizeOptions: ["10", "20", "50", "100"],
					showTotal: (total, range) => t("common.pagination.totalItems", { range0: range[0], range1: range[1], total: total }), // Translate
				}}
				onChange={handleTableChange}
				scroll={{ x: "max-content" }}
			/>

			<Modal
				title={selectedAdmission ? t("admission.modal.editTitle") : t("admission.modal.addTitle")} // Translate
				open={isModalVisible}
				onCancel={handleCancel}
				okButtonProps={{
					disabled: loading || (selectedAdmission ? !canUpdateAdmission : !canCreateAdmission),
					loading: loading,
				}}
				okText={selectedAdmission ? t("common.update") : t("common.save")} // Use common translations
				cancelText={t("common.cancel")} // Use common translation
				onOk={handleFormSubmit}
				width={screens.xs ? "95%" : "80%"}
				style={{ maxWidth: screens.xs ? "95vw" : "900px" }}
				bodyStyle={{ padding: getResponsivePadding() }}
				destroyOnClose>
				<Form form={form} layout={screens.xs ? "vertical" : "horizontal"} name="admission_form">
					<Form.Item
						labelCol={!screens.xs ? { span: 6 } : {}}
						wrapperCol={!screens.xs ? { span: 18 } : {}}
						label={t("admission.form.patientLabel")} // Translate
						name="patientId"
						rules={[{ required: true, message: t("admission.validation.patientRequired") }]} // Translate
						initialValue={selectedPatientId}
						style={{ width: "100%" }}>
						<AutoComplete
							style={{ width: "100%" }}
							options={patientOptions}
							onSearch={handlePatientSearch}
							placeholder={t("admission.form.patientPlaceholder")} // Translate
							filterOption={false}
							onSelect={handlePatientSelect}
							value={patientSearchTerm}
							onChange={(data) => setPatientSearchTerm(data)}
							allowClear
						/>
					</Form.Item>
					<Form.Item
						labelCol={!screens.xs ? { span: 6 } : {}}
						wrapperCol={!screens.xs ? { span: 18 } : {}}
						label={t("admission.form.admissionTypeLabel")} // Translate
						name="admissionTypeId"
						rules={[{ required: true, message: t("admission.validation.admissionTypeRequired") }]} // Translate
						style={{ width: "100%" }}>
						<Select
							placeholder={t("admission.form.admissionTypePlaceholder")} // Translate
							style={{ width: "100%" }}
							loading={loading && !admissionTypes?.length}>
							{admissionTypes?.map((type) => (
								<Option key={type.id} value={type.id}>
									{type.name}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						labelCol={!screens.xs ? { span: 6 } : {}}
						wrapperCol={!screens.xs ? { span: 18 } : {}}
						label={t("admission.form.unitLabel")} // Translate
						name="unitId"
						rules={[{ required: true, message: t("admission.validation.unitRequired") }]} // Translate
						style={{ width: "100%" }}>
						<Select
							placeholder={t("admission.form.unitPlaceholder")} // Translate
							onChange={handleUnitChangeModal}
							value={selectedUnit}
							style={{ width: "100%" }}
							loading={loading && !units?.length}>
							{units?.map((unit) => (
								<Option key={unit.id} value={unit.id}>
									{unit.name}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						labelCol={!screens.xs ? { span: 6 } : {}}
						wrapperCol={!screens.xs ? { span: 18 } : {}}
						label={t("admission.form.roomLabel")} // Translate
						name="roomId"
						rules={[{ required: true, message: t("admission.validation.roomRequired") }]} // Translate
						style={{ width: "100%" }}>
						<Select
							placeholder={t("admission.form.roomPlaceholder")} // Translate
							onChange={handleRoomChangeModal}
							disabled={!selectedUnit}
							value={selectedRoom}
							style={{ width: "100%" }}
							loading={loading && selectedUnit && !filteredRooms?.length}>
							{filteredRooms?.map((room) => (
								<Option key={room.id} value={room.id}>
									{room.roomNumber}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						labelCol={!screens.xs ? { span: 6 } : {}}
						wrapperCol={!screens.xs ? { span: 18 } : {}}
						label={t("admission.form.bedLabel")} // Translate
						name="bedId"
						rules={[{ required: true, message: t("admission.validation.bedRequired") }]} // Translate
						style={{ width: "100%" }}>
						<Select
							placeholder={t("admission.form.bedPlaceholder")} // Translate
							disabled={!selectedRoom}
							style={{ width: "100%" }}
							loading={loading && selectedRoom && !filteredBeds?.length}>
							{filteredBeds?.map((bed) => (
								<Option key={bed.id} value={bed.id} disabled={bed.occupied && bed.id !== selectedAdmission?.bedId}>
									{bed.bedNumber}{" "}
									{bed.occupied && bed.id !== selectedAdmission?.bedId ? `(${t("admission.form.bedOccupied")})` : ""}{" "}
									{/* Translate */}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						labelCol={!screens.xs ? { span: 6 } : {}}
						wrapperCol={!screens.xs ? { span: 18 } : {}}
						label={t("admission.form.admissionDateLabel")} // Translate
						name="admissionDate"
						rules={[{ required: true, message: t("admission.validation.admissionDateRequired") }]} // Translate
						style={{ width: "100%" }}>
						<DatePicker showTime style={{ width: "100%" }} format="YYYY-MM-DD HH:mm:ss" />
					</Form.Item>
				</Form>
			</Modal>

			{canManageAdmissionTypes && (
				<Modal
					title={selectedAdmissionType ? t("admission.typeModal.editTitle") : t("admission.typeModal.addTitle")} // Translate
					open={isTypeModalVisible}
					onCancel={handleTypeCancel}
					okButtonProps={{
						disabled: loading || !canManageAdmissionTypes,
						loading: loading,
					}}
					okText={selectedAdmissionType ? t("common.update") : t("common.save")} // Use common translations
					cancelText={t("common.cancel")} // Use common translation
					onOk={handleTypeFormSubmit}
					width={screens.xs ? "95%" : "80%"}
					style={{ maxWidth: screens.xs ? "95vw" : "600px" }}
					bodyStyle={{ padding: getResponsivePadding() }}
					destroyOnClose>
					<Form form={typeForm} layout="vertical" name="admission_type_form">
						<Form.Item
							label={t("admission.typeForm.nameLabel")} // Translate
							name="name"
							rules={[{ required: true, message: t("admission.validation.typeNameRequired") }]}>
							{" "}
							{/* Translate */}
							<Input />
						</Form.Item>
						<Form.Item
							label={t("admission.typeForm.priceLabel")} // Translate
							name="price"
							rules={[
								{ required: true, message: t("admission.validation.typePriceRequired") }, // Translate
								{ type: "number", message: t("admission.validation.typePriceNumber") }, // Translate
							]}>
							<InputNumber style={{ width: "100%" }} min={0} precision={2} />
						</Form.Item>
					</Form>

					<Title level={5} style={{ marginTop: "20px" }}>
						{t("admission.typeModal.existingTypesTitle")} {/* Translate */}
					</Title>
					<List
						itemLayout="horizontal"
						dataSource={admissionTypes}
						loading={loading}
						style={{ marginTop: "10px" }}
						renderItem={(item) => (
							<List.Item
								actions={
									canManageAdmissionTypes
										? [
												<Button type="link" key="edit-type" onClick={() => showTypeModal(item)} disabled={loading}>
													{t("common.edit")} {/* Use common translation */}
												</Button>,
												<Button
													type="link"
													key="delete-type"
													danger
													onClick={() => handleTypeDelete(item.id)}
													disabled={loading}>
													{t("common.delete")} {/* Use common translation */}
												</Button>,
										  ]
										: []
								}>
								<List.Item.Meta
									title={item.name}
									description={t("admission.typeModal.priceDescription", {
										price: item.price?.toFixed(2) ?? t("common.notAvailable"),
									})} // Translate with interpolation
								/>
							</List.Item>
						)}
					/>
				</Modal>
			)}
		</div>
	);
};

export default AdmissionList;
