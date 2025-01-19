import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, Pagination, Select, InputNumber } from "antd";
import { useProductStore } from "../services/product.service";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const ProductList = () => {
	const { products, loading, total, searchProducts, deleteProduct, createProduct, updateProduct, setLoading } = useProductStore();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});

	useEffect(() => {
		fetchProducts();
	}, [page, size, searchParams]);

	const fetchProducts = async () => {
		setLoading(true);
		await searchProducts({ ...searchParams, page: page - 1, size });
		setLoading(false);
	};

	const showModal = (product) => {
		setSelectedProduct(product);
		if (product) {
			form.setFieldsValue(product);
		} else {
			form.resetFields();
		}
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedProduct(null);
		form.resetFields();
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			if (selectedProduct) {
				await updateProduct(selectedProduct.id, values);
			} else {
				await createProduct(values);
			}
			fetchProducts();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedProduct(null);
		} catch (error) {
			console.log("Error submitting form:", error);
		}
	};

	const handleDelete = async (productId) => {
		try {
			await deleteProduct(productId);
			fetchProducts();
		} catch (error) {
			console.error("Error deleting product:", error);
		}
	};

	const handleSearch = (value) => {
		setSearchParams({ searchTerm: value });
		setPage(1);
	};

	const handlePageChange = (newPage) => {
		setPage(newPage);
	};

	const handlePageSizeChange = (current, newSize) => {
		setPage(1);
		setSize(newSize);
	};

	const columns = [
		{
			title: "Code",
			dataIndex: "code",
			key: "code",
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
		},
		{
			title: "Type",
			dataIndex: "type",
			key: "type",
		},
		{
			title: "Pricing Model",
			dataIndex: "pricingModel",
			key: "pricingModel",
		},
		{
			title: "Unit Price",
			dataIndex: "unitPrice",
			key: "unitPrice",
			render: (text) => (text ? text.toFixed(2) : null),
		},
		{
			title: "Unit",
			dataIndex: "unit",
			key: "unit",
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
			<Title level={2}>Product List</Title>
			<Space style={{ marginBottom: 16 }}>
				<Input.Search placeholder="Search by code, name, description..." onSearch={handleSearch} style={{ width: 300 }} />
				<Button type="primary" onClick={() => showModal(null)}>
					Add New Product
				</Button>
			</Space>

			<Table columns={columns} dataSource={products} loading={loading} rowKey="id" pagination={false} />
			<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
				<Pagination
					current={page}
					pageSize={size}
					total={total}
					showSizeChanger
					onChange={handlePageChange}
					onShowSizeChange={handlePageSizeChange}
				/>
			</div>

			<Modal
				title={selectedProduct ? "Edit Product" : "Add Product"}
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleFormSubmit}>
						{selectedProduct ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical">
					<Form.Item label="Code" name="code" rules={[{ required: true, message: "Please input product code" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Name" name="name" rules={[{ required: true, message: "Please input product name" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Description" name="description">
						<Input.TextArea rows={4} />
					</Form.Item>
					<Form.Item label="Type" name="type" rules={[{ required: true, message: "Please select product type" }]}>
						<Select>
							<Option value="MEDICATION">Medication</Option>
							<Option value="DEVICE">Device</Option>
							<Option value="CONSUMABLE">Consumable</Option>
							<Option value="SERVICE">Service</Option>
						</Select>
					</Form.Item>
					<Form.Item label="Pricing Model" name="pricingModel" rules={[{ required: true, message: "Please select pricing model" }]}>
						<Select>
							<Option value="PER_UNIT">Per Unit</Option>
							<Option value="PER_TIME">Per Time</Option>
							<Option value="PER_USE">Per Use</Option>
							<Option value="FIXED">Fixed</Option>
						</Select>
					</Form.Item>
					<Form.Item label="Unit Price" name="unitPrice" rules={[{ required: true, message: "Please input unit price" }]}>
						<InputNumber
							style={{ width: "100%" }}
							formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
							parser={(value) => value.replace(/,*/g, "")}
						/>
					</Form.Item>
					<Form.Item label="Unit" name="unit">
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default ProductList;
