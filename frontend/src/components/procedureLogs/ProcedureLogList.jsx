import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Space, Typography, Modal, Form, Select, Input, AutoComplete, Tooltip, Pagination, Card, Descriptions, Tag } from "antd";
import { useAuthStore } from "../../services/auth.service";
import { useProcedureStore } from "../../services/procedure.service";
import { useUserStore } from "../../services/user.service";
import { usePatientStore } from "../../services/patient.service";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { format, formatDistance, isToday, isYesterday, differenceInDays, differenceInMonths } from "date-fns";
import axios from "axios";
import { notification } from "antd"; // Import notification

const { Title } = Typography;
const { Option } = Select;
const PROCEDURE_LOG_API_BASE_URL = `http://localhost:8080/api/procedure-logs`;
const formatRelativeTime = (localDateTime) => {
	if (!localDateTime) return "N/A";

	const date = new Date(localDateTime);
	const now = new Date();

	if (isToday(date)) {
		return format(date, "HH:mm");
	}

	if (isYesterday(date)) {
		return "Yesterday";
	}

	const daysAgo = differenceInDays(now, date);
	if (daysAgo > 1 && daysAgo < 30) {
		return `${daysAgo} days ago`;
	}

	const monthsAgo = differenceInMonths(now, date);
	if (monthsAgo >= 1) {
		return `${monthsAgo} month ago`;
	}

	return formatDistance(date, now, { addSuffix: true });
};

const formatExactTime = (localDateTime) => {
	if (!localDateTime) return "N/A";

	const date = new Date(localDateTime);
	return format(date, "dd MMM yyyy, HH:mm:ss");
};

