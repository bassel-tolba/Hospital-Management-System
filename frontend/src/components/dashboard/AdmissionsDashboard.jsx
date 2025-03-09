import React, { useState, useEffect, useRef } from "react";
import { Card, DatePicker, Row, Col, Spin, Typography, Switch } from "antd";
import { useDashboardStore } from "../../services/dashboardStore.service";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import { Chart } from "@antv/g2";
import "./Dashboard.css";
import { g2Themes } from "../../App"; //import g2 themes

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Title } = Typography;

const DashboardFilters = ({ filters, onFilterChange }) => (
	<div className="dashboard-filters">
		<Row gutter={[24, 16]} align="middle">
			<Col xs={24} sm={8}>
				<div className="filter-item">
					<Switch checked={filters.includeOpen} onChange={(checked) => onFilterChange("includeOpen", checked)} />
					<span className="filter-label">Include Open</span>
				</div>
			</Col>
			<Col xs={24} sm={8}>
				<div className="filter-item">
					<Switch checked={filters.includeFuture} onChange={(checked) => onFilterChange("includeFuture", checked)} />
					<span className="filter-label">Include Future</span>
				</div>
			</Col>
			<Col xs={24} sm={8}>
				<div className="filter-item">
					<Switch checked={filters.includePast} onChange={(checked) => onFilterChange("includePast", checked)} />
					<span className="filter-label">Include Past</span>
				</div>
			</Col>
		</Row>
	</div>
);

const DateRangeSelector = ({ dates, onDateChange }) => (
	<div className="date-range-selector">
		<RangePicker
			value={[dates.startDate ? dayjs(dates.startDate) : null, dates.endDate ? dayjs(dates.endDate) : null]}
			onChange={onDateChange}
			showTime
			format="YYYY-MM-DD HH:mm:ss"
			className="custom-date-picker"
		/>
	</div>
);

const DashboardContent = ({ loading, error, chartData, granularity, colorMode }) => {
	// Receive colorMode
	const [chart, setChart] = useState(null);
	const chartContainerRef = useRef(null); // Ref for the container

	useEffect(() => {
		if (chartData.length > 0 && chartContainerRef.current) {
			const newChart = new Chart({
				container: chartContainerRef.current,
				autoFit: true,
				height: 300,
			});

			newChart.data(chartData);

			newChart
				.line()
				.encode("x", "date")
				.encode("y", "count")
				.animate("enter", { type: "pathIn", duration: 1000 })
				.tooltip({
					title: "date",
					items: [{ name: "Admissions", field: "count" }],
				});

			// Apply theme
			newChart.theme(g2Themes[colorMode]);
			newChart.render();
			setChart(newChart);
		} else if (chart && chartData.length > 0) {
			chart.changeData(chartData);
			chart.theme(g2Themes[colorMode]); // Update theme when data changes
		}

		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	}, [chartData, granularity, colorMode]);

	if (loading) {
		return (
			<div className="loading-container">
				<Spin size="large" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="error-message">
				<Title level={4}>Error</Title>
				<p>{error}</p>
			</div>
		);
	}

	return (
		<div className="dashboard-content">
			<Row gutter={[24, 24]}>
				<Col span={24}>
					<Card>
						<Title level={4}>Admissions Trend</Title>
						<div ref={chartContainerRef} id="dynamic-chart"></div>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

const AdmissionsDashboard = ({ colorMode, isOpen }) => {
	//add isOpen
	// Receive colorMode here
	// isDarkMode prop added
	const [dates, setDates] = useState({
		startDate: dayjs().startOf("month").format("YYYY-MM-DDTHH:mm:ss"),
		endDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
	});
	const [filters, setFilters] = useState({
		includeOpen: true,
		includeFuture: false,
		includePast: false,
	});
	const { fetchAdmissionTrend } = useDashboardStore();
	const [chartData, setChartData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [granularity, setGranularity] = useState("day");

	const fetchData = async () => {
		setLoading(true);
		setError(null);
		setChartData([]);

		try {
			const formattedStartDate = dayjs(dates.startDate).format("YYYY-MM-DDTHH:mm:ss");
			const formattedEndDate = dayjs(dates.endDate).format("YYYY-MM-DDTHH:mm:ss");

			const trendData = await fetchAdmissionTrend(
				formattedStartDate,
				formattedEndDate,
				filters.includeOpen,
				filters.includeFuture,
				filters.includePast
			);
			setChartData(trendData);
		} catch (err) {
			setError("Error fetching data.");
			console.error("Error fetching data:", err);
		} finally {
			setLoading(false);
		}
	};

	// src/components/Dashboard/AdmissionsDashboard.js (continued from previous response)

	useEffect(() => {
		if (dates.startDate && dates.endDate && isOpen) {
			// Add isOpen here
			fetchData();
		}
	}, [dates, filters, isOpen]); // Add isOpen to dependencies

	const handleDateChange = (selectedDates, dateStrings) => {
		if (selectedDates && selectedDates.length === 2) {
			setDates({
				startDate: selectedDates[0].format("YYYY-MM-DDTHH:mm:ss"),
				endDate: selectedDates[1].format("YYYY-MM-DDTHH:mm:ss"),
			});
		} else {
			setDates({
				startDate: null,
				endDate: null,
			});
			setChartData([]);
		}
	};

	const handleFilterChange = (filterName, value) => {
		setFilters((prev) => ({
			...prev,
			[filterName]: value,
		}));
	};

	return (
		<Card className="dashboard-card">
			<Title level={2} className="dashboard-title">
				Admissions Dashboard
			</Title>
			<DateRangeSelector dates={dates} onDateChange={handleDateChange} />
			<DashboardFilters filters={filters} onFilterChange={handleFilterChange} />
			<DashboardContent loading={loading} error={error} chartData={chartData} granularity={granularity} colorMode={colorMode} />{" "}
			{/* Pass isDarkMode */}
		</Card>
	);
};

export default AdmissionsDashboard;
