import React, { useState, useEffect } from "react";
import { Table, Button, Space, Typography, Modal, Form, Select, Input, AutoComplete, Pagination, InputNumber, Tooltip, Row, Col } from "antd";
import { usePatientProductUsageStore } from "../../services/patientProductUsage.service";
import { usePatientStore } from "../../services/patient.service";
import { useProductStore } from "../../services/product.service";
import { useAuthStore } from "../../services/auth.service";

import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

const { Title } = Typography;
const { Option } = Select;
dayjs.extend(utc);
dayjs.extend(relativeTime);

const PatientProductUsageList = () => {
	const { patientProductUsages, loading, total, searchPatientProductUsages, deletePatientProductUsage, createPatientProductUsage, setLoading } =
		usePatientProductUsageStore();
	const { searchPatients, getAllPatients } = usePatientStore();
	const { searchProducts, getProductById } = useProductStore();
	const { user } = useAuthStore();

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedUsage, setSelectedUsage] = useState(null);
	const [form] = Form.useForm();
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const [patientFilter, setPatientFilter] = useState(null);
	const [patientOptions, setPatientOptions] = useState([]);
	const [selectedPatient, setSelectedPatient] = useState(null);
	const [productOptions, setProductOptions] = useState([]);
	const [patients, setPatients] = useState([]);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [productSearchPage, setProductSearchPage] = useState(0);
	const [productSearchSize, setProductSearchSize] = useState(10);
	const [productSearchTerm, setProductSearchTerm] = useState("");
	const [totalProducts, setTotalProducts] = useState(0);
	const [tablePatientOptions, setTablePatientOptions] = useState([]);
	const [tableSelectedPatient, setTableSelectedPatient] = useState(null);
	const [processedUsages, setProcessedUsages] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [patientTableSearchTerm, setPatientTableSearchTerm] = useState("");
	const [calculatedPrice, setCalculatedPrice] = useState(0);
	const [quantity, setQuantity] = useState(null);
	const [startTime, setStartTime] = useState(null);
	const [endTime, setEndTime] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			await fetchProductUsages();
			const allPatients = await getAllPatients(user);
			setPatients(allPatients || []);
			setLoading(false);
		};
		fetchData();
	}, [currentPage, pageSize, searchParams, patientFilter, getAllPatients, user, setLoading]);

	useEffect(() => {
		const processData = async () => {
			if (patientProductUsages && patientProductUsages.length > 0) {
				const usagesWithProductInfo = await Promise.all(
					patientProductUsages.map(async (usage) => {
						try {
							const product = await getProductById(usage.productId);
							return {
								...usage,
								productName: product?.name || "N/A",
								productUnit: product?.unit || null,
								product,
							};
						} catch (error) {
							console.error("Error fetching product details:", error);
							return { ...usage, productName: "N/A", productUnit: null, product: null };
						}
					})
				);
				setProcessedUsages(usagesWithProductInfo);
			} else {
				setProcessedUsages([]);
			}
		};
		processData();
	}, [patientProductUsages, getProductById]);

	useEffect(() => {
		if (selectedProduct) {
			setCalculatedPrice(calculatePrice(selectedProduct, startTime ? dayjs(startTime) : null, endTime ? dayjs(endTime) : null, quantity));
		}
	}, [selectedProduct, startTime, endTime, quantity]);

	const fetchProductUsages = async () => {
		setLoading(true);
		await searchPatientProductUsages({
			...searchParams,
			page: currentPage - 1,
			size: pageSize,
			patientId: patientFilter,
		});
		setLoading(false);
	};

	const handlePageChange = (page, size) => {
		setCurrentPage(page);
		setPageSize(size);
	};

	const handlePatientSearch = async (value) => {
		setPatientSearchTerm(value);
		if (value) {
			try {
				const searchResults = await searchPatients({ searchTerm: value }, user);
				setPatientOptions(
					searchResults?.content?.map((patient) => ({
						label: `${patient.firstName} ${patient.lastName}`,
						value: patient.id,
						patient,
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

	const fetchProducts = async () => {
		try {
			const searchResults = await searchProducts({ searchTerm: productSearchTerm, page: productSearchPage, size: productSearchSize });
			setProductOptions(
				searchResults?.content?.map((product) => ({
					label: `${product.name}`,
					value: product.id,
					product,
				})) || []
			);
			setTotalProducts(searchResults?.totalElements);
		} catch (error) {
			console.error("Failed to search products:", error);
			setProductOptions([]);
		}
	};

	const handleProductSearch = async (value) => {
		setProductSearchTerm(value);
		setProductSearchPage(0);
		await fetchProducts();
	};

	const handleProductPageChange = async (page, size) => {
		setProductSearchPage(page - 1);
		setProductSearchSize(size);
		await fetchProducts();
	};

	const handlePatientSelect = (value, option) => {
		setSelectedPatient(option?.patient);
		form.setFieldsValue({ patientId: value });
	};

	const handleTablePatientSelect = (value, option) => {
		setTableSelectedPatient(option?.patient);
		setPatientFilter(value);
		setCurrentPage(1);
	};

	const handleProductSelect = (value, option) => {
		form.setFieldsValue({ productId: value });
		setSelectedProduct(option?.product);
		setQuantity(form.getFieldValue("quantity"));
	};

	const handleQuantityChange = (value) => {
		setQuantity(value);
	};

	const handleStartTimeChange = (event) => {
		setStartTime(event.target.value);
	};

	const handleEndTimeChange = (event) => {
		setEndTime(event.target.value);
	};

	const calculatePrice = (product, startTime, endTime, quantity) => {
		if (!product || !product.unitPrice) {
			return 0;
		}

		let price = 0;
		const unitPrice = product.unitPrice;

		if (product.pricingModel === "PER_UNIT") {
			if (quantity) price = unitPrice * quantity;
		} else if (product.pricingModel === "PER_TIME") {
			if (startTime && endTime) {
				const validStartTime = dayjs(startTime);
				const validEndTime = dayjs(endTime);

				if (!validStartTime.isValid() || !validEndTime.isValid()) {
					return 0;
				}
				const durationInMinutes = validEndTime.diff(validStartTime, "minute");
				const timeInHours = durationInMinutes / 60.0;

				if (timeInHours <= 0) return 0;

				const unitMatch = product.unit && product.unit.match(/(\d+)\s*hours?/);
				if (unitMatch) {
					const timeUnit = parseInt(unitMatch[1], 10);
					const timeUnitsUsed = Math.ceil(timeInHours / timeUnit);
					price = unitPrice * timeUnitsUsed;
				}
			}
		} else if (product.pricingModel === "PER_USE" || product.pricingModel === "FIXED") {
			price = unitPrice;
		}

		return price;
	};

	const showModal = (usage) => {
		setSelectedUsage(usage);
		setSelectedPatient(null);
		setSelectedProduct(null);
		setCalculatedPrice(0);
		setQuantity(null);
		setStartTime(null);
		setEndTime(null);

		if (usage) {
			form.setFieldsValue({
				...usage,
				startTime: usage.startTime ? dayjs(usage.startTime).format("YYYY-MM-DDTHH:mm") : null,
				endTime: usage.endTime ? dayjs(usage.endTime).format("YYYY-MM-DDTHH:mm") : null,
				quantity: usage.quantity || null,
			});
			setQuantity(usage.quantity || null);
			setStartTime(usage.startTime ? dayjs(usage.startTime).format("YYYY-MM-DDTHH:mm") : null);
			setEndTime(usage.endTime ? dayjs(usage.endTime).format("YYYY-MM-DDTHH:mm") : null);
			const patient = patients?.find((p) => p.id === usage.patientId);
			if (patient) {
				form.setFieldsValue({ patientId: patient.id });
				setSelectedPatient(patient);
			}
			if (usage.productId) {
				getProductById(usage.productId).then((product) => {
					setSelectedProduct(product);
				});
			}
		} else {
			form.resetFields();
			if (user) {
				form.setFieldsValue({ userId: user.id });
			}
		}
		setIsModalVisible(true);
		setPatientOptions([]);
		setProductOptions([]);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedUsage(null);
		setSelectedPatient(null);
		setSelectedProduct(null);
		form.resetFields();
		setPatientOptions([]);
		setProductOptions([]);
		setProductSearchPage(0);
		setProductSearchTerm("");
		setTotalProducts(0);
		setTableSelectedPatient(null);
		setTablePatientOptions([]);
		setPatientFilter(null);
		setPatientSearchTerm("");
		setPatientTableSearchTerm("");
		setCalculatedPrice(0);
		setQuantity(null);
		setStartTime(null);
		setEndTime(null);
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			const formattedValues = {
				...values,
				startTime: values.startTime ? dayjs(values.startTime).toISOString() : null,
				endTime: values.endTime ? dayjs(values.endTime).toISOString() : null,
			};
			if (selectedPatient) {
				formattedValues.patientId = selectedPatient.id;
			}
			if (selectedProduct?.pricingModel === "PER_USE" || selectedProduct?.pricingModel === "FIXED") {
				delete formattedValues.quantity;
			}
			if (selectedUsage) {
				//await updatePatientProductUsage(selectedUsage.id, values);
			} else {
				await createPatientProductUsage(formattedValues);
			}
			fetchProductUsages();

			setIsModalVisible(false);
			setSelectedUsage(null);
			form.resetFields();
			setSelectedPatient(null);
			setSelectedProduct(null);
			setPatientOptions([]);
			setProductOptions([]);
			setProductSearchPage(0);
			setProductSearchTerm("");
			setTotalProducts(0);
			setTableSelectedPatient(null);
			setTablePatientOptions([]);
			setPatientSearchTerm("");
			setPatientTableSearchTerm("");
			setCalculatedPrice(0);
			setQuantity(null);
			setStartTime(null);
			setEndTime(null);
		} catch (error) {
			console.log("error in handle form submit", error);
		}
	};

	const handleDelete = async (usageId) => {
		try {
			await deletePatientProductUsage(usageId);
			fetchProductUsages();
		} catch (error) {
			console.error("Error deleting usage:", error);
		}
	};

	const handleTablePatientSearch = async (value) => {
		setPatientTableSearchTerm(value);
		if (value) {
			try {
				const searchResults = await searchPatients({ searchTerm: value }, user);
				setTablePatientOptions(
					searchResults?.content?.map((patient) => ({
						label: `${patient.firstName} ${patient.lastName}`,
						value: patient.id,
						patient,
					})) || []
				);
			} catch (error) {
				console.error("Failed to search patients:", error);
				setTablePatientOptions([]);
			}
		} else {
			setTablePatientOptions([]);
		}
	};

	const getPatientName = (patientId) => {
		const patient = patients?.find((p) => p.id === patientId);
		return patient ? `${patient.firstName} ${patient.lastName}` : "N/A";
	};

	const renderTime = (time) => {
		if (!time) {
			return "N/A";
		}
		const localTime = dayjs(time);
		const relativeTime = localTime.fromNow();
		return (
			<Tooltip title={localTime.format("YYYY-MM-DD HH:mm:ss")}>
				<span>{relativeTime}</span>
			</Tooltip>
		);
	};

	const columns = [
		{
			title: "Patient",
			dataIndex: "patientId",
			key: "patientId",
			render: (patientId) => getPatientName(patientId),
		},
		{
			title: "Product",
			dataIndex: "productName",
			key: "productName",
		},
		{
			title: "Unit",
			dataIndex: "productUnit",
			key: "unit",
		},
		{
			title: "Start Time",
			dataIndex: "startTime",
			key: "startTime",
			render: (text) => renderTime(text),
		},
		{
			title: "End Time",
			dataIndex: "endTime",
			key: "endTime",
			render: (text) => renderTime(text),
		},
		{
			title: "Quantity",
			dataIndex: "quantity",
			key: "quantity",
			render: (quantity, record) => (record.product?.pricingModel !== "PER_TIME" ? quantity : "N/A"),
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			render: (price) => `${price ? price.toFixed(2) : "0.00"} Pounds`,
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
						Delete
					</Button>
				</Space>
			),
		},
	];

	return (
		<div className="main-container" style={{ padding: 20 }}>
			<Title level={2}>Patient Product Usage List</Title>

			{/* Responsive Search and Add Button */}
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={18}>
					<AutoComplete
						options={tablePatientOptions}
						onSearch={handleTablePatientSearch}
						onSelect={handleTablePatientSelect}
						placeholder="Search for a patient"
						filterOption={false}
						allowClear
						value={patientTableSearchTerm}
						style={{ width: "100%" }}
					/>
				</Col>
				<Col xs={24} sm={6}>
					<Button type="primary" block onClick={() => showModal(null)}>
						Add New Usage
					</Button>
				</Col>
			</Row>

			{/* Scrollable Table */}
			<div style={{ overflowX: "auto", margin: "0 -16px" }}>
				<Table
					columns={columns}
					dataSource={processedUsages.map((usage) => ({
						...usage,
						price: usage.price,
					}))}
					loading={loading}
					rowKey="id"
					pagination={false}
				/>
			</div>

			{/* Responsive Pagination */}
			<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
				<Pagination current={currentPage} pageSize={pageSize} total={total} showSizeChanger onChange={handlePageChange} />
			</div>

			{/* Responsive Modal */}
			<Modal
				title={selectedUsage ? "Edit Product Usage" : "Add Product Usage"}
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleFormSubmit}>
						{selectedUsage ? "Update" : "Save"}
					</Button>,
				]}
				width="70%">
				<Form form={form} layout="vertical">
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
								<AutoComplete
									options={patientOptions}
									onSearch={handlePatientSearch}
									onSelect={handlePatientSelect}
									placeholder="Search for a patient"
									filterOption={false}
									value={patientSearchTerm}
								/>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Product" name="productId" rules={[{ required: true, message: "Please select a product" }]}>
								<AutoComplete
									options={productOptions}
									onSearch={handleProductSearch}
									onSelect={handleProductSelect}
									placeholder="Search for a product"
									filterOption={false}
								/>
							</Form.Item>
						</Col>
					</Row>

					{selectedProduct?.pricingModel !== "PER_USE" &&
						selectedProduct?.pricingModel !== "FIXED" &&
						selectedProduct?.pricingModel !== "PER_TIME" && (
							<Row gutter={16}>
								<Col xs={24}>
									<Form.Item
										label={`Quantity (${selectedProduct?.unit || "Unit"})`}
										name="quantity"
										rules={[{ required: true, message: "Please input quantity" }]}>
										<InputNumber min={0} onChange={handleQuantityChange} value={quantity} style={{ width: "100%" }} />
									</Form.Item>
								</Col>
							</Row>
						)}

					{selectedProduct?.pricingModel === "PER_TIME" && (
						<Row gutter={16}>
							<Col xs={24} sm={12}>
								<Form.Item label="Start Time" name="startTime">
									<Input type="datetime-local" onChange={handleStartTimeChange} value={startTime} style={{ width: "100%" }} />
								</Form.Item>
							</Col>
							<Col xs={24} sm={12}>
								<Form.Item label="End Time" name="endTime">
									<Input type="datetime-local" onChange={handleEndTimeChange} value={endTime} style={{ width: "100%" }} />
								</Form.Item>
							</Col>
						</Row>
					)}

					<Row gutter={16}>
						<Col xs={24}>
							<Form.Item label="Calculated Price">
								<Input disabled value={`${calculatedPrice ? calculatedPrice.toFixed(2) : 0} Pounds`} style={{ width: "100%" }} />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default PatientProductUsageList;
