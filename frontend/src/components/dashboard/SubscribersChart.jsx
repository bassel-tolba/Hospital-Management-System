import React from "react";
import { Card, Flex, Typography } from "antd";
import { Column } from "@ant-design/charts";
import { MoreMenu } from "../index.js"; // Assuming this path is correct for your project.

const ColumnChart = ({ data }) => {
	// Ensure data is an object and handle empty case
	if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
		return <Typography.Text>No data available for this chart.</Typography.Text>;
	}

	const chartData = Object.entries(data).map(([date, amount]) => ({
		type: date,
		subscribers: amount,
	}));

	const config = {
		data: chartData,
		xField: "type",
		yField: "subscribers",
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
		meta: {
			type: {
				alias: "Date",
			},
			subscribers: {
				alias: "Payments",
			},
		},
	};
	// @ts-ignore
	return <Column {...config} />;
};

export const SubscribersChart = ({ title, data, ...others }) => {
	return (
		<Card title={title} extra={<MoreMenu />} {...others}>
			<Flex gap="middle" vertical>
				<ColumnChart data={data} />
			</Flex>
		</Card>
	);
};
