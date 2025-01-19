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
} from "antd";
import { useAuthStore } from "../services/auth.service";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useImageReportStore } from "../services/imageReport.service";
import { usePatientStore } from "../services/patient.service";
import { useImageReportTypeStore } from "../services/imageReportType.service";
import moment from "moment";

const { Title } = Typography;

const ImageReportList = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedImageReport, setSelectedImageReport] = useState(null);
	const [form] = Form.useForm();
	const [imageFiles, setImageFiles] = useState([]);
	const [existingFiles, setExistingFiles] = useState([]); // To store the existing files URLs for the edit modal
	const [previewVisible, setPreviewVisible] = useState(false); // Track file preview modal visibility
	const [previewFile, setPreviewFile] = useState(null); // Store the URL of the file to preview
	const [fileType, setFileType] = useState(null); // Track the type of file being previewed
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
			// setImageReports([]);
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
		setExistingFiles([]);
		setSelectedImageReport(imageReport);
		if (imageReport) {
			//set the existing file urls before opening the modal
			if (imageReport.imageUrls && imageReport.imageUrls.length > 0) {
				const files = imageReport.imageUrls.map((url) => {
					let fileUrl = url;
					if (fileUrl.startsWith(".")) {
						fileUrl = fileUrl.substring(1);
					}
					return {
						url: `${fileUrl}`,
						originalUrl: fileUrl,
					};
				});
				setExistingFiles(files);

				const imageUrls = files.map((file) => file.originalUrl); // Extract original URLs
				form.setFieldsValue({
					...imageReport,
					reportDateTime: moment(imageReport.reportDateTime),
					patientId: imageReport.patientId,
					performedById: imageReport.performedById,
					imageUrls: imageUrls,
					imageReportTypeId: imageReport.imageReportTypeId,
				});
				setSelectedPatientId(imageReport.patientId);
			} else {
				form.setFieldsValue({
					...imageReport,
					reportDateTime: moment(imageReport.reportDateTime),
					patientId: imageReport.patientId,
					performedById: imageReport.performedById,
					imageReportTypeId: imageReport.imageReportTypeId,
				});
				setSelectedPatientId(imageReport.patientId);
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
		setImageFiles([]);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedImageReport(null);
		form.resetFields();
		setPatientSearchTerm("");
		setPatientOptions([]);
		setSelectedPatientId(null);
		setExistingFiles([]);
		setImageFiles([]);
	};

	const onImageChange = ({ fileList }) => {
		setImageFiles(fileList.map((file) => file.originFileObj));
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

	const handleRemoveExistingFile = (fileUrl) => {
		const updatedFiles = existingFiles.filter((file) => file.url !== fileUrl);
		setExistingFiles(updatedFiles);

		// Get current form values
		const currentFormValues = form.getFieldsValue();

		// Filter imageUrls from the form values based on the updatedFiles state
		const updatedFileUrls = updatedFiles.map((file) => file.originalUrl);

		// Update the form's imageUrls value to match the filtered files
		form.setFieldsValue({
			...currentFormValues,
			imageUrls: updatedFileUrls,
		});
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
			setExistingFiles([]);
			setImageFiles([]);
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

	const getUserName = (userId) => {
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
			dataIndex: "performedByName",
			key: "performedByName",
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
			<Title level={2}>Patient Image Reports</Title>
			<Space style={{ marginBottom: 16 }}>
				<AutoComplete
					style={{ width: 300 }}
					options={patientOptions}
					onSearch={handlePatientSearch}
					placeholder="Search for a patient"
					filterOption={false}
					onSelect={handleSearchPatientFilter}
				/>
				<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)} disabled={!searchParams?.patientId}>
					Add New Image Report
				</Button>
			</Space>
			<Table columns={columns} dataSource={imageReports} loading={loading} rowKey="id" pagination={false} />
			{imageReports && imageReports.length > 0 && (
				<Pagination current={page + 1} pageSize={size} total={total} onChange={handleTableChange} style={{ marginTop: 16, float: "right" }} />
			)}

			<Modal
				title={selectedImageReport ? "Edit Image Report" : "Add Image Report"}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={() => form.submit()}>
						{selectedImageReport ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical" onFinish={handleFormSubmit}>
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
					{user && (
						<Form.Item label="Performed By" name="performedById">
							<Input disabled value={`${user.firstName} ${user.lastName}`} />
						</Form.Item>
					)}
					<Form.Item
						label="Report Date & Time"
						name="reportDateTime"
						rules={[{ required: true, message: "Please select the report date and time" }]}>
						<DatePicker style={{ width: "100%" }} showTime />
					</Form.Item>

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
					<Form.Item label="Description" name="description" rules={[{ required: true, message: "Please input description!" }]}>
						<Input.TextArea rows={3} />
					</Form.Item>
					<Form.Item label="Report Text" name="reportText" rules={[{ required: true, message: "Please input report text!" }]}>
						<Input.TextArea rows={5} />
					</Form.Item>
					{selectedImageReport && existingFiles && existingFiles.length > 0 && (
						<Form.Item label="Existing Files">
							{existingFiles.map((file, index) => (
								<div key={index} style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
									{["png", "jpeg", "jpg", "webp"].some((ext) => file.url.toLowerCase().endsWith(ext)) ? (
										<Image
											src={file.url}
											alt={`file-${index}`}
											style={{ maxHeight: "100px", maxWidth: "200px", cursor: "pointer" }}
											onClick={() => handlePreview(file)}
										/>
									) : (
										<video
											src={file.url}
											alt={`file-${index}`}
											style={{ maxHeight: "100px", maxWidth: "200px", cursor: "pointer" }}
											onClick={() => handlePreview(file)}
										/>
									)}

									<Button
										type="danger"
										style={{ marginLeft: "10px" }}
										size="small"
										onClick={() => handleRemoveExistingFile(file.url)}>
										Remove
									</Button>
								</div>
							))}
						</Form.Item>
					)}
					<Form.Item label="Files">
						<Upload listType="picture-card" multiple onChange={onImageChange} beforeUpload={() => false}>
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
