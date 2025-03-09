// UserRegistration.jsx
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Typography, Alert, Space, Card, Upload } from "antd";
import { useAuthStore } from "../../services/auth.service";
import { useUnitStore } from "../../services/unit.service";
import { useRoleStore } from "../../services/role.service";
// Removed: styled-components, motion, AnimatePresence (no longer needed here)
import {
	UserOutlined,
	LockOutlined,
	IdcardOutlined,
	ContactsOutlined,
	SolutionOutlined,
	HomeOutlined,
	UploadOutlined,
	UserAddOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

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
		// Removed: AnimatePresence, motion.div, variants
		// Kept: Space, Card, Title, Form, and all form items

		<Card>
			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				<Title level={2} style={{ textAlign: "center" }}>
					<Space>
						<UserAddOutlined />
						Register User
					</Space>
				</Title>

				{status === "loading" && <Alert message="Loading..." type="info" />}

				{error && <Alert message={`Registration Failed: ${error}`} type="error" />}

				{registrationSuccess && <Alert message="Registration successful!" type="success" />}

				<Form form={userForm} onFinish={handleUserSubmit}>
					<Form.Item rules={[{ required: true, message: "Please enter username!" }]}>
						<Input prefix={<UserOutlined />} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
					</Form.Item>

					<Form.Item rules={[{ required: true, message: "Please enter password!" }]}>
						<Input
							prefix={<LockOutlined />}
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Password"
						/>
					</Form.Item>

					<Form.Item rules={[{ required: true, message: "Please enter first name!" }]}>
						<Input
							prefix={<IdcardOutlined />}
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							placeholder="First Name"
						/>
					</Form.Item>

					<Form.Item rules={[{ required: true, message: "Please enter last name!" }]}>
						<Input prefix={<ContactsOutlined />} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" />
					</Form.Item>

					<Form.Item rules={[{ required: true, message: "Please enter specialty!" }]}>
						<Input
							prefix={<SolutionOutlined />}
							value={specialty}
							onChange={(e) => setSpecialty(e.target.value)}
							placeholder="Specialty"
						/>
					</Form.Item>

					<Form.Item rules={[{ required: true, message: "Please select a role!" }]}>
						<Select placeholder="Select a role" onChange={handleRoleChange} value={roleId} loading={rolesLoading}>
							{roles.map((role) => (
								<Select.Option key={role.id} value={role.id}>
									{role.name}
								</Select.Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item>
						<Select mode="multiple" placeholder="Select units" onChange={handleUnitChange} value={selectedUnits} loading={unitLoading}>
							{Array.isArray(units) &&
								units.map((unit) => (
									<Select.Option key={unit.id} value={unit.id}>
										{unit.name}
									</Select.Option>
								))}
						</Select>
					</Form.Item>

					<Form.Item>
						<Upload
							listType="picture"
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
							beforeUpload={() => false}
							maxCount={1}>
							<Button icon={<UploadOutlined />}>Upload Profile Picture</Button>
						</Upload>
					</Form.Item>

					<Form.Item style={{ display: "flex", justifyContent: "center" }}>
						<Button type="primary" htmlType="submit" disabled={status === "loading"} style={{ width: "200px" }}>
							<UserAddOutlined /> Register
						</Button>
					</Form.Item>
				</Form>
			</Space>
		</Card>
	);
};

export default UserRegistration;
