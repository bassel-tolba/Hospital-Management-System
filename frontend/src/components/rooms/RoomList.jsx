import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, Select, Pagination, Row, Col, Tooltip } from "antd";
import { useRoomStore } from "../../services/room.service";
import { useUnitStore } from "../../services/unit.service";
import {
	SearchOutlined,
	EditOutlined,
	DeleteOutlined,
	HomeOutlined, // Example Icon for Room Number
	KeyOutlined, // Example Icon for Room Type
	ApartmentOutlined, // Example Icon for Unit
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const RoomList = () => {
	const { rooms, loading, total, searchRooms, deleteRoom, createRoom, updateRoom, setLoading } = useRoomStore();
	const { units, fetchAllUnits } = useUnitStore();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});

	useEffect(() => {
		fetchAllUnits();
	}, [fetchAllUnits]);

	useEffect(() => {
		fetchRooms();
	}, [page, size, searchParams]);

	const fetchRooms = async () => {
		setLoading(true);
		const backendPage = page - 1;
		await searchRooms({ ...searchParams, page: backendPage, size });
		setLoading(false);
	};

	const showModal = (room) => {
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

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			if (selectedRoom) {
				await updateRoom(selectedRoom.id, values);
			} else {
				await createRoom(values);
			}
			fetchRooms();
			setIsModalVisible(false);
			setSelectedRoom(null);
			form.resetFields();
		} catch (error) {
			console.log("Error in handle form submit", error);
		}
	};

	const handleDelete = async (roomId) => {
		try {
			await deleteRoom(roomId);
			fetchRooms();
		} catch (error) {
			console.error("Error deleting room:", error);
		}
	};

	const handleSearch = (value) => {
		setSearchParams({ ...searchParams, searchTerm: value });
		setPage(1);
	};

	const handlePageChange = (newPage) => {
		setPage(newPage);
	};

	const handlePageSizeChange = (current, newSize) => {
		setSize(newSize);
		setPage(1);
	};

	const handleUnitChange = (unitId) => {
		setSearchParams({ ...searchParams, unitId: unitId });
		setPage(1);
	};

	const columns = [
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
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					<Tooltip title="Edit Room">
						<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record)}>
							{/* Edit */}
						</Button>
					</Tooltip>
					<Tooltip title="Delete Room">
						<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
							{/* Delete */}
						</Button>
					</Tooltip>
				</Space>
			),
		},
	];

	return (
		<div className="main-container" style={{ padding: "20px", maxWidth: "100%", overflowX: "auto" }}>
			<Title level={2}>
				<Space>
					<HomeOutlined />
					Room List
				</Space>
			</Title>

			{/* Search and Filters */}
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Input.Search
						placeholder="Search by room number or room type..."
						onSearch={handleSearch}
						prefix={<SearchOutlined />}
						style={{ width: "100%" }}
					/>
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Select placeholder="Select a Unit" onChange={handleUnitChange} allowClear style={{ width: "100%" }}>
						{units?.map((unit) => (
							<Option key={unit.id} value={unit.id}>
								{unit.name}
							</Option>
						))}
					</Select>
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Button type="default" onClick={() => showModal(null)}>
						Add New Room
					</Button>
				</Col>
			</Row>

			{/* Table */}
			<div style={{ overflowX: "auto", margin: "0 -16px" }}>
				<Table columns={columns} dataSource={rooms?.content || []} loading={loading} rowKey="id" pagination={false} scroll={{ x: true }} />
			</div>

			{/* Pagination */}
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

			{/* Modal */}
			<Modal
				title={selectedRoom ? "Edit Room" : "Add Room"}
				visible={isModalVisible}
				onCancel={handleCancel}
				width="70%"
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="default" onClick={handleFormSubmit}>
						{selectedRoom ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical">
					<Row gutter={16}>
						<Col xs={24} sm={24} md={12} lg={12}>
							<Form.Item label="Room Number" name="roomNumber" rules={[{ required: true, message: "Please input room number" }]}>
								<Input prefix={<HomeOutlined />} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={24} md={12} lg={12}>
							<Form.Item label="Room Type" name="roomType" rules={[{ required: true, message: "Please input room type" }]}>
								<Input prefix={<KeyOutlined />} />
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col xs={24} sm={24} md={12} lg={12}>
							<Form.Item label="Unit" name="unitId" rules={[{ required: true, message: "Please select a unit" }]}>
								<Select placeholder="Select a Unit">
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
