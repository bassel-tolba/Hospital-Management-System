// frontend/src/components/Auth/UserRegistration.jsx
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Typography, Alert, Upload } from "antd"; // Import Upload
import { useAuthStore } from "../../services/auth.service";
import { useUnitStore } from "../../services/unit.service";
import { useRoleStore } from "../../services/role.service"; // CORRECT IMPORT
import styled, { keyframes } from "styled-components";
import {
	UserOutlined,
	LockOutlined,
	IdcardOutlined,
	ContactsOutlined,
	SolutionOutlined,
	HomeOutlined,
	UploadOutlined, // Import UploadOutlined icon
} from "@ant-design/icons";

const { Title } = Typography;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledForm = styled(Form)`
	margin-top: 10px;
`;

const AnimatedTitle = styled(Title)`
	animation: ${fadeIn} 0.5s ease-out;
	text-align: center;
	margin-bottom: 1rem;
`;

const AnimatedButton = styled(Button)`
	animation: ${fadeIn} 0.5s ease-out;
`;

const AnimatedAlert = styled(Alert)`
	animation: ${fadeIn} 0.5s ease-out;
`;

const UserRegistration = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [roleId, setRoleId] = useState(null);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [specialty, setSpecialty] = useState("");
	const [selectedUnits, setSelectedUnits] = useState([]);
	const [registrationSuccess, setRegistrationSuccess] = useState(false);
	const [profilePicture, setProfilePicture] = useState(null); // New state for the profile picture

	const { units, fetchAllUnits, loading: unitLoading } = useUnitStore();
	const { roles, loading: rolesLoading, fetchAllRoles } = useRoleStore(); // Use the hook
	const { status, error, register, clearError } = useAuthStore();

	const [userForm] = Form.useForm();

	useEffect(() => {
		fetchAllUnits();
		fetchAllRoles();
	}, [fetchAllUnits, fetchAllRoles]);

	const handleUserSubmit = async () => {
		try {
			await register(username, password, roleId, firstName, lastName, specialty, selectedUnits, profilePicture);
			clearError();
			setRegistrationSuccess(true);
			setTimeout(() => setRegistrationSuccess(false), 5000);
		} catch (err) {
			console.error(err);
		}
	};

	const handleRoleChange = (value) => {
		setRoleId(value);
	};

	const handleUnitChange = (value) => {
		setSelectedUnits(value);
	};
	const handleImageChange = ({ fileList }) => {
		if (fileList.length > 0) {
			setProfilePicture(fileList[0].originFileObj); // Use originFileObj!
		} else {
			setProfilePicture(null); // Clear if no file is selected
		}
	};

	return (
		<>
			<AnimatedTitle level={4}>Register User</AnimatedTitle>
			{status === "loading" && <AnimatedAlert message="Loading..." type="info" />}
			{error && <AnimatedAlert message={`Registration failed: ${error}`} type="error" />}
			{registrationSuccess && <AnimatedAlert message="Registration successful!" type="success" />}

			<StyledForm form={userForm} onFinish={handleUserSubmit}>
				<Form.Item label="Username" rules={[{ required: true, message: "Please enter your username!" }]}>
					<Input prefix={<UserOutlined />} type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
				</Form.Item>
				<Form.Item label="Password" rules={[{ required: true, message: "Please enter your password!" }]}>
					<Input prefix={<LockOutlined />} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				</Form.Item>
				<Form.Item label="First Name" rules={[{ required: true, message: "Please enter your first name!" }]}>
					<Input prefix={<IdcardOutlined />} type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
				</Form.Item>
				<Form.Item label="Last Name" rules={[{ required: true, message: "Please enter your last name!" }]}>
					<Input prefix={<ContactsOutlined />} type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
				</Form.Item>
				<Form.Item label="Specialty" rules={[{ required: true, message: "Please enter your specialty!" }]}>
					<Input prefix={<SolutionOutlined />} type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
				</Form.Item>
				<Form.Item label="Role" rules={[{ required: true, message: "Please select a role!" }]}>
					<Select placeholder="Select a role" onChange={handleRoleChange} value={roleId} loading={rolesLoading}>
						{roles.map((role) => (
							<Select.Option key={role.id} value={role.id}>
								{role.name}
							</Select.Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item label="Units">
					<Select
						prefix={<HomeOutlined />}
						mode="multiple"
						placeholder="Select units"
						onChange={handleUnitChange}
						value={selectedUnits}
						loading={unitLoading}>
						{Array.isArray(units)
							? units.map((unit) => (
									<Select.Option key={unit.id} value={unit.id}>
										{unit.name}
									</Select.Option>
							  ))
							: null}
					</Select>
				</Form.Item>
				<Form.Item label="Profile Picture">
					<Upload
						listType="picture"
						fileList={
							profilePicture ? [{ uid: "-1", name: profilePicture.name, status: "done", url: URL.createObjectURL(profilePicture) }] : []
						}
						onChange={handleImageChange}
						beforeUpload={() => false} // Prevent automatic upload
						maxCount={1}>
						<Button icon={<UploadOutlined />}>Upload</Button>
					</Upload>
				</Form.Item>
				<Form.Item style={{ textAlign: "center" }}>
					<AnimatedButton type="default" htmlType="submit" disabled={status === "loading"}>
						Register
					</AnimatedButton>
				</Form.Item>
			</StyledForm>
		</>
	);
};

export default UserRegistration;
