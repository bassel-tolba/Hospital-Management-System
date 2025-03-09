// AssessmentList.js
import React, { useState, useEffect } from "react";
import { Table, Button, Space, Typography, Modal, AutoComplete, Row, Col, Spin, notification } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, FileTextOutlined } from "@ant-design/icons";
import moment from "moment";
import axios from "axios";
import { useAuthStore } from "../../services/auth.service";
import AssessmentForm from "./AssessmentForm";
import html2pdf from "html2pdf.js";
import { usePatientStore } from "../../services/patient.service";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Import for table support (even if not used now, good to have)
const { Title } = Typography;

const AssessmentList = ({ darkMode }) => {
	const [assessments, setAssessments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedAssessment, setSelectedAssessment] = useState(null);
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [patientOptions, setPatientOptions] = useState([]);
	const [searchParams, setSearchParams] = useState({});
	const { user, hasAuthority } = useAuthStore();
	const API_BASE_URL = `/api/assessments`;
	const { patients, searchPatients } = usePatientStore();

	const canCreateAssessment = hasAuthority("CREATE_ASSESSMENT");
	const canReadAssessment = hasAuthority("READ_ASSESSMENT");
	const canUpdateAssessment = hasAuthority("UPDATE_ASSESSMENT");
	const canDeleteAssessment = hasAuthority("DELETE_ASSESSMENT");

	useEffect(() => {
		fetchAssessments();
	}, [page, size, searchParams]);

	const fetchAssessments = async () => {
		// ... (rest of your fetchAssessments function remains the same)
		if (!canReadAssessment) {
			notification.error({ message: "Permission Denied", description: "You do not have permission." });
			return;
		}
		if (!searchParams?.patientId) {
			setAssessments([]);
			return;
		}
		setLoading(true);
		try {
			const response = await axios.get(`${API_BASE_URL}/patient/${searchParams.patientId}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
				params: { page, size },
			});
			setAssessments(response.data.content);
			setTotal(response.data.totalElements);
		} catch (error) {
			//setError(error.message); No need to set a separate error state
			notification.error({ message: "Error", description: `Failed to fetch: ${error.message}` });
		} finally {
			setLoading(false);
		}
	};

	const showModal = (assessment = null) => {
		setSelectedAssessment(assessment);
		setIsModalVisible(true);
	};
	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedAssessment(null);
	};
	const handleSave = () => {
		fetchAssessments();
		setIsModalVisible(false);
		setSelectedAssessment(null);
	};
	const handlePatientSearch = async (value) => {
		// ... (rest of your handlePatientSearch function remains the same)
		if (value) {
			try {
				const searchResults = await searchPatients({ searchTerm: value, page: 0, size: 10 });
				setPatientOptions(
					searchResults?.content?.map((patient) => ({
						label: `${patient.firstName} ${patient.lastName}`,
						value: patient.id,
					})) || []
				);
			} catch (error) {
				console.error("Failed to search patients:", error);
				setPatientOptions([]);
			}
		} else {
			setPatientOptions([]);
		}
	};

	const handleDelete = async (id) => {
		// ... (rest of your handleDelete function remains the same)
		if (!canDeleteAssessment) {
			notification.error({ message: "Permission Denied", description: "No delete permission." });
			return;
		}
		setLoading(true);
		try {
			await axios.delete(`${API_BASE_URL}/${id}`, { headers: { Authorization: `Bearer ${user?.token}` } });
			notification.success({ message: "Success", description: "Assessment deleted." });
			fetchAssessments();
		} catch (error) {
			notification.error({ message: "Error", description: `Delete failed: ${error.message}` });
		} finally {
			setLoading(false);
		}
	};

	const handleSearchPatientFilter = (patientId) => {
		// ... (rest of your handleSearchPatientFilter function remains the same)
		setSearchParams({ ...searchParams, patientId: patientId });
		setPage(0);
	};

	const handleTableChange = (pagination) => {
		// ... (rest of your handleTableChange function remains the same)
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};
	const exportPdf = async (notes, assessmentDateTime) => {
		if (!canReadAssessment) {
			notification.error({ message: "Permission Denied", description: "No export permission." });
			return;
		}
		if (!notes) {
			notification.error({ message: "Error", description: "No notes to export." });
			return;
		}

		try {
			const iframe = document.createElement("iframe");
			iframe.style.display = "none";
			document.body.appendChild(iframe);
			const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

			const container = iframeDocument.createElement("div");
			container.innerHTML = notes;
			container.className = "assessment-container";

			const styleSheet = iframeDocument.createElement("style");

			iframeDocument.head.appendChild(styleSheet);
			iframeDocument.body.appendChild(container);

			const formattedDateTime = moment(assessmentDateTime).format("YYYY-MM-DD_HH-mm-ss");
			const options = {
				margin: [10, 5, 15, 5], // top, right, bottom, left - adjusted for more consistent margins
				filename: `assessment_${formattedDateTime}.pdf`,
				image: { type: "jpeg", quality: 1 },
				html2canvas: {
					scale: 4,
					useCORS: true,
					letterRendering: true,
					logging: false,
				},
				jsPDF: {
					unit: "mm",
					format: "a4",
					orientation: "portrait",
					compress: true,
				},
				pagebreak: { mode: ["avoid-all", "css", "legacy"] },
			};

			await html2pdf().from(iframeDocument.body).set(options).save();
			document.body.removeChild(iframe);
			notification.success({ message: "Success", description: "PDF exported." });
		} catch (error) {
			notification.error({ message: "Error", description: `PDF generation failed: ${error.message}` });
		}
	};
	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: "20px" }}>
				<Spin size="large" />
			</div>
		);
	}

	return (
		// ... (rest of your JSX remains the same)
		<div style={{ padding: 20 }}>
			<Title level={2}>Patient Assessments</Title>
			<Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12} md={8}>
					<AutoComplete
						style={{ width: "100%" }}
						options={patientOptions}
						onSearch={handlePatientSearch}
						disabled={!canReadAssessment}
						placeholder="Search for a patient"
						filterOption={false}
						onSelect={handleSearchPatientFilter}
					/>
				</Col>
				<Col xs={24} sm={12} md={8}>
					{canCreateAssessment && (
						<Button type="default" icon={<PlusOutlined />} onClick={() => showModal(null)} disabled={!searchParams?.patientId}>
							Add New Assessment
						</Button>
					)}
				</Col>
			</Row>
			<Table
				columns={[
					{
						title: "Date & Time",
						dataIndex: "assessmentDateTime",
						key: "assessmentDateTime",
						render: (text) => (canReadAssessment ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "***"),
					},
					{
						title: "Actions",
						key: "actions",
						render: (text, record) => (
							<Space size="middle">
								{canUpdateAssessment && (
									<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record)}>
										Edit
									</Button>
								)}
								{canDeleteAssessment && (
									<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
										Delete
									</Button>
								)}
								{canReadAssessment && (
									<Button
										type="default"
										icon={<FileTextOutlined />}
										onClick={() => exportPdf(record.notes, record.assessmentDateTime)}>
										Export PDF
									</Button>
								)}
							</Space>
						),
					},
				]}
				dataSource={assessments}
				loading={loading}
				rowKey="id"
				pagination={{
					current: page + 1,
					pageSize: size,
					total,
					onChange: (page, pageSize) => {
						setPage(page - 1);
						setSize(pageSize);
					},
				}}
				scroll={{ x: "max-content" }}
			/>

			<Modal
				title={selectedAssessment ? "Edit Assessment" : "Add Assessment"}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={null} // Remove default footer
				width="90%"
				style={{ top: 20 }}
				bodyStyle={{ overflowX: "auto" }}
				maskClosable={false}
				destroyOnClose={true}>
				<AssessmentForm
					assessment={selectedAssessment}
					onSave={handleSave}
					onCancel={handleCancel}
					darkMode={darkMode}
					canCreateAssessment={canCreateAssessment}
					canUpdateAssessment={canUpdateAssessment}
				/>
			</Modal>
		</div>
	);
};

export default AssessmentList;
