// components/patients/PatientListActivityForm.js
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, message } from "antd";
import { useActivityStore } from "../../services/activity.service";
import { useLabStore } from "../../services/lab.service";
import { useImageReportTypeStore } from "../../services/imageReportType.service";

const { Option } = Select;
const { TextArea } = Input;

const PatientListActivityForm = ({ onActivityCreated }) => {
	const { createActivity, loading, error } = useActivityStore(); //Use loading and error
	const { labTests, fetchLabTests, loading: labLoading } = useLabStore();
	const { imageReportTypes, fetchImageReportTypes, loading: imageReportLoading } = useImageReportTypeStore();
	const [form] = Form.useForm();

	useEffect(() => {
		fetchLabTests();
		fetchImageReportTypes(0, 10000);
	}, [fetchLabTests, fetchImageReportTypes]);

	const onFinish = async (values) => {
		try {
			let description = values.description;

			// Determine description based on activity type and selection
			if (values.activityType === "LAB_TEST" && values.labTest) {
				const selectedLabTest = labTests.find((test) => test.testName === values.labTest);
				description = selectedLabTest ? selectedLabTest.testName : values.description;
			} else if (values.activityType === "IMAGE_REPORT" && values.imageReportType) {
				const selectedImageReportType = imageReportTypes.find((type) => type.name === values.imageReportType);
				description = selectedImageReportType ? selectedImageReportType.name : values.description;
			}
			const activityData = {
				activityType: values.activityType,
				description: description, // Use determined description
				state: "pending",
			};
			console.log("Submitting activity data:", activityData);
			onActivityCreated(activityData);
		} catch (err) {
			console.error("Failed to create activity", err);
			message.error(err.message || "Failed to create activity");
		}
	};

	const combinedLoading = loading || labLoading || imageReportLoading;

	return (
		<Form form={form} layout="vertical" onFinish={onFinish}>
			<Form.Item label="Service Type" name="activityType" rules={[{ required: true, message: "Please select a service type" }]}>
				<Select placeholder="Select a service type" allowClear>
					<Option value="LAB_TEST">Lab Test</Option>
					<Option value="IMAGE_REPORT">Image Report</Option>
					<Option value="VITAL_SIGNS">Vital Signs</Option>
					<Option value="MEDICATION_ADMINISTRATION">Medication Administration</Option>
					<Option value="ASSESSMENT">Assessment</Option>
					<Option value="PRODUCT">Product</Option>
				</Select>
			</Form.Item>

			{form.getFieldValue("activityType") === "LAB_TEST" && (
				<Form.Item label="Lab Test" name="labTest" rules={[{ required: true, message: "Please select a lab test" }]}>
					<Select
						placeholder="Select a Lab Test"
						options={labTests?.map((test) => ({ label: test.testName, value: test.testName })) || []}
						filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
						allowClear
					/>
				</Form.Item>
			)}

			{form.getFieldValue("activityType") === "IMAGE_REPORT" && (
				<Form.Item
					label="Image Report Type"
					name="imageReportType"
					rules={[{ required: true, message: "Please select an image report type" }]}>
					<Select
						placeholder="Select an Image Report Type"
						options={imageReportTypes?.map((type) => ({ label: type.name, value: type.name })) || []}
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
						required: form.getFieldValue("activityType") !== "LAB_TEST" && form.getFieldValue("activityType") !== "IMAGE_REPORT",
						message: "Please enter a description",
					},
				]}>
				<TextArea rows={4} placeholder="Enter description" />
			</Form.Item>

			<Form.Item>
				<Button type="primary" htmlType="submit" loading={combinedLoading} block disabled={combinedLoading}>
					Create Activity
				</Button>
			</Form.Item>
		</Form>
	);
};

export default PatientListActivityForm;
