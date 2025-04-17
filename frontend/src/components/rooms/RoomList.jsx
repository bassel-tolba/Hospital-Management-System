import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, Select, Pagination, Row, Col, Tooltip, Alert } from "antd";
import { useRoomStore } from "../../services/room.service";
import { useUnitStore } from "../../services/unit.service";
import { useAuthStore } from "../../services/auth.service"; // Import the auth store
import {
	SearchOutlined,
	EditOutlined,
	DeleteOutlined,
	HomeOutlined, // Example Icon for Room Number
	KeyOutlined, // Example Icon for Room Type
	ApartmentOutlined, // Example Icon for Unit
	PlusOutlined, // Icon for Add button
	ExclamationCircleOutlined, // Icon for alert
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const RoomList = () => {
	// --- State Hooks ---
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});

	// --- Store Hooks ---
	const { rooms, loading, total, searchRooms, deleteRoom, createRoom, updateRoom, setLoading } = useRoomStore();
	const { units, fetchAllUnits } = useUnitStore();
	const { user, hasAuthority } = useAuthStore(); // Get user and permission checker

	// --- Permissions ---
	// Check permissions only once user data is available
	const canRead = user && hasAuthority("READ_ROOM");
	const canCreate = user && hasAuthority("CREATE_ROOM");
	const canUpdate = user && hasAuthority("UPDATE_ROOM");
	const canDelete = user && hasAuthority("DELETE_ROOM");
	const canPerformActions = canUpdate || canDelete; // Can they perform any row action?

	// --- Effects ---
	useEffect(() => {
		// Fetch units regardless of room permissions as it's permitAll()
		fetchAllUnits();
	}, [fetchAllUnits]);

	useEffect(() => {
		// Only fetch rooms if the user has permission to read them
		if (canRead) {
			fetchRooms();
		}
		// Reset page if search/filter changes and user has permission
		if (canRead) {
			setPage(1); // Reset page on filter/search change
		}
	}, [searchParams, size, canRead]); // Add canRead dependency

	useEffect(() => {
		// Fetch rooms when page changes, only if user has permission
		if (canRead) {
			fetchRooms();
		}
	}, [page, canRead]); // Separate effect for page change

	// --- Data Fetching ---
	const fetchRooms = async () => {
		if (!canRead) return; // Don't fetch if no permission
		setLoading(true);
		const backendPage = page - 1;
		try {
			await searchRooms({ ...searchParams, page: backendPage, size });
		} catch (error) {
			console.error("Error fetching rooms:", error);
			// Handle error appropriately, maybe show a notification
		} finally {
			setLoading(false);
		}
	};

	// --- Modal Handling ---
	const showModal = (room) => {
		// Check permission before allowing modal open for edit/add
		if (room && !canUpdate) return; // Don't open edit modal if cannot update
		if (!room && !canCreate) return; // Don't open add modal if cannot create

		setSelectedRoom(room);
		if (room) {
			form.setFieldsValue(room);
		} else {
			form.resetFields();
		}
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedRoom(null);
		form.resetFields();
	};

	// --- Form & Action Handlers ---
	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			if (selectedRoom) {
				if (!canUpdate) return; // Double check permission
				await updateRoom(selectedRoom.id, values);
			} else {
				if (!canCreate) return; // Double check permission
				await createRoom(values);
			}
			fetchRooms(); // Refetch list after change
			setIsModalVisible(false);
			setSelectedRoom(null);
			form.resetFields();
		} catch (error) {
			console.error("Error submitting form:", error);
			// Handle validation or API errors appropriately
		}
	};

	const handleDelete = async (roomId) => {
		if (!canDelete) return; // Check permission
		// Optional: Add confirmation dialog
		Modal.confirm({
			title: "Are you sure you want to delete this room?",
			icon: <ExclamationCircleOutlined />,
			content: "This action cannot be undone.",
			okText: "Yes, Delete",
			okType: "danger",
			cancelText: "No",
			onOk: async () => {
				try {
					await deleteRoom(roomId);
					fetchRooms(); // Refetch list after delete
				} catch (error) {
					console.error("Error deleting room:", error);
					// Handle error appropriately
				}
			},
		});
	};

	const handleSearch = (value) => {
		if (!canRead) return;
		setSearchParams({ ...searchParams, searchTerm: value });
		// Page reset is handled by the useEffect watching searchParams
	};

	const handlePageChange = (newPage) => {
		if (!canRead) return;
		setPage(newPage);
	};

	const handlePageSizeChange = (current, newSize) => {
		if (!canRead) return;
		setSize(newSize);
		// Page reset is handled by the useEffect watching size
	};

	const handleUnitChange = (unitId) => {
		if (!canRead) return;
		setSearchParams({ ...searchParams, unitId: unitId });
		// Page reset is handled by the useEffect watching searchParams
	};

	// --- Columns Definition ---
	const baseColumns = [
		{
			title: "Room Number",
			dataIndex: "roomNumber",
			key: "roomNumber",
			render: (text) => (
				<Space>
					<HomeOutlined />
					<span>{text}</span>
				</Space>
			),
		},
		{
			title: "Room Type",
			dataIndex: "roomType",
			key: "roomType",
			render: (text) => (
				<Space>
					<KeyOutlined />
					<span>{text}</span>
				</Space>
			),
		},
		{
			title: "Unit",
			dataIndex: "unitId",
			key: "unitId",
			render: (unitId) => {
				const unit = units?.find((unit) => unit.id === unitId);
				return (
					<Space>
						<ApartmentOutlined />
						<span>{unit ? unit.name : "N/A"}</span>
					</Space>
				);
			},
		},
	];

	const actionColumn = {
		title: "Actions",
		key: "actions",
		render: (text, record) => (
			<Space size="middle">
				{/* Show Edit button only if user has UPDATE_ROOM permission */}
				{canUpdate && (
					<Tooltip title="Edit Room">
						<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)} />
					</Tooltip>
				)}
				{/* Show Delete button only if user has DELETE_ROOM permission */}
				{canDelete && (
					<Tooltip title="Delete Room">
						<Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
					</Tooltip>
				)}
			</Space>
		),
	};

	// Conditionally add the action column only if the user can update OR delete
	const columns = canPerformActions ? [...baseColumns, actionColumn] : baseColumns;

	// --- Render Logic ---

	// If user data is loaded but they don't have read permission, show an alert
	if (user && !canRead) {
		return (
			<div className="main-container" style={{ padding: "20px" }}>
				<Alert message="Access Denied" description="You do not have permission to view the room list." type="error" showIcon />
			</div>
		);
	}

	// If still loading user data or rooms (initial load might be loading=true before canRead is known), show spinner or nothing
	// Or just rely on the Table's loading prop for subsequent loads.
	// If user is not logged in (user is null), they implicitly lack permissions. The check above handles this.

	return (
		<div className="main-container" style={{ padding: "20px", maxWidth: "100%", overflowX: "auto" }}>
			<Title level={2}>
				<Space>
					<HomeOutlined />
					Room List
				</Space>
			</Title>

			{/* Search and Filters - Render only if user can read */}
			{canRead && (
				<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
					<Col xs={24} sm={12} md={8} lg={6}>
						<Input.Search
							placeholder="Search by room number or room type..."
							onSearch={handleSearch}
							prefix={<SearchOutlined />}
							style={{ width: "100%" }}
							allowClear
						/>
					</Col>
					<Col xs={24} sm={12} md={8} lg={6}>
						<Select placeholder="Filter by Unit" onChange={handleUnitChange} allowClear style={{ width: "100%" }}>
							{units?.map((unit) => (
								<Option key={unit.id} value={unit.id}>
									{unit.name}
								</Option>
							))}
						</Select>
					</Col>
					<Col xs={24} sm={12} md={8} lg={6}>
						{/* Show Add button only if user has CREATE_ROOM permission */}
						{canCreate && (
							<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
								Add New Room
							</Button>
						)}
					</Col>
				</Row>
			)}

			{/* Table - Render only if user can read */}
			{canRead && (
				<div style={{ overflowX: "auto", margin: "0 -16px" }}>
					<Table
						columns={columns}
						// Handle cases where rooms or rooms.content might be null/undefined initially or on error
						dataSource={rooms?.content ?? []}
						loading={loading}
						rowKey="id"
						pagination={false}
						scroll={{ x: true }}
					/>
				</div>
			)}

			{/* Pagination - Render only if user can read */}
			{canRead &&
				rooms?.content?.length > 0 && ( // Show pagination only if there's data
					<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
						<Pagination
							current={page}
							pageSize={size}
							total={total}
							showSizeChanger
							onChange={handlePageChange}
							onShowSizeChange={handlePageSizeChange}
							showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
							responsive
						/>
					</div>
				)}

			{/* Modal - Render outside main conditional, visibility controlled by state */}
			{/* The showModal function already prevents opening if permissions are lacking */}
			<Modal
				title={selectedRoom ? "Edit Room" : "Add Room"}
				visible={isModalVisible}
				onCancel={handleCancel}
				width="70%"
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button
						key="submit"
						type="primary"
						onClick={handleFormSubmit}
						// Disable button if user lacks permission for the current action (Add vs Edit)
						disabled={selectedRoom ? !canUpdate : !canCreate}>
						{selectedRoom ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical">
					{/* Disable form fields based on permission for the current action */}
					<Row gutter={16}>
						<Col xs={24} sm={24} md={12} lg={12}>
							<Form.Item label="Room Number" name="roomNumber" rules={[{ required: true, message: "Please input room number" }]}>
								<Input prefix={<HomeOutlined />} disabled={selectedRoom ? !canUpdate : !canCreate} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={24} md={12} lg={12}>
							<Form.Item label="Room Type" name="roomType" rules={[{ required: true, message: "Please input room type" }]}>
								<Input prefix={<KeyOutlined />} disabled={selectedRoom ? !canUpdate : !canCreate} />
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col xs={24} sm={24} md={12} lg={12}>
							<Form.Item label="Unit" name="unitId" rules={[{ required: true, message: "Please select a unit" }]}>
								<Select placeholder="Select a Unit" disabled={selectedRoom ? !canUpdate : !canCreate}>
									{units?.map((unit) => (
										<Option key={unit.id} value={unit.id}>
											{unit.name}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default RoomList;
