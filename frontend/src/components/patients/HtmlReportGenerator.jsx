// HtmlReportGenerator.js
import React, { useState } from "react";
import moment from "moment";
import QRCode from "qrcode";
import { notification, Spin } from "antd";
import { usePatientDetailStore } from "../../services/patientDetail.service";

const HtmlReportGenerator = ({ type, mode, data, columns, fileNamePrefix, children, labTests, reportScope = "all", patientDataForHeader = null }) => {
	const [isGeneratingFile, setIsGeneratingFile] = useState(false);

	const generateImageUrl = (url) => {
		if (!url) return null;
		if (url.startsWith("data:") || url.startsWith("http:") || url.startsWith("https:")) {
			return url;
		}
		const processedUrl = `${
			(url.startsWith("./") ? url.substring(1) : url).startsWith("/")
				? url.startsWith("./")
					? url.substring(1)
					: url
				: "/" + (url.startsWith("./") ? url.substring(1) : url)
		}`;
		return `http://localhost:8080${processedUrl}`;
	};

	const toBase64 = async (url) => {
		try {
			const absoluteUrl = generateImageUrl(url);
			const response = await fetch(absoluteUrl);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status} for ${absoluteUrl}`);
			}
			const blob = await response.blob();
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result);
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			});
		} catch (error) {
			console.error("Error converting image to Base64:", error);
			return null;
		}
	};

	const generatePatientMrnQrCode = async (mrn) => {
		if (!mrn) return null;
		try {
			return await QRCode.toDataURL(mrn, { width: 70, margin: 1 });
		} catch (err) {
			console.error("Error generating MRN QR code:", err);
			return null;
		}
	};

	const generateProfessionalHeader = async (documentType, documentId, patientForBlock) => {
		let patientIdentityBlockHtml = "";
		// Check if patientForBlock is a meaningful object before generating the block
		if (patientForBlock && (patientForBlock.id || patientForBlock.medicalRecordNumber || patientForBlock.firstName)) {
			patientIdentityBlockHtml = await generatePatientIdentityBlock(patientForBlock, "condensed");
		} else {
			// Render a minimal patient block if no valid patient data is found for the header
			patientIdentityBlockHtml = await generatePatientIdentityBlock(null, "condensed");
		}

		return `
        <div class="institution-header-block" style="page-break-after: avoid;">
            <div class="institution-details-main">
                <p class="institution-name">GMTS MEDICAL CENTER</p>
                <p class="department-name">Medical Records & Information Systems</p>
            </div>
            <div class="institution-contact-details">
                <p>123 Health St, Wellness City, HC 54321</p>
                <p>Tel: +1 (234) 567-890 | Fax: +1 (234) 567-891</p>
                <p>Email: records@gmtsmedical.org</p>
            </div>
        </div>
        <div class="document-classification-bar" style="page-break-after: avoid;">
            <span>${documentType}</span>
            <span>Classification: Confidential</span>
            <span>Doc ID: ${documentId || `GEN-${Date.now().toString(36).toUpperCase()}`}</span>
            <span>Generated: ${moment().format("YYYY-MM-DD HH:mm:ss")}</span>
        </div>
        ${patientIdentityBlockHtml}
        `;
	};

	const generatePatientIdentityBlock = async (patientInput, style = "full") => {
		// Ensure patient is an object, even if it's just for defaults
		const patient = patientInput || {};

		const mrnQrCodeBase64 = await generatePatientMrnQrCode(patient.medicalRecordNumber);
		const age = patient.dateOfBirth ? moment().diff(patient.dateOfBirth, "years") : "N/A";
		const attendingPhysician = patient.attendingPhysician || "As Indicated in Records";

		let photoHtml = "";
		if (style === "full" && patient.profilePictureURL) {
			const profilePictureBase64 = await toBase64(patient.profilePictureURL);
			if (profilePictureBase64) {
				photoHtml = `<img src="${profilePictureBase64}" alt="Patient Photo" class="patient-photo-sm">`;
			} else {
				photoHtml = `<div class="patient-photo-placeholder-sm"><span>No Photo</span></div>`;
			}
		} else if (style === "full") {
			photoHtml = `<div class="patient-photo-placeholder-sm"><span>No Photo</span></div>`;
		}

		return `
        <div class="patient-identity-block ${style === "condensed" ? "condensed" : ""}" style="page-break-after: avoid;">
            <div class="patient-info-grid">
                <div class="info-item"><span class="label">PATIENT:</span> <span class="value">${patient.firstName || ""} ${
			patient.lastName || ""
		}</span></div>
                <div class="info-item"><span class="label">MRN:</span> <span class="value medical-data-font">${
					patient.medicalRecordNumber || "N/A"
				}</span></div>
                <div class="info-item"><span class="label">DOB:</span> <span class="value">${
					patient.dateOfBirth ? moment(patient.dateOfBirth).format("YYYY-MM-DD") : "N/A"
				}</span></div>
                <div class="info-item"><span class="label">AGE:</span> <span class="value">${age}</span></div>
                <div class="info-item"><span class="label">SEX:</span> <span class="value">${patient.gender || "N/A"}</span></div>
                <div class="info-item"><span class="label">ATTENDING:</span> <span class="value">${attendingPhysician}</span></div>
                <div class="info-item"><span class="label">REPORT DATE:</span> <span class="value">${moment().format("YYYY-MM-DD")}</span></div>
                ${
					style === "condensed" && mrnQrCodeBase64
						? `<div class="info-item qr-code-item-condensed"><img src="${mrnQrCodeBase64}" alt="MRN QR Code"></div>`
						: ""
				}
            </div>
            ${style === "full" && photoHtml ? `<div class="patient-photo-area">${photoHtml}</div>` : ""}
            ${
				style === "full" && mrnQrCodeBase64
					? `<div class="mrn-qr-code-area-full"><img src="${mrnQrCodeBase64}" alt="MRN QR Code"><p class="medical-data-font">${
							patient.medicalRecordNumber || "N/A"
					  }</p></div>`
					: ""
			}
        </div>
        `;
	};

	const generateProfessionalFooter = () => `
        <div class="primary-footer" style="page-break-inside: avoid;">
            <div class="footer-column">
                <p><strong>Validated By:</strong> _________________________</p>
                <p><strong>Date of Signature:</strong> ____________________</p>
            </div>
            <div class="footer-column">
                <p><strong>Printed:</strong> ${moment().format("YYYY-MM-DD HH:mm:ss")}</p>
                <p class="page-number-placeholder">Page X of Y</p>
            </div>
        </div>
        <div class="audit-footer" style="page-break-inside: avoid;">
            <p>System: MediSys Clinical Suite v4.0 | This document contains confidential patient information. Handle with care in accordance with HIPAA and institutional policies.</p>
        </div>
    `;

	const generateTableHTML = (tableColumns, dataSource) => {
		if (!tableColumns || tableColumns.length === 0 || !dataSource || dataSource.length === 0) {
			return "<p class='no-data-message'>No data available for this section.</p>";
		}

		const filteredColumns = tableColumns.filter((col) => col.dataIndex || col.key);

		const tableHeader = filteredColumns.map((col) => `<th class="table-th">${col.title}</th>`).join("");

		const tableRows = dataSource
			.map(
				(row, rowIndex) => `
        <tr class="table-tr ${rowIndex % 2 === 1 ? "odd" : ""}">
          ${filteredColumns
				.map((col) => {
					let cellValue;
					let isCritical = false;
					let isOutOfRange = false;

					if (typeof col.render === "function") {
						try {
							const renderedContent = col.render(row[col.dataIndex], row);
							cellValue =
								typeof renderedContent === "object" && renderedContent !== null && React.isValidElement(renderedContent)
									? row[col.dataIndex] ?? row[col.key] ?? "N/A (Render)"
									: renderedContent;
						} catch (e) {
							cellValue = row[col.dataIndex] ?? row[col.key] ?? "N/A (Render Error)";
						}
					} else {
						cellValue = row[col.dataIndex];
					}

					if (
						col.dataIndex &&
						(col.dataIndex.toLowerCase().includes("date") || col.dataIndex.toLowerCase().includes("datetime")) &&
						cellValue &&
						typeof cellValue === "string" &&
						!isNaN(Date.parse(cellValue))
					) {
						cellValue = moment(cellValue).format("YYYY-MM-DD HH:mm");
					} else if (typeof cellValue === "object" && cellValue !== null) {
						cellValue = JSON.stringify(cellValue);
					}

					let cellContent =
						cellValue === undefined || cellValue === null || cellValue === "" ? "<i class='data-na'>Not Available</i>" : cellValue;

					let cellClasses = "table-td";
					if (isCritical) cellClasses += " critical-value";
					if (isOutOfRange) cellClasses += " out-of-range-value";
					if (
						col.key === "id" ||
						(col.dataIndex && (col.dataIndex.toLowerCase().includes("id") || col.dataIndex.toLowerCase().includes("mrn")))
					)
						cellClasses += " medical-data-font";

					return `<td class="${cellClasses}">${cellContent}</td>`;
				})
				.join("")}
        </tr>`
			)
			.join("");

		return `
      <div class="table-container">
          <table class="medical-table">
            <thead><tr class="table-tr-header">${tableHeader}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
      </div>`;
	};

	const generateAdmissionHtml = async (admission, patientForHeaderContext) => {
		if (!admission) return null;
		const documentId = `ADM-${admission.id}`;
		return `
      <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader("Admission Details", documentId, patientForHeaderContext)}
        <div class="content-block">
          <h2 class="section-header-main">Admission Details 📝</h2>
          <p class="info-item-professional"><span class="label">Admission Date:</span> <span class="value">${
				admission.admissionDate ? moment(admission.admissionDate).format("YYYY-MM-DD HH:mm") : "<i class='data-na'>Not Available</i>"
			}</span></p>
          <p class="info-item-professional"><span class="label">Discharge Date:</span> <span class="value">${
				admission.dischargeDate ? moment(admission.dischargeDate).format("YYYY-MM-DD HH:mm") : "Open"
			}</span></p>
          <p class="info-item-professional"><span class="label">Bed ID:</span> <span class="value medical-data-font">${
				admission.bedId || "<i class='data-na'>Not Available</i>"
			}</span></p>
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generateAdmissionTableHtml = async (admissions, tableColumns, patientForHeaderContext) => {
		if (!admissions || admissions.length === 0) return "<p class='no-data-message'>No admission data available.</p>";
		return `
      <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader("Admissions Summary", `ADM-SUM-${Date.now().toString(36).toUpperCase()}`, patientForHeaderContext)}
        <div class="content-block">
          <h2 class="section-header-main">Admissions 📝</h2>
          ${generateTableHTML(tableColumns, admissions)}
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generateAppointmentHtml = async (appointment, patientForHeaderContext) => {
		if (!appointment) return null;
		const documentId = `APP-${appointment.id}`;
		return `
      <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader("Appointment Details", documentId, patientForHeaderContext)}
        <div class="content-block">
          <h2 class="section-header-main">Appointment Details 📅</h2>
          <p class="info-item-professional"><span class="label">Date & Time:</span> <span class="value">${
				appointment.appointmentDateTime
					? moment(appointment.appointmentDateTime).format("YYYY-MM-DD HH:mm")
					: "<i class='data-na'>Not Available</i>"
			}</span></p>
          <p class="info-item-professional"><span class="label">Service/Reason:</span> <span class="value">${
				appointment.productName || "<i class='data-na'>Not Available</i>"
			}</span></p>
          <p class="info-item-professional"><span class="label">Provider:</span> <span class="value">${
				`${appointment.userFirstName || ""} ${appointment.userLastName || ""}`.trim() || "<i class='data-na'>Not Available</i>"
			}</span></p>
          <p class="info-item-professional"><span class="label">Status:</span> <span class="value">${
				appointment.status || "<i class='data-na'>Not Available</i>"
			}</span></p>
          <p class="info-item-professional"><span class="label">Scheduled Start:</span> <span class="value">${
				appointment.startTime ? moment(appointment.startTime).format("YYYY-MM-DD HH:mm") : "<i class='data-na'>Not Available</i>"
			}</span></p>
          <p class="info-item-professional"><span class="label">Scheduled End:</span> <span class="value">${
				appointment.endTime ? moment(appointment.endTime).format("YYYY-MM-DD HH:mm") : "<i class='data-na'>Not Available</i>"
			}</span></p>
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generateAppointmentTableHtml = async (appointments, tableColumns, patientForHeaderContext) => {
		if (!appointments || appointments.length === 0) return "<p class='no-data-message'>No appointment data available.</p>";
		return `
      <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader("Appointments Summary", `APP-SUM-${Date.now().toString(36).toUpperCase()}`, patientForHeaderContext)}
        <div class="content-block">
          <h2 class="section-header-main">Appointments 📅</h2>
          ${generateTableHTML(tableColumns, appointments)}
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generateBillingHtml = async (billingData, patientForHeaderContext) => {
		if (!billingData || !billingData.bill) return null;
		const documentId = `BILL-${billingData.id}`;
		const div = document.createElement("div");
		div.innerHTML = billingData.bill;
		div.style.fontSize = "9pt";
		div.style.lineHeight = "1.3";
		const tables = div.querySelectorAll("table");
		tables.forEach((table) => {
			table.classList.add("medical-table", "external-bill-table");
			table.style.fontSize = "";
			table.style.width = "";
			table.style.borderCollapse = "";
			table.style.marginTop = "";
			const cells = table.querySelectorAll("td, th");
			cells.forEach((cell) => {
				cell.style.padding = "";
				cell.style.border = "";
			});
			const ths = table.querySelectorAll("th");
			ths.forEach((th) => {
				th.style.backgroundColor = "";
			});
		});

		return `
      <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader("Billing Details", documentId, patientForHeaderContext)}
        <div class="content-block">
          <h2 class="section-header-main">Billing Details 💰</h2>
          <p class="info-item-professional"><span class="label">Billing Date:</span> <span class="value">${
				billingData.billDate ? moment(billingData.billDate).format("YYYY-MM-DD HH:mm") : "<i class='data-na'>Not Available</i>"
			}</span></p>
          <div class="external-html-content">${div.outerHTML}</div>
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generateBillingTableHtml = async (billings, patientForHeaderContext) => {
		if (!billings || billings.length === 0) return "<p class='no-data-message'>No billing data available.</p>";
		let combinedBillContent = "";
		for (const billing of billings) {
			const div = document.createElement("div");
			div.innerHTML = billing.bill;
			div.style.fontSize = "9pt";
			div.style.lineHeight = "1.3";
			const tables = div.querySelectorAll("table");
			tables.forEach((table) => {
				table.classList.add("medical-table", "external-bill-table");
				table.style.fontSize = "";
				table.style.width = "";
				table.style.borderCollapse = "";
				table.style.marginTop = "";
				const cells = table.querySelectorAll("td, th");
				cells.forEach((cell) => {
					cell.style.padding = "";
					cell.style.border = "";
				});
				const ths = table.querySelectorAll("th");
				ths.forEach((th) => {
					th.style.backgroundColor = "";
				});
			});

			combinedBillContent += `
          <div class="billing-item-container break-inside-avoid">
            <h3 class="subsection-header">Billing Record (ID: <span class="medical-data-font">${billing.id}</span>) - ${moment(
				billing.billDate
			).format("YYYY-MM-DD HH:mm")}</h3>
            <div class="external-html-content">${div.outerHTML}</div>
          </div>`;
		}
		return `
      <div class="report-section">
        ${await generateProfessionalHeader("Billing History", `BILL-HIST-${Date.now().toString(36).toUpperCase()}`, patientForHeaderContext)}
        <div class="content-block">
          <h2 class="section-header-main">Billing History 💰</h2>
          ${combinedBillContent}
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generateAssessmentHtml = async (assessment, patientForHeaderContext) => {
		if (!assessment) return null;
		const documentId = `ASSESS-${assessment.id}`;
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = assessment.notes;
		return `
      <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader("Assessment Details", documentId, patientForHeaderContext)}
        <div class="content-block">
          <h2 class="section-header-main">Assessment Details 📋</h2>
          <p class="info-item-professional"><span class="label">Assessment Date:</span> <span class="value">${
				assessment.assessmentDateTime
					? moment(assessment.assessmentDateTime).format("YYYY-MM-DD HH:mm")
					: "<i class='data-na'>Not Available</i>"
			}</span></p>
          <h3 class="subsection-header">Notes:</h3>
          <div class="notes-box-professional">${tempDiv.innerHTML || "<i class='data-na'>Not Available</i>"}</div>
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generateAssessmentTableHtml = async (assessments, patientForHeaderContext) => {
		if (!assessments || assessments.length === 0) return "<p class='no-data-message'>No assessment data available.</p>";
		let combinedAssessmentContent = "";
		for (const assessment of assessments) {
			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = assessment.notes;
			combinedAssessmentContent += `
          <div class="assessment-item-container break-inside-avoid">
            <h3 class="subsection-header">Assessment (ID: <span class="medical-data-font">${assessment.id}</span>) - ${moment(
				assessment.assessmentDateTime
			).format("YYYY-MM-DD HH:mm")}</h3>
            <div class="notes-box-professional">${tempDiv.innerHTML || "<i class='data-na'>Not Available</i>"}</div>
          </div>`;
		}
		return `
      <div class="report-section">
        ${await generateProfessionalHeader("Assessment History", `ASSESS-HIST-${Date.now().toString(36).toUpperCase()}`, patientForHeaderContext)}
        <div class="content-block">
          <h2 class="section-header-main">Assessment History 📋</h2>
          ${combinedAssessmentContent}
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generateCarePlanHtml = async (carePlan, patientForHeaderContext) => {
		if (!carePlan) return null;
		const documentId = `CP-${carePlan.id}`;
		return `
      <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader("Care Plan Details", documentId, patientForHeaderContext)}
        <div class="content-block">
          <h2 class="section-header-main">Care Plan Details 🩺</h2>
          <p class="info-item-professional"><span class="label">Plan Date:</span> <span class="value">${
				carePlan.planDate ? moment(carePlan.planDate).format("YYYY-MM-DD HH:mm") : "<i class='data-na'>Not Available</i>"
			}</span></p>
          <p class="info-item-professional"><span class="label">Goal: 🎯</span> <span class="value">${
				carePlan.goal || "<i class='data-na'>Not Available</i>"
			}</span></p>
          <h3 class="subsection-header">Interventions: 🛠️</h3>
          <div class="notes-box-professional">${carePlan.interventions || "<i class='data-na'>Not Available</i>"}</div>
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generateCarePlanTableHtml = async (carePlans, tableColumns, patientForHeaderContext) => {
		if (!carePlans || carePlans.length === 0) return "<p class='no-data-message'>No care plan data available.</p>";
		return `
      <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader("Care Plans Summary", `CP-SUM-${Date.now().toString(36).toUpperCase()}`, patientForHeaderContext)}
        <div class="content-block">
          <h2 class="section-header-main">Care Plans 🩺</h2>
          ${generateTableHTML(tableColumns, carePlans)}
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generatePrescriptionHtml = async (prescription, patientForHeaderContext) => {
		if (!prescription) return null;
		const documentId = `PRESC-${prescription.id}`;
		const medicationColumns = [
			{ title: "Medication", dataIndex: "medicationName", key: "medicationName" },
			{ title: "Dosage", dataIndex: "dosage", key: "dosage" },
			{ title: "Route", dataIndex: "route", key: "route" },
			{ title: "Amount", dataIndex: "amount", key: "amount" },
			{ title: "Status", dataIndex: "expired", key: "status", render: (expired) => (expired ? "Administered ✅" : "Pending ❌") },
		];
		const medicationsTable = generateTableHTML(medicationColumns, prescription.prescribedMedications || []);

		return `
    <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader("Prescription Details", documentId, patientForHeaderContext)}
        <div class="content-block">
            <h2 class="section-header-main">Prescription Details 💊</h2>
            <p class="info-item-professional"><span class="label">Prescription Date:</span> <span class="value">${
				prescription.prescriptionDate
					? moment(prescription.prescriptionDate).format("YYYY-MM-DD HH:mm")
					: "<i class='data-na'>Not Available</i>"
			}</span></p>
            <p class="info-item-professional"><span class="label">Expiration Date:</span> <span class="value">${
				prescription.expirationDate ? moment(prescription.expirationDate).format("YYYY-MM-DD") : "<i class='data-na'>Not Available</i>"
			}</span></p>
            <p class="info-item-professional"><span class="label">Patient Name:</span> <span class="value">${
				prescription.patientName || "<i class='data-na'>Not Available</i>"
			}</span></p>
            <h3 class="subsection-header">Note: 📝</h3>
            <div class="notes-box-professional" style="margin-bottom: 15px;">${prescription.note || "<i class='data-na'>Not Available</i>"}</div>
            <h3 class="subsection-header">Prescribed Medications:</h3>
            ${medicationsTable}
        </div>
        ${generateProfessionalFooter()}
    </div>`;
	};

	const generatePrescriptionTableHtml = async (prescriptions, patientForHeaderContext) => {
		if (!prescriptions || prescriptions.length === 0) return "<p class='no-data-message'>No prescription data available.</p>";
		let combinedPrescriptions = "";
		const medicationColumns = [
			{ title: "Medication", dataIndex: "medicationName", key: "medicationName" },
			{ title: "Dosage", dataIndex: "dosage", key: "dosage" },
			{ title: "Route", dataIndex: "route", key: "route" },
			{ title: "Amount", dataIndex: "amount", key: "amount" },
			{ title: "Status", dataIndex: "expired", key: "status", render: (expired) => (expired ? "Administered ✅" : "Pending ❌") },
		];

		prescriptions.forEach((prescription) => {
			const medicationsTable = generateTableHTML(medicationColumns, prescription.prescribedMedications || []);
			combinedPrescriptions += `
            <div class="prescription-item-container break-inside-avoid">
                <h3 class="subsection-header">Prescription (ID: <span class="medical-data-font">${prescription.id}</span>) - ${moment(
				prescription.prescriptionDate
			).format("YYYY-MM-DD HH:mm")}</h3>
                <p class="info-item-professional"><span class="label">Note:</span> <span class="value">${
					prescription.note || "<i class='data-na'>Not Available</i>"
				}</span></p>
                <h4 class="subsubsection-header">Medications:</h4>
                ${medicationsTable}
            </div>`;
		});
		return `
        <div class="report-section">
            ${await generateProfessionalHeader(
				"Prescriptions History",
				`PRESC-HIST-${Date.now().toString(36).toUpperCase()}`,
				patientForHeaderContext
			)}
            <div class="content-block">
                <h2 class="section-header-main">Prescriptions History 💊</h2>
                ${combinedPrescriptions}
            </div>
            ${generateProfessionalFooter()}
        </div>`;
	};

	const generateVitalSignHtml = async (vitalSign, patientForHeaderContext) => {
		if (!vitalSign) return null;
		const documentId = `VS-${vitalSign.id}`;
		return `
      <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader("Vital Sign Details", documentId, patientForHeaderContext)}
        <div class="content-block">
            <h2 class="section-header-main">Vital Sign Details 🌡️</h2>
            <p class="info-item-professional"><span class="label">Record Date:</span> <span class="value">${
				vitalSign.timestamp ? moment(vitalSign.timestamp).format("YYYY-MM-DD HH:mm") : "<i class='data-na'>Not Available</i>"
			}</span></p>
            <div class="vitals-grid">
                <p class="info-item-professional"><span class="label">Temperature: 🌡️</span> <span class="value medical-data-font">${
					vitalSign.temperature || "N/A"
				} ${vitalSign.temperatureUnit || "°C"}</span></p>
                <p class="info-item-professional"><span class="label">Heart Rate: ❤️</span> <span class="value medical-data-font">${
					vitalSign.heartRate || "N/A"
				} bpm</span></p>
                <p class="info-item-professional"><span class="label">Blood Pressure:</span> <span class="value medical-data-font">${
					vitalSign.bloodPressureSystolic || "N/A"
				}/${vitalSign.bloodPressureDiastolic || "N/A"} mmHg</span></p>
                <p class="info-item-professional"><span class="label">Respiratory Rate: 🫁</span> <span class="value medical-data-font">${
					vitalSign.respiratoryRate || "N/A"
				} /min</span></p>
                <p class="info-item-professional"><span class="label">Oxygen Saturation: 💨</span> <span class="value medical-data-font">${
					vitalSign.oxygenSaturation || "N/A"
				} %</span></p>
                <p class="info-item-professional"><span class="label">Pain Level: 😖</span> <span class="value medical-data-font">${
					vitalSign.painLevel || "N/A"
				} /10</span></p>
                <p class="info-item-professional"><span class="label">Height: 📏</span> <span class="value medical-data-font">${
					vitalSign.height ? `${vitalSign.height} ${vitalSign.heightUnit || "cm"}` : "N/A"
				}</span></p>
                <p class="info-item-professional"><span class="label">Weight: ⚖️</span> <span class="value medical-data-font">${
					vitalSign.weight ? `${vitalSign.weight} ${vitalSign.weightUnit || "kg"}` : "N/A"
				}</span></p>
                <p class="info-item-professional"><span class="label">Glucose: 🩸</span> <span class="value medical-data-font">${
					vitalSign.glucose ? `${vitalSign.glucose} ${vitalSign.glucoseUnit || "mg/dL"}` : "N/A"
				}</span></p>
                <p class="info-item-professional"><span class="label">Posture: 🧍</span> <span class="value">${vitalSign.posture || "N/A"}</span></p>
            </div>
            <h3 class="subsection-header">Additional Details:</h3>
            <p class="info-item-professional"><span class="label">Capillary Refill Time:</span> <span class="value medical-data-font">${
				vitalSign.capillaryRefillTime || "N/A"
			} sec</span></p>
            <p class="info-item-professional"><span class="label">Method:</span> <span class="value">${vitalSign.method || "N/A"}</span></p>
            <h3 class="subsection-header">Notes: 📝</h3>
            <div class="notes-box-professional">${vitalSign.notes || "<i class='data-na'>Not Available</i>"}</div>
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generateVitalSignTableHtml = async (vitalSignsData, patientForHeaderContext) => {
		if (!vitalSignsData || vitalSignsData.length === 0) return "<p class='no-data-message'>No vital signs data available.</p>";
		const vitalColumns = [
			{ title: "Date", dataIndex: "timestamp", key: "timestamp", render: (ts) => (ts ? moment(ts).format("YY-MM-DD HH:mm") : "N/A") },
			{ title: "Temp (°C)", dataIndex: "temperature", key: "temperature" },
			{ title: "HR (bpm)", dataIndex: "heartRate", key: "heartRate" },
			{
				title: "BP (mmHg)",
				dataIndex: "bloodPressure",
				key: "bp",
				render: (_, rec) => `${rec.bloodPressureSystolic || "-"}/${rec.bloodPressureDiastolic || "-"}`,
			},
			{ title: "RR (/min)", dataIndex: "respiratoryRate", key: "respiratoryRate" },
			{ title: "SpO2 (%)", dataIndex: "oxygenSaturation", key: "oxygenSaturation" },
			{ title: "Pain", dataIndex: "painLevel", key: "painLevel" },
			{
				title: "Notes",
				dataIndex: "notes",
				key: "notes",
				render: (text) =>
					text && text.length > 20 ? `<span title="${text.replace(/"/g, `"`)}">${text.substring(0, 17)}...</span>` : text || "",
			},
		];
		const processedVitals = vitalSignsData.map((vs) => ({ ...vs }));

		return `
      <div class="report-section report-section-landscape break-inside-avoid">
        ${await generateProfessionalHeader("Vital Signs History", `VS-HIST-${Date.now().toString(36).toUpperCase()}`, patientForHeaderContext)}
        <div class="content-block">
            <h2 class="section-header-main">Vital Signs History 📈</h2>
            ${generateTableHTML(vitalColumns, processedVitals)}
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generateProductUsageHtml = async (productUsage, patientForHeaderContext) => {
		if (!productUsage) return null;
		const documentId = `PU-${productUsage.id}`;
		return `
      <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader("Product Usage Details", documentId, patientForHeaderContext)}
        <div class="content-block">
          <h2 class="section-header-main">Product Usage Details 📦</h2>
          <p class="info-item-professional"><span class="label">Start Time:</span> <span class="value">${
				productUsage.startTime ? moment(productUsage.startTime).format("YYYY-MM-DD HH:mm") : "<i class='data-na'>Not Available</i>"
			}</span></p>
          <p class="info-item-professional"><span class="label">End Time:</span> <span class="value">${
				productUsage.endTime ? moment(productUsage.endTime).format("YYYY-MM-DD HH:mm") : "<i class='data-na'>Not Available</i>"
			}</span></p>
          <p class="info-item-professional"><span class="label">Product Name:</span> <span class="value">${
				productUsage.productName || "<i class='data-na'>Not Available</i>"
			}</span></p>
          <p class="info-item-professional"><span class="label">Quantity:</span> <span class="value medical-data-font">${
				productUsage.quantity || "<i class='data-na'>Not Available</i>"
			}</span></p>
          <p class="info-item-professional"><span class="label">Price:</span> <span class="value medical-data-font">${
				productUsage.price ? `$${Number(productUsage.price).toFixed(2)}` : "<i class='data-na'>Not Available</i>"
			}</span></p>
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generateProductUsageTableHtml = async (productUsages, tableColumns, patientForHeaderContext) => {
		if (!productUsages || productUsages.length === 0) return "<p class='no-data-message'>No product usage data available.</p>";
		return `
      <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader("Product Usage History", `PU-HIST-${Date.now().toString(36).toUpperCase()}`, patientForHeaderContext)}
        <div class="content-block">
          <h2 class="section-header-main">Product Usage History 📦</h2>
          ${generateTableHTML(tableColumns, productUsages)}
        </div>
        ${generateProfessionalFooter()}</div>`;
	};

	const generateMedicationAdministrationHtml = async (medAdmin, patientForHeaderContext) => {
		if (!medAdmin) return null;
		const documentId = `MA-${medAdmin.id}`;
		return `
      <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader("Medication Administration Details", documentId, patientForHeaderContext)}
        <div class="content-block">
          <h2 class="section-header-main">Medication Administration Details 💉</h2>
          <p class="info-item-professional"><span class="label">Administration Time:</span> <span class="value">${
				medAdmin.administrationTime ? moment(medAdmin.administrationTime).format("YYYY-MM-DD HH:mm") : "<i class='data-na'>Not Available</i>"
			}</span></p>
          <p class="info-item-professional"><span class="label">Medication:</span> <span class="value">${
				medAdmin.medicationName || "<i class='data-na'>Not Available</i>"
			}</span></p>
          <p class="info-item-professional"><span class="label">Amount:</span> <span class="value medical-data-font">${
				medAdmin.amount || "<i class='data-na'>Not Available</i>"
			}</span></p>
          <p class="info-item-professional"><span class="label">Calculated Price:</span> <span class="value medical-data-font">${
				medAdmin.calculatedPrice ? `$${Number(medAdmin.calculatedPrice).toFixed(2)}` : "<i class='data-na'>Not Available</i>"
			}</span></p>
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generateMedicationAdministrationTableHtml = async (medAdmins, tableColumns, patientForHeaderContext) => {
		if (!medAdmins || medAdmins.length === 0) return "<p class='no-data-message'>No medication administration data available.</p>";
		return `
      <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader(
			"Medication Administration History",
			`MA-HIST-${Date.now().toString(36).toUpperCase()}`,
			patientForHeaderContext
		)}
        <div class="content-block">
          <h2 class="section-header-main">Medication Administration History 💉</h2>
          ${generateTableHTML(tableColumns, medAdmins)}
        </div>
        ${generateProfessionalFooter()}</div>`;
	};

	const generateImageReportHtml = async (imageReport, patientForHeaderContext) => {
		if (!imageReport) return null;
		const documentId = `IR-${imageReport.id}`;
		let imagesHtml = "";
		if (imageReport.imageUrls && imageReport.imageUrls.length > 0) {
			for (const rawUrl of imageReport.imageUrls) {
				const fullUrl = generateImageUrl(rawUrl);
				const isVideo = [".mp4", ".webm", ".ogg"].some((ext) => fullUrl.toLowerCase().endsWith(ext));
				if (isVideo) {
					const qrCodeDataURL = await QRCode.toDataURL(fullUrl, { width: 100, margin: 1 });
					imagesHtml += `
            <div class="media-item-container break-inside-avoid">
              <p class="media-caption"><strong>Video:</strong> <a href="${fullUrl}" target="_blank">${fullUrl.split("/").pop()}</a> (Scan QR)</p>
              <img src="${qrCodeDataURL}" alt="QR Code for ${fullUrl.split("/").pop()}" class="media-qr-code"/>
            </div>`;
				} else {
					try {
						const base64Data = await toBase64(rawUrl);
						if (base64Data) {
							imagesHtml += `
                <div class="media-item-container break-inside-avoid">
                  <img src="${base64Data}" alt="Report Image" class="report-image"/>
                </div>`;
						} else {
							imagesHtml += `<p class="error-message">Failed to load image: ${rawUrl.split("/").pop()}</p>`;
						}
					} catch (e) {
						imagesHtml += `<p class="error-message">Error loading image ${rawUrl.split("/").pop()}: ${e.message}</p>`;
					}
				}
			}
		} else {
			imagesHtml = "<p class='no-data-message-inline'>No images or videos available for this report.</p>";
		}
		return `
      <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader("Imaging Report", documentId, patientForHeaderContext)}
        <div class="content-block">
            <h2 class="section-header-main">Imaging Report Details 🖼️</h2>
            <p class="info-item-professional"><span class="label">Report Date:</span> <span class="value">${
				imageReport.reportDateTime ? moment(imageReport.reportDateTime).format("YYYY-MM-DD HH:mm") : "<i class='data-na'>Not Available</i>"
			}</span></p>
            <p class="info-item-professional"><span class="label">Image Type:</span> <span class="value">${
				imageReport.imageType || "<i class='data-na'>Not Available</i>"
			}</span></p>
            <p class="info-item-professional"><span class="label">Description:</span> <span class="value">${
				imageReport.description || "<i class='data-na'>Not Available</i>"
			}</span></p>
            <h3 class="subsection-header">Report Findings:</h3>
            <div class="notes-box-professional">${imageReport.reportText || "<i class='data-na'>Not Available</i>"}</div>
            <div class="media-gallery">${imagesHtml}</div>
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generateImageReportTableHtml = async (imageReports, patientForHeaderContext) => {
		if (!imageReports || imageReports.length === 0) return "<p class='no-data-message'>No image report data available.</p>";

		let combinedContent = "";
		for (let i = 0; i < imageReports.length; i++) {
			const currentReport = imageReports[i];
			// Determine patient context for this specific report in the list
			const reportPatientContext =
				patientForHeaderContext || // Use overall patient context if available
				currentReport.patient || // Or patient object within the report item
				(currentReport.patientId
					? {
							// Or build from flat properties
							id: currentReport.patientId,
							medicalRecordNumber: currentReport.patientMedicalRecordNumber,
							firstName: currentReport.patientFirstName,
							lastName: currentReport.patientLastName,
							dateOfBirth: currentReport.patientDateOfBirth,
							gender: currentReport.patientGender,
							attendingPhysician: currentReport.attendingPhysicianName || currentReport.attendingPhysician,
							profilePictureURL: currentReport.patientProfilePictureURL,
					  }
					: null);

			let reportContent = await generateImageReportHtml(currentReport, reportPatientContext);
			if (reportContent) {
				combinedContent += `<div class="${i > 0 ? "page-break-before" : ""} report-section-wrapper">${reportContent}</div>`;
			}
		}
		return combinedContent;
	};

	const generateResultTableForLab = (structureMapTable, resultMap) => {
		if (!structureMapTable || !resultMap) return { columns: [], dataSource: [] };
		const { headers, rows: structureRows } = structureMapTable;
		const columns = headers.map((header) => ({ title: header, dataIndex: header, key: header }));
		const dataSource = structureRows.map((structRow) => {
			const rowKey = structRow[0];
			const rowData = resultMap[rowKey] || {};
			const row = { key: rowKey };
			headers.forEach((header, index) => {
				row[header] = rowData?.[header] !== undefined ? rowData[header] : structRow[index] !== undefined ? structRow[index] : null;
			});
			return row;
		});
		return { columns, dataSource };
	};

	const generateLabResultHtml = async (labResult, currentLabTests, patientForHeaderContext) => {
		if (!labResult || !currentLabTests) return null;
		const labTestDetails = currentLabTests.find((test) => test.id === labResult.labTestId);
		if (!labTestDetails) {
			return `<p class='error-message'>Error: Lab test details not found for result ID ${labResult.id}.</p>`;
		}
		const { testName, description } = labTestDetails;
		const { resultDateTime, notes, resultMap } = labResult;
		const { columns: resultColumns, dataSource: resultDataSource } = generateResultTableForLab(labTestDetails.structureMap?.table, resultMap);
		const documentId = `LR-${labResult.id}`;
		const resultsTableHtml =
			resultDataSource && resultDataSource.length > 0
				? generateTableHTML(resultColumns, resultDataSource)
				: "<p class='no-data-message-inline'>No structured results for this test.</p>";

		return `
      <div class="report-section break-inside-avoid">
        ${await generateProfessionalHeader(`Lab Result: ${testName}`, documentId, patientForHeaderContext)}
        <div class="content-block">
            <h2 class="section-header-main">Lab Result: ${testName} 🧪</h2>
            <p class="info-item-professional"><span class="label">Test Description:</span> <span class="value">${
				description || "<i class='data-na'>Not Available</i>"
			}</span></p>
            <p class="info-item-professional"><span class="label">Result Date:</span> <span class="value">${
				resultDateTime ? moment(resultDateTime).format("YYYY-MM-DD HH:mm") : "<i class='data-na'>Not Available</i>"
			}</span></p>
            <h3 class="subsection-header">Notes: 🗒️</h3>
            <div class="notes-box-professional" style="margin-bottom:15px;">${notes || "<i class='data-na'>Not Available</i>"}</div>
            <h3 class="subsection-header">Results Table:</h3>
            ${resultsTableHtml}
        </div>
        ${generateProfessionalFooter()}
      </div>`;
	};

	const generateLabResultTableHtml = async (labResultsData, currentLabTests, patientForHeaderContext) => {
		if (!labResultsData || labResultsData.length === 0) return "<p class='no-data-message'>No lab result data available.</p>";
		if (!currentLabTests || currentLabTests.length === 0)
			return "<p class='no-data-message'>Lab Test definitions not available, cannot render lab results.</p>";

		let combinedContent = "";
		for (let i = 0; i < labResultsData.length; i++) {
			const currentResult = labResultsData[i];
			const reportPatientContext =
				patientForHeaderContext ||
				currentResult.patient ||
				(currentResult.patientId
					? {
							id: currentResult.patientId,
							medicalRecordNumber: currentResult.patientMedicalRecordNumber,
							firstName: currentResult.patientFirstName,
							lastName: currentResult.patientLastName,
							dateOfBirth: currentResult.patientDateOfBirth,
							gender: currentResult.patientGender,
							attendingPhysician: currentResult.attendingPhysicianName || currentResult.attendingPhysician,
							profilePictureURL: currentResult.patientProfilePictureURL,
					  }
					: null);

			let resultContent = await generateLabResultHtml(currentResult, currentLabTests, reportPatientContext);
			if (resultContent) {
				combinedContent += `<div class="${i > 0 ? "page-break-before" : ""} report-section-wrapper">${resultContent}</div>`;
			}
		}
		return combinedContent;
	};

	const generateProcedureLogHtml = async (log, patientForHeaderContext) => {
		if (!log) return null;
		const documentId = `PROC-${log.id}`;
		return `
        <div class="report-section break-inside-avoid">
            ${await generateProfessionalHeader("Procedure Log Details", documentId, patientForHeaderContext)}
            <div class="content-block">
                <h2 class="section-header-main">Procedure Log Details 🛠️</h2>
                <p class="info-item-professional"><span class="label">Procedure Name:</span> <span class="value">${
					log.procedureName || "<i class='data-na'>Not Available</i>"
				}</span></p>
                <p class="info-item-professional"><span class="label">Start Time:</span> <span class="value">${
					log.startTime ? moment(log.startTime).format("YYYY-MM-DD HH:mm") : "<i class='data-na'>Not Available</i>"
				}</span></p>
                <p class="info-item-professional"><span class="label">Performed By:</span> <span class="value">${
					log.userName || "<i class='data-na'>Not Available</i>"
				}</span></p>
                <p class="info-item-professional"><span class="label">Billing ID:</span> <span class="value medical-data-font">${
					log.billingId || "<i class='data-na'>Not Available</i>"
				}</span></p>
                <h3 class="subsection-header">Notes:</h3>
                <div class="notes-box-professional">${log.notes || "<i class='data-na'>Not Available</i>"}</div>
            </div>
            ${generateProfessionalFooter()}
        </div>`;
	};

	const generateProcedureLogTableHtml = async (logs, tableColumns, patientForHeaderContext) => {
		if (!logs || logs.length === 0) return "<p class='no-data-message'>No procedure log data available.</p>";
		return `
        <div class="report-section break-inside-avoid">
            ${await generateProfessionalHeader(
				"Procedure Log History",
				`PROC-HIST-${Date.now().toString(36).toUpperCase()}`,
				patientForHeaderContext
			)}
            <div class="content-block">
                <h2 class="section-header-main">Procedure Log History 🛠️</h2>
                ${generateTableHTML(tableColumns, logs)}
            </div>
            ${generateProfessionalFooter()}
        </div>`;
	};

	const generatePatientFileHtml = async (patientForFile, allPatientData) => {
		if (!patientForFile) return null; // patientForFile is the main patient object
		const {
			admissions,
			appointments,
			assessments,
			billings,
			carePlans,
			prescriptions,
			vitalSigns,
			productUsages,
			medicationAdministrations,
			imageReports,
			labResults,
			procedureLogs,
		} = allPatientData;

		let reportSubtitle = reportScope === "active" ? " (Active Information Summary)" : " (Comprehensive Medical Record)";
		const patientIdentityBlockFull = await generatePatientIdentityBlock(patientForFile, "full");

		let htmlContent = `
      <div class="patient-file-cover-page report-section" style="page-break-after: always;">
        <div class="institution-header-block cover-institution-header">
            <div class="institution-details-main" style="text-align:center; width:100%;">
                <p class="institution-name">GMTS MEDICAL CENTER</p>
                <p class="department-name" style="font-size: 12pt;">Patient Medical Records Department</p>
            </div>
        </div>
        <h1 class="document-title-main">PATIENT MEDICAL RECORD</h1>
        <h2 class="document-subtitle-main">${reportSubtitle.toUpperCase()}</h2>
        ${patientIdentityBlockFull}
        <div class="cover-page-footer">
            <p>Report Generated: ${moment().format("YYYY-MM-DD HH:mm:ss")}</p>
            <p>This document contains confidential patient information. Handle with utmost care.</p>
        </div>
      </div>
      `;

		let isFirstContentSection = true;
		const addSection = async (generatorFn, dataArray, ...args) => {
			const patientHeaderDataForSection = patientForFile;
			if (dataArray && dataArray.length > 0) {
				const sectionContent = await generatorFn(dataArray, ...args, patientHeaderDataForSection);
				if (
					sectionContent &&
					!sectionContent.includes("No data available for this section.") &&
					!sectionContent.includes("<p class='no-data-message'>")
				) {
					if (!isFirstContentSection) {
						htmlContent += `<div class="page-break-before"></div>`;
					}
					htmlContent += sectionContent;
					isFirstContentSection = false;
				}
			}
		};

		const defaultAdmissionColumns = [
			{ title: "Admission Date", dataIndex: "admissionDate", render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A") },
			{ title: "Discharge Date", dataIndex: "dischargeDate", render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "Open") },
			{ title: "Bed ID", dataIndex: "bedId", key: "bedId" },
		];
		const defaultAppointmentColumns = [
			{ title: "Date/Time", dataIndex: "appointmentDateTime", render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A") },
			{ title: "Service", dataIndex: "productName" },
			{
				title: "Provider",
				key: "provider",
				render: (text, record) => `${record.userFirstName || ""} ${record.userLastName || ""}`.trim() || "N/A",
			},
			{ title: "Status", dataIndex: "status" },
		];
		const defaultCarePlanColumns = [
			{ title: "Plan Date", dataIndex: "planDate", render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A") },
			{ title: "Goal", dataIndex: "goal" },
			{
				title: "Interventions",
				dataIndex: "interventions",
				render: (text) => (text && text.length > 70 ? text.substring(0, 67) + "..." : text),
			},
		];
		const defaultProcedureLogColumnsPF = [
			{ title: "Procedure Name", dataIndex: "procedureName" },
			{ title: "Start Time", dataIndex: "startTime", render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A") },
			{ title: "Performed By", dataIndex: "userName" },
			{ title: "Notes", dataIndex: "notes", render: (text) => (text && text.length > 50 ? text.substring(0, 47) + "..." : text || "") },
		];
		const productUsageColsPF = [
			{ title: "Start Time", dataIndex: "startTime", render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A") },
			{ title: "Product Name", dataIndex: "productName" },
			{ title: "Quantity", dataIndex: "quantity", key: "quantity" },
		];
		const medAdminColsPF = [
			{ title: "Admin Time", dataIndex: "administrationTime", render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A") },
			{ title: "Medication", dataIndex: "medicationName" },
			{ title: "Amount", dataIndex: "amount" },
		];

		await addSection(generateAdmissionTableHtml, admissions, defaultAdmissionColumns);
		await addSection(generateAppointmentTableHtml, appointments, defaultAppointmentColumns);
		await addSection(generateAssessmentTableHtml, assessments);
		await addSection(generateBillingTableHtml, billings);
		await addSection(generateCarePlanTableHtml, carePlans, defaultCarePlanColumns);
		await addSection(generatePrescriptionTableHtml, prescriptions);
		await addSection(generateVitalSignTableHtml, vitalSigns);
		await addSection(generateProductUsageTableHtml, productUsages, productUsageColsPF);
		await addSection(generateMedicationAdministrationTableHtml, medicationAdministrations, medAdminColsPF);
		await addSection(generateProcedureLogTableHtml, procedureLogs, defaultProcedureLogColumnsPF);

		if (imageReports && imageReports.length > 0) {
			const imgReportContent = await generateImageReportTableHtml(imageReports, patientForFile);
			if (imgReportContent && !imgReportContent.includes("<p class='no-data-message'>")) {
				if (!isFirstContentSection) htmlContent += `<div class="page-break-before"></div>`;
				htmlContent += imgReportContent;
				isFirstContentSection = false;
			}
		}
		if (labResults && labResults.length > 0 && labTests && labTests.length > 0) {
			const labResContent = await generateLabResultTableHtml(labResults, labTests, patientForFile);
			if (labResContent && !labResContent.includes("<p class='no-data-message'>")) {
				if (!isFirstContentSection) htmlContent += `<div class="page-break-before"></div>`;
				htmlContent += labResContent;
				isFirstContentSection = false;
			}
		} else if (labResults && labResults.length > 0 && (!labTests || labTests.length === 0)) {
			if (!isFirstContentSection) htmlContent += `<div class="page-break-before"></div>`;
			htmlContent += `<div class="report-section break-inside-avoid">${await generateProfessionalHeader(
				"Lab Results Issue",
				`LR-ERR-${Date.now().toString(36).toUpperCase()}`,
				patientForFile
			)}<div class="content-block error-message">Lab results exist but Lab Test definitions are missing. Cannot render details.</div>${generateProfessionalFooter()}</div>`;
			isFirstContentSection = false;
		}

		return htmlContent;
	};

	const generateHtmlAndDownload = async () => {
		let htmlContentToEmbed = "";
		let reportTitleForFile = "Medical Report";
		let filename = "medical_report.html";
		let orientationClass = "";

		let patientContextForCurrentReport = patientDataForHeader;

		if (!patientContextForCurrentReport) {
			let sourceDataItem = null;

			if (mode === "patientFile" && data) {
				sourceDataItem = data; // data IS the patient object
				patientContextForCurrentReport = sourceDataItem; // Patient object itself is the context
			} else if (data) {
				// For 'single' or 'table' modes
				const item = mode === "single" ? data : Array.isArray(data) && data.length > 0 ? data[0] : null;
				if (item) {
					sourceDataItem = item; // The report item (e.g., admission, appointment)
					if (sourceDataItem.patient && typeof sourceDataItem.patient === "object") {
						patientContextForCurrentReport = sourceDataItem.patient; // Use the nested patient object
					} else {
						// No nested .patient object. Try to construct from flat properties on sourceDataItem.
						// This relies on sourceDataItem (e.g., an appointment object) having these flat fields,
						// or denormalized fields like patientFirstName.
						patientContextForCurrentReport = {
							id: sourceDataItem.patientId || sourceDataItem.id,
							medicalRecordNumber: sourceDataItem.medicalRecordNumber || sourceDataItem.patientMedicalRecordNumber,
							firstName: sourceDataItem.firstName || sourceDataItem.patientFirstName,
							lastName: sourceDataItem.lastName || sourceDataItem.patientLastName,
							dateOfBirth: sourceDataItem.dateOfBirth || sourceDataItem.patientDateOfBirth,
							gender: sourceDataItem.gender || sourceDataItem.patientGender,
							attendingPhysician:
								sourceDataItem.attendingPhysicianName ||
								sourceDataItem.attendingPhysician ||
								sourceDataItem.patientAttendingPhysician,
							profilePictureURL: sourceDataItem.profilePictureURL || sourceDataItem.patientProfilePictureURL,
						};
					}
				}
			}
		}

		const finalPatientContext = {
			id: patientContextForCurrentReport?.id || null,
			medicalRecordNumber: patientContextForCurrentReport?.medicalRecordNumber || null,
			firstName: patientContextForCurrentReport?.firstName || null,
			lastName: patientContextForCurrentReport?.lastName || null,
			dateOfBirth: patientContextForCurrentReport?.dateOfBirth || null,
			gender: patientContextForCurrentReport?.gender || null,
			attendingPhysician: patientContextForCurrentReport?.attendingPhysician || null,
			profilePictureURL: patientContextForCurrentReport?.profilePictureURL || null,
		};

		try {
			setIsGeneratingFile(true);

			if (mode === "patientFile") {
				const patientObjectForFile = data; // data IS the patient object for patientFile mode
				if (!patientObjectForFile || !patientObjectForFile.id) {
					notification.error({ message: "Error", description: "Patient data is not available for Patient File." });
					setIsGeneratingFile(false);
					return;
				}
				reportTitleForFile = `Patient File - ${patientObjectForFile.firstName} ${patientObjectForFile.lastName}`;
				const baseFileName = `patient_file_${patientObjectForFile.medicalRecordNumber || "UNKNOWN"}`;
				filename = `${baseFileName}_${reportScope === "active" ? "active" : "all"}_${moment().format("YYYYMMDD_HHmmss")}.html`;
				const comprehensiveData = await usePatientDetailStore.getState().fetchAllDataForReport(patientObjectForFile.id, reportScope);
				// generatePatientFileHtml uses patientObjectForFile internally for its section headers, which is correct.
				htmlContentToEmbed = await generatePatientFileHtml(patientObjectForFile, comprehensiveData);
			} else if (mode === "single") {
				reportTitleForFile = `${type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, " $1")} Details`;
				filename = `${fileNamePrefix}_${data.id}_${moment().format("YYYYMMDD_HHmmss")}.html`;
				switch (type) {
					case "admission":
						htmlContentToEmbed = await generateAdmissionHtml(data, finalPatientContext);
						break;
					case "appointment":
						htmlContentToEmbed = await generateAppointmentHtml(data, finalPatientContext);
						break;
					case "billing":
						htmlContentToEmbed = await generateBillingHtml(data, finalPatientContext);
						break;
					case "assessment":
						htmlContentToEmbed = await generateAssessmentHtml(data, finalPatientContext);
						break;
					case "carePlan":
						htmlContentToEmbed = await generateCarePlanHtml(data, finalPatientContext);
						break;
					case "prescription":
						htmlContentToEmbed = await generatePrescriptionHtml(data, finalPatientContext);
						break;
					case "vitalSign":
						htmlContentToEmbed = await generateVitalSignHtml(data, finalPatientContext);
						break;
					case "productUsage":
						htmlContentToEmbed = await generateProductUsageHtml(data, finalPatientContext);
						break;
					case "medicationAdministration":
						htmlContentToEmbed = await generateMedicationAdministrationHtml(data, finalPatientContext);
						break;
					case "imageReport":
						htmlContentToEmbed = await generateImageReportHtml(data, finalPatientContext);
						break;
					case "labResult":
						htmlContentToEmbed = await generateLabResultHtml(data, labTests, finalPatientContext);
						break;
					case "procedureLog":
						htmlContentToEmbed = await generateProcedureLogHtml(data, finalPatientContext);
						break;
					default:
						throw new Error("Invalid report type for single mode.");
				}
			} else if (mode === "table") {
				reportTitleForFile = `${type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, " $1")} Summary`;
				filename = `${fileNamePrefix}_summary_${moment().format("YYYYMMDD_HHmmss")}.html`;
				switch (type) {
					case "admission":
						htmlContentToEmbed = await generateAdmissionTableHtml(data, columns, finalPatientContext);
						break;
					case "appointment":
						htmlContentToEmbed = await generateAppointmentTableHtml(data, columns, finalPatientContext);
						break;
					case "billing":
						htmlContentToEmbed = await generateBillingTableHtml(data, finalPatientContext);
						break;
					case "assessment":
						htmlContentToEmbed = await generateAssessmentTableHtml(data, finalPatientContext);
						break;
					case "carePlan":
						htmlContentToEmbed = await generateCarePlanTableHtml(data, columns, finalPatientContext);
						break;
					case "prescription":
						htmlContentToEmbed = await generatePrescriptionTableHtml(data, finalPatientContext);
						break;
					case "vitalSign":
						htmlContentToEmbed = await generateVitalSignTableHtml(data, finalPatientContext);
						orientationClass = "report-section-landscape";
						break;
					case "productUsage":
						htmlContentToEmbed = await generateProductUsageTableHtml(data, columns, finalPatientContext);
						break;
					case "medicationAdministration":
						htmlContentToEmbed = await generateMedicationAdministrationTableHtml(data, columns, finalPatientContext);
						break;
					case "imageReport":
						htmlContentToEmbed = await generateImageReportTableHtml(data, finalPatientContext);
						break;
					case "labResult":
						htmlContentToEmbed = await generateLabResultTableHtml(data, labTests, finalPatientContext);
						break;
					case "procedureLog":
						htmlContentToEmbed = await generateProcedureLogTableHtml(data, columns, finalPatientContext);
						break;
					default:
						throw new Error("Invalid report type for table mode.");
				}
			} else {
				throw new Error("Invalid report mode.");
			}

			if (!htmlContentToEmbed || htmlContentToEmbed.includes("<p class='no-data-message'>")) {
				notification.info({ message: "Info", description: "No data to export for this report." });
				setIsGeneratingFile(false);
				return;
			}

			const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportTitleForFile}</title>
    <style>
        /* Typography System */
        body {
            font-family: 'Source Sans Pro', 'Helvetica Neue', Arial, 'Liberation Sans', sans-serif;
            font-size: 10pt; /* Default body text */
            line-height: 1.4;
            color: #2d3748; /* Charcoal for primary text */
            background-color: #e2e8f0; /* Light gray page background for screen */
            margin: 0;
            padding: 0;
        }
        .medical-data-font {
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            font-size: 9pt; /* Data values */
        }

        /* Document & Section Headers */
        .document-title-main { font-size: 24pt; font-weight: 600; color: #1a365d; margin-bottom: 10px; text-align:center; }
        .document-subtitle-main { font-size: 14pt; font-weight: 500; color: #2c5282; margin-bottom: 20px; text-align:center; text-transform: uppercase; letter-spacing: 0.5px; }
        .section-header-main { font-size: 16pt; font-weight: 600; color: #1a365d; margin-top: 20px; margin-bottom:15px; border-bottom: 2px solid #2c5282; padding-bottom: 5px;}
        .subsection-header { font-size: 12pt; font-weight: 500; color: #2c5282; margin-top: 15px; margin-bottom: 8px; }
        .subsubsection-header { font-size: 10pt; font-weight: 600; color: #2d3748; margin-top: 10px; margin-bottom: 5px; }


        /* Footer & Meta Text */
        .primary-footer, .audit-footer { font-size: 8pt; color: #4a5568; }
        .data-na { font-style: italic; color: #718096; }

        /* Color Palette Usage */
        .critical-value { background-color: #fed7d7; color: #c53030 !important; font-weight: bold; } /* Medical Red related */
        .out-of-range-value { background-color: #feebc8; color: #975a16 !important; } /* Warning Amber related */
        .positive-indicator { color: #2c7a7b; } /* Professional Teal */
        
        /* Layout Architecture */
        .report-container {
            background-color: #ffffff; /* Pure White for content background */
            margin: 20mm auto; 
            padding: 0; 
            width: 210mm; /* A4 Portrait width */
            min-height: 297mm; /* A4 Portrait height */
            box-sizing: border-box;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            position: relative; 
            display: flex;
            flex-direction: column;
        }
        .report-container.report-section-landscape {
             width: 297mm; /* A4 Landscape width */
             min-height: 210mm;
        }
        .report-section {
            flex-grow: 1; 
            display: flex;
            flex-direction: column;
        }
        .report-section-wrapper { 
            page-break-inside: avoid;
        }
        .content-block {
            padding: 5mm 20mm; 
            flex-grow: 1;
        }

        /* Professional Header System */
        .institution-header-block {
            background-color: #f7fafc; 
            padding: 10px 20mm;
            border-bottom: 1px solid #e2e8f0; 
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .institution-details-main { text-align: left; }
        .institution-name { font-size: 14pt; font-weight: 600; color: #1a365d; margin:0 0 2px; }
        .department-name { font-size: 10pt; color: #2c5282; margin:0 0 8px; }
        
        .institution-contact-details { text-align: right; }
        .institution-contact-details p { font-size: 8pt; color: #4a5568; margin: 1px 0; line-height: 1.3; }


        .document-classification-bar {
            background-color: #2c5282; 
            color: #ffffff;
            padding: 6px 20mm;
            font-size: 8.5pt;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 500;
        }
        .document-classification-bar span { margin-right: 15px; }
        .document-classification-bar span:last-child { margin-right: 0; }

        /* Patient Identity Block */
        .patient-identity-block {
            background-color: #edf2f7; 
            padding: 10px 20mm;
            border-bottom: 1px solid #e2e8f0; 
            margin-bottom: 10px; 
            position: relative; 
        }
        .patient-identity-block.condensed { padding: 8px 20mm; margin-bottom: 5px; }
        .patient-identity-block .patient-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
            gap: 5px 15px; 
        }
         .patient-identity-block.condensed .patient-info-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 3px 10px;
         }
        .patient-identity-block .info-item { font-size: 9pt; display:flex; align-items: baseline; }
        .patient-identity-block .info-item .label { font-weight: 600; color: #1a365d; min-width:90px; display:inline-block; }
        .patient-identity-block.condensed .info-item .label { min-width:80px; font-size: 8.5pt; }
        .patient-identity-block .info-item .value { color: #2d3748; }
        .patient-identity-block.condensed .info-item .value { font-size: 8.5pt; }
        .patient-photo-area { position: absolute; top: 10px; right: 20mm; }
        .patient-photo-sm { width: 80px; height: 80px; object-fit: cover; border: 2px solid #ffffff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .patient-photo-placeholder-sm { width: 80px; height: 80px; background-color: #cbd5e0; border: 2px solid #ffffff; border-radius: 4px; display:flex; align-items:center; justify-content:center; font-size:10pt; color: #4a5568; text-align:center; }
        .mrn-qr-code-area-full { position: absolute; top: 100px; right: 20mm; text-align: center; }
        .mrn-qr-code-area-full img { width:70px; height:70px; margin-bottom:2px; }
        .mrn-qr-code-area-full p { font-size: 8pt; margin:0; }
        .qr-code-item-condensed img { width: 40px; height: 40px; margin-left: auto; }


        /* Professional Footer System */
        .primary-footer {
            background-color: #f7fafc; 
            padding: 10px 20mm;
            border-top: 1px solid #e2e8f0; 
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto; 
        }
        .footer-column p { margin: 2px 0; }
        .audit-footer {
            background-color: #e2e8f0; 
            color: #718096; 
            padding: 5px 20mm;
            font-size: 7pt;
            text-align: center;
        }

        /* Table Design */
        .table-container { overflow-x: auto; margin-top: 5px; margin-bottom: 10px; }
        .medical-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt; 
        }
        .medical-table .table-th {
            background-color: #f7fafc; 
            border: 1px solid #e2e8f0; 
            font-weight: 600; 
            padding: 8px 12px; 
            text-align: left;
            color: #1a365d; 
        }
        .medical-table .table-td {
            border: 1px solid #e2e8f0; 
            padding: 6px 12px; 
            vertical-align: top;
        }
        .medical-table .table-tr.odd .table-td {
            background-color: #f7fafc; 
        }
        .external-bill-table .table-th { background-color: #edf2f7; } 
        .external-bill-table .table-td { font-size: 8pt; padding: 4px 8px; }


        /* Specific Content Styling */
        .info-item-professional { margin-bottom: 8px; font-size: 10pt; display: flex; }
        .info-item-professional .label { font-weight: 600; color: #1a365d; min-width: 180px; display: inline-block; }
        .info-item-professional .value { color: #2d3748; }

        .notes-box-professional {
            font-size: 9pt;
            border: 1px solid #e2e8f0; 
            padding: 10px 12px;
            background-color: #fdfdff; 
            border-radius: 3px;
            line-height: 1.5;
            word-wrap: break-word;
            margin-top: 5px;
        }
        .notes-box-professional.small-notes { padding: 6px 8px; font-size: 8pt; }

        .media-item-container { border: 1px solid #e2e8f0; padding: 10px; margin-bottom: 10px; text-align: center; }
        .media-caption { font-size: 9pt; margin-bottom: 5px; }
        .report-image { max-width: 100%; max-height: 350px; object-fit: contain; border: 1px solid #cbd5e0; display: block; margin-left: auto; margin-right: auto; }
        .media-qr-code { width:100px; height:100px; margin: 5px auto; border: 1px solid #cbd5e0; }
        .media-gallery { margin-top: 15px; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; }

        .summary-item-container {
            border: 1px solid #e2e8f0;
            padding: 10px 15px;
            margin-bottom: 15px;
            border-radius: 4px;
            background-color: #ffffff;
        }
        .billing-item-container, .assessment-item-container, .prescription-item-container {
             border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 15px; border-radius: 3px;
        }
        .external-html-content { margin-top: 10px; }
        .vitals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 5px 15px; margin: 10px 0; }

        /* Patient File Cover Page */
        .patient-file-cover-page {
            display: flex;
            flex-direction: column;
            align-items: center; 
            justify-content: space-between; 
            text-align: center;
            background-color: #f7fafc;
            padding: 20mm 20mm 15mm 20mm; 
        }
        .patient-file-cover-page .cover-institution-header { width: 100%; background: none; border:none; padding: 0 0 20px 0; text-align:center; display:block;}
        .patient-file-cover-page .cover-institution-header .institution-details-main { text-align:center; width:100%; margin-bottom: 5px;}
        .patient-file-cover-page .patient-identity-block { width: 100%; max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 20px; }
        .patient-file-cover-page .patient-identity-block .patient-info-grid { grid-template-columns: 1fr; text-align:left; } 
        .patient-file-cover-page .patient-photo-area { position:static; margin: 0 auto 15px auto; }
        .patient-file-cover-page .mrn-qr-code-area-full { position:static; margin: 15px auto 0 auto;}

        .cover-page-footer {
            margin-top: 30px;
            font-size: 8pt;
            color: #718096;
        }
        .cover-page-footer p { margin: 3px 0; }

        /* Utility classes */
        .page-break-before { page-break-before: always !important; }
        .page-break-after { page-break-after: always !important; }
        .break-inside-avoid { page-break-inside: avoid !important; }
        .no-data-message { text-align: center; padding: 20px; font-size: 11pt; color: #4a5568; }
        .no-data-message-inline { font-style: italic; color: #718096; font-size: 9pt; }
        .error-message { color: #c53030; font-weight: bold; padding: 10px; border: 1px solid #f56565; background-color: #fed7d7; border-radius:3px; }
        

        /* Print Optimizations */
        @media print {
            @page {
                size: A4 portrait;
                margin: 20mm 15mm 20mm 15mm; /* Adjusted margins */
            }
            @page :first {
                /* margin-top: 15mm; /* Example: Less top margin for cover */
            }
            @page landscape {
                size: A4 landscape;
                margin: 15mm 10mm 15mm 10mm; /* Adjusted landscape margins */
            }

            * {
                box-shadow: none !important;
                text-shadow: none !important;
            }
            html, body {
                width: 100%;
                height: auto; /* Use auto for height in print */
            }
            body {
                background-color: #ffffff !important;
                color: #000000 !important;
                font-size: 9pt !important; /* Slightly smaller base for print */
                line-height: 1.3 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            p, li, blockquote {
                widows: 2 !important;
                orphans: 2 !important;
            }
            a, a:visited {
                color: #000000 !important;
                text-decoration: underline !important;
            }

            .report-container {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                min-height: unset !important;
                border: none !important;
            }
            .report-section-landscape { page: landscape; }
            .content-block { padding: 0 !important; } 

            .document-title-main { font-size: 20pt !important; margin-bottom: 8px !important;}
            .document-subtitle-main { font-size: 12pt !important; margin-bottom: 15px !important;}
            .section-header-main { font-size: 14pt !important; margin-top: 15px !important; margin-bottom: 10px !important; padding-bottom: 3px !important; border-bottom-width: 1px !important; }
            .subsection-header { font-size: 11pt !important; margin-top: 10px !important; margin-bottom: 5px !important; }
            .subsubsection-header { font-size: 9.5pt !important; margin-top: 8px !important; margin-bottom: 4px !important; }
            
            .institution-header-block { background-color: #f0f3f7 !important; border-bottom-color: #d2dce9 !important; padding: 8px 0 !important; /* Reduced padding for print */ }
            .institution-name { font-size: 12pt !important; color: #000000 !important; }
            .department-name { font-size: 9pt !important; color: #000000 !important; }
            .institution-contact-details p { font-size: 7.5pt !important; color: #333 !important; margin: 0.5px 0 !important; }

            .document-classification-bar { background-color: #2c5282 !important; color: #ffffff !important; padding: 4px 0 !important; font-size: 8pt !important;}
            
            .patient-identity-block { background-color: #f0f3f7 !important; border-bottom-color: #d2dce9 !important; padding: 8px 0 !important; margin-bottom: 8px !important; }
            .patient-identity-block.condensed { padding: 6px 0 !important; margin-bottom: 4px !important; }
            .patient-identity-block .info-item { font-size: 8.5pt !important; }
            .patient-identity-block.condensed .info-item .label { font-size: 8pt !important; }
            .patient-identity-block.condensed .info-item .value { font-size: 8pt !important; }
            .patient-photo-sm, .patient-photo-placeholder-sm { border: 1px solid #ccc !important; box-shadow: none !important; width: 70px !important; height: 70px !important; }
            .patient-photo-placeholder-sm { font-size: 9pt !important; }


            .critical-value { background-color: #fed7d7 !important; color: #c53030 !important; }
            .out-of-range-value { background-color: #feebc8 !important; color: #975a16 !important; }

            .medical-table { font-size: 8pt !important; }
            .medical-table .table-th { background-color: #f0f3f7 !important; color: #000000 !important; border-color: #d2dce9 !important; font-size: 8pt !important; padding: 4px 6px !important; }
            .medical-table .table-tr.odd .table-td { background-color: #f9fafb !important; } 
            .medical-table .table-td { border: 1px solid #d2dce9 !important; font-size: 7.5pt !important; padding: 3px 6px !important; vertical-align: middle !important; }

            .info-item-professional { margin-bottom: 4px !important; font-size: 9pt !important; }
            .info-item-professional .label { font-weight: bold; color: #000000 !important; min-width: 150px !important; }
            .info-item-professional .value { color: #000000 !important; }

            .notes-box-professional { background-color: #f9fafb !important; border-color: #d2dce9 !important; padding: 6px 8px !important; font-size: 8.5pt !important; line-height: 1.4 !important; }
            
            .primary-footer { background-color: #f0f3f7 !important; border-top-color: #d2dce9 !important; padding: 6px 0 !important; font-size: 7.5pt !important; }
            .audit-footer { background-color: #e2e8f0 !important; color: #505864 !important; padding: 3px 0 !important; font-size: 6.5pt !important; }
            .page-number-placeholder { font-size: 7pt !important; color: #555 !important; }

            .media-item-container { padding: 5px !important; margin-bottom: 5px !important; border: 1px solid #ccc !important;}
            .report-image { max-height: 250px !important; border: 1px solid #bbb !important; }
            .media-qr-code { width: 80px !important; height: 80px !important; border: 1px solid #bbb !important;}

            .patient-file-cover-page { padding: 15mm 10mm !important; background-color: #ffffff !important;}
            .patient-file-cover-page .patient-identity-block { padding: 10px !important; background-color: #f9f9f9 !important; border: 1px solid #ddd !important; }
            .patient-file-cover-page .cover-institution-header { padding-bottom: 15px !important; }
            .cover-page-footer { font-size: 7.5pt !important; margin-top: 20px !important; }

            .no-data-message { font-size: 10pt !important; }
            .error-message { font-size: 9pt !important; padding: 6px !important; }
        }
    </style>
</head>
<body>
    <div class="report-container ${orientationClass}">
        ${htmlContentToEmbed}
    </div>
</body>
</html>`;

			const blob = new Blob([fullHtml], { type: "text/html" });
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(link.href);
			notification.success({ message: "Success", description: `HTML file ${filename} generated.` });
		} catch (error) {
			console.error("Error generating HTML report:", error);
			notification.error({ message: "Error", description: `Failed to generate HTML report: ${error.message}` });
		} finally {
			setIsGeneratingFile(false);
		}
	};

	return (
		<div
			onClick={!isGeneratingFile ? generateHtmlAndDownload : undefined}
			style={{ cursor: isGeneratingFile ? "wait" : "pointer", display: "inline-block", width: "100%" }}>
			{isGeneratingFile && (mode === "patientFile" || type === "vitalSign" || type === "imageReport" || type === "labResult") ? (
				<>
					<Spin size="small" style={{ marginRight: 8 }} /> Generating...
				</>
			) : (
				children
			)}
		</div>
	);
};

export default HtmlReportGenerator;
