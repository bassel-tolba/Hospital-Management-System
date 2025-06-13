// src/components/assessments/AssessmentList.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, Space, Typography, Modal, AutoComplete, Row, Col, Spin, notification, Tooltip, Input, Divider, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, PrinterOutlined } from "@ant-design/icons";
import moment from "moment";
import axios from "axios";
import { useAuthStore } from "../../services/auth.service"; // Adjust path if needed
import AssessmentForm from "./AssessmentForm"; // Adjust path if needed
import { usePatientStore } from "../../services/patient.service"; // Adjust path if needed
import debounce from "lodash/debounce";
import AssessmentTypeManagement from "./AssessmentTypeManagement"; // Adjust path if needed
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;
const logTime = () => `[${new Date().toLocaleTimeString()}.${String(new Date().getMilliseconds()).padStart(3, "0")}]`;

const AssessmentList = ({ darkMode }) => {
	const { t, i18n } = useTranslation();
	const [assessments, setAssessments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isAssessmentModalVisible, setIsAssessmentModalVisible] = useState(false);
	const [selectedAssessment, setSelectedAssessment] = useState(null);
	const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
	const [patientOptions, setPatientOptions] = useState([]);
	const [isSearchingPatients, setIsSearchingPatients] = useState(false);
	const [selectedPatientFilter, setSelectedPatientFilter] = useState(null);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");

	// --- Auth and Permissions ---
	const { user, hasAuthority } = useAuthStore();
	const canCreateAssessment = useMemo(() => hasAuthority("CREATE_ASSESSMENT"), [hasAuthority]);
	const canReadAssessment = useMemo(() => hasAuthority("READ_ASSESSMENT"), [hasAuthority]);
	const canUpdateAssessment = useMemo(() => hasAuthority("UPDATE_ASSESSMENT"), [hasAuthority]);
	const canDeleteAssessment = useMemo(() => hasAuthority("DELETE_ASSESSMENT"), [hasAuthority]);

	console.log(`${logTime()} AssessmentList: Initializing. Permissions:`, {
		create: canCreateAssessment,
		read: canReadAssessment,
		update: canUpdateAssessment,
		delete: canDeleteAssessment,
	});

	// --- Other Stores & Config ---
	const { searchPatients } = usePatientStore();
	const API_BASE_URL = `http://localhost:8080/api/assessments`;

	// --- Fetch Assessments Function ---
	const fetchAssessments = useCallback(
		async (patientId, page = 0, size = 10) => {
			console.log(`${logTime()} AssessmentList: Fetching assessments. Patient ID: ${patientId}, Page: ${page}, Size: ${size}`);
			if (!canReadAssessment) {
				console.warn(`${logTime()} AssessmentList: Fetch skipped - No READ_ASSESSMENT permission.`);
				setAssessments([]);
				setPagination((prev) => ({ ...prev, total: 0, current: 1 }));
				setLoading(false);
				return;
			}
			if (!patientId) {
				console.log(`${logTime()} AssessmentList: Fetch skipped - No patient ID provided.`);
				setAssessments([]);
				setPagination((prev) => ({ ...prev, total: 0, current: 1 }));
				setLoading(false);
				return;
			}

			setLoading(true);
			try {
				const response = await axios.get(`${API_BASE_URL}/patient/${patientId}`, {
					headers: { Authorization: `Bearer ${user?.token}` },
					params: { page, size },
				});
				console.log(`${logTime()} AssessmentList: Fetch successful. Found ${response.data?.totalElements || 0} assessments.`);

				// Ensure patientName is populated from the filter if missing in response
				const patientNameFromFilter = selectedPatientFilter?.name;
				const fetchedAssessments = (response.data.content || []).map((a) => ({
					...a,
					patientName: a.patientName || patientNameFromFilter || t("common.unknownPatient"), // Ensure name exists
				}));

				setAssessments(fetchedAssessments);
				setPagination((prev) => ({
					...prev,
					total: response.data.totalElements || 0,
					current: (response.data.number || 0) + 1,
					pageSize: response.data.size || size,
				}));
			} catch (error) {
				console.error(`${logTime()} AssessmentList: Failed to fetch assessments:`, error.response || error);
				notification.error({
					message: t("common.error"),
					description: t("assessmentList.notifications.fetchError", { error: error.response?.data?.message || error.message }),
				});
				setAssessments([]);
				setPagination((prev) => ({ ...prev, total: 0, current: 1 }));
			} finally {
				setLoading(false);
			}
		},
		[API_BASE_URL, user?.token, canReadAssessment, selectedPatientFilter?.name, t], // Keep t dependency
	);

	// --- Effect for Fetching on Filter/Pagination Change ---
	useEffect(() => {
		console.log(
			`${logTime()} AssessmentList: useEffect [selectedPatientFilter, pagination.current, pagination.pageSize, canReadAssessment] triggered.`,
		);
		if (selectedPatientFilter?.id) {
			if (canReadAssessment) {
				const pageToFetch = pagination.current - 1;
				fetchAssessments(selectedPatientFilter.id, pageToFetch, pagination.pageSize);
			} else {
				console.log(`${logTime()} AssessmentList: Patient selected, but user lacks READ permission. Clearing table.`);
				setAssessments([]);
				setPagination((prev) => ({ ...prev, total: 0, current: 1 }));
			}
		} else {
			console.log(`${logTime()} AssessmentList: No patient filter selected. Clearing table.`);
			setAssessments([]);
			setPagination((prev) => ({ ...prev, total: 0, current: 1 }));
		}
	}, [selectedPatientFilter, pagination.current, pagination.pageSize, fetchAssessments, canReadAssessment]); // fetchAssessments dependency includes canReadAssessment

	// --- Debounced Patient Search for Filter ---
	const debouncedPatientSearchForFilter = useCallback(
		debounce(async (value) => {
			console.log(`${logTime()} AssessmentList: Debounced filter search for: "${value}"`);
			if (!value || value.length < 2) {
				setPatientOptions([]);
				setIsSearchingPatients(false);
				return;
			}
			setIsSearchingPatients(true);
			try {
				const searchResults = await searchPatients({ searchTerm: value, page: 0, size: 10 });
				const options =
					searchResults?.content?.map((patient) => ({
						label: `${patient.firstName} ${patient.lastName} (${t("common.id")}: ${patient.id})`,
						value: patient.id,
						key: patient.id,
						name: `${patient.firstName} ${patient.lastName}`,
					})) || [];
				console.log(`${logTime()} AssessmentList: Filter search yielded ${options.length} results.`);
				setPatientOptions(options);
			} catch (error) {
				console.error(`${logTime()} AssessmentList: Failed to search patients for filter:`, error);
				notification.error({ message: t("common.error"), description: t("assessmentList.notifications.patientSearchError") });
				setPatientOptions([]);
			} finally {
				setIsSearchingPatients(false);
			}
		}, 500),
		[searchPatients, t], // Keep t dependency
	);

	// --- Modal Handlers ---
	const showAssessmentModal = (assessment = null) => {
		console.log(`${logTime()} AssessmentList: showAssessmentModal called. Assessment ID: ${assessment?.id}`);
		if (assessment && !canUpdateAssessment) {
			console.warn(`${logTime()} AssessmentList: Edit prevented - No UPDATE permission.`);
			notification.warning({ message: t("common.permissionDenied"), description: t("assessmentList.notifications.editPermissionDenied") });
			return;
		}
		if (!assessment && !canCreateAssessment) {
			console.warn(`${logTime()} AssessmentList: Add prevented - No CREATE permission.`);
			notification.warning({ message: t("common.permissionDenied"), description: t("assessmentList.notifications.addPermissionDenied") });
			return;
		}

		if (assessment && !assessment.patientName && selectedPatientFilter?.id === assessment.patientId) {
			console.log(`${logTime()} AssessmentList: Populating missing patientName from filter for assessment ID ${assessment.id}`);
			assessment.patientName = selectedPatientFilter.name;
		} else if (assessment && !assessment.patientName) {
			console.warn(`${logTime()} AssessmentList: Opening assessment ID ${assessment.id} without patientName.`);
			assessment.patientName = t("common.unknownPatient"); // Provide a fallback
		}

		setSelectedAssessment(assessment);
		setIsAssessmentModalVisible(true);
		console.log(`${logTime()} AssessmentList: Modal should be visible now.`);
	};

	const handleAssessmentCancel = () => {
		console.log(`${logTime()} AssessmentList: handleAssessmentCancel called.`);
		setIsAssessmentModalVisible(false);
		setSelectedAssessment(null);
	};

	const handleAssessmentSave = () => {
		console.log(`${logTime()} AssessmentList: handleAssessmentSave called (after form success).`);
		setIsAssessmentModalVisible(false);
		setSelectedAssessment(null);
		if (selectedPatientFilter?.id && canReadAssessment) {
			console.log(`${logTime()} AssessmentList: Refreshing assessment list after save.`);
			const pageToFetch = 0;
			const currentFirstPage = pagination.current === 1;
			setPagination((prev) => ({ ...prev, current: 1 }));
			if (currentFirstPage) {
				fetchAssessments(selectedPatientFilter.id, pageToFetch, pagination.pageSize);
			}
		} else {
			console.log(`${logTime()} AssessmentList: Not refreshing list (no patient selected or no read permission).`);
		}
	};

	// --- Patient Filter Handlers ---
	const handlePatientSearchFilterChange = (value) => {
		console.log(`${logTime()} AssessmentList: Patient filter search input changed: "${value}"`);
		setPatientSearchTerm(value);
		if (!value) {
			console.log(`${logTime()} AssessmentList: Patient filter cleared.`);
			setSelectedPatientFilter(null);
			setPatientOptions([]);
		} else {
			debouncedPatientSearchForFilter(value);
		}
	};

	const handleSearchPatientFilterSelect = (patientId, option) => {
		console.log(`${logTime()} AssessmentList: Patient selected for filter: ID ${patientId}, Name "${option.name}"`);
		setSelectedPatientFilter({ id: patientId, name: option.name });
		setPatientSearchTerm(option.label);
		setPatientOptions([]);
	};

	// --- Delete Assessment Handler ---
	const handleDeleteAssessment = async (id) => {
		console.log(`${logTime()} AssessmentList: Attempting to delete assessment ID: ${id}`);
		if (!canDeleteAssessment) {
			console.warn(`${logTime()} AssessmentList: Delete prevented - No DELETE permission.`);
			notification.error({ message: t("common.permissionDenied"), description: t("assessmentList.notifications.deletePermissionDenied") });
			return;
		}
		setLoading(true);
		try {
			await axios.delete(`${API_BASE_URL}/${id}`, { headers: { Authorization: `Bearer ${user?.token}` } });
			console.log(`${logTime()} AssessmentList: Delete successful for ID: ${id}`);
			notification.success({ message: t("common.success"), description: t("assessmentList.notifications.deletedSuccess") });

			if (canReadAssessment && selectedPatientFilter?.id) {
				console.log(`${logTime()} AssessmentList: Refreshing list after delete.`);
				const isLastItemOnPage = assessments.length === 1 && pagination.current > 1;
				const pageToFetch = isLastItemOnPage ? pagination.current - 2 : pagination.current - 1;
				const targetPageForState = isLastItemOnPage ? pagination.current - 1 : pagination.current;

				if (targetPageForState === pagination.current) {
					fetchAssessments(selectedPatientFilter.id, pageToFetch, pagination.pageSize);
				} else {
					setPagination((prev) => ({ ...prev, current: targetPageForState }));
				}
			} else {
				console.log(`${logTime()} AssessmentList: Clearing local list after delete (no read permission or no filter).`);
				setAssessments([]);
				setPagination((prev) => ({ ...prev, current: 1, total: 0 }));
				setLoading(false);
			}
		} catch (error) {
			console.error(`${logTime()} AssessmentList: Delete failed for assessment ID: ${id}:`, error.response || error);
			notification.error({
				message: t("common.error"),
				description: t("assessmentList.notifications.deleteError", { error: error.response?.data?.message || error.message }),
			});
			setLoading(false);
		}
	};

	// --- Print Assessment Handler ---
	const handlePrintAssessment = useCallback(
		(assessment) => {
			console.log(`${logTime()} AssessmentList: Attempting to print assessment ID: ${assessment.id}`);
			if (!canReadAssessment) {
				console.warn(`${logTime()} AssessmentList: Print prevented - No READ permission.`);
				notification.error({
					message: t("common.permissionDenied"),
					description: t("assessmentList.notifications.printPermissionDenied", "You do not have permission to print this assessment."),
				});
				return;
			}

			const patientName = assessment.patientName || t("common.unknownPatient");
			const assessmentDate = moment(assessment.assessmentDateTime).format("YYYY-MM-DD HH:mm");

			const printContent = `
            <!DOCTYPE html>
            <html lang="${i18n.language}">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${t("assessmentList.print.title", "Assessment for {{name}}", { name: patientName })}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; line-height: 1.5; margin: 2rem; }
                    .print-header { padding-bottom: 1rem; margin-bottom: 1.5rem; border-bottom: 2px solid #dee2e6; }
                    h1 { font-size: 1.75rem; margin: 0; }
                    .meta-info { margin-top: 0.5rem; font-size: 1rem; color: #495057; }
                    .notes-content { margin-top: 1.5rem; }
                    @media print {
                        body { margin: 1in; }
                        .print-header { border-bottom: 2px solid #000; }
                    }
                </style>
            </head>
            <body>
                <header class="print-header">
                    <h1>${t("assessmentList.print.header", "Assessment Report")}</h1>
                    <div class="meta-info">
                        <strong>${t("assessmentList.print.patientLabel", "Patient")}:</strong> ${patientName}
                    </div>
                    <div class="meta-info">
                        <strong>${t("assessmentList.print.dateLabel", "Date")}:</strong> ${assessmentDate}
                    </div>
                </header>
                <main class="notes-content">
                    ${assessment.notes || `<p><em>${t("common.noContent")}</em></p>`}
                </main>
            </body>
            </html>
        `;

			const iframe = document.createElement("iframe");
			iframe.style.position = "absolute";
			iframe.style.width = "0";
			iframe.style.height = "0";
			iframe.style.border = "none";
			document.body.appendChild(iframe);

			const doc = iframe.contentDocument || iframe.contentWindow.document;
			doc.open();
			doc.write(printContent);
			doc.close();

			iframe.contentWindow.focus();
			iframe.contentWindow.print();

			setTimeout(() => {
				document.body.removeChild(iframe);
			}, 500);
		},
		[canReadAssessment, t, i18n.language],
	);

	// --- Table Pagination Change Handler ---
	const handleTableChange = (newPagination, filters, sorter) => {
		console.log(
			`${logTime()} AssessmentList: handleTableChange triggered. New page: ${newPagination.current}, Page size: ${newPagination.pageSize}`,
		);
		setPagination((prev) => ({
			...prev,
			current: newPagination.current,
			pageSize: newPagination.pageSize,
		}));
	};

	// --- Table Columns Configuration ---
	const assessmentColumns = useMemo(
		() => [
			{
				title: t("assessmentList.table.header.dateTime"),
				dataIndex: "assessmentDateTime",
				key: "assessmentDateTime",
				width: 160,
				sorter: (a, b) => moment(a.assessmentDateTime).unix() - moment(b.assessmentDateTime).unix(),
				sortDirections: ["descend", "ascend"],
				defaultSortOrder: "descend",
				render: (text) => (canReadAssessment ? moment(text).format("YYYY-MM-DD HH:mm") : <Text disabled>***</Text>),
			},

			{
				title: t("assessmentList.table.header.actions"),
				key: "actions",
				align: "center",
				width: 150,
				fixed: "right",
				render: (text, record) => {
					return (
						<Space size="small" wrap>
							{canUpdateAssessment && (
								<Tooltip title={t("assessmentList.table.actions.editTooltip")}>
									<Button
										type="primary"
										shape="circle"
										icon={<EditOutlined />}
										onClick={() => showAssessmentModal(record)}
										size="small"
									/>
								</Tooltip>
							)}
							{canReadAssessment && (
								<Tooltip title={t("assessmentList.table.actions.printTooltip", "Print Assessment")}>
									<Button shape="circle" icon={<PrinterOutlined />} onClick={() => handlePrintAssessment(record)} size="small" />
								</Tooltip>
							)}
							{canDeleteAssessment && (
								<Popconfirm
									title={t("assessmentList.deleteConfirm.title")}
									description={t("assessmentList.deleteConfirm.description", {
										dateTime: moment(record.assessmentDateTime).format("L LT"),
									})}
									onConfirm={() => handleDeleteAssessment(record.id)}
									okText={t("common.delete")}
									okButtonProps={{ danger: true }}
									cancelText={t("common.cancel")}
									disabled={!canDeleteAssessment}>
									<Tooltip title={t("assessmentList.table.actions.deleteTooltip")}>
										<span>
											<Button
												type="danger"
												shape="circle"
												icon={<DeleteOutlined />}
												size="small"
												disabled={!canDeleteAssessment}
											/>
										</span>
									</Tooltip>
								</Popconfirm>
							)}
							{!canUpdateAssessment && !canReadAssessment && !canDeleteAssessment && (
								<Text disabled style={{ fontSize: "12px" }}>
									{t("common.notAvailableShort")}
								</Text>
							)}
						</Space>
					);
				},
			},
		],
		[t, canReadAssessment, canUpdateAssessment, canDeleteAssessment, handleDeleteAssessment, showAssessmentModal, handlePrintAssessment],
	);

	// --- Empty Table Text Logic ---
	const getEmptyText = useCallback(() => {
		console.log(`${logTime()} AssessmentList: getEmptyText called. canRead: ${canReadAssessment}, patientFilter: ${!!selectedPatientFilter}`);
		if (!canReadAssessment) {
			return <Text disabled>{t("assessmentList.table.empty.noPermission")}</Text>;
		}
		if (loading) {
			return <Spin tip={t("common.loading")} />;
		}
		if (selectedPatientFilter) {
			return t("assessmentList.table.empty.noDataFound");
		}
		return t("assessmentList.table.empty.noPatientSelected");
	}, [canReadAssessment, selectedPatientFilter, t, loading]);

	return (
		<div style={{ padding: "20px 24px" }}>
			<Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[16, 16]}>
				<Col flex="auto">
					<Title level={3} style={{ margin: 0 }}>
						{t("assessmentList.title")}
					</Title>
					{canReadAssessment && selectedPatientFilter && (
						<Text type="secondary">
							{t("assessmentList.showingFor", { name: selectedPatientFilter.name, id: selectedPatientFilter.id })}
						</Text>
					)}
					{!selectedPatientFilter && canReadAssessment && <Text type="secondary">{t("assessmentList.selectPatientPrompt")}</Text>}
					{!canReadAssessment && <Text type="warning">{t("assessmentList.viewPermissionDenied")}</Text>}
				</Col>
			</Row>

			<Row gutter={[16, 16]} align="middle" style={{ marginBottom: 20 }}>
				<Col xs={24} sm={12} md={10} lg={10} xl={8}>
					<Space direction="horizontal" align="center" style={{ width: "100%" }}>
						<Text style={{ fontSize: "12px", whiteSpace: "nowrap", flexShrink: 0 }}>{t("assessmentList.filter.label")}</Text>
						<AutoComplete
							style={{ width: "100%" }}
							options={patientOptions}
							value={patientSearchTerm}
							onSearch={handlePatientSearchFilterChange}
							onSelect={handleSearchPatientFilterSelect}
							disabled={!canReadAssessment}
							placeholder={
								canReadAssessment ? t("assessmentList.filter.placeholder") : t("assessmentList.filter.readPermissionPlaceholder")
							}
							filterOption={false}
							notFoundContent={isSearchingPatients ? <Spin size="small" /> : t("common.noMatch")}
							allowClear
							onClear={() => handlePatientSearchFilterChange("")}>
							<Input suffix={isSearchingPatients ? <Spin size="small" /> : <SearchOutlined />} disabled={!canReadAssessment} />
						</AutoComplete>
					</Space>
				</Col>
				<Col xs={24} sm={12} md={14} lg={14} xl={16} style={{ display: "flex", justifyContent: "flex-end" }}>
					{canCreateAssessment && (
						<Tooltip
							title={
								!selectedPatientFilter
									? t("assessmentList.addAssessment.selectPatientTooltip")
									: t("assessmentList.addAssessment.addTooltip")
							}>
							<span>
								<Button
									type="primary"
									icon={<PlusOutlined />}
									onClick={() => showAssessmentModal(null)}
									disabled={!selectedPatientFilter?.id || !canCreateAssessment}>
									{t("assessmentList.addAssessment.button")}
								</Button>
							</span>
						</Tooltip>
					)}
					{!canCreateAssessment && <div style={{ height: "32px" }} />}
				</Col>
			</Row>

			<Table
				columns={assessmentColumns}
				dataSource={assessments}
				loading={loading && !selectedPatientFilter}
				rowKey="id"
				pagination={canReadAssessment && pagination.total > 0 ? pagination : false}
				onChange={handleTableChange}
				scroll={{ x: "max-content" }}
				locale={{ emptyText: getEmptyText() }}
				bordered
				size="small"
			/>

			<Modal
				title={selectedAssessment ? t("assessmentList.modal.editTitle") : t("assessmentList.modal.addTitle")}
				open={isAssessmentModalVisible}
				onCancel={handleAssessmentCancel}
				footer={null}
				width="90%"
				style={{ top: 20, maxWidth: "1200px" }}
				styles={{ body: { maxHeight: "calc(100vh - 120px)", overflowY: "auto", padding: "20px" } }}
				maskClosable={false}
				destroyOnClose={true}>
				{isAssessmentModalVisible && (
					<AssessmentForm
						assessment={selectedAssessment}
						initialPatient={!selectedAssessment ? selectedPatientFilter : null}
						onSave={handleAssessmentSave}
						onCancel={handleAssessmentCancel}
						darkMode={darkMode}
					/>
				)}
			</Modal>

			<Divider style={{ margin: "40px 0" }} />
			<AssessmentTypeManagement darkMode={darkMode} />
		</div>
	);
};

export default AssessmentList;
