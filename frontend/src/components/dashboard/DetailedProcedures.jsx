import React from "react";
import { Card, Typography, List } from "antd";
const { Paragraph } = Typography;

export const DetailedProcedures = ({ data, title, ...others }) => {
	if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
		return (
			<Card title={title} {...others}>
				<Paragraph>No detailed procedures to display.</Paragraph>
			</Card>
		);
	}

	const procedures = Object.entries(data).flatMap(([date, details]) => {
		if (!details || typeof details !== "object" || Object.keys(details).length === 0) {
			return [`${date}: No procedures recorded`];
		}
		return Object.entries(details.procedureCounts).map(([procedure, count]) => `${date} - ${procedure}: ${count}`);
	});

	return (
		<Card title={title} {...others}>
			<List
				dataSource={procedures}
				renderItem={(item) => (
					<List.Item>
						<Typography.Text>{item}</Typography.Text>
					</List.Item>
				)}
			/>
		</Card>
	);
};
