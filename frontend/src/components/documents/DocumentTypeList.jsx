import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, notification, Pagination, Row, Col } from "antd";
import { useAuthStore } from "../../services/auth.service";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDocumentTypeStore } from "../../services/documentType.service";

const { Title } = Typography;

const DocumentTypeList = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedDocumentType, setSelectedDocumentType] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [total, setTotal] = useState(0);

	const {
		documentTypes,
		fetchDocumentTypes,
		createDocumentType,
		updateDocumentType,
		deleteDocumentType,
		totalElements, // Added totalElements
	} = useDocumentTypeStore();
	const { user, hasAuthority } = useAuthStore(); // Get hasAuthority

	// Define permission checks
	const canCreateDocumentType = hasAuthority("CREATE_DOCUMENT_TYPE");
	// const canReadDocumentType = hasAuthority("READ_DOCUMENT_TYPE"); //Not used in security config but good to have
	const canUpdateDocumentType = hasAuthority("UPDATE_DOCUMENT_TYPE");
	const canDeleteDocumentType = hasAuthority("DELETE_DOCUMENT_TYPE");

	useEffect(() => {
		fetchDocumentTypesData();
	}, [page, size]);

	const fetchDocumentTypesData = async () => {
		//No need to check read here
		setLoading(true);
		try {
			await fetchDocumentTypes(page, size);
			setTotal(totalElements); // Changed from response to totalElements
		} catch (error) {
			setError(error.message);
			notification.error({
				message: "Error",
				description: `Failed to fetch document types: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const showModal = (documentType) => {
		setSelectedDocumentType(documentType);
		if (documentType) {
			form.setFieldsValue(documentType);
		} else {
			form.resetFields();
		}
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedDocumentType(null);
		form.resetFields();
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			if (selectedDocumentType) {
				if (!canUpdateDocumentType) {
					notification.error({
						message: "Permission Denied",
						description: "You do not have permission to update document types.",
					});
					return;
				}
				await updateDocumentType(selectedDocumentType.id, values);
				notification.success({
					message: "Success",
					description: "Document Type updated successfully",
				});
			} else {
				if (!canCreateDocumentType) {
					notification.error({
						message: "Permission Denied",
						description: "You do not have permission to create document types.",
					});
					return;
				}
				await createDocumentType(values);
				notification.success({
					message: "Success",
					description: "Document Type created successfully",
				});
			}
			fetchDocumentTypesData();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedDocumentType(null);
		} catch (apiError) {
			notification.error({
				message: "Error",
				description: `Failed to save document type: ${apiError.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (documentTypeId) => {
		if (!canDeleteDocumentType) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to delete document types.",
			});
			return;
		}
		setLoading(true);
		try {
			await deleteDocumentType(documentTypeId);
			notification.success({
				message: "Success",
				description: "Document Type deleted successfully",
			});
			fetchDocumentTypesData();
		} catch (error) {
			console.error("Error deleting document type:", error);
			notification.error({
				message: "Error",
				description: `Failed to delete document type: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleTableChange = (pagination) => {
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			render: (text) => text, // No read permission check needed, assuming anyone can read type names
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{canUpdateDocumentType && (
						<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record)}>
							Edit
						</Button>
					)}
					{canDeleteDocumentType && (
						<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
							Delete
						</Button>
					)}
				</Space>
			),
		},
	];

	return (
		<div className="main-container" style={{ padding: 20 }}>
			<Title level={2}>Document Types</Title>

			{/* Responsive Button */}
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24}>
					{canCreateDocumentType && (
						<Button type="default" icon={<PlusOutlined />} onClick={() => showModal(null)} block>
							Add New Document Type
						</Button>
					)}
				</Col>
			</Row>

			{/* Scrollable Table */}
			<div style={{ overflowX: "auto", margin: "0 -16px" }}>
				<Table columns={columns} dataSource={documentTypes} loading={loading} rowKey="id" pagination={false} />
			</div>

			{/* Responsive Pagination */}
			{documentTypes && documentTypes.length > 0 && (
				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
						marginTop: 16,
					}}>
					<Pagination current={page + 1} pageSize={size} total={total} showSizeChanger onChange={handleTableChange} />
				</div>
			)}

			{/* Responsive Modal */}
			<Modal
				title={selectedDocumentType ? "Edit Document Type" : "Add Document Type"}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					(selectedDocumentType ? canUpdateDocumentType : canCreateDocumentType) && (
						<Button key="submit" type="default" onClick={() => form.submit()}>
							{selectedDocumentType ? "Update" : "Save"}
						</Button>
					),
				]}
				width="70%">
				<Form form={form} layout="vertical" onFinish={handleFormSubmit}>
					<Row gutter={16}>
						<Col xs={24}>
							<Form.Item label="Name" name="name" rules={[{ required: true, message: "Please input name!" }]}>
								<Input disabled={!canCreateDocumentType && !canUpdateDocumentType} />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default DocumentTypeList;
