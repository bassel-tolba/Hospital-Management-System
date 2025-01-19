import React from "react";
import { Card } from "antd";
import { Line } from "@ant-design/charts";

export const ProceduresChart = ({ data, title, ...others }) => {
	if (!data || data.length === 0) {
		return (
			<Card title={title} {...others}>
				{" "}
				No procedures available{" "}
			</Card>
		);
	}
	const chartData = data.map((item) => ({
		date: item.date,
		count: item.count,
	}));
	const config = {
		data: chartData,
		xField: "date",
		yField: "count",
		xAxis: {
			label: {
				autoHide: true,
				autoRotate: false,
			},
		},
		legend: {
			position: "top-left",
		},
	};
	return (
		<Card title={title} {...others}>
			{/* @ts-ignore */}
			<Line {...config} />
		</Card>
	);
};
