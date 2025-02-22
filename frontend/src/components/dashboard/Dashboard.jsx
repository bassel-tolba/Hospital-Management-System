// src/components/Dashboard/Dashboard.js
import React, { useState, useMemo, useCallback } from "react";
import { Layout, Row, Col } from "antd";

import AdmissionsDashboard from "./AdmissionsDashboard";
import PaymentsDashboard from "./PaymentsDashboard"; // Import the new component

const { Content } = Layout;

const Dashboard = ({ colorMode }) => {
	return (
		<Layout>
			<Content style={{ padding: "24px" }}>
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<AdmissionsDashboard colorMode={colorMode} />
					</Col>
					<Col span={24}>
						<PaymentsDashboard colorMode={colorMode} /> {/* Add the new component */}
					</Col>
				</Row>
			</Content>
		</Layout>
	);
};

export default Dashboard;
