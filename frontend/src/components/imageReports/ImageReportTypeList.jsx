import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, notification, Pagination, Row, Col, Tooltip } from "antd";
import { useAuthStore } from "../../services/auth.service"; // Assuming correct path
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useImageReportTypeStore } from "../../services/imageReportType.service"; // Assuming correct path

const { Title } = Typography;

const ImageReportTypeList = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null); // Keep error state for potential fetch errors
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedImageReportType, setSelectedImageReportType] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [total, setTotal] = useState(0);

	const { imageReportTypes, fetchImageReportTypes, createImageReportType, updateImageReportType, deleteImageReportType } =
		useImageReportTypeStore();

	// Get user and hasAuthority function from auth store
	const { user, hasAuthority } = useAuthStore();

	useEffect(() => {
		fetchImageReportTypesData();
		// Intentionally not including fetchImageReportTypesData in dependency array
		// as it causes infinite loops if the function reference changes.
		// fetchImageReportTypes itself is stable.
	}, [page, size, fetchImageReportTypes]); // Added fetchImageReportTypes dependency

	const fetchImageReportTypesData = async () => {
		// Check for READ permission before fetching?
		// Generally, backend handles this. If fetch fails due to 403, error state will be set.
		// Assuming READ_IMAGE_REPORT_TYPE is required to see the list, but we control actions below.
		setLoading(true);
		try {
			// Pass page and size correctly based on how the store function is implemented
			await fetchImageReportTypes(page, size);
			// Access total elements correctly from the store state
			setTotal(useImageReportTypeStore.getState().totalElements);
			setError(null); // Clear previous errors on successful fetch
		} catch (error) {
			setError(error.message);
			notification.error({
				message: "Error Fetching Data",
				description: `Failed to fetch image report types: ${error.message}`,
			});
			// Reset data and total on fetch error
			useImageReportTypeStore.setState({ imageReportTypes: [], totalElements: 0 });
			setTotal(0);
		} finally {
			setLoading(false);
		}
	};

	const showModal = (imageReportType) => {
		// Permission check: Ensure user can either CREATE (if null) or UPDATE (if record exists)
		const canPerformAction = imageReportType
			? user && hasAuthority("UPDATE_IMAGE_REPORT_TYPE")
			: user && hasAuthority("CREATE_IMAGE_REPORT_TYPE");

		if (!canPerformAction) {
			notification.warning({
				message: "Permission Denied",
				description: "You do not have permission to perform this action.",
			});
			return; // Don't show modal if permission is missing
		}

		setSelectedImageReportType(imageReportType);
		if (imageReportType) {
			form.setFieldsValue(imageReportType);
		} else {
			form.resetFields();
		}
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedImageReportType(null);
		form.resetFields();
	};

	const handleFormSubmit = async () => {
		// Re-check permissions at the time of submission
		const requiredPermission = selectedImageReportType ? "UPDATE_IMAGE_REPORT_TYPE" : "CREATE_IMAGE_REPORT_TYPE";
		if (!user || !hasAuthority(requiredPermission)) {
			notification.error({
				message: "Permission Denied",
				description: `You do not have permission to ${selectedImageReportType ? "update" : "create"} image report types.`,
			});
			return; // Prevent submission
		}

		try {
			const values = await form.validateFields();
			setLoading(true);

			if (selectedImageReportType) {
				await updateImageReportType(selectedImageReportType.id, values);
				notification.success({
					message: "Success",
					description: "Image Report Type updated successfully",
				});
			} else {
				await createImageReportType(values);
				notification.success({
					message: "Success",
					description: "Image Report Type created successfully",
				});
			}
			// Refresh data after successful save/update
			fetchImageReportTypesData();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedImageReportType(null);
		} catch (apiError) {
			// Catch validation errors or API errors
			if (apiError.errorFields) {
				console.log("Validation Failed:", apiError);
			} else {
				notification.error({
					message: "Error Saving",
					description: `Failed to save image report type: ${apiError.message || "Please check console for details."}`,
				});
			}
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (imageReportTypeId) => {
		// Check DELETE permission before attempting delete
		if (!user || !hasAuthority("DELETE_IMAGE_REPORT_TYPE")) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to delete image report types.",
			});
			return;
		}

		setLoading(true);
		try {
			await deleteImageReportType(imageReportTypeId);
			notification.success({
				message: "Success",
				description: "Image Report Type deleted successfully",
			});
			// Refresh data after successful delete
			// If the deleted item was the last on the current page, adjust page number
			const currentPageItemCount = imageReportTypes.length;
			const newTotal = total - 1;
			if (currentPageItemCount === 1 && page > 0) {
				setPage(page - 1); // Go to previous page
			} else {
				fetchImageReportTypesData(); // Fetch current page again
			}
			setTotal(newTotal); // Update total count immediately
		} catch (error) {
			console.error("Error deleting image report type:", error);
			notification.error({
				message: "Error Deleting",
				description: `Failed to delete image report type: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleTableChange = (pagination) => {
		// Pagination starts at 1, backend uses 0-based index
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	// Define columns structure
	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			render: (price) => (price != null ? `$${Number(price).toFixed(2)}` : "N/A"), // Basic formatting
		},
		// Conditionally include the Actions column only if user has UPDATE or DELETE permissions
		...(user && (hasAuthority("UPDATE_IMAGE_REPORT_TYPE") || hasAuthority("DELETE_IMAGE_REPORT_TYPE"))
			? [
					{
						title: "Actions",
						key: "actions",
						render: (text, record) => (
							<Space size="middle">
								{/* Show Edit button only if user has UPDATE permission */}
								{user && hasAuthority("UPDATE_IMAGE_REPORT_TYPE") && (
									<Tooltip title="Edit">
										{/* showModal already includes a permission check, but this prevents rendering the button */}
										<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)} size="small" />
									</Tooltip>
								)}
								{/* Show Delete button only if user has DELETE permission */}
								{user && hasAuthority("DELETE_IMAGE_REPORT_TYPE") && (
									<Tooltip title="Delete">
										<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} size="small" />
									</Tooltip>
								)}
							</Space>
						),
					},
			  ]
			: []), // If no permissions, this part evaluates to an empty array, effectively removing the column
	];

	// Determine if the form inputs should be disabled based on permissions and modal state
	const isFormDisabled =
		!user ||
		(selectedImageReportType && !hasAuthority("UPDATE_IMAGE_REPORT_TYPE")) ||
		(!selectedImageReportType && !hasAuthority("CREATE_IMAGE_REPORT_TYPE"));

	return (
		<div className="main-container" style={{ padding: 20 }}>
			<Title level={2}>Image Report Types</Title>
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }} justify="end">
				{/* Show Add button only if user has CREATE permission */}
				{user && hasAuthority("CREATE_IMAGE_REPORT_TYPE") && (
					<Col xs={24} sm={8} md={6} lg={4}>
						{" "}
						{/* Adjusted Col span */}
						{/* showModal already includes a permission check, but this prevents rendering the button */}
						<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)} block>
							Add New
						</Button>
					</Col>
				)}
			</Row>
			<div style={{ overflowX: "auto", margin: "0 -16px" }}>
				<Table
					columns={columns}
					// Show empty description if loading fails due to permissions or other errors
					dataSource={error ? [] : imageReportTypes}
					loading={loading}
					rowKey="id"
					pagination={false} // Using external pagination
					locale={{ emptyText: error ? "Failed to load data or insufficient permissions." : "No image report types found." }}
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
						}} // Reset to page 0 on size change
					/>
				</div>
			)}
			<Modal
				title={selectedImageReportType ? "Edit Image Report Type" : "Add Image Report Type"}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button
						key="submit"
						type="primary"
						onClick={() => form.submit()}
						// Disable button if user lacks permission for the current mode (Add vs Edit)
						disabled={isFormDisabled || loading} // Also disable when loading
						loading={loading && !isFormDisabled} // Show loading indicator only if not disabled by permission
					>
						{selectedImageReportType ? "Update" : "Save"}
					</Button>,
				]}
				width="70%">
				{/* Form submission is handled by handleFormSubmit which includes permission checks */}
				<Form form={form} layout="vertical" onFinish={handleFormSubmit}>
					{/* It's often better to disable inputs than the whole form for clarity */}
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Name" name="name" rules={[{ required: true, message: "Please input name!" }]}>
								{/* Disable input if user lacks permission for the current mode */}
								<Input disabled={isFormDisabled} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Price" name="price" rules={[{ required: true, message: "Please input price!" }]}>
								{/* Disable input if user lacks permission for the current mode */}
								<Input type="number" disabled={isFormDisabled} />
							</Form.Item>
						</Col>
					</Row>
					{/* No need for a hidden submit button, the footer button triggers form.submit() */}
				</Form>
			</Modal>
		</div>
	);
};

export default ImageReportTypeList;
