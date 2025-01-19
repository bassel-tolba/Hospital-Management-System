import React, { useState, useEffect, useRef } from "react";
import { Card, Typography, Spin } from "antd";
import { Column, Line } from "@ant-design/charts";

const { Text } = Typography;

const transformYearlyData = (yearlyPayments) => {
	if (!yearlyPayments) return [];

	return Object.entries(yearlyPayments).map(([year, monthlyData]) => {
		const totalYearly = Object.values(monthlyData).reduce((sum, amount) => sum + amount, 0);
		return {
			time: year,
			amount: totalYearly,
			type: "year",
		};
	});
};

const transformMonthlyData = (yearlyPayments, selectedYear) => {
	if (!yearlyPayments || !yearlyPayments[selectedYear]) return [];

	return Object.entries(yearlyPayments[selectedYear]).map(([month, amount]) => ({
		time: month,
		amount: amount,
		type: "month",
		year: selectedYear,
	}));
};

export const CombinedPaymentsChart = ({ title, yearlyPayments, dailyPayments, ...others }) => {
	const [chartData, setChartData] = useState([]);
	const [selectedTime, setSelectedTime] = useState(null); // Track selected year/month
	const [chartType, setChartType] = useState("column");
	const [loading, setLoading] = useState(false);
	const chartRef = useRef(null);

	useEffect(() => {
		// Initial data setup
		setLoading(true);
		const initialData = transformYearlyData(yearlyPayments);
		setChartData(initialData);
		setLoading(false);
	}, [yearlyPayments]);

	const config = {
		xField: "time",
		yField: "amount",
		seriesField: "type",
		label: {
			position: "middle",
			style: {
				fill: "#FFFFFF",
				opacity: 0.6,
			},
		},
		xAxis: {
			label: {
				autoHide: true,
				autoRotate: false,
			},
		},
		yAxis: {
			label: {
				formatter: (value) => `${value}`,
			},
		},
		meta: {
			time: {
				alias: "Time",
			},
			amount: {
				alias: "Amount",
			},
		},
		interactions: [
			{
				type: "element-active",
			},
			{
				type: "element-selected",
				background: false,
			},
		],
		onReady: (chart) => {
			chartRef.current = chart;
			chart.on("element:click", handleChartClick);
		},
	};
	const handleChartClick = (event) => {
		if (!event || !event.data) return;
		const clickedData = event.data;

		if (clickedData.type === "year") {
			setLoading(true);
			const transformedMonthlyData = transformMonthlyData(yearlyPayments, clickedData.time);
			setChartData(transformedMonthlyData);
			setSelectedTime(clickedData.time);
			setChartType("column");
			setLoading(false);
		} else if (clickedData.type === "month") {
			//check if clicked month is inside the last 30 days
			const hasDailyData =
				dailyPayments &&
				Object.keys(dailyPayments).some((day) => {
					const dayDate = new Date(day);
					const month = new Date(`${clickedData.year}-${clickedData.time}-01`);

					return dayDate.getFullYear() === month.getFullYear() && dayDate.getMonth() === month.getMonth();
				});

			if (hasDailyData) {
				setLoading(true);
				const transformedDailyData = Object.entries(dailyPayments)
					.map(([date, amount]) => ({
						time: date,
						amount: amount,
						type: "day",
					}))
					.filter((day) => {
						const dayDate = new Date(day.time);
						const month = new Date(`${clickedData.year}-${clickedData.time}-01`);
						return dayDate.getFullYear() === month.getFullYear() && dayDate.getMonth() === month.getMonth();
					});
				setChartData(transformedDailyData);
				setChartType("line");
				setLoading(false);
			} else {
				setLoading(true);
				const transformedMonthlyData = transformMonthlyData(yearlyPayments, clickedData.year);
				setChartData(transformedMonthlyData);
				setChartType("column");
				setSelectedTime(clickedData.year);
				setLoading(false);
			}
		}
	};

	const handleBackToYearly = () => {
		setLoading(true);
		const transformedYearly = transformYearlyData(yearlyPayments);
		setChartData(transformedYearly);
		setSelectedTime(null);
		setChartType("column");
		setLoading(false);
	};

	const renderChart = () => {
		if (loading) {
			return <Spin size="large" />;
		}
		if (chartType === "column") {
			return <Column {...config} data={chartData} />;
		}
		return <Line {...config} data={chartData} />;
	};

	return (
		<Card
			title={
				<div style={{ display: "flex", justifyContent: "space-between" }}>
					<Text>{title}</Text>
					{selectedTime && (
						<Text type="secondary" style={{ cursor: "pointer" }} onClick={handleBackToYearly}>
							Back to Yearly
						</Text>
					)}
				</div>
			}
			{...others}>
			{renderChart()}
		</Card>
	);
};
