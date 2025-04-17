// src/components/ProductList.js
import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, Pagination, Select, InputNumber, Row, Col, Alert, Tooltip } from "antd";
import { useProductStore } from "../../services/product.service";
// Import useAuthStore
import { useAuthStore } from "../../services/auth.service"; // <-- Adjust path as needed
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

// Removed unused import 'color'
// import { color } from "framer-motion";

const { Title, Text } = Typography;
const { Option } = Select;

const ProductList = () => {
	const { products, loading, total, searchProducts, deleteProduct, createProduct, updateProduct, setLoading, increaseStock, decreaseStock } =
		useProductStore();
	// Get user and hasAuthority from auth store
	const { user, hasAuthority } = useAuthStore(); // <-- Use the hook

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
		// Assuming READ_PRODUCT is needed to even see the list.
		// If the user doesn't have READ_PRODUCT, searchProducts might fail
		// or return empty, which is handled by the backend/service.
		// No explicit frontend block needed here unless required by design.
		fetchProducts();
	}, [page, size, searchParams]); // Removed fetchProducts from dependency array, it causes infinite loops if defined inside.

	const fetchProducts = async () => {
		setLoading(true);
		try {
			await searchProducts({ ...searchParams, page: page - 1, size });
		} catch (error) {
			console.error("Error fetching products:", error);
			// Handle fetch error (e.g., show notification)
		} finally {
			setLoading(false);
		}
	};

	const showModal = (product) => {
		// Permission check is done on the button triggering this and the save button
		setSelectedProduct(product);
		if (product) {
			form.setFieldsValue(product);
			setPricingModel(product.pricingModel);
			if (product.pricingModel === "PER_TIME") {
				setTimeUnit(product.quantity);
				form.setFieldsValue({ unit: `${product.quantity} hours` }); // Set unit field
			} else {
				form.setFieldsValue({ unit: product.unit }); // Ensure unit is set correctly for non-time models
			}
		} else {
			form.resetFields();
			setPricingModel(null);
			setTimeUnit(null);
		}
		setIsModalVisible(true);
	};

	const showStockModal = (product, type) => {
		// Permission check is done on the button triggering this and the save button
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
		// Permissions checked via button's disabled state
		try {
			const values = await form.validateFields();
			if (values.pricingModel === "PER_TIME" && values.quantity) {
				values.unit = `${values.quantity} hours`; // Set unit based on quantity
			}
			setLoading(true); // Indicate loading during API call
			if (selectedProduct) {
				await updateProduct(selectedProduct.id, values);
			} else {
				await createProduct(values);
			}
			await fetchProducts(); // Refresh list
			setIsModalVisible(false);
			form.resetFields();
			setSelectedProduct(null);
			setPricingModel(null);
			setTimeUnit(null);
		} catch (error) {
			console.error("Error submitting form:", error);
			// Add user feedback (e.g., notification)
		} finally {
			setLoading(false);
		}
	};

	const handleStockChangeSubmit = async () => {
		// Permissions checked via button's disabled state
		try {
			setLoading(true);
			if (stockChangeType === "increase") {
				await increaseStock(selectedProduct.id, stockChangeQuantity);
			} else if (stockChangeType === "decrease") {
				await decreaseStock(selectedProduct.id, stockChangeQuantity);
			}
			await fetchProducts(); // Refresh list
			setIsStockModalVisible(false);
			setSelectedProduct(null);
			setStockChangeQuantity(0);
			setStockChangeType(null);
		} catch (error) {
			console.error("Error changing stock:", error);
			// Add user feedback (e.g., notification)
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (productId) => {
		// Permission check is done on the button triggering this
		Modal.confirm({
			title: "Are you sure you want to delete this product?",
			content: "This action cannot be undone.",
			okText: "Yes, Delete",
			okType: "danger",
			cancelText: "No",
			onOk: async () => {
				try {
					setLoading(true);
					await deleteProduct(productId);
					await fetchProducts(); // Refresh list after delete
				} catch (error) {
					console.error("Error deleting product:", error);
					// Add user feedback (e.g., notification)
				} finally {
					setLoading(false);
				}
			},
		});
	};

	const handleSearch = (value) => {
		// READ_PRODUCT check is implicit via backend on fetchProducts
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
		// Permission check done on the button triggering this
		setSelectedProduct(product);
		setIsHistoryModalVisible(true);
	};

	const handleHistoryModalClose = () => {
		setIsHistoryModalVisible(false);
		setSelectedProduct(null);
	};

	const showAllHistory = () => {
		// Permission check done on the button triggering this
		setIsAllHistoryVisible(true);
	};

	const handleAllHistoryClose = () => {
		setIsAllHistoryVisible(false);
	};

	const columns = [
		{ title: "Code", dataIndex: "code", key: "code" },
		{ title: "Name", dataIndex: "name", key: "name" },
		{ title: "Description", dataIndex: "description", key: "description" },
		{ title: "Type", dataIndex: "type", key: "type" },
		{ title: "Pricing Model", dataIndex: "pricingModel", key: "pricingModel" },
		{
			title: "Unit Price",
			dataIndex: "unitPrice",
			key: "unitPrice",
			render: (text) => (text ? text.toFixed(2) : "N/A"),
		},
		{ title: "Unit", dataIndex: "unit", key: "unit" },
		{ title: "Stock", dataIndex: "stock", key: "stock" },
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{/* Edit Button */}
					{user && hasAuthority("UPDATE_PRODUCT") && (
						<Tooltip title="Edit">
							<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)} />
						</Tooltip>
					)}
					{/* Increase Stock Button */}
					{user && hasAuthority("UPDATE_PRODUCT_STOCK") && (
						<Tooltip title="Increase Stock">
							<Button type="default" icon={<PlusOutlined />} onClick={() => showStockModal(record, "increase")} />
						</Tooltip>
					)}
					{/* Decrease Stock Button */}
					{user && hasAuthority("UPDATE_PRODUCT_STOCK") && (
						<Tooltip title="Decrease Stock">
							<Button type="default" icon={<MinusOutlined />} onClick={() => showStockModal(record, "decrease")} />
						</Tooltip>
					)}
					{/* History Button */}
					{user && hasAuthority("READ_PRODUCT_HISTORY") && (
						<Tooltip title="View History">
							<Button type="default" icon={<HistoryOutlined />} onClick={() => showHistoryModal(record)} />
						</Tooltip>
					)}
					{/* Delete Button */}
					{user && hasAuthority("DELETE_PRODUCT") && (
						<Tooltip title="Delete">
							{/* Removed inline style for color, use danger prop */}
							<Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
						</Tooltip>
					)}
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
			// Reset quantity field if model changes from PER_TIME
			form.setFieldsValue({ unit: "", quantity: undefined });
			setTimeUnit(null);
		}
	};

	const handleTimeUnitChange = (value) => {
		setTimeUnit(value);
		if (pricingModel === "PER_TIME") {
			form.setFieldsValue({ unit: `${value} hours` });
		}
	};

	const getPriceCalculationText = () => {
		// Use local state 'pricingModel' for immediate feedback, not form value
		const currentPricingModel = pricingModel;
		const unitPrice = form.getFieldValue("unitPrice");
		const quantity = form.getFieldValue("quantity"); // Or use local state 'timeUnit'

		if (!currentPricingModel || unitPrice === undefined || unitPrice === null) {
			return "Please select a pricing model and enter a unit price.";
		}

		switch (currentPricingModel) {
			case "PER_UNIT":
				return (
					<>
						Price = <Text strong>{unitPrice}</Text> per unit × quantity used.
					</>
				);
			case "PER_TIME":
				return (
					<>
						Price = <Text strong>{unitPrice}</Text> per <Text strong>{quantity || "[Time Unit]"} hours</Text>. Usage tracked in blocks of{" "}
						<Text strong>{quantity || "[Time Unit]"} hours</Text>.
					</>
				);
			case "PER_USE":
				return (
					<>
						Price = Fixed <Text strong>{unitPrice}</Text> per use, regardless of quantity/time.
					</>
				);
			case "FIXED":
				return (
					<>
						Price = Fixed <Text strong>{unitPrice}</Text>, regardless of quantity/time.
					</>
				);
			default:
				return "Please select a pricing model.";
		}
	};

	// Determine if the save button in the Add/Edit modal should be disabled
	const isSaveDisabled = !user || (selectedProduct ? !hasAuthority("UPDATE_PRODUCT") : !hasAuthority("CREATE_PRODUCT"));

	// Determine if the stock change button should be disabled
	const isStockChangeDisabled = !user || !hasAuthority("UPDATE_PRODUCT_STOCK");

	return (
		<div className="main-container" style={{ padding: 20 }}>
			<Title level={2}>Product Management</Title>

			<Row gutter={[16, 16]} style={{ marginBottom: 16 }} justify="space-between">
				<Col xs={24} sm={12} md={10}>
					{/* Search does not need explicit permission check here */}
					<Input.Search placeholder="Search by code, name, description..." onSearch={handleSearch} allowClear style={{ width: "100%" }} />
				</Col>
				<Col xs={24} sm={12} md={6}>
					<Space>
						{/* Add New Product Button */}
						{user && hasAuthority("CREATE_PRODUCT") && (
							<Button type="primary" icon={<PlusOutlined />} block onClick={() => showModal(null)}>
								Add Product
							</Button>
						)}
						{/* View All History Button */}
						{user && hasAuthority("READ_PRODUCT_HISTORY") && (
							<Tooltip title="View All Product History">
								<Button type="default" icon={<UnorderedListOutlined />} onClick={showAllHistory} />
							</Tooltip>
						)}
					</Space>
				</Col>
			</Row>

			<div style={{ overflowX: "auto" }}>
				<Table columns={columns} dataSource={products} loading={loading} rowKey="id" pagination={false} style={{ margin: "0 -16px" }} />{" "}
				{/* Adjust margin if needed */}
			</div>

			<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
				<Pagination
					current={page}
					pageSize={size}
					total={total}
					showSizeChanger
					onChange={handlePageChange}
					onShowSizeChange={handlePageSizeChange}
					pageSizeOptions={["10", "20", "50", "100"]}
				/>
			</div>

			{/* Add/Edit Product Modal */}
			<Modal
				title={selectedProduct ? "Edit Product" : "Add Product"}
				open={isModalVisible} // Use 'open' instead of 'visible' for newer AntD versions
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleFormSubmit} disabled={isSaveDisabled} loading={loading}>
						{selectedProduct ? "Update" : "Save"}
					</Button>,
				]}
				width="70%">
				<Form form={form} layout="vertical" initialValues={{ unitPrice: 0 }}>
					{/* Form content... (unchanged from original, but ensure required rules are correct) */}
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
								<Input.TextArea rows={3} />
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
								<Select onChange={handlePricingModelChange}>
									{/* Removed value={pricingModel}, Select handles its own state */}
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
										Unit Price  {/* Use   for spacing */}
										<Tooltip title="Price per unit, time, or use based on the pricing model.">
											<InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
										</Tooltip>
									</span>
								}
								name="unitPrice"
								rules={[
									{ required: true, message: "Please input unit price" },
									{ type: "number", min: 0, message: "Price cannot be negative" },
								]}>
								<InputNumber
									style={{ width: "100%" }}
									min={0}
									formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} // Consider locale-specific formatting if needed
									parser={(value) => value?.replace(/,*/g, "")}
								/>
							</Form.Item>
						</Col>

						{pricingModel === "PER_TIME" && (
							<Col xs={24} sm={12}>
								<Form.Item
									label={
										<span>
											Time Unit (hours) 
											<Tooltip title="The block of time used for Per Time pricing (e.g., 1 for per hour, 24 for per day)">
												<InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
											</Tooltip>
										</span>
									}
									name="quantity"
									rules={[
										{ required: pricingModel === "PER_TIME", message: "Please input time unit in hours" },
										{ type: "number", min: 1, message: "Time unit must be at least 1 hour" },
									]}>
									{/* Use InputNumber for time unit */}
									<InputNumber style={{ width: "100%" }} min={1} onChange={handleTimeUnitChange} />
								</Form.Item>
							</Col>
						)}
					</Row>

					<Row gutter={16}>
						{/* Unit field should probably only be visible/editable if not PER_TIME */}
						{pricingModel !== "PER_TIME" && (
							<Col xs={24} sm={12}>
								<Form.Item
									label={
										<span>
											Unit 
											<Tooltip title="The unit of measure (e.g., 'mg', 'tablet', 'each'). Not applicable for 'Per Time' model.">
												<InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
											</Tooltip>
										</span>
									}
									name="unit"
									rules={[{ required: pricingModel === "PER_UNIT", message: "Please specify the unit for 'Per Unit' pricing" }]}>
									<Input placeholder="e.g., mg, tablet, each" />
								</Form.Item>
							</Col>
						)}
						{/* Hide initial stock setting on edit? Or make it read-only? */}
						{/* It's usually managed via stock adjustments, not direct edit */}
						{!selectedProduct && ( // Only show initial stock on create
							<Col xs={24} sm={12}>
								<Form.Item
									label="Initial Stock"
									name="stock"
									rules={[
										{ required: true, message: "Please input initial stock quantity" },
										{ type: "number", min: 0, message: "Stock cannot be negative" },
									]}
									initialValue={0}>
									<InputNumber style={{ width: "100%" }} min={0} />
								</Form.Item>
							</Col>
						)}
					</Row>

					<Row gutter={16}>
						<Col xs={24} style={{ marginTop: 16 }}>
							<Alert message={<>{getPriceCalculationText()}</>} type="info" showIcon />
						</Col>
					</Row>
				</Form>
			</Modal>

			{/* Stock Change Modal */}
			<Modal
				title={`${stockChangeType === "increase" ? "Increase" : "Decrease"} Stock for ${selectedProduct?.name || "Product"}`}
				open={isStockModalVisible} // Use 'open'
				onCancel={handleStockModalCancel}
				footer={[
					<Button key="cancel" onClick={handleStockModalCancel}>
						Cancel
					</Button>,
					<Button
						key="submit"
						type="primary"
						onClick={handleStockChangeSubmit}
						disabled={isStockChangeDisabled || !stockChangeQuantity}
						loading={loading}>
						Confirm {stockChangeType === "increase" ? "Increase" : "Decrease"}
					</Button>,
				]}
				width="400px">
				<Form layout="vertical">
					<Form.Item
						label={`Quantity to ${stockChangeType}`}
						name="stockChangeQuantity" // Not really needed as we use local state
						rules={[
							{ required: true, message: "Please enter quantity" },
							{ type: "number", min: 1, message: "Quantity must be at least 1" },
						]}>
						<InputNumber
							value={stockChangeQuantity}
							onChange={(value) => setStockChangeQuantity(value ?? 0)} // Ensure value is not null
							min={1} // Should always be > 0 for change
							style={{ width: "100%" }}
						/>
					</Form.Item>
					{stockChangeType === "decrease" && selectedProduct && stockChangeQuantity > selectedProduct.stock && (
						<Alert message="Decrease quantity exceeds current stock." type="warning" showIcon />
					)}
				</Form>
			</Modal>

			{/* Product History Modals */}
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
