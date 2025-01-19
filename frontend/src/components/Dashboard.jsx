import React from "react";
import {
	Grid,
	Card,
	CardContent,
	Typography,
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	CircularProgress,
} from "@mui/material";
import ReactApexChart from "react-apexcharts";
import { styled } from "@mui/system";

// Styled Components (same as before)
const StyledCard = styled(Card)(({ theme }) => ({
	marginBottom: theme.spacing(3),
	boxShadow: theme.shadows[2], // Using theme shadows
	borderRadius: theme.shape.borderRadius,
	transition: "transform 0.3s ease-in-out",
	"&:hover": {
		transform: "scale(1.02)",
	},
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
	padding: theme.spacing(3),
}));

const StyledTypographyTitle = styled(Typography)(({ theme }) => ({
	color: theme.palette.primary.main,
	marginBottom: theme.spacing(1),
	fontWeight: 500,
}));

const StyledTypographyValue = styled(Typography)(({ theme }) => ({
	fontWeight: "bold",
	fontSize: "2rem",
	color: theme.palette.text.secondary,
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
	boxShadow: theme.shadows[1],
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
	borderColor: theme.palette.divider,
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
	backgroundColor: theme.palette.mode === "light" ? "#D3E0EA" : "#3E3E5E",
	color: theme.palette.mode === "light" ? "inherit" : "white",
	fontWeight: 600,
	padding: theme.spacing(1.5),
}));

const chartOptionsBase = {
	chart: {
		toolbar: { show: false },
	},
	colors: ["#673ab7"], // Consistent primary color
	xaxis: {
		labels: {
			style: {
				colors: "#616161", // Dark grey labels
			},
		},
	},
	yaxis: {
		labels: {
			style: {
				colors: "#616161",
			},
		},
	},
};

