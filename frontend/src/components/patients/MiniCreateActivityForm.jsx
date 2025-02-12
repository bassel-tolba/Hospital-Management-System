// MiniCreateActivityForm.js
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Spin, AutoComplete, message, Card, Typography } from "antd";
import { useActivityStore } from "../../services/activity.service";
import { useLabStore } from "../../services/lab.service";
import { useImageReportTypeStore } from "../../services/imageReportType.service";
import { useProductStore } from "../../services/product.service"; // Import Product store
import { useMedicationAdministrationStore } from "../../services/medicationAdministration.service"; // Import Medication store

import { LoadingOutlined } from "@ant-design/icons"; // More specific loading icon

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const MiniCreateActivityForm = ({ onActivityCreated, patientId }) => {
	const { createActivity, loading, error, clearError } = useActivityStore();
	const { labTests, fetchLabTests, loading: labLoading } = useLabStore();
	const { imageReportTypes, fetchImageReportTypes, loading: imageReportLoading } = useImageReportTypeStore();
	const { searchProducts, loading: productLoading } = useProductStore(); // Use Product store
	const { searchMedicationAdministrations, loading: medicationLoading } = useMedicationAdministrationStore(); // Import Medication store

	const [formData, setFormData] = useState({
		activityType: "",
		description: "",
		patientIds: [patientId || ""], // Initialize with patientId, handle null/undefined
		state: "pending",
	});
	const [selectedLabTest, setSelectedLabTest] = useState(null);
	const [selectedImageReportType, setSelectedImageReportType] = useState(null);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [selectedMedicationAdministration, setSelectedMedicationAdministration] = useState(null);
	const [productOptions, setProductOptions] = useState([]); // For product autocomplete
	const [medicationOptions, setMedicationOptions] = useState([]); // For medication autocomplete

	const [form] = Form.useForm();

	// --- Effects ---

	useEffect(() => {
		// If patientId exists, set it in the form.
		if (patientId) {
			setFormData((prev) => ({ ...prev, patientIds: [patientId] }));
		}
	}, [patientId]);

	useEffect(() => {
		if (formData.activityType === "LAB_TEST") {
			fetchLabTests();
		} else if (formData.activityType === "IMAGE_REPORT") {
			fetchImageReportTypes(0, 10000); // Good practice to have pagination limits, even for "all"
		} else if (formData.activityType === "PRODUCT") {
			// Fetch products (adjust as needed for your API)
			searchProducts({ page: 0, size: 10 });
		} else if (formData.activityType === "MEDICATION_ADMINISTRATION") {
			searchMedicationAdministrations({ page: 0, size: 10, patientId });
		}
	}, [formData.activityType, fetchLabTests, fetchImageReportTypes, searchProducts, searchMedicationAdministrations, patientId]);

	//Product Auto Complete
	useEffect(() => {
		if (formData.activityType === "PRODUCT" && searchProducts) {
			// Fetch and set product options
			const fetchProducts = async () => {
				try {
					const response = await searchProducts({ page: 0, size: 10 });
					if (response && Array.isArray(response.products)) {
						// Add a check here
						const options = response.products.map((product) => ({
							label: product.name,
							value: product.id,
						}));
						setProductOptions(options);
					} else {
						console.error("Invalid response from searchProducts:", response);
						setProductOptions([]);
					}
				} catch (error) {
					console.error("Error fetching products", error);
					setProductOptions([]); // Set to empty array on error
				}
			};
			fetchProducts();
		}
	}, [formData.activityType, searchProducts]);

	//medication Auto Complete
	useEffect(() => {
		if (formData.activityType === "MEDICATION_ADMINISTRATION" && searchMedicationAdministrations) {
			// Fetch and set product options
			const fetchMedicationAdministrations = async () => {
				try {
					const response = await searchMedicationAdministrations({ page: 0, size: 10, patientId });
					if (response && Array.isArray(response.medicationAdministrations)) {
						const options = response.medicationAdministrations.map((medicationAdministration) => ({
							label: `${medicationAdministration.medicationName} - ${medicationAdministration.amount} `,
							value: medicationAdministration.id,
						}));
						setMedicationOptions(options);
					} else {
						console.error("Invalid response from searchMedicationAdministrations:", response);
						setMedicationOptions([]);
					}
				} catch (error) {
					console.error("Error fetching searchMedicationAdministrations", error);
					setMedicationOptions([]);
				}
			};
			fetchMedicationAdministrations();
		}
	}, [formData.activityType, searchMedicationAdministrations, patientId]);

	useEffect(() => {
		form.setFieldsValue({
			activityType: formData.activityType,
			description: formData.description,
		});
	}, [formData.activityType, formData.description, form]);

	// --- Handlers ---

	const handleInputChange = (name, value) => {
		// Reset selections when activityType changes
		if (name === "activityType") {
			setSelectedLabTest(null);
			setSelectedImageReportType(null);
			setSelectedProduct(null);
			setSelectedMedicationAdministration(null);
			form.setFieldsValue({ description: null }); // Clear description
		}

		setFormData((prev) => ({ ...prev, [name]: value }));
		form.setFieldsValue({ [name]: value }); // Update form state (controlled component)
	};

	const handleLabTestSelect = (value) => {
		const selectedTest = labTests?.find((test) => test.testName === value);
		setSelectedLabTest(selectedTest);
		const description = selectedTest ? selectedTest.testName : "";
		setFormData((prev) => ({ ...prev, description }));
		form.setFieldsValue({ description }); // Update form's description
	};

	const handleImageReportTypeSelect = (value) => {
		const selectedReportType = imageReportTypes?.find((type) => type.name === value);
		setSelectedImageReportType(selectedReportType);
		const description = selectedReportType ? selectedReportType.name : "";
		setFormData((prev) => ({ ...prev, description }));
		form.setFieldsValue({ description }); // Update form's description
	};

	const handleProductSelect = (value) => {
		const selected = productOptions.find((product) => product.value === value);
		setSelectedProduct(selected);
		const description = selected ? selected.label : ""; // Use label for description
		setFormData((prev) => ({ ...prev, description }));
		form.setFieldsValue({ description });
	};
	const handleMedicationAdministrationSelect = (value) => {
		const selected = medicationOptions.find((medication) => medication.value === value);
		setSelectedMedicationAdministration(selected);
		const description = selected ? selected.label : ""; // Use label for description
		setFormData((prev) => ({ ...prev, description }));
		form.setFieldsValue({ description });
	};

	const getLabTestOptions = () => {
		return (
			labTests?.map((test) => ({
				label: test.testName,
				value: test.testName,
			})) || []
		); // Return empty array if labTests is null/undefined
	};

	const getImageReportTypeOptions = () => {
		return (
			imageReportTypes?.map((type) => ({
				label: type.name,
				value: type.name,
			})) || []
		); // Return empty array if imageReportTypes is null/undefined
	};

	const onFinish = async (values) => {
		try {
			let description;
			if (formData.activityType === "LAB_TEST" && selectedLabTest) {
				description = selectedLabTest.testName;
			} else if (formData.activityType === "IMAGE_REPORT" && selectedImageReportType) {
				description = selectedImageReportType.name;
			} else if (formData.activityType === "PRODUCT" && selectedProduct) {
				description = selectedProduct.label; // Use product name
			} else if (formData.activityType === "MEDICATION_ADMINISTRATION" && selectedMedicationAdministration) {
				description = selectedMedicationAdministration.label; // Use product name
			} else {
				description = values.description;
			}

			const activityData = { ...formData, description, patientIds: [patientId] }; // Ensure patientId is included
			await createActivity(activityData);

			// Reset form and selections
			setFormData({
				activityType: "",
				description: "",
				patientIds: [patientId], // Keep patientId
				state: "pending",
			});

			setSelectedLabTest(null);
			setSelectedImageReportType(null);
			setSelectedProduct(null);
			setSelectedMedicationAdministration(null);
			form.resetFields(); // Reset Ant Design form fields

			onActivityCreated();
			message.success("Activity created successfully");
		} catch (err) {
			console.error("Failed to create activity", err);
			message.error(err.message || "Failed to create activity"); // More robust error handling
		}
	};

	// --- Loading and Error States ---
	const combinedLoading = loading || labLoading || imageReportLoading || productLoading || medicationLoading;
	if (combinedLoading) {
		return (
			<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
				<Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
			</div>
		);
	}

	if (error) {
		return (
			<Card style={{ borderColor: "red" }}>
				<p style={{ color: "red" }}>Error: {error}</p>
				<Button type="link" size="small" onClick={clearError}>
					Clear Error
				</Button>
			</Card>
		);
	}

	// --- Render ---
	return (
		<Card>
			<Title level={4} style={{ textAlign: "center", marginBottom: "20px" }}>
				Request Service
			</Title>
			<Form form={form} layout="vertical" onFinish={onFinish} initialValues={formData}>
				<Form.Item label="Service Type" name="activityType" rules={[{ required: true, message: "Please select a service type" }]}>
					<Select placeholder="Select a service type" onChange={(value) => handleInputChange("activityType", value)} allowClear>
						<Option value="LAB_TEST">Lab Test</Option>
						<Option value="IMAGE_REPORT">Image Report</Option>
						<Option value="VITAL_SIGNS">Vital Signs</Option>
						<Option value="MEDICATION_ADMINISTRATION">Medication Administration</Option>
						<Option value="ASSESSMENT">Assessment</Option>
						<Option value="PRODUCT">Product</Option>
					</Select>
				</Form.Item>

				{formData.activityType === "LAB_TEST" && (
					<Form.Item
						label="Lab Test"
						name="labTest"
						rules={[{ required: formData.activityType === "LAB_TEST", message: "Please select a lab test" }]}>
						<AutoComplete
							placeholder="Select a Lab Test"
							options={getLabTestOptions()}
							onSelect={handleLabTestSelect}
							filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
							allowClear
						/>
					</Form.Item>
				)}

				{formData.activityType === "IMAGE_REPORT" && (
					<Form.Item
						label="Image Report Type"
						name="imageReportType"
						rules={[{ required: formData.activityType === "IMAGE_REPORT", message: "Please select an image report type" }]}>
						<AutoComplete
							placeholder="Select an Image Report Type"
							options={getImageReportTypeOptions()}
							onSelect={handleImageReportTypeSelect}
							filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
							allowClear
						/>
					</Form.Item>
				)}

				{formData.activityType === "PRODUCT" && (
					<Form.Item
						label="Product"
						name="product"
						rules={[{ required: formData.activityType === "PRODUCT", message: "Please select a product" }]}>
						<AutoComplete
							placeholder="Select a Product"
							options={productOptions}
							onSelect={handleProductSelect}
							filterOption={(inputValue, option) => option?.label?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
							allowClear
						/>
					</Form.Item>
				)}

				{formData.activityType === "MEDICATION_ADMINISTRATION" && (
					<Form.Item
						label="Medication Administration"
						name="medicationAdministration"
						rules={[
							{ required: formData.activityType === "MEDICATION_ADMINISTRATION", message: "Please select a medication administration" },
						]}>
						<AutoComplete
							placeholder="Select a Medication Administration"
							options={medicationOptions}
							onSelect={handleMedicationAdministrationSelect}
							filterOption={(inputValue, option) => option?.label?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
							allowClear
						/>
					</Form.Item>
				)}

				{(formData.activityType === "VITAL_SIGNS" || formData.activityType === "ASSESSMENT") && (
					<Form.Item
						label="Description"
						name="description"
						rules={[
							{
								required: true,
								message: "Please enter a description",
							},
						]}>
						<TextArea rows={4} placeholder="Enter description" />
					</Form.Item>
				)}

				<Form.Item>
					<Button type="primary" htmlType="submit" loading={loading} block>
						Create Activity
					</Button>
				</Form.Item>
			</Form>
		</Card>
	);
};

export default MiniCreateActivityForm;
