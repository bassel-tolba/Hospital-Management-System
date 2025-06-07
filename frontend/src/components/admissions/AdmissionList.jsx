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
const DEBUG_MODE = true;
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
	const { t } = useTranslation();
	const {
		admissions,
		admissionTypes,
		loading,
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
	const { hasAuthority } = useAuthStore();

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
	const canUpdateAdmission = hasAuthority("UPDATE_ADMISSION");
	const canDeleteAdmission = hasAuthority("DELETE_ADMISSION");
	const [showDocs, setShowDocs] = useState(false);
	const screens = useBreakpoint();
	const getResponsivePadding = () => (screens.xs ? "8px" : screens.sm ? "12px" : "24px");
	const getResponsiveMargin = () => (screens.xs ? "8px 0" : screens.sm ? "12px 0" : "24px 16px");

	const fetchAdmissions = async () => {
		logDebug("[fetchAdmissions] Starting fetch with params:", { ...searchParams, page, size });
		setLoading(true);
		try {
			await searchAdmissions({ ...searchParams, page, size });
		} catch (fetchError) {
			logError("[fetchAdmissions] Search FAILED:", fetchError);
			notification.error({
				message: t("common.error"),
				description: t("admission.notification.fetchFailed", { message: fetchError.message }),
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAllAdmissionTypes().catch((fetchError) => logError(t("admission.error.fetchTypesFailed"), fetchError));
		fetchAllUnits();
		fetchAllRooms();
		searchBeds({ size: 1000 }).catch((error) => logError(t("admission.error.fetchBedsMount"), error));
	}, [fetchAllAdmissionTypes, fetchAllUnits, fetchAllRooms, searchBeds, t]);

	useEffect(() => {
		fetchAdmissions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, size, searchParams]);

	const showModal = (admission) => {
		logDebug("[showModal Main] Opening modal for admission:", admission);
		setSelectedAdmission(admission);
		if (admission) {
			const bed = beds?.find((b) => b.id === admission.bedId);
			const room = bed ? rooms?.content?.find((r) => r.id === bed.roomId) : null;
			const unitId = room?.unitId;
			const roomId = bed?.roomId;

			setSelectedUnit(unitId);
			setSelectedRoom(roomId);
			setSelectedPatientId(admission.patientId);

			if (unitId) {
				setFilteredRooms(rooms?.content?.filter((r) => r.unitId === unitId) || []);
			}
			if (unitId && roomId) {
				fetchFilteredBeds(unitId, roomId, admission.bedId);
			}

			form.setFieldsValue({
				patientId: admission.patientId,
				admissionDate: admission.admissionDate ? moment(admission.admissionDate) : null,
				admissionTypeId: admission.admissionTypeId,
				bedId: admission.bedId,
				unitId: unitId,
				roomId: roomId,
			});
		} else {
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
	};

	const handleCancel = () => {
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

	const handleUnitChangeModal = (unitId) => {
		logDebug("[handleUnitChangeModal] Unit changed to:", unitId);
		setSelectedUnit(unitId);
		setSelectedRoom(null);
		setFilteredBeds([]);

		form.setFieldsValue({ roomId: null, bedId: null });

		if (unitId) {
			const availableRooms = rooms?.content?.filter((r) => r.unitId === unitId) || [];
			setFilteredRooms(availableRooms);
		} else {
			setFilteredRooms([]);
		}
	};

	const handleRoomChangeModal = (roomId) => {
		logDebug("[handleRoomChangeModal] Room changed to:", roomId);
		setSelectedRoom(roomId);
		setFilteredBeds([]);

		form.setFieldsValue({ bedId: null });

		if (roomId && selectedUnit) {
			fetchFilteredBeds(selectedUnit, roomId);
		}
	};

	const fetchFilteredBeds = async (unitId, roomId, currentBedId = null) => {
		logDebug("[fetchFilteredBeds] Fetching for Unit:", unitId, "Room:", roomId);
		if (!unitId || !roomId) {
			setFilteredBeds([]);
			return;
		}
		try {
			const response = await searchBeds({ unitId, roomId, size: 100 });
			let bedData = response?.content || [];
			// In edit mode, we want to show the currently assigned bed even if it's occupied.
			// The <Option> component's `disabled` prop will handle interactivity.
			if (currentBedId) {
				const currentBed = beds.find((b) => b.id === currentBedId);
				if (currentBed && !bedData.some((b) => b.id === currentBedId)) {
					bedData.push(currentBed);
				}
			}
			setFilteredBeds(bedData);
		} catch (error) {
			logError(t("admission.error.fetchFilteredBedsFailed"), error);
			setFilteredBeds([]);
		}
	};

	const handleFormSubmit = async () => {
		logDebug("[handleFormSubmit Main] Attempting main form submission...");
		try {
			const values = await form.validateFields();
			const patientIdToSubmit = selectedPatientId || values.patientId;
			if (!patientIdToSubmit) {
				notification.error({
					message: t("common.error"),
					description: t("admission.notification.patientRequired", "Patient selection is required."),
				});
				return;
			}
			const formattedAdmissionDate = values.admissionDate ? values.admissionDate.format("YYYY-MM-DDTHH:mm:ss") : null;
			const admissionData = { ...values, admissionDate: formattedAdmissionDate, patientId: patientIdToSubmit };
			delete admissionData.unitId;
			delete admissionData.roomId;
			setLoading(true);
			if (selectedAdmission) {
				await updateAdmission(selectedAdmission.id, admissionData);
				notification.success({ message: t("common.success"), description: t("admission.notification.updated") });
			} else {
				await createAdmission(admissionData);
				notification.success({ message: t("common.success"), description: t("admission.notification.created") });
			}
			await freeAllExpiredBeds();
			await fetchAdmissions();
			handleCancel();
		} catch (errorInfo) {
			logError("[handleFormSubmit Main] FAILED.", errorInfo);
			if (errorInfo && errorInfo.errorFields) {
				notification.error({ message: t("common.validationError"), description: t("admission.notification.checkFormFields") });
			} else {
				notification.error({
					message: t("common.saveError"),
					description: t("admission.notification.saveFailed", { message: errorInfo.message || t("common.unknownError") }),
				});
			}
		} finally {
			setLoading(false);
		}
	};

	const handleEndAdmission = async (admission) => {
		logDebug("[handleEndAdmission] Ending admission:", admission);
		Modal.confirm({
			title: t("admission.confirm.endAdmissionTitle", "End this Admission?"),
			content: t(
				"admission.confirm.endAdmissionContent",
				"This will mark the patient as discharged and free the bed. This action cannot be undone."
			),
			okText: t("admission.confirm.endAdmissionOk", "Yes, End Admission"),
			okType: "primary",
			cancelText: t("common.cancel"),
			onOk: async () => {
				try {
					const dischargeDate = moment().format("YYYY-MM-DDTHH:mm:ss");
					setLoading(true);
					await updateAdmission(admission.id, { dischargeDate });
					notification.success({ message: t("common.success"), description: t("admission.notification.ended") });
					await freeAllExpiredBeds();
					await fetchAdmissions();
				} catch (endError) {
					logError("[handleEndAdmission] Failed to end admission:", endError);
					notification.error({
						message: t("common.error"),
						description: t("admission.notification.endFailed", { message: endError.message || t("common.unknownError") }),
					});
				} finally {
					setLoading(false);
				}
			},
		});
	};

	const handleDelete = async (admissionId) => {
		logDebug("[handleDelete] Deleting admission ID:", admissionId);
		Modal.confirm({
			title: t("admission.confirm.deleteTitle"),
			content: t("admission.confirm.deleteContent"),
			okText: t("admission.confirm.deleteOk"),
			okType: "danger",
			cancelText: t("admission.confirm.deleteCancel"),
			onOk: async () => {
				try {
					setLoading(true);
					await deleteAdmission(admissionId);
					notification.success({ message: t("common.success"), description: t("admission.notification.deleted") });
					await fetchAdmissions();
				} catch (deleteError) {
					logError(t("admission.error.deleteFailed"), deleteError);
					notification.error({
						message: t("common.error"),
						description: t("admission.notification.deleteFailed", { message: deleteError.message || t("common.unknownError") }),
					});
				} finally {
					setLoading(false);
				}
			},
		});
	};

	const handlePatientSearch = async (value) => {
		setPatientSearchTerm(value);
		if (value && value.length > 1) {
			try {
				const searchResults = await searchPatients({ searchTerm: value, page: 0, size: 10 });
				const options = searchResults?.content?.map((p) => ({ label: `${p.firstName} ${p.lastName} (ID: ${p.id})`, value: p.id })) || [];
				setPatientOptions(options);
			} catch (error) {
				setPatientOptions([]);
			}
		} else {
			setPatientOptions([]);
		}
	};

	const handlePatientSelect = (patientId) => {
		setSelectedPatientId(patientId);
		form.setFieldsValue({ patientId });
	};

	const handleTableChange = (pagination) => {
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	const toggleDocs = () => setShowDocs(!showDocs);

	const columns = [
		{
			title: t("admission.table.admissionDate"),
			dataIndex: "admissionDate",
			key: "admissionDate",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : t("common.notAvailable")),
		},
		{
			title: t("admission.table.dischargeDate"),
			dataIndex: "dischargeDate",
			key: "dischargeDate",
			render: (text) =>
				text ? moment(text).format("YYYY-MM-DD HH:mm") : <Typography.Text type="success">{t("admission.table.statusOpen")}</Typography.Text>,
		},
		{ title: t("admission.table.patient"), dataIndex: "patientName", key: "patientName" },
		{ title: t("admission.table.admissionType"), dataIndex: "admissionTypeName", key: "admissionTypeName" },
		{
			title: t("admission.table.bed"),
			dataIndex: "bedId",
			key: "bedId",
			render: (bedId) => {
				const bed = beds?.find((b) => b.id === bedId);
				return bed ? `${bed.bedNumber} (${t("common.room")}: ${bed.roomId || t("common.notAvailable")})` : t("common.notAvailable");
			},
		},
		{
			title: t("admission.table.actions"),
			key: "actions",
			render: (text, record) => {
				const actionButtons = [];
				if (canUpdateAdmission)
					actionButtons.push(
						<Button key="edit" type="primary" onClick={() => showModal(record)} size="small">
							{t("common.edit")}
						</Button>
					);
				if (!record.dischargeDate)
					actionButtons.push(
						<Button key="end" type="default" onClick={() => handleEndAdmission(record)} size="small">
							{t("admission.action.end")}
						</Button>
					);
				if (canDeleteAdmission)
					actionButtons.push(
						<Button key="delete" type="danger" onClick={() => handleDelete(record.id)} size="small">
							{t("common.delete")}
						</Button>
					);
				return <Space size="small">{actionButtons}</Space>;
			},
		},
	];

	// Admission Type Modal Logic... (Identical to your provided code, included for completeness)
	const showTypeModal = (admissionType) => {
		logDebug("[DEBUG AdmissionList Type Modal] showTypeModal called with:", admissionType);
		setSelectedAdmissionType(admissionType);
		if (admissionType) {
			typeForm.setFieldsValue(admissionType);
		} else {
			typeForm.resetFields();
		}
		setIsTypeModalVisible(true);
	};
	const handleTypeCancel = () => {
		logDebug("[DEBUG AdmissionList Type Modal] handleTypeCancel called.");
		setIsTypeModalVisible(false);
		setSelectedAdmissionType(null);
		typeForm.resetFields();
	};
	const handleTypeFormSubmit = async () => {
		logDebug("[DEBUG AdmissionList handleTypeFormSubmit] Attempting to submit type form...");
		try {
			const values = await typeForm.validateFields();
			setLoading(true);
			if (selectedAdmissionType) {
				await updateAdmissionType(selectedAdmissionType.id, values);
				notification.success({ message: t("common.success"), description: t("admission.notification.typeUpdated") });
			} else {
				await createAdmissionType(values);
				notification.success({ message: t("common.success"), description: t("admission.notification.typeCreated") });
			}
			await fetchAllAdmissionTypes();
			setIsTypeModalVisible(false);
			typeForm.resetFields();
			setSelectedAdmissionType(null);
		} catch (errorInfo) {
			if (errorInfo && errorInfo.errorFields) {
				notification.error({ message: t("common.validationError"), description: t("admission.notification.checkFormFields") });
			} else {
				notification.error({
					message: t("common.saveError"),
					description: t("admission.notification.typeSaveFailed", { message: errorInfo.message || t("common.unknownError") }),
				});
			}
		} finally {
			setLoading(false);
		}
	};
	const handleTypeDelete = async (admissionTypeId) => {
		Modal.confirm({
			title: t("admission.confirm.deleteTypeTitle"),
			content: t("admission.confirm.deleteContent"),
			okText: t("admission.confirm.deleteOk"),
			okType: "danger",
			cancelText: t("admission.confirm.deleteCancel"),
			onOk: async () => {
				try {
					setLoading(true);
					await deleteAdmissionType(admissionTypeId);
					notification.success({ message: t("common.success"), description: t("admission.notification.typeDeleted") });
					await fetchAllAdmissionTypes();
					if (selectedAdmissionType && selectedAdmissionType.id === admissionTypeId) {
						setSelectedAdmissionType(null);
						typeForm.resetFields();
					}
				} catch (deleteError) {
					notification.error({
						message: t("common.error"),
						description: t("admission.notification.typeDeleteFailed", { message: deleteError.message || t("common.unknownError") }),
					});
				} finally {
					setLoading(false);
				}
			},
		});
	};

	return (
		<div style={{ padding: getResponsivePadding() }}>
			<Title level={2} style={{ margin: getResponsiveMargin() }}>
				{t("admission.list.title")}
				<Button type="link" icon={<QuestionCircleOutlined />} onClick={toggleDocs} />
			</Title>

			<Modal
				title={t("admission.docs.title")}
				open={showDocs}
				onCancel={toggleDocs}
				footer={[
					<Button key="close" onClick={toggleDocs}>
						{t("common.close")}
					</Button>,
				]}
				width="80%">
				<ReactMarkdown remarkPlugins={[remarkGfm]}>{admissionDocsContent}</ReactMarkdown>
			</Modal>

			<Space style={{ marginBottom: 16 }} direction={screens.xs ? "vertical" : "horizontal"} size="middle" wrap>
				<AutoComplete
					style={{ width: screens.xs ? "100%" : "300px" }}
					options={patientOptions}
					onSearch={handlePatientSearch}
					onSelect={(value) => setSearchParams({ patientId: value })}
					placeholder={t("admission.search.patientPlaceholder")}
					allowClear
					onClear={() => setSearchParams({})}
					filterOption={false}
					value={patientSearchTerm}
					onChange={(value) => setPatientSearchTerm(value)}
				/>
				<Space wrap>
					{canCreateAdmission && (
						<Button type="primary" onClick={() => showModal(null)}>
							{t("admission.action.addNew")}
						</Button>
					)}
					<Button type="primary" onClick={() => showTypeModal(null)}>
						{t("admission.action.manageTypes")}
					</Button>
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
					showTotal: (total, range) => t("common.pagination.totalItems", { range0: range[0], range1: range[1], total: total }),
					onChange: handleTableChange,
				}}
				scroll={{ x: "max-content" }}
			/>

			<Modal
				title={selectedAdmission ? t("admission.modal.editTitle") : t("admission.modal.addTitle")}
				open={isModalVisible}
				onCancel={handleCancel}
				onOk={handleFormSubmit}
				okText={selectedAdmission ? t("common.update") : t("common.save")}
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
					<Form.Item
						label={t("admission.form.patientLabel")}
						name="patientId"
						rules={[{ required: true, message: t("admission.validation.patientRequired") }]}>
						<AutoComplete
							style={{ width: "100%" }}
							options={patientOptions}
							onSearch={handlePatientSearch}
							onSelect={handlePatientSelect}
							placeholder={t("admission.form.patientPlaceholder")}
							filterOption={false}>
							{selectedAdmission && selectedPatientId && !patientOptions.some((opt) => opt.value === selectedPatientId) && (
								<Option key={selectedPatientId} value={selectedPatientId}>
									{selectedAdmission.patientName || `${t("common.patientId")}: ${selectedPatientId}`}
								</Option>
							)}
						</AutoComplete>
					</Form.Item>
					<Form.Item
						label={t("admission.form.admissionTypeLabel")}
						name="admissionTypeId"
						rules={[{ required: true, message: t("admission.validation.admissionTypeRequired") }]}>
						<Select placeholder={t("admission.form.admissionTypePlaceholder")} style={{ width: "100%" }} loading={loading}>
							{admissionTypes?.map((type) => (
								<Option key={type.id} value={type.id}>
									{type.name}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						label={t("admission.form.unitLabel")}
						name="unitId"
						rules={[{ required: true, message: t("admission.validation.unitRequired") }]}>
						<Select
							placeholder={t("admission.form.unitPlaceholder")}
							onChange={handleUnitChangeModal}
							style={{ width: "100%" }}
							loading={loading}>
							{units?.map((unit) => (
								<Option key={unit.id} value={unit.id}>
									{unit.name}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						label={t("admission.form.roomLabel")}
						name="roomId"
						rules={[{ required: true, message: t("admission.validation.roomRequired") }]}>
						<Select
							placeholder={t("admission.form.roomPlaceholder")}
							onChange={handleRoomChangeModal}
							disabled={!selectedUnit}
							style={{ width: "100%" }}
							loading={loading && !!selectedUnit && filteredRooms.length === 0}>
							{filteredRooms?.map((room) => (
								<Option key={room.id} value={room.id}>
									{room.roomNumber}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						label={t("admission.form.bedLabel")}
						name="bedId"
						rules={[{ required: true, message: t("admission.validation.bedRequired") }]}>
						<Select
							placeholder={t("admission.form.bedPlaceholder")}
							disabled={!selectedRoom}
							style={{ width: "100%" }}
							loading={loading && !!selectedRoom && filteredBeds.length === 0}>
							{filteredBeds?.map((bed) => (
								<Option key={bed.id} value={bed.id} disabled={bed.occupied && bed.id !== selectedAdmission?.bedId}>
									{bed.bedNumber}
									{bed.occupied && bed.id !== selectedAdmission?.bedId ? ` (${t("admission.form.bedOccupied")})` : ""}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						label={t("admission.form.admissionDateLabel")}
						name="admissionDate"
						rules={[{ required: true, message: t("admission.validation.admissionDateRequired") }]}>
						<DatePicker showTime style={{ width: "100%" }} format="YYYY-MM-DD HH:mm:ss" />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title={selectedAdmissionType ? t("admission.typeModal.editTitle") : t("admission.typeModal.addTitle")}
				open={isTypeModalVisible}
				onCancel={handleTypeCancel}
				onOk={handleTypeFormSubmit}
				okText={selectedAdmissionType ? t("common.update") : t("common.save")}
				confirmLoading={loading}
				width={screens.xs ? "95%" : "80%"}
				style={{ maxWidth: screens.xs ? "95vw" : "600px" }}
				styles={{ body: { padding: getResponsivePadding() } }}
				destroyOnClose>
				<Form form={typeForm} layout="vertical">
					<Form.Item
						label={t("admission.typeForm.nameLabel")}
						name="name"
						rules={[{ required: true, message: t("admission.validation.typeNameRequired") }]}>
						<Input placeholder={t("admission.typeForm.namePlaceholder", t("admission.typeForm.nameLabel"))} />
					</Form.Item>
					<Form.Item
						label={t("admission.typeForm.priceLabel")}
						name="price"
						rules={[
							{ required: true, message: t("admission.validation.typePriceRequired") },
							{ type: "number", message: t("admission.validation.typePriceNumber") },
						]}>
						<InputNumber
							style={{ width: "100%" }}
							placeholder={t("admission.typeForm.pricePlaceholder", t("admission.typeForm.priceLabel"))}
							min={0}
						/>
					</Form.Item>
				</Form>
				<Title level={5} style={{ marginTop: "20px", marginBottom: "10px" }}>
					{t("admission.typeModal.existingTypesTitle")}
				</Title>
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
								</Button>,
								<Button type="link" danger onClick={() => handleTypeDelete(item.id)} size="small">
									{t("common.delete")}
								</Button>,
							]}>
							<List.Item.Meta
								title={item.name}
								description={t("admission.typeModal.priceDescription", {
									price: item.price != null ? item.price.toFixed(2) : t("common.notAvailable"),
								})}
							/>
						</List.Item>
					)}
				/>
			</Modal>
		</div>
	);
};

export default AdmissionList;