const Dashboard = ({ data, loading, error }) => {
	if (loading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="400px">
				<CircularProgress color="primary" />
			</Box>
		);
	}

	if (error) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="400px">
				<Typography variant="h6" color="error">
					Error loading data. Please try again.
				</Typography>
			</Box>
		);
	}

	if (!data) {
		return <Typography>No data available</Typography>;
	}

	// Prepare chart data
	const bedData = (data?.bedsByRoomNumber || []).map((item) => ({
		x: `Room ${item.roomNumber}`,
		y: item.count,
	}));

	const bloodTypeData = (data?.patientsByBloodType || [])
		.map((item) => ({
			x: item.bloodType || "Unknown",
			y: item.count,
		}))
		.filter((item) => item.x); // Filter out objects where bloodType is null;

	const medicationData = (data?.medicationPrescribedByMedication || []).map((item) => ({
		x: item.medicationName,
		y: item.count,
	}));

	const unitTypeData = (data?.bedsByUnitType || []).map((item) => ({
		x: item.unitType,
		y: item.count,
	}));

	const productUsageData = (data?.productUsageByProduct || []).map((item) => ({
		x: item.productName,
		y: item.count,
	}));

	const procedureData = (data?.procedureLogsByProcedure || []).map((item) => ({
		x: item.procedureName,
		y: item.count,
	}));

	const admissionsData = (data?.admissionsByDate || []).map((item) => ({
		x: item.date,
		y: item.count,
	}));

	const dischargesData = (data?.dischargesByDate || []).map((item) => ({
		x: item.date,
		y: item.count,
	}));

	const proceduresByDateData = (data?.proceduresByDate || []).map((item) => ({
		x: item.date,
		y: item.count,
	}));

	// Payments Chart Data
	const paymentData = [
		{ x: "Yearly", y: data?.totalPaymentsThisYear ?? 0 },
		{ x: "Monthly", y: data?.totalPaymentsThisMonth ?? 0 },
		{ x: "Weekly", y: data?.totalPaymentsThisWeek ?? 0 },
		{ x: "Daily", y: data?.totalPaymentsToday ?? 0 },
	];

	const formatNumber = (number) => {
		return number ? number.toLocaleString() : "0";
	};

	const chartOptions = {
		...chartOptionsBase,
		xaxis: {
			categories: bedData.map((item) => item.x),
		},
	};
	const chartOptionsBloodType = {
		...chartOptionsBase,
		xaxis: {
			categories: bloodTypeData.map((item) => item.x),
		},
	};
	const chartOptionsMedication = {
		...chartOptionsBase,
		xaxis: {
			categories: medicationData.map((item) => item.x),
		},
	};

	const chartOptionsUnitType = {
		...chartOptionsBase,
		xaxis: {
			categories: unitTypeData.map((item) => item.x),
		},
	};

	const chartOptionsProductUsage = {
		...chartOptionsBase,
		xaxis: {
			categories: productUsageData.map((item) => item.x),
		},
	};

	const chartOptionsProcedure = {
		...chartOptionsBase,
		xaxis: {
			categories: procedureData.map((item) => item.x),
		},
	};

	const chartOptionsAdmissions = {
		...chartOptionsBase,
		xaxis: {
			categories: admissionsData.map((item) => item.x),
		},
	};

	const chartOptionsDischarges = {
		...chartOptionsBase,
		xaxis: {
			categories: dischargesData.map((item) => item.x),
		},
	};

	const chartOptionsProceduresByDate = {
		...chartOptionsBase,
		xaxis: {
			categories: proceduresByDateData.map((item) => item.x),
		},
	};
	const chartOptionsPayments = {
		...chartOptionsBase,
		xaxis: {
			categories: paymentData.map((item) => item.x),
		},
	};
	const series = [
		{
			name: "Beds",
			data: bedData.map((item) => item.y),
		},
	];

	const seriesBloodType = [
		{
			name: "Patients",
			data: bloodTypeData.map((item) => item.y),
		},
	];

	const seriesMedication = [
		{
			name: "Medication Prescribed",
			data: medicationData.map((item) => item.y),
		},
	];

	const seriesUnitType = [
		{
			name: "Beds",
			data: unitTypeData.map((item) => item.y),
		},
	];

	const seriesProductUsage = [
		{
			name: "Products",
			data: productUsageData.map((item) => item.y),
		},
	];

	const seriesProcedure = [
		{
			name: "Procedures",
			data: procedureData.map((item) => item.y),
		},
	];

	const seriesAdmissions = [
		{
			name: "Admissions",
			data: admissionsData.map((item) => item.y),
		},
	];

	const seriesDischarges = [
		{
			name: "Discharges",
			data: dischargesData.map((item) => item.y),
		},
	];

	const seriesProceduresByDate = [
		{
			name: "Procedures",
			data: proceduresByDateData.map((item) => item.y),
		},
	];
	const seriesPayments = [
		{
			name: "Payments",
			data: paymentData.map((item) => item.y),
		},
	];

	return (
		<Grid container spacing={3} padding={3}>
			{/* Key Metrics Section */}
			<Grid item xs={12}>
				<Typography variant="h5" gutterBottom>
					Key Metrics
				</Typography>
			</Grid>
			<Grid container item xs={12} spacing={3}>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Occupied Beds
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{formatNumber(data?.occupiedBeds ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Current Admissions
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{formatNumber(data?.currentAdmissions ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Total Patients
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{formatNumber(data?.totalPatients ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Bed Occupancy Rate
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{(Number(data?.bedOccupancyRate * 100) ?? 0).toFixed(2)}%</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Average Length of Stay
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{formatNumber(data?.averageLengthOfStay ?? 0)} dayes</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Total Revenue
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">${formatNumber(data?.totalRevenue ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Total Admissions
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{formatNumber(data?.totalAdmissions ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Total Medication Administrations
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{formatNumber(data?.totalMedicationAdministrations ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Total Lab Results
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{formatNumber(data?.totalLabResults ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Total Vital Signs
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{formatNumber(data?.totalVitalSigns ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Female Patients
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{formatNumber(data?.femalePatients ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Total Procedure Logs
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{formatNumber(data?.totalProcedureLogs ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Average Time to see doctor
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{formatNumber(data?.averageTimeToSeeADoctor ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Staff to patient ratio
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{formatNumber(data?.staffToPatientRatio ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Male Patients
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{formatNumber(data?.malePatients ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Total Beds
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{formatNumber(data?.totalBeds ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Open Admissions
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">{formatNumber(data?.openAdmissions ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				{/* Payments Key Metrics */}
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Total Payments (Yearly)
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">${formatNumber(data?.totalPaymentsThisYear ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Total Payments (Monthly)
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">${formatNumber(data?.totalPaymentsThisMonth ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Total Payments (Weekly)
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">${formatNumber(data?.totalPaymentsThisWeek ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StyledCard>
						<StyledCardContent>
							<StyledTypographyTitle variant="h6" component="div">
								Total Payments (Today)
							</StyledTypographyTitle>
							<StyledTypographyValue variant="h4">${formatNumber(data?.totalPaymentsToday ?? 0)}</StyledTypographyValue>
						</StyledCardContent>
					</StyledCard>
				</Grid>
			</Grid>
			{/* Charts Section */}
			<Grid item xs={12}>
				<Typography variant="h5" gutterBottom>
					Charts
				</Typography>
			</Grid>
			<Grid container item xs={12} spacing={3}>
				{data?.bedsByRoomNumber && data.bedsByRoomNumber.length > 0 && (
					<Grid item xs={12} md={6}>
						<StyledCard>
							<StyledCardContent>
								<StyledTypographyTitle variant="h6" gutterBottom>
									Beds by Room
								</StyledTypographyTitle>
								<ReactApexChart options={chartOptions} series={series} type="bar" />
							</StyledCardContent>
						</StyledCard>
					</Grid>
				)}
				{data?.patientsByBloodType && data.patientsByBloodType.length > 0 && (
					<Grid item xs={12} md={6}>
						<StyledCard>
							<StyledCardContent>
								<StyledTypographyTitle variant="h6" gutterBottom>
									Patients by Blood Type
								</StyledTypographyTitle>
								<ReactApexChart options={chartOptionsBloodType} series={seriesBloodType} type="bar" />
							</StyledCardContent>
						</StyledCard>
					</Grid>
				)}
				{data?.medicationPrescribedByMedication && data.medicationPrescribedByMedication.length > 0 && (
					<Grid item xs={12} md={6}>
						<StyledCard>
							<StyledCardContent>
								<StyledTypographyTitle variant="h6" gutterBottom>
									Medication Prescribed
								</StyledTypographyTitle>
								<ReactApexChart options={chartOptionsMedication} series={seriesMedication} type="bar" />
							</StyledCardContent>
						</StyledCard>
					</Grid>
				)}
				{data?.bedsByUnitType && data.bedsByUnitType.length > 0 && (
					<Grid item xs={12} md={6}>
						<StyledCard>
							<StyledCardContent>
								<StyledTypographyTitle variant="h6" gutterBottom>
									Beds by Unit Type
								</StyledTypographyTitle>
								<ReactApexChart options={chartOptionsUnitType} series={seriesUnitType} type="bar" />
							</StyledCardContent>
						</StyledCard>
					</Grid>
				)}
				{data?.productUsageByProduct && data.productUsageByProduct.length > 0 && (
					<Grid item xs={12} md={6}>
						<StyledCard>
							<StyledCardContent>
								<StyledTypographyTitle variant="h6" gutterBottom>
									Product Usage
								</StyledTypographyTitle>
								<ReactApexChart options={chartOptionsProductUsage} series={seriesProductUsage} type="bar" />
							</StyledCardContent>
						</StyledCard>
					</Grid>
				)}
				{data?.procedureLogsByProcedure && data.procedureLogsByProcedure.length > 0 && (
					<Grid item xs={12} md={6}>
						<StyledCard>
							<StyledCardContent>
								<StyledTypographyTitle variant="h6" gutterBottom>
									Procedures
								</StyledTypographyTitle>
								<ReactApexChart options={chartOptionsProcedure} series={seriesProcedure} type="bar" />
							</StyledCardContent>
						</StyledCard>
					</Grid>
				)}
				{data?.admissionsByDate && data.admissionsByDate.length > 0 && (
					<Grid item xs={12} md={6}>
						<StyledCard>
							<StyledCardContent>
								<StyledTypographyTitle variant="h6" gutterBottom>
									Admissions By Date
								</StyledTypographyTitle>
								<ReactApexChart options={chartOptionsAdmissions} series={seriesAdmissions} type="line" />
							</StyledCardContent>
						</StyledCard>
					</Grid>
				)}
				{data?.dischargesByDate && data.dischargesByDate.length > 0 && (
					<Grid item xs={12} md={6}>
						<StyledCard>
							<StyledCardContent>
								<StyledTypographyTitle variant="h6" gutterBottom>
									Discharges By Date
								</StyledTypographyTitle>
								<ReactApexChart options={chartOptionsDischarges} series={seriesDischarges} type="line" />
							</StyledCardContent>
						</StyledCard>
					</Grid>
				)}
				{data?.proceduresByDate && data.proceduresByDate.length > 0 && (
					<Grid item xs={12} md={6}>
						<StyledCard>
							<StyledCardContent>
								<StyledTypographyTitle variant="h6" gutterBottom>
									Procedures By Date
								</StyledTypographyTitle>
								<ReactApexChart options={chartOptionsProceduresByDate} series={seriesProceduresByDate} type="line" />
							</StyledCardContent>
						</StyledCard>
					</Grid>
				)}
				{paymentData && paymentData.length > 0 && (
					<Grid item xs={12} md={6}>
						<StyledCard>
							<StyledCardContent>
								<StyledTypographyTitle variant="h6" gutterBottom>
									Payments
								</StyledTypographyTitle>
								<ReactApexChart options={chartOptionsPayments} series={seriesPayments} type="bar" />
							</StyledCardContent>
						</StyledCard>
					</Grid>
				)}
			</Grid>
			{/* Pending Bills Table Section */}
			{data?.pendingBills && data.pendingBills.length > 0 && (
				<Grid item xs={12}>
					<Typography variant="h5" gutterBottom>
						Pending Bills
					</Typography>
					<StyledCard>
						<StyledCardContent>
							<StyledTableContainer component={Paper}>
								<Table>
									<TableHead>
										<TableRow>
											<StyledTableHeadCell>Patient Name</StyledTableHeadCell>
											<StyledTableHeadCell align="right">Total Payments of Active Bill</StyledTableHeadCell>
											<StyledTableHeadCell align="right">Pending Amount</StyledTableHeadCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{data.pendingBills.map((bill) => (
											<TableRow key={bill.billId}>
												<StyledTableCell component="th" scope="row">
													{bill.patientName}
												</StyledTableCell>
												<StyledTableCell align="right">${formatNumber(bill.totalAmount)}</StyledTableCell>
												<StyledTableCell align="right">${formatNumber(bill.pendingAmount)}</StyledTableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</StyledTableContainer>
						</StyledCardContent>
					</StyledCard>
				</Grid>
			)}
		</Grid>
	);
};

export default Dashboard;
