import React, { useEffect, useState } from "react";
import { SubscribersChart } from "./SubscribersChart";
import { EarningsCard } from "./EarningsCard";
import { ProgressCard } from "./ProgressCard";
import { DailyPlanCard } from "./DailyPlanCard";
import axios from "axios";
import { Spin, Flex, Typography, Row, Col, Card } from "antd";
import { MedicationCard } from "./MedicationCard";
import { LabsCard } from "./LabsCard";
import { LengthOfStayCard } from "./LengthOfStayCard";
import { AdmissionsChart } from "./AdmissionsChart";
import { DischargesChart } from "./DischargesChart";
import { ProceduresChart } from "./ProceduresChart";
import { DetailedProcedures } from "./DetailedProcedures";
import { BedsByUnitTypeChart } from "./BedsByUnitTypeChart";
import { PatientsByBloodType } from "./PatientsByBloodType";
import PieChartComponent from "./PieChartComponent";
import { YearlyPaymentsChart } from "./YearlyPaymentsChart";
import { MonthlyPaymentsChart } from "./MonthlyPaymentsChart";
import { DailyPaymentsChart } from "./DailyPaymentsChart";

const Dashboard = () => {
	const [dashboardData, setDashboardData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedYear, setSelectedYear] = useState(null);
	const [selectedMonth, setSelectedMonth] = useState(null);

	const handleYearClick = (year) => {
		setSelectedYear(year);
	};

	const handleMonthClick = (monthData) => {
		setSelectedMonth(monthData.time);
	};

	const handleBackToYearly = () => {
		setSelectedYear(null);
		setSelectedMonth(null);
	};

	const handleBackToMonthly = () => {
		setSelectedMonth(null);
	};

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await axios.get("http://localhost:8080/api/dashboard");
				setDashboardData(response.data);
			} catch (err) {
				console.error("Failed to fetch dashboard data", err);
				setError("Failed to fetch dashboard data");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return (
			<Flex align="center" justify="center" style={{ height: "100vh" }}>
				<Spin size="large" />
			</Flex>
		);
	}
	if (error) {
		return <Typography.Text type="danger">{error}</Typography.Text>;
	}
	if (!dashboardData) {
		return <Typography.Text>No dashboard data available.</Typography.Text>;
	}

	const {
		totalPaymentsThisYear,
		occupiedBeds,
		dailyPaymentsLast30Days,
		bedsByRoomNumber,
		totalPaymentsThisWeek,
		currentAdmissions,
		totalPatients,
		bedOccupancyRate,
		totalBeds,
		averageLengthOfStay,
		totalMedicationAdministrations,
		totalLabResults,
		totalPaymentsToday,
		femalePatients,
		malePatients,
		medicationAdministrationsByMedication,
		labResultsByTest,
		yearlyPayments,
		admissionsByDate,
		dischargesByDate,
		proceduresByDate,
		detailedProceduresByDate,
		bedsByUnitType,
		patientsByBloodType,
	} = dashboardData;

	const pieData = [
		{
			type: "Female",
			value: femalePatients || 0,
		},
		{
			type: "Male",
			value: malePatients || 0,
		},
	];

	const bedData = (bedsByRoomNumber || []).map((bed) => ({
		type: `Room ${bed.roomNumber}`,
		value: bed.count,
	}));

	const bedStatus = [
		{
			name: "Occupied",
			count: occupiedBeds || 0,
			color: "#36c361",
		},
		{
			name: "Free",
			count: (totalBeds || 0) - (occupiedBeds || 0),
			color: "#2194ff",
		},
	];

	return (
		<div style={{ padding: "20px" }}>
			{/* Financial Overview Section */}
			<Row gutter={[24, 24]} style={{ marginBottom: "20px" }}>
				<Col xs={24} sm={12} md={8} lg={6}>
					<EarningsCard title="Total Payments This Year" value={totalPaymentsThisYear} />
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<EarningsCard title="Total Payments Today" value={totalPaymentsToday} />
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<EarningsCard title="Current Admissions" value={currentAdmissions} />
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<LengthOfStayCard title="Average Length of Stay" value={averageLengthOfStay} />
				</Col>
			</Row>

			{/* Occupancy Section */}
			<Row gutter={[24, 24]} style={{ marginBottom: "20px" }}>
				<Col xs={24} sm={24} md={12} lg={8}>
					<ProgressCard title="Bed Occupancy" total={totalBeds} statuses={bedStatus} />
				</Col>
				<Col xs={24} sm={24} md={12} lg={8}>
					<DailyPlanCard title="Beds By Room Number" data={bedData} />
				</Col>
				<Col xs={24} sm={24} md={12} lg={8}>
					<BedsByUnitTypeChart data={bedsByUnitType} title="Beds By Unit Type" />
				</Col>
			</Row>

			{/* Medical Data Section */}
			<Row gutter={[24, 24]} style={{ marginBottom: "20px" }}>
				<Col xs={24} sm={24} md={12} lg={8}>
					<MedicationCard title="Medication Administrations" data={medicationAdministrationsByMedication} />
				</Col>
				<Col xs={24} sm={24} md={12} lg={8}>
					<LabsCard title="Lab Results" data={labResultsByTest} />
				</Col>
				<Col xs={24} sm={24} md={12} lg={8}>
					<PatientsByBloodType title="Patients By Blood Type" data={patientsByBloodType} />
				</Col>
			</Row>

			{/* Chart Section */}
			<Row gutter={[24, 24]} style={{ marginBottom: "20px" }}>
				<Col xs={24} sm={24} md={12} lg={12}>
					<SubscribersChart data={dailyPaymentsLast30Days} title="Daily Payments Last 30 Days" />
				</Col>
				<Col xs={24} sm={24} md={12} lg={12}>
					{selectedYear == null ? (
						<YearlyPaymentsChart title="Payments Overview" yearlyPayments={yearlyPayments} onYearClick={handleYearClick} />
					) : selectedMonth == null ? (
						<MonthlyPaymentsChart
							title={`Payments in ${selectedYear}`}
							yearlyPayments={yearlyPayments}
							selectedYear={selectedYear}
							onMonthClick={handleMonthClick}
							onBack={handleBackToYearly}
						/>
					) : (
						<DailyPaymentsChart
							title={`Payments in ${selectedMonth} - ${selectedYear}`}
							dailyPayments={dailyPaymentsLast30Days}
							selectedMonth={selectedMonth}
							selectedYear={selectedYear}
							onBack={handleBackToMonthly}
						/>
					)}
				</Col>
			</Row>

			<Row gutter={[24, 24]}>
				<Col xs={24} sm={24} md={12} lg={8}>
					<AdmissionsChart title="Admissions By Date" data={admissionsByDate} />
				</Col>
				<Col xs={24} sm={24} md={12} lg={8}>
					<DischargesChart title="Discharges By Date" data={dischargesByDate} />
				</Col>
				<Col xs={24} sm={24} md={12} lg={8}>
					<ProceduresChart title="Procedures By Date" data={proceduresByDate} />
				</Col>
			</Row>

			<Row gutter={[24, 24]}>
				<Col xs={24} sm={24} md={24} lg={12}>
					<DetailedProcedures title="Detailed Procedures" data={detailedProceduresByDate} />
				</Col>
				<Col xs={24} sm={24} md={24} lg={12}>
					<Card title="Total Patients">
						<PieChartComponent data={pieData} title="Patient Distribution by Gender" />
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default Dashboard;
