import React from "react";
import { Card, Typography } from "antd";

export const LengthOfStayCard = ({ title, value, ...others }) => {
	return (
		<Card title={title} {...others}>
			<Typography.Title level={3} style={{ margin: 0 }}>
				{value || "N/A"} Days
			</Typography.Title>
		</Card>
	);
};
