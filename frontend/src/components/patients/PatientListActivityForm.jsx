// components/patients/PatientListActivityForm.js
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, message } from "antd";
import { useActivityStore } from "../../services/activity.service";
import { useLabStore } from "../../services/lab.service";
import { useImageReportTypeStore } from "../../services/imageReportType.service";
import { useTranslation } from "react-i18next"; // Import

const { Option } = Select;
const { TextArea } = Input;

const PatientListActivityForm = ({ onActivityCreated }) => {
	const { createActivity, loading, error } = useActivityStore(); //Use loading and error
	const { labTests, fetchLabTests, loading: labLoading } = useLabStore();
	const { imageReportTypes, fetchImageReportTypes, loading: imageReportLoading } = useImageReportTypeStore();
	const [form] = Form.useForm();
	const { t } = useTranslation(); // Initialize

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
			message.error(err.message || t("failed-to-create-activity"));
		}
	};

	const combinedLoading = loading || labLoading || imageReportLoading;

	return (
		<Form form={form} layout="vertical" onFinish={onFinish}>
			<Form.Item label={t("service-type")} name="activityType" rules={[{ required: true, message: t("please-select-a-service-type") }]}>
				<Select placeholder={t("select-a-service-type")} allowClear>
					<Option value="VITAL_SIGNS">{t("vital-signs")}</Option>
					<Option value="MEDICATION_ADMINISTRATION">{t("medication-administration")}</Option>
					<Option value="ASSESSMENT">{t("assessment")}</Option>
					<Option value="PRODUCT">{t("product")}</Option>
				</Select>
			</Form.Item>

			<Form.Item
				label={t("description")}
				name="description"
				rules={[
					{
						required: form.getFieldValue("activityType") !== "LAB_TEST" && form.getFieldValue("activityType") !== "IMAGE_REPORT",
						message: t("please-enter-a-description"),
					},
				]}>
				<TextArea rows={4} placeholder={t("enter-description")} />
			</Form.Item>

			<Form.Item>
				<Button type="primary" htmlType="submit" loading={combinedLoading} block disabled={combinedLoading}>
					{t("create-activity")}
				</Button>
			</Form.Item>
		</Form>
	);
};

export default PatientListActivityForm;
