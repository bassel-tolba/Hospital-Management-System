import React, { useState, useEffect, useCallback } from "react";
import { Table, Input, Button, Space, Typography, notification, Form, Select } from "antd";
import { useUserStore } from "../../services/user.service";
import { useUnitStore } from "../../services/unit.service";
import { usePatientStore } from "../../services/patient.service";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import UserFormModal from "./UserFormModal";
import debounce from "lodash/debounce"; // Import debounce

const { Title } = Typography;

const UserList = () => {
	const {
		users,
		loading,
		total,
		searchUsers,
		deleteUser,
		updateUser,
		clearError,
		setLoading,
		getUsersByRole,
		currentUser,
		getCurrentUser,
		updateUserPatients,
		updateUserRooms,
		updateUserUnits,
	} = useUserStore();
	const { units, fetchAllUnits, loading: unitLoading } = useUnitStore();
	const { patients, searchPatients, loading: patientLoading } = usePatientStore();

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("");

	useEffect(() => {
		fetchAllUnits();
		getCurrentUser();
	}, [fetchAllUnits, getCurrentUser]);

	useEffect(() => {
		fetchUsers();
	}, [page, size, searchParams, roleFilter, getUsersByRole, searchUsers]); // added getUsersByRole and searchUsers to the dependency array

	const fetchUsers = async () => {
		setLoading(true);
		try {
			if (roleFilter) {
				await getUsersByRole(roleFilter);
			} else {
				await searchUsers({ ...searchParams, page, size });
			}
		} catch (error) {
			console.error("Error fetching users:", error);
			notification.error({
				message: "Error",
				description: `Failed to load users : ${error.message}`,
			});
			clearError();
		} finally {
			setLoading(false);
		}
	};

	const showModal = (user) => {
		setSelectedUser(user);
		if (user) {
			form.setFieldsValue({
				...user,
				unitIds: user.unitIds,
				roomIds: user.roomIds,
				patientIds: user.patientIds,
			});
		} else {
			form.resetFields();
		}

		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedUser(null);
		form.resetFields();
	};
	const handleRoleChange = (value) => {
		setRoleFilter(value);
		setPage(0);
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();

			// Prepare the core user data for the /api/users/{id} update endpoint
			const { unitIds, roomIds, patientIds, ...coreUserData } = values;

			if (selectedUser) {
				// Call the unit, room and patient endpoints first
				if (unitIds && unitIds.length > 0) {
					await updateUserUnits(selectedUser.id, unitIds);
				}
				if (roomIds && roomIds.length > 0) {
					await updateUserRooms(selectedUser.id, roomIds);
				}
				if (patientIds && patientIds.length > 0) {
					await updateUserPatients(selectedUser.id, patientIds);
				}

				// Call the core user update endpoint with only the core user data
				await updateUser(selectedUser.id, coreUserData);
			}
			fetchUsers();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedUser(null);
		} catch (error) {
			console.error("Error in handle form submit", error);
			notification.error({
				message: "Error",
				description: `Failed to update user: ${error.message}`,
			});
		}
	};

	const handleDelete = async (userId) => {
		try {
			await deleteUser(userId);
			fetchUsers();
		} catch (error) {
			console.error("Error deleting user:", error);
			notification.error({
				message: "Error",
				description: `Failed to delete user: ${error.message}`,
			});
		}
	};

	const handleTableChange = (pagination) => {
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	const handleSearch = useCallback(
		debounce((value) => {
			setSearchParams({ search: value });
			setPage(0);
		}, 500),
		[setSearchParams, setPage] // Added setPage and setSearchParams to the dependency array
	);

	const handleInputChange = (e) => {
		const { value } = e.target;
		setSearchTerm(value);
		handleSearch(value);
	};

	const columns = [
		{
			title: "Username",
			dataIndex: "username",
			key: "username",
		},

		{
			title: "Role",
			dataIndex: "role",
			key: "role",
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
			title: "Specialty",
			dataIndex: "specialty",
			key: "specialty",
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
						Edit
					</Button>
					<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
						Delete
					</Button>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 20 }}>
			<Title level={2}>User List</Title>
			<Space style={{ marginBottom: 16 }}>
				<Input.Search placeholder="Search by username, role..." onChange={handleInputChange} style={{ width: 300 }} />
				<Select placeholder="Filter by Role" style={{ width: 150 }} onChange={handleRoleChange} allowClear>
					<Select.Option value="ADMIN">Admin</Select.Option>
					<Select.Option value="NURSE">Nurse</Select.Option>
					<Select.Option value="DOCTOR">Doctor</Select.Option>
					<Select.Option value="PATIENT">Patient</Select.Option>
					<Select.Option value="RECEPTIONIST">Receptionist</Select.Option>
					<Select.Option value="PHARMACIST">Pharmacist</Select.Option>
				</Select>
			</Space>

			<Table
				columns={columns}
				dataSource={users}
				loading={loading}
				rowKey="id"
				pagination={{
					current: page + 1,
					pageSize: size,
					total: total,
					onChange: handleTableChange,
				}}
			/>
			<UserFormModal
				isVisible={isModalVisible}
				onCancel={handleCancel}
				onSubmit={handleFormSubmit}
				form={form}
				loading={unitLoading || patientLoading}
				selectedUser={selectedUser}
				currentUser={currentUser}
			/>
		</div>
	);
};

export default UserList;
