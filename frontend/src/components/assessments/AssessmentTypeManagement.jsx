// src/components/assessments/AssessmentTypeManagement.js
import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Space, Typography, Spin, notification, Popconfirm, Tooltip, Alert, Row, Col } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAssessmentTypeStore } from "../../services/useAssessmentTypeStore"; // Adjust path
import { useAuthStore } from "../../services/auth.service"; // Adjust path
import AssessmentTypeForm from "./AssessmentTypeForm"; // Adjust path
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

const AssessmentTypeManagement = ({ darkMode }) => {
	const { t } = useTranslation();

	// Zustand Store hooks
	const { types, loadingList, loadingSubmit, error, fetchTypes, fetchTypeById, createType, updateType, deleteType, clearError } =
		useAssessmentTypeStore();

	// Auth Store hooks
	const { user, hasAuthority } = useAuthStore();

	// Component State
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [editingType, setEditingType] = useState(null); // Stores full type data for editing
	const [isLoadingFullType, setIsLoadingFullType] = useState(false);

	// Permission Check
	const canManage = user && hasAuthority("MANAGE_ASSESSMENT_TYPES");

	// Fetch types on mount if user has permission
	useEffect(() => {
		if (canManage) {
			fetchTypes();
		} else {
			// Clear types if permission is lost or not present initially
			// useAssessmentTypeStore.setState({ types: [] }); // Optional: depends on desired behavior
		}
	}, [fetchTypes, canManage]);

	// Effect for store errors
	useEffect(() => {
		if (error) {
			// Assuming the store handles the notification now
			// notification.error({ message: t('common.error'), description: error });
			// clearError(); // Should be called by the store action after handling
		}
	}, [error, t]);

	// --- Modal Handlers ---
	const showAddModal = () => {
		if (!canManage) {
			notification.warning({
				message: t("common.permissionDenied"),
				description: t("assessmentTypeManagement.notifications.addPermissionDenied"),
			});
			return;
		}
		setEditingType(null);
		setIsLoadingFullType(false);
		setIsModalVisible(true);
	};

	const showEditModal = async (typeSummary) => {
		if (!canManage) {
			notification.warning({
				message: t("common.permissionDenied"),
				description: t("assessmentTypeManagement.notifications.editPermissionDenied"),
			});
			return;
		}
		setIsLoadingFullType(true);
		setEditingType(null); // Clear previous editing state first
		setIsModalVisible(true);
		try {
			const fullTypeData = await fetchTypeById(typeSummary.id); // fetchTypeById now returns the data or null/throws
			if (fullTypeData) {
				setEditingType(fullTypeData);
			} else {
				// fetchTypeById likely threw an error handled by the store, or returned null
				notification.error({
					message: t("assessmentTypeManagement.notifications.loadFailedTitle"),
					description: t("assessmentTypeManagement.notifications.loadFailedDesc", { name: typeSummary.displayName }),
				});
				setIsModalVisible(false); // Close modal if load failed
			}
		} catch (err) {
			// Error likely already shown by store hook or fetchTypeById
			console.error("Error fetching full type details:", err);
			setIsModalVisible(false); // Close modal on error
		} finally {
			setIsLoadingFullType(false);
		}
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setEditingType(null);
		setIsLoadingFullType(false);
	};

	// --- Form Save Handler ---
	const handleSave = async (formData) => {
		if (!canManage) return; // Should not happen if modal logic is correct, but good practice
		let success = false;
		if (editingType?.id) {
			success = await updateType(editingType.id, formData); // Store actions now return true/false
		} else {
			success = await createType(formData);
		}

		if (success) {
			setIsModalVisible(false);
			setEditingType(null);
			// fetchTypes(); // Re-fetch list implicitly handled by store actions now
		} else {
			// Error notification is handled within the store actions
			console.error("Save/Update failed - notification should be shown by store.");
		}
	};

	// --- Delete Handler ---
	const handleDelete = async (id) => {
		if (!canManage) {
			notification.error({
				message: t("common.permissionDenied"),
				description: t("assessmentTypeManagement.notifications.deletePermissionDenied"),
			});
			return;
		}
		await deleteType(id); // Store action handles loading/success/error notifications and list update
	};

	// --- Table Columns Definition ---
	const columns = [
		{
			title: t("assessmentTypeManagement.table.header.displayName"),
			dataIndex: "displayName",
			key: "displayName",
			sorter: (a, b) => a.displayName.localeCompare(b.displayName),
		},
		{
			title: t("assessmentTypeManagement.table.header.technicalName"),
			dataIndex: "name",
			key: "name",
			sorter: (a, b) => a.name.localeCompare(b.name),
			render: (text) => (
				<Text copyable code>
					{text}
				</Text>
			),
		},
		{
			title: t("assessmentTypeManagement.table.header.actions"),
			key: "actions",
			align: "center",
			width: 120,
			fixed: "right", // Keep actions visible on scroll
			render: (_, record) => {
				if (!canManage) {
					return <Text disabled>{t("common.notAvailableShort")}</Text>;
				}
				return (
					// Add wrap for smaller screens if actions might stack
					<Space size="middle" wrap>
						<Tooltip title={t("assessmentTypeManagement.table.actions.editTooltip")}>
							<Button
								type="primary"
								shape="circle"
								icon={<EditOutlined />}
								onClick={() => showEditModal(record)}
								size="small"
								disabled={loadingSubmit}
							/>
						</Tooltip>
						<Popconfirm
							title={t("assessmentTypeManagement.deleteConfirm.title")}
							description={t("assessmentTypeManagement.deleteConfirm.description", { name: record.displayName })}
							onConfirm={() => handleDelete(record.id)}
							okText={t("common.deleteConfirmYes")}
							okButtonProps={{ danger: true }}
							cancelText={t("common.no")}
							disabled={loadingSubmit}>
							<Tooltip title={t("assessmentTypeManagement.table.actions.deleteTooltip")}>
								<Button type="danger" shape="circle" icon={<DeleteOutlined />} size="small" disabled={loadingSubmit} />
							</Tooltip>
						</Popconfirm>
					</Space>
				);
			},
		},
	];

	// Determine table empty text
	const getEmptyText = () => {
		if (loadingList) {
			return <Spin size="small" />; // Show spinner inside table when loading
		}
		if (!canManage) {
			return <Text disabled>{t("assessmentTypeManagement.table.empty.noPermission")}</Text>;
		}
		return t("assessmentTypeManagement.table.empty.noData");
	};

	// *** Conditional Rendering: If user cannot manage, show warning ***
	if (!canManage) {
		// Added check for loadingList to avoid brief flicker of warning before permission check
		if (loadingList) {
			return (
				<div style={{ padding: "20px 24px", textAlign: "center" }}>
					<Spin />
				</div>
			); // Show loading indicator
		}
		return (
			<div style={{ padding: "20px 24px" }}>
				<Alert
					message={t("common.permissionDenied")}
					description={t("assessmentTypeManagement.permissionDeniedMessage")}
					type="warning"
					showIcon
				/>
			</div>
		);
	}

	// *** Render main component if permission granted ***
	return (
		// Use standard padding
		<div style={{ padding: "0 24px 20px 24px" }}>
			<Space direction="vertical" style={{ width: "100%" }} size="large">
				{/* Header Row */}
				<Row justify="space-between" align="middle">
					<Col>
						<Title level={4} style={{ margin: 0 }}>
							{t("assessmentTypeManagement.title")}
						</Title>
					</Col>
					<Col>
						{/* Add button already checks canManage internally via showAddModal */}
						<Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} disabled={loadingList || loadingSubmit}>
							{t("assessmentTypeManagement.addButton")}
						</Button>
					</Col>
				</Row>

				{/* Table */}
				<Table
					columns={columns}
					dataSource={types} // Assumes store updates this correctly
					loading={loadingList} // Only show table loading state
					rowKey="id"
					pagination={{ pageSize: 15, size: "small" }}
					scroll={{ x: "max-content" }}
					bordered
					size="small"
					locale={{ emptyText: getEmptyText() }}
				/>
			</Space>

			{/* Add/Edit Modal */}
			<Modal
				title={
					editingType
						? t("assessmentTypeManagement.modal.editTitle", { name: editingType.displayName || t("common.loading") }) // Show loading if name not yet loaded
						: t("assessmentTypeManagement.modal.addTitle")
				}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={null} // Footer is part of AssessmentTypeForm
				// Responsive width
				width="90%"
				style={{ top: 20, maxWidth: "1000px" }} // Max width for large screens
				bodyStyle={{ maxHeight: "calc(100vh - 150px)", overflowY: "auto", padding: "20px" }} // Adjust padding and height
				destroyOnClose={true}
				maskClosable={false}>
				{/* Show loading spinner while fetching full details for edit */}
				{isLoadingFullType ? (
					<div style={{ textAlign: "center", padding: "50px" }}>
						<Spin size="large" tip={t("assessmentTypeManagement.modal.loadingDetailsTip")} />
					</div>
				) : (
					// Render form only when modal is visible and not loading details
					// Permission (canManage) is implicitly checked by modal visibility logic
					isModalVisible && (
						<AssessmentTypeForm
							typeData={editingType} // Pass full data (or null for add)
							onSave={handleSave}
							onCancel={handleCancel}
							loadingSubmit={loadingSubmit} // Pass submit loading state
							darkMode={darkMode}
						/>
					)
				)}
			</Modal>
		</div>
	);
};

export default AssessmentTypeManagement;
