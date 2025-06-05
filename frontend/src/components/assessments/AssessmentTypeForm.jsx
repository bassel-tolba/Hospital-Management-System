// src/components/assessments/AssessmentTypeForm.js
import React from "react";
import { Form, Input, Button, Spin, Alert, Space, Collapse, Typography } from "antd";
import { useTranslation } from "react-i18next";

const { TextArea } = Input;
const { Panel } = Collapse;
const { Paragraph, Text, Link } = Typography; // Link might be useful later

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
		await onSave(values);
	};

	const handleFinishFailed = (errorInfo) => {
		console.error("Form validation failed:", errorInfo);
	};

	const formKey = typeData ? `edit-${typeData.id}` : "add";

	// --- HTML Template Rules Helper Content (Hardcoded English) ---
	const htmlTemplateRules = (
		<Typography>
			<Paragraph>
				To ensure your HTML templates work correctly with the assessment system and AI population, please follow these guidelines:
			</Paragraph>
			<ol>
				<li>
					<Text strong>Use Standard HTML Form Elements:</Text> For fields requiring user or AI input, use:
					<ul>
						<li>
							<code>{`<input type="text">`}</code>, <code>{`<input type="number">`}</code>, <code>{`<input type="date">`}</code>, etc.
						</li>
						<li>
							<code>{`<input type="checkbox">`}</code>, <code>{`<input type="radio">`}</code>
						</li>
						<li>
							<code>{`<textarea></textarea>`}</code>
						</li>
						<li>
							<code>{`<select><option value="...">...</option></select>`}</code>
						</li>
					</ul>
				</li>
				<li>
					<Text strong>Unique & Consistent Identifiers:</Text> Assign unique identifiers:
					<ul>
						<li>
							Use <Text code>id="uniqueFieldName"</Text> for precise AI targeting (preferred).
						</li>
						<li>
							Use <Text code>name="fieldName"</Text> (required for radio groups, good fallback).
						</li>
					</ul>
					The AI uses these <Text code>id</Text> or <Text code>name</Text> attributes to populate fields.
				</li>
				<li>
					<Text strong>Meaningful Values for Radio/Select:</Text> Ensure <Text code>value="..."</Text> attributes on radio buttons and
					select options are clear and match what AI might extract or what you intend to store.
				</li>
				<li>
					<Text strong>Use Labels:</Text> Associate labels with controls using <Text code>{`<label for="inputId">Label Text</label>`}</Text>{" "}
					for accessibility and AI context.
				</li>
				<li>
					<Text strong>Avoid General 'contentEditable':</Text> Do not make large structural parts of your template{" "}
					<Text code>contentEditable</Text>. Rely on the standard form inputs above for data entry points.
				</li>
				<li>
					<Text strong>Styling:</Text> You can style your template:
					<ul>
						<li>
							Include a <Text code>{`<style>/* CSS rules */</style>`}</Text> block within your template HTML for template-specific
							styles (recommended).
						</li>
						<li>Use CSS classes for better maintainability.</li>
					</ul>
				</li>
				<li>
					<Text strong>Input Placeholders:</Text> Use the <Text code>placeholder="Enter value..."</Text> attribute on text inputs and
					textareas for hints.
				</li>
				<li>
					<Text strong>Clear Structure:</Text> Maintain a simple, semantic HTML structure. Group related fields logically.
				</li>
			</ol>
			<Paragraph>
				<Text strong>AI Interaction Example:</Text>
				<br />
				If the user says: <Text code>Overall mood is 7. Sleep quality was good.</Text>
				<br />
				And your template has inputs like <Text code>{`<input id="mood_rating">`}</Text> and{" "}
				<Text code>{`<input type="radio" name="sleep_quality" value="good">`}</Text>,
				<br />
				The AI should ideally return structured data like: <Text code>{`{"fields": {"mood_rating": "7", "sleep_quality": "good"}}`}</Text>.
			</Paragraph>
			{/*
            <Paragraph>
                For more detailed examples, please refer to the <Link href="#" target="_blank" rel="noopener noreferrer">internal documentation</Link> (link to be updated).
            </Paragraph>
            */}
		</Typography>
	);

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
					help={!!typeData ? t("assessmentTypeForm.technicalName.editHelp") : null}>
					<Input placeholder={t("assessmentTypeForm.technicalName.placeholder")} disabled={loadingSubmit || !!typeData} />
				</Form.Item>

				{/* Template Content Field (TextArea) */}
				<Form.Item
					name="templateContent"
					label={t("assessmentTypeForm.templateContent.label")}
					rules={[{ required: true, message: t("assessmentTypeForm.templateContent.required") }]}>
					<TextArea
						rows={15}
						placeholder={t("assessmentTypeForm.templateContent.placeholder")}
						disabled={loadingSubmit}
						style={{ minHeight: "250px", fontFamily: "monospace" }}
					/>
				</Form.Item>

				{/* HTML Template Rules Helper */}
				<Collapse ghost style={{ marginBottom: "20px" }}>
					<Panel header={t("assessmentTypeForm.rules.panelHeader")} key="1">
						{" "}
						{/* Panel header can be translated */}
						{htmlTemplateRules} {/* Content is now hardcoded English */}
					</Panel>
				</Collapse>

				{/* Action Buttons */}
				<Form.Item style={{ marginBottom: 0 }}>
					<div style={{ textAlign: "right", marginTop: "24px", borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
						<Space wrap>
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
