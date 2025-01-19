// PieChartComponent.jsx
import React from "react";
import { Pie } from "@ant-design/charts";

const PieChartComponent = ({ data, title }) => {
	const config = {
		data,
		angleField: "value",
		colorField: "type",
		legend: {
			position: "bottom",
		},
		title: {
			text: title,
			align: "left",
		},
	};

	return <Pie {...config} />;
};

export default PieChartComponent;
