// frontend/src/components/User/UserList.js
import React, { useState, useEffect, useCallback } from "react";
import { Table, Input, Button, Space, Typography, notification, Form, Select, Avatar } from "antd"; // Import Avatar
import { useUserStore } from "../../services/user.service";
import { useUnitStore } from "../../services/unit.service";
import { usePatientStore } from "../../services/patient.service";
import { useRoleStore } from "../../services/role.service";
import { useAuthStore } from "../../services/auth.service";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import UserFormModal from "./UserFormModal";
import debounce from "lodash/debounce";

const { Title } = Typography;
const { Option } = Select;

const UserList = () => {
	const {
		users,
		loading,
		total,
		searchUsers,
		deleteUser,
		updateUser,
		clearError,
		getUsersByRole,
		currentUser,
		getCurrentUser,
		updateUserPatients,
		updateUserRooms,
		updateUserUnits,
		createUser,
	} = useUserStore();
	const { hasAuthority } = useAuthStore();
	const { units, fetchAllUnits, loading: unitLoading } = useUnitStore();
	const { patients, searchPatients, loading: patientLoading } = usePatientStore();
	const { roles, fetchAllRoles, loading: rolesLoading } = useRoleStore(); // Get roles and loading state

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState(null);

	useEffect(() => {
		fetchAllUnits();
		fetchAllRoles();
		getCurrentUser();
	}, [fetchAllUnits, getCurrentUser, fetchAllRoles]);

	useEffect(() => {
		fetchUsers();
	}, [page, size, searchParams, roleFilter]);

	const fetchUsers = async () => {
		clearError();
		try {
			if (roleFilter) {
				await getUsersByRole(roleFilter);
			} else {
				// Always pass page and size for consistent pagination
				await searchUsers({ ...searchParams, page: page - 1, size });
			}
		} catch (error) {
			console.error("Error fetching users:", error);
			// Error handling is delegated to the service
		}
	};
	const transformImageUrl = (url) => {
		if (!url) return null;
		let fileUrl = url;
		if (fileUrl.startsWith(".")) {
			fileUrl = fileUrl.substring(1);
		}
		return `http://localhost:8080${fileUrl}`;
	};
	const showModal = (user) => {
		setSelectedUser(user);
		if (user) {
			form.setFieldsValue({
				...user,
				roleId: user.roleId,
				unitIds: user.unitIds || [], // Ensure arrays
				roomIds: user.roomIds || [], // Ensure arrays
				patientIds: user.patientIds || [], // Ensure arrays
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
		setPage(1); // Reset to first page when changing role filter
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			const { unitIds, roomIds, patientIds, profilePicture, ...coreUserData } = values;

			let removedProfilePictureUrl = null;
			if (selectedUser && selectedUser.profilePictureURL && !profilePicture) {
				removedProfilePictureUrl = selectedUser.profilePictureURL;
			}

			let updatedUser;

			if (selectedUser) {
				if (!hasAuthority("UPDATE_USER")) {
					notification.error({ message: "Error", description: "You do not have permission to update users." });
					return;
				}
				// Update core user data
				updatedUser = await updateUser(selectedUser.id, coreUserData, profilePicture, removedProfilePictureUrl);
			} else {
				if (!hasAuthority("CREATE_USER")) {
					notification.error({ message: "Error", description: "You do not have permission to create users." });
					return;
				}
				// Create user, and get the created user's ID.
				updatedUser = await createUser(coreUserData, profilePicture);
			}

			// Update related entities only if the arrays are not empty, and *after* core user creation/update
			if (unitIds && unitIds.length > 0) {
				await updateUserUnits(updatedUser.id, unitIds);
			}
			if (roomIds && roomIds.length > 0) {
				await updateUserRooms(updatedUser.id, roomIds);
			}
			if (patientIds && patientIds.length > 0) {
				await updateUserPatients(updatedUser.id, patientIds);
			}

			fetchUsers();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedUser(null);
		} catch (error) {
			console.error("Error in handle form submit", error);
			notification.error({
				message: "Error",
				description: `Failed to ${selectedUser ? "update" : "create"} user: ${error.message}`,
			});
		}
	};

	const handleDelete = async (userId) => {
		if (!hasAuthority("DELETE_USER")) {
			notification.error({ message: "Error", description: "You do not have permission to delete users." });
			return; // Prevent the delete
		}
		try {
			await deleteUser(userId);
			fetchUsers();
		} catch (error) {
			console.error("Error deleting user:", error);
		}
	};

	const handleTableChange = (pagination) => {
		setPage(pagination.current);
		setSize(pagination.pageSize);
	};

	const handleSearch = useCallback(
		debounce((value) => {
			setSearchParams({ search: value });
			setPage(1); // Reset to the first page on new search
		}, 500),
		[]
	);
	const handleInputChange = (e) => {
		const { value } = e.target;
		setSearchTerm(value); // Update local search term state
		handleSearch(value); // Call debounced search
	};

	const columns = [
		// New column for profile picture
		{
			title: "Profile Picture",
			dataIndex: "profilePictureURL",
			key: "profilePictureURL",
			render: (text, record) => (
				<Avatar
					size={40}
					src={record.profilePictureURL ? transformImageUrl(record.profilePictureURL) : null}
					style={{ objectFit: "cover", border: "2px solid #ddd", borderColor: "snow" }}
				/>
			),
		},
		{
			title: "Username",
			dataIndex: "username",
			key: "username",
		},
		{
			title: "Role",
			dataIndex: "roleName",
			key: "roleName",
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
					{/* Edit button - only shown if the user has UPDATE_USER permission */}
					{hasAuthority("UPDATE_USER") && (
						<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record)}>
							Edit
						</Button>
					)}
					{/* Delete button - only shown if the user has DELETE_USER permission */}
					{hasAuthority("DELETE_USER") && (
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
			<Title level={2}>User List</Title>
			<Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", width: "100%" }}>
				<Input.Search
					placeholder="Search by username, role..."
					onChange={handleInputChange}
					style={{ width: 300 }}
					value={searchTerm} // Controlled input
				/>
				<Space>
					<Select
						placeholder="Filter by Role"
						style={{ width: 150 }}
						onChange={handleRoleChange}
						allowClear
						loading={rolesLoading} // Show loading indicator
					>
						{roles.map((role) => (
							<Option key={role.id} value={role.id}>
								{role.name}
							</Option>
						))}
					</Select>
					{/* Create User button */}
					{hasAuthority("CREATE_USER") && (
						<Button type="default" onClick={() => showModal(null)}>
							Add User
						</Button>
					)}
				</Space>
			</Space>

			<Table
				columns={columns}
				dataSource={users}
				loading={loading}
				rowKey="id"
				pagination={{
					current: page, // Use Ant Design's current directly
					pageSize: size,
					total: total,
					onChange: handleTableChange, // Simplified change handler
					showSizeChanger: true,
				}}
			/>

			<UserFormModal
				isVisible={isModalVisible}
				onCancel={handleCancel}
				onSubmit={handleFormSubmit}
				form={form}
				loading={unitLoading || patientLoading || rolesLoading}
				selectedUser={selectedUser}
				currentUser={currentUser}
			/>
		</div>
	);
};

export default UserList;
