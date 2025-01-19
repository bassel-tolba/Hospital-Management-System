import React from "react";
import { Card } from "antd";
import { Pie } from "@ant-design/charts";

export const BedsByUnitTypeChart = ({ data, title, ...others }) => {
	if (!data || data.length === 0) {
		return (
			<Card title={title} {...others}>
				No beds by unit type to display.
			</Card>
		);
	}
	const pieData = data.map((item) => ({
		type: item.unitType,
		value: item.count,
	}));
	const config = {
		appendPadding: 10,
		data: pieData,
		angleField: "value",
		colorField: "type",
		radius: 1,
		innerRadius: 0.6,
		label: {
			type: "inner",
			offset: "-50%",
			content: "{value}",
			style: {
				textAlign: "center",
				fontSize: 14,
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
				},
				content: "",
			},
		},
	};

	return (
		<Card title={title} {...others}>
			<div style={{ height: 300, textAlign: "center" }}>
				{/*@ts-ignore*/}
				<Pie {...config} />
			</div>
		</Card>
	);
};
