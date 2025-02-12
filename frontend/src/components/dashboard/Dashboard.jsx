import React, { useState, useEffect, useMemo } from "react";
import { Spin, Flex, Typography, Row, Col, Card, Space, List, Alert } from "antd";
import { Line, Column, Pie, Bar, RadialBar } from "@ant-design/charts";
import "./Dashboard.css";
import { useTheme } from "@mui/material/styles";
import styled from "styled-components";
import { Layout as AntLayout } from "antd";
import { useDashboardStore } from "../../services/dashboardStore.service"; // Import the store

const { Text, Title, Paragraph } = Typography;

//Styled Ant Components
const Layout = styled(AntLayout)`
	background-color: ${({ theme }) => theme.palette.background.default};
`;
const Header = styled(AntLayout.Header)`
	background-color: ${({ theme }) => theme.palette.background.default};
	border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const Content = styled(AntLayout.Content)`
	background-color: ${({ theme }) => theme.palette.background.paper};
	padding: 20px;
`;

// --- Utility Functions ---
const formatNumber = (number) => {
	if (number >= 1000000) return (number / 1000000).toFixed(1) + "M";
	if (number >= 1000) return (number / 1000).toFixed(1) + "K";
	return number;
};

const transformDailyPayments = (data) => (data ? Object.entries(data).map(([date, amount]) => ({ date, amount })) : []);

const transformBedData = (data) => (data ? data.map((bed) => ({ type: `Room ${bed.roomNumber}`, value: bed.count })) : []);

const transformBedsByUnitType = (data) => (data ? data.map((item) => ({ type: item.unitType, value: item.count })) : []);

const transformMedicationData = (data) => (data ? data.map((item) => `${item.medicationName}: ${item.count}`) : []);

const transformLabData = (data) => (data ? data.map((item) => `${item.testName}: ${item.count}`) : []);

const transformBloodTypeData = (data) =>
	data
		? data.map((item) => {
				const bloodType = item.bloodType === null ? "Unknown" : item.bloodType;
				return `${bloodType}: ${item.count}`;
		  })
		: [];

const transformLineChartData = (data) => (data ? data.map((item) => ({ date: item.date, count: item.count })) : []);

const transformYearlyPaymentsForColumn = (yearlyPayments) => {
	if (!yearlyPayments) return [];
	return Object.entries(yearlyPayments).map(([year, monthlyData]) => {
		const totalYearly = Object.values(monthlyData).reduce((sum, amount) => sum + amount, 0);
		return { year, amount: totalYearly };
	});
};

// --- Chart Components ---
const LineChart = React.memo(({ title, data, xField, yField, meta, ...rest }) => (
	<Card title={title}>
		<Line
			data={data}
			xField={xField}
			yField={yField}
			xAxis={{ label: { autoHide: true, autoRotate: false } }}
			meta={meta}
			legend={{ position: "top-right" }}
			{...rest}
		/>
	</Card>
));

const BarChart = React.memo(({ title, data, xField, yField, meta, ...rest }) => (
	<Card title={title}>
		<Bar
			data={data}
			xField={xField}
			yField={yField}
			label={{ position: "middle", style: { fill: "#fff", opacity: 0.6 } }}
			meta={meta}
			{...rest}
		/>
	</Card>
));

const PieChart = React.memo(({ title, data, angleField, colorField, ...rest }) => (
	<Card title={title}>
		<Pie
			data={data}
			angleField={angleField}
			colorField={colorField}
			radius={0.8}
			label={{ type: "outer", content: "{name} {percentage}" }}
			legend={{ position: "bottom" }}
			{...rest}
		/>
	</Card>
));

const RadialBarChart = React.memo(({ title, data, ...rest }) => (
	<Card title={title}>
		<RadialBar
			data={data}
			xField="name"
			yField="count"
			maxAngle={270}
			radius={1}
			innerRadius={0.5}
			tooltip={{ formatter: (datum) => ({ name: "count", value: datum.count }) }}
			colorField="count"
			color={({ color }) => color}
			barBackground={{}}
			barStyle={{ lineCap: "round" }}
			xAxis={{ title: null, label: null }}
			height={240}
			{...rest}
		/>
		<Typography.Paragraph style={{ textAlign: "center" }}>
			Total Beds: <b>{data.reduce((sum, item) => sum + item.count, 0)}</b>
		</Typography.Paragraph>
		<Row>
			{data.map((status, index) => (
				<Col key={index} span={12}>
					<div style={{ display: "flex", gap: "4px" }}>
						<div
							style={{
								height: "20px",
								width: "8px",
								backgroundColor: status.color,
								borderRadius: "4px",
							}}
						/>
						<Space direction="vertical" size={2}>
							<Typography.Text strong>{formatNumber(status.count)}</Typography.Text>
							<Typography.Text>{status.name}</Typography.Text>
						</Space>
					</div>
				</Col>
			))}
		</Row>
	</Card>
));

const ColumnChart = React.memo(({ title, data, xField, yField, meta, ...rest }) => (
	<Card title={title}>
		<Column
			data={data}
			xField={xField}
			yField={yField}
			label={{ position: "middle", style: { fill: "#fff", opacity: 0.6 } }}
			meta={meta}
			{...rest}
		/>
	</Card>
));

const DataListCard = React.memo(({ title, data, transformFunction }) => (
	<Card title={title}>
		<List
			dataSource={transformFunction(data)}
			renderItem={(item) => (
				<List.Item>
					<Typography.Text>{item}</Typography.Text>
				</List.Item>
			)}
		/>
	</Card>
));

// --- Main Dashboard Component ---
const Dashboard = () => {
	const theme = useTheme();
	const { dashboardData, loading, error, fetchDashboardData } = useDashboardStore();

	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);

	//Move all useMemo calls before conditional renders
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
	} = dashboardData || {}; //Destructure only after checking data exists

	const genderPieConfig = useMemo(
		() => ({
			data: [
				{ type: "Female", value: femalePatients || 0 },
				{ type: "Male", value: malePatients || 0 },
			],
			angleField: "value",
			colorField: "type",
			legend: { position: "bottom" },
		}),
		[femalePatients, malePatients]
	);

	const bedStatusRadialConfig = useMemo(
		() => ({
			data: [
				{ name: "Occupied", count: occupiedBeds || 0, color: "#36c361" },
				{ name: "Free", count: (totalBeds || 0) - (occupiedBeds || 0), color: "#2194ff" },
			],
			totalBeds,
		}),
		[occupiedBeds, totalBeds]
	);

	const yearlyPaymentsColumnConfig = useMemo(
		() => ({
			data: transformYearlyPaymentsForColumn(yearlyPayments),
			xField: "year",
			yField: "amount",
			meta: { amount: { formatter: (value) => `$${formatNumber(value)}` } },
		}),
		[yearlyPayments]
	);

	const dailyPaymentsLineConfig = useMemo(
		() => ({
			data: transformDailyPayments(dailyPaymentsLast30Days),
			xField: "date",
			yField: "amount",
			meta: { amount: { formatter: (value) => `$${formatNumber(value)}` } },
		}),
		[dailyPaymentsLast30Days]
	);

	const bedDataBarConfig = useMemo(
		() => ({
			data: transformBedData(bedsByRoomNumber),
			xField: "type",
			yField: "value",
			meta: { value: { formatter: (value) => `${value} beds` } },
		}),
		[bedsByRoomNumber]
	);

	const bedsByUnitTypePieConfig = useMemo(
		() => ({
			data: transformBedsByUnitType(bedsByUnitType),
			angleField: "value",
			colorField: "type",
		}),
		[bedsByUnitType]
	);

	const admissionsLineConfig = useMemo(
		() => ({
			data: transformLineChartData(admissionsByDate),
			xField: "date",
			yField: "count",
		}),
		[admissionsByDate]
	);

	const dischargesLineConfig = useMemo(
		() => ({
			data: transformLineChartData(dischargesByDate),
			xField: "date",
			yField: "count",
		}),
		[dischargesByDate]
	);

	const proceduresLineConfig = useMemo(
		() => ({
			data: transformLineChartData(proceduresByDate),
			xField: "date",
			yField: "count",
		}),
		[proceduresByDate]
	);

	if (loading) {
		return (
			<Flex align="center" justify="center" style={{ height: "100vh" }}>
				<Spin size="large" />
			</Flex>
		);
	}

	if (error) {
		return (
			<Flex align="center" justify="center" style={{ height: "100vh" }}>
				<Alert message="Error" description={error} type="error" showIcon />
			</Flex>
		);
	}

	if (!dashboardData) {
		return <Typography.Text>No dashboard data available.</Typography.Text>;
	}

	const renderDetailedProcedures = () => {
		if (!detailedProceduresByDate || typeof detailedProceduresByDate !== "object" || Object.keys(detailedProceduresByDate).length === 0) {
			return <Paragraph>No detailed procedures to display.</Paragraph>;
		}

		const procedures = Object.entries(detailedProceduresByDate).flatMap(([date, details]) => {
			if (!details || typeof details !== "object" || Object.keys(details).length === 0) {
				return [`${date}: No procedures recorded`];
			}
			return Object.entries(details.procedureCounts).map(([procedure, count]) => `${date} - ${procedure}: ${count}`);
		});
		return (
			<List
				dataSource={procedures}
				renderItem={(item) => (
					<List.Item>
						<Typography.Text>{item}</Typography.Text>
					</List.Item>
				)}
			/>
		);
	};

	return (
		<Layout theme={theme} className="dashboard-layout">
			<Header theme={theme} className="dashboard-header">
				<Title level={2} style={{ color: theme.palette.text.primary, margin: 0 }}>
					Hospital Dashboard
				</Title>
			</Header>
			<Content theme={theme} className="dashboard-content">
				<div style={{ padding: "20px" }}>
					<section>
						<Title level={3}>Key Metrics</Title>
						<Row gutter={[24, 24]} style={{ marginBottom: "20px" }}>
							<Col xs={24} sm={12} md={8} lg={6}>
								<Card title="Total Payments This Year">
									<Title level={2} style={{ margin: 0 }}>{`$${formatNumber(totalPaymentsThisYear)}`}</Title>
								</Card>
							</Col>
							<Col xs={24} sm={12} md={8} lg={6}>
								<Card title="Total Payments Today">
									<Title level={2} style={{ margin: 0 }}>{`$${formatNumber(totalPaymentsToday)}`}</Title>
								</Card>
							</Col>
							<Col xs={24} sm={12} md={8} lg={6}>
								<Card title="Current Admissions">
									<Title level={2} style={{ margin: 0 }}>
										{formatNumber(currentAdmissions)}
									</Title>
								</Card>
							</Col>
							<Col xs={24} sm={12} md={8} lg={6}>
								<Card title="Avg. Length of Stay">
									<Title level={2} style={{ margin: 0 }}>
										{(averageLengthOfStay || 0).toFixed(1)} Days
									</Title>
								</Card>
							</Col>
						</Row>
					</section>

					<section>
						<Title level={3}>Bed Information</Title>
						<Row gutter={[24, 24]} style={{ marginBottom: "20px" }}>
							<Col xs={24} sm={24} md={12} lg={8}>
								<RadialBarChart title="Bed Occupancy" data={bedStatusRadialConfig.data} totalBeds={bedStatusRadialConfig.totalBeds} />
							</Col>
							<Col xs={24} sm={24} md={12} lg={8}>
								<BarChart
									title="Beds By Room Number"
									data={bedDataBarConfig.data}
									xField={bedDataBarConfig.xField}
									yField={bedDataBarConfig.yField}
									meta={bedDataBarConfig.meta}
								/>
							</Col>
							<Col xs={24} sm={24} md={12} lg={8}>
								<PieChart
									title="Beds By Unit Type"
									data={bedsByUnitTypePieConfig.data}
									angleField={bedsByUnitTypePieConfig.angleField}
									colorField={bedsByUnitTypePieConfig.colorField}
								/>
							</Col>
						</Row>
					</section>

					<section>
						<Title level={3}>Medical Data</Title>
						<Row gutter={[24, 24]} style={{ marginBottom: "20px" }}>
							<Col xs={24} sm={24} md={12} lg={8}>
								<DataListCard
									title="Medication Administrations"
									data={medicationAdministrationsByMedication}
									transformFunction={transformMedicationData}
								/>
							</Col>
							<Col xs={24} sm={24} md={12} lg={8}>
								<DataListCard title="Lab Results" data={labResultsByTest} transformFunction={transformLabData} />
							</Col>
							<Col xs={24} sm={24} md={12} lg={8}>
								<DataListCard title="Patients By Blood Type" data={patientsByBloodType} transformFunction={transformBloodTypeData} />
							</Col>
						</Row>
					</section>
					<section>
						<Title level={3}>Financial Overview</Title>
						<Row gutter={[24, 24]} style={{ marginBottom: "20px" }}>
							<Col xs={24} sm={24} md={12} lg={12}>
								<LineChart
									title="Daily Payments Last 30 Days"
									data={dailyPaymentsLineConfig.data}
									xField={dailyPaymentsLineConfig.xField}
									yField={dailyPaymentsLineConfig.yField}
									meta={dailyPaymentsLineConfig.meta}
								/>
							</Col>
							<Col xs={24} sm={24} md={12} lg={12}>
								<ColumnChart
									title="Yearly Payments Overview"
									data={yearlyPaymentsColumnConfig.data}
									xField={yearlyPaymentsColumnConfig.xField}
									yField={yearlyPaymentsColumnConfig.yField}
									meta={yearlyPaymentsColumnConfig.meta}
								/>
							</Col>
						</Row>
					</section>

					<section>
						<Title level={3}>Patient Activity</Title>
						<Row gutter={[24, 24]}>
							<Col xs={24} sm={24} md={12} lg={8}>
								<LineChart
									title="Admissions By Date"
									data={admissionsLineConfig.data}
									xField={admissionsLineConfig.xField}
									yField={admissionsLineConfig.yField}
								/>
							</Col>
							<Col xs={24} sm={24} md={12} lg={8}>
								<LineChart
									title="Discharges By Date"
									data={dischargesLineConfig.data}
									xField={dischargesLineConfig.xField}
									yField={dischargesLineConfig.yField}
								/>
							</Col>
							<Col xs={24} sm={24} md={12} lg={8}>
								<LineChart
									title="Procedures By Date"
									data={proceduresLineConfig.data}
									xField={proceduresLineConfig.xField}
									yField={proceduresLineConfig.yField}
								/>
							</Col>
						</Row>
					</section>
					<Row gutter={[24, 24]}>
						<Col xs={24} sm={24} md={24} lg={12}>
							<Card title="Detailed Procedures">{renderDetailedProcedures()}</Card>
						</Col>
						<Col xs={24} sm={24} md={24} lg={12}>
							<PieChart
								title="Patient Distribution by Gender"
								data={genderPieConfig.data}
								angleField={genderPieConfig.angleField}
								colorField={genderPieConfig.colorField}
								legend={genderPieConfig.legend}
							/>
						</Col>
					</Row>
				</div>
			</Content>
		</Layout>
	);
};

export default Dashboard;
