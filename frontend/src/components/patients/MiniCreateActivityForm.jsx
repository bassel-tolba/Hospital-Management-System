import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Spin, message, Card, Typography } from "antd";
import { useActivityStore } from "../../services/activity.service";
import { useLabStore } from "../../services/lab.service";
import { useImageReportTypeStore } from "../../services/imageReportType.service";
import { useUnitStore } from "../../services/unit.service"; // Import the new unit store
import { useTranslation } from "react-i18next";
import { LoadingOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const MiniCreateActivityForm = ({ onActivityCreated, patientId }) => {
	const { t } = useTranslation();
	const { createActivity, loading, error, clearError } = useActivityStore();
	const { labTests, fetchLabTests, loading: labLoading } = useLabStore();
	const { imageReportTypes, fetchImageReportTypes, loading: imageReportLoading } = useImageReportTypeStore();
	const { fetchUnitsByType, loading: unitLoading } = useUnitStore(); // Get unit store functions

	const [form] = Form.useForm();
	const [formData, setFormData] = useState({
		activityType: "",
		description: "",
		patientIds: [patientId || ""],
		state: "pending",
		unitId: null, // Add unitId to form data
	});
	const [selectedLabTest, setSelectedLabTest] = useState(null);
	const [selectedImageReportType, setSelectedImageReportType] = useState(null);
	const [targetUnits, setTargetUnits] = useState([]); // A single state for the list of units to show

	useEffect(() => {
		if (patientId) {
			setFormData((prev) => ({ ...prev, patientIds: [patientId] }));
		}
	}, [patientId]);

	useEffect(() => {
		const fetchDependencies = async () => {
			// Reset selections and dynamic data
			setTargetUnits([]);
			form.setFieldsValue({ unitId: null, description: null });

			if (formData.activityType === "LAB_TEST") {
				fetchLabTests();
				try {
					const units = await fetchUnitsByType("LABORATORY");
					setTargetUnits(units);
				} catch (e) {
					console.error("Failed to fetch lab units", e);
					message.error(t("failed-to-fetch-lab-units"));
				}
			} else if (formData.activityType === "IMAGE_REPORT") {
				fetchImageReportTypes(0, 10000);
				try {
					const units = await fetchUnitsByType("RADIOLOGY");
					setTargetUnits(units);
				} catch (e) {
					console.error("Failed to fetch radiology units", e);
					message.error(t("failed-to-fetch-radiology-units"));
				}
			}
		};

		fetchDependencies();
	}, [formData.activityType, fetchLabTests, fetchImageReportTypes, fetchUnitsByType, form, t]);

	const handleInputChange = (name, value) => {
		const newFormData = { ...formData, [name]: value };
		if (name === "activityType") {
			newFormData.unitId = null; // Reset unitId when activity type changes
			setSelectedLabTest(null);
			setSelectedImageReportType(null);
		}
		setFormData(newFormData);
	};

	const handleLabTestSelect = (value) => {
		const selectedTest = labTests?.find((test) => test.testName === value);
		setSelectedLabTest(selectedTest);
		const description = selectedTest ? selectedTest.testName : "";
		setFormData((prev) => ({ ...prev, description }));
		form.setFieldsValue({ description });
	};

	const handleImageReportTypeSelect = (value) => {
		const selectedReportType = imageReportTypes?.find((type) => type.name === value);
		setSelectedImageReportType(selectedReportType);
		const description = selectedReportType ? selectedReportType.name : "";
		setFormData((prev) => ({ ...prev, description }));
		form.setFieldsValue({ description });
	};

	const onFinish = async (values) => {
		try {
			// Combine values from the form with patientId from props
			const activityData = {
				...formData,
				...values,
				patientIds: [patientId],
			};
			await createActivity(activityData);

			onActivityCreated();
			message.success(t("activity-created-successfully"));
			form.resetFields();
			setFormData({
				activityType: "",
				description: "",
				patientIds: [patientId],
				state: "pending",
				unitId: null,
			});
			setTargetUnits([]);
		} catch (err) {
			console.error("Failed to create activity", err);
			message.error(err.message || t("failed-to-create-activity"));
		}
	};

	const combinedLoading = loading || labLoading || imageReportLoading || unitLoading;

	return (
		<Card>
			<Title level={4} style={{ textAlign: "center", marginBottom: "20px" }}>
				{t("request-service")}
			</Title>
			<Spin spinning={combinedLoading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
				<Form form={form} layout="vertical" onFinish={onFinish} initialValues={formData}>
					<Form.Item label={t("service-type")} name="activityType" rules={[{ required: true, message: t("please-select-service-type") }]}>
						<Select placeholder={t("select-service-type")} onChange={(value) => handleInputChange("activityType", value)} allowClear>
							<Option value="LAB_TEST">{t("lab-test")}</Option>
							<Option value="IMAGE_REPORT">{t("image-report")}</Option>
							<Option value="VITAL_SIGNS">{t("vital-signs")}</Option>
							<Option value="MEDICATION_ADMINISTRATION">{t("medication-administration")}</Option>
							<Option value="ASSESSMENT">{t("assessment")}</Option>
							<Option value="PRODUCT">{t("product")}</Option>
						</Select>
					</Form.Item>

					{(formData.activityType === "LAB_TEST" || formData.activityType === "IMAGE_REPORT") && (
						<Form.Item
							label={formData.activityType === "LAB_TEST" ? t("target-lab") : t("target-radiology-unit")}
							name="unitId"
							rules={[{ required: true, message: t("please-select-target-unit") }]}>
							<Select placeholder={t("select-unit")} onChange={(value) => handleInputChange("unitId", value)} allowClear>
								{targetUnits.map((unit) => (
									<Option key={unit.id} value={unit.id}>
										{unit.name}
									</Option>
								))}
							</Select>
						</Form.Item>
					)}

					{formData.activityType === "LAB_TEST" && (
						<Form.Item label={t("lab-test")} name="description" rules={[{ required: true, message: t("please-select-lab-test") }]}>
							<Select placeholder={t("select-lab-test")} onSelect={handleLabTestSelect} showSearch allowClear>
								{labTests?.map((test) => (
									<Option key={test.id} value={test.testName}>
										{test.testName}
									</Option>
								))}
							</Select>
						</Form.Item>
					)}

					{formData.activityType === "IMAGE_REPORT" && (
						<Form.Item
							label={t("image-report-type")}
							name="description"
							rules={[{ required: true, message: t("please-select-image-report-type") }]}>
							<Select placeholder={t("select-image-report-type")} onSelect={handleImageReportTypeSelect} showSearch allowClear>
								{imageReportTypes?.map((type) => (
									<Option key={type.id} value={type.name}>
										{type.name}
									</Option>
								))}
							</Select>
						</Form.Item>
					)}

					{(formData.activityType === "ASSESSMENT" ||
						formData.activityType === "VITAL_SIGNS" ||
						formData.activityType === "MEDICATION_ADMINISTRATION" ||
						formData.activityType === "PRODUCT") && (
						<Form.Item
							label={t("description")}
							name="description"
							rules={[
								{
									required: true,
									message: t("please-enter-description"),
								},
							]}>
							<TextArea
								rows={4}
								placeholder={t("enter-description")}
								onChange={(e) => handleInputChange("description", e.target.value)}
							/>
						</Form.Item>
					)}

					<Form.Item>
						<Button type="primary" htmlType="submit" loading={loading} block>
							{t("create-activity")}
						</Button>
					</Form.Item>
				</Form>
			</Spin>
		</Card>
	);
};

export default MiniCreateActivityForm;
