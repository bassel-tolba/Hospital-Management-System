import React, { useState, useEffect } from "react";
import { TextField, Button, Select, MenuItem, FormControl, Box, CircularProgress, Autocomplete, InputLabel } from "@mui/material";
import { useActivityStore } from "../../services/activity.service";
import { useLabStore } from "../../services/lab.service";
import { useImageReportTypeStore } from "../../services/imageReportType.service";

const MiniCreateActivityForm = ({ onActivityCreated, patientId }) => {
	const { createActivity, loading, error, clearError } = useActivityStore();
	const { labTests, fetchLabTests, loading: labLoading } = useLabStore();
	const { imageReportTypes, fetchImageReportTypes, loading: imageReportLoading } = useImageReportTypeStore();

	const [formData, setFormData] = useState({
		activityType: "",
		description: "",
		patientIds: [],
		state: "pending",
	});

	const [selectedLabTest, setSelectedLabTest] = useState(null);
	const [selectedImageReportType, setSelectedImageReportType] = useState(null);

	useEffect(() => {
		// Automatically set the patient ID when component mounts or patientId changes
		if (patientId) {
			setFormData((prevData) => ({
				...prevData,
				patientIds: [patientId],
			}));
		}
	}, [patientId]);

	useEffect(() => {
		if (formData.activityType === "LAB_TEST") {
			fetchLabTests();
		}
		if (formData.activityType === "IMAGE_REPORT") {
			fetchImageReportTypes(0, 10000); // Fetch all image report types
		}
	}, [formData.activityType, fetchLabTests, fetchImageReportTypes]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		//Reset the lab test when the activity type changes.
		if (name === "activityType" && value !== "LAB_TEST") {
			setSelectedLabTest(null);
		}
		//Reset the image report when the activity type changes.
		if (name === "activityType" && value !== "IMAGE_REPORT") {
			setSelectedImageReportType(null);
		}
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await createActivity(formData);
			setFormData({
				activityType: "",
				description: "",
				patientIds: [patientId],
				state: "pending",
			});
			setSelectedLabTest(null);
			setSelectedImageReportType(null);

			onActivityCreated(); // Callback to refresh list
		} catch (err) {
			console.error("Failed to create activity", err);
		}
	};

	if (loading || labLoading || imageReportLoading) {
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
							Service Type
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

				<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
					<Button type="submit" variant="contained" color="primary" size="small" disabled={loading}>
						{loading ? <CircularProgress size={20} /> : "Create Activity"}
					</Button>
				</Box>
			</form>
		</Box>
	);
};

export default MiniCreateActivityForm;
