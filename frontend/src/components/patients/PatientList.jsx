import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Select, Pagination, Row, Col, Avatar, message, Modal, Popconfirm } from "antd";
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

const { Title } = Typography;
const { Option } = Select;

const PatientList = () => {
	const { patients, loading, total, searchPatients, deletePatient, createPatient, updatePatient, setLoading } = usePatientStore();
	const { hasAuthority } = useAuthStore();
	const { units, fetchAllUnits } = useUnitStore();
	const { rooms, fetchAllRooms } = useRoomStore();
	const { createActivity } = useActivityStore(); // Get createActivity

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
			message.error("Failed to delete patient.  Check server logs."); // More specific error
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
			message.success("Activities created successfully for all filtered patients.");
		} catch (error) {
			console.error("Error creating activities:", error);
			message.error("Failed to create activities.  Check server logs."); // More specific error
		}
	};

	const columns = [
		{
			title: "Profile Picture",
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
			title: "First Name",
			dataIndex: "firstName",
			key: "firstName",
		},
		{
			title: "Last Name",
			dataIndex: "lastName",
			key: "lastName",
		},
		{
			title: "Date of Birth",
			dataIndex: "dateOfBirth",
			key: "dateOfBirth",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD") : null),
		},
		{
			title: "Gender",
			dataIndex: "gender",
			key: "gender",
		},
		{
			title: "Medical Record Number",
			dataIndex: "medicalRecordNumber",
			key: "medicalRecordNumber",
		},
		{
			title: "Severity",
			dataIndex: "severityLevel",
			key: "severityLevel",
			render: (severity) => <span style={{ fontWeight: "bold" }}>{severity || "N/A"}</span>,
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{canViewPatient && (
						<Button type="default" icon={<EyeOutlined />} onClick={() => showModal(record)}>
							View
						</Button>
					)}
					{canDeletePatient && (
						<Popconfirm
							title="Delete Patient"
							description={
								<>
									<p>Are you sure you want to delete this patient?</p>
									<p style={{ color: "red", fontWeight: "bold" }}>This action is dangerous</p>
								</>
							}
							onConfirm={() => confirmDelete(record.id)}
							okText="Yes, Delete"
							okType="danger"
							cancelText="No">
							<Button type="danger" icon={<DeleteOutlined />}>
								Delete
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
			<Title level={2}>Patient List</Title>

			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Input.Search placeholder="Search..." onSearch={handleSearch} prefix={<SearchOutlined />} style={{ width: "100%" }} />
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Select placeholder="Select a Unit" onChange={handleUnitChange} allowClear style={{ width: "100%" }} value={filterParams.unitId}>
						{units?.map((unit) => (
							<Option key={unit.id} value={unit.id}>
								{unit.name}
							</Option>
						))}
					</Select>
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Select
						placeholder="Select a Room"
						onChange={handleRoomChange}
						allowClear
						style={{ width: "100%" }}
						disabled={!filterParams.unitId}
						value={filterParams.roomId}>
						{currentRooms?.map((room) => (
							<Option key={room.id} value={room.id}>
								{room.roomNumber}
							</Option>
						))}
					</Select>
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Space>
						{canAddPatient && (
							<Button type="default" onClick={() => showModal(null)}>
								Add New Patient
							</Button>
						)}
						<Button
							type="primary"
							onClick={showActivityForm}
							disabled={!filterParams.unitId && !filterParams.roomId} // Disable unless unit or room is selected
						>
							Assign Activity to Filtered Patients
						</Button>
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
				title="Assign Activity to Filtered Patients"
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
