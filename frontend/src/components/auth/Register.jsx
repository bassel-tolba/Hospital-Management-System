import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Typography, Space, Alert, Card } from "antd";
import { useAuthStore } from "../../services/auth.service";
import { useUnitStore } from "../../services/unit.service";
import styled, { keyframes } from "styled-components";
import { UserOutlined, LockOutlined, IdcardOutlined, ContactsOutlined, SolutionOutlined, HomeOutlined } from "@ant-design/icons";

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

const StyledCard = styled(Card)`
	border-radius: 10px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	transition: box-shadow 0.3s ease;
	width: 100%;
	max-width: 600px; /* Adjust card size for small screens*/
	margin-bottom: 1rem;
	animation: ${fadeIn} 0.5s ease-out; /* Apply fade-in animation */

	&:hover {
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
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

const Register = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [specialty, setSpecialty] = useState("");
	const [selectedUnits, setSelectedUnits] = useState([]);
	const [registrationSuccess, setRegistrationSuccess] = useState(false);
	const { units, fetchAllUnits, loading: unitLoading } = useUnitStore();
	const { status, error, register, clearError } = useAuthStore();

	useEffect(() => {
		fetchAllUnits();
	}, []);

	const handleSubmit = async () => {
		try {
			await register(username, password, role.toUpperCase(), firstName, lastName, specialty, selectedUnits);
			clearError();
			setRegistrationSuccess(true);
			setTimeout(() => setRegistrationSuccess(false), 5000); // Clear after 5 seconds
		} catch (err) {
			console.log(err);
		}
	};
	const handleRoleChange = (value) => {
		setRole(value);
	};
	const handleUnitChange = (value) => {
		setSelectedUnits(value);
	};

	return (
		<div style={{ padding: 20, display: "flex", justifyContent: "center" }}>
			<StyledCard>
				<Space direction="vertical" size="large" style={{ width: "100%" }}>
					<AnimatedTitle level={2}>Register</AnimatedTitle>
					{status === "loading" && <AnimatedAlert message="Loading..." type="info" />}
					{error && <AnimatedAlert message={`Registration failed: ${error}`} type="error" />}
					{registrationSuccess && <AnimatedAlert message="Registration successful!" type="success" />}
					<StyledForm onFinish={handleSubmit}>
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
							<Select prefix={<SolutionOutlined />} placeholder="Select a role" onChange={handleRoleChange} value={role}>
								<Select.Option value="ADMIN">Admin</Select.Option>
								<Select.Option value="HEAD_NURSE">Head Nurse</Select.Option>
								<Select.Option value="DOCTOR">Doctor</Select.Option>
								<Select.Option value="NURSE">Nurse</Select.Option>
								<Select.Option value="PATIENT">Patient</Select.Option>
								<Select.Option value="RECEPTIONIST">Receptionist</Select.Option>
								<Select.Option value="PHARMACIST">Pharmacist</Select.Option>
								<Select.Option value="LAB_TECHNICIAN">Lab Technician</Select.Option>
								<Select.Option value="RADIOLOGIST">Radiologist</Select.Option>
								<Select.Option value="ACCOUNTANT">Accountant</Select.Option>
								<Select.Option value="INSURANCE_PROVIDER">Insurance Provider</Select.Option>
								<Select.Option value="SOCIAL_WORKER">Social Worker</Select.Option>
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
								{units?.map((unit) => (
									<Select.Option key={unit.id} value={unit.id}>
										{unit.name}
									</Select.Option>
								))}
							</Select>
						</Form.Item>

						<Form.Item style={{ textAlign: "center" }}>
							<AnimatedButton type="primary" htmlType="submit" disabled={status === "loading"}>
								Register
							</AnimatedButton>
						</Form.Item>
					</StyledForm>
				</Space>
			</StyledCard>
		</div>
	);
};

export default Register;
