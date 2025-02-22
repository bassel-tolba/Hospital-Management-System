// src/components/Dashboard/PaymentsDashboard.js
import React, { useState, useEffect, useRef } from "react";
import { Card, DatePicker, Row, Col, Spin, Typography } from "antd";
import { useDashboardStore } from "../../services/dashboardStore.service";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Chart } from "@antv/g2";
import "./Dashboard.css";
import { g2Themes } from "../../App";
dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;
const { Title } = Typography;

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

const PaymentsDashboardContent = ({ loading, error, paymentData, colorMode, dates }) => {
	const chartContainerRef = useRef(null);
	const pieChartContainerRef = useRef(null);
	const [chart, setChart] = useState(null);
	const [pieChart, setPieChart] = useState(null);

	useEffect(() => {
		const preprocessData = (nestedData, startDate, endDate) => {
			if (!nestedData || nestedData.length === 0) return [];

			const flattened = nestedData.flat();
			const allCategories = [...new Set(flattened.map((item) => item.category))];

			const start = dayjs(startDate);
			const end = dayjs(endDate);
			const dateRange = [];
			let currentDate = start;
			while (currentDate.isBefore(end) || currentDate.isSame(end, "day")) {
				dateRange.push(currentDate.format("YYYY-MM-DD"));
				currentDate = currentDate.add(1, "day");
			}

			const completeData = [];
			dateRange.forEach((date) => {
				allCategories.forEach((category) => {
					const existingDataPoint = flattened.find((item) => item.date === date && item.category === category);

					if (existingDataPoint) {
						completeData.push(existingDataPoint);
					} else {
						completeData.push({
							date: date,
							category: category,
							amount: 0,
							count: 0,
						});
					}
				});
			});
			completeData.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());

			return completeData;
		};

		const processedData = preprocessData(paymentData, dates.startDate, dates.endDate);

		// --- Line Chart Logic --- (No changes here)
		if (processedData.length > 0 && chartContainerRef.current) {
			const newChart = new Chart({
				container: chartContainerRef.current,
				autoFit: true,
				height: 300,
			});
			newChart.data(processedData);

			newChart
				.line()
				.encode("x", "date")
				.encode("y", "amount")
				.encode("color", "category")
				.tooltip({
					title: "date",
					items: [
						{ name: "Category", field: "category" },
						{ name: "Amount", field: "amount" },
						{ name: "Count", field: "count" },
					],
				});

			newChart.theme(g2Themes[colorMode]);
			newChart.render();
			setChart(newChart);
		} else if (chart && processedData.length > 0) {
			chart.changeData(processedData);
			chart.theme(g2Themes[colorMode]);
		}
		// --- Pie Chart Logic --- (Modified to use the example structure)
		if (processedData.length > 0 && pieChartContainerRef.current) {
			// 1. Calculate total amounts per category
			const categoryTotals = {};
			processedData.forEach((item) => {
				if (item?.category) {
					categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
				}
			});

			// 2. Transform into data format for G2
			const pieChartData = Object.entries(categoryTotals).map(([genre, sold]) => ({
				genre,
				sold,
			}));

			// 3. Create or update the pie chart
			if (!pieChart) {
				const newPieChart = new Chart({
					container: pieChartContainerRef.current,
					autoFit: true,
					height: 300, // Adjust height as needed
				});

				newPieChart.coordinate({ type: "theta" });

				newPieChart
					.interval()
					.data(pieChartData)
					.transform({ type: "stackY" })
					.encode("color", "genre")
					.encode("y", "sold")
					.tooltip((data) => {
						return data?.genre
							? {
									name: data.genre,
									value: data.sold,
							  }
							: null;
					})
					.animate("enter", { type: "waveIn", duration: 1000 });

				newPieChart.theme(g2Themes[colorMode]);
				newPieChart.render();
				setPieChart(newPieChart);
			} else {
				pieChart.changeData(pieChartData);
				pieChart.theme(g2Themes[colorMode]);
			}
		}
		return () => {
			if (chart) {
				chart.destroy();
			}
			if (pieChart) {
				pieChart.destroy();
			}
		};
	}, [paymentData, colorMode, dates.startDate, dates.endDate]);

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
						<Title level={4}>Payment Trend</Title>
						<div ref={chartContainerRef} id="payments-chart"></div>
					</Card>
				</Col>
				<Col span={24}>
					<Card>
						<Title level={4}>Total Payments by Category</Title>
						<div ref={pieChartContainerRef} id="payments-pie-chart" style={{ display: "flex", justifyContent: "center" }}></div>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

const PaymentsDashboard = ({ colorMode }) => {
	const [dates, setDates] = useState({
		startDate: dayjs().startOf("month").format("YYYY-MM-DDTHH:mm:ss"),
		endDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
	});
	const { fetchPaymentTrend } = useDashboardStore();
	const [paymentData, setPaymentData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchData = async () => {
		setLoading(true);
		setError(null);
		setPaymentData([]);
		try {
			const formattedStartDate = dayjs(dates.startDate).format("YYYY-MM-DDTHH:mm:ss");
			const formattedEndDate = dayjs(dates.endDate).format("YYYY-MM-DDTHH:mm:ss");
			const data = await fetchPaymentTrend(formattedStartDate, formattedEndDate);
			setPaymentData(data);
		} catch (err) {
			setError("Error fetching payment data.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (dates.startDate && dates.endDate) {
			fetchData();
		}
	}, [dates]);

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
			setPaymentData([]);
		}
	};

	return (
		<Card className="dashboard-card">
			<Title level={2} className="dashboard-title">
				Payments Dashboard
			</Title>
			<DateRangeSelector dates={dates} onDateChange={handleDateChange} />
			<PaymentsDashboardContent loading={loading} error={error} paymentData={paymentData} colorMode={colorMode} dates={dates} />
		</Card>
	);
};

export default PaymentsDashboard;
