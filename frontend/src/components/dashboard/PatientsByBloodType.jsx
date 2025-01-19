import React from "react";
import { Card, Typography, List } from "antd";
const { Paragraph } = Typography;

export const PatientsByBloodType = ({ data, title, ...others }) => {
	if (!data || data.length === 0) {
		return (
			<Card title={title} {...others}>
				<Paragraph>No patients blood type to display.</Paragraph>
			</Card>
		);
	}
	const bloodTypes = data.map((item) => {
		const bloodType = item.bloodType === null ? "Unknown" : item.bloodType;
		return `${bloodType}: ${item.count}`;
	});

	return (
		<Card title={title} {...others}>
			<List
				dataSource={bloodTypes}
				renderItem={(item) => (
					<List.Item>
						<Typography.Text>{item}</Typography.Text>
					</List.Item>
				)}
			/>
		</Card>
	);
};
