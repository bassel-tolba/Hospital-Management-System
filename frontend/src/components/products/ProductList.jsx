// src/components/ProductList.js
import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, Pagination, Select, InputNumber, Row, Col, Alert, Tooltip } from "antd";
import { useProductStore } from "../../services/product.service";
import {
	SearchOutlined,
	EditOutlined,
	DeleteOutlined,
	PlusOutlined,
	MinusOutlined,
	InfoCircleOutlined,
	HistoryOutlined,
	UnorderedListOutlined,
} from "@ant-design/icons";
import ProductHistory from "./ProductHistory";
import AllProductHistory from "./AllProductHistory";

import { color } from "framer-motion";

const { Title, Text } = Typography;
const { Option } = Select;

const ProductList = () => {
	const { products, loading, total, searchProducts, deleteProduct, createProduct, updateProduct, setLoading, increaseStock, decreaseStock } =
		useProductStore();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isStockModalVisible, setIsStockModalVisible] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const [pricingModel, setPricingModel] = useState(null);
	const [timeUnit, setTimeUnit] = useState(null);
	const [stockChangeType, setStockChangeType] = useState(null);
	const [stockChangeQuantity, setStockChangeQuantity] = useState(0);
	const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
	const [isAllHistoryVisible, setIsAllHistoryVisible] = useState(false);

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
			setPricingModel(product.pricingModel);
			if (product.pricingModel === "PER_TIME") {
				setTimeUnit(product.quantity);
				form.setFieldsValue({ unit: `${product.quantity} hours` }); // Set unit field
			}
		} else {
			form.resetFields();
			setPricingModel(null);
			setTimeUnit(null);
		}
		setIsModalVisible(true);
	};

	const showStockModal = (product, type) => {
		setSelectedProduct(product);
		setStockChangeType(type);
		setStockChangeQuantity(0);
		setIsStockModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedProduct(null);
		form.resetFields();
		setPricingModel(null);
		setTimeUnit(null);
	};

	const handleStockModalCancel = () => {
		setIsStockModalVisible(false);
		setSelectedProduct(null);
		setStockChangeQuantity(0);
		setStockChangeType(null);
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			if (values.pricingModel === "PER_TIME" && values.quantity) {
				values.unit = `${values.quantity} hours`; // Set unit based on quantity
			}
			if (selectedProduct) {
				await updateProduct(selectedProduct.id, values);
			} else {
				await createProduct(values);
			}
			fetchProducts();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedProduct(null);
			setPricingModel(null);
			setTimeUnit(null);
		} catch (error) {
			console.log("Error submitting form:", error);
		}
	};

	const handleStockChangeSubmit = async () => {
		try {
			if (stockChangeType === "increase") {
				await increaseStock(selectedProduct.id, stockChangeQuantity);
			} else if (stockChangeType === "decrease") {
				await decreaseStock(selectedProduct.id, stockChangeQuantity);
			}
			fetchProducts();
			setIsStockModalVisible(false);
			setSelectedProduct(null);
			setStockChangeQuantity(0);
			setStockChangeType(null);
		} catch (error) {
			console.error("Error changing stock:", error);
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

	const showHistoryModal = (product) => {
		setSelectedProduct(product);
		setIsHistoryModalVisible(true);
	};

	const handleHistoryModalClose = () => {
		setIsHistoryModalVisible(false);
		setSelectedProduct(null);
	};

	const showAllHistory = () => {
		setIsAllHistoryVisible(true);
	};

	const handleAllHistoryClose = () => {
		setIsAllHistoryVisible(false);
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
			title: "Stock",
			dataIndex: "stock",
			key: "stock",
		},
		{
			title: "Actions",
			key: "actions",

			render: (text, record) => (
				<Space size="middle">
					<Tooltip title="Edit">
						<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)} />
					</Tooltip>
					<Tooltip title="Increase Stock">
						<Button type="default" icon={<PlusOutlined />} onClick={() => showStockModal(record, "increase")} />
					</Tooltip>
					<Tooltip title="Decrease Stock">
						<Button type="default" icon={<MinusOutlined />} onClick={() => showStockModal(record, "decrease")} />
					</Tooltip>
					<Tooltip title="History">
						<Button type="default" icon={<HistoryOutlined />} onClick={() => showHistoryModal(record)} />
					</Tooltip>
					<Tooltip title="Delete">
						<Button type="primary" danger styles={color} icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
					</Tooltip>
				</Space>
			),
		},
	];

	const handlePricingModelChange = (value) => {
		setPricingModel(value);
		if (value === "PER_TIME") {
			if (timeUnit) {
				form.setFieldsValue({ unit: `${timeUnit} hours` });
			} else {
				form.setFieldsValue({ unit: "" }); // Clear if timeUnit is not set
			}
		} else {
			form.setFieldsValue({ unit: "" }); // Clear unit for other pricing models
		}
	};

	const handleTimeUnitChange = (value) => {
		setTimeUnit(value);
		if (pricingModel === "PER_TIME") {
			form.setFieldsValue({ unit: `${value} hours` });
		}
	};

	const getPriceCalculationText = () => {
		const currentPricingModel = form.getFieldValue("pricingModel");
		const unitPrice = form.getFieldValue("unitPrice");
		const unit = form.getFieldValue("unit");
		const quantity = form.getFieldValue("quantity");

		if (!currentPricingModel || !unitPrice) {
			return "Please select a pricing model and enter a unit price.";
		}

		switch (currentPricingModel) {
			case "PER_UNIT":
				return (
					<>
						The price will be calculated as
						<Text strong> {unitPrice} </Text>
						per unit multiplied by the quantity used.
					</>
				);
			case "PER_TIME":
				return (
					<>
						The price will be calculated as
						<Text strong> {unitPrice} </Text>
						per
						<Text strong> {quantity || "time unit"} hours</Text>. The system counts each
						<Text strong> {quantity || "time unit"} hours</Text>
						used and calculates the price.
					</>
				);
			case "PER_USE":
				return (
					<>
						The price is a fixed
						<Text strong> {unitPrice} </Text>
						per use, regardless of the quantity.
					</>
				);
			case "FIXED":
				return (
					<>
						The price is a fixed
						<Text strong> {unitPrice} </Text>, regardless of the quantity or time.
					</>
				);
			default:
				return "Please select a pricing model.";
		}
	};

	return (
		<div className="main-container" style={{ padding: 20 }}>
			<Title level={2}>Product List</Title>

			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={18}>
					<Input.Search placeholder="Search by code, name, description..." onSearch={handleSearch} style={{ width: "100%" }} />
				</Col>
				<Col xs={24} sm={6}>
					<Button type="primary" block onClick={() => showModal(null)}>
						Add New Product
					</Button>
				</Col>
			</Row>
			<Row justify="end" style={{ marginBottom: 16 }}>
				<Button type="default" icon={<UnorderedListOutlined />} onClick={showAllHistory}>
					View All History
				</Button>
			</Row>

			<div style={{ overflowX: "auto", margin: "0 -16px" }}>
				<Table columns={columns} dataSource={products} loading={loading} rowKey="id" pagination={false} />
			</div>

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
				]}
				width="70%">
				<Form form={form} layout="vertical">
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Code" name="code" rules={[{ required: true, message: "Please input product code" }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Name" name="name" rules={[{ required: true, message: "Please input product name" }]}>
								<Input />
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24}>
							<Form.Item label="Description" name="description">
								<Input.TextArea rows={4} />
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Type" name="type" rules={[{ required: true, message: "Please select product type" }]}>
								<Select>
									<Option value="MEDICATION">Medication</Option>
									<Option value="DEVICE">Device</Option>
									<Option value="CONSUMABLE">Consumable</Option>
									<Option value="SERVICE">Service</Option>
									<Option value="APPOINTMENT">Appointment</Option>
								</Select>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Pricing Model" name="pricingModel" rules={[{ required: true, message: "Please select pricing model" }]}>
								<Select onChange={handlePricingModelChange} value={pricingModel}>
									<Option value="PER_UNIT">Per Unit</Option>
									<Option value="PER_TIME">Per Time</Option>
									<Option value="PER_USE">Per Use</Option>
									<Option value="FIXED">Fixed</Option>
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item
								label={
									<span>
										Unit Price 
										<Tooltip title="This is the price per unit, time, or use depending on the pricing model">
											<InfoCircleOutlined />
										</Tooltip>
									</span>
								}
								name="unitPrice"
								rules={[{ required: true, message: "Please input unit price" }]}>
								<InputNumber
									style={{ width: "100%" }}
									formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
									parser={(value) => value.replace(/,*/g, "")}
								/>
							</Form.Item>
						</Col>

						{pricingModel === "PER_TIME" && (
							<Col xs={24} sm={12}>
								<Form.Item
									label="Time Unit (hours)"
									name="quantity"
									rules={[{ required: pricingModel === "PER_TIME", message: "Please input time unit" }]}>
									<InputNumber style={{ width: "100%" }} onChange={handleTimeUnitChange} value={timeUnit} />
								</Form.Item>
							</Col>
						)}
					</Row>

					<Row gutter={16}>
						<Col xs={24}>
							<Form.Item label="Unit" name="unit">
								<Input disabled={pricingModel === "PER_TIME"} />
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24}>
							<Alert message={<>{getPriceCalculationText()}</>} type="info" showIcon />
						</Col>
					</Row>
				</Form>
			</Modal>

			<Modal
				title={`Change Stock`}
				visible={isStockModalVisible}
				onCancel={handleStockModalCancel}
				footer={[
					<Button key="cancel" onClick={handleStockModalCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleStockChangeSubmit}>
						{stockChangeType === "increase" ? "Increase" : "Decrease"}
					</Button>,
				]}
				width="70%">
				<Form layout="vertical">
					<Row gutter={16}>
						<Col xs={24}>
							<Form.Item label={`Select Quantity to ${stockChangeType}`} name="stockChangeQuantity">
								<InputNumber
									type="number"
									value={stockChangeQuantity}
									onChange={(value) => setStockChangeQuantity(value)}
									min={0}
									style={{ width: "100%" }}
								/>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
			<ProductHistory
				productId={selectedProduct?.id}
				productName={selectedProduct?.name}
				visible={isHistoryModalVisible}
				onClose={handleHistoryModalClose}
			/>
			<AllProductHistory visible={isAllHistoryVisible} onClose={handleAllHistoryClose} />
		</div>
	);
};

export default ProductList;
