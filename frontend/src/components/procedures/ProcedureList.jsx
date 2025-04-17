import React, { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, InputNumber, Space, Pagination, Spin, Select } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useProcedureStore } from "../../services/procedure.service";
import { useAuthStore } from "../../services/auth.service"; // Import useAuthStore

const { Option } = Select;

const ProcedureList = () => {
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
		// Check for READ_PROCEDURE before fetching, though ideally routing handles this
		// if (user && hasAuthority('READ_PROCEDURE')) {
		fetchProcedures();
		// } else {
		// Optionally handle unauthorized access here if needed
		// console.warn("User lacks READ_PROCEDURE permission.");
		// }
	}, [pagination, searchQuery, user]); // Add user dependency if check uncommented

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
			// Assuming the API enforces READ_PROCEDURE on the backend
			await searchProcedures(fetchParams);
		} catch (error) {
			console.error("fetchProcedures - Error:", error);
			// Handle potential 403 Forbidden errors if necessary
		} finally {
			setTableLoading(false);
		}
	};

	// Only show modal if the user has the relevant permission for the action
	const showAddModal = () => {
		if (user && hasAuthority("CREATE_PROCEDURE")) {
			setSelectedProcedure(null);
			form.resetFields(); // Reset fields for add
			form.setFieldsValue({ code: "", name: "", price: "" }); // Explicitly clear
			setIsModalVisible(true);
		} else {
			console.warn("User lacks CREATE_PROCEDURE permission.");
			// Optionally show a notification/message
		}
	};

	const showEditModal = (procedure) => {
		if (user && hasAuthority("UPDATE_PROCEDURE")) {
			setSelectedProcedure(procedure);
			form.setFieldsValue(procedure);
			setIsModalVisible(true);
		} else {
			console.warn("User lacks UPDATE_PROCEDURE permission.");
			// Optionally show a notification/message
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
				// Double check permission before submitting (though button disablement should prevent this)
				if (user && hasAuthority("UPDATE_PROCEDURE")) {
					await updateProcedure(selectedProcedure.id, values);
				} else {
					console.error("Attempted to update procedure without permission.");
					// Handle error, e.g., show message
					return; // Prevent further action
				}
			} else {
				// Double check permission before submitting
				if (user && hasAuthority("CREATE_PROCEDURE")) {
					await createProcedure(values);
				} else {
					console.error("Attempted to create procedure without permission.");
					// Handle error
					return; // Prevent further action
				}
			}
			await fetchProcedures(); // Refresh list
			handleCancel(); // Close modal and reset
		} catch (error) {
			// This catches form validation errors or API call errors
			console.error("handleFormSubmit - Error:", error.info || error);
		}
	};

	const handleDelete = async (procedureId) => {
		// Double check permission before attempting delete
		if (!user || !hasAuthority("DELETE_PROCEDURE")) {
			console.warn("User lacks DELETE_PROCEDURE permission.");
			// Optionally show a notification/message
			return;
		}
		// Consider adding a confirmation dialog here
		Modal.confirm({
			title: "Are you sure you want to delete this procedure?",
			content: "This action cannot be undone.",
			okText: "Yes, Delete",
			okType: "danger",
			cancelText: "No",
			onOk: async () => {
				try {
					setTableLoading(true); // Indicate loading during delete
					await deleteProcedure(procedureId);
					await fetchProcedures(); // Refresh list after successful delete
				} catch (error) {
					console.error("handleDelete - Error:", error);
					// Handle potential errors (e.g., show notification)
					setTableLoading(false); // Ensure loading stops on error
				}
			},
		});
	};

	const handleSearch = (e) => {
		const value = e.target.value;
		setSearchQuery(value);
		setPagination({ ...pagination, current: 1 }); // Reset to first page on new search
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
			render: (price) => (price ? price.toFixed(2) : "N/A"), // Basic price formatting
		},
		{
			title: "Actions",
			key: "actions",
			align: "right",
			render: (_, procedure) => (
				<Space size="small">
					{/* Edit Button: Visible only if user has UPDATE_PROCEDURE */}
					{user && hasAuthority("UPDATE_PROCEDURE") && (
						<Button icon={<EditOutlined />} onClick={() => showEditModal(procedure)} type="primary" />
					)}
					{/* Delete Button: Visible only if user has DELETE_PROCEDURE */}
					{user && hasAuthority("DELETE_PROCEDURE") && (
						<Button icon={<DeleteOutlined />} onClick={() => handleDelete(procedure.id)} type="primary" danger />
					)}
				</Space>
			),
		},
	];

	// Determine if the user can perform create or update for the modal save button
	const canSubmitModal = user && (selectedProcedure ? hasAuthority("UPDATE_PROCEDURE") : hasAuthority("CREATE_PROCEDURE"));

	// Optional: Prevent rendering the whole component if user lacks read permission
	// if (!user || !hasAuthority('READ_PROCEDURE')) {
	//     return <div>You do not have permission to view procedures.</div>;
	// }

	return (
		<div>
			<div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<Input
					placeholder="Search by code or name..."
					prefix={<SearchOutlined />}
					value={searchQuery}
					onChange={handleSearch}
					style={{ width: "300px" }}
					// Disable search if user cannot read? Not usually necessary as API enforces it.
					// disabled={!user || !hasAuthority('READ_PROCEDURE')}
				/>
				{/* Add Button: Visible only if user has CREATE_PROCEDURE */}
				{user && hasAuthority("CREATE_PROCEDURE") && (
					<Button type="primary" onClick={showAddModal}>
						Add New Procedure
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
					rowKey="id" // Ensure rowKey is set for stability
					pagination={false}
					loading={loading} // Use the store's loading state for initial load/fetch errors
					footer={() =>
						total > 0 && ( // Only show pagination if there's data
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
				title={selectedProcedure ? "Edit Procedure" : "Add Procedure"}
				open={isModalVisible}
				onCancel={handleCancel}
				destroyOnClose // Reset form state when modal is closed
				footer={[
					// Custom footer for better control
					<Button key="back" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" loading={loading} onClick={handleFormSubmit} disabled={!canSubmitModal}>
						{selectedProcedure ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical" name="procedureForm">
					<Form.Item name="code" label="Code" rules={[{ required: true, message: "Please input the code!" }]}>
						<Input disabled={!canSubmitModal} />
						{/* Disable fields if user cannot submit */}
					</Form.Item>
					<Form.Item name="name" label="Name" rules={[{ required: true, message: "Please input the name!" }]}>
						<Input disabled={!canSubmitModal} />
					</Form.Item>
					<Form.Item
						name="price"
						label="Price"
						rules={[
							{ required: true, message: "Please input the price!" },
							{ type: "number", message: "Price must be a number" },
						]}>
						<InputNumber style={{ width: "100%" }} min={0} precision={2} disabled={!canSubmitModal} />
					</Form.Item>
					{/* Removed the original Form.Item wrapping the buttons */}
				</Form>
			</Modal>
		</div>
	);
};

export default ProcedureList;
