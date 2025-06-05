import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
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
import { useAuthStore } from "../../services/auth.service"; // Assuming correct path
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useImageReportStore } from "../../services/imageReport.service"; // Assuming correct path
import { usePatientStore } from "../../services/patient.service"; // Assuming correct path
import { useImageReportTypeStore } from "../../services/imageReportType.service"; // Assuming correct path
import moment from "moment";
import axios from "axios";
// Removed unused import: import { color } from "framer-motion";

const { Title } = Typography;

const ImageReportList = () => {
	const [loading, setLoading] = useState(false);
	const [formLoading, setFormLoading] = useState(false); // Separate loading state for modal operations
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
	const { imageReports, totalElements, fetchImageReports, createImageReport, updateImageReport, deleteImageReport } = useImageReportStore(); // Get totalElements directly
	const { searchPatients } = usePatientStore();
	const { imageReportTypes, fetchImageReportTypes: fetchTypes } = useImageReportTypeStore(); // Renamed for clarity

	//Patient Search States
	const [patientOptions, setPatientOptions] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState(""); // Only used for display in modal if needed
	const [selectedPatientIdForFilter, setSelectedPatientIdForFilter] = useState(null); // Separate state for the filter input
	const [selectedPatientIdForModal, setSelectedPatientIdForModal] = useState(null); // Separate state for the modal input

	const { user, hasAuthority } = useAuthStore(); // Get user and hasAuthority
	const [uploadList, setUploadList] = useState([]);

	// Fetch types once on mount
	useEffect(() => {
		// Check permission before fetching types for dropdown? Usually okay if backend enforces.
		fetchTypes();
	}, [fetchTypes]);

	// Fetch reports when page, size, or selected patient filter changes
	const fetchImageReportsData = useCallback(async () => {
		// Check if user has READ permission for reports? Backend enforces.
		if (!selectedPatientIdForFilter) {
			useImageReportStore.setState({ imageReports: [], totalElements: 0 }); // Clear store state
			setTotal(0);
			setPage(0);
			setError(null); // Clear error if no patient selected
			return;
		}
		setLoading(true);
		setError(null); // Clear previous errors
		try {
			// READ_IMAGE_REPORT is checked by backend here
			await fetchImageReports(page, size, selectedPatientIdForFilter);
			// No need to manually setTotal, Zustand handles state update
		} catch (error) {
			setError(error.message);
			notification.error({
				message: "Error Fetching Data",
				description: `Failed to fetch image reports: ${error.message}`,
			});
			useImageReportStore.setState({ imageReports: [], totalElements: 0 }); // Clear store state on error
		} finally {
			setLoading(false);
		}
	}, [page, size, selectedPatientIdForFilter, fetchImageReports]); // Added fetchImageReports dependency

	useEffect(() => {
		fetchImageReportsData();
	}, [fetchImageReportsData]); // Use the memoized callback

	// Update total whenever totalElements from the store changes
	useEffect(() => {
		setTotal(totalElements);
	}, [totalElements]);

	const showModal = (imageReport) => {
		// Permission check: Ensure user can either CREATE (if null) or UPDATE (if record exists)
		const canPerformAction = imageReport ? user && hasAuthority("UPDATE_IMAGE_REPORT") : user && hasAuthority("CREATE_IMAGE_REPORT");

		if (!canPerformAction) {
			notification.warning({
				message: "Permission Denied",
				description: "You do not have permission to perform this action.",
			});
			return; // Don't show modal if permission is missing
		}
		if (!selectedPatientIdForFilter && !imageReport) {
			notification.warning({
				message: "Patient Required",
				description: "Please select a patient from the filter before adding a new report.",
			});
			return; // Prevent adding if no patient context from filter
		}

		setUploadList([]);
		setImageFiles([]);
		setSelectedImageReport(imageReport);
		setPatientOptions([]); // Clear search options for modal

		if (imageReport) {
			// Editing existing report
			form.setFieldsValue({
				...imageReport,
				reportDateTime: imageReport.reportDateTime ? moment(imageReport.reportDateTime) : null,
				patientId: imageReport.patientId, // Keep patientId for the modal search field display (if needed)
				performedById: imageReport.performedById, // This might be different from logged in user
				imageReportTypeId: imageReport.imageReportTypeId,
			});
			setSelectedPatientIdForModal(imageReport.patientId);
			// Pre-populate the patient search field in the modal for editing context
			const patientName = `${imageReport.patientFirstName || ""} ${imageReport.patientLastName || ""}`.trim();
			setPatientSearchTerm(patientName || `Patient ID: ${imageReport.patientId}`); // Set initial display text

			if (imageReport.imageUrls && imageReport.imageUrls.length > 0) {
				const initialUploadList = imageReport.imageUrls.map((url, index) => ({
					uid: `${index}-${url}`,
					name: url.substring(url.lastIndexOf("/") + 1),
					status: "done",
					url: url, // Use the direct URL provided by backend
					thumbUrl: url,
				}));
				setUploadList(initialUploadList);
			}
		} else {
			// Adding new report - Patient context comes from the filter
			form.resetFields();
			setSelectedPatientIdForModal(selectedPatientIdForFilter); // Use filter's patient ID
			form.setFieldsValue({
				patientId: selectedPatientIdForFilter, // Set patientId in the form
				performedById: user?.id, // Set current user as performer
			});
			setPatientSearchTerm(""); // Clear search term for new report
		}
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedImageReport(null);
		form.resetFields();
		setPatientSearchTerm("");
		setPatientOptions([]);
		setSelectedPatientIdForModal(null);
		setImageFiles([]);
		setUploadList([]);
	};

	const onImageChange = async ({ fileList }) => {
		// Filter out files that are removed
		const currentFiles = fileList.map((file) => (file.originFileObj ? file.originFileObj : file.url)); // Keep track of files or their URLs

		// Logic to convert existing URLs back to Blobs/Files if needed for resubmission (complex, might need adjustment based on backend requirements)
		// This example assumes new files are originFileObj and existing are kept track of by URL.
		// The handleFormSubmit logic needs to differentiate between new files and existing URLs.

		// Update imageFiles state only with actual file objects for upload
		const newImageFiles = fileList.filter((file) => file.originFileObj).map((file) => file.originFileObj);

		setImageFiles(newImageFiles);
		setUploadList(fileList); // Update visual list
	};

	// Debounced search for patient dropdowns (both filter and modal)
	const handlePatientSearch = useCallback(
		async (value, setOptionsFunc) => {
			if (value && value.length >= 2) {
				// Search only if input length is >= 2
				try {
					// Assuming searchPatients doesn't need specific permission beyond authenticated()
					const searchResults = await searchPatients({ searchTerm: value, page: 0, size: 10 });
					setOptionsFunc(
						searchResults?.content?.map((patient) => ({
							label: `${patient.firstName} ${patient.lastName} (ID: ${patient.id})`, // Include ID for clarity
							value: patient.id, // Use ID as the value
							key: patient.id, // Ensure key is present
						})) || []
					);
				} catch (error) {
					console.error("Failed to search patients:", error);
					setOptionsFunc([]);
				}
			} else {
				setOptionsFunc([]);
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		[searchPatients]
	); // searchPatients from Zustand should be stable

	const handlePreview = (file) => {
		const url = file.url || file.thumbUrl; // Use url or thumbUrl
		if (!url) {
			console.error("No URL found for preview");
			// Optionally handle preview for files being uploaded (using FileReader)
			return;
		}
		setPreviewFile(url);
		const fileExtension = url.split(/[#?]/)[0].split(".").pop().trim().toLowerCase();

		if (["mp4", "mov", "avi", "mkv", "webm", "ogg"].includes(fileExtension)) {
			setFileType("video");
		} else if (["png", "jpeg", "jpg", "webp", "gif", "bmp", "tiff"].includes(fileExtension)) {
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
		// Re-check permissions at the time of submission
		const requiredPermission = selectedImageReport ? "UPDATE_IMAGE_REPORT" : "CREATE_IMAGE_REPORT";
		if (!user || !hasAuthority(requiredPermission)) {
			notification.error({
				message: "Permission Denied",
				description: `You do not have permission to ${selectedImageReport ? "update" : "create"} image reports.`,
			});
			return; // Prevent submission
		}

		try {
			const values = await form.validateFields();
			const formattedReportDateTime = values.reportDateTime ? moment(values.reportDateTime).toISOString() : null;

			const imageReportData = {
				// Fields from form: description, reportText, imageReportTypeId etc.
				...values,
				reportDateTime: formattedReportDateTime,
				patientId: selectedPatientIdForModal, // Use the ID selected/set for the modal
				performedById: user.id, // Always set logged-in user as performer on save/update? Or keep original if editing? Decide policy. Let's keep original if editing.
				...(selectedImageReport && { performedById: selectedImageReport.performedById }), // Keep original performer if editing
				...(selectedImageReport && { id: selectedImageReport.id }), // Ensure ID is present for update
			};

			// Remove patientId from data if backend expects it only via URL/path for update
			// Adjust based on your updateImageReport function signature

			setFormLoading(true); // Use form loading state

			// Differentiate between new files and existing files (represented by URLs in uploadList)
			const existingFileUrls = uploadList.filter((file) => !file.originFileObj && file.url).map((file) => file.url);

			if (selectedImageReport) {
				// UPDATE_IMAGE_REPORT checked above
				await updateImageReport(selectedImageReport.id, imageReportData, imageFiles, existingFileUrls); // Pass existing URLs if needed
				notification.success({
					message: "Success",
					description: "Image Report updated successfully",
				});
			} else {
				// CREATE_IMAGE_REPORT checked above
				await createImageReport(imageReportData, imageFiles); // Pass only new files for create
				notification.success({
					message: "Success",
					description: "Image Report created successfully",
				});
			}

			fetchImageReportsData(); // Refresh list
			handleCancel(); // Close modal and reset form
		} catch (apiError) {
			if (apiError.errorFields) {
				console.log("Validation Failed:", apiError);
				// Antd form automatically highlights validation errors
			} else {
				notification.error({
					message: "Error Saving",
					description: `Failed to save image report: ${apiError.message || "Please check console."}`,
				});
			}
		} finally {
			setFormLoading(false);
		}
	};

	const handleDelete = async (imageReportId) => {
		// Check DELETE permission before attempting delete
		if (!user || !hasAuthority("DELETE_IMAGE_REPORT")) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to delete image reports.",
			});
			return;
		}

		setLoading(true); // Use main loading state for table impacting actions
		try {
			// DELETE_IMAGE_REPORT checked above
			await deleteImageReport(imageReportId);
			notification.success({
				message: "Success",
				description: "Image Report deleted successfully",
			});
			// Refresh data after successful delete
			const currentPageItemCount = imageReports.length;
			const newTotal = total - 1;
			if (currentPageItemCount === 1 && page > 0) {
				setPage(page - 1); // Go to previous page if last item deleted
			} else {
				fetchImageReportsData(); // Fetch current page again
			}
			// No need to manually setTotal, effect hook handles it
		} catch (error) {
			console.error("Error deleting image report:", error);
			notification.error({
				message: "Error Deleting",
				description: `Failed to delete image report: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	// Handler for the top patient filter AutoComplete
	const handleSearchPatientFilterSelect = (patientId) => {
		setSelectedPatientIdForFilter(patientId);
		setPage(0); // Reset to first page when filter changes
	};

	// Handler for the modal patient AutoComplete
	const handleModalPatientSelect = (patientId, option) => {
		setSelectedPatientIdForModal(patientId);
		setPatientSearchTerm(option.label); // Update display text in modal search
		form.setFieldsValue({ patientId: patientId }); // Update form value if needed (though primary key is selectedPatientIdForModal)
	};

	const handleTableChange = (pagination) => {
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	// Simplified - Assuming user details aren't fetched separately here
	const getPerformedByName = (record) => {
		// Preferentially use details embedded in the report object if available from backend
		if (record.performedByFirstName || record.performedByLastName) {
			return `${record.performedByFirstName || ""} ${record.performedByLastName || ""}`.trim();
		}
		// Fallback or if only ID is available (requires fetching user details elsewhere)
		return `User ID: ${record.performedById || "N/A"}`;
	};

	// Get Image Report Type Name
	const getImageReportTypeName = (typeId) => {
		const type = imageReportTypes?.find((t) => t.id === typeId);
		return type?.name || "N/A";
	};

	const columns = [
		{
			title: "Report Date & Time",
			dataIndex: "reportDateTime",
			key: "reportDateTime",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
		},
		{
			title: "Image Type",
			dataIndex: "imageReportTypeId", // Use the ID
			key: "imageReportTypeId",
			render: (typeId) => getImageReportTypeName(typeId), // Render the name
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
			ellipsis: true, // Add ellipsis for long descriptions
			render: (text) => <Tooltip title={text}>{text}</Tooltip>, // Show full text on hover
		},
		// Conditionally add Actions column
		...(user && (hasAuthority("UPDATE_IMAGE_REPORT") || hasAuthority("DELETE_IMAGE_REPORT"))
			? [
					{
						title: "Actions",
						key: "actions",
						width: 120, // Fixed width for actions
						render: (text, record) => (
							<Space size="small">
								{/* Edit Button: Requires UPDATE permission */}
								{user && hasAuthority("UPDATE_IMAGE_REPORT") && (
									<Tooltip title="Edit Report">
										{/* showModal includes permission check */}
										<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)} size="small" />
									</Tooltip>
								)}
								{/* Delete Button: Requires DELETE permission */}
								{user && hasAuthority("DELETE_IMAGE_REPORT") && (
									<Tooltip title="Delete Report">
										{/* handleDelete includes permission check */}
										<Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} size="small" />
									</Tooltip>
								)}
							</Space>
						),
					},
			  ]
			: []), // Empty array if no permissions, column is omitted
	];

	// Upload properties - Check permissions for disabling upload
	const isFormDisabled =
		formLoading ||
		!user ||
		(selectedImageReport && !hasAuthority("UPDATE_IMAGE_REPORT")) ||
		(!selectedImageReport && !hasAuthority("CREATE_IMAGE_REPORT"));

	const uploadProps = {
		fileList: uploadList,
		onChange: onImageChange,
		onPreview: handlePreview,
		beforeUpload: () => false, // Prevent default upload
		listType: "picture-card",
		disabled: isFormDisabled, // Disable upload based on permissions/loading
		multiple: true, // Allow multiple file selection
	};

	return (
		<div className="main-container" style={{ padding: 20 }}>
			<Title level={2}>Patient Image Reports</Title>
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
				<Col xs={24} sm={12} md={10}>
					{/* Patient Filter */}
					<AutoComplete
						style={{ width: "100%" }}
						options={patientOptions}
						onSearch={(value) => handlePatientSearch(value, setPatientOptions)}
						placeholder="Search Patient to Filter Reports (min. 2 chars)"
						filterOption={false}
						onSelect={handleSearchPatientFilterSelect}
						allowClear // Allow clearing the filter
						onChange={(value) => !value && setSelectedPatientIdForFilter(null)} // Clear selection on manual clear
					/>
				</Col>
				<Col xs={24} sm={12} md={{ span: 6, offset: 8 }}>
					{/* Add New Button: Requires CREATE permission AND a patient selected */}
					{user && hasAuthority("CREATE_IMAGE_REPORT") && (
						<Tooltip title={!selectedPatientIdForFilter ? "Select a patient first to add a report" : "Add New Image Report"}>
							<Button
								type="primary"
								icon={<PlusOutlined />}
								onClick={() => showModal(null)}
								disabled={!selectedPatientIdForFilter} // Also disabled if no patient selected
								block>
								Add Report for Selected Patient
							</Button>
						</Tooltip>
					)}
				</Col>
			</Row>
			<div style={{ overflowX: "auto", margin: "0 -16px" }}>
				<Table
					columns={columns}
					dataSource={error ? [] : imageReports}
					loading={loading}
					rowKey="id"
					pagination={false} // Use external pagination
					locale={{
						emptyText: !selectedPatientIdForFilter
							? "Select a patient to view reports."
							: error
							? "Failed to load data or insufficient permissions."
							: "No image reports found for this patient.",
					}}
				/>
			</div>

			{/* Show pagination only if there are items and no error */}
			{!error && total > 0 && (
				<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
					<Pagination
						current={page + 1}
						pageSize={size}
						total={total}
						showSizeChanger
						onChange={handleTableChange}
						onShowSizeChange={(current, pageSize) => {
							setSize(pageSize);
							setPage(0);
						}} // Reset page on size change
						style={{ marginTop: 16 }}
					/>
				</div>
			)}

			{/* Modal for Add/Edit */}
			<Modal
				title={selectedImageReport ? "Edit Image Report" : "Add Image Report"}
				open={isModalVisible}
				onCancel={handleCancel}
				confirmLoading={formLoading} // Show loading on the submit button
				footer={[
					<Button key="cancel" onClick={handleCancel} disabled={formLoading}>
						Cancel
					</Button>,
					<Button
						key="submit"
						type="primary"
						onClick={handleFormSubmit} // Use handleFormSubmit directly
						disabled={isFormDisabled} // Disable based on permissions/loading
						loading={formLoading} // Show spinner on button
					>
						{selectedImageReport ? "Update" : "Save"}
					</Button>,
				]}
				width="70%">
				<Form form={form} layout="vertical">
					{" "}
					{/* Remove onFinish here, handle submission via button click */}
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Patient" name="patientId" /* No rules needed if selection sets state */>
								{/* Patient selection is fixed based on context (filter for new, record for edit) */}
								<Input
									disabled // Non-editable field in modal, context provided
									value={
										selectedPatientIdForModal
											? patientOptions.find((p) => p.value === selectedPatientIdForModal)?.label ||
											  `Patient ID: ${selectedPatientIdForModal}`
											: "No Patient Selected"
									}
								/>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							{/* Performed By is derived, maybe display it */}
							<Form.Item label="Performed By" name="performedById">
								<Input
									disabled
									value={getPerformedByName({
										// Get name based on context
										performedById: selectedImageReport ? selectedImageReport.performedById : user?.id,
										performedByFirstName: selectedImageReport ? selectedImageReport.performedByFirstName : user?.firstName,
										performedByLastName: selectedImageReport ? selectedImageReport.performedByLastName : user?.lastName,
									})}
								/>
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item
								label="Report Date & Time"
								name="reportDateTime"
								rules={[{ required: true, message: "Please select the report date and time" }]}>
								<DatePicker style={{ width: "100%" }} showTime format="YYYY-MM-DD HH:mm" disabled={isFormDisabled} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item
								name="imageReportTypeId"
								label="Image Report Type"
								rules={[{ required: true, message: "Please select an image report type!" }]}>
								<Select
									placeholder="Select an image report type"
									options={imageReportTypes?.map((type) => ({
										label: type.name,
										value: type.id,
									}))}
									disabled={isFormDisabled || !imageReportTypes || imageReportTypes.length === 0} // Also disable if types haven't loaded
									loading={useImageReportTypeStore.getState().loading} // Show loading indicator if types are fetching
								/>
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Description" name="description" rules={[{ required: true, message: "Please input description!" }]}>
								<Input.TextArea rows={3} disabled={isFormDisabled} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Report Text" name="reportText" rules={[{ required: true, message: "Please input report text!" }]}>
								<Input.TextArea rows={3} disabled={isFormDisabled} />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item label="Files (Images/Videos)">
						{/* Upload component uses uploadProps which includes disabled state */}
						<Upload {...uploadProps}>
							{/* Only show upload button if not disabled */}
							{!isFormDisabled && (
								<div>
									<PlusOutlined />
									<div style={{ marginTop: 8 }}>Upload</div>
								</div>
							)}
						</Upload>
					</Form.Item>
				</Form>
			</Modal>

			{/* File Preview Modal */}
			<Modal open={previewVisible} title="File Preview" footer={null} onCancel={handlePreviewCancel} centered width="80%">
				{fileType === "image" && previewFile && (
					<Image src={previewFile} style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }} preview={false} />
				)}
				{fileType === "video" && previewFile && (
					<video src={previewFile} controls style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }} />
				)}
				{fileType === "unknown" && <Typography.Text>Cannot preview this file type.</Typography.Text>}
			</Modal>
		</div>
	);
};

export default ImageReportList;
