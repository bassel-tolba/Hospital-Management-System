import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, Select, Pagination } from "antd";
import { useRoomStore } from "../../services/room.service";
import { useUnitStore } from "../../services/unit.service";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

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
			console.log("error in handle form submit", error);
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
		},
		{
			title: "Room Type",
			dataIndex: "roomType",
			key: "roomType",
		},
		{
			title: "Unit",
			dataIndex: "unitId",
			key: "unitId",
			render: (unitId) => {
				const unit = units?.find((unit) => unit.id === unitId);
				return unit ? unit.name : "N/A";
			},
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
						Edit
					</Button>
					<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
						Delete
					</Button>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 20 }}>
			<Title level={2}>Room List</Title>
			<Space style={{ marginBottom: 16 }}>
				<Input.Search placeholder="Search by room number or room type..." onSearch={handleSearch} style={{ width: 300 }} />
				<Select placeholder="Select a Unit" style={{ width: 200 }} onChange={handleUnitChange} allowClear>
					{units?.map((unit) => (
						<Option key={unit.id} value={unit.id}>
							{unit.name}
						</Option>
					))}
				</Select>

				<Button type="primary" onClick={() => showModal(null)}>
					Add New Room
				</Button>
			</Space>
			<Table
				columns={columns}
				// Use optional chaining to prevent error if rooms is not defined
				dataSource={rooms?.content || []}
				loading={loading}
				rowKey="id"
				pagination={false}
			/>
			<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
				<Pagination
					current={page}
					pageSize={size}
					total={total}
					onChange={handlePageChange}
					onShowSizeChange={handlePageSizeChange}
					showSizeChanger
					showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
				/>
			</div>
			<Modal
				title={selectedRoom ? "Edit Room" : "Add Room"}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleFormSubmit}>
						{selectedRoom ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical">
					<Form.Item label="Room Number" name="roomNumber" rules={[{ required: true, message: "Please input room number" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Room Type" name="roomType" rules={[{ required: true, message: "Please input room type" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Unit" name="unitId" rules={[{ required: true, message: "Please select a unit" }]}>
						<Select placeholder="Select a Unit">
							{units?.map((unit) => (
								<Option key={unit.id} value={unit.id}>
									{unit.name}
								</Option>
							))}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default RoomList;
