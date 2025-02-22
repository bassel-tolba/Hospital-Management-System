// MiniCreateActivityForm.js
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Spin, message, Card, Typography } from "antd";
import { useActivityStore } from "../../services/activity.service";
import { useLabStore } from "../../services/lab.service";
import { useImageReportTypeStore } from "../../services/imageReportType.service";

import { LoadingOutlined } from "@ant-design/icons"; // More specific loading icon

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const MiniCreateActivityForm = ({ onActivityCreated, patientId }) => {
	const { createActivity, loading, error, clearError } = useActivityStore();
	const { labTests, fetchLabTests, loading: labLoading } = useLabStore();
	const { imageReportTypes, fetchImageReportTypes, loading: imageReportLoading } = useImageReportTypeStore();

	const [formData, setFormData] = useState({
		activityType: "",
		description: "",
		patientIds: [patientId || ""], // Initialize with patientId, handle null/undefined
		state: "pending",
	});
	const [selectedLabTest, setSelectedLabTest] = useState(null);
	const [selectedImageReportType, setSelectedImageReportType] = useState(null);

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
		}
	}, [formData.activityType, fetchLabTests, fetchImageReportTypes]);

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
			form.resetFields(); // Reset Ant Design form fields

			onActivityCreated();
			message.success("Activity created successfully");
		} catch (err) {
			console.error("Failed to create activity", err);
			message.error(err.message || "Failed to create activity"); // More robust error handling
		}
	};

	// --- Loading and Error States ---
	const combinedLoading = loading || labLoading || imageReportLoading;
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
						<Select
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
						<Select
							placeholder="Select an Image Report Type"
							options={getImageReportTypeOptions()}
							onSelect={handleImageReportTypeSelect}
							filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
							allowClear
						/>
					</Form.Item>
				)}

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
