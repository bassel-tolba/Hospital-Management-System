import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import { Table, Button, Space, Typography, Modal, Form, Select, Input, AutoComplete, Pagination, InputNumber, Tooltip, Row, Col } from "antd";
import { usePatientProductUsageStore } from "../../services/patientProductUsage.service";
import { usePatientStore } from "../../services/patient.service";
import { useProductStore } from "../../services/product.service";
import { useAuthStore } from "../../services/auth.service"; // Corrected path assumption if needed

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
	// Use the hook to get user and hasAuthority function
	const { user, hasAuthority } = useAuthStore();

	// --- State declarations remain the same ---
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

	// --- Permissions checks ---
	const canReadUsage = useMemo(() => user && hasAuthority("READ_PATIENT_PRODUCT_USAGE"), [user, hasAuthority]);
	const canCreateUsage = useMemo(() => user && hasAuthority("CREATE_PATIENT_PRODUCT_USAGE"), [user, hasAuthority]);
	const canDeleteUsage = useMemo(() => user && hasAuthority("DELETE_PATIENT_PRODUCT_USAGE"), [user, hasAuthority]);
	const canReadPatient = useMemo(() => user && hasAuthority("READ_PATIENT"), [user, hasAuthority]);
	const canReadProduct = useMemo(() => user && hasAuthority("READ_PRODUCT"), [user, hasAuthority]);

	useEffect(() => {
		const fetchData = async () => {
			if (!canReadUsage) return; // Don't fetch if no read permission for usage

			setLoading(true);
			await fetchProductUsages();

			// Fetch patients only if user has permission to read them
			if (canReadPatient) {
				const allPatientsData = await getAllPatients(user); // Assuming getAllPatients doesn't need user passed in service layer
				setPatients(allPatientsData || []);
			} else {
				setPatients([]); // Ensure patients is empty if no permission
			}
			setLoading(false);
		};
		fetchData();
		// Add permission flags to dependency array
	}, [currentPage, pageSize, searchParams, patientFilter, getAllPatients, user, setLoading, canReadUsage, canReadPatient]);

	useEffect(() => {
		const processData = async () => {
			if (!canReadProduct || !patientProductUsages || patientProductUsages.length === 0) {
				setProcessedUsages(patientProductUsages || []); // Pass through usages if no product read permission
				return;
			}

			// Process product details only if user can read products
			const usagesWithProductInfo = await Promise.all(
				patientProductUsages.map(async (usage) => {
					try {
						const product = await getProductById(usage.productId);
						return {
							...usage,
							productName: product?.name || "N/A (No Permission or Error)",
							productUnit: product?.unit || null,
							product,
						};
					} catch (error) {
						console.error("Error fetching product details:", error);
						return { ...usage, productName: "N/A (Error)", productUnit: null, product: null };
					}
				})
			);
			setProcessedUsages(usagesWithProductInfo);
		};

		processData();
		// Add permission flag to dependency array
	}, [patientProductUsages, getProductById, canReadProduct]);

	useEffect(() => {
		if (selectedProduct) {
			setCalculatedPrice(calculatePrice(selectedProduct, startTime ? dayjs(startTime) : null, endTime ? dayjs(endTime) : null, quantity));
		} else {
			setCalculatedPrice(0); // Reset if no product selected
		}
	}, [selectedProduct, startTime, endTime, quantity]);

	const fetchProductUsages = async () => {
		// This check is already handled by the outer useEffect
		// if (!canReadUsage) return;
		setLoading(true);
		await searchPatientProductUsages({
			...searchParams,
			page: currentPage - 1,
			size: pageSize,
			patientId: patientFilter,
		});
		setLoading(false);
	};

	// --- Helper Functions (handlePageChange, handlePatientSearch, etc.) remain largely the same ---
	// Note: searchPatients only needs authenticated(), product search needs READ_PRODUCT
	// These searches happen within contexts (table filter, modal) that are already permission-controlled.

	const handlePageChange = (page, size) => {
		setCurrentPage(page);
		setPageSize(size);
	};

	const handlePatientSearch = async (value) => {
		setPatientSearchTerm(value);
		if (value) {
			try {
				// searchPatients requires authenticated() which is implicit if user is logged in
				const searchResults = await searchPatients({ searchTerm: value }, user); // Assuming service handles auth check
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
		// Only fetch if user can read products
		if (!canReadProduct) {
			setProductOptions([]);
			setTotalProducts(0);
			return;
		}
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
		await fetchProducts(); // fetchProducts now includes permission check
	};

	const handleProductPageChange = async (page, size) => {
		setProductSearchPage(page - 1);
		setProductSearchSize(size);
		await fetchProducts(); // fetchProducts now includes permission check
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
		// Calculation logic remains the same
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
				if (!validStartTime.isValid() || !validEndTime.isValid()) return 0;
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

	const showModal = async (usage) => {
		// Made async to handle potential product fetch
		setSelectedUsage(usage);
		setSelectedPatient(null);
		setSelectedProduct(null);
		setCalculatedPrice(0);
		setQuantity(null);
		setStartTime(null);
		setEndTime(null);
		setPatientOptions([]); // Clear previous options
		setProductOptions([]); // Clear previous options

		if (usage) {
			// Pre-fill logic (no specific permission needed here, depends on parent component visibility)
			form.setFieldsValue({
				...usage,
				startTime: usage.startTime ? dayjs(usage.startTime).format("YYYY-MM-DDTHH:mm") : null,
				endTime: usage.endTime ? dayjs(usage.endTime).format("YYYY-MM-DDTHH:mm") : null,
				quantity: usage.quantity || null,
			});
			setQuantity(usage.quantity || null);
			setStartTime(usage.startTime ? dayjs(usage.startTime).format("YYYY-MM-DDTHH:mm") : null);
			setEndTime(usage.endTime ? dayjs(usage.endTime).format("YYYY-MM-DDTHH:mm") : null);

			// Pre-select patient if available and user can read patients
			if (canReadPatient) {
				const patient = patients?.find((p) => p.id === usage.patientId);
				if (patient) {
					form.setFieldsValue({ patientId: patient.id }); // Set field value for display
					setSelectedPatient(patient);
					setPatientOptions([{ label: `${patient.firstName} ${patient.lastName}`, value: patient.id, patient }]); // Set initial option for display
				}
			}

			// Pre-select product if available and user can read products
			if (canReadProduct && usage.productId) {
				try {
					const product = await getProductById(usage.productId);
					if (product) {
						form.setFieldsValue({ productId: product.id }); // Set field value for display
						setSelectedProduct(product);
						setProductOptions([{ label: product.name, value: product.id, product }]); // Set initial option for display
					}
				} catch (error) {
					console.error("Failed to pre-fetch product for modal:", error);
				}
			}
		} else {
			form.resetFields();
			if (user) {
				form.setFieldsValue({ userId: user.id }); // Assuming userId is implicitly set by backend or not needed in form
			}
		}
		setIsModalVisible(true);
		// Initial searches for modal dropdowns if needed (handled by onSearch)
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
		// Keep table filter state
		// setTableSelectedPatient(null);
		// setTablePatientOptions([]);
		// setPatientFilter(null);
		setPatientSearchTerm("");
		// setPatientTableSearchTerm(""); // Keep table search term
		setCalculatedPrice(0);
		setQuantity(null);
		setStartTime(null);
		setEndTime(null);
	};

	const handleFormSubmit = async () => {
		// Permission check already handled by hiding the 'Add New Usage' button
		// No 'Update' functionality defined/enabled yet.
		if (!canCreateUsage && !selectedUsage) {
			console.error("User does not have permission to create product usage.");
			// Optionally show a message to the user
			return;
		}
		// If update was enabled, would need check: if (selectedUsage && !canUpdateUsage) return;

		try {
			const values = await form.validateFields();
			const formattedValues = {
				...values,
				startTime: values.startTime ? dayjs(values.startTime).toISOString() : null,
				endTime: values.endTime ? dayjs(values.endTime).toISOString() : null,
			};
			// Ensure patientId is set correctly from state if using AutoComplete selection logic
			if (selectedPatient) {
				formattedValues.patientId = selectedPatient.id;
			} else if (!values.patientId && !selectedUsage?.patientId) {
				// Handle case where patient wasn't selected properly if required
				console.error("Patient ID is missing");
				// Maybe trigger form validation message again if needed
				return;
			} else if (!values.patientId && selectedUsage?.patientId) {
				formattedValues.patientId = selectedUsage.patientId; // Keep existing patient if not changed
			}

			// Ensure productId is set correctly
			if (selectedProduct) {
				formattedValues.productId = selectedProduct.id;
			} else if (!values.productId && !selectedUsage?.productId) {
				console.error("Product ID is missing");
				return;
			} else if (!values.productId && selectedUsage?.productId) {
				formattedValues.productId = selectedUsage.productId; // Keep existing product if not changed
			}

			if (selectedProduct?.pricingModel === "PER_USE" || selectedProduct?.pricingModel === "FIXED") {
				delete formattedValues.quantity;
			}

			if (selectedUsage) {
				// Update logic would go here, currently commented out in original code
				// await updatePatientProductUsage(selectedUsage.id, formattedValues);
				console.warn("Update functionality is not implemented.");
			} else {
				await createPatientProductUsage(formattedValues);
			}

			fetchProductUsages(); // Re-fetch the list

			// Reset state after successful submission
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
			setPatientSearchTerm("");
			setCalculatedPrice(0);
			setQuantity(null);
			setStartTime(null);
			setEndTime(null);
		} catch (error) {
			console.log("Error in handle form submit:", error);
			// Handle validation errors or API errors appropriately
		}
	};

	const handleDelete = async (usageId) => {
		// Permission check already handled by hiding the button
		// if (!canDeleteUsage) return;
		try {
			await deletePatientProductUsage(usageId);
			fetchProductUsages(); // Re-fetch after delete
		} catch (error) {
			console.error("Error deleting usage:", error);
			// Add user feedback (e.g., notification)
		}
	};

	const handleTablePatientSearch = async (value) => {
		setPatientTableSearchTerm(value);
		if (value) {
			try {
				// searchPatients needs authenticated()
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
			// Optionally clear filter when search is cleared
			// setPatientFilter(null);
			// setCurrentPage(1);
		}
	};

	const getPatientName = (patientId) => {
		// This function now relies on the `patients` state, which is populated
		// only if the user has READ_PATIENT permission.
		if (!canReadPatient) return "N/A (No Permission)";
		const patient = patients?.find((p) => p.id === patientId);
		return patient ? `${patient.firstName} ${patient.lastName}` : "N/A";
	};

	const renderTime = (time) => {
		if (!time) return "N/A";
		const localTime = dayjs(time);
		if (!localTime.isValid()) return "Invalid Date";
		const relativeTime = localTime.fromNow();
		return (
			<Tooltip title={localTime.format("YYYY-MM-DD HH:mm:ss")}>
				<span>{relativeTime}</span>
			</Tooltip>
		);
	};

	// Define columns dynamically based on permissions
	const columns = useMemo(() => {
		const baseColumns = [
			// Conditionally include Patient column
			...(canReadPatient
				? [
						{
							title: "Patient",
							dataIndex: "patientId",
							key: "patientId",
							render: (patientId) => getPatientName(patientId), // getPatientName handles permission internally now
						},
				  ]
				: []),
			// Conditionally include Product columns
			...(canReadProduct
				? [
						{
							title: "Product",
							dataIndex: "productName", // This comes from processedUsages
							key: "productName",
							render: (text) => text || "N/A",
						},
						{
							title: "Unit",
							dataIndex: "productUnit", // This comes from processedUsages
							key: "unit",
							render: (text) => text || "N/A",
						},
				  ]
				: []),
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
				// Render quantity only if product details are available (implies canReadProduct) and pricing model is not PER_TIME
				render: (quantity, record) => (record.product?.pricingModel !== "PER_TIME" && canReadProduct ? quantity ?? "N/A" : "N/A"),
			},
			{
				title: "Price",
				dataIndex: "price",
				key: "price",
				render: (price) => `${price != null ? price.toFixed(2) : "0.00"} Pounds`, // Ensure price exists
			},
			// Conditionally include Actions column if delete is possible
			...(canDeleteUsage
				? [
						{
							title: "Actions",
							key: "actions",
							render: (text, record) => (
								<Space size="middle">
									{/* Delete button is only rendered if canDeleteUsage is true */}
									<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
										Delete
									</Button>
								</Space>
							),
						},
				  ]
				: []),
		];
		return baseColumns.filter(Boolean); // Filter out any potentially null/undefined entries if logic changes
	}, [canReadPatient, canReadProduct, canDeleteUsage, patients]); // Add patients to dependency array for getPatientName re-render

	// --- Render Logic ---

	// Show loading or unauthorized message if data cannot be read
	if (loading && !processedUsages.length) {
		// Show loading indicator only if initial loading is happening
		return <div>Loading...</div>;
	}

	if (!user) {
		return <div>Please log in to view this page.</div>;
	}

	if (!canReadUsage) {
		return <div>You do not have permission to view patient product usage.</div>;
	}

	// Render the main component content only if user has base read permission
	return (
		<div className="main-container" style={{ padding: 20 }}>
			<Title level={2}>Patient Product Usage List</Title>

			{/* Responsive Search and Add Button */}
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={canCreateUsage ? 18 : 24}>
					{" "}
					{/* Adjust width if Add button is hidden */}
					<AutoComplete
						options={tablePatientOptions}
						onSearch={handleTablePatientSearch}
						onSelect={handleTablePatientSelect}
						placeholder="Filter by patient..."
						filterOption={false}
						allowClear
						onClear={() => {
							setPatientFilter(null);
							setTablePatientOptions([]);
							setPatientTableSearchTerm("");
							setCurrentPage(1);
						}}
						value={patientTableSearchTerm}
						style={{ width: "100%" }}
						disabled={!canReadPatient} // Disable filter if user cannot read patients
					/>
				</Col>
				{/* Conditionally render the Add button */}
				{canCreateUsage && (
					<Col xs={24} sm={6}>
						<Button type="primary" block onClick={() => showModal(null)}>
							Add New Usage
						</Button>
					</Col>
				)}
			</Row>

			{/* Scrollable Table */}
			<div style={{ overflowX: "auto", margin: "0 -16px" }}>
				<Table
					columns={columns} // Use dynamically generated columns
					dataSource={processedUsages.map((usage) => ({
						...usage,
						key: usage.id, // Ensure unique key for rows
						// Price calculation happens within processData or relies on backend now
					}))}
					loading={loading}
					rowKey="id"
					pagination={false} // Use external pagination component
				/>
			</div>

			{/* Responsive Pagination */}
			<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
				<Pagination current={currentPage} pageSize={pageSize} total={total} showSizeChanger onChange={handlePageChange} />
			</div>

			{/* Responsive Modal */}
			{/* Modal rendering is controlled by isModalVisible, which is only set true via showModal.
			   showModal is triggered by the 'Add New Usage' button (permission controlled)
			   or potentially an 'Edit' button (if added later). */}
			<Modal
				title={selectedUsage ? "Edit Product Usage" : "Add Product Usage"}
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					// Save/Update button text depends on selectedUsage, but action primarily for create now
					<Button key="submit" type="primary" onClick={handleFormSubmit} loading={loading}>
						{selectedUsage ? "Update" : "Save"}
					</Button>,
				]}
				width="70%">
				<Form form={form} layout="vertical">
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							{/* Patient search requires authenticated() - implicitly checked by user being logged in */}
							<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
								<AutoComplete
									options={patientOptions}
									onSearch={handlePatientSearch}
									onSelect={handlePatientSelect}
									placeholder="Search for a patient"
									filterOption={false}
									value={patientSearchTerm} // Controlled component value if needed
									disabled={!canReadPatient} // Disable if user cannot read patients for selection
								/>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							{/* Product search requires READ_PRODUCT */}
							<Form.Item label="Product" name="productId" rules={[{ required: true, message: "Please select a product" }]}>
								<AutoComplete
									options={productOptions}
									onSearch={handleProductSearch}
									onSelect={handleProductSelect}
									placeholder="Search for a product"
									filterOption={false}
									disabled={!canReadProduct} // Disable if user cannot read products
								/>
								{/* Optional: Add pagination for product search results if needed */}
							</Form.Item>
						</Col>
					</Row>

					{/* Conditional Fields based on selected Product (requires canReadProduct) */}
					{canReadProduct &&
						selectedProduct?.pricingModel !== "PER_USE" &&
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

					{canReadProduct && selectedProduct?.pricingModel === "PER_TIME" && (
						<Row gutter={16}>
							<Col xs={24} sm={12}>
								<Form.Item
									label="Start Time"
									name="startTime"
									rules={[{ required: true, message: "Start time is required for timed products" }]}>
									<Input type="datetime-local" onChange={handleStartTimeChange} value={startTime} style={{ width: "100%" }} />
								</Form.Item>
							</Col>
							<Col xs={24} sm={12}>
								<Form.Item
									label="End Time"
									name="endTime"
									rules={[{ required: true, message: "End time is required for timed products" }]}>
									<Input type="datetime-local" onChange={handleEndTimeChange} value={endTime} style={{ width: "100%" }} />
								</Form.Item>
							</Col>
						</Row>
					)}

					<Row gutter={16}>
						<Col xs={24}>
							<Form.Item label="Calculated Price (Informational)">
								<Input disabled value={`${calculatedPrice ? calculatedPrice.toFixed(2) : "0.00"} Pounds`} style={{ width: "100%" }} />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default PatientProductUsageList;
