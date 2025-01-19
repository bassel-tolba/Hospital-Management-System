import React, { useEffect, useState } from "react";
import { Layout, Menu, Breadcrumb, Table, Button, Modal, Form, Input, Select, notification, Space } from "antd";
import { PlusOutlined, DeleteOutlined, EyeOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useNurseActivityStore } from "../services/nurseActivity.service";
import { useNurseStore } from "../services/nurse.service";
import { useAuthStore } from "../services/auth.service";
import { Link } from "react-router-dom";
import moment from "moment";

const { Header, Content, Sider } = Layout;
const { Option } = Select;

const NurseDashboard = () => {
	const { activities, loading, error, recordActivity, getAllActivitiesByNurse, deleteActivity, clearError } = useNurseActivityStore();
	const { getNurseByUserId, getPatientSchedules, getAssignedPatients } = useNurseStore();
	const { user } = useAuthStore();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();
	const [nurseId, setNurseId] = useState(null);
	const [patientSchedules, setPatientSchedules] = useState([]);
	const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
	const [assignedPatients, setAssignedPatients] = useState([]);

	useEffect(() => {
		const fetchNurseData = async () => {
			if (user?.id) {
				console.log("user", user);
				try {
					const nurse = await getNurseByUserId(user?.id);
					console.log("nurse", nurse);
					setNurseId(nurse?.id);
				} catch (error) {
					notification.error({
						message: "Error",
						description: `Failed to fetch nurse data ${error.message}`,
					});
				}
			}
		};
		fetchNurseData();
	}, [user, getNurseByUserId]);

	useEffect(() => {
		if (nurseId) {
			console.log("nurseId", nurseId);
			getAllActivitiesByNurse(nurseId);
			fetchAssignedPatients();
		}
	}, [nurseId, getAllActivitiesByNurse]);

	useEffect(() => {
		if (error) {
			notification.error({
				message: "Error",
				description: error,
			});
			clearError();
		}
	}, [error, clearError]);
	const fetchAssignedPatients = async () => {
		if (nurseId) {
			try {
				const patients = await getAssignedPatients(nurseId);
				setAssignedPatients(patients);
			} catch (e) {
				notification.error({
					message: "Error",
					description: `Failed to fetch assigned patients ${e.message}`,
				});
			}
		}
	};

	const showModal = () => {
		setIsModalOpen(true);
		form.resetFields();
	};

	const handleCancel = () => {
		setIsModalOpen(false);
		form.resetFields();
	};

	const onFinish = async (values) => {
		try {
			await recordActivity(nurseId, values.activityType, values.patientId, values.notes);
			getAllActivitiesByNurse(nurseId);
			handleCancel();
			notification.success({
				message: "Success",
				description: "Nurse activity recorded successfully.",
			});
		} catch (e) {
			notification.error({
				message: "Error",
				description: `Failed to record nurse activity: ${e.message}`,
			});
		}
	};

	const handleDelete = async (activityId) => {
		try {
			await deleteActivity(activityId);
			getAllActivitiesByNurse(nurseId);
			notification.success({
				message: "Success",
				description: "Nurse activity deleted successfully.",
			});
		} catch (e) {
			notification.error({
				message: "Error",
				description: `Failed to delete nurse activity: ${e.message}`,
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
			title: "Activity Type",
			dataIndex: "activityType",
			key: "activityType",
			render: (text) => {
				// Convert enum names to readable strings (optional)
				switch (text) {
					case "VITAL_SIGNS_RECORDED":
						return "Vital Signs Recorded";
					case "MEDICATION_ADMINISTERED":
						return "Medication Administered";
					case "ASSESSMENT_COMPLETED":
						return "Assessment Completed";
					case "CARE_PLAN_UPDATED":
						return "Care Plan Updated";
					case "ADMISSION_RECORDED":
						return "Admission Recorded";
					case "DISCHARGE_RECORDED":
						return "Discharge Recorded";
					case "ROOM_ASSIGNMENT_UPDATED":
						return "Room Assignment Updated";
					case "UNIT_ASSIGNMENT_UPDATED":
						return "Unit Assignment Updated";
					case "OTHER":
						return "Other";
					default:
						return text;
				}
			},
		},
		{
			title: "Timestamp",
			dataIndex: "timestamp",
			key: "timestamp",
			render: (text) => (text ? moment(text).format("MM-DD-YYYY hh:mm:ss A") : "N/A"),
		},
		{
			title: "Patient ID",
			dataIndex: "patientId",
			key: "patientId",
			render: (text) => (text ? text : "N/A"),
		},
		{
			title: "Notes",
			dataIndex: "notes",
			key: "notes",
			render: (text) => (text ? text : "N/A"),
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, activity) => (
				<Space size="middle">
					<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(activity.id)}>
						Delete
					</Button>
				</Space>
			),
		},
	];
	const schedulesColumns = [
		{
			title: "Task",
			dataIndex: "task",
			key: "task",
		},
		{
			title: "Scheduled Time",
			dataIndex: "scheduledTime",
			key: "scheduledTime",
			render: (text) => (text ? moment(text).format("MM-DD-YYYY hh:mm:ss A") : "N/A"),
		},
		{
			title: "Patient ID",
			dataIndex: "patient",
			key: "patientId",

			render: (patient) => (patient ? patient.id : "N/A"),
		},
		{
			title: "Patient Name",
			dataIndex: "patient",
			key: "patientName",
			render: (patient) => {
				if (!patient || !patient.id) {
					return "N/A";
				}
				return (
					<Link to={`/patients/${patient.id}`}>
						{patient.firstName} {patient.lastName}
					</Link>
				);
			},
		},
		{
			title: "Patient Last Name",
			dataIndex: "patient",
			key: "patientLastName",
			render: (patient) => (patient ? patient.lastName : "N/A"),
		},
	];
	const patientColumns = [
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
	];
	const handleFetchSchedules = async () => {
		try {
			const schedules = await getPatientSchedules(nurseId);

			// Map the schedules data to the format expected by the table
			const mappedSchedules = schedules.map((schedule) => ({
				...schedule,
				key: schedule.patient.id + schedule.scheduledTime,
			}));
			setPatientSchedules(mappedSchedules);
			setScheduleModalOpen(true);
		} catch (e) {
			notification.error({
				message: "Error",
				description: `Failed to get patient schedules: ${e.message}`,
			});
		}
	};

	const handleScheduleCancel = () => {
		setScheduleModalOpen(false);
		setPatientSchedules([]);
	};

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Sider collapsible>
				<div className="demo-logo-vertical" />
				<Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
					<Menu.Item key="1">Activity</Menu.Item>
				</Menu>
			</Sider>
			<Layout>
				<Header style={{ padding: "0 20px", background: "#fff" }}>
					<h1>Nurse Dashboard</h1>
				</Header>
				<Content style={{ margin: "20px" }}>
					<Breadcrumb style={{ margin: "0 0 20px 0" }}>
						<Breadcrumb.Item>Dashboard</Breadcrumb.Item>
						<Breadcrumb.Item>Activity</Breadcrumb.Item>
					</Breadcrumb>
					<Space style={{ marginBottom: 20 }}>
						<Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
							Record Activity
						</Button>
						<Button type="primary" icon={<UnorderedListOutlined />} onClick={handleFetchSchedules}>
							Patient Schedules
						</Button>
					</Space>
					<Table loading={loading} columns={columns} dataSource={activities} rowKey="timestamp" style={{ marginBottom: "20px" }} />
					<h2>Assigned Patients</h2>
					{assignedPatients.length > 0 ? (
						<Table loading={loading} columns={patientColumns} dataSource={assignedPatients} rowKey="id" />
					) : (
						<p>No patients assigned to this nurse.</p>
					)}

					<Modal title="Record New Activity" open={isModalOpen} onCancel={handleCancel} footer={null}>
						<Form form={form} layout="vertical" onFinish={onFinish} initialValues={{}}>
							<Form.Item
								name="activityType"
								label="Activity Type"
								rules={[
									{
										required: true,
										message: "Please select activity type!",
									},
								]}>
								<Select placeholder="Select activity">
									<Option value="VITAL_SIGNS_RECORDED">Vital Signs Recorded</Option>
									<Option value="MEDICATION_ADMINISTERED">Medication Administered</Option>
									<Option value="ASSESSMENT_COMPLETED">Assessment Completed</Option>
									<Option value="CARE_PLAN_UPDATED">Care Plan Updated</Option>
									<Option value="ADMISSION_RECORDED">Admission Recorded</Option>
									<Option value="DISCHARGE_RECORDED">Discharge Recorded</Option>
									<Option value="ROOM_ASSIGNMENT_UPDATED">Room Assignment Updated</Option>
									<Option value="UNIT_ASSIGNMENT_UPDATED">Unit Assignment Updated</Option>
									<Option value="OTHER">Other</Option>
								</Select>
							</Form.Item>
							<Form.Item name="patientId" label="Patient ID">
								<Input placeholder="Enter patient ID" />
							</Form.Item>
							<Form.Item name="notes" label="Notes">
								<Input.TextArea placeholder="Enter notes" />
							</Form.Item>
							<Form.Item>
								<Button type="primary" htmlType="submit">
									Record
								</Button>
								<Button style={{ marginLeft: "10px" }} onClick={handleCancel}>
									Cancel
								</Button>
							</Form.Item>
						</Form>
					</Modal>
					<Modal title="Patient Schedules" open={scheduleModalOpen} onCancel={handleScheduleCancel} footer={null} width={1000}>
						{patientSchedules.length > 0 ? (
							<Table columns={schedulesColumns} dataSource={patientSchedules} rowKey="key" />
						) : (
							<p>No schedules for assigned patients.</p>
						)}
					</Modal>
				</Content>
			</Layout>
		</Layout>
	);
};

export default NurseDashboard;
