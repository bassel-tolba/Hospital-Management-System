import React, { useState, useEffect } from "react";
import {
	Table,
	Input,
	Button,
	Space,
	Typography,
	Modal,
	Form,
	DatePicker,
	Select,
	AutoComplete,
	notification,
	Tag,
	Row,
	Col,
	Tooltip,
	InputNumber,
} from "antd";
import { useAdmissionStore } from "../../services/admission.service";
import { usePatientStore } from "../../services/patient.service";
import { useBedStore } from "../../services/bed.service";
import { useRoomStore } from "../../services/room.service";
import { useUnitStore } from "../../services/unit.service";
import { useAuthStore } from "../../services/auth.service";
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";

const { Title } = Typography;
const { Option } = Select;

const AdmissionList = () => {
	const {
		admissions,
		admissionTypes,
		loading,
		total,
		searchAdmissions,
		deleteAdmission,
		createAdmission,
		updateAdmission,
		setLoading,
		setAdmissions,
		fetchAllAdmissionTypes,
		createAdmissionType,
		updateAdmissionType,
		deleteAdmissionType,
	} = useAdmissionStore();
	const { patients, searchPatients } = usePatientStore();
	const { beds, searchBeds, freeAllExpiredBeds } = useBedStore();
	const { rooms, fetchAllRooms } = useRoomStore();
	const { units, fetchAllUnits } = useUnitStore();
	const { user, hasAuthority } = useAuthStore(); // Use hasAuthority

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedAdmission, setSelectedAdmission] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const [patientOptions, setPatientOptions] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [filteredRooms, setFilteredRooms] = useState([]);
	const [filteredBeds, setFilteredBeds] = useState([]);
	const [selectedUnit, setSelectedUnit] = useState(null);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [selectedPatientId, setSelectedPatientId] = useState(null);
	const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
	const [selectedAdmissionType, setSelectedAdmissionType] = useState(null);
	const [typeForm] = Form.useForm();

	const canCreateAdmission = hasAuthority("CREATE_ADMISSION");
	const canReadAdmission = hasAuthority("READ_ADMISSION");
	const canUpdateAdmission = hasAuthority("UPDATE_ADMISSION");
	const canDeleteAdmission = hasAuthority("DELETE_ADMISSION");

	useEffect(() => {
		fetchAllAdmissionTypes();
	}, [fetchAllAdmissionTypes]);

	useEffect(() => {
		fetchAllUnits();
	}, [fetchAllUnits]);

	useEffect(() => {
		fetchAllRooms();
	}, [fetchAllRooms]);
	useEffect(() => {
		const fetchAllBeds = async () => {
			try {
				const response = await searchBeds({ size: 1000 });
			} catch (error) {
				console.error("Error fetching all beds on mount:", error);
			}
		};
		fetchAllBeds();
	}, [searchBeds]);

	useEffect(() => {
		fetchAdmissions();
	}, [page, size, searchParams]);

	const fetchAdmissions = async () => {
		if (!searchParams?.patientId) {
			setAdmissions([]);
			return;
		}

		setLoading(true);
		try {
			await searchAdmissions({ ...searchParams, page, size });
		} catch (error) {
			notification.error({
				message: "Error",
				description: `Failed to fetch admissions: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const showModal = (admission) => {
		setSelectedAdmission(admission);
		if (admission) {
			const bed = beds?.find((bed) => bed.id === admission.bedId);
			const room = rooms?.content?.find((room) => room.id === bed?.roomId);
			setSelectedUnit(room?.unitId);
			setSelectedRoom(bed?.roomId);
			setSelectedPatientId(admission.patientId);

			if (room?.unitId) {
				fetchFilteredBeds(room?.unitId, bed?.roomId);
			}
			if (room?.unitId) {
				setFilteredRooms(rooms?.content?.filter((room) => room.unitId === room?.unitId));
			}

			form.setFieldsValue({
				...admission,
				admissionDate: admission.admissionDate ? moment(admission.admissionDate) : null,
				dischargeDate: admission.dischargeDate ? moment(admission.dischargeDate) : null,
				unitId: room?.unitId,
				roomId: bed?.roomId,
				bedId: bed?.id,
				patientId: admission.patientId,
				admissionTypeId: admission.admissionTypeId,
			});
		} else {
			form.resetFields();
			setSelectedUnit(null);
			setSelectedRoom(null);
			setFilteredRooms([]);
			setFilteredBeds([]);
			setSelectedPatientId(null);
		}
		setIsModalVisible(true);
		setPatientSearchTerm("");
		setPatientOptions([]);
	};

	const showTypeModal = (admissionType) => {
		// Assuming you have permissions for managing admission types, add checks here if needed
		setSelectedAdmissionType(admissionType);
		if (admissionType) {
			typeForm.setFieldsValue(admissionType);
		} else {
			typeForm.resetFields();
		}
		setIsTypeModalVisible(true);
	};

	const handleTypeCancel = () => {
		setIsTypeModalVisible(false);
		setSelectedAdmissionType(null);
		typeForm.resetFields();
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedAdmission(null);
		form.resetFields();
		setPatientSearchTerm("");
		setPatientOptions([]);
		setSelectedUnit(null);
		setSelectedRoom(null);
		setFilteredRooms([]);
		setFilteredBeds([]);
		setSelectedPatientId(null);
	};

	const handlePatientSearch = async (value) => {
		setPatientSearchTerm(value);
		if (value) {
			try {
				const searchResults = await searchPatients({
					searchTerm: value,
					page: 0,
					size: 10,
				});
				setPatientOptions(
					searchResults?.content?.map((patient) => ({
						label: `${patient.firstName} ${patient.lastName}`,
						value: patient.id,
					})) || []
				);
			} catch (error) {
				console.error("Failed to search patients:", error);
				setPatientOptions([]);
			}
		} else {
			setPatientOptions([]);
		}
	};

	const handlePatientSelect = (patientId) => {
		setSelectedPatientId(patientId);
	};

	const fetchFilteredBeds = async (unitId, roomId) => {
		try {
			const response = await searchBeds({ unitId, roomId });
			setFilteredBeds(response?.content || []);
		} catch (error) {
			console.error("Failed to fetch filtered beds:", error);
			setFilteredBeds([]);
		}
	};

	const handleUnitChangeModal = async (unitId) => {
		setSelectedUnit(unitId);
		setSelectedRoom(null);
		setFilteredBeds([]);
		form.setFieldsValue({ ...form.getFieldsValue(), roomId: null, bedId: null });
		if (rooms?.content) {
			setFilteredRooms(rooms?.content?.filter((room) => room.unitId === unitId));
		}
	};

	const handleRoomChangeModal = async (roomId) => {
		setSelectedRoom(roomId);
		form.setFieldsValue({ ...form.getFieldsValue(), bedId: null });

		if (selectedUnit && roomId) {
			fetchFilteredBeds(selectedUnit, roomId);
		}
	};

	const handleTypeFormSubmit = async () => {
		// Add permission checks here if you have specific permissions for managing admission types
		try {
			const values = await typeForm.validateFields();
			if (selectedAdmissionType) {
				await updateAdmissionType(selectedAdmissionType.id, values);
				notification.success({
					message: "Success",
					description: "Admission type updated successfully",
				});
			} else {
				await createAdmissionType(values);
				notification.success({
					message: "Success",
					description: "Admission type created successfully",
				});
			}
			setIsTypeModalVisible(false);
			typeForm.resetFields();
			setSelectedAdmissionType(null);
			fetchAllAdmissionTypes(); // Refresh the list of admission types
		} catch (error) {
			notification.error({
				message: "Error",
				description: `Failed to save admission type: ${error.message}`,
			});
		}
	};

	const handleTypeDelete = async (admissionTypeId) => {
		// Add permission checks here if you have specific permissions for managing admission types
		try {
			await deleteAdmissionType(admissionTypeId);
			notification.success({
				message: "Success",
				description: "Admission type deleted successfully",
			});
			fetchAllAdmissionTypes(); // Refresh
		} catch (error) {
			notification.error({
				message: "Error",
				description: `Failed to delete admission type: ${error.message}`,
			});
		}
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			const formattedAdmissionDate = values.admissionDate ? values.admissionDate.format("YYYY-MM-DDTHH:mm:ss") : null;
			const formattedDischargeDate = values.dischargeDate ? values.dischargeDate.format("YYYY-MM-DDTHH:mm:ss") : null;

			const admissionData = {
				...values,
				admissionDate: formattedAdmissionDate,
				dischargeDate: formattedDischargeDate,
				patientId: selectedPatientId,
			};
			if (selectedAdmission) {
				if (!canUpdateAdmission) {
					notification.error({
						message: "Permission Denied",
						description: "You do not have permission to update admissions.",
					});
					return;
				}
				await updateAdmission(selectedAdmission.id, admissionData);
				notification.success({
					message: "Success",
					description: "Admission updated successfully",
				});
			} else {
				if (!canCreateAdmission) {
					notification.error({
						message: "Permission Denied",
						description: "You do not have permission to create admissions.",
					});
					return;
				}
				await createAdmission(admissionData);
				notification.success({
					message: "Success",
					description: "Admission created successfully",
				});
			}

			await freeAllExpiredBeds();
			fetchAdmissions();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedAdmission(null);
			setPatientSearchTerm("");
			setPatientOptions([]);
			setSelectedUnit(null);
			setSelectedRoom(null);
			setFilteredRooms([]);
			setFilteredBeds([]);
			setSelectedPatientId(null);
		} catch (error) {
			notification.error({
				message: "Error",
				description: `Failed to save admission: ${error.message}`,
			});
			console.log("error in handle form submit", error);
		}
	};

	const handleDelete = async (admissionId) => {
		if (!canDeleteAdmission) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to delete admissions.",
			});
			return;
		}
		try {
			await deleteAdmission(admissionId);
			notification.success({
				message: "Success",
				description: "Admission deleted successfully",
			});
			fetchAdmissions();
		} catch (error) {
			console.error("Error deleting admission:", error);
			notification.error({
				message: "Error",
				description: `Failed to delete admission: ${error.message}`,
			});
		}
	};

	const handleSearchUnitFilter = (unitId) => {
		setSearchParams({
			...searchParams,
			unitId: unitId,
			roomId: undefined,
			bedId: undefined,
		});
		setPage(0);
		setSelectedUnit(unitId);
	};

	const handleSearchRoomFilter = (roomId) => {
		setSearchParams({ ...searchParams, roomId: roomId, bedId: undefined });
		setPage(0);
		setSelectedRoom(roomId);
	};

	const handleSearchBedFilter = (bedId) => {
		setSearchParams({ ...searchParams, bedId: bedId });
		setPage(0);
	};

	const handleSearchPatientFilter = (value) => {
		setSearchParams({ ...searchParams, patientId: value });
		setPage(0);
	};

	const handleTableChange = (pagination) => {
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	const columns = [
		{
			title: "Admission Date",
			dataIndex: "admissionDate",
			key: "admissionDate",
			render: (text) => {
				if (!text) return null;
				const fullTime = moment(text).format("YYYY-MM-DD HH:mm:ss");
				return canReadAdmission ? (
					<Tooltip title={fullTime}>
						<span>{moment(text).fromNow()}</span>
					</Tooltip>
				) : (
					<span>***</span>
				);
			},
		},
		{
			title: "Discharge Date",
			dataIndex: "dischargeDate",
			key: "dischargeDate",
			render: (text) => {
				if (!text) return "Open";
				const fullTime = moment(text).format("YYYY-MM-DD HH:mm:ss");

				return canReadAdmission ? (
					<Tooltip title={fullTime}>
						<span>{moment(text).fromNow()}</span>
					</Tooltip>
				) : (
					<span>***</span>
				);
			},
		},
		{
			title: "Patient",
			dataIndex: "patientName",
			key: "patientName",
			render: (text) => (canReadAdmission ? text : "***"),
		},
		{
			title: "Admission Type",
			dataIndex: "admissionTypeName",
			key: "admissionTypeName",
			render: (text) => (canReadAdmission ? text : "***"),
		},
		{
			title: "Bed",
			dataIndex: "bedId",
			key: "bedId",
			render: (bedId) => {
				if (!canReadAdmission) return "***";
				const bed = beds?.find((bed) => bed.id === bedId);
				return bed ? bed.bedNumber : "N/A";
			},
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => {
				const isPastAdmission = record.dischargeDate && moment(record.dischargeDate).isBefore(moment());
				return (
					<Space size="middle">
						{isPastAdmission ? (
							<Tag color="green">Completed</Tag>
						) : (
							<>
								{canUpdateAdmission && (
									<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record)}>
										Edit
									</Button>
								)}

								{canDeleteAdmission && (
									<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
										Delete
									</Button>
								)}
							</>
						)}
					</Space>
				);
			},
		},
	];

	return (
		<div style={{ padding: 20 }} className="main-container">
			<Title level={2}>Admission List</Title>
			<Space style={{ marginBottom: 16 }} direction="vertical" size="middle">
				<AutoComplete
					style={{ width: "100%" }}
					options={patientOptions}
					onSearch={handlePatientSearch}
					placeholder="Search for a patient"
					filterOption={false}
					onSelect={handleSearchPatientFilter}
					disabled={!canReadAdmission}
				/>
				<Space>
					<Button
						type="default"
						icon={<PlusOutlined />}
						onClick={() => showModal(null)}
						disabled={!canCreateAdmission || !searchParams?.patientId}>
						Add New Admission
					</Button>

					<Button type="default" icon={<PlusOutlined />} onClick={() => showTypeModal(null)}>
						Manage Admission Types
					</Button>
				</Space>
			</Space>
			<div style={{ overflowX: "auto" }}>
				<Table
					columns={columns}
					dataSource={admissions}
					loading={loading}
					rowKey="id"
					pagination={{
						current: page + 1,
						pageSize: size,
						total: total,
						onChange: handleTableChange,
					}}
				/>
			</div>
			<Modal
				title={selectedAdmission ? "Edit Admission" : "Add Admission"}
				open={isModalVisible}
				onCancel={handleCancel}
				width={"90%"}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,

					(selectedAdmission ? canUpdateAdmission : canCreateAdmission) && (
						<Button key="submit" type="default" onClick={handleFormSubmit}>
							{selectedAdmission ? "Update" : "Save"}
						</Button>
					),
				]}>
				<Form form={form} layout="vertical">
					<Row gutter={16}>
						<Col xs={24} sm={12} md={12} lg={12}>
							<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
								<AutoComplete
									options={patientOptions}
									onSearch={handlePatientSearch}
									placeholder="Search for a patient"
									filterOption={false}
									onSelect={(patientId) => {
										setSelectedPatientId(patientId);
										form.setFieldsValue({
											...form.getFieldsValue(),
											patientId: patientId,
										});
									}}
									disabled={!canCreateAdmission && !canUpdateAdmission}
								/>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={12} lg={12}>
							<Form.Item
								label="Admission Type"
								name="admissionTypeId"
								rules={[{ required: true, message: "Please select an admission type" }]}>
								<Select placeholder="Select an Admission Type" disabled={!canCreateAdmission && !canUpdateAdmission}>
									{admissionTypes?.map((type) => (
										<Option key={type.id} value={type.id}>
											{type.name}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col xs={24} sm={12} md={12} lg={12}>
							<Form.Item label="Unit" name="unitId" rules={[{ required: true, message: "Please select a unit" }]}>
								<Select
									placeholder="Select a Unit"
									onChange={handleUnitChangeModal}
									value={selectedUnit}
									disabled={!canCreateAdmission && !canUpdateAdmission}>
									{units?.map((unit) => (
										<Option key={unit.id} value={unit.id}>
											{unit.name}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} sm={12} md={12} lg={12}>
							<Form.Item label="Room" name="roomId" rules={[{ required: true, message: "Please select a room" }]}>
								<Select
									placeholder="Select a Room"
									onChange={handleRoomChangeModal}
									disabled={!selectedUnit || (!canCreateAdmission && !canUpdateAdmission)}
									value={selectedRoom}>
									{filteredRooms?.map((room) => (
										<Option key={room.id} value={room.id}>
											{room.roomNumber}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={12} lg={12}>
							<Form.Item label="Bed" name="bedId" rules={[{ required: true, message: "Please select a bed" }]}>
								<Select placeholder="Select a Bed" disabled={!selectedRoom || (!canCreateAdmission && !canUpdateAdmission)}>
									{filteredBeds?.map((bed) => (
										<Option key={bed.id} value={bed.id} disabled={bed.occupied}>
											{bed.bedNumber} {bed.occupied ? "(Occupied)" : ""}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} sm={12} md={12} lg={12}>
							<Form.Item
								label="Admission Date"
								name="admissionDate"
								rules={[{ required: true, message: "Please select an admission date" }]}>
								<DatePicker style={{ width: "100%" }} showTime disabled={!canCreateAdmission && !canUpdateAdmission} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={12} lg={12}>
							<Form.Item label="Discharge Date" name="dischargeDate">
								<DatePicker style={{ width: "100%" }} showTime disabled={!canCreateAdmission && !canUpdateAdmission} />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
			<Modal
				title={selectedAdmissionType ? "Edit Admission Type" : "Add Admission Type"}
				open={isTypeModalVisible}
				onCancel={handleTypeCancel}
				footer={[
					<Button key="cancel" onClick={handleTypeCancel}>
						Cancel
					</Button>,

					<Button key="submit" type="default" onClick={handleTypeFormSubmit}>
						{selectedAdmissionType ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={typeForm} layout="vertical">
					<Form.Item label="Name" name="name" rules={[{ required: true, message: "Please enter the admission type name" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Price" name="price" rules={[{ required: true, message: "Please enter the price" }]}>
						<InputNumber style={{ width: "100%" }} />
					</Form.Item>
				</Form>
				{selectedAdmissionType && ( // Conditionally render delete button
					<Space>
						<Button type="danger" onClick={() => handleTypeDelete(selectedAdmissionType.id)}>
							Delete
						</Button>
					</Space>
				)}
			</Modal>
		</div>
	);
};

export default AdmissionList;
