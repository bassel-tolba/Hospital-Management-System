import React, { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, InputNumber, Space, Pagination, Spin, Select } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useProcedureStore } from "../../services/procedure.service";
import { useAuthStore } from "../../services/auth.service"; // Import useAuthStore
import { useTranslation } from "react-i18next"; // Import useTranslation

const { Option } = Select; // Keep if needed, though not used in this specific file's visible code

const ProcedureList = () => {
	const { t } = useTranslation(); // Initialize translation function
	const { procedures, loading, total, searchProcedures, deleteProcedure, createProcedure, updateProcedure } = useProcedureStore();
	const { user, hasAuthority } = useAuthStore(); // Use the auth hook
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
	}, [pagination, searchQuery, user]);

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

	const showAddModal = () => {
		if (user && hasAuthority("CREATE_PROCEDURE")) {
			setSelectedProcedure(null);
			form.resetFields();
			form.setFieldsValue({ code: "", name: "", price: "" });
			setIsModalVisible(true);
		} else {
			console.warn("User lacks CREATE_PROCEDURE permission.");
			// Consider message.error(t('permission-denied-create-procedure'));
		}
	};

	const showEditModal = (procedure) => {
		if (user && hasAuthority("UPDATE_PROCEDURE")) {
			setSelectedProcedure(procedure);
			form.setFieldsValue(procedure);
			setIsModalVisible(true);
		} else {
			console.warn("User lacks UPDATE_PROCEDURE permission.");
			// Consider message.error(t('permission-denied-update-procedure'));
		}
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
				if (user && hasAuthority("UPDATE_PROCEDURE")) {
					await updateProcedure(selectedProcedure.id, values);
				} else {
					console.error("Attempted to update procedure without permission.");
					return;
				}
			} else {
				if (user && hasAuthority("CREATE_PROCEDURE")) {
					await createProcedure(values);
				} else {
					console.error("Attempted to create procedure without permission.");
					return;
				}
			}
			await fetchProcedures();
			handleCancel();
		} catch (error) {
			console.error("handleFormSubmit - Error:", error.info || error);
		}
	};

	const handleDelete = async (procedureId) => {
		if (!user || !hasAuthority("DELETE_PROCEDURE")) {
			console.warn("User lacks DELETE_PROCEDURE permission.");
			// Consider message.error(t('permission-denied-delete-procedure'));
			return;
		}
		Modal.confirm({
			title: t("delete-procedure-confirm-title"),
			content: t("delete-procedure-confirm-content"),
			okText: t("delete-procedure-confirm-ok"),
			okType: "danger",
			cancelText: t("delete-procedure-confirm-cancel"),
			onOk: async () => {
				try {
					setTableLoading(true);
					await deleteProcedure(procedureId);
					await fetchProcedures();
				} catch (error) {
					console.error("handleDelete - Error:", error);
					// Consider message.error(t('delete-procedure-failed'));
					setTableLoading(false);
				}
			},
		});
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
			title: t("procedure-column-code"),
			dataIndex: "code",
			key: "code",
		},
		{
			title: t("procedure-column-name"),
			dataIndex: "name",
			key: "name",
		},
		{
			title: t("procedure-column-price"),
			dataIndex: "price",
			key: "price",
			render: (price) => (price ? price.toFixed(2) : t("not-applicable")), // Added translation for N/A
		},
		{
			title: t("procedure-column-actions"),
			key: "actions",
			align: "right",
			render: (_, procedure) => (
				<Space size="small">
					{user && hasAuthority("UPDATE_PROCEDURE") && (
						<Button icon={<EditOutlined />} onClick={() => showEditModal(procedure)} type="primary" />
					)}
					{user && hasAuthority("DELETE_PROCEDURE") && (
						<Button icon={<DeleteOutlined />} onClick={() => handleDelete(procedure.id)} type="primary" danger />
					)}
				</Space>
			),
		},
	];

	const canSubmitModal = user && (selectedProcedure ? hasAuthority("UPDATE_PROCEDURE") : hasAuthority("CREATE_PROCEDURE"));

	// Optional: Prevent rendering the whole component if user lacks read permission
	// if (!user || !hasAuthority('READ_PROCEDURE')) {
	//     return <div>{t('permission-denied-view-procedures')}</div>;
	// }

	return (
		<div>
			<div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<Input
					placeholder={t("search-procedures-placeholder")}
					prefix={<SearchOutlined />}
					value={searchQuery}
					onChange={handleSearch}
					style={{ width: "300px" }}
				/>
				{user && hasAuthority("CREATE_PROCEDURE") && (
					<Button type="primary" onClick={showAddModal}>
						{t("add-new-procedure-button")}
					</Button>
				)}
			</div>
			{tableLoading ? (
				<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
					<Spin size="large" />
				</div>
			) : (
				<Table
					columns={columns}
					dataSource={procedures}
					rowKey="id"
					pagination={false}
					loading={loading}
					footer={() =>
						total > 0 && (
							<Pagination
								current={pagination.current}
								pageSize={pagination.pageSize}
								total={total}
								onChange={handleTableChange}
								pageSizeOptions={[10, 20, 50]}
								showSizeChanger
								style={{ textAlign: "right", marginTop: "10px" }}
							/>
						)
					}
				/>
			)}

			<Modal
				title={selectedProcedure ? t("edit-procedure-modal-title") : t("add-procedure-modal-title")}
				open={isModalVisible}
				onCancel={handleCancel}
				destroyOnClose
				footer={[
					<Button key="back" onClick={handleCancel}>
						{t("modal-button-cancel")}
					</Button>,
					<Button key="submit" type="primary" loading={loading} onClick={handleFormSubmit} disabled={!canSubmitModal}>
						{selectedProcedure ? t("modal-button-update") : t("modal-button-save")}
					</Button>,
				]}>
				<Form form={form} layout="vertical" name="procedureForm">
					<Form.Item name="code" label={t("form-label-code")} rules={[{ required: true, message: t("form-validation-code-required") }]}>
						<Input disabled={!canSubmitModal} />
					</Form.Item>
					<Form.Item name="name" label={t("form-label-name")} rules={[{ required: true, message: t("form-validation-name-required") }]}>
						<Input disabled={!canSubmitModal} />
					</Form.Item>
					<Form.Item
						name="price"
						label={t("form-label-price")}
						rules={[
							{ required: true, message: t("form-validation-price-required") },
							{ type: "number", message: t("form-validation-price-must-be-number") },
						]}>
						<InputNumber style={{ width: "100%" }} min={0} precision={2} disabled={!canSubmitModal} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default ProcedureList;