const ProcedureLogList = () => {
	const { users, getAllUsers } = useUserStore();
	const { user, hasAuthority } = useAuthStore(); // Get hasAuthority
	const { procedures, getAllProcedures } = useProcedureStore();
	const { searchPatients } = usePatientStore();

	const [procedureLogs, setProcedureLogs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedLog, setSelectedLog] = useState(null);
	const [form] = Form.useForm();
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [selectedUser, setSelectedUser] = useState(null);
	const [procedureOptions, setProcedureOptions] = useState([]);
	const [selectedProcedure, setSelectedProcedure] = useState(null);
	const [patientOptions, setPatientOptions] = useState([]);
	const [selectedPatient, setSelectedPatient] = useState(null);

	// Define permission checks
	const canReadProcedureLog = hasAuthority("READ_PROCEDURE_LOG"); // Assuming you have a READ permission
	const canCreateProcedureLog = hasAuthority("CREATE_PROCEDURE_LOG");
	const canUpdateProcedureLog = hasAuthority("UPDATE_PROCEDURE_LOG"); // Assuming you might want an UPDATE permission
	const canDeleteProcedureLog = hasAuthority("DELETE_PROCEDURE_LOG");

	const fetchAllUsersWithMap = useCallback(async () => {
		const allUsers = await getAllUsers();
		const userMap = {};
		allUsers?.forEach((user) => (userMap[user.id] = user));
		return userMap;
	}, [getAllUsers]);
	const [fetchedUsers, setFetchedUsers] = useState({});

	const fetchProcedureLogs = useCallback(async () => {
		setLoading(true);
		if (!canReadProcedureLog) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to view procedure logs.",
			});
			setLoading(false);
			return; // Stop execution if no permission
		}
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(PROCEDURE_LOG_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			setProcedureLogs(response.data);
			setTotal(response.data.length); // Update total from response
		} catch (error) {
			console.error("Error fetching procedure logs:", error);
			notification.error({
				// Show a notification for the error
				message: "Error",
				description: "Failed to fetch procedure logs.",
			});
		} finally {
			setLoading(false);
		}
	}, [canReadProcedureLog]);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			await getAllUsers();
			const procedureResponse = await getAllProcedures();
			// Correctly extract the data from the content array.
			setProcedureOptions(procedureResponse?.content || []);

			await fetchProcedureLogs();
			const fetchedUsers = await fetchAllUsersWithMap();
			setFetchedUsers(fetchedUsers);
			setLoading(false);
		};
		fetchData();
	}, [fetchProcedureLogs, getAllUsers, fetchAllUsersWithMap, getAllProcedures]);

	const handlePageChange = (page, pageSize) => {
		setCurrentPage(page);
		setPageSize(pageSize);
	};

	const showModal = (log) => {
		if (!canCreateProcedureLog && !log) {
			// Check permission before showing the modal for adding
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to add procedure logs.",
			});
			return;
		}
		if (log && !canUpdateProcedureLog) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to edit procedure logs.",
			});
			return;
		}

		setSelectedLog(log);
		setSelectedUser(null);
		setSelectedProcedure(null);
		setSelectedPatient(null);

		if (log) {
			form.setFieldsValue(log);
			const user = fetchedUsers[log.userId];
			if (user) {
				form.setFieldsValue({ userId: user.id });
				setSelectedUser(user);
			}
			if (log.procedureId) {
				form.setFieldsValue({ procedureId: log.procedureId });
				const procedure = procedureOptions?.find((p) => p.id === log.procedureId); // Use procedureOptions here
				setSelectedProcedure(procedure);
			}
		} else {
			form.resetFields();
			if (user) {
				form.setFieldsValue({ userId: user.id });
			}
		}
		setIsModalVisible(true);
		setPatientOptions([]);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedLog(null);
		setSelectedUser(null);
		setSelectedProcedure(null);
		setSelectedPatient(null);
		form.resetFields();
		setPatientOptions([]);
	};
	const handleProcedureSearch = async (value) => {
		if (value) {
			try {
				const searchResults = await searchPatients({ searchTerm: value, page: 0, size: 10 }); // Use page 0 and size 10 for initial search
				setPatientOptions(
					searchResults?.content?.map((patient) => ({
						label: `${patient.firstName} ${patient.lastName}`,
						value: patient.id,
						patient,
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

	const handleProcedureSelect = (value, option) => {
		const selectedPatient = option?.patient;
		setSelectedPatient(selectedPatient);
		form.setFieldsValue({ billingId: value });
	};

	const handleFormSubmit = async () => {
		if (selectedLog && !canUpdateProcedureLog) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to update procedure logs.",
			});
			return;
		}
		if (!selectedLog && !canCreateProcedureLog) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to create procedure logs.",
			});
			return;
		}
		try {
			const values = await form.validateFields();
			const payload = {
				...values,
			};

			if (selectedUser) {
				payload.userId = selectedUser.id;
			}
			if (selectedProcedure) {
				payload.procedureId = selectedProcedure.id;
			}
			// Add the patientId here. Make sure it's set from the patient selection
			if (selectedPatient) {
				payload.patientId = selectedPatient.id;
				payload.billingId = selectedPatient.id;
			}
			const user = useAuthStore.getState().user;
			if (selectedLog) {
				await axios.put(`${PROCEDURE_LOG_API_BASE_URL}/${selectedLog.id}`, payload, {
					headers: {
						Authorization: `Bearer ${user?.token}`,
					},
				});
			} else {
				await axios.post(PROCEDURE_LOG_API_BASE_URL, payload, {
					headers: {
						Authorization: `Bearer ${user?.token}`,
					},
				});
			}

			fetchProcedureLogs();
			setIsModalVisible(false);
			setSelectedLog(null);
			form.resetFields();
			setSelectedUser(null);
			setSelectedProcedure(null);
			setSelectedPatient(null);
			setPatientOptions([]);
		} catch (error) {
			console.error("Error submitting form:", error);
			notification.error({
				message: "Error",
				description: "Failed to save procedure log.",
			});
		}
	};

	const handleDelete = async (logId) => {
		if (!canDeleteProcedureLog) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to delete procedure logs.",
			});
			return;
		}
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${PROCEDURE_LOG_API_BASE_URL}/${logId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			fetchProcedureLogs();
		} catch (error) {
			console.error("Error deleting log:", error);
			notification.error({
				message: "Error",
				description: "Failed to delete procedure log.",
			});
		}
	};

	const getUserName = (userId) => {
		const user = fetchedUsers[userId];
		return user ? `${user.firstName} ${user.lastName}` : "N/A";
	};
	const getProcedureName = (procedureId) => {
		const procedure = procedureOptions?.find((p) => p.id === procedureId); // Use procedureOptions here
		return procedure ? procedure.name : "N/A";
	};

	const columns = [
		{
			title: "User",
			dataIndex: "userId",
			key: "user",
			render: (userId) => (canReadProcedureLog ? getUserName(userId) : "***"),
		},
		{
			title: "Procedure",
			dataIndex: "procedureId",
			key: "procedure",
			render: (procedureId) => (canReadProcedureLog ? getProcedureName(procedureId) : "***"),
		},

		{
			title: "Start Time",
			dataIndex: "startTime",
			key: "startTime",
			render: (text) => (canReadProcedureLog ? <Tooltip title={formatExactTime(text)}>{formatRelativeTime(text)}</Tooltip> : "***"),
		},
		{
			title: "End Time",
			dataIndex: "endTime",
			key: "endTime",
			render: (text) =>
				canReadProcedureLog ? text ? <Tooltip title={formatExactTime(text)}>{formatRelativeTime(text)}</Tooltip> : "N/A" : "***",
		},

		{
			title: "Notes",
			dataIndex: "notes",
			key: "notes",
			render: (text) => (canReadProcedureLog ? text : "***"),
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{canUpdateProcedureLog && (
						<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record)}>
							Edit
						</Button>
					)}
					{canDeleteProcedureLog && (
						<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
							Delete
						</Button>
					)}
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 20 }}>
			<Title level={2}>Procedure Logs</Title>
			<Space style={{ marginBottom: 16 }}>
				{canCreateProcedureLog && (
					<Button type="default" onClick={() => showModal(null)}>
						Add New Log
					</Button>
				)}
			</Space>
			<Table columns={columns} dataSource={procedureLogs} loading={loading} rowKey="id" pagination={false} />
			<Pagination current={currentPage} pageSize={pageSize} total={total} onChange={handlePageChange} style={{ marginTop: 20 }} />

			<Modal
				title={selectedLog ? "Edit Procedure Log" : "Add Procedure Log"}
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button
						key="submit"
						type="default"
						onClick={handleFormSubmit}
						disabled={(!canCreateProcedureLog && !selectedLog) || (!canUpdateProcedureLog && selectedLog)}>
						{selectedLog ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical">
					<Form.Item
						label="Patient"
						name="billingId"
						rules={[
							{
								required: false,
								message: "Please select a patient",
							},
						]}>
						<AutoComplete
							options={patientOptions}
							onSearch={handleProcedureSearch}
							onSelect={handleProcedureSelect}
							placeholder="Search for a patient"
							disabled={(!canCreateProcedureLog && !selectedLog) || (!canUpdateProcedureLog && selectedLog)} // Disable based on permissions
							filterOption={false}
						/>
					</Form.Item>
					{user ? (
						<Form.Item label="User" name="userId">
							<Input disabled value={`${user.firstName} ${user.lastName}`} />
						</Form.Item>
					) : (
						<Form.Item label="User" name="userId" rules={[{ required: true, message: "Please select a user" }]}>
							<Select
								placeholder="Select a user"
								disabled={(!canCreateProcedureLog && !selectedLog) || (!canUpdateProcedureLog && selectedLog)}>
								{users?.map((user) => (
									<Option key={user.id} value={user.id}>
										{`${user.firstName} ${user.lastName}`}
									</Option>
								))}
							</Select>
						</Form.Item>
					)}
					<Form.Item label="Procedure" name="procedureId" rules={[{ required: true, message: "Please select a procedure" }]}>
						<Select
							placeholder="Select a procedure"
							disabled={(!canCreateProcedureLog && !selectedLog) || (!canUpdateProcedureLog && selectedLog)}>
							{procedureOptions?.map(
								(
									procedure // Use procedureOptions here
								) => (
									<Option key={procedure.id} value={procedure.id}>
										{`${procedure.name}`}
									</Option>
								)
							)}
						</Select>
					</Form.Item>
					<Form.Item label="Notes" name="notes">
						<Input.TextArea disabled={(!canCreateProcedureLog && !selectedLog) || (!canUpdateProcedureLog && selectedLog)} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default ProcedureLogList;
