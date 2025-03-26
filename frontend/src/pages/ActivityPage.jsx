// frontend/src/pages/ActivityPage.js
import React, { useState, useRef, useEffect } from "react";
import { Layout, Card, Typography, Divider, Button, Modal, Row, Col } from "antd";
import ActivityList from "../components/users/ActivityList";
import CreateActivityForm from "../components/users/CreateActivityForm";
import UserActivityList from "../components/users/UserActivityList";
import { useActivityStore } from "../services/activity.service";
import { useAuthStore } from "../services/auth.service";
import { useTranslation } from "react-i18next";
//NEW IMPORTS
import { useAppointmentStore } from "../services/appointment.service";
import UserAppointmentList from "../components/appointments/UserAppointmentList";

const { Content } = Layout;
const { Title } = Typography;

const ActivityPage = () => {
	const { getAllActivities } = useActivityStore();
	const [formVisible, setFormVisible] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const formRef = useRef(null);
	const [initialRender, setInitialRender] = useState(true);
	const { user } = useAuthStore();
	const { t } = useTranslation();
	const { userAppointments, getUserAppointments, loading: appointmentsLoading } = useAppointmentStore(); // Get appointments and loading state

	const isAdminOrHeadNurse = user && (user.role === "ADMIN" || user.role === "HEAD_NURSE");

	useEffect(() => {
		if (initialRender && formRef.current) {
			setFormVisible(false);
			setInitialRender(false);
		}
	}, [initialRender]);

	useEffect(() => {
		if (user) {
			getUserAppointments(user.id);
		}
	}, [getUserAppointments, user]);

	const showModal = () => {
		setIsModalOpen(true);
	};

	const handleCancel = () => {
		setIsModalOpen(false);
	};

	return (
		<Layout>
			<Row gutter={[24, 24]}>
				{isAdminOrHeadNurse && (
					<Col xs={24} md={24}>
						<Card title={<Title level={5}>{t("all-activities")}</Title>}>
							<div style={{ margin: "0 -16px" }}>
								<ActivityList />
							</div>
						</Card>
					</Col>
				)}

				<Col xs={24} md={24}>
					<Card title={<Title level={5}>{t("user-activities")}</Title>}>
						<div style={{ margin: "0 -16px" }}>
							<UserActivityList />
						</div>
					</Card>
				</Col>
				{/* New Section for User Appointments */}
				<Col xs={24} md={24}>
					<Card title={<Title level={5}>{t("user-appointments")}</Title>}>
						<div style={{ margin: "0 -16px" }}>
							{appointmentsLoading ? (
								<p>Loading appointments...</p> // Or use a spinner
							) : (
								<UserAppointmentList appointments={userAppointments} />
							)}
						</div>
					</Card>
				</Col>
			</Row>
		</Layout>
	);
};

export default ActivityPage;
