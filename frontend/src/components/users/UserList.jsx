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
		return `${fileUrl}`;
	};
	const showModal = (user) => {
		console.log("showModal called with user:", user);
		setSelectedUser(user);
		if (user) {
			form.setFieldsValue({
				...user,
				roleId: user.roleId,
				unitIds: user.unitIds || [], // Ensure arrays
				roomIds: user.roomIds || [], // Ensure arrays
				patientIds: user.patientIds || [], // Ensure arrays
			});
			console.log("Form values after setFieldsValue:", form.getFieldsValue());
		} else {
			form.resetFields();
			console.log("Form values after resetFields:", form.getFieldsValue());
		}
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		console.log("handleCancel called");
		setIsModalVisible(false);
		setSelectedUser(null);
		form.resetFields();
		console.log("Form values after resetFields in handleCancel:", form.getFieldsValue());
	};
	const handleRoleChange = (value) => {
		setRoleFilter(value);
		setPage(1); // Reset to first page when changing role filter
	};

	const handleFormSubmit = async () => {
		console.log("handleFormSubmit called");
		try {
			const values = await form.validateFields();
			console.log("Form values after validateFields:", values);

			const { unitIds, roomIds, patientIds, profilePicture, ...coreUserData } = values;
			console.log("Core user data:", coreUserData);
			console.log("unitIds:", unitIds);
			console.log("roomIds:", roomIds);
			console.log("patientIds:", patientIds);

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
				console.log("Updated user (core data):", updatedUser);
			} else {
				if (!hasAuthority("CREATE_USER")) {
					notification.error({ message: "Error", description: "You do not have permission to create users." });
					return;
				}
				// Create user, and get the created user's ID.
				updatedUser = await createUser(coreUserData, profilePicture);
				console.log("Created user:", updatedUser);
			}

			// Update related entities only if the arrays are not empty, and *after* core user creation/update
			if (unitIds && unitIds.length > 0) {
				console.log("Calling updateUserUnits with userId:", updatedUser.id, "and unitIds:", unitIds);
				await updateUserUnits(updatedUser.id, unitIds);
			}
			if (roomIds && roomIds.length > 0) {
				console.log("Calling updateUserRooms with userId:", updatedUser.id, "and roomIds:", roomIds);
				await updateUserRooms(updatedUser.id, roomIds);
			}
			if (patientIds && patientIds.length > 0) {
				console.log("Calling updateUserPatients with userId:", updatedUser.id, "and patientIds:", patientIds);
				await updateUserPatients(updatedUser.id, patientIds);
			}
			// Move fetchUsers *after* the modal is closed and form is reset
			setIsModalVisible(false);
			form.resetFields();
			setSelectedUser(null);
			fetchUsers(); //  <--- MOVED HERE
		} catch (error) {
			console.error("Error in handle form submit", error);
			notification.error({
				message: "Error",
				description: `Failed to ${selectedUser ? "update" : "create"} user: ${error.message}`,
			});
		}
	};

	const handleDelete = async (userId) => {
		console.log("handleDelete called with userId:", userId);
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
		console.log("handleTableChange called with pagination:", pagination);
		setPage(pagination.current);
		setSize(pagination.pageSize);
	};

	const handleSearch = useCallback(
		debounce((value) => {
			console.log("handleSearch (debounced) called with value:", value);
			setSearchParams({ search: value });
			setPage(1); // Reset to the first page on new search
		}, 500),
		[]
	);
	const handleInputChange = (e) => {
		const { value } = e.target;
		console.log("handleInputChange called with value:", value);
		setSearchTerm(value); // Update local search term state
		handleSearch(value); // Call debounced search
	};

	const columns = [
		{
			title: "Profile Picture",
			dataIndex: "profilePictureURL",
			key: "profilePictureURL",
			responsive: ["md"], // Only show on medium screens and up
			render: (text, record) => (
				<Avatar
					size={window.innerWidth <= 768 ? 30 : 40}
					src={record.profilePictureURL ? transformImageUrl(record.profilePictureURL) : null}
					style={{ objectFit: "cover", border: "2px solid #ddd", borderColor: "snow" }}
				/>
			),
		},
		{
			title: "Username",
			dataIndex: "username",
			key: "username",
			ellipsis: true,
		},
		{
			title: "Role",
			dataIndex: "roleName",
			key: "roleName",
			responsive: ["sm"], // Only show on small screens and up
			ellipsis: true,
		},
		{
			title: "First Name",
			dataIndex: "firstName",
			key: "firstName",
			responsive: ["sm"], // Only show on small screens and up
			ellipsis: true,
		},
		{
			title: "Last Name",
			dataIndex: "lastName",
			key: "lastName",
			responsive: ["sm"], // Only show on small screens and up
			ellipsis: true,
		},
		{
			title: "Specialty",
			dataIndex: "specialty",
			key: "specialty",
			responsive: ["md"], // Only show on medium screens and up
			ellipsis: true,
		},
		{
			title: "Actions",
			key: "actions",
			fixed: "right", // Keep actions visible when scrolling horizontally
			render: (text, record) => (
				<Space size="small" wrap>
					{hasAuthority("UPDATE_USER") && (
						<Button
							type="default"
							icon={<EditOutlined />}
							onClick={() => showModal(record)}
							size={window.innerWidth <= 768 ? "small" : "middle"}>
							{window.innerWidth > 768 ? "Edit" : ""}
						</Button>
					)}
					{hasAuthority("DELETE_USER") && (
						<Button
							type="danger"
							icon={<DeleteOutlined />}
							onClick={() => handleDelete(record.id)}
							size={window.innerWidth <= 768 ? "small" : "middle"}>
							{window.innerWidth > 768 ? "Delete" : ""}
						</Button>
					)}
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: "10px" }}>
			<Title level={2}>User List</Title>
			<Space
				direction="vertical"
				style={{
					marginBottom: 16,
					width: "100%",
				}}>
				<div
					style={{
						display: "flex",
						flexDirection: window.innerWidth <= 768 ? "column" : "row",
						gap: "10px",
						justifyContent: "space-between",
						width: "100%",
					}}>
					<Input.Search
						placeholder="Search by username, role..."
						onChange={handleInputChange}
						style={{
							width: window.innerWidth <= 768 ? "100%" : 300,
						}}
						value={searchTerm}
					/>
					<Space
						direction={window.innerWidth <= 768 ? "vertical" : "horizontal"}
						style={{ width: window.innerWidth <= 768 ? "100%" : "auto" }}>
						<Select
							placeholder="Filter by Role"
							style={{ width: window.innerWidth <= 768 ? "100%" : 150 }}
							onChange={handleRoleChange}
							allowClear
							loading={rolesLoading}>
							{roles.map((role) => (
								<Option key={role.id} value={role.id}>
									{role.name}
								</Option>
							))}
						</Select>
						{hasAuthority("CREATE_USER") && (
							<Button type="default" onClick={() => showModal(null)} style={{ width: window.innerWidth <= 768 ? "100%" : "auto" }}>
								Add User
							</Button>
						)}
					</Space>
				</div>
			</Space>

			<Table
				columns={columns}
				dataSource={users}
				loading={loading}
				rowKey="id"
				pagination={{
					current: page,
					pageSize: size,
					total: total,
					onChange: handleTableChange,
					showSizeChanger: true,
					responsive: true,
				}}
				scroll={{ x: true }} // Enable horizontal scrolling for small screens
				style={{ overflowX: "auto" }} // Ensure table container is scrollable
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
