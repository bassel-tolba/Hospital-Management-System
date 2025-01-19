import React, { useState, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	TextField,
	Button,
	Box,
	Typography,
	Modal,
	FormControl,
	InputLabel,
	Input,
	IconButton,
	CircularProgress,
	Stack,
	MenuItem,
} from "@mui/material";
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useProcedureStore } from "../../services/procedure.service";

const ProcedureList = () => {
	const { procedures, loading, total, searchProcedures, deleteProcedure, createProcedure, updateProcedure } = useProcedureStore();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedProcedure, setSelectedProcedure] = useState(null);
	const [formValues, setFormValues] = useState({
		code: "",
		name: "",
		price: "",
	});

	const [searchQuery, setSearchQuery] = useState("");
	const [tableLoading, setTableLoading] = useState(false);

	// Use a single object to manage pagination
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
	});

	// This useEffect hook will run when `pagination` or `searchQuery` state changes
	useEffect(() => {
		console.log("useEffect triggered - pagination or searchQuery changed", {
			pagination,
			searchQuery,
		});
		fetchProcedures();
	}, [pagination, searchQuery]);

	// Updated Fetch Procedures method, will set params if a call is made to component
	const fetchProcedures = async (params) => {
		const page = pagination?.current ? pagination.current - 1 : 0;
		const size = pagination?.pageSize ? pagination.pageSize : 10;
		const query = params?.searchQuery ? params.searchQuery : searchQuery;

		console.log("fetchProcedures - Start", {
			pagination,
			searchQuery,
			params,
		});
		setTableLoading(true);
		try {
			const fetchParams = {
				page: page,
				size: size,
				query: query,
			};
			console.log("fetchProcedures - Request Params", fetchParams);
			const result = await searchProcedures(fetchParams);
			console.log("fetchProcedures - Response:", result);
		} catch (error) {
			console.error("fetchProcedures - Error:", error);
		} finally {
			setTableLoading(false);
			console.log("fetchProcedures - Finally", { loading });
		}
	};

	const showModal = (procedure) => {
		console.log("showModal - Start", { procedure });
		setSelectedProcedure(procedure);
		setFormValues(procedure || { code: "", name: "", price: "" });
		setIsModalVisible(true);
		console.log("showModal - End", { selectedProcedure, isModalVisible });
	};

	const handleCancel = () => {
		console.log("handleCancel - Start");
		setIsModalVisible(false);
		setSelectedProcedure(null);
		setFormValues({ code: "", name: "", price: "" });
		console.log("handleCancel - End", { selectedProcedure, isModalVisible });
	};

	const handleFormSubmit = async () => {
		console.log("handleFormSubmit - Start");
		try {
			console.log("handleFormSubmit - Form Values", formValues);
			if (selectedProcedure) {
				console.log("handleFormSubmit - Updating Procedure", selectedProcedure.id);
				await updateProcedure(selectedProcedure.id, formValues);
			} else {
				console.log("handleFormSubmit - Creating Procedure", formValues);
				await createProcedure(formValues);
			}
			await fetchProcedures();
			setIsModalVisible(false);
			setFormValues({ code: "", name: "", price: "" });
			setSelectedProcedure(null);
			console.log("handleFormSubmit - Success", {
				selectedProcedure,
				isModalVisible,
			});
		} catch (error) {
			console.error("handleFormSubmit - Error:", error);
		}
	};

	const handleDelete = async (procedureId) => {
		console.log("handleDelete - Start", { procedureId });
		try {
			await deleteProcedure(procedureId);
			await fetchProcedures();
			console.log("handleDelete - Success");
		} catch (error) {
			console.error("handleDelete - Error:", error);
		}
	};

	const handleSearch = (event) => {
		const value = event.target.value;
		console.log("handleSearch - Start", { value, pagination });
		setSearchQuery(value);
		setPagination({ ...pagination, current: 1 }); // Reset to first page
		console.log("handleSearch - End", { pagination, searchQuery });
	};

	const handleTableChange = (event, value) => {
		console.log("handleTableChange - Start", { pagination, value });
		setPagination(value);
		console.log("handleTableChange - End", { pagination });
	};

	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setFormValues({ ...formValues, [name]: value });
	};

	const columns = [
		{
			id: "code",
			label: "Code",
		},
		{
			id: "name",
			label: "Name",
		},
		{
			id: "price",
			label: "Price",
		},
		{
			id: "actions",
			label: "Actions",
			align: "right",
		},
	];

	return (
		<Box sx={{ padding: 2 }}>
			<Typography variant="h4" gutterBottom>
				Procedure List
			</Typography>
			<Stack direction="row" spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
				<TextField label="Search by code or name..." variant="outlined" size="small" value={searchQuery} onChange={handleSearch} />
				<Button variant="contained" onClick={() => showModal(null)}>
					Add New Procedure
				</Button>
			</Stack>
			{tableLoading ? (
				<Box display="flex" justifyContent="center" alignItems="center">
					<CircularProgress size={50} />
				</Box>
			) : (
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								{columns.map((column) => (
									<TableCell key={column.id} align={column.align}>
										{column.label}
									</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{procedures.map((procedure) => (
								<TableRow key={procedure.id}>
									<TableCell>{procedure.code}</TableCell>
									<TableCell>{procedure.name}</TableCell>
									<TableCell>{procedure.price}</TableCell>
									<TableCell align="right">
										<IconButton onClick={() => showModal(procedure)}>
											<EditIcon />
										</IconButton>
										<IconButton onClick={() => handleDelete(procedure.id)}>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<Box display="flex" justifyContent="flex-end" p={2}>
						<Button
							size="small" // Added size="small" to the buttons
							disabled={pagination.current === 1}
							onClick={(e) =>
								handleTableChange(e, {
									...pagination,
									current: Math.max(1, pagination.current - 1),
								})
							}>
							Previous
						</Button>
						<Typography variant="body2" mx={1}>
							Page: {pagination.current}
						</Typography>
						<Button
							size="small" // Added size="small" to the buttons
							disabled={procedures.length < pagination.pageSize}
							onClick={(e) =>
								handleTableChange(e, {
									...pagination,
									current: pagination.current + 1,
								})
							}>
							Next
						</Button>
						<TextField
							select
							label="Page Size"
							value={pagination.pageSize}
							onChange={(e) =>
								handleTableChange(e, {
									...pagination,
									pageSize: parseInt(e.target.value, 10),
								})
							}
							sx={{ marginLeft: 2, width: "120px" }}>
							{[10, 20, 50].map((size) => (
								<MenuItem key={size} value={size}>
									{size}
								</MenuItem>
							))}
						</TextField>
					</Box>
				</TableContainer>
			)}
			<Modal open={isModalVisible} onClose={handleCancel}>
				<Box
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: 400,
						bgcolor: "background.paper",
						boxShadow: 24,
						p: 4,
					}}>
					<Typography variant="h6" gutterBottom>
						{selectedProcedure ? "Edit Procedure" : "Add Procedure"}
					</Typography>
					<FormControl fullWidth margin="normal">
						<InputLabel>Code</InputLabel>
						<Input name="code" value={formValues.code} onChange={handleInputChange} />
					</FormControl>
					<FormControl fullWidth margin="normal">
						<InputLabel>Name</InputLabel>
						<Input name="name" value={formValues.name} onChange={handleInputChange} />
					</FormControl>
					<FormControl fullWidth margin="normal">
						<InputLabel>Price</InputLabel>
						<Input name="price" type="number" value={formValues.price} onChange={handleInputChange} />
					</FormControl>
					<Box mt={2} display="flex" justifyContent="flex-end">
						<Button onClick={handleCancel}>Cancel</Button>
						<Button variant="contained" color="primary" onClick={handleFormSubmit}>
							{selectedProcedure ? "Update" : "Save"}
						</Button>
					</Box>
				</Box>
			</Modal>
		</Box>
	);
};

export default ProcedureList;
