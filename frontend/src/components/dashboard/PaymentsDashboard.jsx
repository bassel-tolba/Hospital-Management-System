import React, { useState, useEffect, useRef } from "react";
import { Card, DatePicker, Row, Col, Spin, Typography, Select, Button } from "antd";
import { useDashboardStore } from "../../services/dashboardStore.service";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Chart } from "@antv/g2";
import { Pie } from "@antv/g2plot";
import "./Dashboard.css";
import { g2Themes } from "../../App";

dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { Option } = Select;

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

const CategoryFilter = ({ categories, selectedCategories, onCategoryChange, onSelectAll }) => {
	return (
		<div style={{ marginBottom: "16px" }}>
			<Select
				mode="multiple"
				style={{ width: "100%" }}
				placeholder="Search and select categories"
				value={selectedCategories}
				onChange={onCategoryChange}
				allowClear
				showSearch
				filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
				{categories.map((category) => (
					<Option key={category} value={category}>
						{category}
					</Option>
				))}
			</Select>
			<Button onClick={onSelectAll} style={{ marginTop: "8px" }}>
				Select All
			</Button>
		</div>
	);
};

const PaymentsDashboardContent = ({ loading, error, paymentData, colorMode, dates, selectedCategories, showCombined }) => {
	const chartContainerRef = useRef(null);
	const pieChartContainerRef = useRef(null);
	const [chart, setChart] = useState(null);
	const [pieChart, setPieChart] = useState(null);
	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;

		const preprocessData = (nestedData, startDate, endDate, selectedCategories, showCombined) => {
			if (!nestedData || nestedData.length === 0) return [];

			const flattened = nestedData.flat();
			let allCategories = [...new Set(flattened.map((item) => item.category))];

			if (!showCombined && selectedCategories && selectedCategories.length > 0) {
				allCategories = allCategories.filter((category) => selectedCategories.includes(category));
			}

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
				if (showCombined) {
					let totalAmount = 0;
					let totalCount = 0;
					allCategories.forEach((category) => {
						const existingDataPoint = flattened.find((item) => item.date === date && item.category === category);
						if (existingDataPoint) {
							totalAmount += existingDataPoint.amount;
							totalCount += existingDataPoint.count;
						}
					});
					completeData.push({
						date: date,
						category: "All Payments",
						amount: totalAmount,
						count: totalCount,
					});
				} else {
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
				}
			});

			completeData.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
			return completeData;
		};

		const processedData = preprocessData(paymentData, dates.startDate, dates.endDate, selectedCategories, showCombined);

		if (processedData.length > 0 && chartContainerRef.current) {
			if (chart) {
				chart.destroy();
			}
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
				.animate("enter", { type: "pathIn", duration: 1000 })
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
		}

		if (processedData.length > 0 && pieChartContainerRef.current && isMounted.current) {
			const categoryTotals = {};
			if (showCombined) {
				categoryTotals["All Payments"] = processedData.reduce((acc, item) => acc + item.amount, 0);
			} else {
				processedData.forEach((item) => {
					if (item?.category) {
						categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
					}
				});
			}

			const pieChartData = Object.entries(categoryTotals).map(([type, value]) => ({
				type,
				value,
			}));

			let totalSales = pieChartData.reduce((sum, item) => sum + item.value, 0);

			// Correctly destroy the previous chart, if it exists.
			if (pieChart && pieChart.canvas && !pieChart.canvas.destroyed) {
				pieChart.destroy();
			}

			const newPieChart = new Pie(pieChartContainerRef.current, {
				appendPadding: 10,
				data: pieChartData,
				angleField: "value",
				colorField: "type",
				radius: 1,
				innerRadius: 0.5,
				label: {
					type: "inner",
					offset: "-50%",
					content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
					style: {
						textAlign: "center",
						fontSize: 16,
					},
				},
				interactions: [
					{
						type: "element-selected",
					},
					{
						type: "element-active",
					},
				],
				statistic: {
					title: false,
					content: {
						style: {
							whiteSpace: "pre-wrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
							fontSize: 18,
						},
						content: `${totalSales.toLocaleString()}\nsales`,
					},
				},
				theme: g2Themes[colorMode],
			});

			newPieChart.render();
			setPieChart(newPieChart);
		}

		return () => {
			isMounted.current = false;
			if (chart) {
				chart.destroy();
			}
			if (pieChart && pieChart.canvas && !pieChart.canvas.destroyed) {
				pieChart.destroy();
			}
		};
	}, [paymentData, colorMode, dates, selectedCategories, showCombined]);

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

const PaymentsDashboard = ({ colorMode, isOpen }) => {
	const [dates, setDates] = useState({
		startDate: dayjs().startOf("month").format("YYYY-MM-DDTHH:mm:ss"),
		endDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
	});
	const { fetchPaymentTrend } = useDashboardStore();
	const [paymentData, setPaymentData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [allCategories, setAllCategories] = useState([]);
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [showCombined, setShowCombined] = useState(false);

	const fetchData = async () => {
		setLoading(true);
		setError(null);
		setPaymentData([]);
		try {
			const formattedStartDate = dayjs(dates.startDate).format("YYYY-MM-DDTHH:mm:ss");
			const formattedEndDate = dayjs(dates.endDate).format("YYYY-MM-DDTHH:mm:ss");
			const data = await fetchPaymentTrend(formattedStartDate, formattedEndDate);
			setPaymentData(data);

			const flattened = data.flat();
			const categories = [...new Set(flattened.map((item) => item.category))];
			setAllCategories(categories);
			setSelectedCategories([]);
			setShowCombined(false);
		} catch (err) {
			setError("Error fetching payment data.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (dates.startDate && dates.endDate && isOpen) {
			fetchData();
		}
	}, [dates, isOpen, fetchPaymentTrend]);

	const handleDateChange = (selectedDates) => {
		if (selectedDates && selectedDates.length === 2) {
			setDates({
				startDate: selectedDates[0].format("YYYY-MM-DDTHH:mm:ss"),
				endDate: selectedDates[1].format("YYYY-MM-DDTHH:mm:ss"),
			});
		} else {
			setDates({ startDate: null, endDate: null });
			setPaymentData([]);
		}
	};

	const handleCategoryChange = (selected) => {
		setSelectedCategories(selected);
		setShowCombined(false);
	};

	const handleSelectAll = () => {
		setSelectedCategories(allCategories);
		setShowCombined(false);
	};

	const handleToggleCombined = () => {
		setShowCombined((prev) => !prev);
		if (!showCombined) {
			setSelectedCategories([]);
		}
	};

	return (
		<Card className="dashboard-card">
			<Title level={2} className="dashboard-title">
				Payments Dashboard
			</Title>
			<DateRangeSelector dates={dates} onDateChange={handleDateChange} />
			<CategoryFilter
				categories={allCategories}
				selectedCategories={selectedCategories}
				onCategoryChange={handleCategoryChange}
				onSelectAll={handleSelectAll}
			/>
			<Button onClick={handleToggleCombined} style={{ marginBottom: "16px" }}>
				{showCombined ? "Show Separate Categories" : "Show Combined Payments"}
			</Button>
			<PaymentsDashboardContent
				loading={loading}
				error={error}
				paymentData={paymentData}
				colorMode={colorMode}
				dates={dates}
				selectedCategories={selectedCategories}
				showCombined={showCombined}
			/>
		</Card>
	);
};

export default PaymentsDashboard;
