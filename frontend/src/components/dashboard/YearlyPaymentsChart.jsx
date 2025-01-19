import React, { useState, useEffect, useRef } from "react";
import { Card, Typography, Spin } from "antd";
import { Column } from "@ant-design/charts";

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

export const YearlyPaymentsChart = ({ title, yearlyPayments, onYearClick, ...others }) => {
	const [chartData, setChartData] = useState([]);
	const [loading, setLoading] = useState(false);
	const chartRef = useRef(null);

	useEffect(() => {
		setLoading(true);
		const initialData = transformYearlyData(yearlyPayments);
		setChartData(initialData);
		setLoading(false);
	}, [yearlyPayments]);
	const config = {
		data: chartData,
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
				formatter: (value) => `${value}`, // Format number as currency
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
			chart.on("element:click", (event) => {
				if (event && event.data && onYearClick) {
					onYearClick(event.data.time);
				}
			});
		},
	};
	const renderChart = () => {
		if (loading) {
			return <Spin size="large" />;
		}
		return <Column {...config} />;
	};

	return (
		<Card title={<Text>{title}</Text>} {...others}>
			{renderChart()}
		</Card>
	);
};
