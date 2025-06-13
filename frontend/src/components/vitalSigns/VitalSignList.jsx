// VitalSignList.js
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
	InputNumber,
	notification,
	AutoComplete,
	Pagination,
	Select,
	Row,
	Col,
	Spin,
} from "antd";
import { useAuthStore } from "../../services/auth.service";
import axios from "axios";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";
import { usePatientStore } from "../../services/patient.service";
import { useVitalSignStore } from "../../services/vitalSign.service";
import VoiceToVitalSigns from "../../components/ai/VoiceToVitalSigns";
import { useTranslation } from "react-i18next"; // Import useTranslation

const { Title } = Typography;

const VitalSignList = () => {
	const { t } = useTranslation(); // Initialize translation function
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedVitalSign, setSelectedVitalSign] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const [total, setTotal] = useState(0);
	const [patientOptions, setPatientOptions] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [selectedPatientId, setSelectedPatientId] = useState(null);
	const { patients, searchPatients } = usePatientStore();
	const { createVitalSign, updateVitalSign, deleteVitalSign, loading, setVitalSigns, vitalSigns } = useVitalSignStore();

	const { user, hasAuthority } = useAuthStore();
	const API_BASE_URL = `http://localhost:8080/api/vital-signs`;

	const canReadVitalSigns = user && hasAuthority("READ_VITAL_SIGN");
	const canCreateVitalSigns = user && hasAuthority("CREATE_VITAL_SIGN");
	const canUpdateVitalSigns = user && hasAuthority("UPDATE_VITAL_SIGN");
	const canDeleteVitalSigns = user && hasAuthority("DELETE_VITAL_SIGN");

	const canSubmitModal = selectedVitalSign ? canUpdateVitalSigns : canCreateVitalSigns;

	useEffect(() => {
		if (user) {
			fetchVitalSignsData();
		} else {
			setVitalSigns([]);
			setTotal(0);
		}
	}, [page, size, searchParams, user]);

	const fetchVitalSignsData = async () => {
		if (!searchParams?.patientId) {
			setVitalSigns([]);
			setTotal(0);
			return;
		}
		try {
			const response = await axios.get(`${API_BASE_URL}/patient/${searchParams?.patientId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
				params: {
					page: page - 1,
					size,
				},
			});
			setVitalSigns(response.data.content);
			setTotal(response.data.totalElements);
		} catch (error) {
			console.error("Failed to fetch vital signs:", error);
			if (error.response && error.response.status === 403) {
				notification.error({
					message: t("notification-permission-denied-title"),
					description: t("notification-permission-denied-view-vitals-patient"),
				});
				setVitalSigns([]);
				setTotal(0);
			} else {
				notification.error({
					message: t("notification-error-title"),
					description: t("notification-failed-fetch-vitals", { message: error.message }),
				});
			}
		}
	};

	const showModal = (vitalSign) => {
		if (vitalSign && !canUpdateVitalSigns) {
			notification.warning({
				message: t("notification-permission-denied-title"),
				description: t("notification-permission-denied-edit-vitals"),
			});
			return;
		}
		if (!vitalSign && !canCreateVitalSigns) {
			notification.warning({
				message: t("notification-permission-denied-title"),
				description: t("notification-permission-denied-add-vitals"),
			});
			return;
		}

		setSelectedVitalSign(vitalSign);
		if (vitalSign) {
			form.setFieldsValue({
				...vitalSign,
				timestamp: moment(vitalSign.timestamp),
				patientId: vitalSign.patientId,
				heartRate: vitalSign.heartRate || null,
				bloodPressureSystolic: vitalSign.bloodPressureSystolic || null,
				bloodPressureDiastolic: vitalSign.bloodPressureDiastolic || null,
				temperature: vitalSign.temperature || null,
				respiratoryRate: vitalSign.respiratoryRate || null,
				oxygenSaturation: vitalSign.oxygenSaturation || null,
				painLevel: vitalSign.painLevel || null,
				height: vitalSign.height || null,
				heightUnit: vitalSign.heightUnit || "cm",
				weight: vitalSign.weight || null,
				weightUnit: vitalSign.weightUnit || "kg",
				glucose: vitalSign.glucose || null,
				glucoseUnit: vitalSign.glucoseUnit || "mg/dL",
				posture: vitalSign.posture || null,
				capillaryRefillTime: vitalSign.capillaryRefillTime || null,
				notes: vitalSign.notes || null,
				method: vitalSign.method || null,
			});
			setSelectedPatientId(vitalSign.patientId);
		} else {
			form.resetFields();
			setSelectedPatientId(null);
			form.setFieldsValue({
				heightUnit: "cm",
				weightUnit: "kg",
				glucoseUnit: "mg/dL",
			});
		}
		setIsModalVisible(true);
		setPatientSearchTerm("");
		setPatientOptions([]);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedVitalSign(null);
		form.resetFields();
		setPatientSearchTerm("");
		setPatientOptions([]);
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
					})) || [],
				);
			} catch (error) {
				console.error("Failed to search patients:", error);
				setPatientOptions([]);
			}
		} else {
			setPatientOptions([]);
		}
	};

	const handlePatientSelect = (patientId) => {
		setSelectedPatientId(patientId);
	};

	const handleFormSubmit = async () => {
		if (!canSubmitModal) {
			notification.error({
				message: t("notification-permission-denied-title"),
				description: t("notification-permission-denied-save-changes"),
			});
			return;
		}
		try {
			const values = await form.validateFields();
			const formattedTimestamp = values.timestamp ? values.timestamp.format("YYYY-MM-DDTHH:mm:ss") : null;
			const convertEmptyToNull = (value) => (value === undefined || value === "" ? null : value);

			const vitalSignData = {
				...values,
				timestamp: formattedTimestamp,
				patientId: selectedPatientId,
				heartRate: convertEmptyToNull(values.heartRate),
				bloodPressureSystolic: convertEmptyToNull(values.bloodPressureSystolic),
				bloodPressureDiastolic: convertEmptyToNull(values.bloodPressureDiastolic),
				temperature: convertEmptyToNull(values.temperature),
				respiratoryRate: convertEmptyToNull(values.respiratoryRate),
				oxygenSaturation: convertEmptyToNull(values.oxygenSaturation),
				painLevel: convertEmptyToNull(values.painLevel),
				height: convertEmptyToNull(values.height),
				weight: convertEmptyToNull(values.weight),
				glucose: convertEmptyToNull(values.glucose),
				posture: values.posture || null,
				capillaryRefillTime: convertEmptyToNull(values.capillaryRefillTime),
				notes: values.notes || null,
				method: values.method || null,
			};

			const filteredVitalSignData = Object.fromEntries(
				Object.entries(vitalSignData).filter(([_, v]) => v !== null && v !== undefined && v !== ""),
			);

			if (selectedVitalSign) {
				await updateVitalSign(selectedVitalSign.id, filteredVitalSignData);
			} else {
				await createVitalSign(filteredVitalSignData);
			}

			fetchVitalSignsData();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedVitalSign(null);
			setPatientSearchTerm("");
			setPatientOptions([]);
			setSelectedPatientId(null);
		} catch (error) {
			console.error("Failed to save vital sign:", error);
			notification.error({
				message: t("notification-error-title"),
				description: t("notification-failed-save-vitals", { message: error.message }),
			});
		}
	};

	const handleDelete = async (vitalSignId) => {
		if (!canDeleteVitalSigns) {
			notification.error({
				message: t("notification-permission-denied-title"),
				description: t("notification-permission-denied-delete-vitals"),
			});
			return;
		}
		Modal.confirm({
			title: t("delete-vitals-confirm-title"),
			content: t("delete-vitals-confirm-content"),
			okText: t("delete-vitals-confirm-ok"),
			okType: "danger",
			cancelText: t("delete-vitals-confirm-cancel"),
			onOk: async () => {
				try {
					await deleteVitalSign(vitalSignId);
					fetchVitalSignsData();
					notification.success({
						message: t("notification-success-title"),
						description: t("notification-vitals-deleted-success"),
					});
				} catch (error) {
					console.error("Error deleting vital sign:", error);
					notification.error({
						message: t("notification-error-title"),
						description: t("notification-failed-delete-vitals", { message: error.message }),
					});
				}
			},
		});
	};

	const handleSearchPatientFilter = (patientId) => {
		setSearchParams({ ...searchParams, patientId: patientId });
		setPage(1);
	};

	const handlePaginationChange = (pageNumber, pageSize) => {
		setPage(pageNumber);
		setSize(pageSize);
	};

	const handleDataExtracted = (data) => {
		if (!canSubmitModal) {
			notification.warning({
				message: t("notification-permission-denied-title"),
				description: t("notification-cannot-populate-data-permission"),
			});
			return;
		}

		const fieldsToUpdate = {};

		// Iterate over all keys from the AI data
		for (const key in data) {
			// Only process keys where the AI provided a valid value (i.e., not "did not get")
			if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== "did not get" && data[key] !== null && data[key] !== undefined) {
				if (key === "timestamp") {
					const newTimestamp = moment(data[key], "YYYY-MM-DDTHH:mm:ss");
					if (newTimestamp.isValid()) {
						fieldsToUpdate[key] = newTimestamp;
					}
				} else {
					fieldsToUpdate[key] = data[key];
				}
			}
		}

		const isCreate = !selectedVitalSign;
		// If creating a new record, and a value for height/weight/glucose is being set by AI,
		// but the unit is not, then apply a default unit.
		if (isCreate) {
			if (fieldsToUpdate.height && !fieldsToUpdate.heightUnit) {
				fieldsToUpdate.heightUnit = "cm";
			}
			if (fieldsToUpdate.weight && !fieldsToUpdate.weightUnit) {
				fieldsToUpdate.weightUnit = "kg";
			}
			if (fieldsToUpdate.glucose && !fieldsToUpdate.glucoseUnit) {
				fieldsToUpdate.glucoseUnit = "mg/dL";
			}
		}

		// Only update the form if there are valid fields to update.
		if (Object.keys(fieldsToUpdate).length > 0) {
			form.setFieldsValue(fieldsToUpdate);
		}
	};

	const columns = [
		{
			title: t("vitals-column-timestamp"),
			dataIndex: "timestamp",
			key: "timestamp",
			render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
		},
		{ title: t("vitals-column-heart-rate"), dataIndex: "heartRate", key: "heartRate" },
		{ title: t("vitals-column-bp-systolic"), dataIndex: "bloodPressureSystolic", key: "bloodPressureSystolic" },
		{ title: t("vitals-column-bp-diastolic"), dataIndex: "bloodPressureDiastolic", key: "bloodPressureDiastolic" },
		{ title: t("vitals-column-temperature"), dataIndex: "temperature", key: "temperature" },
		{ title: t("vitals-column-respiratory-rate"), dataIndex: "respiratoryRate", key: "respiratoryRate" },
		{ title: t("vitals-column-oxygen-saturation"), dataIndex: "oxygenSaturation", key: "oxygenSaturation" },
		{ title: t("vitals-column-pain-level"), dataIndex: "painLevel", key: "painLevel" },
		{
			title: t("vitals-column-height"),
			dataIndex: "height",
			key: "height",
			render: (text, record) => (text ? `${text} ${record.heightUnit}` : t("not-applicable")),
		},
		{
			title: t("vitals-column-weight"),
			dataIndex: "weight",
			key: "weight",
			render: (text, record) => (text ? `${text} ${record.weightUnit}` : t("not-applicable")),
		},
		{
			title: t("vitals-column-glucose"),
			dataIndex: "glucose",
			key: "glucose",
			render: (text, record) => (text ? `${text} ${record.glucoseUnit}` : t("not-applicable")),
		},
		{ title: t("vitals-column-posture"), dataIndex: "posture", key: "posture" },
		{ title: t("vitals-column-capillary-refill"), dataIndex: "capillaryRefillTime", key: "capillaryRefillTime" },
		{ title: t("vitals-column-notes"), dataIndex: "notes", key: "notes" },
		{ title: t("vitals-column-method"), dataIndex: "method", key: "method" },
		{
			title: t("vitals-column-actions"),
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{canUpdateVitalSigns && (
						<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record)}>
							{t("vitals-action-edit")}
						</Button>
					)}
					{canDeleteVitalSigns && (
						<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
							{t("vitals-action-delete")}
						</Button>
					)}
				</Space>
			),
		},
	];

	if (loading && !vitalSigns.length) {
		return (
			<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div style={{ padding: "20px" }}>
			<Title level={2}>{t("vitals-page-title")}</Title>
			<Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12} md={8}>
					<AutoComplete
						style={{ width: "100%" }}
						options={patientOptions}
						onSearch={handlePatientSearch}
						placeholder={t("vitals-search-patient-placeholder")}
						filterOption={false}
						onSelect={handleSearchPatientFilter}
					/>
				</Col>
				<Col xs={24} sm={12} md={8}>
					{canCreateVitalSigns && (
						<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)} disabled={!searchParams?.patientId}>
							{t("vitals-add-new-button")}
						</Button>
					)}
				</Col>
			</Row>

			{searchParams?.patientId ? (
				<>
					<div style={{ margin: "0 -16px" }}>
						<Table
							columns={columns}
							dataSource={vitalSigns}
							loading={loading}
							rowKey="id"
							pagination={false}
							scroll={{ x: "max-content" }}
						/>
					</div>
					<Pagination
						current={page}
						pageSize={size}
						total={total}
						onChange={handlePaginationChange}
						style={{ marginTop: 16, textAlign: "right" }}
						showSizeChanger
						pageSizeOptions={["10", "20", "50"]}
					/>
				</>
			) : (
				<Typography.Text type="secondary" style={{ display: "block", textAlign: "center", marginTop: "20px" }}>
					{t("vitals-select-patient-prompt")}
				</Typography.Text>
			)}

			<Modal
				title={selectedVitalSign ? t("vitals-modal-edit-title") : t("vitals-modal-add-title")}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						{t("modal-button-cancel")}
					</Button>,
					<Button key="submit" type="primary" onClick={handleFormSubmit} disabled={!canSubmitModal}>
						{selectedVitalSign ? t("modal-button-update") : t("modal-button-save")}
					</Button>,
				]}
				width={"90%"}
				bodyStyle={{ overflowX: "auto" }}>
				<Form form={form} layout="vertical" disabled={!canSubmitModal}>
					{canSubmitModal && (
						<Form.Item>
							<VoiceToVitalSigns
								onDataExtracted={handleDataExtracted}
								disabled={!selectedPatientId}
								isUpdate={!!selectedVitalSign}
								originalData={selectedVitalSign || {}}
							/>
						</Form.Item>
					)}
					<Form.Item
						label={t("vitals-form-label-patient")}
						name="patientId"
						rules={[{ required: true, message: t("vitals-form-validation-patient-required") }]}>
						<AutoComplete
							options={patientOptions}
							onSearch={handlePatientSearch}
							placeholder={t("vitals-form-search-patient-placeholder")}
							filterOption={false}
							onSelect={(patientId, option) => {
								setSelectedPatientId(patientId);
								form.setFieldsValue({ patientId: patientId });
							}}
							disabled={!!selectedVitalSign}
						/>
					</Form.Item>
					<Form.Item
						label={t("vitals-form-label-timestamp")}
						name="timestamp"
						rules={[{ required: true, message: t("vitals-form-validation-timestamp-required") }]}>
						<DatePicker style={{ width: "100%" }} showTime />
					</Form.Item>
					<Row gutter={16}>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label={t("vitals-form-label-heart-rate")} name="heartRate">
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label={t("vitals-form-label-bp-systolic")} name="bloodPressureSystolic">
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label={t("vitals-form-label-bp-diastolic")} name="bloodPressureDiastolic">
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label={t("vitals-form-label-temperature")} name="temperature">
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label={t("vitals-form-label-respiratory-rate")} name="respiratoryRate">
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label={t("vitals-form-label-oxygen-saturation")} name="oxygenSaturation">
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label={t("vitals-form-label-pain-level")} name="painLevel">
								<InputNumber style={{ width: "100%" }} min={0} max={10} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label={t("vitals-form-label-height")}>
								<Input.Group compact>
									<Form.Item name="height" noStyle>
										<InputNumber style={{ width: "70%" }} />
									</Form.Item>
									<Form.Item name="heightUnit" noStyle initialValue="cm">
										<Select style={{ width: "30%" }}>
											<Select.Option value="cm">{t("unit-cm")}</Select.Option>
											<Select.Option value="in">{t("unit-in")}</Select.Option>
										</Select>
									</Form.Item>
								</Input.Group>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label={t("vitals-form-label-weight")}>
								<Input.Group compact>
									<Form.Item name="weight" noStyle>
										<InputNumber style={{ width: "70%" }} />
									</Form.Item>
									<Form.Item name="weightUnit" noStyle initialValue="kg">
										<Select style={{ width: "30%" }}>
											<Select.Option value="kg">{t("unit-kg")}</Select.Option>
											<Select.Option value="lb">{t("unit-lb")}</Select.Option>
										</Select>
									</Form.Item>
								</Input.Group>
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label={t("vitals-form-label-glucose")}>
								<Input.Group compact>
									<Form.Item name="glucose" noStyle>
										<InputNumber style={{ width: "70%" }} />
									</Form.Item>
									<Form.Item name="glucoseUnit" noStyle initialValue="mg/dL">
										<Select style={{ width: "30%" }}>
											<Select.Option value="mg/dL">{t("unit-mg-dl")}</Select.Option>
											<Select.Option value="mmol/L">{t("unit-mmol-l")}</Select.Option>
										</Select>
									</Form.Item>
								</Input.Group>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label={t("vitals-form-label-posture")} name="posture">
								<Input style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label={t("vitals-form-label-capillary-refill")} name="capillaryRefillTime">
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item label={t("vitals-form-label-notes")} name="notes">
						<Input.TextArea style={{ width: "100%" }} rows={3} />
					</Form.Item>
					<Form.Item label={t("vitals-form-label-method")} name="method">
						<Input style={{ width: "100%" }} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default VitalSignList;
