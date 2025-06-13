import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, Select, Pagination, Row, Col, notification } from "antd";
import { useBedStore } from "../../services/bed.service";
import { useRoomStore } from "../../services/room.service";
import { useUnitStore } from "../../services/unit.service";
import { useAuthStore } from "../../services/auth.service"; // Import useAuthStore
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const BedList = () => {
	const { beds, loading, totalElements, searchBeds, deleteBed, createBed, updateBed, setLoading, freeAllExpiredBeds } = useBedStore();
	const { rooms, fetchAllRooms } = useRoomStore();
	const { units, fetchAllUnits } = useUnitStore();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedBed, setSelectedBed] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const [selectedUnit, setSelectedUnit] = useState(null);
	const [filteredRooms, setFilteredRooms] = useState([]);
	const [tableFilteredRooms, setTableFilteredRooms] = useState([]);

	const { user, hasAuthority } = useAuthStore(); // Use hasAuthority

	// Define permission checks
	const canCreateBed = hasAuthority("CREATE_BED");
	const canReadBed = hasAuthority("READ_BED");
	const canUpdateBed = hasAuthority("UPDATE_BED");
	const canDeleteBed = hasAuthority("DELETE_BED");

	useEffect(() => {
		fetchAllUnits();
		fetchAllRooms();
	}, [fetchAllUnits, fetchAllRooms]);

	useEffect(() => {
		fetchBeds();
	}, [page, size, searchParams]);

	const fetchBeds = async () => {
		if (!canReadBed) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to view beds.",
			});
			return;
		}
		setLoading(true);
		try {
			await searchBeds({ ...searchParams, page, size });
		} catch (error) {
			notification.error({
				message: "Error",
				description: `Failed to fetch beds: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (rooms && rooms.content) {
			if (selectedUnit) {
				setFilteredRooms(rooms.content.filter((room) => room.unitId === selectedUnit));
				setTableFilteredRooms(rooms.content.filter((room) => room.unitId === selectedUnit));
			} else {
				setFilteredRooms([]);
				setTableFilteredRooms(rooms.content);
			}
		} else {
			setFilteredRooms([]);
			setTableFilteredRooms([]);
		}
	}, [rooms, selectedUnit]);

	const showModal = (bed) => {
		setSelectedBed(bed);
		if (bed) {
			const room = rooms?.content?.find((room) => room.id === bed.roomId);
			setSelectedUnit(room?.unitId);
			if (room?.unitId) {
				setFilteredRooms(rooms?.content?.filter((room) => room.unitId === room?.unitId));
			}
			form.setFieldsValue({ ...bed, unitId: room?.unitId });
		} else {
			form.resetFields();
			setSelectedUnit(null);
			setFilteredRooms([]);
		}
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedBed(null);
		form.resetFields();
		setSelectedUnit(null);
		setFilteredRooms([]);
	};

	const handleUnitChangeModal = (unitId) => {
		setSelectedUnit(unitId);
		form.setFieldsValue({ ...form.getFieldsValue(), roomId: null });
		if (rooms?.content) {
			setFilteredRooms(rooms?.content?.filter((room) => room.unitId === unitId));
		}
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			const { unitId, ...bedData } = values;
			if (selectedBed) {
				if (!canUpdateBed) {
					notification.error({
						message: "Permission Denied",
						description: "You do not have permission to update beds.",
					});
					return;
				}
				await updateBed(selectedBed.id, bedData);
				notification.success({
					message: "Success",
					description: "Bed updated successfully",
				});
			} else {
				if (!canCreateBed) {
					notification.error({
						message: "Permission Denied",
						description: "You do not have permission to create beds.",
					});
					return;
				}
				await createBed(bedData);
				notification.success({
					message: "Success",
					description: "Bed created successfully",
				});
			}
			fetchBeds();
			setIsModalVisible(false);
			setSelectedBed(null);
			form.resetFields();
			setSelectedUnit(null);
			setFilteredRooms([]);
		} catch (error) {
			notification.error({
				message: "Error",
				description: `Failed to save bed: ${error.message}`,
			});
			console.log("Error in handle form submit", error);
		}
	};

	const handleDelete = async (bedId) => {
		if (!canDeleteBed) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to delete beds.",
			});
			return;
		}
		try {
			await deleteBed(bedId);
			notification.success({
				message: "Success",
				description: "Bed deleted successfully",
			});
			fetchBeds();
		} catch (error) {
			notification.error({
				message: "Error",
				description: `Failed to delete bed: ${error.message}`,
			});
			console.error("Error deleting bed:", error);
		}
	};

	const handleSearch = (value) => {
		setSearchParams({ ...searchParams, searchTerm: value });
		setPage(0);
	};

	const handlePaginationChange = (page, pageSize) => {
		setPage(page - 1);
		setSize(pageSize);
	};

	const handleRoomChange = (roomId) => {
		setSearchParams({ ...searchParams, roomId: roomId });
		setPage(0);
	};

	const handleUnitChange = (unitId) => {
		setSearchParams({ ...searchParams, unitId: unitId, roomId: null }); // Also reset room filter
		setPage(0);
		setSelectedUnit(unitId);
	};

	const handleFreeExpiredBeds = async () => {
		try {
			await freeAllExpiredBeds();
			notification.success({
				message: "Success",
				description: "Expired beds freed successfully",
			});
			fetchBeds();
		} catch (error) {
			console.error("Error in free expired beds:", error);
			notification.error({
				message: "Error",
				description: `Failed to free expired beds: ${error.message}`,
			});
		}
	};

	const formatRoomDisplay = (room) => {
		if (!room) return "N/A";
		const type = room.roomType ? `(${room.roomType})` : "";
		return `${room.roomNumber} ${type}`.trim();
	};

	const columns = [
		{
			title: "Bed Number",
			dataIndex: "bedNumber",
			key: "bedNumber",
			render: (text) => (canReadBed ? text : "***"),
		},
		{
			title: "Is Occupied",
			dataIndex: "occupied",
			key: "isOccupied",
			render: (isOccupied) => (canReadBed ? (isOccupied ? "Yes" : "No") : "***"),
		},
		{
			title: "Room",
			dataIndex: "roomId",
			key: "roomId",
			render: (roomId) => {
				if (!canReadBed) return "***";
				const room = rooms?.content?.find((r) => r.id === roomId);
				return formatRoomDisplay(room);
			},
		},
		{
			title: "Unit",
			dataIndex: "roomId",
			key: "unit",
			render: (roomId) => {
				if (!canReadBed) return "***";
				const room = rooms?.content?.find((r) => r.id === roomId);
				if (room) {
					const unit = units?.find((u) => u.id === room.unitId);
					return unit ? unit.name : "N/A";
				}
				return "N/A";
			},
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{canUpdateBed && (
						<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
							Edit
						</Button>
					)}
					{canDeleteBed && (
						<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
							Delete
						</Button>
					)}
				</Space>
			),
		},
	];

	return (
		<div className="main-container" style={{ padding: "20px", maxWidth: "100%", overflowX: "auto" }}>
			<Title level={2}>Bed List</Title>

			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Input.Search placeholder="Search by bed number..." onSearch={handleSearch} style={{ width: "100%" }} disabled={!canReadBed} />
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Select placeholder="Select a Unit" onChange={handleUnitChange} allowClear style={{ width: "100%" }} disabled={!canReadBed}>
						{units?.map((unit) => (
							<Option key={unit.id} value={unit.id}>
								{unit.name}
							</Option>
						))}
					</Select>
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Select
						placeholder="Select a Room"
						onChange={handleRoomChange}
						disabled={!selectedUnit || !canReadBed}
						allowClear
						style={{ width: "100%" }}
						value={searchParams.roomId}>
						{tableFilteredRooms?.map((room) => (
							<Option key={room.id} value={room.id}>
								{formatRoomDisplay(room)}
							</Option>
						))}
					</Select>
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Space>
						{canCreateBed && (
							<Button type="primary" onClick={() => showModal(null)}>
								Add New Bed
							</Button>
						)}
						<Button type="default" onClick={handleFreeExpiredBeds}>
							Free Expired Beds
						</Button>
					</Space>
				</Col>
			</Row>

			<div style={{ overflowX: "auto", margin: "0 -16px" }}>
				<Table columns={columns} dataSource={beds} loading={loading} rowKey="id" pagination={false} scroll={{ x: true }} />
			</div>

			<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
				<Pagination current={page + 1} pageSize={size} total={totalElements} showSizeChanger onChange={handlePaginationChange} responsive />
			</div>

			<Modal
				title={selectedBed ? "Edit Bed" : "Add Bed"}
				open={isModalVisible}
				onCancel={handleCancel}
				width="70%"
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					(selectedBed ? canUpdateBed : canCreateBed) && (
						<Button key="submit" type="primary" onClick={handleFormSubmit}>
							{selectedBed ? "Update" : "Save"}
						</Button>
					),
				]}>
				<Form form={form} layout="vertical">
					<Row gutter={16}>
						<Col xs={24} sm={24} md={12} lg={12}>
							<Form.Item label="Unit" name="unitId" rules={[{ required: true, message: "Please select a unit" }]}>
								<Select
									placeholder="Select a Unit"
									onChange={handleUnitChangeModal}
									value={selectedUnit}
									disabled={!canCreateBed && !canUpdateBed}>
									{units?.map((unit) => (
										<Option key={unit.id} value={unit.id}>
											{unit.name}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
						<Col xs={24} sm={24} md={12} lg={12}>
							<Form.Item label="Room" name="roomId" rules={[{ required: true, message: "Please select a room" }]}>
								<Select placeholder="Select a Room" disabled={!selectedUnit || (!canCreateBed && !canUpdateBed)}>
									{filteredRooms?.map((room) => (
										<Option key={room.id} value={room.id}>
											{formatRoomDisplay(room)}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} sm={24} md={12} lg={12}>
							<Form.Item label="Bed Number" name="bedNumber" rules={[{ required: true, message: "Please input bed number" }]}>
								<Input disabled={!canCreateBed && !canUpdateBed} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={24} md={12} lg={12}>
							<Form.Item label="Is Occupied" name="occupied" rules={[{ required: true, message: "Please select availability" }]}>
								<Select disabled={!canCreateBed && !canUpdateBed}>
									<Option value={true}>Yes</Option>
									<Option value={false}>No</Option>
								</Select>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default BedList;
