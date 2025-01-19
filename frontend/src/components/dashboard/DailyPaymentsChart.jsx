import React, { useState, useEffect, useRef } from "react";
import { Card, Typography, Spin, Space } from "antd";
import { Line } from "@ant-design/charts";

const { Text } = Typography;

const transformDailyData = (dailyPayments) => {
	if (!dailyPayments) return [];

	return Object.entries(dailyPayments).map(([date, amount]) => ({
		time: date,
		amount: amount,
		type: "day",
	}));
};

export const DailyPaymentsChart = ({ title, dailyPayments, selectedMonth, selectedYear, onBack, ...others }) => {
	const [chartData, setChartData] = useState([]);
	const [loading, setLoading] = useState(false);
	const chartRef = useRef(null);

	useEffect(() => {
		setLoading(true);
		const transformedDailyData = transformDailyData(dailyPayments).filter((day) => {
			const dayDate = new Date(day.time);
			const month = new Date(`${selectedYear}-${selectedMonth}-01`);
			return dayDate.getFullYear() === month.getFullYear() && dayDate.getMonth() === month.getMonth();
		});
		setChartData(transformedDailyData);
		setLoading(false);
	}, [dailyPayments, selectedMonth, selectedYear]);

	const config = {
		data: chartData,
		xField: "time",
		yField: "amount",
		seriesField: "type",
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
		},
	};

	const renderChart = () => {
		if (loading) {
			return (
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						minHeight: "200px", // Ensure some space for the spinner
					}}>
					<Spin size="large" />
				</div>
			);
		}
		return <Line {...config} />;
	};

	return (
		<Card
			title={
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<Text>{title}</Text>
					{onBack && (
						<Text type="secondary" style={{ cursor: "pointer" }} onClick={onBack}>
							Back to Monthly
						</Text>
					)}
				</div>
			}
			{...others}>
			{renderChart()}
		</Card>
	);
};
