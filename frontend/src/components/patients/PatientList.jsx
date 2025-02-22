// components/PatientList.js
import { DeleteOutlined, EyeOutlined, SortDescendingOutlined } from "@ant-design/icons";
import { Avatar, Button, Input, Pagination, Select, Space, Table, Typography } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../services/auth.service";
import { usePatientStore } from "../../services/patient.service";
import PatientForm from "./PatientForm";
import "./PatientList.css"; // Import the CSS file

const { Title } = Typography;
// const { Option } = Select;  // Not used, can be removed

const PatientList = () => {
	const { patients, loading, total, searchPatients, deletePatient, createPatient, updatePatient, setLoading, clearSorting } = usePatientStore();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedPatient, setSelectedPatient] = useState(null);
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const { hasAuthority } = useAuthStore();

	useEffect(() => {
		fetchPatients();
	}, [page, size, searchParams]);

	const fetchPatients = async () => {
		setLoading(true);
		await searchPatients({
			...searchParams,
			page: page - 1,
			size,
		});
		setLoading(false);
	};

	const transformImageUrl = (url) => {
		if (!url) return null;
		// Simpler and more robust URL handling:
		return url.startsWith(".") ? url.substring(1) : url;
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
		if (!hasAuthority("DELETE_PATIENT")) {
			console.error("User does not have permission to delete patients.");
			return;
		}
		try {
			await deletePatient(patientId);
			fetchPatients();
		} catch (error) {
			console.error("Error deleting patient:", error);
		}
	};

	const handleSearch = (value) => {
		setSearchParams({ ...searchParams, searchTerm: value });
		setPage(1);
	};

	const handlePageChange = (newPage) => {
		setPage(newPage);
	};

	const handlePageSizeChange = (current, newSize) => {
		setPage(1);
		setSize(newSize);
	};

	const handleSortBySeverity = () => {
		setSearchParams({ ...searchParams, sort: "severityLevel,desc" });
	};

	//For clearing sorting uncomment
	// const handleClearSort = () => {
	// 	clearSorting(); // Call clearSorting function from the store
	// 	setSearchParams({}); // Reset searchParams to clear sorting
	// };

	const canAddPatient = hasAuthority("CREATE_PATIENT");
	const canEditPatient = hasAuthority("UPDATE_PATIENT"); //This is never used because view button is used for this
	const canDeletePatient = hasAuthority("DELETE_PATIENT");
	const canViewPatient = hasAuthority("READ_PATIENT");

	const columns = [
		{
			title: "Profile Picture",
			dataIndex: "profilePictureURL",
			key: "profilePictureURL",
			render: (text, record) => (
				// Wrap Avatar in a div for better control
				<div style={{ width: 40, height: 40 }}>
					<Link to={`/patients/${record.id}`}>
						<Avatar
							size={40}
							src={record.profilePictureURL ? transformImageUrl(record.profilePictureURL) : null}
							style={{
								objectFit: "cover",
								width: "100%", // Fill the container
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
						<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
							Delete
						</Button>
					)}
				</Space>
			),
		},
	];

	const getRowClassName = (record) => {
		return `patient-row severity-${record.severityLevel || "none"}`;
	};

	return (
		<div className="main-container">
			<Title level={2}>Patient List</Title>
			<Space style={{ marginBottom: 16 }} direction="vertical" size="middle">
				<Input.Search placeholder="Search by first name, last name, blood type..." onSearch={handleSearch} style={{ width: "100%" }} />
				<Space>
					{canAddPatient && (
						<Button type="default" onClick={() => showModal(null)}>
							Add New Patient
						</Button>
					)}
					<Button type="default" icon={<SortDescendingOutlined />} onClick={handleSortBySeverity}>
						Sort by Severity
					</Button>
					{/* Uncomment button if needed */}
					{/* <Button type="default" onClick={handleClearSort}>
						Clear Sorting
					</Button> */}
				</Space>
			</Space>

			<div style={{ overflowX: "auto", margin: "0 -16px" }}>
				<Table
					columns={columns}
					dataSource={patients}
					loading={loading}
					rowKey="id"
					pagination={false}
					rowClassName={getRowClassName}
					components={{
						body: {
							row: (props) => {
								const isSeverity5 = props.className.includes("severity-5");
								return (
									<tr {...props}>
										{/*Conditionally add shimmer*/}

										{props.children}
									</tr>
								);
							},
						},
					}}
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
		</div>
	);
};

export default PatientList;
