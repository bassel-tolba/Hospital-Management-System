import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Select, Pagination, Row, Col, Avatar, message, Modal, Popconfirm, Tooltip } from "antd";
import { DeleteOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { usePatientStore } from "../../services/patient.service";
import { useAuthStore } from "../../services/auth.service";
import { useUnitStore } from "../../services/unit.service";
import { useRoomStore } from "../../services/room.service";
import { useActivityStore } from "../../services/activity.service";
import PatientForm from "./PatientForm";
import MiniCreateActivityForm from "./MiniCreateActivityForm"; // Import MiniCreateActivityForm
import { Link } from "react-router-dom";
import moment from "moment";
import "./PatientList.css";
import PatientListActivityForm from "./PatientListActivityForm"; // NEW COMPONENT
import { UserAddOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next"; // Import

const { Title } = Typography;
const { Option } = Select;

const PatientList = () => {
	const { patients, loading, total, searchPatients, deletePatient, createPatient, updatePatient, setLoading } = usePatientStore();
	const { hasAuthority } = useAuthStore();
	const { units, fetchAllUnits } = useUnitStore();
	const { rooms, fetchAllRooms } = useRoomStore();
	const { createActivity } = useActivityStore(); // Get createActivity
	const { t } = useTranslation(); // Initialize

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedPatient, setSelectedPatient] = useState(null);
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const [filterParams, setFilterParams] = useState({});
	const [currentRooms, setCurrentRooms] = useState([]);
	const [isActivityFormVisible, setIsActivityFormVisible] = useState(false); // State for activity form

	const transformImageUrl = (url) => {
		if (!url) return null;
		return url.startsWith(".") ? url.substring(1) : url;
	};

	const canAddPatient = hasAuthority("CREATE_PATIENT");
	const canViewPatient = hasAuthority("READ_PATIENT");
	const canDeletePatient = hasAuthority("DELETE_PATIENT");

	useEffect(() => {
		fetchAllUnits();
		fetchAllRooms();
	}, [fetchAllUnits, fetchAllRooms]);

	useEffect(() => {
		fetchPatients();
	}, [page, size, searchParams, filterParams]);

	useEffect(() => {
		if (rooms && rooms.content) {
			if (filterParams.unitId) {
				setCurrentRooms(rooms.content.filter((room) => room.unitId === filterParams.unitId));
			} else {
				setCurrentRooms([]);
			}
		} else {
			setCurrentRooms([]);
		}
	}, [rooms, filterParams.unitId]);

	const fetchPatients = async () => {
		setLoading(true);
		let params = {
			page: page - 1,
			size, // Default size
		};

		if (searchParams.searchTerm) {
			params.searchTerm = searchParams.searchTerm;
		} else if (filterParams.roomId) {
			params.roomId = filterParams.roomId;
			params.size = 100; // Override size for room filter
		} else if (filterParams.unitId) {
			params.unitId = filterParams.unitId;
			params.size = 100; // Override size for unit filter
		}

		await searchPatients(params);
		setLoading(false);
	};

	const showModal = (patient) => {
		setSelectedPatient(patient);
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedPatient(null);
	};

	const handleSubmit = async (patientData, profilePicture, removedProfilePictureUrl) => {
		try {
			if (selectedPatient) {
				if (!hasAuthority("UPDATE_PATIENT")) {
					console.error("User does not have permission to update patients.");
					return;
				}
				await updatePatient(selectedPatient.id, patientData, profilePicture, removedProfilePictureUrl);
			} else {
				if (!hasAuthority("CREATE_PATIENT")) {
					console.error("User does not have permission to create patients.");
					return;
				}
				await createPatient(patientData, profilePicture);
			}
			fetchPatients();
			setIsModalVisible(false);
			setSelectedPatient(null);
		} catch (error) {
			console.error("Error in handle form submit", error);
		}
	};

	const handleDelete = async (patientId) => {
		if (!canDeletePatient) {
			console.error("User does not have permission to delete patients.");
			return;
		}
		try {
			await deletePatient(patientId);
			fetchPatients();
		} catch (error) {
			console.error("Error deleting patient:", error);
			message.error(t("delete-patient-failed-message")); // More specific error
		}
	};

	const confirmDelete = (patientId) => {
		handleDelete(patientId); // Call your existing delete function
	};

	const handleSearch = (value) => {
		setSearchParams({ searchTerm: value });
		setPage(1);
		setFilterParams({});
	};

	const handlePageChange = (newPage) => {
		setPage(newPage);
	};

	const handlePageSizeChange = (current, newSize) => {
		setPage(1);
		setSize(newSize);
	};

	const handleUnitChange = (unitId) => {
		if (unitId) {
			setFilterParams({ unitId: unitId });
		} else {
			setFilterParams({});
		}
		setPage(1);
	};

	const handleRoomChange = (roomId) => {
		if (roomId) {
			setFilterParams({ roomId: roomId });
		} else {
			if (filterParams.unitId) {
				setFilterParams({ unitId: filterParams.unitId });
			} else {
				setFilterParams({});
			}
		}
		setPage(1);
	};

	// --- Activity Assignment Handlers ---
	const showActivityForm = () => {
		setIsActivityFormVisible(true);
	};

	const hideActivityForm = () => {
		setIsActivityFormVisible(false);
	};

	const handleActivitySubmit = async (activityData) => {
		try {
			const patientIds = patients.map((patient) => patient.id);
			// No loop needed, send the whole array
			await createActivity({ ...activityData, patientIds });
			hideActivityForm();
			fetchPatients(); // Refresh patient list
			message.success(t("activities-created-success-message"));
		} catch (error) {
			console.error("Error creating activities:", error);
			message.error(t("create-activities-failed-message")); // More specific error
		}
	};

	const columns = [
		{
			title: t("profile-picture"),
			dataIndex: "profilePictureURL",
			key: "profilePictureURL",
			render: (text, record) => (
				<div style={{ width: 40, height: 40 }}>
					<Link to={`/patients/${record.id}`}>
						<Avatar
							size={40}
							src={record.profilePictureURL ? transformImageUrl(record.profilePictureURL) : null}
							style={{
								objectFit: "cover",
								width: "100%",
								height: "100%",
								border: "2px solid #ddd",
								borderColor: "snow",
							}}
						/>
					</Link>
				</div>
			),
		},
		{
			title: t("first-name"),
			dataIndex: "firstName",
			key: "firstName",
		},
		{
			title: t("last-name"),
			dataIndex: "lastName",
			key: "lastName",
		},
		{
			title: t("date-of-birth"),
			dataIndex: "dateOfBirth",
			key: "dateOfBirth",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD") : null),
		},
		{
			title: t("gender"),
			dataIndex: "gender",
			key: "gender",
		},
		{
			title: t("medical-record-number"),
			dataIndex: "medicalRecordNumber",
			key: "medicalRecordNumber",
		},
		{
			title: t("severity"),
			dataIndex: "severityLevel",
			key: "severityLevel",
			render: (severity) => <span style={{ fontWeight: "bold" }}>{severity || "N/A"}</span>,
		},
		{
			title: t("actions"),
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{canViewPatient && (
						<Button type="default" icon={<EyeOutlined />} onClick={() => showModal(record)}>
							{t("view")}
						</Button>
					)}
					{canDeletePatient && (
						<Popconfirm
							title={t("delete-patient")}
							description={
								<>
									<p>{t("confirm-delete-patient")}</p>
									<p style={{ color: "red", fontWeight: "bold" }}>{t("delete-patient-warning")}</p>
								</>
							}
							onConfirm={() => confirmDelete(record.id)}
							okText={t("yes-delete")}
							okType="danger"
							cancelText={t("no")}>
							<Button type="primary" danger icon={<DeleteOutlined />}>
								{t("delete")}
							</Button>
						</Popconfirm>
					)}
				</Space>
			),
		},
	];

	const getRowClassName = (record) => {
		return `patient-row severity-${record.severityLevel || "none"}`;
	};

	return (
		<div className="main-container" style={{ padding: "20px", maxWidth: "100%", overflowX: "auto" }}>
			<Title level={2}>{t("patient-list")}</Title>

			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Input.Search placeholder={t("search...")} onSearch={handleSearch} prefix={<SearchOutlined />} style={{ width: "100%" }} />
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Select
						placeholder={t("select-a-unit")}
						onChange={handleUnitChange}
						allowClear
						style={{ width: "100%" }}
						value={filterParams.unitId}>
						{units?.map((unit) => (
							<Option key={unit.id} value={unit.id}>
								{t(unit.name.toLowerCase().replace(/ /g, "-"))}
							</Option>
						))}
					</Select>
				</Col>
				<Col xs={24} sm={12} md={8} lg={4}>
					<Select
						placeholder={t("select-a-room")}
						onChange={handleRoomChange}
						allowClear
						style={{ width: "100%" }}
						disabled={!filterParams.unitId}
						value={filterParams.roomId}>
						{currentRooms?.map((room) => (
							<Option key={room.id} value={room.id}>
								{t(room.roomNumber.toLowerCase().replace(/ /g, "-"))}
							</Option>
						))}
					</Select>
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Space>
						{canAddPatient && (
							<Button type="primary" onClick={() => showModal(null)}>
								{t("add-new-patient")}
							</Button>
						)}
						<Tooltip title={t("assign-activity-tooltip")}>
							{" "}
							<Button
								type="primary"
								onClick={showActivityForm}
								disabled={!filterParams.unitId && !filterParams.roomId}
								icon={<UserAddOutlined />}></Button>
						</Tooltip>
					</Space>
				</Col>
			</Row>

			<div style={{ overflowX: "auto", margin: "0 -16px" }}>
				<Table
					columns={columns}
					dataSource={patients}
					loading={loading}
					rowKey="id"
					pagination={false}
					rowClassName={getRowClassName}
					scroll={{ x: true }}
				/>
			</div>

			<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
				<Pagination
					current={page}
					pageSize={size}
					total={total}
					showSizeChanger
					onChange={handlePageChange}
					onShowSizeChange={handlePageSizeChange}
				/>
			</div>

			<PatientForm
				visible={isModalVisible}
				onCancel={handleCancel}
				onSubmit={handleSubmit}
				initialValues={selectedPatient}
				isNewPatient={!selectedPatient}
			/>
			{/* Mini Activity Form */}
			<Modal
				title={t("assign-activity-modal-title")}
				open={isActivityFormVisible}
				onCancel={hideActivityForm}
				footer={null} // We handle submission inside the form
			>
				<PatientListActivityForm onActivityCreated={handleActivitySubmit} />
			</Modal>
		</div>
	);
};

export default PatientList;
