import React from "react";
import { Bar } from "@ant-design/charts";
import { Card, Spin, Space } from "antd";
import { MoreMenu } from "../index.js"; // Assuming this path is correct for your project.

const BarChart = ({ data, loading }) => {
	// Check if data is valid
	if (!data || data.length === 0) {
		return (
			<Space direction="vertical" style={{ width: "100%", justifyContent: "center", alignItems: "center" }}>
				{loading ? <Spin /> : "No data provided"}
			</Space>
		);
	}

	const config = {
		data,
		xField: "type", // Changed to use 'type' as category
		yField: "value", // Changed to use 'value' as the bar height
		seriesField: "type", // Keep this if you want different bar colours for each 'type'
		legend: {
			position: "top-left",
		},
		meta: {
			value: {
				formatter: (v) => {
					return `${v} hours`;
				},
			},
		},
	};

	return <Bar {...config} />;
};

export const DailyPlanCard = ({ data, title, loading = false, extra, ...others }) => {
	return (
		<Card title={title} extra={extra} {...others}>
			<BarChart data={data || []} loading={loading} />
		</Card>
	);
};
