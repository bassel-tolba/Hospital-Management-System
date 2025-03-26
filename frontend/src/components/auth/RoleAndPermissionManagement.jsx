import React, { useState, useEffect, useMemo } from "react";
import { Form, Button, Typography, Space, Table, Modal, Input, Tree, Row, Col } from "antd"; // Import Row and Col
import { useRoleStore } from "../../services/role.service";
import { usePermissionStore } from "../../services/permission.service";
import styled, { keyframes } from "styled-components";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Search } = Input;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AnimatedTitle = styled(Title)`
	animation: ${fadeIn} 0.5s ease-out;
	text-align: center;
	margin-bottom: 1rem;
`;

const RoleAndPermissionManagement = () => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedRole, setSelectedRole] = useState(null);
	const [selectedPermissions, setSelectedPermissions] = useState([]);
	const [permissionSearchTerm, setPermissionSearchTerm] = useState("");

	const { roles, loading: rolesLoading, fetchAllRoles, createRole, updateRole, deleteRole } = useRoleStore();
	const { permissions, fetchAllPermissions, loading: permissionsLoading } = usePermissionStore();

	const [roleForm] = Form.useForm();

	useEffect(() => {
		fetchAllRoles();
		fetchAllPermissions();
	}, [fetchAllRoles, fetchAllPermissions]);

	// --- Permission Groups (Updated with new permissions) ---
	const permissionGroups = useMemo(
		() => ({
			"Patient Management": ["CREATE_PATIENT", "READ_PATIENT", "UPDATE_PATIENT", "DELETE_PATIENT"],
			"Appointment Management": [
				// Renamed for clarity
				"CREATE_APPOINTMENT",
				"READ_APPOINTMENT",
				"UPDATE_APPOINTMENT",
				"DELETE_APPOINTMENT",
			],
			"Clinical Records": [
				// Grouped clinical data entry/view
				"CREATE_ASSESSMENT",
				"READ_ASSESSMENT",
				"UPDATE_ASSESSMENT",
				"DELETE_ASSESSMENT",
				"CREATE_NURSING_CARE_PLAN",
				"READ_NURSING_CARE_PLAN",
				"UPDATE_NURSING_CARE_PLAN",
				"DELETE_NURSING_CARE_PLAN",
				"CREATE_VITAL_SIGN",
				"READ_VITAL_SIGN",
				"UPDATE_VITAL_SIGN",
				"DELETE_VITAL_SIGN",
				"CREATE_CARE_PLAN_GOAL",
				"READ_CARE_PLAN_GOAL",
				"UPDATE_CARE_PLAN_GOAL",
				"DELETE_CARE_PLAN_GOAL",
			],
			"User Management": ["CREATE_USER", "READ_USER", "UPDATE_USER", "DELETE_USER"],
			"User Activities": [
				// Separated Activities
				"CREATE_USER_ACTIVITY",
				"READ_USER_ACTIVITY",
				"UPDATE_USER_ACTIVITY",
				"DELETE_USER_ACTIVITY",
			],
			"Medication & Pharmacy": [
				// Combined Medication, Prescription, Admin
				"CREATE_MEDICATION",
				"READ_MEDICATION",
				"UPDATE_MEDICATION",
				"DELETE_MEDICATION",
				"UPDATE_MEDICATION_STOCK",
				"READ_MEDICATION_HISTORY",
				"DELETE_MEDICATION_HISTORY", // New
				"CREATE_PRESCRIPTION",
				"READ_PRESCRIPTION",
				"UPDATE_PRESCRIPTION",
				"DELETE_PRESCRIPTION",
				"CREATE_PRESCRIBED_MEDICATION",
				"READ_PRESCRIBED_MEDICATION",
				"UPDATE_PRESCRIBED_MEDICATION",
				"DELETE_PRESCRIBED_MEDICATION",
				"CREATE_MEDICATION_ADMINISTRATION",
				"READ_MEDICATION_ADMINISTRATION",
				"DELETE_MEDICATION_ADMINISTRATION",
				"ADMINISTER_MEDICATION", // Added explicit action
			],
			"Location Management": [
				// Grouped Unit, Room, Bed
				"CREATE_UNIT",
				"READ_UNIT",
				"UPDATE_UNIT",
				"DELETE_UNIT",
				"CREATE_ROOM",
				"READ_ROOM",
				"UPDATE_ROOM",
				"DELETE_ROOM",
				"CREATE_BED",
				"READ_BED",
				"UPDATE_BED",
				"DELETE_BED",
				"MANAGE_BEDS", // New
			],
			"Admission Management": [
				"CREATE_ADMISSION",
				"READ_ADMISSION",
				"UPDATE_ADMISSION",
				"DELETE_ADMISSION",
				"MANAGE_ADMISSION_TYPES", // New
			],
			"Lab & Imaging": [
				// Combined Lab and Image reports/types
				"CREATE_LAB_TEST",
				"READ_LAB_TEST",
				"UPDATE_LAB_TEST", // Added
				"DELETE_LAB_TEST", // Added
				"CREATE_LAB_RESULT",
				"READ_LAB_RESULT",
				"UPDATE_LAB_RESULT", // Added
				"DELETE_LAB_RESULT",
				"CREATE_IMAGE_REPORT",
				"READ_IMAGE_REPORT",
				"UPDATE_IMAGE_REPORT",
				"DELETE_IMAGE_REPORT",
				"CREATE_IMAGE_REPORT_TYPE",
				"READ_IMAGE_REPORT_TYPE",
				"UPDATE_IMAGE_REPORT_TYPE",
				"DELETE_IMAGE_REPORT_TYPE",
			],
			"Inventory & Products": [
				// Renamed for clarity
				"CREATE_PRODUCT",
				"READ_PRODUCT",
				"UPDATE_PRODUCT",
				"DELETE_PRODUCT",
				"UPDATE_PRODUCT_STOCK", // New
				"READ_PRODUCT_HISTORY", // New
				"DELETE_PRODUCT_HISTORY", // New
				"CREATE_PATIENT_PRODUCT_USAGE",
				"READ_PATIENT_PRODUCT_USAGE",
				"DELETE_PATIENT_PRODUCT_USAGE",
			],
			"Procedure Management": [
				"CREATE_PROCEDURE",
				"READ_PROCEDURE",
				"UPDATE_PROCEDURE",
				"DELETE_PROCEDURE",
				"CREATE_PROCEDURE_LOG",
				"READ_PROCEDURE_LOG",
				"DELETE_PROCEDURE_LOG",
			],
			"Billing & Finance": ["CREATE_BILLING", "READ_BILLING", "UPDATE_BILLING", "DELETE_BILLING"],
			"Document Management": [
				"CREATE_DOCUMENT",
				"READ_DOCUMENT",
				"UPDATE_DOCUMENT",
				"DELETE_DOCUMENT",
				"CREATE_DOCUMENT_TYPE",
				"READ_DOCUMENT_TYPE", // Added
				"UPDATE_DOCUMENT_TYPE",
				"DELETE_DOCUMENT_TYPE",
			],
			"Dashboard & Reporting": [
				// New Group
				"READ_DASHBOARD", // New
				// Add other reporting permissions here if created
			],
			"Security & Roles": [
				// Renamed for clarity
				"MANAGE_ROLES",
				"CREATE_ROLE",
				"UPDATE_ROLE",
				"DELETE_ROLE",
				"MANAGE_PERMISSIONS",
				"CREATE_PERMISSION",
				"UPDATE_PERMISSION",
				"DELETE_PERMISSION",
			],
			// Removed "Doctor Management" as doctors are users.
		}),
		[]
	);

	// --- Helper function to create tree data (remains the same) ---
	const createTreeData = useMemo(
		() => (groups, perms) => {
			if (!perms || perms.length === 0) {
				return []; // Return empty array if permissions haven't loaded
			}

			const permMap = new Map(perms.map((p) => [p.name, p]));
			const tree = [];

			// Sort group keys alphabetically for consistent order
			const sortedGroupNames = Object.keys(groups).sort();

			for (const groupName of sortedGroupNames) {
				const permNames = groups[groupName];
				const groupKey = `group-${groupName}`; // Use group name for key
				const children = [];

				// Sort permission names within the group alphabetically
				const sortedPermNames = permNames.sort();

				for (const permName of sortedPermNames) {
					const perm = permMap.get(permName);
					if (perm) {
						const permKey = `perm-${perm.id}`; // Use perm ID for key
						children.push({
							title: perm.name,
							key: permKey,
							permissionId: perm.id, // Store the actual permission ID
						});
					} else {
						console.warn(`Permission "${permName}" defined in groups but not found in fetched permissions.`);
					}
				}

				// Only add group if it has valid children
				if (children.length > 0) {
					tree.push({
						title: groupName,
						key: groupKey,
						children: children,
					});
				} else {
					console.warn(`Permission group "${groupName}" has no valid permissions assigned or found.`);
				}
			}

			// Check for permissions not assigned to any group
			const assignedPermNames = new Set(Object.values(groups).flat());
			const unassignedPerms = perms.filter((p) => !assignedPermNames.has(p.name));
			if (unassignedPerms.length > 0) {
				console.warn(
					"Unassigned permissions found:",
					unassignedPerms.map((p) => p.name)
				);
				tree.push({
					title: "Uncategorized",
					key: "group-Uncategorized",
					children: unassignedPerms
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((p) => ({
							title: p.name,
							key: `perm-${p.id}`,
							permissionId: p.id,
						})),
				});
			}

			return tree;
		},
		[]
	);

	const treeData = useMemo(() => createTreeData(permissionGroups, permissions), [createTreeData, permissionGroups, permissions]); // Recreate when permissions change

	// --- Modal and Form Handling (remains largely the same) ---
	const showModal = (role) => {
		setSelectedRole(role);
		if (role) {
			roleForm.setFieldsValue({
				name: role.name,
			});
			const keys = role.permissions ? role.permissions.map((p) => `perm-${p.id}`) : [];
			setSelectedPermissions(keys);
		} else {
			roleForm.resetFields();
			setSelectedPermissions([]);
		}
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedRole(null);
		roleForm.resetFields();
		setPermissionSearchTerm("");
		setSelectedPermissions([]); // Reset selected permissions on cancel
	};

	const handleRoleFormSubmit = async () => {
		try {
			const values = await roleForm.validateFields();
			// Extract permission IDs from selected keys (Handles parent group selection - only takes actual perm- keys)
			const permissionIds = selectedPermissions.filter((key) => key.startsWith("perm-")).map((key) => parseInt(key.replace("perm-", ""), 10));

			const roleData = {
				...values,
				// Send only the IDs, backend expects Set<Permission> or similar based on IDs
				// Ensure backend Role DTO/Entity can handle a list/set of IDs for update/create
				permissionIds: permissionIds, // Sending IDs is often preferred
				// OR if backend expects full objects:
				// permissions: permissionIds.map((id) => ({ id })),
			};

			console.log("Submitting Role Data:", roleData);

			if (selectedRole) {
				await updateRole(selectedRole.id, roleData);
			} else {
				await createRole(roleData);
			}
			fetchAllRoles(); // Refresh roles list
			setIsModalVisible(false);
			roleForm.resetFields();
			setSelectedRole(null);
			setPermissionSearchTerm("");
			setSelectedPermissions([]); // Reset selected permissions after submit
		} catch (error) {
			console.error("Error submitting role form:", error);
			// Add user feedback here, e.g., Ant Design message.error()
		}
	};

	const handleDelete = async (id) => {
		Modal.confirm({
			title: "Are you sure you want to delete this role?",
			content: "This action cannot be undone.",
			okText: "Yes, Delete",
			okType: "danger",
			cancelText: "No",
			onOk: async () => {
				try {
					await deleteRole(id);
					fetchAllRoles(); // Refresh roles list
					// Add user feedback here, e.g., Ant Design message.success()
				} catch (error) {
					console.error("Error deleting role:", error);
					// Add user feedback here, e.g., Ant Design message.error()
				}
			},
		});
	};

	// --- Permission Tree Interaction (remains the same) ---
	const handlePermissionCheck = (checkedKeys, info) => {
		// checkedKeys contains all checked keys (groups and permissions)
		// We only care about the actual permission keys (`perm-`)
		setSelectedPermissions(checkedKeys);
	};

	const onSearch = (value) => {
		setPermissionSearchTerm(value.toLowerCase());
	};

	// Filtered tree data (using useMemo for performance - remains the same)
	const filteredTreeData = useMemo(() => {
		if (!permissionSearchTerm) {
			return treeData; // Return original tree if search is empty
		}
		return treeData
			.map((group) => {
				// Check if group title matches
				const groupMatches = group.title.toLowerCase().includes(permissionSearchTerm);
				// Filter children based on search term
				const filteredChildren = group.children.filter((child) => child.title.toLowerCase().includes(permissionSearchTerm));

				// Include group if group title matches OR it has matching children
				if (groupMatches || filteredChildren.length > 0) {
					// If group matches but children don't, return group with *all* original children (or maybe just matching?)
					// Decision: If group title matches, show all children. If only children match, show only matching children.
					// If you want to only show matching children even if group name matches, use:
					// return { ...group, children: filteredChildren };
					// Current logic: If group matches, keep all children for context
					return { ...group, children: groupMatches ? group.children : filteredChildren };
				}
				return null; // Exclude group if neither title nor children match
			})
			.filter(Boolean); // Remove null entries (groups that didn't match)
	}, [treeData, permissionSearchTerm]);

	// --- Table Columns (remains the same) ---
	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			sorter: (a, b) => a.name.localeCompare(b.name),
		},
		{
			title: "Actions",
			key: "actions",
			width: 200, // Fixed width for actions
			align: "center", // Center actions
			render: (text, record) => (
				<Space size="middle">
					<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)} disabled={record.name === "ADMIN"}>
						{" "}
						{/* Optional: Disable editing ADMIN role */}
						Edit
					</Button>
					<Button
						type="primary"
						danger
						icon={<DeleteOutlined />}
						onClick={() => handleDelete(record.id)}
						disabled={record.name === "ADMIN"}>
						{" "}
						{/* Optional: Disable deleting ADMIN role */}
						Delete
					</Button>
				</Space>
			),
		},
	];

	// --- Modal Width (remains the same) ---
	const modalWidth = useMemo(() => {
		return window.innerWidth < 768 ? "95%" : 700; // Slightly wider modal
	}, []);

	// --- Tree Default Expansion ---
	const expandedKeys = useMemo(() => {
		// Expand all groups by default, or only filtered ones if searching
		return permissionSearchTerm ? filteredTreeData.map((group) => group.key) : treeData.map((group) => group.key);
	}, [treeData, filteredTreeData, permissionSearchTerm]);

	// --- Render Logic ---
	return (
		<div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
			{" "}
			{/* Max width for better layout */}
			<Row justify="center">
				<Col>
					<AnimatedTitle level={3}>Role & Permission Management</AnimatedTitle> {/* Slightly larger title */}
				</Col>
			</Row>
			<Row gutter={[16, 16]} style={{ marginBottom: "20px" }} justify="start">
				{" "}
				{/* Adjusted margin */}
				<Col>
					<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)} size="large">
						{" "}
						{/* Larger button */}
						Add New Role
					</Button>
				</Col>
			</Row>
			<Row>
				<Col xs={24}>
					<Table
						columns={columns}
						dataSource={roles}
						loading={rolesLoading}
						rowKey="id"
						scroll={{ x: "min-content" }} // Adjust scrolling
						pagination={{ pageSize: 10 }} // Add pagination
						bordered // Add borders for clarity
					/>
				</Col>
			</Row>
			<Modal
				title={selectedRole ? `Edit Role: ${selectedRole.name}` : "Add New Role"}
				visible={isModalVisible}
				onCancel={handleCancel}
				onOk={handleRoleFormSubmit}
				width={modalWidth}
				confirmLoading={rolesLoading}
				destroyOnClose // Reset form state when modal is closed
			>
				<Form form={roleForm} layout="vertical" name="roleForm">
					<Form.Item name="name" label="Role Name" rules={[{ required: true, message: "Please input the role name!" }]}>
						<Input placeholder="Enter role name (e.g., NURSE_SUPERVISOR)" disabled={selectedRole?.name === "ADMIN"} />
						{/* Disable editing ADMIN role name */}
					</Form.Item>
					<Form.Item label="Assign Permissions">
						<Search placeholder="Search permissions..." onSearch={onSearch} allowClear style={{ marginBottom: 12 }} />

						<div style={{ maxHeight: "45vh", overflowY: "auto", border: "1px solid #d9d9d9", padding: "8px", borderRadius: "2px" }}>
							{" "}
							{/* Scrollable permission area */}
							{permissionsLoading ? (
								<p>Loading permissions...</p>
							) : filteredTreeData.length > 0 ? (
								<Tree
									checkable
									checkStrictly={false} // Allow checking parent to check children (default)
									onCheck={handlePermissionCheck}
									checkedKeys={selectedPermissions}
									treeData={filteredTreeData}
									defaultExpandAll={false} // Don't expand all initially, use expandedKeys
									expandedKeys={expandedKeys} // Control expanded keys
									// height={350} // Removed fixed height, using maxHeight div instead
									blockNode // Make the entire node clickable for expansion
								/>
							) : (
								<p>No permissions found{permissionSearchTerm ? " matching your search" : ""}.</p>
							)}
						</div>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default RoleAndPermissionManagement;
