// frontend/src/components/User/UserFormModal.js
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, AutoComplete, Upload, Image, Typography } from "antd";
import { usePatientStore } from "../../services/patient.service";
import { useUnitStore } from "../../services/unit.service";
import { useRoomStore } from "../../services/room.service";
import { useRoleStore } from "../../services/role.service";
import { useAuthStore } from "../../services/auth.service";
import { UploadOutlined } from "@ant-design/icons";

const UserFormModal = ({ isVisible, onCancel, onSubmit, form, loading, selectedUser, currentUser }) => {
	const { patients, searchPatients, clearError } = usePatientStore();
	const { units, fetchAllUnits } = useUnitStore();
	const { rooms, fetchAllRooms } = useRoomStore();
	const { roles, fetchAllRoles } = useRoleStore();
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [filteredRooms, setFilteredRooms] = useState([]);
	const [selectedUnits, setSelectedUnits] = useState([]); // Store selectedUnits as an array
	const [patientOptions, setPatientOptions] = useState([]);
	const [selectedPatients, setSelectedPatients] = useState([]);
	const [changePassword, setChangePassword] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [profilePicture, setProfilePicture] = useState(null);
	const [existingProfilePicture, setExistingProfilePicture] = useState(null);
	const [previewVisible, setPreviewVisible] = useState(false);
	const [previewFile, setPreviewFile] = useState(null);
	const [fileType, setFileType] = useState(null);

	const { hasAuthority } = useAuthStore();

	useEffect(() => {
		if (selectedUser) {
			setSelectedUnits(selectedUser.unitIds || []); // Initialize with an array
		} else {
			setSelectedUnits([]);
		}
		setExistingProfilePicture(null);
		setChangePassword(false);
		setNewPassword("");

		if (selectedUser) {
			form.setFieldsValue({
				...selectedUser,
				roleId: selectedUser.roleId,
				unitIds: selectedUser.unitIds || [],
				roomIds: selectedUser.roomIds || [],
				patientIds: selectedUser.patientIds || [],
			});
			if (selectedUser.profilePictureURL) {
				setExistingProfilePicture({
					url: transformImageUrl(selectedUser.profilePictureURL),
					originalUrl: selectedUser.profilePictureURL,
				});
			}
		} else {
			setProfilePicture(null);
			setExistingProfilePicture(null);
			form.resetFields();
		}
	}, [selectedUser, form, isVisible]);

	useEffect(() => {
		if (isVisible) {
			fetchAllRooms();
			fetchAllUnits();
			fetchAllRoles();
			if (selectedUser && selectedUser.patientIds) {
				setSelectedPatients(selectedUser.patientIds);
			} else {
				setSelectedPatients([]);
			}
		}
	}, [isVisible, fetchAllRooms, fetchAllRoles, selectedUser, fetchAllUnits]);

	useEffect(() => {
		if (rooms?.content) {
			setFilteredRooms(rooms.content.filter((room) => selectedUnits.includes(room.unitId))); // Filter by selectedUnits
		}
	}, [selectedUnits, rooms]);

	const fetchPatients = async (value) => {
		try {
			const searchResults = await searchPatients({ searchTerm: value, page: 0, size: 10 });
			setPatientOptions(
				searchResults?.content?.map((patient) => ({
					label: `${patient.firstName} ${patient.lastName}`,
					value: patient.id,
				})) || []
			);
		} catch (error) {
			console.log("error on fetching patients", error);
			clearError();
			setPatientOptions([]);
		}
	};

	const handlePatientSearch = (value) => {
		setPatientSearchTerm(value);
		fetchPatients(value);
	};

	const handleUnitChange = (values) => {
		// values is now an array
		setSelectedUnits(values); // Update selectedUnits state
		form.setFieldsValue({ unitIds: values, roomIds: [] }); // Update the form, and clear rooms
	};

	const handleRoomChange = (value) => {
		form.setFieldsValue({ roomIds: value });
	};

	const handlePatientSelect = (patientId) => {
		if (!selectedPatients.includes(patientId)) {
			setSelectedPatients([...selectedPatients, patientId]);
		}
		setPatientSearchTerm("");
		setPatientOptions([]);
	};

	const handlePatientRemove = (patientId) => {
		setSelectedPatients(selectedPatients.filter((id) => id !== patientId));
	};

	const toggleChangePassword = () => {
		setChangePassword(!changePassword);
		setNewPassword("");
	};

	const handleNewPasswordChange = (e) => {
		setNewPassword(e.target.value);
	};

	const transformImageUrl = (url) => {
		if (!url) return null;
		let fileUrl = url;
		if (fileUrl.startsWith(".")) {
			fileUrl = fileUrl.substring(1);
		}
		return `http://localhost:8080${fileUrl}`;
	};

	const handleWrappedSubmit = async () => {
		let values = await form.validateFields();

		if (changePassword) {
			values.password = newPassword;
		} else if (selectedUser) {
			delete values.password;
		}
		values.profilePicture = profilePicture;

		onSubmit(values);
	};
	const handleImageChange = ({ fileList }) => {
		if (fileList.length > 0) {
			setProfilePicture(fileList[0].originFileObj);
		} else {
			setProfilePicture(null);
		}
	};
	const handleRemoveExistingFile = () => {
		setExistingProfilePicture(null);
		form.setFieldsValue({ profilePictureURL: null });
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

	return (
		<Modal
			title={selectedUser ? "Edit User" : "Add User"}
			visible={isVisible}
			onCancel={onCancel}
			footer={[
				<Button key="cancel" onClick={onCancel}>
					Cancel
				</Button>,
				<Button key="submit" type="primary" onClick={handleWrappedSubmit} loading={loading}>
					{selectedUser ? "Update" : "Save"}
				</Button>,
			]}>
			<Form form={form} layout="vertical">
				<Form.Item label="Username" name="username" rules={[{ required: true, message: "Please input username" }]}>
					<Input disabled={!!selectedUser} />
				</Form.Item>

				{!selectedUser && (
					<Form.Item label="Password" name="password" rules={[{ required: true, message: "Please input password" }]}>
						<Input.Password />
					</Form.Item>
				)}

				{selectedUser && (
					<>
						<Button type="link" onClick={toggleChangePassword}>
							{changePassword ? "Cancel Change Password" : "Change Password"}
						</Button>
						{changePassword && (
							<Form.Item label="New Password" name="password">
								<Input.Password autoComplete="new-password" value={newPassword} onChange={handleNewPasswordChange} />
							</Form.Item>
						)}
					</>
				)}

				<Form.Item label="First Name" name="firstName" rules={[{ required: true, message: "Please input first name" }]}>
					<Input readOnly={!hasAuthority("UPDATE_USER")} />
				</Form.Item>
				<Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: "Please input last name" }]}>
					<Input readOnly={!hasAuthority("UPDATE_USER")} />
				</Form.Item>
				<Form.Item label="Specialty" name="specialty" rules={[{ required: true, message: "Please input specialty" }]}>
					<Input readOnly={!hasAuthority("UPDATE_USER")} />
				</Form.Item>
				<Form.Item label="Role" name="roleId" rules={[{ required: !selectedUser, message: "Please select a role" }]}>
					<Select placeholder="Select a role" disabled={!!selectedUser} loading={loading}>
						{roles.map((role) => (
							<Select.Option key={role.id} value={role.id}>
								{role.name}
							</Select.Option>
						))}
					</Select>
				</Form.Item>

				{/* Unit Selection */}
				<Form.Item label="Units" name="unitIds">
					<Select
						mode="multiple" // Allow multiple selections
						placeholder="Select units"
						onChange={handleUnitChange} // Use handleUnitChange
						loading={loading}
						disabled={!hasAuthority("UPDATE_USER")}>
						{units?.map((unit) => (
							<Select.Option key={unit.id} value={unit.id}>
								{unit.name}
							</Select.Option>
						))}
					</Select>
				</Form.Item>

				{/* Room Selection (Filtered by selected unit) */}
				<Form.Item label="Rooms" name="roomIds">
					<Select
						mode="multiple"
						placeholder="Select rooms"
						onChange={handleRoomChange} // Keep handleRoomChange
						loading={loading}
						disabled={!hasAuthority("UPDATE_USER")}>
						{filteredRooms.map((room) => (
							<Select.Option key={room.id} value={room.id}>
								{`${room.roomNumber} (${room.roomType})`}
							</Select.Option>
						))}
					</Select>
				</Form.Item>

				{/* Patient Selection (using AutoComplete) */}
				<Form.Item label="Patients" name="patientIds">
					<AutoComplete
						options={patientOptions}
						onSearch={handlePatientSearch}
						placeholder="Search for patients"
						filterOption={false}
						onSelect={handlePatientSelect}
						value={patientSearchTerm}
						disabled={!hasAuthority("UPDATE_USER")}
					/>
					<Select
						mode="multiple"
						value={selectedPatients}
						style={{ marginTop: 8 }}
						placeholder="Selected patients"
						onDeselect={handlePatientRemove}
						removeIcon={null}
						disabled={!hasAuthority("UPDATE_USER")}>
						{selectedPatients.map((id) => {
							const patient = patients.find((p) => p.id === id); // Find patient by ID
							return patient ? (
								<Select.Option key={id} value={id}>
									{`${patient.firstName} ${patient.lastName}`}
								</Select.Option>
							) : null;
						})}
					</Select>
				</Form.Item>
				{selectedUser && existingProfilePicture && (
					<Form.Item label="Existing File">
						<div style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
							{["png", "jpeg", "jpg", "webp", "gif"].some((ext) => existingProfilePicture.url.toLowerCase().endsWith(ext)) ? (
								<Image
									src={existingProfilePicture.url}
									alt="existing-file"
									style={{
										maxHeight: "100px",
										maxWidth: "200px",
										cursor: "pointer",
										borderRadius: "5px",
									}}
									onClick={() => handlePreview(existingProfilePicture)}
								/>
							) : (
								<video
									src={existingProfilePicture.url}
									alt="existing-file"
									style={{
										maxHeight: "100px",
										maxWidth: "200px",
										cursor: "pointer",
										borderRadius: "5px",
									}}
									onClick={() => handlePreview(existingProfilePicture)}
								/>
							)}

							{hasAuthority("UPDATE_USER") && (
								<Button type="danger" style={{ marginLeft: "10px" }} size="small" onClick={handleRemoveExistingFile}>
									Remove
								</Button>
							)}
						</div>
					</Form.Item>
				)}

				{/* Profile Picture Upload */}
				<Form.Item label="Profile Picture">
					<Upload
						listType="picture-card"
						fileList={
							profilePicture ? [{ uid: "-1", name: profilePicture.name, status: "done", url: URL.createObjectURL(profilePicture) }] : []
						}
						onChange={handleImageChange}
						beforeUpload={() => false}
						maxCount={1}
						disabled={!hasAuthority("UPDATE_USER")}>
						{!profilePicture && "+ Upload"}
					</Upload>
				</Form.Item>
			</Form>
			<Modal visible={previewVisible} title="File Preview" footer={null} onCancel={handlePreviewCancel}>
				{fileType === "image" && previewFile && <Image src={previewFile} style={{ width: "100%", borderRadius: "5px" }} />}
				{fileType === "video" && previewFile && <video src={previewFile} controls style={{ width: "100%", borderRadius: "5px" }} />}
				{fileType === "unknown" && <Typography.Text>Unsupported file type</Typography.Text>}
			</Modal>
		</Modal>
	);
};

export default UserFormModal;
