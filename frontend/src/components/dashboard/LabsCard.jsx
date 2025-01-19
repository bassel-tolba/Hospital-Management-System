import React from "react";
import { Card, Typography, List } from "antd";
import { MoreMenu } from "../index.js"; // Assuming this path is correct for your project.
const { Paragraph } = Typography;

export const LabsCard = ({ data, title, ...others }) => {
	if (!data || data.length === 0) {
		return (
			<Card title={title} extra={<MoreMenu />} {...others}>
				<Paragraph>No Lab results to display.</Paragraph>
			</Card>
		);
	}
	const labResults = data.map((item) => {
		return `${item.testName}: ${item.count}`;
	});

	return (
		<Card title={title} extra={<MoreMenu />} {...others}>
			<List
				dataSource={labResults}
				renderItem={(labResult) => (
					<List.Item>
						<Typography.Text>{labResult}</Typography.Text>
					</List.Item>
				)}
			/>
		</Card>
	);
};
