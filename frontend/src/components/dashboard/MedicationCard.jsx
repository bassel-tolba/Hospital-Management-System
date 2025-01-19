import React from "react";
import { Card, Typography, List } from "antd";
import { MoreMenu } from "../index.js"; // Assuming this path is correct for your project.
const { Paragraph } = Typography;

export const MedicationCard = ({ data, title, ...others }) => {
	if (!data || data.length === 0) {
		return (
			<Card title={title} extra={<MoreMenu />} {...others}>
				<Paragraph>No medication administrations to display.</Paragraph>
			</Card>
		);
	}

	const medications = data.map((item) => {
		return `${item.medicationName}: ${item.count}`;
	});

	return (
		<Card title={title} extra={<MoreMenu />} {...others}>
			<List
				dataSource={medications}
				renderItem={(medication) => (
					<List.Item>
						<Typography.Text>{medication}</Typography.Text>
					</List.Item>
				)}
			/>
		</Card>
	);
};
