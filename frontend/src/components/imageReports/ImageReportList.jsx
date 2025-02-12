import React, { useState, useEffect } from "react";
import {
	Table,
	Input,
	Button,
	Space,
	Typography,
	Modal,
	Form,
	DatePicker,
	notification,
	Upload,
	AutoComplete,
	Pagination,
	Image,
	Select,
	Row,
	Col,
	Tooltip,
} from "antd";
import { useAuthStore } from "../../services/auth.service";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useImageReportStore } from "../../services/imageReport.service";
import { usePatientStore } from "../../services/patient.service";
import { useImageReportTypeStore } from "../../services/imageReportType.service";
import moment from "moment";
import axios from "axios";
import { color } from "framer-motion";

const { Title } = Typography;

const ImageReportList = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedImageReport, setSelectedImageReport] = useState(null);
	const [form] = Form.useForm();
	const [imageFiles, setImageFiles] = useState([]);
	const [previewVisible, setPreviewVisible] = useState(false);
	const [previewFile, setPreviewFile] = useState(null);
	const [fileType, setFileType] = useState(null);
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [searchParams, setSearchParams] = useState({});
	const { imageReports, fetchImageReports, createImageReport, updateImageReport, deleteImageReport } = useImageReportStore();
	const { patients, searchPatients } = usePatientStore();
	const { imageReportTypes, fetchImageReportTypes } = useImageReportTypeStore();

	//Patient Search States
	const [patientOptions, setPatientOptions] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [selectedPatientId, setSelectedPatientId] = useState(null);

	const { user } = useAuthStore();
	const [uploadList, setUploadList] = useState([]);

	useEffect(() => {
		fetchImageReportTypes();
	}, []);

	useEffect(() => {
		fetchImageReportsData();
	}, [page, size, searchParams]);

	const fetchImageReportsData = async () => {
		if (!searchParams?.patientId) {
			setLoading(false);
			setTotal(0);
			setPage(0);
			return;
		}
		setLoading(true);
		try {
			await fetchImageReports(page, size, searchParams?.patientId);
			setTotal(useImageReportStore.getState().totalElements);
		} catch (error) {
			setError(error.message);
			notification.error({
				message: "Error",
				description: `Failed to fetch image reports: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const showModal = (imageReport) => {
		setUploadList([]);
		setSelectedImageReport(imageReport);
		setImageFiles([]);
		if (imageReport) {
			form.setFieldsValue({
				...imageReport,
				reportDateTime: moment(imageReport.reportDateTime),
				patientId: imageReport.patientId,
				performedById: imageReport.performedById,
				imageReportTypeId: imageReport.imageReportTypeId,
			});
			setSelectedPatientId(imageReport.patientId);

			if (imageReport.imageUrls && imageReport.imageUrls.length > 0) {
				const initialUploadList = imageReport.imageUrls.map((url, index) => {
					let fileUrl = url;
					if (fileUrl.startsWith(".")) {
						fileUrl = fileUrl.substring(1);
					}
					const fileUrlWithBase = `http://localhost:8080${fileUrl}`;
					return {
						uid: `${index}-${fileUrlWithBase}`, // Generate a unique ID
						name: fileUrlWithBase.split("/").pop(),
						status: "done",
						url: fileUrlWithBase,
						thumbUrl: fileUrlWithBase,
					};
				});
				setUploadList(initialUploadList);
			}
		} else {
			form.resetFields();
			setSelectedPatientId(null);
			if (user) {
				form.setFieldsValue({ performedById: user.id });
			}
		}
		setIsModalVisible(true);
		setPatientSearchTerm("");
		setPatientOptions([]);
	};
	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedImageReport(null);
		form.resetFields();
		setPatientSearchTerm("");
		setPatientOptions([]);
		setSelectedPatientId(null);
		setImageFiles([]);
		setUploadList([]);
	};

	const onImageChange = async ({ fileList }) => {
		const newImageFiles = [];
		for (const fileInfo of fileList) {
			if (fileInfo.originFileObj) {
				newImageFiles.push(fileInfo.originFileObj);
			} else {
				//if the files were previously stored get them with url
				try {
					const response = await axios.get(fileInfo.url, { responseType: "blob" });
					const blob = new Blob([response.data], { type: response.headers["content-type"] });
					const file = new File([blob], fileInfo.name, { type: blob.type });
					newImageFiles.push(file);
				} catch (e) {
					console.error("Error fetching file:", e);
				}
			}
		}

		setImageFiles(newImageFiles);
		setUploadList(fileList);
	};

	const handlePatientSearch = async (value) => {
		setPatientSearchTerm(value);
		if (value) {
			try {
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
	};

	const handlePreview = (file) => {
		setPreviewFile(file.url);

		const fileExtension = file.url.split(".").pop().toLowerCase();

		if (["mp4", "mov", "avi", "mkv"].includes(fileExtension)) {
			setFileType("video");
		} else if (["png", "jpeg", "jpg", "webp"].includes(fileExtension)) {
			setFileType("image");
		} else {
			setFileType("unknown");
		}
		setPreviewVisible(true);
	};

	const handlePreviewCancel = () => {
		setPreviewVisible(false);
		setPreviewFile(null);
		setFileType(null);
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			const formattedReportDateTime = values.reportDateTime ? values.reportDateTime.format("YYYY-MM-DDTHH:mm:ss") : null;

			const imageReportData = {
				...values,
				reportDateTime: formattedReportDateTime,
				patientId: selectedPatientId,
				performedById: user.id,
			};
			setLoading(true);

			if (selectedImageReport) {
				await updateImageReport(selectedImageReport.id, imageReportData, imageFiles);
				notification.success({
					message: "Success",
					description: "Image Report updated successfully",
				});
			} else {
				await createImageReport(imageReportData, imageFiles);
				notification.success({
					message: "Success",
					description: "Image Report created successfully",
				});
			}

			fetchImageReportsData();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedImageReport(null);
			setPatientSearchTerm("");
			setPatientOptions([]);
			setSelectedPatientId(null);
			setImageFiles([]);
			setUploadList([]);
		} catch (apiError) {
			notification.error({
				message: "Error",
				description: `Failed to save image report: ${apiError.message}`,
			});
		} finally {
			setLoading(false);
		}
	};
	const handleDelete = async (imageReportId) => {
		setLoading(true);
		try {
			await deleteImageReport(imageReportId);
			notification.success({
				message: "Success",
				description: "Image Report deleted successfully",
			});
			fetchImageReportsData();
		} catch (error) {
			console.error("Error deleting image report:", error);
			notification.error({
				message: "Error",
				description: `Failed to delete image report: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSearchPatientFilter = (patientId) => {
		setSearchParams({ ...searchParams, patientId: patientId });
		setPage(0);
	};

	const handleTableChange = (pagination) => {
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	const getPerformedByName = (performedById) => {
		if (!user) return "N/A";
		return `${user.firstName} ${user.lastName}`;
	};

	const columns = [
		{
			title: "Report Date & Time",
			dataIndex: "reportDateTime",
			key: "reportDateTime",
			render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
		},
		{
			title: "Image Type",
			dataIndex: "imageType",
			key: "imageType",
		},
		{
			title: "Performed By",
			dataIndex: "performedById",
			key: "performedById",
			render: (text) => getPerformedByName(text),
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					<Tooltip title="Edit">
						<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record)}>
							edit
						</Button>
					</Tooltip>
					<Tooltip title="Delete">
						<Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
							delete
						</Button>
					</Tooltip>
				</Space>
			),
		},
	];

	const uploadProps = {
		fileList: uploadList,
		onChange: onImageChange,
		beforeUpload: () => false,
	};

	return (
		<div className="main-container" style={{ padding: 20 }}>
			<Title level={2}>Patient Image Reports</Title>
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12}>
					<AutoComplete
						style={{ width: "100%" }}
						options={patientOptions}
						onSearch={handlePatientSearch}
						placeholder="Search for a patient"
						filterOption={false}
						onSelect={handleSearchPatientFilter}
					/>
				</Col>
				<Col xs={24} sm={12}>
					<Button type="default" icon={<PlusOutlined />} onClick={() => showModal(null)} disabled={!searchParams?.patientId} block>
						Add New Image Report
					</Button>
				</Col>
			</Row>
			<div style={{ overflowX: "auto", margin: "0 -16px" }}>
				<Table columns={columns} dataSource={imageReports} loading={loading} rowKey="id" pagination={false} />
			</div>

			{imageReports && imageReports.length > 0 && (
				<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
					<Pagination
						current={page + 1}
						pageSize={size}
						total={total}
						showSizeChanger
						onChange={handleTableChange}
						style={{ marginTop: 16 }}
					/>
				</div>
			)}

			<Modal
				title={selectedImageReport ? "Edit Image Report" : "Add Image Report"}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="default" onClick={() => form.submit()}>
						{selectedImageReport ? "Update" : "Save"}
					</Button>,
				]}
				width="70%">
				<Form form={form} layout="vertical" onFinish={handleFormSubmit}>
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
								<AutoComplete
									options={patientOptions}
									onSearch={handlePatientSearch}
									placeholder="Search for a patient"
									filterOption={false}
									onSelect={(patientId, option) => {
										setSelectedPatientId(patientId);
										form.setFieldsValue({ ...form.getFieldsValue(), patientId: patientId });
									}}
								/>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							{user && (
								<Form.Item label="Performed By" name="performedById">
									<Input disabled value={`${user.firstName} ${user.lastName}`} />
								</Form.Item>
							)}
						</Col>
					</Row>
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item
								label="Report Date & Time"
								name="reportDateTime"
								rules={[{ required: true, message: "Please select the report date and time" }]}>
								<DatePicker style={{ width: "100%" }} showTime />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item
								name="imageReportTypeId"
								label="Image Report Type"
								rules={[{ required: true, message: "Please select a image report type!" }]}>
								<Select
									placeholder="Select a image report type"
									options={imageReportTypes?.map((type) => ({
										label: type.name,
										value: type.id,
									}))}
								/>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Description" name="description" rules={[{ required: true, message: "Please input description!" }]}>
								<Input.TextArea rows={3} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Report Text" name="reportText" rules={[{ required: true, message: "Please input report text!" }]}>
								<Input.TextArea rows={3} />
							</Form.Item>
						</Col>
					</Row>

					<Form.Item label="Files">
						<Upload {...uploadProps} listType="picture-card">
							<PlusOutlined />
							<div style={{ marginTop: 8 }}>Upload</div>
						</Upload>
					</Form.Item>
				</Form>
			</Modal>

			<Modal visible={previewVisible} title="File Preview" footer={null} onCancel={handlePreviewCancel}>
				{fileType === "image" && previewFile && <Image src={previewFile} style={{ width: "100%" }} />}
				{fileType === "video" && previewFile && <video src={previewFile} controls style={{ width: "100%" }} />}
				{fileType === "unknown" && <Typography.Text>Unsupported file type</Typography.Text>}
			</Modal>
		</div>
	);
};

export default ImageReportList;
