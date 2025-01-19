import React, { useEffect, useState } from "react";
import { Layout, Menu, Breadcrumb, Table, Button, Modal, Form, Input, Select, notification, Space, Tag } from "antd";
import { UserAddOutlined, EditOutlined, DeleteOutlined, EyeOutlined, HomeOutlined, ApartmentOutlined } from "@ant-design/icons";
import { useNurseStore } from "../services/nurse.service";
import { useAuthStore } from "../services/auth.service";
import moment from "moment";

const { Header, Content, Sider } = Layout;
const { Option } = Select;

const HeadNurseDashboard = () => {
	const {
		nurses,
		loading,
		error,
		getAllNurses,
		createNurse,
		updateNurse,
		deleteNurse,
		clearError,
		getNurseWithDetails,
		assignNurseToUnit,
		removeNurseFromUnit,
		assignNurseToRoom,
		removeNurseFromRoom,
	} = useNurseStore();

	const { user } = useAuthStore();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();
	const [editMode, setEditMode] = useState(false);
	const [selectedNurseId, setSelectedNurseId] = useState(null);
	const [nurseDetailsModalOpen, setNurseDetailsModalOpen] = useState(false);
	const [selectedNurseDetails, setSelectedNurseDetails] = useState(null);

	// For assigning units and rooms:
	const [assignUnitModalOpen, setAssignUnitModalOpen] = useState(false);
	const [assignRoomModalOpen, setAssignRoomModalOpen] = useState(false);
	const [selectedNurseForAssignment, setSelectedNurseForAssignment] = useState(null);
	const [unitId, setUnitId] = useState(null);
	const [roomId, setRoomId] = useState(null);
	const [assignUnitForm] = Form.useForm();
	const [assignRoomForm] = Form.useForm();

	useEffect(() => {
		getAllNurses();
	}, [getAllNurses]);

	useEffect(() => {
		if (error) {
			notification.error({
				message: "Error",
				description: error,
			});
			clearError();
		}
	}, [error, clearError]);

	const showModal = () => {
		setIsModalOpen(true);
		setEditMode(false);
		form.resetFields();
	};

	const handleCancel = () => {
		setIsModalOpen(false);
		setEditMode(false);
		setSelectedNurseId(null);
		form.resetFields();
	};

	const onFinish = async (values) => {
		try {
			if (editMode) {
				await updateNurse(selectedNurseId, values);
			} else {
				await createNurse(values);
			}
			getAllNurses();
			handleCancel();
			notification.success({
				message: "Success",
				description: `Nurse ${editMode ? "updated" : "created"} successfully.`,
			});
		} catch (e) {
			notification.error({
				message: "Error",
				description: `Failed to ${editMode ? "update" : "create"} nurse.`,
			});
		}
	};

	const handleEdit = (nurse) => {
		setEditMode(true);
		setSelectedNurseId(nurse.id);
		form.setFieldsValue(nurse);
		setIsModalOpen(true);
	};

	const handleDelete = async (nurseId) => {
		try {
			await deleteNurse(nurseId);
			getAllNurses();
			notification.success({
				message: "Success",
				description: "Nurse deleted successfully.",
			});
		} catch (e) {
			notification.error({
				message: "Error",
				description: "Failed to delete nurse.",
			});
		}
	};

	const showNurseDetails = async (nurseId) => {
		try {
			const details = await getNurseWithDetails(nurseId);
			setSelectedNurseDetails(details);
			setNurseDetailsModalOpen(true);
		} catch (e) {
			notification.error({
				message: "Error",
				description: `Failed to get nurse details ${e.message}`,
			});
		}
	};

	const handleNurseDetailsCancel = () => {
		setNurseDetailsModalOpen(false);
		setSelectedNurseDetails(null);
	};

	// Assignment Function Handlers:

	const showAssignUnitModal = (nurseId) => {
		setSelectedNurseForAssignment(nurseId);
		setAssignUnitModalOpen(true);
	};
	const handleAssignUnitCancel = () => {
		setAssignUnitModalOpen(false);
		setSelectedNurseForAssignment(null);
		setUnitId(null);
		assignUnitForm.resetFields();
	};
	const handleAssignRoomCancel = () => {
		setAssignRoomModalOpen(false);
		setSelectedNurseForAssignment(null);
		setRoomId(null);
		assignRoomForm.resetFields();
	};
	const showAssignRoomModal = (nurseId) => {
		setSelectedNurseForAssignment(nurseId);
		setAssignRoomModalOpen(true);
	};
	const onAssignUnitFinish = async () => {
		try {
			await assignNurseToUnit(selectedNurseForAssignment, unitId);
			getAllNurses();
			notification.success({
				message: "Success",
				description: "Nurse assigned to unit successfully.",
			});
			handleAssignUnitCancel();
		} catch (e) {
			notification.error({
				message: "Error",
				description: `Failed to assign nurse to unit: ${e.message}`,
			});
		}
	};
	const onAssignRoomFinish = async () => {
		try {
			await assignNurseToRoom(selectedNurseForAssignment, roomId);
			getAllNurses();
			notification.success({
				message: "Success",
				description: "Nurse assigned to room successfully.",
			});
			handleAssignRoomCancel();
		} catch (e) {
			notification.error({
				message: "Error",
				description: `Failed to assign nurse to room: ${e.message}`,
			});
		}
	};
	const handleRemoveUnit = async (nurseId, unitId) => {
		try {
			await removeNurseFromUnit(nurseId, unitId);
			getAllNurses();
			notification.success({
				message: "Success",
				description: "Nurse removed from unit successfully.",
			});
		} catch (e) {
			notification.error({
				message: "Error",
				description: `Failed to remove nurse from unit: ${e.message}`,
			});
		}
	};
	const handleRemoveRoom = async (nurseId, roomId) => {
		try {
			await removeNurseFromRoom(nurseId, roomId);
			getAllNurses();
			notification.success({
				message: "Success",
				description: "Nurse removed from room successfully.",
			});
		} catch (e) {
			notification.error({
				message: "Error",
				description: `Failed to remove nurse from room: ${e.message}`,
			});
		}
	};

	const columns = [
		{
			title: "ID",
			dataIndex: "id",
			key: "id",
		},
		{
			title: "User ID",
			dataIndex: ["user", "id"],
			key: "userId",
			render: (text) => (text ? text : "N/A"),
		},
		{
			title: "Username",
			dataIndex: ["user", "username"],
			key: "username",
			render: (text) => (text ? text : "N/A"),
		},
		{
			title: "First Name",
			dataIndex: ["user", "firstName"],
			key: "firstName",
			render: (text) => (text ? text : "N/A"),
		},
		{
			title: "Last Name",
			dataIndex: ["user", "lastName"],
			key: "lastName",
			render: (text) => (text ? text : "N/A"),
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, nurse) => (
				<Space size="middle">
					<Button type="primary" icon={<EyeOutlined />} onClick={() => showNurseDetails(nurse.id)}>
						Details
					</Button>
					<Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(nurse)}>
						Edit
					</Button>
					<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(nurse.id)}>
						Delete
					</Button>
					<Button type="primary" icon={<ApartmentOutlined />} onClick={() => showAssignUnitModal(nurse.id)}>
						Assign Unit
					</Button>
					<Button type="primary" icon={<HomeOutlined />} onClick={() => showAssignRoomModal(nurse.id)}>
						Assign Room
					</Button>
				</Space>
			),
		},
	];
	const detailsModalColumns = [
		{
			title: "Patient ID",
			dataIndex: "id",
			key: "id",
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
			render: (text) => (text ? moment(text).format("MM-DD-YYYY") : "N/A"),
		},
		{
			title: "Gender",
			dataIndex: "gender",
			key: "gender",
		},
		// Add more columns as needed
	];
	const unitColumns = [
		{
			title: "ID",
			dataIndex: "id",
			key: "id",
		},
		{
			title: "Unit Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, unit) => (
				<Space size="middle">
					<Button type="danger" onClick={() => handleRemoveUnit(selectedNurseDetails.nurse.id, unit.id)}>
						Remove
					</Button>
				</Space>
			),
		},
	];
	const roomColumns = [
		{
			title: "ID",
			dataIndex: "id",
			key: "id",
		},
		{
			title: "Room Number",
			dataIndex: "roomNumber",
			key: "roomNumber",
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, room) => (
				<Space size="middle">
					<Button type="danger" onClick={() => handleRemoveRoom(selectedNurseDetails.nurse.id, room.id)}>
						Remove
					</Button>
				</Space>
			),
		},
	];

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Sider collapsible>
				<div className="demo-logo-vertical" />
				<Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
					<Menu.Item key="1">Nurses</Menu.Item>
				</Menu>
			</Sider>
			<Layout>
				<Header style={{ padding: "0 20px", background: "#fff" }}>
					<h1>Head Nurse Dashboard</h1>
				</Header>
				<Content style={{ margin: "20px" }}>
					<Breadcrumb style={{ margin: "0 0 20px 0" }}>
						<Breadcrumb.Item>Dashboard</Breadcrumb.Item>
						<Breadcrumb.Item>Nurses</Breadcrumb.Item>
					</Breadcrumb>
					<Button type="primary" icon={<UserAddOutlined />} onClick={showModal} style={{ marginBottom: "20px" }}>
						Add Nurse
					</Button>
					<Table loading={loading} columns={columns} dataSource={nurses} rowKey="id" />

					<Modal title={editMode ? "Edit Nurse" : "Add New Nurse"} open={isModalOpen} onCancel={handleCancel} footer={null}>
						<Form form={form} layout="vertical" onFinish={onFinish} initialValues={{}}>
							<Form.Item
								name={["user", "firstName"]}
								label="First Name"
								rules={[
									{
										required: true,
										message: "Please enter first name!",
									},
								]}>
								<Input placeholder="First Name" />
							</Form.Item>
							<Form.Item
								name={["user", "lastName"]}
								label="Last Name"
								rules={[
									{
										required: true,
										message: "Please enter last name!",
									},
								]}>
								<Input placeholder="Last Name" />
							</Form.Item>
							<Form.Item
								name={["user", "username"]}
								label="Username"
								rules={[
									{
										required: true,
										message: "Please enter username!",
									},
								]}>
								<Input placeholder="Username" />
							</Form.Item>
							<Form.Item
								name={["user", "password"]}
								label="Password"
								rules={[
									{
										required: true,
										message: "Please enter password!",
									},
								]}>
								<Input.Password placeholder="Password" />
							</Form.Item>

							<Form.Item>
								<Button type="primary" htmlType="submit">
									{editMode ? "Update" : "Add"}
								</Button>
								<Button style={{ marginLeft: "10px" }} onClick={handleCancel}>
									Cancel
								</Button>
							</Form.Item>
						</Form>
					</Modal>
					<Modal title="Nurse Details" open={nurseDetailsModalOpen} onCancel={handleNurseDetailsCancel} width={1000} footer={null}>
						{selectedNurseDetails && (
							<>
								<h2>
									{selectedNurseDetails.nurse.user.firstName} {selectedNurseDetails.nurse.user.lastName}
								</h2>
								<h3>Assigned Patients</h3>
								{selectedNurseDetails.assignedPatients.length > 0 ? (
									<Table columns={detailsModalColumns} dataSource={selectedNurseDetails.assignedPatients} rowKey="id" />
								) : (
									<p>No patients assigned to this nurse.</p>
								)}
								<h3 style={{ marginTop: "20px" }}>Assigned Units</h3>
								{selectedNurseDetails.assignedUnits.length > 0 ? (
									<Table columns={unitColumns} dataSource={selectedNurseDetails.assignedUnits} rowKey="id" />
								) : (
									<p>No units assigned to this nurse.</p>
								)}
								<h3 style={{ marginTop: "20px" }}>Assigned Rooms</h3>
								{selectedNurseDetails.assignedRooms.length > 0 ? (
									<Table columns={roomColumns} dataSource={selectedNurseDetails.assignedRooms} rowKey="id" />
								) : (
									<p>No rooms assigned to this nurse.</p>
								)}
							</>
						)}
					</Modal>
					{/* Assign Unit Modal */}
					<Modal title="Assign Unit to Nurse" open={assignUnitModalOpen} onCancel={handleAssignUnitCancel} footer={null}>
						<Form form={assignUnitForm} layout="vertical" onFinish={onAssignUnitFinish}>
							<Form.Item
								name="unitId"
								label="Unit ID"
								rules={[
									{
										required: true,
										message: "Please select unit ID!",
									},
								]}>
								<Input type="number" placeholder="Enter unit id" onChange={(e) => setUnitId(parseInt(e.target.value))} />
							</Form.Item>

							<Form.Item>
								<Button type="primary" htmlType="submit">
									Assign
								</Button>
								<Button style={{ marginLeft: "10px" }} onClick={handleAssignUnitCancel}>
									Cancel
								</Button>
							</Form.Item>
						</Form>
					</Modal>
					{/* Assign Room Modal */}
					<Modal title="Assign Room to Nurse" open={assignRoomModalOpen} onCancel={handleAssignRoomCancel} footer={null}>
						<Form form={assignRoomForm} layout="vertical" onFinish={onAssignRoomFinish}>
							<Form.Item
								name="roomId"
								label="Room ID"
								rules={[
									{
										required: true,
										message: "Please select room ID!",
									},
								]}>
								<Input type="number" placeholder="Enter room id" onChange={(e) => setRoomId(parseInt(e.target.value))} />
							</Form.Item>

							<Form.Item>
								<Button type="primary" htmlType="submit">
									Assign
								</Button>
								<Button style={{ marginLeft: "10px" }} onClick={handleAssignRoomCancel}>
									Cancel
								</Button>
							</Form.Item>
						</Form>
					</Modal>
				</Content>
			</Layout>
		</Layout>
	);
};
export default HeadNurseDashboard;
