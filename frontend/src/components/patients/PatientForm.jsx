// patients/PatientForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { Modal, Form, Input, DatePicker, Select, Upload, Button, Image, Row, Col, Typography, Divider, Space, QRCode } from "antd"; // Import QRCode from antd
import moment from "moment";
import VoiceToPatient from "../ai/VoiceToPatient"; // Adjust path
import { useAuthStore } from "../../services/auth.service";
import { useTranslation } from "react-i18next";
// Removed: import { QRCode } from "qrcode.react"; // No longer needed
import { DownloadOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Title, Text } = Typography;

// (AIFormField and AIFormContainer remain unchanged - omitting for brevity)
const AIFormField = ({ children, isProcessing }) => {
	// ... (same as before)
	return (
		<div className="relative group">
			{isProcessing && (
				<div className="absolute -right-6 top-1/2 -translate-y-1/2">
					<div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
				</div>
			)}
			<div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 via-purple-100/50 to-blue-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
			<div className="relative z-10">{children}</div>
		</div>
	);
};
const AIFormContainer = ({ children, isProcessing }) => {
	// ... (same as before)
	return (
		<div className="relative p-6 bg-white rounded-lg shadow-lg">
			<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50" />
			<div
				className={`absolute inset-0 border-2 border-dashed rounded-lg ${isProcessing ? "border-blue-400 animate-pulse" : "border-gray-300"}`}
			/>
			{isProcessing && (
				<div className="absolute -top-2 -right-2 w-4 h-4">
					<div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
					<div className="absolute inset-0 bg-blue-500 rounded-full" />
				</div>
			)}
			<div className="relative z-10">{children}</div>
		</div>
	);
};

