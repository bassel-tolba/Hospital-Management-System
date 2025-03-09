// src/components/Dashboard/Dashboard.js
import React, { useState } from "react"; // Import useState
import { Layout, Row, Col, Collapse } from "antd";

import AdmissionsDashboard from "./AdmissionsDashboard";
import PaymentsDashboard from "./PaymentsDashboard";
import BedsDashboard from "./BedsDashboard";
import PatientStatusDashboard from "./PatientStatusDashboard";

const { Content } = Layout;
const { Panel } = Collapse;

const Dashboard = ({ colorMode }) => {
	const [activeKeys, setActiveKeys] = useState(["1", "2", "3", "4"]); //keep track of the active keys

	const handleCollapseChange = (keys) => {
		setActiveKeys(keys); //update the array of activeKeys
	};

	const gradientStyle = {
		background: "linear-gradient(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.05))",
		backdropFilter: "blur(10px)",
		borderRadius: "12px",
	};

	return (
		<Collapse defaultActiveKey={["1", "2", "3", "4"]} accordion={false} onChange={handleCollapseChange}>
			<Panel header="Admissions" key="1">
				<AdmissionsDashboard colorMode={colorMode} isOpen={activeKeys.includes("1")} />
			</Panel>
			<Panel header="Payments" key="2">
				<PaymentsDashboard colorMode={colorMode} isOpen={activeKeys.includes("2")} />
			</Panel>
			<Panel header="Beds" key="3">
				<BedsDashboard isOpen={activeKeys.includes("3")} />
			</Panel>
			<Panel header="Patient Status" key="4">
				<PatientStatusDashboard isOpen={activeKeys.includes("4")} />
			</Panel>
		</Collapse>
	);
};

export default Dashboard;
