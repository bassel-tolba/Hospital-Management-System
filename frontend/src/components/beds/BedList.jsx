import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, Select, Pagination } from "antd";
import { useBedStore } from "../../services/bed.service";
import { useRoomStore } from "../../services/room.service";
import { useUnitStore } from "../../services/unit.service";
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

	useEffect(() => {
		fetchAllUnits();
	}, [fetchAllUnits]);

	useEffect(() => {
		fetchAllRooms();
	}, [fetchAllRooms]);

	useEffect(() => {
		fetchBeds();
	}, [page, size, searchParams]);
	const fetchBeds = async () => {
		setLoading(true);
		await searchBeds({ ...searchParams, page, size });
		setLoading(false);
	};
	useEffect(() => {
		if (rooms && rooms.content) {
			// Check if rooms and rooms.content exist
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
			console.log(values);
			const { unitId, ...bedData } = values;
			if (selectedBed) {
				await updateBed(selectedBed.id, bedData);
			} else {
				await createBed(bedData);
			}
			fetchBeds();
			setIsModalVisible(false);
			setSelectedBed(null);
			form.resetFields();
			setSelectedUnit(null);
			setFilteredRooms([]);
		} catch (error) {
			console.log("error in handle form submit", error);
		}
	};

	const handleDelete = async (bedId) => {
		try {
			await deleteBed(bedId);
			fetchBeds();
		} catch (error) {
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
		setSearchParams({ ...searchParams, unitId: unitId });
		setPage(0);
		setSelectedUnit(unitId);
	};
	const handleFreeExpiredBeds = async () => {
		try {
			await freeAllExpiredBeds();
			fetchBeds();
		} catch (error) {
			console.error("Error in free expired beds:", error);
		}
	};
	const columns = [
		{
			title: "Bed Number",
			dataIndex: "bedNumber",
			key: "bedNumber",
		},
		{
			title: "Is Occupied",
			dataIndex: "occupied",
			key: "isOccupied",
			render: (isOccupied) => (isOccupied ? "Yes" : "No"),
		},

		{
			title: "Room",
			dataIndex: "roomId",
			key: "roomId",
			render: (roomId) => {
				const room = rooms?.content?.find((room) => room.id === roomId);
				return room ? room.roomNumber : "N/A";
			},
		},
		{
			title: "Unit",
			dataIndex: "roomId",
			key: "unit",
			render: (roomId) => {
				const room = rooms?.content?.find((room) => room.id === roomId);
				if (room) {
					const unit = units?.find((unit) => unit.id === room?.unitId);
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
			<Title level={2}>Bed List</Title>
			<Space style={{ marginBottom: 16 }}>
				<Input.Search placeholder="Search by bed number..." onSearch={handleSearch} style={{ width: 300 }} />
				<Select placeholder="Select a Room" style={{ width: 200 }} onChange={handleRoomChange} disabled={!selectedUnit} allowClear>
					{tableFilteredRooms?.map((room) => (
						<Option key={room.id} value={room.id}>
							{room.roomNumber}
						</Option>
					))}
				</Select>
				<Select placeholder="Select a Unit" style={{ width: 200 }} onChange={handleUnitChange} allowClear>
					{units?.map((unit) => (
						<Option key={unit.id} value={unit.id}>
							{unit.name}
						</Option>
					))}
				</Select>
				<Button type="primary" onClick={() => showModal(null)}>
					Add New Bed
				</Button>
				<Button type="primary" onClick={handleFreeExpiredBeds}>
					Free Expired Beds
				</Button>
			</Space>
			<Table columns={columns} dataSource={beds} loading={loading} rowKey="id" pagination={false} />
			<Pagination
				current={page + 1}
				pageSize={size}
				total={totalElements}
				onChange={handlePaginationChange}
				style={{ marginTop: 20, textAlign: "center" }}
				showSizeChanger
			/>
			<Modal
				title={selectedBed ? "Edit Bed" : "Add Bed"}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleFormSubmit}>
						{selectedBed ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical">
					<Form.Item label="Unit" name="unitId" rules={[{ required: true, message: "Please select a unit" }]}>
						<Select placeholder="Select a Unit" onChange={handleUnitChangeModal} value={selectedUnit}>
							{units?.map((unit) => (
								<Option key={unit.id} value={unit.id}>
									{unit.name}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item label="Room" name="roomId" rules={[{ required: true, message: "Please select a room" }]}>
						<Select placeholder="Select a Room" disabled={!selectedUnit}>
							{filteredRooms?.map((room) => (
								<Option key={room.id} value={room.id}>
									{room.roomNumber}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item label="Bed Number" name="bedNumber" rules={[{ required: true, message: "Please input bed number" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Is Occupied" name="occupied" rules={[{ required: true, message: "Please select availability" }]}>
						<Select>
							<Option value={true}>Yes</Option>
							<Option value={false}>No</Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default BedList;
