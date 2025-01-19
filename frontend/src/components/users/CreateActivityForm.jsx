import React, { useState, useEffect } from "react";
import {
	TextField,
	Button,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Box,
	CircularProgress,
	Autocomplete,
	IconButton,
	InputAdornment,
	Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useActivityStore } from "../../services/activity.service";
import { usePatientStore } from "../../services/patient.service";
import { useUnitStore } from "../../services/unit.service";
import { useRoomStore } from "../../services/room.service";
import { useLabStore } from "../../services/lab.service";
import { useImageReportTypeStore } from "../../services/imageReportType.service";

const CreateActivityForm = ({ onActivityCreated }) => {
	const { createActivity, loading, error, clearError } = useActivityStore();
	const { patients, searchPatients, loading: patientLoading } = usePatientStore();
	const { units, fetchAllUnits, loading: unitLoading } = useUnitStore();
	const { rooms, searchRooms, loading: roomLoading } = useRoomStore();
	const { labTests, fetchLabTests, loading: labLoading } = useLabStore();
	const { imageReportTypes, fetchImageReportTypes, loading: imageReportLoading } = useImageReportTypeStore();

	const [formData, setFormData] = useState({
		activityType: "",
		description: "",
		roomId: null,
		unitId: null,
		patientIds: [],
		state: "pending",
	});

	const [selectedRoom, setSelectedRoom] = useState(null);
	const [selectedUnit, setSelectedUnit] = useState(null);
	const [selectedPatients, setSelectedPatients] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [filteredRooms, setFilteredRooms] = useState([]);
	const [selectedLabTest, setSelectedLabTest] = useState(null);
	const [selectedImageReportType, setSelectedImageReportType] = useState(null);
	// const [filteredUnits, setFilteredUnits] = useState([]); // No longer needed
	// const [unitError, setUnitError] = useState(null); //No longer needed

	useEffect(() => {
		fetchAllUnits();
	}, [fetchAllUnits]);

	useEffect(() => {
		if (!units) return;
		let autoSelectedUnit = null;

		if (formData.activityType === "LAB_TEST") {
			const labUnit = units.find((unit) => unit.name === "LABORATORY");
			autoSelectedUnit = labUnit ? labUnit.id : null;
		} else if (formData.activityType === "IMAGE_REPORT") {
			const radiologyUnit = units.find((unit) => unit.name === "RADIOLOGY");
			autoSelectedUnit = radiologyUnit ? radiologyUnit.id : null;
		}

		if (autoSelectedUnit) {
			setSelectedUnit(autoSelectedUnit);
		} else {
			setSelectedUnit(null);
		}
	}, [units, formData.activityType]);

	useEffect(() => {
		const fetchRooms = async () => {
			if (selectedUnit) {
				try {
					const response = await searchRooms({ unitId: selectedUnit });
					setFilteredRooms(response.content || []);
				} catch (error) {
					console.error("Error fetching rooms:", error);
					setFilteredRooms([]);
				}
			} else {
				setFilteredRooms([]);
			}
		};
		fetchRooms();
	}, [selectedUnit, searchRooms]);

	const handleSearch = async () => {
		if (patientSearchTerm) {
			await searchPatients({ searchTerm: patientSearchTerm });
		}
	};

	const handleSearchKeyDown = (event) => {
		if (event.key === "Enter") {
			handleSearch();
		}
	};

	const handleSearchChange = (event) => {
		setPatientSearchTerm(event.target.value);
	};

	useEffect(() => {
		if (selectedRoom) {
			setFormData((prevData) => ({
				...prevData,
				roomId: selectedRoom,
			}));
		} else {
			setFormData((prevData) => ({
				...prevData,
				roomId: null,
			}));
		}
	}, [selectedRoom]);

	useEffect(() => {
		if (selectedUnit) {
			setFormData((prevData) => ({
				...prevData,
				unitId: selectedUnit,
			}));
		} else {
			setFormData((prevData) => ({
				...prevData,
				unitId: null,
			}));
		}
	}, [selectedUnit]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;

		if (name === "activityType") {
			// Reset selected lab test/image report
			if (value !== "LAB_TEST") setSelectedLabTest(null);
			if (value !== "IMAGE_REPORT") setSelectedImageReportType(null);

			// Auto-select the unit
			let autoSelectedUnit = null;

			if (value === "LAB_TEST") {
				const labUnit = units.find((unit) => unit.name === "LABORATORY");
				autoSelectedUnit = labUnit ? labUnit.id : null;
			} else if (value === "IMAGE_REPORT") {
				const radiologyUnit = units.find((unit) => unit.name === "RADIOLOGY");
				autoSelectedUnit = radiologyUnit ? radiologyUnit.id : null;
			}

			setSelectedUnit(autoSelectedUnit);
		}
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handlePatientSelect = (event, value) => {
		setSelectedPatients(value);
		setFormData((prevData) => ({
			...prevData,
			patientIds: value.map((patient) => patient.id),
		}));
	};

	const handleRoomChange = (event) => {
		setSelectedRoom(event.target.value);
	};

	const handleUnitChange = (event) => {
		setSelectedUnit(event.target.value);
	};

	const handleLabTestChange = (event, value) => {
		setSelectedLabTest(value);
		if (value) {
			setFormData((prevData) => ({
				...prevData,
				description: value.testName,
			}));
		} else {
			setFormData((prevData) => ({
				...prevData,
				description: "",
			}));
		}
	};

	const handleImageReportTypeChange = (event, value) => {
		setSelectedImageReportType(value);
		if (value) {
			setFormData((prevData) => ({
				...prevData,
				description: value.name,
			}));
		} else {
			setFormData((prevData) => ({
				...prevData,
				description: "",
			}));
		}
	};

	useEffect(() => {
		if (formData.activityType === "LAB_TEST") {
			fetchLabTests();
		}
		if (formData.activityType === "IMAGE_REPORT") {
			fetchImageReportTypes(0, 10000); // Fetch all image report types
		}
	}, [formData.activityType, fetchLabTests, fetchImageReportTypes]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await createActivity(formData);
			setFormData({
				activityType: "",
				description: "",
				roomId: null,
				unitId: null,
				patientIds: [],
				state: "pending",
			});
			setSelectedRoom(null);
			setSelectedUnit(null);
			setSelectedPatients([]);
			setSelectedLabTest(null);
			setSelectedImageReportType(null);
			setPatientSearchTerm("");
			//	setUnitError(null); No longer needed

			// Call the callback to refresh the list
			onActivityCreated();
		} catch (err) {
			console.error("Failed to create activity", err);
		}
	};

	if (loading || patientLoading || unitLoading || roomLoading || labLoading || imageReportLoading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
				<CircularProgress size={30} />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ color: "red", mb: 1 }}>
				Error: {error}
				<Button size="small" onClick={clearError}>
					Clear Error
				</Button>
			</Box>
		);
	}

	return (
		<Box sx={{ margin: "0 auto" }}>
			<form onSubmit={handleSubmit}>
				<Box mb={1}>
					<FormControl fullWidth size="small">
						<InputLabel id="activity-type-label" sx={{ fontSize: "0.9rem" }}>
							Activity Type
						</InputLabel>
						<Select
							labelId="activity-type-label"
							id="activityType"
							name="activityType"
							value={formData.activityType}
							onChange={handleInputChange}
							required
							sx={{ fontSize: "0.9rem" }}>
							<MenuItem value="LAB_TEST" sx={{ fontSize: "0.9rem" }}>
								Lab Test
							</MenuItem>
							<MenuItem value="IMAGE_REPORT" sx={{ fontSize: "0.9rem" }}>
								Image Report
							</MenuItem>
							<MenuItem value="VITAL_SIGNS" sx={{ fontSize: "0.9rem" }}>
								Vital Signs
							</MenuItem>
							<MenuItem value="MEDICATION_ADMINISTRATION" sx={{ fontSize: "0.9rem" }}>
								Medication Administration
							</MenuItem>
							<MenuItem value="ASSESSMENT" sx={{ fontSize: "0.9rem" }}>
								Assessment
							</MenuItem>
							<MenuItem value="PRODUCT" sx={{ fontSize: "0.9rem" }}>
								Product
							</MenuItem>
						</Select>
					</FormControl>
				</Box>

				{formData.activityType === "LAB_TEST" && (
					<Box mb={1}>
						<FormControl fullWidth size="small">
							<Autocomplete
								size="small"
								filterOptions={(options, state) => {
									return options;
								}}
								options={labTests}
								loading={labLoading}
								getOptionLabel={(option) => `${option.testName}`}
								value={selectedLabTest}
								onChange={handleLabTestChange}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Search Lab Tests"
										InputLabelProps={{ style: { fontSize: "0.9rem" } }}
										InputProps={{
											...params.InputProps,
											style: { fontSize: "0.9rem" },
										}}
									/>
								)}
							/>
						</FormControl>
					</Box>
				)}

				{formData.activityType === "IMAGE_REPORT" && (
					<Box mb={1}>
						<FormControl fullWidth size="small">
							<Autocomplete
								size="small"
								filterOptions={(options, state) => {
									return options;
								}}
								options={imageReportTypes}
								loading={imageReportLoading}
								getOptionLabel={(option) => `${option.name}`}
								value={selectedImageReportType}
								onChange={handleImageReportTypeChange}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Search Image Report Types"
										InputLabelProps={{ style: { fontSize: "0.9rem" } }}
										InputProps={{
											...params.InputProps,
											style: { fontSize: "0.9rem" },
										}}
									/>
								)}
							/>
						</FormControl>
					</Box>
				)}

				<Box mb={1}>
					<TextField
						fullWidth
						InputProps={{ style: { fontSize: "0.9rem" } }}
						label="Description"
						name="description"
						value={formData.description}
						required
						size="small"
						disabled={formData.activityType === "LAB_TEST" || formData.activityType === "IMAGE_REPORT"}
					/>
				</Box>
				{/* {unitError && (
					<Typography color="error" variant="body2" mb={1}>
						{unitError}
					</Typography>
				)} */}
				<Box mb={1}>
					<FormControl fullWidth size="small">
						<InputLabel id="unit-select-label" sx={{ fontSize: "0.9rem" }}>
							Unit (optional)
						</InputLabel>
						<Select
							labelId="unit-select-label"
							id="unitId"
							value={selectedUnit || ""}
							onChange={handleUnitChange}
							sx={{ fontSize: "0.9rem" }}>
							<MenuItem value="" sx={{ fontSize: "0.9rem" }}>
								<em>None</em>
							</MenuItem>
							{units.map((unit) => (
								<MenuItem key={unit.id} value={unit.id} sx={{ fontSize: "0.9rem" }}>
									{unit.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>

				{selectedUnit && (
					<Box mb={1}>
						<FormControl fullWidth size="small">
							<InputLabel id="room-select-label" sx={{ fontSize: "0.9rem" }}>
								Room (optional)
							</InputLabel>
							<Select
								labelId="room-select-label"
								id="roomId"
								value={selectedRoom || ""}
								onChange={handleRoomChange}
								sx={{ fontSize: "0.9rem" }}>
								<MenuItem value="" sx={{ fontSize: "0.9rem" }}>
									<em>None</em>
								</MenuItem>
								{Array.isArray(filteredRooms) &&
									filteredRooms.map((room) => (
										<MenuItem key={room.id} value={room.id} sx={{ fontSize: "0.9rem" }}>
											{room.roomNumber}
										</MenuItem>
									))}
							</Select>
						</FormControl>
					</Box>
				)}

				<Box mb={1}>
					<FormControl fullWidth size="small">
						<Autocomplete
							multiple
							size="small"
							filterOptions={(options, state) => {
								return options;
							}}
							options={patients}
							loading={patientLoading}
							getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
							value={selectedPatients}
							onChange={handlePatientSelect}
							onKeyDown={handleSearchKeyDown}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Search Patients"
									InputLabelProps={{ style: { fontSize: "0.9rem" } }}
									InputProps={{
										...params.InputProps,
										style: { fontSize: "0.9rem" },
										endAdornment: (
											<InputAdornment position="end">
												<IconButton onClick={handleSearch} edge="end" aria-label="search">
													<SearchIcon />
												</IconButton>
											</InputAdornment>
										),
									}}
									onChange={handleSearchChange}
								/>
							)}
						/>
					</FormControl>
				</Box>

				<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
					<Button type="submit" variant="contained" color="primary" size="small" disabled={loading}>
						{loading ? <CircularProgress size={20} /> : "Create Activity"}
					</Button>
				</Box>
			</form>
		</Box>
	);
};

export default CreateActivityForm;
