import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, Select, InputNumber } from "antd";
import { useMedicationStore } from "../../services/medication.service";
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";

const { Title } = Typography;
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
	const [calculatedPrice, setCalculatedPrice] = useState(null);
	const [pricingUnit, setPricingUnit] = useState("PER_MG");
	const [amountPerUnit, setAmountPerUnit] = useState(1);

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
			form.setFieldsValue(medication);
			setPricingUnit(medication.pricingUnit);
			setAmountPerUnit(medication.amountPerUnit);
			calculatePrice();
		} else {
			form.resetFields();
			setPricingUnit("PER_MG");
			setAmountPerUnit(1);
			setCalculatedPrice(null);
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
		} catch (error) {
			console.log("error in handle form submit", error);
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
		calculatePrice();
	};

	const onAmountPerUnitChange = (event) => {
		const value = parseFloat(event.target.value);
		setAmountPerUnit(value);
		calculatePrice();
	};

	const calculatePrice = () => {
		try {
			const price = form.getFieldValue("price");

			if (price && amountPerUnit) {
				const calculated = parseFloat(price) * amountPerUnit;
				setCalculatedPrice(calculated.toFixed(2)); // Format to 2 decimal places
			} else {
				setCalculatedPrice(null);
			}
		} catch (error) {
			setCalculatedPrice(null);
		}
	};

	const onPriceChange = (event) => {
		calculatePrice();
	};

	const calculateDisplayPrice = (medication) => {
		try {
			if (medication && medication.price && medication.amountPerUnit) {
				const price = parseFloat(medication.price);
				const amountPerUnit = parseFloat(medication.amountPerUnit);

				const calculated = price * amountPerUnit;

				return calculated.toFixed(2); // Format to 2 decimal places
			}
		} catch (error) {
			return "N/A";
		}

		return "N/A";
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
			render: (text, record) => calculateDisplayPrice(record),
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
					<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
						Edit
					</Button>
					<Button type="primary" icon={<PlusOutlined />} onClick={() => showStockModal(record, "increase")}>
						Increase Stock
					</Button>
					<Button type="primary" icon={<MinusOutlined />} onClick={() => showStockModal(record, "decrease")}>
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
		<div style={{ padding: 20 }}>
			<Title level={2}>Medication List</Title>
			<Space style={{ marginBottom: 16 }}>
				<Input.Search placeholder="Search by name..." onSearch={handleSearch} style={{ width: 300 }} />
				<Button type="primary" onClick={() => showModal(null)}>
					Add New Medication
				</Button>
			</Space>
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
			<Modal
				title={selectedMedication ? "Edit Medication" : "Add Medication"}
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleFormSubmit}>
						{selectedMedication ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical">
					<Form.Item label="Name" name="name" rules={[{ required: true, message: "Please input name" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Dosage" name="dosage" rules={[{ required: true, message: "Please input dosage" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Stock" name="stock" rules={[{ required: true, message: "Please input stock" }]}>
						<Input type="number" />
					</Form.Item>
					<Form.Item label="Pricing Unit" name="pricingUnit" rules={[{ required: true, message: "Please input pricing unit" }]}>
						<Select value={pricingUnit} onChange={onPriceUnitChange}>
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
					<Form.Item label="Price" name="price" rules={[{ required: true, message: "Please input price" }]}>
						<Input type="number" onChange={onPriceChange} />
					</Form.Item>
					<Form.Item label={`The price is ${form.getFieldValue("price") || 0 + " Pounds"}  per ${pricingUnit} `}></Form.Item>
					<Form.Item label="Image URL" name="imageURL" rules={[{ required: true, message: "Please input Image URL" }]}>
						<Input />
					</Form.Item>

					<Form.Item
						label={`And this unit has ${amountPerUnit} ${pricingUnit} in it`}
						name="amountPerUnit"
						rules={[{ required: true, message: "Please input amount per unit" }]}>
						<Input type="number" onChange={onAmountPerUnitChange} />
					</Form.Item>

					{calculatedPrice !== null && <Form.Item label={`Calculated price: ${calculatedPrice}` + " Pounds"}></Form.Item>}
				</Form>
			</Modal>

			<Modal
				title={`Change Stock`}
				visible={isStockModalVisible}
				onCancel={handleStockModalCancel}
				footer={[
					<Button key="cancel" onClick={handleStockModalCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleStockChangeSubmit}>
						{stockChangeType === "increase" ? "Increase" : "Decrease"}
					</Button>,
				]}>
				<Form layout="vertical">
					<Form.Item label={`Select Quantity to ${stockChangeType}`} name="stockChangeQuantity">
						<InputNumber type="number" value={stockChangeQuantity} onChange={(value) => setStockChangeQuantity(value)} min={0} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default MedicationList;
