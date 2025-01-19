import React, { useState, useEffect, useRef } from "react";
import { Card, Typography, Spin } from "antd";
import { Column } from "@ant-design/charts";

const { Text } = Typography;

const transformMonthlyData = (yearlyPayments, selectedYear) => {
	if (!yearlyPayments || !yearlyPayments[selectedYear]) return [];

	return Object.entries(yearlyPayments[selectedYear]).map(([month, amount]) => ({
		time: month,
		amount: amount,
		type: "month",
		year: selectedYear,
	}));
};

export const MonthlyPaymentsChart = ({ title, yearlyPayments, selectedYear, onMonthClick, onBack, ...others }) => {
	const [chartData, setChartData] = useState([]);
	const [loading, setLoading] = useState(false);

	const chartRef = useRef(null);
	useEffect(() => {
		setLoading(true);
		const initialData = transformMonthlyData(yearlyPayments, selectedYear);
		setChartData(initialData);
		setLoading(false);
	}, [yearlyPayments, selectedYear]);

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
			chart.on("element:click", (event) => {
				if (event && event.data && onMonthClick) {
					onMonthClick(event.data);
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
		<Card
			title={
				<div style={{ display: "flex", justifyContent: "space-between" }}>
					<Text>{title}</Text>
					{onBack && (
						<Text type="secondary" style={{ cursor: "pointer" }} onClick={onBack}>
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
