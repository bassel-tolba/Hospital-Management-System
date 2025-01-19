import React from "react";
import { Button, Card, Col, Dropdown, Flex, Row, Space, Typography } from "antd";
import { RadialBar } from "@ant-design/charts";
import { DownOutlined } from "@ant-design/icons";
import { MoreMenu } from "../index.js"; // Assuming this path is correct for your project.

const RadialChart = ({ data }) => {
	const config = {
		data: data,
		height: 240,
		xField: "name",
		yField: "count",
		maxAngle: 270,
		radius: 1,
		innerRadius: 0.5,
		tooltip: {
			formatter: (datum) => {
				return {
					name: "count",
					value: datum.count,
				};
			},
		},
		colorField: "count",
		color: ({ color }) => color,
		barBackground: {},
		barStyle: {
			lineCap: "round",
		},
		xAxis: {
			title: null, // Hide x-axis title
			label: null, // Hide x-axis labels
		},
	};

	// @ts-ignore
	return <RadialBar {...config} />;
};

export const ProgressCard = ({ title, total, statuses, ...others }) => {
	return (
		<Card title={title} extra={<></>} {...others}>
			<Flex vertical gap="middle">
				<RadialChart data={statuses} />
				<Typography.Paragraph style={{ textAlign: "center" }}>
					Total: <b>{total}</b>
				</Typography.Paragraph>
				<Row>
					{statuses.map((status, index) => (
						<Col key={index} span={8}>
							<div style={{ display: "flex", gap: "4px" }}>
								<div
									style={{
										height: "20px",
										width: "8px",
										backgroundColor: status.color,
										borderRadius: "4px",
									}}
								/>
								<Space direction="vertical" size={2}>
									<Typography.Text strong>{status.count}</Typography.Text>
									<Typography.Text>{status.name}</Typography.Text>
								</Space>
							</div>
						</Col>
					))}
				</Row>
			</Flex>
		</Card>
	);
};
