// DocumentList.js (Frontend - No Changes Needed from Previous Response)
import React, { useState, useEffect } from "react";
import {
	Table,
	Input,
	Button,
	Space,
	Typography,
	Modal,
	Form,
	notification,
	Upload,
	AutoComplete,
	Pagination,
	Select,
	Tooltip,
	Row,
	Col,
} from "antd";
import { useAuthStore } from "../../services/auth.service";
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import { useDocumentStore } from "../../services/document.service";
import { useDocumentTypeStore } from "../../services/documentType.service";
import { usePatientStore } from "../../services/patient.service"; // Import usePatientStore
import moment from "moment";
import axios from "axios";

const { Title } = Typography;

const DocumentList = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedDocument, setSelectedDocument] = useState(null);
	const [form] = Form.useForm();
	const [file, setFile] = useState(null);
	const [uploadList, setUploadList] = useState([]);
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [searchParams, setSearchParams] = useState({});

	// Patient Search States
	const [patientOptions, setPatientOptions] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [selectedPatientId, setSelectedPatientId] = useState(null);

	const { documents, fetchDocuments, createDocument, updateDocument, deleteDocument, patients } = useDocumentStore(); //removed fetchPatients and fetchUsers,
	const { documentTypes, fetchDocumentTypes } = useDocumentTypeStore();
	const { searchPatients } = usePatientStore(); // Use searchPatients from usePatientStore
	const { user, hasAuthority } = useAuthStore(); // Get hasAuthority

	// Define permission checks
	const canCreateDocument = hasAuthority("CREATE_DOCUMENT");
	const canReadDocument = hasAuthority("READ_DOCUMENT");
	const canUpdateDocument = hasAuthority("UPDATE_DOCUMENT");
	const canDeleteDocument = hasAuthority("DELETE_DOCUMENT");

	useEffect(() => {
		fetchDocumentTypes();
		// fetchUsers(); // Removed. User list not needed.
	}, []);

	useEffect(() => {
		fetchDocumentsData();
	}, [page, size, searchParams.patientId]);

	const fetchDocumentsData = async () => {
		if (!canReadDocument) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to view documents.",
			});
			return;
		}

		if (!searchParams?.patientId) {
			setDocuments([]); // Clear documents if no patient is selected
			setLoading(false);
			setTotal(0);
			setPage(0);
			return;
		}
		setLoading(true);
		try {
			const response = await fetchDocuments(page, size, searchParams?.patientId);
			// No need to check canReadDocument here, as the fetch itself is protected.
			// The API should only return data the user is allowed to see.
			setTotal(response.totalElements);
		} catch (error) {
			setError(error.message);
			notification.error({
				message: "Error",
				description: `Failed to fetch documents: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const showModal = (document) => {
		setUploadList([]);
		setSelectedDocument(document);
		setFile(null);
		if (document) {
			form.setFieldsValue({
				...document,
				documentTypeId: document.documentTypeId,
				patientId: document.patientId,
				uploadedById: document.uploadedById,
			});
			setSelectedPatientId(document.patientId);
			if (document.documentPath) {
				let fileUrl = document.documentPath;
				if (fileUrl.startsWith(".")) {
					fileUrl = fileUrl.substring(1);
				}
				const fileUrlWithBase = `${fileUrl}`;
				setUploadList([
					{
						uid: "initialFile",
						name: fileUrlWithBase.split("/").pop(),
						status: "done",
						url: fileUrlWithBase,
						thumbUrl: fileUrlWithBase,
					},
				]);
			}
		} else {
			form.resetFields();
			setSelectedPatientId(null);
			if (user) {
				form.setFieldsValue({ uploadedById: user.id });
			}
		}
		setIsModalVisible(true);
		setPatientSearchTerm("");
		setPatientOptions([]);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedDocument(null);
		form.resetFields();
		setFile(null);
		setPatientSearchTerm("");
		setPatientOptions([]);
		setSelectedPatientId(null);
		setUploadList([]);
	};

	const onFileChange = async ({ fileList }) => {
		const newFiles = [];
		for (const fileInfo of fileList) {
			if (fileInfo.originFileObj) {
				newFiles.push(fileInfo.originFileObj);
			} else {
				try {
					const response = await axios.get(fileInfo.url, { responseType: "blob" });
					const blob = new Blob([response.data], { type: response.headers["content-type"] });
					const file = new File([blob], fileInfo.name, { type: blob.type });
					newFiles.push(file);
				} catch (e) {
					console.error("Error fetching file:", e);
				}
			}
		}
		setFile(newFiles.length > 0 ? newFiles[0] : null);
		setUploadList(fileList);
	};

	const handlePatientSearch = async (value) => {
		setPatientSearchTerm(value);
		if (value) {
			try {
				// Use searchPatients from usePatientStore
				const searchResults = await searchPatients({ searchTerm: value, page: 0, size: 10 });
				setPatientOptions(
					searchResults?.content?.map((patient) => ({
						label: `${patient.firstName} ${patient.lastName}`,
						value: patient.id,
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

	const handlePatientSelect = (patientId) => {
		setSelectedPatientId(patientId);
		handleSearchPatientFilter(patientId);
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			const documentData = {
				...values,
				patientId: selectedPatientId,
			};
			setLoading(true);
			if (selectedDocument) {
				if (!canUpdateDocument) {
					notification.error({
						message: "Permission Denied",
						description: "You do not have permission to update documents.",
					});
					return;
				}
				await updateDocument(selectedDocument.id, documentData, file);
				notification.success({
					message: "Success",
					description: "Document updated successfully",
				});
			} else {
				if (!canCreateDocument) {
					notification.error({
						message: "Permission Denied",
						description: "You do not have permission to create documents.",
					});
					return;
				}
				await createDocument(documentData, file);
				notification.success({
					message: "Success",
					description: "Document created successfully",
				});
			}
			fetchDocumentsData();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedDocument(null);
			setFile(null);
			setPatientSearchTerm("");
			setPatientOptions([]);
			setSelectedPatientId(null);
			setUploadList([]);
		} catch (apiError) {
			notification.error({
				message: "Error",
				description: `Failed to save document: ${apiError.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (documentId) => {
		if (!canDeleteDocument) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to delete documents.",
			});
			return;
		}
		setLoading(true);
		try {
			await deleteDocument(documentId);
			notification.success({
				message: "Success",
				description: "Document deleted successfully",
			});
			fetchDocumentsData();
		} catch (error) {
			console.error("Error deleting document:", error);
			notification.error({
				message: "Error",
				description: `Failed to delete document: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDownload = async (record) => {
		if (!canReadDocument) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to download documents.",
			});
			return;
		}
		setLoading(true);
		try {
			let fileUrl = record.documentPath;
			if (fileUrl.startsWith(".")) {
				fileUrl = fileUrl.substring(1);
			}
			const fileUrlWithBase = `${fileUrl}`;
			const response = await axios.get(fileUrlWithBase, { responseType: "blob" });

			const contentDisposition = response.headers["content-disposition"];
			let filename = record.documentName;

			if (contentDisposition) {
				const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
				if (filenameMatch && filenameMatch[1]) {
					filename = filenameMatch[1];
				}
			} else {
				const fileExtensionMatch = record.documentPath.match(/\.([^.]+)$/);
				const fileExtension = fileExtensionMatch ? `.${fileExtensionMatch[1]}` : "";
				filename = `${record.documentName}${fileExtension}`;
			}

			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", filename);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error downloading file:", error);
			notification.error({
				message: "Error",
				description: `Failed to download document: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSearchPatientFilter = (patientId) => {
		setSearchParams({ ...searchParams, patientId: patientId });
		setPage(0);
		// No need to call fetchDocuments here, useEffect will handle it.
		// fetchDocuments(0, size, patientId); // Removed this line
	};

	const handleTableChange = (pagination) => {
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	const columns = [
		{
			title: "Name",
			dataIndex: "documentName",
			key: "documentName",
			render: (text) => (canReadDocument ? text : "***"), // Data masking
		},
		{
			title: "Upload Date",
			dataIndex: "uploadDate",
			key: "uploadDate",
			render: (text) => (canReadDocument ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "***"), // Data masking
		},
		{
			title: "Document Type",
			dataIndex: "documentTypeId",
			key: "documentType",
			render: (text) => {
				if (!canReadDocument) return "***"; // Data masking
				const docType = documentTypes.find((docType) => docType.id === text);
				return docType ? docType.name : "N/A";
			},
		},
		{
			title: "Uploaded By",
			dataIndex: "uploadedByName",
			key: "uploadedBy",
			render: (text) => (canReadDocument ? text : "***"), // Data masking
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{canUpdateDocument && (
						<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record)}>
							Edit
						</Button>
					)}
					{canDeleteDocument && (
						<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
							Delete
						</Button>
					)}
					{canReadDocument && (
						<Tooltip title="Download">
							<Button type="default" icon={<DownloadOutlined />} onClick={() => handleDownload(record)} />
						</Tooltip>
					)}
				</Space>
			),
		},
	];

	const uploadProps = {
		fileList: uploadList,
		onChange: onFileChange,
		beforeUpload: () => false, // Prevent Ant Design from automatically uploading
		disabled: !canCreateDocument && !canUpdateDocument,
	};

	return (
		<div className="main-container" style={{ padding: 20 }}>
			<Title level={2}>Documents</Title>
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12}>
					<AutoComplete
						style={{ width: "100%" }}
						options={patientOptions}
						onSearch={handlePatientSearch}
						disabled={!canReadDocument}
						placeholder="Search for a patient"
						filterOption={false}
						onSelect={handlePatientSelect}
					/>
				</Col>
				<Col xs={24} sm={12}>
					{canCreateDocument && (
						<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)} disabled={!searchParams?.patientId} block>
							Add New Document
						</Button>
					)}
				</Col>
			</Row>

			<div style={{ overflowX: "auto", margin: "0 -16px" }}>
				<Table columns={columns} dataSource={documents} loading={loading} rowKey="id" pagination={false} />
			</div>

			{documents && documents.length > 0 && (
				<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
					<Pagination current={page + 1} pageSize={size} total={total} showSizeChanger onChange={handleTableChange} />
				</div>
			)}

			<Modal
				title={selectedDocument ? "Edit Document" : "Add Document"}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					(selectedDocument ? canUpdateDocument : canCreateDocument) && (
						<Button key="submit" type="primary" onClick={() => form.submit()}>
							{selectedDocument ? "Update" : "Save"}
						</Button>
					),
				]}
				width="70%">
				<Form form={form} layout="vertical" onFinish={handleFormSubmit}>
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
								<AutoComplete
									options={patientOptions}
									onSearch={handlePatientSearch}
									disabled={!canCreateDocument && !canUpdateDocument}
									placeholder="Search for a patient"
									filterOption={false}
									onSelect={(patientId) => {
										setSelectedPatientId(patientId);
										handleSearchPatientFilter(patientId);
									}}
								/>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							{user && (
								<Form.Item label="Uploaded By" name="uploadedById">
									<Input disabled value={`${user.firstName} ${user.lastName}`} />
								</Form.Item>
							)}
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Document Name" name="documentName" rules={[{ required: true, message: "Please input document name!" }]}>
								<Input disabled={!canCreateDocument && !canUpdateDocument} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item
								name="documentTypeId"
								label="Document Type"
								rules={[{ required: true, message: "Please select a document type!" }]}>
								<Select
									disabled={!canCreateDocument && !canUpdateDocument}
									placeholder="Select a document type"
									options={documentTypes?.map((type) => ({
										label: type.name,
										value: type.id,
									}))}
								/>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24}>
							{canReadDocument && selectedDocument && selectedDocument.documentPath && (
								<Button type="link" icon={<DownloadOutlined />} onClick={() => handleDownload(selectedDocument)}>
									Download Existing Document
								</Button>
							)}
							<Form.Item label="File" name="file">
								<Upload {...uploadProps}>
									<Button icon={<PlusOutlined />} disabled={!canCreateDocument && !canUpdateDocument}>
										Select File
									</Button>
								</Upload>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default DocumentList;
