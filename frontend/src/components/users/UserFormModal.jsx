import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, AutoComplete } from "antd";
import { usePatientStore } from "../../services/patient.service";
import { useUnitStore } from "../../services/unit.service";
import { useRoomStore } from "../../services/room.service";

const UserFormModal = ({ isVisible, onCancel, onSubmit, form, loading, selectedUser, currentUser }) => {
	const { patients, searchPatients, clearError } = usePatientStore();
	const { units } = useUnitStore();
	const { rooms, fetchAllRooms } = useRoomStore();
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [filteredRooms, setFilteredRooms] = useState([]);
	const [selectedUnit, setSelectedUnit] = useState(null);
	const [patientOptions, setPatientOptions] = useState([]);
	const [selectedPatients, setSelectedPatients] = useState([]); // Store selected patient IDs locally

	//when user is edited, if they have units assigned, we select it here
	useEffect(() => {
		if (selectedUser && selectedUser.unitIds && selectedUser.unitIds.length > 0) {
			setSelectedUnit(selectedUser.unitIds[0]); // Select the first unit
			form.setFieldsValue({
				...selectedUser,
				unitIds: selectedUser.unitIds[0], //only take the first unit
			});
		} else {
			setSelectedUnit(null);
		}
	}, [selectedUser, form]);

	useEffect(() => {
		fetchAllRooms();
	}, [fetchAllRooms]);

	useEffect(() => {
		if (isVisible) {
			// Fetch patients when the modal becomes visible
			fetchPatients("");
			if (selectedUser && selectedUser.patientIds) {
				setSelectedPatients(selectedUser.patientIds);
			} else {
				setSelectedPatients([]);
			}
		}
	}, [isVisible, selectedUser]);

	useEffect(() => {
		if (rooms?.content) {
			setFilteredRooms(rooms?.content?.filter((room) => room.unitId === selectedUnit));
		}
	}, [selectedUnit, rooms]);

	useEffect(() => {
		form.setFieldsValue({ patientIds: selectedPatients });
	}, [selectedPatients, form]);

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

	const handlePatientSearch = async (value) => {
		setPatientSearchTerm(value);
		fetchPatients(value);
	};

	// set selected unit to the new value
	const handleUnitChange = (value) => {
		setSelectedUnit(value);
		form.setFieldsValue({ unitIds: value, roomIds: [] });
	};

	const handleRoomChange = (value) => {
		form.setFieldsValue({ roomIds: value });
	};

	const handlePatientSelect = (patientId) => {
		// Check if the patient is already selected
		if (!selectedPatients.includes(patientId)) {
			setSelectedPatients([...selectedPatients, patientId]);
		}
		setPatientSearchTerm("");
		setPatientOptions([]);
	};

	const handlePatientRemove = (patientId) => {
		setSelectedPatients(selectedPatients.filter((id) => id !== patientId));
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
				<Button key="submit" type="primary" onClick={onSubmit} loading={loading}>
					{selectedUser ? "Update" : "Save"}
				</Button>,
			]}>
			<Form form={form} layout="vertical">
				<Form.Item label="Username" name="username" rules={[{ required: true, message: "Please input username" }]}>
					<Input disabled={!!selectedUser} />
				</Form.Item>
				<Form.Item label="Password" name="password" rules={[{ message: "Please input password" }]}>
					<Input.Password />
				</Form.Item>
				<Form.Item label="First Name" name="firstName" rules={[{ required: true, message: "Please input first name" }]}>
					<Input />
				</Form.Item>
				<Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: "Please input last name" }]}>
					<Input />
				</Form.Item>
				<Form.Item label="Specialty" name="specialty" rules={[{ required: true, message: "Please input specialty" }]}>
					<Input />
				</Form.Item>
				<Form.Item label="Role" name="role" rules={[{ required: true, message: "Please select role" }]}>
					<Select placeholder="Select a role" disabled={!!selectedUser}>
						<Select.Option value="ADMIN">Admin</Select.Option>
						<Select.Option value="NURSE">Nurse</Select.Option>
						{currentUser?.role !== "HEAD_NURSE" && <Select.Option value="DOCTOR">Doctor</Select.Option>}
						<Select.Option value="PATIENT">Patient</Select.Option>
						<Select.Option value="RECEPTIONIST">Receptionist</Select.Option>
						<Select.Option value="PHARMACIST">Pharmacist</Select.Option>
					</Select>
				</Form.Item>
				<Form.Item label="Units" name="unitIds">
					<Select placeholder="Select a unit" onChange={handleUnitChange} loading={loading}>
						{units?.map((unit) => (
							<Select.Option key={unit.id} value={unit.id}>
								{unit.name}
							</Select.Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item label="Rooms" name="roomIds">
					<Select mode="multiple" placeholder="Select rooms" onChange={handleRoomChange} loading={loading} disabled={!selectedUnit}>
						{filteredRooms?.map((room) => (
							<Select.Option key={room.id} value={room.id}>
								{`${room.roomNumber} (${room.roomType})`}
							</Select.Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item label="Patients" name="patientIds">
					<AutoComplete
						options={patientOptions}
						onSearch={handlePatientSearch}
						placeholder="Search for a patient"
						filterOption={false}
						onSelect={handlePatientSelect}
						value={patientSearchTerm}
					/>
					<Select
						mode="multiple"
						value={selectedPatients}
						style={{ marginTop: 8 }}
						placeholder="Selected patients"
						removeIcon={null}
						disabled={!selectedPatients?.length}
						onDeselect={handlePatientRemove}>
						{selectedPatients?.map((id) => {
							const patient = patients?.find((patient) => patient.id === id);
							return patient ? <Select.Option key={id} value={id}>{`${patient.firstName} ${patient.lastName}`}</Select.Option> : null;
						})}
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default UserFormModal;
