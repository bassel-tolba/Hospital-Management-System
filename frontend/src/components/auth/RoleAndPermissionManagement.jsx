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

	// --- Permission Groups (Including Units) ---
	const permissionGroups = useMemo(
		() => ({
			"Patient Management": [
				"CREATE_PATIENT",
				"READ_PATIENT",
				"UPDATE_PATIENT",
				"DELETE_PATIENT",
				"CREATE_APPOINTMENT",
				"READ_APPOINTMENT",
				"UPDATE_APPOINTMENT",
				"DELETE_APPOINTMENT",
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
			"Doctor Management": ["CREATE_DOCTOR", "READ_DOCTOR", "UPDATE_DOCTOR", "DELETE_DOCTOR"],
			"User Management": [
				"CREATE_USER",
				"READ_USER",
				"UPDATE_USER",
				"DELETE_USER",
				"CREATE_USER_ACTIVITY",
				"READ_USER_ACTIVITY",
				"UPDATE_USER_ACTIVITY",
				"DELETE_USER_ACTIVITY",
			],
			"Medication & Orders": [
				"CREATE_MEDICATION",
				"READ_MEDICATION",
				"UPDATE_MEDICATION",
				"DELETE_MEDICATION",
				"UPDATE_MEDICATION_STOCK",
				"READ_MEDICATION_HISTORY",
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
			],
			"Room & Bed Management": ["CREATE_ROOM", "READ_ROOM", "UPDATE_ROOM", "DELETE_ROOM", "CREATE_BED", "READ_BED", "UPDATE_BED", "DELETE_BED"],
			"Admission Management": ["CREATE_ADMISSION", "READ_ADMISSION", "UPDATE_ADMISSION", "DELETE_ADMISSION"],
			"Lab & Diagnostics": [
				"CREATE_LAB_TEST",
				"READ_LAB_TEST",
				"CREATE_LAB_RESULT",
				"READ_LAB_RESULT",
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
			"Product Management": [
				"CREATE_PRODUCT",
				"READ_PRODUCT",
				"UPDATE_PRODUCT",
				"DELETE_PRODUCT",
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
			"Unit Management": [
				// Added Unit Management
				"CREATE_UNIT",
				"READ_UNIT",
				"UPDATE_UNIT",
				"DELETE_UNIT",
			],
			Security: ["MANAGE_ROLES", "MANAGE_PERMISSIONS"],
		}),
		[]
	);

	const createTreeData = useMemo(
		() => (groups, perms) => {
			if (!perms || perms.length === 0) {
				return []; // Return empty array if permissions haven't loaded
			}

			const permMap = new Map(perms.map((p) => [p.name, p]));
			const tree = [];

			for (const [groupName, permNames] of Object.entries(groups)) {
				const groupKey = `group-${groupName}`; // Use group name for key
				const children = [];

				for (const permName of permNames) {
					const perm = permMap.get(permName);
					if (perm) {
						const permKey = `perm-${perm.id}`; // Use perm ID for key
						children.push({
							title: perm.name,
							key: permKey,
							permissionId: perm.id, // Store the actual permission ID
						});
					}
				}

				if (children.length > 0) {
					tree.push({
						title: groupName,
						key: groupKey,
						children: children,
					});
				}
			}

			return tree;
		},
		[]
	); // Depend on nothing, create once

	const treeData = useMemo(() => createTreeData(permissionGroups, permissions), [createTreeData, permissionGroups, permissions]); // Recreate when permissions change

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
	};

	const handleRoleFormSubmit = async () => {
		try {
			const values = await roleForm.validateFields();
			// Extract permission IDs from selected keys
			const permissionIds = selectedPermissions.filter((key) => key.startsWith("perm-")).map((key) => parseInt(key.replace("perm-", ""), 10)); // Extract ID

			const roleData = {
				...values,
				permissions: permissionIds.map((id) => ({ id })), // Correctly formatted
			};

			if (selectedRole) {
				await updateRole(selectedRole.id, roleData);
			} else {
				await createRole(roleData);
			}
			fetchAllRoles();
			setIsModalVisible(false);
			roleForm.resetFields();
			setSelectedRole(null);
			setPermissionSearchTerm("");
		} catch (error) {
			console.error("Error in handle form submit", error);
		}
	};

	const handleDelete = async (id) => {
		try {
			await deleteRole(id);
			fetchAllRoles();
		} catch (error) {
			console.error("Error deleting role:", error);
		}
	};

	const handlePermissionCheck = (checkedKeys) => {
		setSelectedPermissions(checkedKeys);
	};

	const onSearch = (value) => {
		setPermissionSearchTerm(value.toLowerCase());
	};

	// Filtered tree data (using useMemo for performance)
	const filteredTreeData = useMemo(() => {
		return treeData
			.map((group) => {
				const filteredChildren = group.children.filter((child) => child.title.toLowerCase().includes(permissionSearchTerm));

				if (filteredChildren.length > 0 || group.title.toLowerCase().includes(permissionSearchTerm)) {
					return { ...group, children: filteredChildren };
				}
				return null; // Important: return null for filtering
			})
			.filter(Boolean); // Remove null entries
	}, [treeData, permissionSearchTerm]);

	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record)}>
						Edit
					</Button>
					<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
						Delete
					</Button>
				</Space>
			),
		},
	];

	const modalWidth = useMemo(() => {
		return window.innerWidth < 768 ? "90%" : 600; // Adjust as needed
	}, []);

	return (
		<div style={{ padding: "20px" }}>
			<Row justify="center">
				<Col>
					<AnimatedTitle level={4}>Role Management</AnimatedTitle>
				</Col>
			</Row>
			<Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
				<Col>
					<Button type="default" icon={<PlusOutlined />} onClick={() => showModal(null)}>
						Add Role
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
						scroll={{ x: "max-content" }} // Enable horizontal scrolling if needed
					/>
				</Col>
			</Row>

			<Modal
				title={selectedRole ? "Edit Role" : "Add Role"}
				visible={isModalVisible}
				onCancel={handleCancel}
				onOk={handleRoleFormSubmit}
				width={modalWidth}
				confirmLoading={rolesLoading}>
				<Form form={roleForm} layout="vertical">
					<Form.Item name="name" label="Role Name" rules={[{ required: true, message: "Please input the role name!" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Permissions">
						<Search placeholder="Search permissions" onSearch={onSearch} style={{ marginBottom: 8 }} />

						<Tree
							checkable
							onCheck={handlePermissionCheck}
							checkedKeys={selectedPermissions}
							treeData={filteredTreeData} // Use the filtered treeData
							height={300}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default RoleAndPermissionManagement;
