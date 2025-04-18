// src/components/assessments/AssessmentList.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, Space, Typography, Modal, AutoComplete, Row, Col, Spin, notification, Tooltip, Input, Divider, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, FileTextOutlined, SearchOutlined } from "@ant-design/icons";
import moment from "moment";
import axios from "axios";
import { useAuthStore } from "../../services/auth.service"; // Adjust path if needed
import AssessmentForm from "./AssessmentForm"; // Adjust path if needed
import html2pdf from "html2pdf.js";
import { usePatientStore } from "../../services/patient.service"; // Adjust path if needed
import debounce from "lodash/debounce";
import AssessmentTypeManagement from "./AssessmentTypeManagement"; // Adjust path if needed
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;
const logTime = () => `[${new Date().toLocaleTimeString()}.${String(new Date().getMilliseconds()).padStart(3, "0")}]`;

const AssessmentList = ({ darkMode }) => {
	const { t } = useTranslation();
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
	const canExportAssessment = canReadAssessment; // Or define specific EXPORT permission if needed

	console.log(`${logTime()} AssessmentList: Initializing. Permissions:`, {
		create: canCreateAssessment,
		read: canReadAssessment,
		update: canUpdateAssessment,
		delete: canDeleteAssessment,
	});

	// --- Other Stores & Config ---
	const { searchPatients } = usePatientStore();
	const API_BASE_URL = `/api/assessments`;

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
		[API_BASE_URL, user?.token, canReadAssessment, selectedPatientFilter?.name, t] // Keep t dependency
	);

	// --- Effect for Fetching on Filter/Pagination Change ---
	useEffect(() => {
		console.log(
			`${logTime()} AssessmentList: useEffect [selectedPatientFilter, pagination.current, pagination.pageSize, canReadAssessment] triggered.`
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
		[searchPatients, t] // Keep t dependency
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

		// Ensure patientName is included if opening an existing assessment for the filtered patient
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
			// Go back to page 1 or refresh current page
			const pageToFetch = 0; // Always go to first page after save/update for simplicity
			const currentFirstPage = pagination.current === 1;
			setPagination((prev) => ({ ...prev, current: 1 })); // Trigger fetch via useEffect
			if (currentFirstPage) {
				// If already on page 1, useEffect won't trigger, so fetch manually
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
		// Pagination reset is handled by the useEffect watching selectedPatientFilter
	};

	// --- Delete Assessment Handler ---
	const handleDeleteAssessment = async (id) => {
		console.log(`${logTime()} AssessmentList: Attempting to delete assessment ID: ${id}`);
		if (!canDeleteAssessment) {
			console.warn(`${logTime()} AssessmentList: Delete prevented - No DELETE permission.`);
			notification.error({ message: t("common.permissionDenied"), description: t("assessmentList.notifications.deletePermissionDenied") });
			return;
		}
		setLoading(true); // Indicate loading during delete
		try {
			await axios.delete(`${API_BASE_URL}/${id}`, { headers: { Authorization: `Bearer ${user?.token}` } });
			console.log(`${logTime()} AssessmentList: Delete successful for ID: ${id}`);
			notification.success({ message: t("common.success"), description: t("assessmentList.notifications.deletedSuccess") });

			if (canReadAssessment && selectedPatientFilter?.id) {
				console.log(`${logTime()} AssessmentList: Refreshing list after delete.`);
				// Logic to stay on current page or go back if last item deleted
				const isLastItemOnPage = assessments.length === 1 && pagination.current > 1;
				const pageToFetch = isLastItemOnPage ? pagination.current - 2 : pagination.current - 1; // API page is 0-based
				const targetPageForState = isLastItemOnPage ? pagination.current - 1 : pagination.current;

				// Fetch directly if page isn't changing, otherwise let useEffect handle it
				if (targetPageForState === pagination.current) {
					fetchAssessments(selectedPatientFilter.id, pageToFetch, pagination.pageSize);
				} else {
					setPagination((prev) => ({ ...prev, current: targetPageForState }));
				}
			} else {
				// If user can't read, just clear the potentially outdated local list
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
			setLoading(false); // Stop loading indicator on error
		}
		// setLoading(false) is handled within fetchAssessments or explicitly on error/no-refresh path
	};

	// --- Table Pagination Change Handler ---
	const handleTableChange = (newPagination, filters, sorter) => {
		console.log(
			`${logTime()} AssessmentList: handleTableChange triggered. New page: ${newPagination.current}, Page size: ${newPagination.pageSize}`
		);
		setPagination((prev) => ({
			...prev,
			current: newPagination.current,
			pageSize: newPagination.pageSize,
		}));
		// Fetching is handled by the useEffect watching pagination.current/pageSize
	};

	// --- Export PDF Handler ---
	const exportPdf = async (notes, assessmentDateTime, patientName, assessmentId) => {
		// ----- START DEBUGGING -----
		console.log(`%c[PDF DEBUG] ${logTime()} exportPdf called for assessment ID: ${assessmentId}`, "color: blue; font-weight: bold;");
		console.log(`%c[PDF DEBUG] Initial 'notes' value:`, "color: blue;", notes); // Log the raw notes content
		console.log(`%c[PDF DEBUG] Initial 'assessmentDateTime':`, "color: blue;", assessmentDateTime);
		console.log(`%c[PDF DEBUG] Initial 'patientName':`, "color: blue;", patientName);
		// ----- END DEBUGGING -----

		if (!canExportAssessment) {
			console.warn(`${logTime()} AssessmentList: Export prevented - No READ/EXPORT permission.`);
			notification.error({ message: t("common.permissionDenied"), description: t("assessmentList.notifications.exportPermissionDenied") });
			return;
		}

		// Check for empty notes (more robust check)
		const isNotesEffectivelyEmpty = !notes || notes.trim() === "" || notes.trim() === "<p></p>" || notes.replace(/<[^>]*>/g, "").trim() === "";
		console.log(`%c[PDF DEBUG] Is notes effectively empty? ${isNotesEffectivelyEmpty}`, "color: blue;"); // Log empty check result

		if (isNotesEffectivelyEmpty) {
			console.warn(`${logTime()} AssessmentList: Export cancelled - Notes are empty for assessment ID: ${assessmentId}`);
			notification.warning({
				message: t("assessmentList.notifications.exportEmptyTitle"),
				description: t("assessmentList.notifications.exportEmptyDesc"),
			});
			return;
		}

		const formattedDateTime = moment(assessmentDateTime).format("YYYYMMDD_HHmmss");
		const safePatientName = (patientName || t("common.unknownPatient")).replace(/[^a-z0-9]/gi, "_").toLowerCase();
		const filename = `assessment_${safePatientName}_${assessmentId}_${formattedDateTime}.pdf`;
		console.log(`${logTime()} AssessmentList: Generating PDF with filename: ${filename}`);

		// Add a temporary notification to indicate start
		const generatingKey = `pdf-generating-${assessmentId}`;
		notification.info({
			key: generatingKey,
			message: t("assessmentList.notifications.exportGeneratingTitle"),
			description: t("assessmentList.notifications.exportGeneratingDesc"),
			duration: null, // Keep open until closed manually
		});

		const tempDiv = document.createElement("div");
		// Set styles to keep it off-screen but potentially renderable
		tempDiv.style.position = "absolute";
		tempDiv.style.left = "-9999px";
		tempDiv.style.width = "210mm"; // A4 width - important for layout
		tempDiv.style.visibility = "hidden"; // Keep it hidden but allow rendering

		// Basic CKEditor styles (REPLACE WITH YOUR ACTUAL STYLES LATER)
		const ckeditorContentStyles = `
            body { font-family: sans-serif; line-height: 1.5; margin: 0; padding: 0;} /* Added margin/padding reset */
            .ck-content { padding: 10mm; } /* Add padding WITHIN the content area */
            .ck-content h1, .ck-content h2, .ck-content h3, .ck-content h4 { margin-top: 1.2em; margin-bottom: 0.5em; font-weight: bold; line-height: 1.3; }
            .ck-content h1 { font-size: 1.8em; }
            .ck-content h2 { font-size: 1.5em; }
            .ck-content h3 { font-size: 1.3em; }
            .ck-content h4 { font-size: 1.1em; }
            .ck-content p { margin: 0 0 1em 0; }
            .ck-content ul, .ck-content ol { margin-left: 2em; margin-bottom: 1em; padding-left: 20px; }
            .ck-content li { margin-bottom: 0.3em; }
            .ck-content strong { font-weight: bold; }
            .ck-content em, .ck-content i { font-style: italic; }
            .ck-content u { text-decoration: underline; }
            .ck-content blockquote {
                overflow: hidden;
                padding-right: 1.5em;
                padding-left: 1.5em;
                margin-left: 0;
                margin-right: 0;
                font-style: italic;
                border-left: solid 5px #ccc;
            }
            .ck-content pre {
                padding: 1em; color: #353535; background: hsla(0, 0%, 78%, .3);
                border: 1px solid #ccc; border-radius: 2px; text-align: left;
                direction: ltr; tab-size: 4; white-space: pre-wrap; font-style: normal;
                font-variant: normal; font-weight: normal; font-stretch: normal;
                font-size: .8em; line-height: normal; font-family: monospace;
            }
            .ck-content table { border-collapse: collapse; margin: 1em 0; }
            .ck-content th, .ck-content td { border: 1px solid #ccc; padding: .4em; }
            .ck-content a { color: blue; text-decoration: underline; }

            /* PDF Specific Header Styles */
            .pdf-header { padding: 10mm 10mm 0 10mm; } /* Padding for header only */
            h1.pdf-main-title { font-size: 16pt; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            p.pdf-meta { margin-bottom: 8px; line-height: 1.4; font-size: 10pt; }
            hr.pdf-divider { border: 0; border-top: 1px solid #eee; margin: 0 10mm 15px 10mm; } /* Margin for divider */
        `;

		// Construct the full HTML for the PDF
		const pdfHtmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${t("assessmentList.pdf.browserTitle")}</title>
                <style>${ckeditorContentStyles}</style>
            </head>
            <body>
                 {/* Header Section */}
                <div class="pdf-header">
                    <h1 class="pdf-main-title">${t("assessmentList.pdf.title")}</h1>
                    <p class="pdf-meta"><strong>${t("assessmentList.pdf.patientLabel")}</strong> ${patientName || t("common.notAvailable")}</p>
                    <p class="pdf-meta"><strong>${t("assessmentList.pdf.dateLabel")}</strong> ${moment(assessmentDateTime).format(
			"YYYY-MM-DD HH:mm:ss"
		)}</p>
                </div>
                <hr class="pdf-divider">
                 {/* Notes Section - Apply ck-content for styling */}
                <div class="ck-content">
                    ${notes}
                </div>
            </body>
            </html>`;

		// ----- START DEBUGGING -----
		console.log(`%c[PDF DEBUG] Generated pdfHtmlContent:`, "color: blue;", pdfHtmlContent); // Log the full HTML being used
		// ----- END DEBUGGING -----

		tempDiv.innerHTML = pdfHtmlContent;
		document.body.appendChild(tempDiv); // Append to body *before* calling html2pdf

		// ----- START DEBUGGING -----
		// Check if the div is actually in the DOM before proceeding
		if (!document.body.contains(tempDiv)) {
			console.error(`%c[PDF DEBUG] CRITICAL: tempDiv was not appended to the document body!`, "color: red; font-weight: bold;");
			notification.error({
				message: t("assessmentList.notifications.exportErrorTitle"),
				description: t("assessmentList.notifications.exportErrorDesc", { error: "Failed to prepare content for PDF generation." }),
			});
			notification.close(generatingKey); // Close the "generating" notification
			return; // Stop here
		} else {
			console.log(`%c[PDF DEBUG] tempDiv successfully appended to body.`, "color: green;");
		}
		// ----- END DEBUGGING -----

		try {
			const options = {
				margin: 0, // Set margin to 0 as padding is handled inside via CSS
				filename: filename,
				image: { type: "jpeg", quality: 0.95 },
				html2canvas: {
					scale: 2,
					useCORS: true, // Important if notes contain external images
					logging: true, // Enable html2canvas logging for deeper debug if needed
					// Try removing width/windowWidth if layout issues occur, let it auto-detect from element
					// width: tempDiv.scrollWidth,
					// windowWidth: tempDiv.scrollWidth,
				},
				jsPDF: {
					unit: "mm",
					format: "a4",
					orientation: "portrait",
					compress: true,
				},
				pagebreak: { mode: ["avoid-all", "css", "legacy"] },
			};

			// ----- START DEBUGGING -----
			console.log(`%c[PDF DEBUG] html2pdf options:`, "color: blue;", options);
			console.log(`%c[PDF DEBUG] Calling html2pdf().from(tempDiv)...`, "color: purple; font-weight: bold;");
			// ----- END DEBUGGING -----

			await html2pdf().from(tempDiv).set(options).save();

			// ----- START DEBUGGING -----
			console.log(`%c[PDF DEBUG] html2pdf().save() called successfully (download should start).`, "color: green; font-weight: bold;");
			// ----- END DEBUGGING -----

			notification.success({
				message: t("assessmentList.notifications.exportStartedTitle"), // Re-use title, description implies success now
				description: t("assessmentList.notifications.exportStartedDesc", { filename }),
			});
		} catch (error) {
			// ----- START DEBUGGING -----
			console.error(`%c[PDF DEBUG] Error during html2pdf generation/save:`, "color: red; font-weight: bold;", error);
			// ----- END DEBUGGING -----
			notification.error({
				message: t("assessmentList.notifications.exportErrorTitle"),
				description: t("assessmentList.notifications.exportErrorDesc", { error: error.message }),
			});
		} finally {
			console.log(`${logTime()} AssessmentList: Cleaning up temporary div for PDF generation.`);
			notification.close(generatingKey); // Close the "generating" notification regardless of outcome
			// Robust check before removing
			if (tempDiv.parentNode === document.body) {
				document.body.removeChild(tempDiv);
				console.log(`%c[PDF DEBUG] tempDiv removed from body.`, "color: gray;");
			} else {
				console.warn(`%c[PDF DEBUG] tempDiv was not found in body during cleanup.`, "color: orange;");
			}
		}
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
				// Added Notes Preview column (optional)
				title: t("assessmentList.table.header.notesPreview"),
				dataIndex: "notes",
				key: "notesPreview",
				ellipsis: true, // Truncate long previews
				render: (text) => {
					if (!canReadAssessment) return <Text disabled>***</Text>;
					const plainText = text
						? text
								.replace(/<[^>]*>/g, " ")
								.replace(/\s+/g, " ")
								.trim()
						: "";
					return (
						plainText || (
							<Text type="secondary" italic>
								{t("common.noContent")}
							</Text>
						)
					);
				},
			},
			{
				title: t("assessmentList.table.header.actions"),
				key: "actions",
				align: "center",
				width: 150, // Adjust width if needed due to preview column
				fixed: "right",
				render: (text, record) => {
					const isNotesEmptyForExport =
						!record.notes ||
						record.notes.trim() === "" ||
						record.notes.trim() === "<p></p>" ||
						record.notes.replace(/<[^>]*>/g, "").trim() === "";
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
									disabled={!canDeleteAssessment} // Redundant but safe
								>
									<Tooltip title={t("assessmentList.table.actions.deleteTooltip")}>
										{/* Span needed for Tooltip on disabled button */}
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
							{canExportAssessment && (
								<Tooltip
									title={
										isNotesEmptyForExport
											? t("assessmentList.table.actions.exportDisabledTooltip")
											: t("assessmentList.table.actions.exportTooltip")
									}>
									<span>
										{" "}
										{/* Span needed for Tooltip on disabled button */}
										<Button
											type="default"
											shape="circle"
											icon={<FileTextOutlined />}
											onClick={() => exportPdf(record.notes, record.assessmentDateTime, record.patientName, record.id)}
											size="small"
											disabled={isNotesEmptyForExport || !canExportAssessment} // Also disable if no permission
										/>
									</span>
								</Tooltip>
							)}
							{/* Placeholder if no actions are available */}
							{!canUpdateAssessment && !canDeleteAssessment && !canExportAssessment && (
								<Text disabled style={{ fontSize: "12px" }}>
									{t("common.notAvailableShort")}
								</Text>
							)}
						</Space>
					);
				},
			},
		],
		[t, canReadAssessment, canUpdateAssessment, canDeleteAssessment, canExportAssessment, handleDeleteAssessment, showAssessmentModal, exportPdf]
	); // Add dependencies

	// --- Empty Table Text Logic ---
	const getEmptyText = useCallback(() => {
		console.log(`${logTime()} AssessmentList: getEmptyText called. canRead: ${canReadAssessment}, patientFilter: ${!!selectedPatientFilter}`);
		if (!canReadAssessment) {
			return <Text disabled>{t("assessmentList.table.empty.noPermission")}</Text>;
		}
		if (loading) {
			// Show loading text inside table
			return <Spin tip={t("common.loading")} />;
		}
		if (selectedPatientFilter) {
			return t("assessmentList.table.empty.noDataFound"); // No data for selected patient
		}
		return t("assessmentList.table.empty.noPatientSelected"); // Prompt to select patient
	}, [canReadAssessment, selectedPatientFilter, t, loading]);

	return (
		<div style={{ padding: "20px 24px" }}>
			{/* Header */}
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

			{/* Filter and Add Button Row */}
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
								{" "}
								{/* Tooltip wrapper */}
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
					{!canCreateAssessment && <div style={{ height: "32px" }} />} {/* Placeholder */}
				</Col>
			</Row>

			{/* Assessments Table */}
			<Table
				columns={assessmentColumns}
				dataSource={assessments} // Always pass data, emptyText handles display
				loading={loading && !selectedPatientFilter} // Only show main spinner if filter isn't set yet and loading
				rowKey="id"
				pagination={canReadAssessment && pagination.total > 0 ? pagination : false} // Hide pagination if no data or no permission
				onChange={handleTableChange}
				scroll={{ x: "max-content" }}
				locale={{ emptyText: getEmptyText() }}
				bordered
				size="small"
			/>

			{/* Assessment Add/Edit Modal */}
			<Modal
				title={selectedAssessment ? t("assessmentList.modal.editTitle") : t("assessmentList.modal.addTitle")}
				open={isAssessmentModalVisible}
				onCancel={handleAssessmentCancel}
				footer={null}
				width="90%"
				style={{ top: 20, maxWidth: "1200px" }}
				styles={{ body: { maxHeight: "calc(100vh - 120px)", overflowY: "auto", padding: "20px" } }}
				maskClosable={false}
				destroyOnClose={true} // Ensure form state is fresh each time
			>
				{/* Conditionally render form only when modal is intended to be visible */}
				{isAssessmentModalVisible && (
					<AssessmentForm
						assessment={selectedAssessment}
						initialPatient={
							// Pass the currently selected filter as initial patient only if CREATING
							!selectedAssessment ? selectedPatientFilter : null
						}
						onSave={handleAssessmentSave}
						onCancel={handleAssessmentCancel}
						darkMode={darkMode}
					/>
				)}
			</Modal>

			{/* Divider & Template Management Section */}
			<Divider style={{ margin: "40px 0" }} />
			<AssessmentTypeManagement darkMode={darkMode} />
		</div>
	);
};

export default AssessmentList;
