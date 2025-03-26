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
	List,
	Grid,
	InputNumber, // Import InputNumber
} from "antd";
import { useAdmissionStore } from "../../services/admission.service";
import { usePatientStore } from "../../services/patient.service";
import { useBedStore } from "../../services/bed.service";
import { useRoomStore } from "../../services/room.service";
import { useUnitStore } from "../../services/unit.service";
import { useAuthStore } from "../../services/auth.service";
import { QuestionCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import admissionDocsContent from "../../docs/admission";

const { Title } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid; // Use the useBreakpoint hook

const AdmissionList = () => {
	const {
		admissions,
		admissionTypes,
		loading,
		error,
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
	const { user, hasAuthority } = useAuthStore();

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

	const [showDocs, setShowDocs] = useState(false);

	const screens = useBreakpoint(); // Get current breakpoints

	// Helper functions for responsive styles
	const getResponsivePadding = () => (screens.xs ? "8px" : screens.sm ? "12px" : "24px");
	const getResponsiveMargin = () => (screens.xs ? "8px 0" : screens.sm ? "12px 0" : "24px 16px");

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
		// Removed the unnecessary check for patientId here.  It's OK to search with no patientId.
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
		try {
			const values = await typeForm.validateFields();
			if (selectedAdmissionType) {
				await updateAdmissionType(selectedAdmissionType.id, values);
			} else {
				await createAdmissionType(values);
			}
			setIsTypeModalVisible(false);
			typeForm.resetFields();
			setSelectedAdmissionType(null);
			fetchAllAdmissionTypes(); // Refresh
		} catch (error) {
			console.error("Failed to save admission type:", error);
		}
	};

	const handleTypeDelete = async (admissionTypeId) => {
		try {
			await deleteAdmissionType(admissionTypeId);
			fetchAllAdmissionTypes(); // Refresh
		} catch (error) {
			console.error("Failed to delete admission type:", error);
		}
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			const formattedAdmissionDate = values.admissionDate ? values.admissionDate.format("YYYY-MM-DDTHH:mm:ss") : null;

			const admissionData = {
				...values,
				admissionDate: formattedAdmissionDate,
				patientId: selectedPatientId,
			};
			if (selectedAdmission) {
				await updateAdmission(selectedAdmission.id, admissionData);
			} else {
				await createAdmission(admissionData);
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
			console.error("Failed to save admission:", error);
		}
	};
	const handleEndAdmission = async (admission) => {
		try {
			const dischargeDate = moment().format("YYYY-MM-DDTHH:mm:ss");
			const updatedAdmissionData = {
				...admission,
				dischargeDate: dischargeDate,
			};

			await updateAdmission(admission.id, updatedAdmissionData);
			notification.success({
				message: "Success",
				description: "Admission ended successfully",
			});

			await freeAllExpiredBeds();
			fetchAdmissions();
		} catch (error) {
			notification.error({
				message: "Error",
				description: `Failed to end admission: ${error.message}`,
			});
		}
	};

	const handleDelete = async (admissionId) => {
		try {
			await deleteAdmission(admissionId);
			fetchAdmissions();
		} catch (error) {
			console.error("Error deleting admission:", error);
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

	const toggleDocs = () => {
		setShowDocs(!showDocs);
	};
	const getActionColumn = () => {
		const actions = [];
		if (canUpdateAdmission) {
			actions.push(
				<Button key="edit" type="primary" onClick={() => showModal(record)}>
					Edit
				</Button>
			);
		}
		if (canDeleteAdmission) {
			actions.push(
				<Button key="delete" type="danger" onClick={() => handleDelete(record.id)}>
					Delete
				</Button>
			);
		}
		actions.push(
			<Button key="end" type="default" onClick={() => handleEndAdmission(record)}>
				End
			</Button>
		);

		return {
			title: "Actions",
			key: "actions",
			render: (text, record) => <Space size="middle">{actions}</Space>,
		};
	};

	const columns = [
		{
			title: "Admission Date",
			dataIndex: "admissionDate",
			key: "admissionDate",
			render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
		},
		{
			title: "Discharge Date",
			dataIndex: "dischargeDate",
			key: "dischargeDate",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "Open"),
		},
		{ title: "Patient", dataIndex: "patientName", key: "patientName" },
		{ title: "Admission Type", dataIndex: "admissionTypeName", key: "admissionTypeName" },
		{
			title: "Bed",
			dataIndex: "bedId",
			key: "bedId",
			render: (bedId) => {
				const bed = beds?.find((bed) => bed.id === bedId);
				return bed ? bed.bedNumber : "N/A";
			},
		},
		getActionColumn(),
	].filter(Boolean);

	return (
		<div style={{ padding: getResponsivePadding() }}>
			<Title level={2} style={{ margin: getResponsiveMargin() }}>
				Admission List
				<Button type="link" icon={<QuestionCircleOutlined />} onClick={toggleDocs} />
			</Title>

			<Modal
				title="Admission Page Documentation"
				open={showDocs}
				onCancel={toggleDocs}
				footer={[
					<Button key="close" onClick={toggleDocs}>
						Close
					</Button>,
				]}
				width="80%">
				<ReactMarkdown remarkPlugins={[remarkGfm]}>{admissionDocsContent}</ReactMarkdown>
			</Modal>
			<Space style={{ marginBottom: 16 }} direction={screens.xs ? "vertical" : "horizontal"} size="middle">
				<AutoComplete
					style={{ width: screens.xs ? "100%" : "300px" }}
					options={patientOptions}
					onSearch={handlePatientSearch}
					placeholder="Search for a patient"
					filterOption={false}
					onSelect={handleSearchPatientFilter}
				/>
				<Space>
					{canCreateAdmission && (
						<Button type="primary" onClick={() => showModal(null)}>
							Add New Admission
						</Button>
					)}
					{/* Button to manage admission types */}
					<Button type="primary" onClick={() => showTypeModal(null)}>
						Manage Admission Types
					</Button>
				</Space>
			</Space>

			<Table
				columns={columns}
				dataSource={admissions}
				loading={loading}
				rowKey="id"
				pagination={{
					current: page + 1,
					pageSize: size,
					total: total,
					showSizeChanger: true, // Add this line

					onChange: (page, pageSize) => {
						setPage(page - 1);
						setSize(pageSize);
					},
				}}
				scroll={{ x: "max-content" }} // Add horizontal scrolling for tables
			/>

			{/* Modal for Adding/Editing Admissions */}
			<Modal
				title={selectedAdmission ? "Edit Admission" : "Add Admission"}
				open={isModalVisible}
				onCancel={handleCancel}
				onOk={handleFormSubmit}
				width={screens.xs ? "95%" : "80%"} // Responsive width
				style={{ maxWidth: screens.xs ? "95vw" : "900px" }} // Max-width
				bodyStyle={{ padding: getResponsivePadding() }} // Responsive padding
			>
				<Form form={form} layout={screens.xs ? "vertical" : "horizontal"}>
					{/* Patient and Admission Type */}
					<Form.Item
						labelCol={!screens.xs ? { span: 6 } : {}}
						wrapperCol={!screens.xs ? { span: 18 } : {}}
						label="Patient"
						name="patientId"
						rules={[{ required: true, message: "Please select a patient" }]}
						style={{ width: "100%" }} // Important for responsiveness within the Form.Item
					>
						<AutoComplete
							style={{ width: "100%" }} // Full width on all screens
							options={patientOptions}
							onSearch={handlePatientSearch}
							placeholder="Search for a patient"
							filterOption={false}
							onSelect={(patientId) => {
								setSelectedPatientId(patientId);
								form.setFieldsValue({ ...form.getFieldsValue(), patientId: patientId });
							}}
						/>
					</Form.Item>
					<Form.Item
						labelCol={!screens.xs ? { span: 6 } : {}}
						wrapperCol={!screens.xs ? { span: 18 } : {}}
						label="Admission Type"
						name="admissionTypeId"
						rules={[{ required: true, message: "Please select an admission type" }]}
						style={{ width: "100%" }}>
						<Select placeholder="Select an Admission Type" style={{ width: "100%" }}>
							{admissionTypes?.map((type) => (
								<Option key={type.id} value={type.id}>
									{type.name}
								</Option>
							))}
						</Select>
					</Form.Item>

					{/* Unit */}
					<Form.Item
						labelCol={!screens.xs ? { span: 6 } : {}}
						wrapperCol={!screens.xs ? { span: 18 } : {}}
						label="Unit"
						name="unitId"
						rules={[{ required: true, message: "Please select a unit" }]}
						style={{ width: "100%" }}>
						<Select placeholder="Select a Unit" onChange={handleUnitChangeModal} value={selectedUnit} style={{ width: "100%" }}>
							{units?.map((unit) => (
								<Option key={unit.id} value={unit.id}>
									{unit.name}
								</Option>
							))}
						</Select>
					</Form.Item>

					{/* Room and Bed */}
					<Form.Item
						labelCol={!screens.xs ? { span: 6 } : {}}
						wrapperCol={!screens.xs ? { span: 18 } : {}}
						label="Room"
						name="roomId"
						rules={[{ required: true, message: "Please select a room" }]}
						style={{ width: "100%" }}>
						<Select
							placeholder="Select a Room"
							onChange={handleRoomChangeModal}
							disabled={!selectedUnit}
							value={selectedRoom}
							style={{ width: "100%" }}>
							{filteredRooms?.map((room) => (
								<Option key={room.id} value={room.id}>
									{room.roomNumber}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						labelCol={!screens.xs ? { span: 6 } : {}}
						wrapperCol={!screens.xs ? { span: 18 } : {}}
						label="Bed"
						name="bedId"
						rules={[{ required: true, message: "Please select a bed" }]}
						style={{ width: "100%" }}>
						<Select placeholder="Select a Bed" disabled={!selectedRoom} style={{ width: "100%" }}>
							{filteredBeds?.map((bed) => (
								<Option key={bed.id} value={bed.id} disabled={bed.occupied}>
									{bed.bedNumber} {bed.occupied ? "(Occupied)" : ""}
								</Option>
							))}
						</Select>
					</Form.Item>

					{/* Admission Date */}
					<Form.Item
						labelCol={!screens.xs ? { span: 6 } : {}}
						wrapperCol={!screens.xs ? { span: 18 } : {}}
						label="Admission Date"
						name="admissionDate"
						rules={[{ required: true, message: "Please select an admission date" }]}
						style={{ width: "100%" }}>
						<DatePicker showTime style={{ width: "100%" }} />
					</Form.Item>
				</Form>
			</Modal>

			{/* Modal for Managing Admission Types */}
			<Modal
				title={selectedAdmissionType ? "Edit Admission Type" : "Add Admission Type"}
				open={isTypeModalVisible}
				onCancel={handleTypeCancel}
				onOk={handleTypeFormSubmit}
				okButtonProps={{ loading: loading }}
				width={screens.xs ? "95%" : "80%"} // Responsive width
				style={{ maxWidth: screens.xs ? "95vw" : "600px" }} // Max-width
				bodyStyle={{ padding: getResponsivePadding() }} // Responsive padding
			>
				<Form form={typeForm} layout="vertical">
					<Form.Item label="Name" name="name" rules={[{ required: true, message: "Please enter the admission type name" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Price" name="price" rules={[{ required: true, message: "Please enter the price" }]}>
						<InputNumber style={{ width: "100%" }} />
					</Form.Item>
				</Form>

				{/* List of Admission Types */}
				<List
					itemLayout="horizontal"
					dataSource={admissionTypes}
					style={{ marginTop: "20px" }}
					renderItem={(item) => (
						<List.Item
							actions={[
								<Button type="link" onClick={() => showTypeModal(item)}>
									Edit
								</Button>,
								<Button type="link" danger onClick={() => handleTypeDelete(item.id)}>
									Delete
								</Button>,
							]}>
							<List.Item.Meta title={item.name} description={`Price: ${item.price}`} />
						</List.Item>
					)}
				/>
			</Modal>
		</div>
	);
};

export default AdmissionList;
