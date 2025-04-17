import React, { useState, useEffect, useMemo } from "react";
import { Form, Button, Typography, Space, Table, Modal, Input, Tree, Row, Col, message, Spin } from "antd"; // Added Spin, message
import { useRoleStore } from "../../services/role.service"; // Adjust path if needed
import { usePermissionStore } from "../../services/permission.service"; // Adjust path if needed
import styled, { keyframes } from "styled-components";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

// --- Styled Components ---
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
	margin-bottom: 1rem; // Use rem for scalable spacing
`;

// --- Component Definition ---
const RoleAndPermissionManagement = () => {
	console.log("--- Component Render ---"); // Log component render

	// --- State ---
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedRole, setSelectedRole] = useState(null);
	const [selectedPermissions, setSelectedPermissions] = useState([]); // Holds keys like 'perm-123', 'group-...'
	const [permissionSearchTerm, setPermissionSearchTerm] = useState("");
	const [currentExpandedKeys, setCurrentExpandedKeys] = useState([]); // State for controlled expansion

	// --- Zustand Stores ---
	const { roles, loading: rolesLoading, error: rolesError, fetchAllRoles, createRole, updateRole, deleteRole } = useRoleStore();
	const { permissions, loading: permissionsLoading, error: permissionsError, fetchAllPermissions } = usePermissionStore();

	// --- Ant Design Form ---
	const [roleForm] = Form.useForm();

	// --- Effects ---
	useEffect(() => {
		console.log("useEffect: Fetching initial roles and permissions");
		fetchAllRoles();
		fetchAllPermissions();
	}, [fetchAllRoles, fetchAllPermissions]); // Dependencies are correct

	// Log errors from stores
	useEffect(() => {
		if (rolesError) {
			console.error("Role Store Error:", rolesError);
			// message.error(`Role Error: ${rolesError}`); // Notification is handled in store
		}
	}, [rolesError]);

	useEffect(() => {
		if (permissionsError) {
			console.error("Permission Store Error:", permissionsError);
			// message.error(`Permission Error: ${permissionsError}`); // Notification is handled in store
		}
	}, [permissionsError]);

	// --- Permission Grouping (Static Data - useMemo for stability) ---
	const permissionGroups = useMemo(
		() => ({
			"Patient Management": ["CREATE_PATIENT", "READ_PATIENT", "UPDATE_PATIENT", "DELETE_PATIENT"],
			"Appointment Management": ["CREATE_APPOINTMENT", "READ_APPOINTMENT", "UPDATE_APPOINTMENT", "DELETE_APPOINTMENT"],
			"Clinical Records": [
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
			"User Activities": ["CREATE_USER_ACTIVITY", "READ_USER_ACTIVITY", "UPDATE_USER_ACTIVITY", "DELETE_USER_ACTIVITY"],
			"Medication & Pharmacy": [
				"CREATE_MEDICATION",
				"READ_MEDICATION",
				"UPDATE_MEDICATION",
				"DELETE_MEDICATION",
				"UPDATE_MEDICATION_STOCK",
				"READ_MEDICATION_HISTORY",
				"DELETE_MEDICATION_HISTORY",
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
				"ADMINISTER_MEDICATION",
			],
			"Location Management": [
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
				"MANAGE_BEDS",
			],
			"Admission Management": ["CREATE_ADMISSION", "READ_ADMISSION", "UPDATE_ADMISSION", "DELETE_ADMISSION", "MANAGE_ADMISSION_TYPES"],
			"Lab & Imaging": [
				"CREATE_LAB_TEST",
				"READ_LAB_TEST",
				"UPDATE_LAB_TEST",
				"DELETE_LAB_TEST",
				"CREATE_LAB_RESULT",
				"READ_LAB_RESULT",
				"UPDATE_LAB_RESULT",
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
				"CREATE_PRODUCT",
				"READ_PRODUCT",
				"UPDATE_PRODUCT",
				"DELETE_PRODUCT",
				"UPDATE_PRODUCT_STOCK",
				"READ_PRODUCT_HISTORY",
				"DELETE_PRODUCT_HISTORY",
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
				"READ_DOCUMENT_TYPE",
				"UPDATE_DOCUMENT_TYPE",
				"DELETE_DOCUMENT_TYPE",
			],
			"Dashboard & Reporting": ["READ_DASHBOARD"],
			"Security & Roles": [
				"MANAGE_ROLES",
				"CREATE_ROLE",
				"UPDATE_ROLE",
				"DELETE_ROLE",
				"MANAGE_PERMISSIONS",
				"CREATE_PERMISSION",
				"UPDATE_PERMISSION",
				"DELETE_PERMISSION",
			],
		}),
		[] // Empty dependency array means this runs once
	);

	// --- Memoized Tree Data Creation ---
	const createTreeData = useMemo(() => {
		console.log("useMemo: createTreeData running"); // Log when this recalculates
		return (groups, perms) => {
			if (!perms || perms.length === 0) {
				console.warn("createTreeData: No permissions available yet.");
				return []; // Return empty array if permissions haven't loaded
			}
			console.log(`createTreeData: Processing ${perms.length} permissions.`);

			const permMap = new Map(perms.map((p) => [p.name, p])); // Map by name for lookup
			const tree = [];
			const allPermKeysInGroups = new Set();

			const sortedGroupNames = Object.keys(groups).sort();

			for (const groupName of sortedGroupNames) {
				const permNames = groups[groupName]; // Get permission names for this group
				const groupKey = `group-${groupName.replace(/\s+/g, "-")}`; // More robust key
				const children = [];

				if (!Array.isArray(permNames)) {
					console.warn(`Permission group "${groupName}" does not contain an array of permission names.`);
					continue;
				}

				const sortedPermNames = [...permNames].sort(); // Sort permission names alphabetically

				for (const permName of sortedPermNames) {
					const perm = permMap.get(permName); // Find permission object by name
					if (perm && perm.id != null) {
						// Check if permission exists and has an ID
						const permKey = `perm-${perm.id}`; // Use perm ID for key
						children.push({
							title: perm.name, // Display name
							key: permKey, // Unique key for React/AntD
							isLeaf: true, // Mark as leaf node
							permissionId: perm.id, // Store the actual permission ID
						});
						allPermKeysInGroups.add(permName); // Track permissions added to groups
					} else {
						console.warn(`Permission "${permName}" defined in group "${groupName}" but not found in fetched permissions or missing ID.`);
					}
				}

				if (children.length > 0) {
					tree.push({
						title: groupName,
						key: groupKey,
						children: children,
						isLeaf: false, // Mark as non-leaf node
					});
				} else {
					console.warn(`Permission group "${groupName}" resulted in no valid children.`);
				}
			}

			// Find permissions that were fetched but not listed in any group
			const unassignedPerms = perms.filter((p) => p.name && !allPermKeysInGroups.has(p.name));
			if (unassignedPerms.length > 0) {
				console.warn(
					"Unassigned permissions found:",
					unassignedPerms.map((p) => p.name)
				);
				tree.push({
					title: "Uncategorized",
					key: "group-Uncategorized",
					isLeaf: false,
					children: unassignedPerms
						.filter((p) => p.id != null) // Ensure they have IDs
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((p) => ({
							title: p.name,
							key: `perm-${p.id}`,
							permissionId: p.id,
							isLeaf: true,
						})),
				});
			}

			console.log("createTreeData: Generated tree structure:", tree);
			return tree;
		};
	}, []); // Re-runs only if createTreeData definition changes (it won't)

	// Calculate treeData only when permissions or groups change (groups are stable here)
	const treeData = useMemo(() => {
		console.log("useMemo: Calculating treeData based on permissions");
		return createTreeData(permissionGroups, permissions);
	}, [createTreeData, permissionGroups, permissions]);

	// --- Modal and Form Handling ---
	const showModal = (role) => {
		console.log("showModal called with role:", role); // DEBUG LOG
		setSelectedRole(role);
		if (role) {
			roleForm.setFieldsValue({
				name: role.name,
			});
			// Ensure role.permissions is an array and items have 'id' before mapping
			const currentPermissionKeys = (Array.isArray(role.permissions) ? role.permissions : [])
				.filter((p) => p && p.id != null) // Ensure permission and its ID exist
				.map((p) => `perm-${p.id}`);

			console.log(`Setting initial selectedPermissions for role "${role.name}":`, currentPermissionKeys); // DEBUG LOG
			setSelectedPermissions(currentPermissionKeys);
			// Expand groups containing the selected permissions
			const groupsToExpand = treeData
				.filter((group) => group.children?.some((child) => currentPermissionKeys.includes(child.key)))
				.map((group) => group.key);
			setCurrentExpandedKeys(groupsToExpand);
			console.log("Setting initial expanded keys:", groupsToExpand);
		} else {
			// Adding a new role
			roleForm.resetFields();
			setSelectedPermissions([]); // Reset for new role
			setCurrentExpandedKeys(treeData.map((g) => g.key)); // Expand all groups for new role
			console.log("Resetting for new role. Expanded keys:", currentExpandedKeys);
		}
		setPermissionSearchTerm(""); // Reset search on modal open
		setIsModalVisible(true);
		console.log("Modal visible: true");
	};

	const handleCancel = () => {
		console.log("handleCancel called"); // DEBUG LOG
		setIsModalVisible(false);
		setSelectedRole(null);
		// Resetting form/state is handled by destroyOnClose now
		// roleForm.resetFields();
		// setPermissionSearchTerm("");
		// setSelectedPermissions([]);
		// setCurrentExpandedKeys([]); // Reset expanded keys
		console.log("Modal visible: false");
	};

	// --- Permission Tree Interaction ---
	const handlePermissionCheck = (checkedKeysValue, info) => {
		// checkedKeysValue is the array of keys provided by Ant Design Tree's onCheck
		// It can contain both parent ('group-...') and leaf ('perm-...') keys
		console.log("handlePermissionCheck - checkedKeysValue received:", checkedKeysValue); // DEBUG LOG
		// console.log("handlePermissionCheck - info:", info); // Optional: Log info object

		// Directly set the state with the array received from the Tree component.
		// This state will be filtered later during submission.
		setSelectedPermissions(checkedKeysValue);
	};

	const handleExpand = (expandedKeysValue) => {
		console.log("handleExpand called:", expandedKeysValue);
		setCurrentExpandedKeys(expandedKeysValue);
	};

	// --- Form Submission ---
	const handleRoleFormSubmit = async () => {
		console.log("--- Starting handleRoleFormSubmit ---"); // DEBUG LOG
		try {
			const values = await roleForm.validateFields(); // { name: '...' }
			console.log("Form values validated:", values); // DEBUG LOG

			// --- CRITICAL: Check the state right before processing ---
			// Make a copy to avoid potential mutation issues if state updates unexpectedly
			const currentSelectedPermissions = [...selectedPermissions];
			console.log("State selectedPermissions before extraction:", currentSelectedPermissions); // DEBUG LOG

			// --- Process the selectedPermissions state ---
			// Filter out group keys and map to numeric IDs
			const permissionIds = currentSelectedPermissions
				.filter((key) => typeof key === "string" && key.startsWith("perm-")) // Ensure it's a string starting with 'perm-'
				.map((key) => parseInt(key.replace("perm-", ""), 10)) // Extract number
				.filter((id) => !isNaN(id)); // Filter out any NaN results (important!)

			console.log("Extracted permissionIds:", permissionIds); // DEBUG LOG

			// Prepare the data payload for the API
			const roleData = {
				...values, // Add { name: '...' }
				permissionIds: permissionIds, // Add the processed IDs
			};

			// --- FINAL CHECK before sending to store ---
			console.log("Final roleData OBJECT being sent to store:", roleData); // DEBUG LOG (see the object structure)
			console.log("Final roleData JSON being sent:", JSON.stringify(roleData)); // DEBUG LOG (verify JSON)

			if (selectedRole) {
				// Ensure selectedRole.id exists
				if (selectedRole.id == null) {
					// Check for null or undefined
					console.error("Update failed: selectedRole.id is missing.");
					message.error("Cannot update role: Role ID is missing.");
					return; // Prevent API call without ID
				}
				console.log(`Calling store.updateRole with ID: ${selectedRole.id} and data:`, roleData); // DEBUG LOG
				await updateRole(selectedRole.id, roleData);
			} else {
				console.log("Calling store.createRole with data:", roleData); // DEBUG LOG
				await createRole(roleData);
			}

			// --- Success & Cleanup ---
			console.log("Role submission successful (create/update called)."); // DEBUG LOG
			fetchAllRoles(); // Refresh the roles list in the table
			setIsModalVisible(false); // Close the modal
			// Cleanup is handled by destroyOnClose if present
			console.log("Modal should be closed now.");
		} catch (error) {
			// Handle form validation errors specifically
			if (error.name === "ValidateError" || error.errorFields) {
				console.error("Form Validation Failed:", error.errorFields || error);
				message.error("Please check the form fields for errors."); // User-friendly message
			} else {
				// Handle errors from the API call (these should be caught and notified by the store)
				console.error("Error during role form submission (after validation):", error);
				// message.error("An error occurred while saving the role."); // Store already shows notification
			}
		} finally {
			console.log("--- Ending handleRoleFormSubmit ---"); // DEBUG LOG
		}
	};

	// --- Role Deletion ---
	const handleDelete = async (id) => {
		console.log(`handleDelete called for ID: ${id}`);
		if (id == null) {
			console.error("Delete failed: ID is missing.");
			message.error("Cannot delete role: Role ID is missing.");
			return;
		}
		Modal.confirm({
			title: "Are you sure you want to delete this role?",
			content: "This action cannot be undone.",
			okText: "Yes, Delete",
			okType: "danger",
			cancelText: "No",
			onOk: async () => {
				console.log(`Confirmed deletion for ID: ${id}`);
				try {
					await deleteRole(id);
					console.log(`Role deletion successful for ID: ${id}`);
					// message.success("Role deleted successfully."); // Store handles notification
					fetchAllRoles(); // Refresh list after delete
				} catch (error) {
					console.error(`Error deleting role ID ${id}:`, error);
					// message.error("Failed to delete role."); // Store handles notification
				}
			},
			onCancel: () => {
				console.log(`Deletion cancelled for ID: ${id}`);
			},
		});
	};

	// --- Permission Search ---
	const onSearch = (value) => {
		console.log("onSearch called with value:", value);
		setPermissionSearchTerm(value.toLowerCase());
		// If searching, expand the filtered results
		if (value) {
			const keysToExpand = filteredTreeData.map((group) => group.key);
			setCurrentExpandedKeys(keysToExpand);
			console.log("Expanding filtered search results:", keysToExpand);
		} else {
			// If search is cleared, potentially revert to default expansion or user's last state
			// For simplicity, let's expand all groups when search is cleared
			setCurrentExpandedKeys(treeData.map((g) => g.key));
			console.log("Expanding all groups as search cleared.");
		}
	};

	// --- Memoized Filtered Tree Data ---
	const filteredTreeData = useMemo(() => {
		console.log(`useMemo: Calculating filteredTreeData (search: "${permissionSearchTerm}")`);
		if (!permissionSearchTerm) {
			console.log("FilteredTreeData: No search term, returning original treeData");
			return treeData; // Return original tree if search is empty
		}
		const lowerSearchTerm = permissionSearchTerm.toLowerCase();
		const result = treeData
			.map((group) => {
				// Check if group title matches
				const groupTitleMatch = group.title.toLowerCase().includes(lowerSearchTerm);
				// Filter children based on search term
				const filteredChildren = group.children?.filter((child) => child.title.toLowerCase().includes(lowerSearchTerm)) || []; // Handle cases where children might be undefined/null

				// Include group if group title matches OR it has matching children
				if (groupTitleMatch || filteredChildren.length > 0) {
					console.log(`Group "${group.title}" included. Title match: ${groupTitleMatch}, Children found: ${filteredChildren.length}`);
					// If group title matches, show all original children for context.
					// If only children match, show only the matching children.
					return {
						...group,
						children: groupTitleMatch ? group.children : filteredChildren,
					};
				}
				return null; // Exclude group if neither title nor any children match
			})
			.filter(Boolean); // Remove null entries (groups that didn't match)

		console.log("FilteredTreeData result:", result);
		return result;
	}, [treeData, permissionSearchTerm]); // Re-calculate when treeData or search term changes

	// --- Table Columns ---
	const columns = useMemo(
		() => [
			// Memoize columns array
			{
				title: "Name",
				dataIndex: "name",
				key: "name",
				sorter: (a, b) => a.name.localeCompare(b.name),
				ellipsis: true, // Add ellipsis for long names
			},
			{
				title: "Permissions Count",
				key: "permissionsCount",
				dataIndex: "permissions", // Use the permissions array
				align: "center",
				width: 150,
				render: (permissions) => (Array.isArray(permissions) ? permissions.length : 0),
				sorter: (a, b) => (a.permissions?.length || 0) - (b.permissions?.length || 0),
			},
			{
				title: "Actions",
				key: "actions",
				width: 200, // Fixed width for actions
				align: "center", // Center actions
				render: (text, record) => {
					// Prevent editing/deleting a core ADMIN role if needed
					const isAdminRole = record.name === "ADMIN"; // Or check based on a specific ID if more reliable
					return (
						<Space size="small">
							<Button
								type="primary"
								icon={<EditOutlined />}
								onClick={() => showModal(record)}
								disabled={isAdminRole}
								aria-label={`Edit role ${record.name}`}>
								Edit
							</Button>
							<Button
								type="primary"
								danger
								icon={<DeleteOutlined />}
								onClick={() => handleDelete(record.id)}
								disabled={isAdminRole}
								aria-label={`Delete role ${record.name}`}>
								Delete
							</Button>
						</Space>
					);
				},
			},
		],
		[showModal, handleDelete]
	); // Include dependencies for render function callbacks

	// --- Modal Width ---
	const modalWidth = useMemo(() => {
		// Basic responsiveness for modal width
		return window.innerWidth < 768 ? "95%" : 800; // Wider modal for permissions
	}, []);

	// --- Render Logic ---
	console.log("Rendering RoleAndPermissionManagement component. Roles loading:", rolesLoading, "Permissions loading:", permissionsLoading);

	return (
		<div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
			<Row justify="center" style={{ marginBottom: "1.5rem" }}>
				<Col>
					<AnimatedTitle level={3}>Role & Permission Management</AnimatedTitle>
				</Col>
			</Row>

			<Row gutter={[16, 16]} style={{ marginBottom: "1.5rem" }} justify="start">
				<Col>
					<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)} size="large" aria-label="Add New Role">
						Add New Role
					</Button>
				</Col>
			</Row>

			<Row>
				<Col xs={24}>
					{" "}
					{/* Full width on all screen sizes */}
					<Table
						columns={columns}
						dataSource={roles} // Use roles from the store
						loading={rolesLoading} // Show loading indicator on table
						rowKey="id" // Unique key for each row
						scroll={{ x: "max-content" }} // Horizontal scroll if content overflows
						pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ["10", "20", "50"] }} // Pagination options
						bordered // Add borders for clarity
						size="middle" // Adjust table size
					/>
				</Col>
			</Row>

			<Modal
				title={selectedRole ? `Edit Role: ${selectedRole.name}` : "Add New Role"}
				open={isModalVisible} // Use 'open' prop for newer AntD versions
				onCancel={handleCancel}
				onOk={handleRoleFormSubmit} // Connects to the debugged function
				width={modalWidth}
				confirmLoading={rolesLoading} // Show spinner on OK button when store is loading (create/update)
				destroyOnClose // *** IMPORTANT: Reset modal state fully on close ***
				maskClosable={false} // Prevent closing by clicking outside during async operations
				footer={[
					// Custom footer for clarity
					<Button key="back" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" loading={rolesLoading} onClick={handleRoleFormSubmit}>
						{selectedRole ? "Update Role" : "Create Role"}
					</Button>,
				]}>
				<Spin spinning={permissionsLoading || (selectedRole && rolesLoading)}>
					{" "}
					{/* Show spinner while loading permissions or the selected role details */}
					<Form form={roleForm} layout="vertical" name="roleForm">
						<Form.Item
							name="name"
							label="Role Name"
							rules={[
								{ required: true, message: "Please input the role name!" },
								{ max: 50, message: "Role name cannot exceed 50 characters." },
							]}>
							<Input
								placeholder="Enter role name (e.g., NURSE_SUPERVISOR)"
								disabled={selectedRole?.name === "ADMIN"} // Disable editing ADMIN role name
							/>
						</Form.Item>

						<Form.Item label="Assign Permissions">
							<Search
								placeholder="Search permissions..."
								onSearch={onSearch} // Trigger search
								onChange={(e) => onSearch(e.target.value)} // Trigger search on type
								allowClear
								style={{ marginBottom: 12 }}
								aria-label="Search permissions"
							/>

							<div
								style={{
									maxHeight: "45vh", // Limit height
									overflowY: "auto", // Enable vertical scroll
									border: "1px solid #d9d9d9",
									padding: "8px",
									borderRadius: "4px", // Slightly rounded corners
								}}>
								{/* Conditional Rendering based on loading/data */}
								{permissionsLoading ? (
									<div style={{ textAlign: "center", padding: "20px" }}>
										<Spin /> Loading permissions...
									</div>
								) : filteredTreeData.length > 0 ? (
									<Tree
										checkable
										// --- State Binding ---
										checkedKeys={selectedPermissions} // Controlled component: Use state for checked keys
										onCheck={handlePermissionCheck} // Update state when checked keys change
										expandedKeys={currentExpandedKeys} // Controlled component: Use state for expanded keys
										onExpand={handleExpand} // Update state when expanded keys change
										// --- Tree Configuration ---
										checkStrictly={false} // Check parent affects children (usually desired)
										treeData={filteredTreeData} // Use the filtered data
										// defaultExpandAll={false} // Controlled by expandedKeys state now
										blockNode // Make the entire node clickable for expansion/selection
										virtual={false} // Turn off virtual scroll if height isn't large or causing issues
										// height={350} // Using maxHeight on parent div is often better
										aria-label="Permissions tree"
									/>
								) : (
									<Typography.Text type="secondary" style={{ display: "block", textAlign: "center", padding: "15px" }}>
										No permissions found{permissionSearchTerm ? " matching your search" : ""}.
									</Typography.Text>
								)}
							</div>
						</Form.Item>
					</Form>
				</Spin>
			</Modal>
		</div>
	);
};

export default RoleAndPermissionManagement;
