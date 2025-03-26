import React, { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, InputNumber, Space, Pagination, Spin, Select } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useProcedureStore } from "../../services/procedure.service";

const { Option } = Select;

const ProcedureList = () => {
	const { procedures, loading, total, searchProcedures, deleteProcedure, createProcedure, updateProcedure } = useProcedureStore();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedProcedure, setSelectedProcedure] = useState(null);
	const [form] = Form.useForm();
	const [searchQuery, setSearchQuery] = useState("");
	const [tableLoading, setTableLoading] = useState(false);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
	});

	useEffect(() => {
		fetchProcedures();
	}, [pagination, searchQuery]);

	const fetchProcedures = async (params) => {
		const page = pagination?.current ? pagination.current - 1 : 0;
		const size = pagination?.pageSize ? pagination.pageSize : 10;
		const query = params?.searchQuery ? params.searchQuery : searchQuery;

		setTableLoading(true);
		try {
			const fetchParams = {
				page: page,
				size: size,
				query: query,
			};

			await searchProcedures(fetchParams);
		} catch (error) {
			console.error("fetchProcedures - Error:", error);
		} finally {
			setTableLoading(false);
		}
	};

	const showModal = (procedure) => {
		setSelectedProcedure(procedure);
		form.setFieldsValue(procedure || { code: "", name: "", price: "" });
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedProcedure(null);
		form.resetFields();
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			if (selectedProcedure) {
				await updateProcedure(selectedProcedure.id, values);
			} else {
				await createProcedure(values);
			}
			await fetchProcedures();
			setIsModalVisible(false);
			setSelectedProcedure(null);
			form.resetFields();
		} catch (error) {
			console.error("handleFormSubmit - Error:", error);
		}
	};

	const handleDelete = async (procedureId) => {
		try {
			await deleteProcedure(procedureId);
			await fetchProcedures();
		} catch (error) {
			console.error("handleDelete - Error:", error);
		}
	};

	const handleSearch = (e) => {
		const value = e.target.value;
		setSearchQuery(value);
		setPagination({ ...pagination, current: 1 });
	};

	const handleTableChange = (page, pageSize) => {
		setPagination({ current: page, pageSize });
	};

	const columns = [
		{
			title: "Code",
			dataIndex: "code",
			key: "code",
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
		},
		{
			title: "Actions",
			key: "actions",
			align: "right",
			render: (_, procedure) => (
				<Space size="small">
					<Button icon={<EditOutlined />} onClick={() => showModal(procedure)} type="primary" />
					<Button icon={<DeleteOutlined />} onClick={() => handleDelete(procedure.id)} type="primary" danger />
				</Space>
			),
		},
	];

	return (
		<div>
			<div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<Input
					placeholder="Search by code or name..."
					prefix={<SearchOutlined />}
					value={searchQuery}
					onChange={handleSearch}
					style={{ width: "300px" }}
				/>
				<Button type="primary" onClick={() => showModal(null)}>
					Add New Procedure
				</Button>
			</div>
			{tableLoading ? (
				<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
					<Spin size="large" />
				</div>
			) : (
				<Table
					columns={columns}
					dataSource={procedures}
					pagination={false}
					loading={loading}
					footer={() => (
						<Pagination
							current={pagination.current}
							pageSize={pagination.pageSize}
							total={total}
							onChange={handleTableChange}
							pageSizeOptions={[10, 20, 50]}
							showSizeChanger
							style={{ textAlign: "right", marginTop: "10px" }}
						/>
					)}
				/>
			)}

			<Modal title={selectedProcedure ? "Edit Procedure" : "Add Procedure"} open={isModalVisible} onCancel={handleCancel} footer={null}>
				<Form form={form} onFinish={handleFormSubmit} layout="vertical">
					<Form.Item name="code" label="Code" rules={[{ required: true, message: "Please input the code!" }]}>
						<Input />
					</Form.Item>
					<Form.Item name="name" label="Name" rules={[{ required: true, message: "Please input the name!" }]}>
						<Input />
					</Form.Item>
					<Form.Item name="price" label="Price" rules={[{ required: true, message: "Please input the price!" }]}>
						<InputNumber style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item>
						<div style={{ display: "flex", justifyContent: "flex-end" }}>
							<Button onClick={handleCancel} style={{ marginRight: 8 }}>
								Cancel
							</Button>
							<Button type="primary" htmlType="submit">
								{selectedProcedure ? "Update" : "Save"}
							</Button>
						</div>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default ProcedureList;