const PatientForm = ({ visible, onCancel, onSubmit, initialValues, isNewPatient }) => {
	const [form] = Form.useForm();
	const [profilePicture, setProfilePicture] = useState(null);
	const [existingProfilePicture, setExistingProfilePicture] = useState(null);
	const [previewVisible, setPreviewVisible] = useState(false);
	const [previewFile, setPreviewFile] = useState(null);
	const [fileType, setFileType] = useState(null);
	const { hasAuthority } = useAuthStore();
	const [isTranscribing, setIsTranscribing] = useState(false);
	const { t } = useTranslation();
	const qrCodeRef = useRef(null); // Ref for the div containing the QR code

	const genderOptions = ["Male", "Female"];
	const severityOptions = [1, 2, 3, 4, 5];

	const transformImageUrl = (url) => {
		if (!url) return null;
		let fileUrl = url;
		if (fileUrl.startsWith(".")) fileUrl = fileUrl.substring(1);
		return `${fileUrl}`;
	};
	const transformImageUrlOnly = (url) => {
		if (!url) return null;
		let fileUrl = url;
		if (fileUrl.startsWith(".")) fileUrl = fileUrl.substring(1);
		return fileUrl;
	};

	useEffect(() => {
		if (visible) {
			if (initialValues) {
				if (initialValues.profilePictureURL) {
					setExistingProfilePicture({
						url: transformImageUrl(initialValues.profilePictureURL),
						originalUrl: transformImageUrlOnly(initialValues.profilePictureURL),
					});
				} else {
					setExistingProfilePicture(null);
				}
				form.setFieldsValue({
					...initialValues,
					dateOfBirth: initialValues.dateOfBirth ? moment(initialValues.dateOfBirth) : null,
				});
			} else {
				form.resetFields();
				setProfilePicture(null);
				setExistingProfilePicture(null);
			}
			setIsTranscribing(false);
		}
	}, [initialValues, form, visible]);

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			const formattedDateOfBirth = values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null;
			const patientData = { ...values, dateOfBirth: formattedDateOfBirth };

			let removedProfilePictureUrl = null;
			if (existingProfilePicture?.originalUrl && (profilePicture || !form.getFieldValue("profilePictureURL"))) {
				if (!profilePicture && !form.getFieldValue("profilePictureURL")) {
					removedProfilePictureUrl = existingProfilePicture.originalUrl;
				}
			}

			await onSubmit(patientData, profilePicture, removedProfilePictureUrl);
			// Let parent handle closing/resetting via onCancel or success callback
		} catch (error) {
			console.error("Form submission error:", error);
		}
	};

	const handleImageChange = ({ fileList }) => {
		setProfilePicture(fileList.length > 0 ? fileList[0].originFileObj : null);
	};

	const handlePreview = (file) => {
		// Use file.originFileObj if available and needs previewing, or file.url for existing/uploaded
		const previewUrl = file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : null);
		if (!previewUrl) return;

		setPreviewFile(previewUrl);
		const fileExtension = previewUrl.split(".").pop().toLowerCase();
		// Basic type detection, adjust if needed
		if (["mp4", "mov", "avi", "mkv", "webm"].includes(fileExtension)) setFileType("video");
		else if (["png", "jpeg", "jpg", "webp", "gif"].includes(fileExtension)) setFileType("image");
		else setFileType("unknown");

		setPreviewVisible(true);
	};

	const handlePreviewCancel = () => {
		setPreviewVisible(false);
		setPreviewFile(null);
		setFileType(null);
	};

	const handleRemoveExistingFile = () => {
		setExistingProfilePicture(null);
		form.setFieldsValue({ profilePictureURL: null });
	};

	const handleFormFill = (data) => {
		const processedData = { ...data };
		if (processedData.dateOfBirth && typeof processedData.dateOfBirth === "string") {
			const dob = moment(processedData.dateOfBirth, ["YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY"], true);
			processedData.dateOfBirth = dob.isValid() ? dob : null; // Set to null if invalid
		}
		form.setFieldsValue(processedData);
	};

	// --- QR Code Download ---
	const handleDownloadQRCode = () => {
		// Find the canvas element INSIDE the ref'd div
		const canvas = qrCodeRef.current?.querySelector("canvas");
		if (canvas && initialValues?.id) {
			try {
				const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
				let downloadLink = document.createElement("a");
				downloadLink.href = pngUrl;
				downloadLink.download = `patient_${initialValues.id}_qr.png`;
				document.body.appendChild(downloadLink);
				downloadLink.click();
				document.body.removeChild(downloadLink);
			} catch (error) {
				console.error("Error generating QR code data URL:", error);
				// May happen due to canvas tainting if an icon from another origin is used, though unlikely here.
			}
		} else {
			console.error("Could not find QR code canvas or patient ID.");
		}
	};

	// --- QR Code Data ---
	const qrCodeValue = initialValues?.id ? JSON.stringify({ type: "patient", id: initialValues.id }) : "";

	const canAddPatient = hasAuthority("CREATE_PATIENT");
	const canEditPatient = hasAuthority("UPDATE_PATIENT") || hasAuthority("UPDATE_PATIENT_FULL");
	const readOnlyMode = !isNewPatient && !canEditPatient;

	return (
		<>
			<Modal
				title={isNewPatient ? t("add-patient") : readOnlyMode ? t("view-patient") : t("edit-patient")}
				open={visible}
				onCancel={onCancel}
				width="70%"
				footer={[
					<Button key="cancel" onClick={onCancel}>
						{" "}
						{t("cancel")}{" "}
					</Button>,
					!readOnlyMode && (isNewPatient ? canAddPatient : canEditPatient) && (
						<Button key="submit" type="primary" onClick={handleFormSubmit}>
							{isNewPatient ? t("save") : t("update")}
						</Button>
					),
				]}>
				<AIFormContainer isProcessing={isTranscribing}>
					{/* --- QR Code Section (Only for Existing Patients) --- */}
					{!isNewPatient && initialValues?.id && (
						<>
							<Divider orientation="left">{t("patient-qr-code")}</Divider>
							<Row justify="center" align="middle" gutter={[16, 16]}>
								<Col>
									{/* Attach ref to the wrapping div */}
									<div
										ref={qrCodeRef}
										style={{ background: "white", padding: "8px", border: "1px solid #d9d9d9", display: "inline-block" }}>
										<QRCode
											value={qrCodeValue || "-"} // Provide fallback value for antd QRCode
											size={128}
											errorLevel="H" // Use 'errorLevel' prop
											type="canvas" // Force rendering as canvas for download
											// bordered={false} // Optional: remove border if padding is enough
										/>
									</div>
								</Col>
								<Col>
									<Space direction="vertical">
										<Text strong>
											{t("patient_id")}: {initialValues.id}
										</Text>
										<Button icon={<DownloadOutlined />} onClick={handleDownloadQRCode}>
											{t("download-qr-code")}
										</Button>
									</Space>
								</Col>
							</Row>
							<Divider />
						</>
					)}
					{/* --- End QR Code Section --- */}

					{isNewPatient && canAddPatient && (
						<Form.Item>
							<VoiceToPatient
								onFormFill={handleFormFill}
								setIsTranscribing={setIsTranscribing}
								disabled={readOnlyMode} // Disable if read-only (though usually only for new)
							/>
						</Form.Item>
					)}

					<Form form={form} layout="vertical">
						{/* --- Form Fields (Rows/Cols remain the same) --- */}
						<Row gutter={16}>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item
										label={t("first-name")}
										name="firstName"
										rules={[{ required: true, message: t("please-input-first-name") }]}>
										<Input readOnly={readOnlyMode} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item
										label={t("last-name")}
										name="lastName"
										rules={[{ required: true, message: t("please-input-last-name") }]}>
										<Input readOnly={readOnlyMode} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item
										label={t("date-of-birth")}
										name="dateOfBirth"
										rules={[{ required: true, message: t("please-input-date-of-birth") }]}>
										<DatePicker style={{ width: "100%" }} disabled={readOnlyMode} format="YYYY-MM-DD" />
									</Form.Item>
								</AIFormField>
							</Col>
						</Row>
						{/* ... other rows (Gender, Address, Phone, MRN, Severity, Blood Type, Allergies, History) ... */}
						<Row gutter={16}>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label={t("gender")} name="gender" rules={[{ required: true, message: t("please-select-a-gender") }]}>
										<Select placeholder={t("select-gender")} disabled={readOnlyMode}>
											{genderOptions.map((gender) => (
												<Option key={gender} value={gender}>
													{t(gender.toLowerCase())}
												</Option>
											))}
										</Select>
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label={t("address")} name="address">
										<Input readOnly={readOnlyMode} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label={t("phone-number")} name="phoneNumber">
										<Input readOnly={readOnlyMode} />
									</Form.Item>
								</AIFormField>
							</Col>
						</Row>
						<Row gutter={16}>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label={t("medical-record-number")} name="medicalRecordNumber">
										<Input readOnly={readOnlyMode || !isNewPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item
										label={t("severity-level")}
										name="severityLevel"
										rules={[{ required: true, message: t("please-select-a-severity-level") }]}>
										<Select placeholder={t("select-severity-level")} disabled={readOnlyMode}>
											{severityOptions.map((level) => (
												<Option key={level} value={level}>
													{level}
												</Option>
											))}
										</Select>
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label={t("blood-type")} name="bloodType">
										<Input readOnly={readOnlyMode} />
									</Form.Item>
								</AIFormField>
							</Col>
						</Row>
						<Row gutter={16}>
							<Col xs={24} sm={24} md={12} lg={12}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label={t("allergies")} name="allergies">
										<Input.TextArea rows={4} readOnly={readOnlyMode} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={24} md={12} lg={12}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label={t("medical-history")} name="medicalHistory">
										<Input.TextArea rows={4} readOnly={readOnlyMode} />
									</Form.Item>
								</AIFormField>
							</Col>
						</Row>

						{/* Existing File Display */}
						{existingProfilePicture && (
							<AIFormField isProcessing={isTranscribing}>
								<Form.Item label={t("existing-file")} name="profilePictureURL">
									<div style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
										{/* Use Ant Design Image for preview capabilities */}
										<Image
											src={existingProfilePicture.url}
											alt="existing-file"
											style={{ maxHeight: "100px", maxWidth: "200px", borderRadius: "5px", objectFit: "contain" }}
											// Ant Design Image handles image preview inherently
										/>
										{!readOnlyMode && (
											<Button danger style={{ marginLeft: "10px" }} size="small" onClick={handleRemoveExistingFile}>
												{t("remove")}
											</Button>
										)}
									</div>
								</Form.Item>
							</AIFormField>
						)}

						{/* Profile Picture Upload */}
						{!readOnlyMode && (
							<AIFormField isProcessing={isTranscribing}>
								<Form.Item
									label={t("upload-new-profile-picture")}
									extra={existingProfilePicture ? t("upload-replaces-existing") : ""}>
									<Upload
										listType="picture-card"
										fileList={
											profilePicture
												? [
														{
															uid: "-1",
															name: profilePicture.name,
															status: "done",
															originFileObj: profilePicture,
															url: URL.createObjectURL(profilePicture),
														},
												  ]
												: []
										}
										onChange={handleImageChange}
										beforeUpload={() => false}
										onPreview={handlePreview} // Use custom preview
										maxCount={1}
										accept="image/*" // Example: only images
										disabled={readOnlyMode}>
										{!profilePicture && t("upload")}
									</Upload>
								</Form.Item>
							</AIFormField>
						)}
					</Form>
				</AIFormContainer>
			</Modal>

			{/* File Preview Modal - Adjusted to potentially handle videos if Upload accepts them */}
			<Modal open={previewVisible} title={t("file-preview")} footer={null} onCancel={handlePreviewCancel}>
				{fileType === "image" && previewFile && <Image src={previewFile} style={{ width: "100%", borderRadius: "5px" }} preview={false} />}
				{fileType === "video" && previewFile && <video src={previewFile} controls style={{ width: "100%", borderRadius: "5px" }} />}
				{fileType === "unknown" && <Typography.Text>{t("unsupported-file-type-preview")}</Typography.Text>}
			</Modal>
		</>
	);
};

export default PatientForm;
