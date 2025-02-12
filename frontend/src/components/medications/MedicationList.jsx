import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, Select, InputNumber, Row, Col, Alert } from "antd";
import { useMedicationStore } from "../../services/medication.service";
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const MedicationList = () => {
	const {
		medications,
		loading,
		total,
		searchMedications,
		deleteMedication,
		createMedication,
		updateMedication,
		setLoading,
		increaseStock,
		decreaseStock,
	} = useMedicationStore();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isStockModalVisible, setIsStockModalVisible] = useState(false);
	const [selectedMedication, setSelectedMedication] = useState(null);
	const [stockChangeType, setStockChangeType] = useState(null);
	const [stockChangeQuantity, setStockChangeQuantity] = useState(0);
	const [form] = Form.useForm();
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const [pricingUnit, setPricingUnit] = useState("PER_MG"); // Default value
	const [price, setPrice] = useState(0);
	const [amountPerUnit, setAmountPerUnit] = useState(1);
	const [message, setMessage] = useState("");

	useEffect(() => {
		fetchMedications();
	}, [page, size, searchParams]);

	const fetchMedications = async () => {
		setLoading(true);
		await searchMedications({ ...searchParams, page, size });
		setLoading(false);
	};

	const showModal = (medication) => {
		setSelectedMedication(medication);
		if (medication) {
			// Editing existing medication
			form.setFieldsValue(medication);
			setPricingUnit(medication.pricingUnit);
			setPrice(medication.price);
			setAmountPerUnit(medication.amountPerUnit);
		} else {
			// Adding a new medication
			form.resetFields();
			setPricingUnit("PER_MG");
			setPrice(0);
			setAmountPerUnit(1);
		}
		setIsModalVisible(true);
	};

	const showStockModal = (medication, type) => {
		setSelectedMedication(medication);
		setStockChangeType(type);
		setStockChangeQuantity(0);
		setIsStockModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedMedication(null);
		form.resetFields();
		setMessage(""); // Clear the message
	};

	const handleStockModalCancel = () => {
		setIsStockModalVisible(false);
		setSelectedMedication(null);
		setStockChangeQuantity(0);
		setStockChangeType(null);
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			if (selectedMedication) {
				await updateMedication(selectedMedication.id, values);
			} else {
				await createMedication(values);
			}
			fetchMedications();
			setIsModalVisible(false);
			setSelectedMedication(null);
			form.resetFields();
			setMessage(""); // Clear the message
		} catch (error) {
			console.log("Error submitting form:", error);
		}
	};

	const handleStockChangeSubmit = async () => {
		try {
			if (stockChangeType === "increase") {
				await increaseStock(selectedMedication.id, stockChangeQuantity);
			} else if (stockChangeType === "decrease") {
				await decreaseStock(selectedMedication.id, stockChangeQuantity);
			}
			fetchMedications();
			setIsStockModalVisible(false);
			setSelectedMedication(null);
			setStockChangeQuantity(0);
			setStockChangeType(null);
		} catch (error) {
			console.error("Error changing stock:", error);
		}
	};

	const handleDelete = async (medicationId) => {
		try {
			await deleteMedication(medicationId);
			fetchMedications();
		} catch (error) {
			console.error("Error deleting medication:", error);
		}
	};

	const handleSearch = (value) => {
		setSearchParams({ ...searchParams, searchTerm: value });
		setPage(0);
	};

	const handleTableChange = (pagination) => {
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	const onPriceUnitChange = (value) => {
		setPricingUnit(value);
	};

	const onPriceChange = (value) => {
		setPrice(value);
		updateMessage();
	};

	const onAmountPerUnitChange = (value) => {
		setAmountPerUnit(value);
		updateMessage();
	};

	const getCalculatedPrice = () => {
		if (price && amountPerUnit) {
			return (price * amountPerUnit).toFixed(2);
		}
		return "0.00";
	};

	const updateMessage = () => {
		const name = form.getFieldValue("name");
		const dosage = form.getFieldValue("dosage");
		const unit = pricingUnit;
		const numberOfUnits = amountPerUnit;
		const unitPrice = price;
		const totalPrice = getCalculatedPrice();

		const newMessage = `You are adding/editing a medicine named ${name} that has a dosage of ${dosage} and has ${numberOfUnits} ${unit} with a price of ${unitPrice} per ${unit} and a total price of ${totalPrice}.`;

		setMessage(newMessage);
	};

	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Dosage",
			dataIndex: "dosage",
			key: "dosage",
		},
		{
			title: "Price",
			key: "price",
			render: (text, record) => (
				<Text strong style={{ color: "#1890ff" }}>
					{record.price * record.amountPerUnit} Pounds
				</Text>
			),
		},
		{
			title: "Stock",
			key: "stock",
			dataIndex: "stock",
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record)}>
						Edit
					</Button>
					<Button type="default" icon={<PlusOutlined />} onClick={() => showStockModal(record, "increase")}>
						Increase Stock
					</Button>
					<Button type="default" icon={<MinusOutlined />} onClick={() => showStockModal(record, "decrease")}>
						Decrease Stock
					</Button>
					<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
						Delete
					</Button>
				</Space>
			),
		},
	];

	return (
		<div className="main-container" style={{ padding: 20 }}>
			<Title level={2}>Medication List</Title>

			{/* Responsive Search and Add Button */}
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={18}>
					<Input.Search placeholder="Search by name..." onSearch={handleSearch} style={{ width: "100%" }} />
				</Col>
				<Col xs={24} sm={6}>
					<Button type="default" block onClick={() => showModal(null)}>
						Add New Medication
					</Button>
				</Col>
			</Row>

			{/* Scrollable Table */}
			<div style={{ overflowX: "auto", margin: "0 -16px" }}>
				<Table
					columns={columns}
					dataSource={medications}
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

			{/* Responsive Modal */}
			<Modal
				title={selectedMedication ? "Edit Medication" : "Add Medication"}
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="default" onClick={handleFormSubmit}>
						{selectedMedication ? "Update" : "Save"}
					</Button>,
				]}
				width="70%">
				<Form form={form} layout="vertical">
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Name" name="name" rules={[{ required: true, message: "Please input name" }]}>
								<Input onChange={updateMessage} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Dosage" name="dosage" rules={[{ required: true, message: "Please input dosage" }]}>
								<Input onChange={updateMessage} />
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Stock" name="stock" rules={[{ required: true, message: "Please input stock" }]}>
								<Input type="number" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Pricing Unit" name="pricingUnit" rules={[{ required: true, message: "Please input pricing unit" }]}>
								<Select
									value={pricingUnit}
									onChange={(e) => {
										onPriceUnitChange(e);
										updateMessage();
									}}>
									{" "}
									{/* Show selected unit */}
									<Option value="PER_MG">PER_MG</Option>
									<Option value="PER_ML">PER_ML</Option>
									<Option value="PER_DOSE">PER_DOSE</Option>
									<Option value="PER_VIAL">PER_VIAL</Option>
									<Option value="PER_UNIT">PER_UNIT</Option>
									<Option value="PER_PEN">PER_PEN</Option>
									<Option value="PER_GRAM">PER_GRAM</Option>
									<Option value="PER_TABLET">PER_TABLET</Option>
									<Option value="PER_CAPSULE">PER_CAPSULE</Option>
									<Option value="PER_PATCH">PER_PATCH</Option>
									<Option value="PER_INHALER">PER_INHALER</Option>
									<Option value="PER_BOX">PER_BOX</Option>
									<Option value="PER_PACK">PER_PACK</Option>
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Price" name="price" rules={[{ required: true, message: "Please input price" }]}>
								<Input type="number" value={price} onChange={(e) => onPriceChange(e.target.value)} />
							</Form.Item>
						</Col>
						{/* <Col xs={24} sm={12}>
							<Alert
								message={`The price is ${price || 0} Pounds per ${pricingUnit}`}
								type="info"
								style={{ marginBottom: 0 }}
								showIcon
							/>
						</Col> */}
					</Row>

					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item label="Image URL" name="imageURL" rules={[{ required: true, message: "Please input Image URL" }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item
								label={`And this unit has ${amountPerUnit} ${pricingUnit} in it`}
								name="amountPerUnit"
								rules={[{ required: true, message: "Please input amount per unit" }]}>
								<Input type="number" value={amountPerUnit} onChange={(e) => onAmountPerUnitChange(e.target.value)} />
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24}>
							<Alert message={message} type="info" showIcon />
						</Col>
					</Row>
				</Form>
			</Modal>

			{/* Stock Change Modal */}
			<Modal
				title={`Change Stock`}
				visible={isStockModalVisible}
				onCancel={handleStockModalCancel}
				footer={[
					<Button key="cancel" onClick={handleStockModalCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="default" onClick={handleStockChangeSubmit}>
						{stockChangeType === "increase" ? "Increase" : "Decrease"}
					</Button>,
				]}
				width="70%">
				<Form layout="vertical">
					<Row gutter={16}>
						<Col xs={24}>
							<Form.Item label={`Select Quantity to ${stockChangeType}`} name="stockChangeQuantity">
								<InputNumber
									type="number"
									value={stockChangeQuantity}
									onChange={(value) => setStockChangeQuantity(value)}
									min={0}
									style={{ width: "100%" }}
								/>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default MedicationList;
