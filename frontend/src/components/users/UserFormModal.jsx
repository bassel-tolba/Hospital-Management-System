// frontend/src/components/User/UserFormModal.js
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, AutoComplete, Upload, Image, Typography } from "antd";
import { usePatientStore } from "../../services/patient.service";
import { useUnitStore } from "../../services/unit.service";
import { useRoomStore } from "../../services/room.service";
import { useRoleStore } from "../../services/role.service";
import { useAuthStore } from "../../services/auth.service";
import { UploadOutlined, ClearOutlined } from "@ant-design/icons"; // Import ClearOutlined
import { useUserStore } from "../../services/user.service"; // Import useUserStore

const UserFormModal = ({ isVisible, onCancel, onSubmit, form, loading, selectedUser, currentUser }) => {
	// ... (All your existing state and useEffect hooks) ...
	const { patients, searchPatients, clearError } = usePatientStore();
	const { units, fetchAllUnits } = useUnitStore();
	const { rooms, fetchAllRooms } = useRoomStore();
	const { roles, fetchAllRoles } = useRoleStore();
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [filteredRooms, setFilteredRooms] = useState([]);
	const [selectedUnits, setSelectedUnits] = useState([]);
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
	const { updateUserPatients, updateUserRooms, updateUserUnits } = useUserStore(); // Get update functions

	useEffect(() => {
		console.log("UserFormModal useEffect (Overall) - Start");
		console.log("  selectedUser:", selectedUser);

		if (selectedUser) {
			setSelectedUnits(selectedUser.unitIds || []);
			setSelectedPatients(selectedUser.patientIds || []);
			console.log("  Initial selectedUnits:", selectedUser.unitIds || []);
			console.log("  Initial selectedRooms:", selectedUser.roomIds || []);
			console.log("  Initial selectedPatients:", selectedUser.patientIds || []);

			form.setFieldsValue({
				...selectedUser,
				roleId: selectedUser.roleId,
				unitIds: selectedUser.unitIds || [],
				roomIds: selectedUser.roomIds || [],
				patientIds: selectedUser.patientIds || [],
			});
			console.log("  Form values after initial setFieldsValue:", form.getFieldsValue());
		} else {
			setSelectedUnits([]);
			setSelectedPatients([]);
			form.resetFields();
			console.log("  Form values after resetFields:", form.getFieldsValue());
		}

		setExistingProfilePicture(null);
		setChangePassword(false);
		setNewPassword("");
		console.log("UserFormModal useEffect (Overall) - End");
	}, [selectedUser, form, isVisible]);

	useEffect(() => {
		console.log("UserFormModal useEffect (isVisible) - isVisible:", isVisible);
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
		console.log("UserFormModal useEffect (selectedUnits, rooms) - selectedUnits:", selectedUnits, "rooms:", rooms);
		if (rooms?.content) {
			setFilteredRooms(rooms.content.filter((room) => selectedUnits.includes(room.unitId)));
		}
	}, [selectedUnits, rooms]);

	const fetchPatients = async (value) => {
		console.log("fetchPatients called with value:", value);
		try {
			const searchResults = await searchPatients({ searchTerm: value, page: 0, size: 10 });
			console.log("fetchPatients searchResults:", searchResults);
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
		console.log("handlePatientSearch called with value:", value);
		setPatientSearchTerm(value);
		fetchPatients(value);
	};
	const handleUnitChange = (values) => {
		console.log("handleUnitChange called with values:", values);
		console.log("  selectedUnits (before):", selectedUnits);

		setSelectedUnits(values);

		if (values.length === 0) {
			console.log("  Clearing unitIds and roomIds in form");
			form.setFieldsValue({ unitIds: undefined, roomIds: undefined });
		} else {
			console.log("  Setting unitIds and clearing roomIds in form");
			form.setFieldsValue({ unitIds: values, roomIds: [] });
		}

		console.log("  selectedUnits (after):", values); // Log the *new* values
		console.log("  Form values after handleUnitChange:", form.getFieldsValue());
	};

	const handleRoomChange = (values) => {
		console.log("handleRoomChange called with values:", values);
		console.log("  selectedRooms (before - not directly tracked, but derived from form):", form.getFieldValue("roomIds"));

		// setSelectedRooms(values); // No need for a separate selectedRooms state

		if (values.length === 0) {
			console.log("  Clearing roomIds in form");
			form.setFieldsValue({ roomIds: undefined });
		} else {
			console.log("  Setting roomIds in form");
			form.setFieldsValue({ roomIds: values });
		}

		console.log("  selectedRooms (after - derived from form):", form.getFieldValue("roomIds")); // Log after setting
		console.log("  Form values after handleRoomChange:", form.getFieldsValue());
	};

	const handlePatientSelect = (patientId) => {
		console.log("handlePatientSelect called with patientId:", patientId);
		if (!selectedPatients.includes(patientId)) {
			const newSelectedPatients = [...selectedPatients, patientId];
			setSelectedPatients(newSelectedPatients);
			console.log("selectedPatients after adding:", newSelectedPatients);
			// Update the form value immediately:
			form.setFieldsValue({ patientIds: newSelectedPatients });
			console.log("Form values after handlePatientSelect:", form.getFieldsValue());
		}
		setPatientSearchTerm("");
		setPatientOptions([]);
	};

	const handlePatientRemove = (patientId) => {
		console.log("handlePatientRemove called with patientId:", patientId);
		const newSelectedPatients = selectedPatients.filter((id) => id !== patientId);
		setSelectedPatients(newSelectedPatients);
		console.log("selectedPatients after removing:", newSelectedPatients);
		// Update the form value immediately:
		form.setFieldsValue({ patientIds: newSelectedPatients });
		console.log("Form values after handlePatientRemove:", form.getFieldsValue());
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
		return `${fileUrl}`;
	};

	const handleWrappedSubmit = async () => {
		console.log("handleWrappedSubmit called");
		let values = await form.validateFields();
		console.log("  Form values in handleWrappedSubmit (before updates):", values);

		if (changePassword) {
			values.password = newPassword;
		} else if (selectedUser) {
			delete values.password;
		}
		values.profilePicture = profilePicture;
		console.log("  Form values in handleWrappedSubmit (after updates):", values);
		console.log("  selectedPatients in handleWrappedSubmit:", selectedPatients);
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

	// NEW FUNCTION: Explicitly clear associations
	const handleClearAssociations = async () => {
		if (!selectedUser) return; // Only works for existing users

		try {
			await updateUserUnits(selectedUser.id, []);
			await updateUserRooms(selectedUser.id, []);
			await updateUserPatients(selectedUser.id, []);
			// Update the form and local state to reflect the cleared associations
			form.setFieldsValue({ unitIds: undefined, roomIds: undefined, patientIds: undefined });
			setSelectedUnits([]);
			setSelectedPatients([]);
			//fetchUsers(); // DO NOT fetch here.  Let UserList handle the refresh.
		} catch (error) {
			console.error("Error clearing associations:", error);
			// Handle error (show notification, etc.)
		}
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
				selectedUser && ( // Show only for editing users
					<Button
						key="clear"
						type="default"
						icon={<ClearOutlined />}
						onClick={handleClearAssociations}
						disabled={!hasAuthority("UPDATE_USER")}
						style={{ color: "red", borderColor: "red" }}
						className="clear-associations-button"
						onMouseEnter={(e) => {
							e.target.style.color = "darkred";
							e.target.style.borderColor = "darkred";
						}}
						onMouseLeave={(e) => {
							e.target.style.color = "red";
							e.target.style.borderColor = "red";
						}}>
						Clear Associations
					</Button>
				),
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
						,
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
