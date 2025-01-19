import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, notification, Pagination } from "antd";
import { useAuthStore } from "../services/auth.service";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useImageReportTypeStore } from "../services/imageReportType.service";

const { Title } = Typography;

const ImageReportTypeList = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedImageReportType, setSelectedImageReportType] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [total, setTotal] = useState(0);

	const { imageReportTypes, fetchImageReportTypes, createImageReportType, updateImageReportType, deleteImageReportType } =
		useImageReportTypeStore();

	const { user } = useAuthStore();

	useEffect(() => {
		fetchImageReportTypesData();
	}, [page, size]);

	const fetchImageReportTypesData = async () => {
		setLoading(true);
		try {
			await fetchImageReportTypes(page, size);
			setTotal(useImageReportTypeStore.getState().totalElements);
		} catch (error) {
			setError(error.message);
			notification.error({
				message: "Error",
				description: `Failed to fetch image report types: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const showModal = (imageReportType) => {
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
			fetchImageReportTypesData();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedImageReportType(null);
		} catch (apiError) {
			notification.error({
				message: "Error",
				description: `Failed to save image report type: ${apiError.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (imageReportTypeId) => {
		setLoading(true);
		try {
			await deleteImageReportType(imageReportTypeId);
			notification.success({
				message: "Success",
				description: "Image Report Type deleted successfully",
			});
			fetchImageReportTypesData();
		} catch (error) {
			console.error("Error deleting image report type:", error);
			notification.error({
				message: "Error",
				description: `Failed to delete image report type: ${error.message}`,
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
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
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
			<Title level={2}>Image Report Types</Title>
			<Space style={{ marginBottom: 16 }}>
				<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
					Add New Image Report Type
				</Button>
			</Space>
			<Table columns={columns} dataSource={imageReportTypes} loading={loading} rowKey="id" pagination={false} />
			{imageReportTypes && imageReportTypes.length > 0 && (
				<Pagination current={page + 1} pageSize={size} total={total} onChange={handleTableChange} style={{ marginTop: 16, float: "right" }} />
			)}
			<Modal
				title={selectedImageReportType ? "Edit Image Report Type" : "Add Image Report Type"}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={() => form.submit()}>
						{selectedImageReportType ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical" onFinish={handleFormSubmit}>
					<Form.Item label="Name" name="name" rules={[{ required: true, message: "Please input name!" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Price" name="price" rules={[{ required: true, message: "Please input price!" }]}>
						<Input type="number" />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default ImageReportTypeList;
