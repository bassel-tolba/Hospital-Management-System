import React, { useState, useRef, useEffect } from "react";
import { Layout, Card, Typography, Divider, Button, Modal, Row, Col } from "antd";
import ActivityList from "../components/users/ActivityList";
import CreateActivityForm from "../components/users/CreateActivityForm";
import UserActivityList from "../components/users/UserActivityList";
import { useActivityStore } from "../services/activity.service";
import { useAuthStore } from "../services/auth.service";

const { Content } = Layout;
const { Title } = Typography;

const ActivityPage = () => {
	const { getAllActivities } = useActivityStore();
	const [formVisible, setFormVisible] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const formRef = useRef(null);
	const [initialRender, setInitialRender] = useState(true);
	const { user } = useAuthStore();

	const isAdminOrHeadNurse = user && (user.role === "ADMIN" || user.role === "HEAD_NURSE");

	useEffect(() => {
		if (initialRender && formRef.current) {
			setFormVisible(false);
			setInitialRender(false);
		}
	}, [initialRender]);

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
						<Card title={<Title level={5}>All Activities</Title>}>
							<div style={{ margin: "0 -16px" }}>
								<ActivityList />
							</div>
						</Card>
					</Col>
				)}

				<Col xs={24} md={24}>
					<Card title={<Title level={5}>User Activities</Title>}>
						<div style={{ margin: "0 -16px" }}>
							<UserActivityList />
						</div>
					</Card>
				</Col>
			</Row>
		</Layout>
	);
};

export default ActivityPage;
