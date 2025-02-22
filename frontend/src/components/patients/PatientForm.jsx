// patients/PatientForm.js
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Select, Upload, Button, Image, Row, Col, Typography } from "antd";
import moment from "moment";
import VoiceToPatient from "../ai/VoiceToPatient"; // Adjust path
import { useAuthStore } from "../../services/auth.service";

const { Option } = Select;

// (AIFormField and AIFormContainer remain unchanged - I'm omitting them for brevity)
const AIFormField = ({ children, isProcessing }) => {
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
	return (
		<div className="relative p-6 bg-white rounded-lg shadow-lg">
			<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50" />

			<div
				className={`absolute inset-0 border-2 border-dashed  rounded-lg ${
					isProcessing ? "border-blue-400 animate-pulse" : "border-gray-300"
				}`}
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
	const [isTranscribing, setIsTranscribing] = useState(false); // Add this line

	const genderOptions = ["Male", "Female"];
	const severityOptions = [1, 2, 3, 4, 5];

	// Helper function to construct the full image URL
	const transformImageUrl = (url) => {
		if (!url) return null;
		let fileUrl = url;
		if (fileUrl.startsWith(".")) {
			fileUrl = fileUrl.substring(1);
		}
		return `${fileUrl}`;
	};
	const transformImageUrlOnly = (url) => {
		if (!url) return null;
		let fileUrl = url;
		if (fileUrl.startsWith(".")) {
			fileUrl = fileUrl.substring(1);
		}
		return fileUrl;
	};

	useEffect(() => {
		if (initialValues) {
			// Restore existing profile picture logic
			if (initialValues.profilePictureURL) {
				setExistingProfilePicture({
					url: transformImageUrl(initialValues.profilePictureURL),
					originalUrl: transformImageUrlOnly(initialValues.profilePictureURL), // Store original for removal
				});
			}
			form.setFieldsValue({
				...initialValues,
				dateOfBirth: initialValues.dateOfBirth ? moment(initialValues.dateOfBirth) : null,
			});
		} else {
			// Reset form and image states when adding a new patient
			form.resetFields();
			setProfilePicture(null);
			setExistingProfilePicture(null);
		}
	}, [initialValues, form]);

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			const formattedDateOfBirth = values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null;
			const patientData = { ...values, dateOfBirth: formattedDateOfBirth };

			// Determine if the existing picture should be removed
			let removedProfilePictureUrl = null;
			if (existingProfilePicture && !profilePicture) {
				removedProfilePictureUrl = existingProfilePicture.originalUrl; // Use original URL
			}

			onSubmit(patientData, profilePicture, removedProfilePictureUrl);
			form.resetFields(); // Clear form
			setProfilePicture(null); // Clear uploaded picture
			setExistingProfilePicture(null); // Clear existing picture
			setIsTranscribing(false);
		} catch (error) {
			console.error("Form submission error:", error);
		}
	};

	const handleImageChange = ({ fileList }) => {
		if (fileList.length > 0) {
			// Set the profile picture to the uploaded file
			setProfilePicture(fileList[0].originFileObj);
		} else {
			// If the user removes the uploaded file, clear the profile picture
			setProfilePicture(null);
		}
	};

	const handlePreview = (file) => {
		setPreviewFile(file.url);
		const fileExtension = file.url.split(".").pop().toLowerCase();
		if (["mp4", "mov", "avi", "mkv"].includes(fileExtension)) {
			setFileType("video");
		} else if (["png", "jpeg", "jpg", "webp"].includes(fileExtension)) {
			setFileType("image");
		} else {
			setFileType("unknown");
		}
		setPreviewVisible(true);
	};

	const handlePreviewCancel = () => {
		setPreviewVisible(false);
		setPreviewFile(null);
		setFileType(null);
	};

	const handleRemoveExistingFile = () => {
		// Clear the existing profile picture and update form value
		setExistingProfilePicture(null);
		form.setFieldsValue({ profilePictureURL: null }); // Important: Clear the field in the form
	};

	const handleFormFill = (data) => {
		form.setFieldsValue(data);
	};

	const canAddPatient = hasAuthority("CREATE_PATIENT");
	const canEditPatient = hasAuthority("UPDATE_PATIENT");

	return (
		<>
			<Modal
				title={isNewPatient ? "Add Patient" : "View Patient"}
				visible={visible}
				onCancel={onCancel}
				width="70%"
				footer={[
					<Button key="cancel" onClick={onCancel}>
						Cancel
					</Button>,
					(isNewPatient ? canAddPatient : canEditPatient) && (
						<Button key="submit" type="default" onClick={handleFormSubmit}>
							{isNewPatient ? "Save" : "Update"}
						</Button>
					),
				]}>
				<AIFormContainer isProcessing={isTranscribing}>
					<Form form={form} layout="vertical">
						{/* ... (other form items, VoiceToPatient) ... */}
						<Form.Item>
							<VoiceToPatient onFormFill={handleFormFill} disabled={!canAddPatient} />
						</Form.Item>

						<Row gutter={16}>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="First Name" name="firstName" rules={[{ required: true, message: "Please input first name" }]}>
										<Input readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: "Please input last name" }]}>
										<Input readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item
										label="Date of Birth"
										name="dateOfBirth"
										rules={[{ required: true, message: "Please input date of birth" }]}>
										<DatePicker style={{ width: "100%" }} disabled={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
						</Row>
						<Row gutter={16}>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Gender" name="gender" rules={[{ required: true, message: "Please select a gender" }]}>
										<Select placeholder="Select gender" disabled={!canEditPatient}>
											{genderOptions.map((gender) => (
												<Option key={gender} value={gender}>
													{gender}
												</Option>
											))}
										</Select>
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Address" name="address">
										<Input readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Phone Number" name="phoneNumber">
										<Input readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
						</Row>

						<Row gutter={16}>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Email" name="email">
										<Input readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item
										label="Severity Level"
										name="severityLevel"
										rules={[
											{ required: true, message: "Please select a severity level" },
											{ type: "integer", min: 1, max: 5, message: "Severity must be between 1 and 5" },
										]}>
										<Select placeholder="Select severity level" disabled={!canEditPatient}>
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
									<Form.Item label="Blood Type" name="bloodType">
										<Input readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
						</Row>

						<Row gutter={16}>
							<Col xs={24} sm={24} md={12} lg={12}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Allergies" name="allergies">
										<Input.TextArea rows={4} readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={24} md={12} lg={12}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Medical History" name="medicalHistory">
										<Input.TextArea rows={4} readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
						</Row>

						{/* Existing File Display */}
						{existingProfilePicture && (
							<AIFormField isProcessing={isTranscribing}>
								<Form.Item label="Existing File">
									<div style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
										{["png", "jpeg", "jpg", "webp"].some((ext) => existingProfilePicture.url.toLowerCase().endsWith(ext)) ? (
											<Image
												src={existingProfilePicture.url}
												alt="existing-file"
												style={{ maxHeight: "100px", maxWidth: "200px", cursor: "pointer", borderRadius: "5px" }}
												onClick={() => handlePreview(existingProfilePicture)}
											/>
										) : (
											<video
												src={existingProfilePicture.url}
												alt="existing-file"
												style={{ maxHeight: "100px", maxWidth: "200px", cursor: "pointer", borderRadius: "5px" }}
												onClick={() => handlePreview(existingProfilePicture)}
											/>
										)}

										{canEditPatient && (
											<Button type="danger" style={{ marginLeft: "10px" }} size="small" onClick={handleRemoveExistingFile}>
												Remove
											</Button>
										)}
									</div>
								</Form.Item>
							</AIFormField>
						)}

						{/* Profile Picture Upload */}
						<AIFormField isProcessing={isTranscribing}>
							<Form.Item label="Profile Picture">
								<Upload
									listType="picture-card"
									fileList={
										profilePicture
											? [
													{
														uid: "-1",
														name: profilePicture.name,
														status: "done",
														url: URL.createObjectURL(profilePicture),
													},
											  ]
											: []
									}
									onChange={handleImageChange}
									beforeUpload={() => false} // Prevent default upload behavior
									maxCount={1}
									disabled={!canEditPatient}>
									{!profilePicture && "+ Upload"}
								</Upload>
							</Form.Item>
						</AIFormField>
					</Form>
				</AIFormContainer>
			</Modal>
			<Modal visible={previewVisible} title="File Preview" footer={null} onCancel={handlePreviewCancel}>
				{fileType === "image" && previewFile && <Image src={previewFile} style={{ width: "100%", borderRadius: "5px" }} />}
				{fileType === "video" && previewFile && <video src={previewFile} controls style={{ width: "100%", borderRadius: "5px" }} />}
				{fileType === "unknown" && <Typography.Text>Unsupported file type</Typography.Text>}
			</Modal>
		</>
	);
};

export default PatientForm;
