import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, DatePicker, Select, AutoComplete, notification, Tag } from "antd";
import { useAdmissionStore } from "../../services/admission.service";
import { usePatientStore } from "../../services/patient.service";
import { useBedStore } from "../../services/bed.service";
import { useRoomStore } from "../../services/room.service";
import { useUnitStore } from "../../services/unit.service";
import { useAuthStore } from "../../services/auth.service";
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";

const { Title } = Typography;
const { Option } = Select;

const AdmissionList = () => {
	const {
		admissions,
		loading,
		total,
		searchAdmissions,
		deleteAdmission,
		createAdmission,
		updateAdmission,
		setLoading,
		setAdmissions, // Destructure setAdmissions here
	} = useAdmissionStore();
	const { patients, searchPatients } = usePatientStore();
	const { beds, searchBeds } = useBedStore(); // use searchBeds
	const { rooms, fetchAllRooms } = useRoomStore();
	const { units, fetchAllUnits } = useUnitStore();
	const { user } = useAuthStore();

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedAdmission, setSelectedAdmission] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const [patientOptions, setPatientOptions] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [filteredRooms, setFilteredRooms] = useState([]);
	const [filteredBeds, setFilteredBeds] = useState([]); // use filteredBeds from state
	const [selectedUnit, setSelectedUnit] = useState(null);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [selectedPatientId, setSelectedPatientId] = useState(null);

	useEffect(() => {
		fetchAllUnits();
	}, [fetchAllUnits]);

	useEffect(() => {
		fetchAllRooms();
	}, [fetchAllRooms]);

	useEffect(() => {
		fetchAdmissions();
	}, [page, size, searchParams]);

	const fetchAdmissions = async () => {
		if (!searchParams?.patientId) {
			setAdmissions([]);
			return;
		}

		setLoading(true);
		try {
			await searchAdmissions({ ...searchParams, page, size });
		} catch (error) {
			notification.error({
				message: "Error",
				description: `Failed to fetch admissions: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const showModal = (admission) => {
		setSelectedAdmission(admission);
		if (admission) {
			const bed = beds?.find((bed) => bed.id === admission.bedId);
			const room = rooms?.content?.find((room) => room.id === bed?.roomId);
			setSelectedUnit(room?.unitId);
			setSelectedRoom(bed?.roomId);
			setSelectedPatientId(admission.patientId);

			// Refetch beds if available
			if (room?.unitId) {
				fetchFilteredBeds(room?.unitId, bed?.roomId);
			}
			if (room?.unitId) {
				setFilteredRooms(rooms?.content?.filter((room) => room.unitId === room?.unitId));
			}

			form.setFieldsValue({
				...admission,
				admissionDate: admission.admissionDate ? moment(admission.admissionDate) : null,
				dischargeDate: admission.dischargeDate ? moment(admission.dischargeDate) : null,
				unitId: room?.unitId,
				roomId: bed?.roomId,
				bedId: bed?.id,
				patientId: admission.patientId,
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

	const fetchFilteredBeds = async (unitId, roomId) => {
		try {
			const response = await searchBeds({ unitId, roomId });
			setFilteredBeds(response?.content || []); // Set the fetched beds
		} catch (error) {
			console.error("Failed to fetch filtered beds:", error);
			setFilteredBeds([]); // Clear beds on error
		}
	};

	const handleUnitChangeModal = async (unitId) => {
		setSelectedUnit(unitId);
		setSelectedRoom(null); // Reset selected room
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
		}
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			const formattedAdmissionDate = values.admissionDate ? values.admissionDate.format("YYYY-MM-DDTHH:mm:ss") : null;
			const formattedDischargeDate = values.dischargeDate ? values.dischargeDate.format("YYYY-MM-DDTHH:mm:ss") : null;

			const admissionData = {
				...values,
				admissionDate: formattedAdmissionDate,
				dischargeDate: formattedDischargeDate,
				patientId: selectedPatientId,
			};
			if (selectedAdmission) {
				await updateAdmission(selectedAdmission.id, admissionData);
				notification.success({
					message: "Success",
					description: "Admission updated successfully",
				});
			} else {
				await createAdmission(admissionData);
				notification.success({
					message: "Success",
					description: "Admission created successfully",
				});
			}
			fetchAdmissions();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedAdmission(null);
			setPatientSearchTerm("");
			setPatientOptions([]);
			setSelectedUnit(null);
			setSelectedRoom(null);
			setFilteredRooms([]);
			setFilteredBeds([]);
			setSelectedPatientId(null);
		} catch (error) {
			notification.error({
				message: "Error",
				description: `Failed to save admission: ${error.message}`,
			});
			console.log("error in handle form submit", error);
		}
	};

	const handleDelete = async (admissionId) => {
		try {
			await deleteAdmission(admissionId);
			notification.success({
				message: "Success",
				description: "Admission deleted successfully",
			});
			fetchAdmissions();
		} catch (error) {
			console.error("Error deleting admission:", error);
			notification.error({
				message: "Error",
				description: `Failed to delete admission: ${error.message}`,
			});
		}
	};

	const handleSearchUnitFilter = (unitId) => {
		setSearchParams({
			...searchParams,
			unitId: unitId,
			roomId: undefined,
			bedId: undefined,
		});
		setPage(0);
		setSelectedUnit(unitId);
	};

	const handleSearchRoomFilter = (roomId) => {
		setSearchParams({ ...searchParams, roomId: roomId, bedId: undefined });
		setPage(0);
		setSelectedRoom(roomId);
	};

	const handleSearchBedFilter = (bedId) => {
		setSearchParams({ ...searchParams, bedId: bedId });
		setPage(0);
	};

	const handleSearchPatientFilter = (value) => {
		setSearchParams({ ...searchParams, patientId: value });
		setPage(0);
	};

	const handleTableChange = (pagination) => {
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	const columns = [
		{
			title: "Admission Date",
			dataIndex: "admissionDate",
			key: "admissionDate",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : null),
		},
		{
			title: "Discharge Date",
			dataIndex: "dischargeDate",
			key: "dischargeDate",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "Open"),
		},
		{
			title: "Patient",
			dataIndex: "patientName",
			key: "patientName",
		},
		{
			title: "Bed",
			dataIndex: "bedId",
			key: "bedId",
			render: (bedId) => {
				const bed = beds?.find((bed) => bed.id === bedId);
				return bed ? bed.bedNumber : "N/A";
			},
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => {
				const isPastAdmission = record.dischargeDate && moment(record.dischargeDate).isBefore(moment());
				return (
					<Space size="middle">
						{isPastAdmission ? (
							<Tag color="green">Completed</Tag>
						) : (
							<>
								{["ADMIN", "NURSE"].includes(user?.role) && (
									<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
										Edit
									</Button>
								)}
								{user?.role === "ADMIN" && (
									<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
										Delete
									</Button>
								)}
							</>
						)}
					</Space>
				);
			},
		},
	];

	return (
		<div style={{ padding: 20 }} className="main-container">
			<Title level={2}>Admission List</Title>
			<Space style={{ marginBottom: 16 }}>
				<AutoComplete
					style={{ width: 300 }}
					options={patientOptions}
					onSearch={handlePatientSearch}
					placeholder="Search for a patient"
					filterOption={false}
					onSelect={handleSearchPatientFilter}
				/>

				{["ADMIN", "NURSE"].includes(user?.role) && (
					<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)} disabled={!searchParams?.patientId}>
						Add New Admission
					</Button>
				)}
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
					onChange: handleTableChange,
				}}
			/>
			<Modal
				title={selectedAdmission ? "Edit Admission" : "Add Admission"}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					(user?.role === "ADMIN" || user?.role === "NURSE") && (
						<Button key="submit" type="primary" onClick={handleFormSubmit}>
							{selectedAdmission ? "Update" : "Save"}
						</Button>
					),
				]}>
				<Form form={form} layout="vertical">
					<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
						<AutoComplete
							options={patientOptions}
							onSearch={handlePatientSearch}
							placeholder="Search for a patient"
							filterOption={false}
							onSelect={(patientId) => {
								setSelectedPatientId(patientId);
								form.setFieldsValue({
									...form.getFieldsValue(),
									patientId: patientId,
								});
							}}
						/>
					</Form.Item>
					<Form.Item label="Unit" name="unitId" rules={[{ required: true, message: "Please select a unit" }]}>
						<Select placeholder="Select a Unit" onChange={handleUnitChangeModal} value={selectedUnit}>
							{units?.map((unit) => (
								<Option key={unit.id} value={unit.id}>
									{unit.name}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item label="Room" name="roomId" rules={[{ required: true, message: "Please select a room" }]}>
						<Select placeholder="Select a Room" onChange={handleRoomChangeModal} disabled={!selectedUnit} value={selectedRoom}>
							{filteredRooms?.map((room) => (
								<Option key={room.id} value={room.id}>
									{room.roomNumber}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item label="Bed" name="bedId" rules={[{ required: true, message: "Please select a bed" }]}>
						<Select placeholder="Select a Bed" disabled={!selectedRoom}>
							{filteredBeds?.map((bed) => (
								<Option key={bed.id} value={bed.id} disabled={bed.occupied}>
									{bed.bedNumber} {bed.occupied ? "(Occupied)" : ""}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item label="Admission Date" name="admissionDate" rules={[{ required: true, message: "Please select an admission date" }]}>
						<DatePicker style={{ width: "100%" }} showTime />
					</Form.Item>
					<Form.Item label="Discharge Date" name="dischargeDate">
						<DatePicker style={{ width: "100%" }} showTime />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default AdmissionList;
