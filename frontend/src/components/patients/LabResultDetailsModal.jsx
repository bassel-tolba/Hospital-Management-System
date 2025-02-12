// LabResultDetailsModal.js
import React, { useState, useEffect } from "react";
import { Modal, Typography, Table, Spin, message, Button, Card } from "antd"; // Import Card
import { useLabStore } from "../../services/lab.service";
import moment from "moment";
import html2pdf from "html2pdf.js";
import { LoadingOutlined, DownloadOutlined } from "@ant-design/icons"; // Import icons

const { Text, Title } = Typography;

const LabResultDetailsModal = ({ isOpen, onClose, labResult }) => {
	const { fetchLabTests, labTests, loading, error } = useLabStore();
	const [labTestDetails, setLabTestDetails] = useState(null);
	const [tableData, setTableData] = useState({ columns: [], dataSource: [] });

	// --- Effects ---

	useEffect(() => {
		const fetchDetails = async () => {
			if (!labResult?.labTestId) {
				setLabTestDetails(null);
				return;
			}

			try {
				// Fetch lab tests if the array is empty
				if (labTests.length === 0) {
					await fetchLabTests();
				}

				const foundLabTest = labTests.find((test) => test.id === labResult.labTestId);
				if (foundLabTest) {
					setLabTestDetails(foundLabTest);
					if (foundLabTest.structureMap?.table) {
						const table = generateResultTable(foundLabTest.structureMap.table, labResult.resultMap);
						setTableData(table);
					} else {
						setTableData({ columns: [], dataSource: [] });
					}
				} else {
					setLabTestDetails(null);
					message.error("Lab test not found.");
				}
			} catch (err) {
				console.error("Error fetching lab test details", err);
				message.error("Error fetching lab test details: " + err.message);
				setLabTestDetails(null);
			}
		};

		fetchDetails();
	}, [labResult, fetchLabTests, labTests]); //Dependencies

	// --- Table Generation ---

	const generateResultTable = (structureMapTable, resultMap) => {
		if (!structureMapTable || !resultMap) {
			return { columns: [], dataSource: [] };
		}

		const { headers, rows: structureRows } = structureMapTable;

		const columns = headers.map((header) => ({
			title: header,
			dataIndex: header,
			key: header,
			render: (text) => <Text>{text || "N/A"}</Text>,
		}));

		const dataSource = structureRows.map((structRow) => {
			const rowKey = structRow[0]; // First element is the key
			const rowData = resultMap[rowKey] || {};
			const row = { key: rowKey };

			headers.forEach((header, index) => {
				const initialValue = rowData?.[header] != null ? rowData[header] : structRow[index] != null ? structRow[index] : null;
				row[header] = initialValue;
			});

			return row;
		});

		return { columns, dataSource };
	};

	// --- PDF Generation ---

	const generatePDF = async () => {
		if (!labTestDetails || !labResult) {
			message.error("No lab result or test details available.");
			return;
		}

		const { testName, description } = labTestDetails;
		const { resultDateTime, notes } = labResult;
		const { columns, dataSource } = tableData;

		// Create the HTML content for the PDF (using template literals for cleaner code)
		const htmlContent = `
            <div style="padding: 20px;">
                <h1 style="color: #333; text-align: center;">Hospital Name</h1>
                <p style="text-align: center; color: #666;">${moment().format("YYYY-MM-DD HH:mm")}</p>
                <h2 style="color: #444; margin-top: 20px;">Lab Result Details</h2>
                <p><strong>Test Name:</strong> ${testName || "Not Available"}</p>
                <p><strong>Test Description:</strong> ${description || "Not Available"}</p>
                <p><strong>Result Date:</strong> ${resultDateTime ? moment(resultDateTime).format("YYYY-MM-DD HH:mm") : "Not Available"}</p>
                <p><strong>Notes:</strong> ${notes || "Not Available"}</p>
                 ${generateTableHTML(columns, dataSource)}
                <p style="font-size: 10px; color: #999; margin-top: 20px;">This document is electronically generated and valid without signature.</p>
            </div>
        `;

		const options = {
			margin: 10,
			filename: `lab_result_${moment().format("YYYYMMDD_HHmm")}.pdf`,
			image: { type: "jpeg", quality: 0.98 },
			html2canvas: { scale: 2 },
			jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
		};

		try {
			await html2pdf().from(htmlContent).set(options).save();
			message.success("PDF generated successfully!");
		} catch (error) {
			console.error("Error generating PDF:", error);
			message.error("Failed to generate PDF: " + error.message);
		}
	};
	const generateTableHTML = (columns, dataSource) => {
		if (!columns || columns.length === 0 || !dataSource || dataSource.length === 0) {
			return "<p>No results available.</p>";
		}

		let tableHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        ${columns.map((col) => `<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${col.title}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${dataSource
						.map(
							(row) => `
                        <tr style="border: 1px solid #ddd;">
                            ${columns.map((col) => `<td style="border: 1px solid #ddd; padding: 8px;">${row[col.dataIndex] || "N/A"}</td>`).join("")}
                        </tr>
                    `
						)
						.join("")}
                </tbody>
            </table>
        `;
		return tableHTML;
	};

	// --- Loading and Error Handling ---

	if (loading || !labResult) {
		return (
			<Modal title={<Title level={4}>Lab Result Details</Title>} open={isOpen} onCancel={onClose} footer={null} centered>
				<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
					<Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
				</div>
			</Modal>
		);
	}

	if (error) {
		return (
			<Modal title={<Title level={4}>Lab Result Details</Title>} open={isOpen} onCancel={onClose} footer={null} centered>
				<Card style={{ borderColor: "red" }}>
					<p style={{ color: "red" }}>Error: {error}</p>
				</Card>
			</Modal>
		);
	}

	// --- Render ---
	return (
		<Modal
			title={<Title level={4}>Lab Result Details</Title>}
			open={isOpen}
			onCancel={onClose}
			footer={null}
			width="80%"
			centered // Center the modal
		>
			<Card>
				<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
					<Button icon={<DownloadOutlined />} onClick={generatePDF}>
						Download PDF
					</Button>
				</div>
				{labTestDetails && (
					<div style={{ marginBottom: "15px" }}>
						<Text strong>Test Name:</Text> {labTestDetails.testName || "Not Available"}
						<br />
						<Text strong>Test Description:</Text> {labTestDetails.description || "Not Available"}
						<br />
					</div>
				)}
				<Text strong>Result Date Time:</Text>{" "}
				{labResult.resultDateTime ? moment(labResult.resultDateTime).format("YYYY-MM-DD HH:mm") : "Not Available"}
				<br />
				<Text strong>Notes:</Text> {labResult.notes || "Not Available"}
				<br />
				{tableData.columns.length > 0 ? (
					<Table columns={tableData.columns} dataSource={tableData.dataSource} pagination={false} size="small" bordered />
				) : (
					<Text>No results available for this lab.</Text>
				)}
			</Card>
		</Modal>
	);
};

export default LabResultDetailsModal;
