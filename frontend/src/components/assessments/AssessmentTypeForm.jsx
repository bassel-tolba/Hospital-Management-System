// src/components/assessments/AssessmentTypeForm.js
import React from "react";
import { Form, Input, Button, Spin, Alert, Space } from "antd"; // Added Space
import { useTranslation } from "react-i18next";

const { TextArea } = Input;

const AssessmentTypeForm = ({ typeData, onSave, onCancel, loadingSubmit, darkMode }) => {
	const { t } = useTranslation();
	const [form] = Form.useForm();

	const initialFormValues = typeData
		? {
				name: typeData.name,
				displayName: typeData.displayName,
				templateContent: typeData.templateContent || "",
		  }
		: {
				name: "",
				displayName: "",
				templateContent: "",
		  };

	const handleFinish = async (values) => {
		console.log("Form submitted. Values received:", values);
		const finalData = { ...values };
		console.log("Calling onSave with final data:", finalData);
		try {
			await onSave(finalData);
			// Success should be handled by parent (AssessmentTypeManagement)
		} catch (error) {
			console.error("Error during the onSave callback:", error);
			// Parent should handle user notification
		}
	};

	const handleFinishFailed = (errorInfo) => {
		console.error("Form validation failed:", errorInfo);
	};

	// Key forces form re-initialization when switching between add/edit
	const formKey = typeData ? `edit-${typeData.id}` : "add";

	return (
		<Spin spinning={loadingSubmit} tip={typeData ? t("assessmentTypeForm.spinTipUpdate") : t("assessmentTypeForm.spinTipCreate")}>
			<Form
				form={form}
				key={formKey}
				layout="vertical"
				onFinish={handleFinish}
				onFinishFailed={handleFinishFailed}
				initialValues={initialFormValues}>
				{/* Display Name Field */}
				<Form.Item
					name="displayName"
					label={t("assessmentTypeForm.displayName.label")}
					rules={[{ required: true, message: t("assessmentTypeForm.displayName.required") }]}>
					<Input placeholder={t("assessmentTypeForm.displayName.placeholder")} disabled={loadingSubmit} />
				</Form.Item>

				{/* Technical Name Field */}
				<Form.Item
					name="name"
					label={t("assessmentTypeForm.technicalName.label")}
					rules={[
						{ required: true, message: t("assessmentTypeForm.technicalName.required") },
						{ pattern: /^[a-zA-Z0-9_]+$/, message: t("assessmentTypeForm.technicalName.pattern") },
					]}
					help={!!typeData ? t("assessmentTypeForm.technicalName.editHelp") : null} // Add help text when editing
				>
					<Input placeholder={t("assessmentTypeForm.technicalName.placeholder")} disabled={loadingSubmit || !!typeData} />
				</Form.Item>

				{/* Informational Alert */}
				<Alert
					message={t("assessmentTypeForm.htmlAlert.message")}
					description={t("assessmentTypeForm.htmlAlert.description")} // Add description for more context
					type="info"
					showIcon
					style={{ marginBottom: "16px" }} // Adjusted margin
				/>

				{/* Template Content Field (TextArea) */}
				<Form.Item
					name="templateContent"
					label={t("assessmentTypeForm.templateContent.label")}
					rules={[{ required: true, message: t("assessmentTypeForm.templateContent.required") }]}>
					<TextArea
						rows={15} // Ensure a reasonable default height
						placeholder={t("assessmentTypeForm.templateContent.placeholder")}
						disabled={loadingSubmit}
						style={{ minHeight: "200px" }} // Ensure min height
					/>
				</Form.Item>

				{/* Action Buttons */}
				<Form.Item style={{ marginBottom: 0 }}>
					{" "}
					{/* Remove default bottom margin */}
					<div style={{ textAlign: "right", marginTop: "24px", borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
						<Space wrap>
							{" "}
							{/* Add wrap for safety on very small screens */}
							<Button onClick={onCancel} disabled={loadingSubmit}>
								{t("common.cancel")}
							</Button>
							<Button type="primary" htmlType="submit" loading={loadingSubmit}>
								{typeData ? t("assessmentTypeForm.updateButton") : t("assessmentTypeForm.createButton")}
							</Button>
						</Space>
					</div>
				</Form.Item>
			</Form>
		</Spin>
	);
};

export default AssessmentTypeForm;
