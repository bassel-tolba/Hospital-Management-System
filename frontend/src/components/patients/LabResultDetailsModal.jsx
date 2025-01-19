// LabResultDetailsModal.js
import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Box,
	useTheme,
	CircularProgress,
} from "@mui/material";
import moment from "moment";
import styled from "@emotion/styled";
import { useLabStore } from "../../services/lab.service"; // Import the lab store

const ResponsiveTableContainer = styled(Box)`
	overflow-x: auto; /* Enable horizontal scroll if needed */
	width: 100%; /* Make sure container takes the whole width */
`;

const StyledTableCell = styled(TableCell)`
	font-weight: bold;
	background-color: ${({ theme }) => theme.palette.action.disabledBackground};
`;
const LoaderContainer = styled(Box)`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100px;
`;
const ErrorMessage = styled(Typography)`
	color: red;
	text-align: center;
	margin-top: 10px;
`;

const LabResultDetailsModal = ({ open, onClose, labResult, theme }) => {
	const { fetchLabTests, labTests, loading, error } = useLabStore();
	const [labTestDetails, setLabTestDetails] = useState(null);

	useEffect(() => {
		const fetchDetails = async () => {
			if (labResult && labResult.labTestId) {
				const foundLabTest = labTests.find((test) => test.id === labResult.labTestId);
				if (foundLabTest) {
					setLabTestDetails(foundLabTest);
				} else {
					try {
						const fetchedLabTests = await fetchLabTests();
						const foundTestAfterFetch = fetchedLabTests.find((test) => test.id === labResult.labTestId);
						setLabTestDetails(foundTestAfterFetch || null);
					} catch (err) {
						console.error("Error fetching lab test details", err);
					}
				}
			} else {
				setLabTestDetails(null);
			}
		};
		fetchDetails();
	}, [labResult, fetchLabTests, labTests]);

	if (!labResult) {
		return null;
	}

	if (loading) {
		return (
			<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
				<DialogContent>
					<LoaderContainer>
						<CircularProgress color="primary" />
					</LoaderContainer>
				</DialogContent>
			</Dialog>
		);
	}
	if (error) {
		return (
			<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
				<DialogContent>
					<ErrorMessage>{error}</ErrorMessage>
				</DialogContent>
			</Dialog>
		);
	}
	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle sx={{ textAlign: "center" }}>Lab Result Details</DialogTitle>
			<DialogContent>
				{labTestDetails && (
					<Box sx={{ marginBottom: "15px" }}>
						<Typography variant="subtitle1">
							<strong>Test Name:</strong> {labTestDetails.testName || "N/A"}
						</Typography>
						<Typography variant="subtitle1">
							<strong>Test Description:</strong> {labTestDetails.description || "N/A"}
						</Typography>
					</Box>
				)}

				<Box sx={{ marginBottom: "15px" }}>
					<Typography variant="subtitle1">
						<strong>Result Date Time:</strong> {moment(labResult.resultDateTime).format("YYYY-MM-DD HH:mm")}
					</Typography>
					<Typography variant="subtitle1">
						<strong>Notes:</strong> {labResult.notes || "N/A"}
					</Typography>
				</Box>

				{labResult.resultMap ? (
					<ResponsiveTableContainer>
						<Table size="small" sx={{ maxWidth: "100%", overflow: "auto" }}>
							<TableHead>
								<TableRow>
									{Object.keys(labResult.resultMap).length > 0 &&
										Object.values(labResult.resultMap)[0] &&
										Object.keys(Object.values(labResult.resultMap)[0])
											.filter((header) => header !== "key") // Filter out the "key" header
											.map((header) => (
												<StyledTableCell key={header} theme={theme}>
													{header}
												</StyledTableCell>
											))}
								</TableRow>
							</TableHead>
							<TableBody>
								{Object.entries(labResult.resultMap).map(([key, value]) => (
									<TableRow key={key}>
										{Object.entries(value)
											.filter(([header]) => header !== "key") // Filter out the "key" column
											.map(([header, cell], index) => (
												<TableCell key={index}>{cell != null ? cell.toString() : ""}</TableCell>
											))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</ResponsiveTableContainer>
				) : (
					<Typography variant="body1">No results available for this lab.</Typography>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color="primary">
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default LabResultDetailsModal;
