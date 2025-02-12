// templates.js (REFACTORED with CSS Classes)

const assessmentTemplates = {
	childAssessment: `
    <style>
        .assessment-container {
            font-family: Arial, sans-serif;
            margin: 10px;
            line-height: 1.3;
            background: #ffffff;
            padding: 0.5rem;
            font-size: 7pt;
        }
        .assessment-title {
            font-size: 12pt;
            color: #000;
            margin: 5px 0 10px 0;
            text-align: center;
            padding: 5px;
            border-bottom: 2px solid #000;
        }
        .section {
            margin-bottom: 10px;
            border: 0.5px solid #ccc;
            padding: 8px;
            border-radius: 0;
            page-break-inside: avoid;
        }
        .section-title {
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
            margin-bottom: 5px;
            font-size: 10pt;
            font-weight: bold;
        }
        .subsection {
            margin-left: 15px;
            margin-bottom: 5px;
            padding: 5px;
        }
        .subsection-title {
            font-size: 9pt;
            margin-bottom: 3px;
            font-weight: bold;
        }
        .patient-info-table, .vital-signs-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }
        .patient-info-table td, .vital-signs-table td {
            padding: 3px 5px;
            border: 0.5px solid #ccc;
            font-size: 7pt;
        }
        .label {
            font-weight: bold;
        }
        .paragraph {
            margin: 3px 0;
            font-size: 7pt;
        }
        .list {
            padding-left: 15px;
            margin: 3px 0;
            list-style-type: disc;
        }
        .list li {
            margin-bottom: 2px;
            font-size: 7pt;
        }
        .list-label {
            font-weight: bold;
        }
        .assessor-info {
            margin: 2px 0;
            font-style: italic;
            font-size: 7pt;
        }
    </style>
    <div class="assessment-container">
      <h1 class="assessment-title">Hospital Child Assessment</h1>

      <div class="section">
        <h2 class="section-title">Patient Information</h2>
        <table class="patient-info-table">
            <tr>
                <td class="label">Patient Name: 👤</td>
                <td>[Patient Name]</td>
                <td class="label">Date of Birth: 🎂</td>
                <td>[Date of Birth]</td>
            </tr>
            <tr>
                <td class="label">Medical Record Number: 🆔</td>
                <td>[Medical Record Number]</td>
                 <td class="label">Gender: 🚻</td>
                <td>[Gender]</td>
            </tr>
              <tr>
                  <td class="label">Admission Date: 📅</td>
                  <td>[Admission Date]</td>
                  <td class="label">Current Age: ⏳</td>
                 <td>[Current Age]</td>
             </tr>
        </table>
      </div>


      <div class="section">
        <h2 class="section-title">Reason for Admission</h2>
        <p class="paragraph">[Reason for Admission (Paragraph)]</p>
      </div>


        <div class="section">
            <h2 class="section-title">Chief Complaint</h2>
            <p class="paragraph">[Chief Complaint (Paragraph)]</p>
        </div>


      <div class="section">
        <h2 class="section-title">History of Present Illness (HPI)</h2>
        <p class="paragraph">[History of Present Illness (Paragraph)]</p>
      </div>


      <div class="section">
        <h2 class="section-title">Past Medical History (PMH)</h2>
          <p class="paragraph">[Past Medical History (Paragraph)]</p>
           <ul class="list">
                <li class="list-item"><span class="list-label">Allergies: 🤧</span> [Allergies]</li>
                <li class="list-item"><span class="list-label">Medications: 💊</span> [Medications]</li>
                <li class="list-item"><span class="list-label">Vaccinations: ✅</span> [Vaccinations]</li>
                <li class="list-item"><span class="list-label">Previous Hospitalizations/Surgeries: 🏥</span> [Previous Hospitalizations/Surgeries]</li>
            </ul>
      </div>

      <div class="section">
        <h2 class="section-title">Developmental History</h2>
          <p class="paragraph">[Developmental History (Paragraph)]</p>
            <ul class="list">
                <li class="list-item"><span class="list-label">Gross Motor Skills: 🏃</span> [Gross Motor Skills]</li>
                <li class="list-item"><span class="list-label">Fine Motor Skills: ✍️</span> [Fine Motor Skills]</li>
                <li class="list-item"><span class="list-label">Language Skills: 🗣️</span> [Language Skills]</li>
                <li class="list-item"><span class="list-label">Social Skills: 🤝</span> [Social Skills]</li>
            </ul>
      </div>


      <div class="section">
        <h2 class="section-title">Family History</h2>
        <p class="paragraph">[Family History (Paragraph)]</p>
            <ul class="list">
                  <li class="list-item"><span class="list-label">Relevant Medical History of Family Members: 👪</span> [Relevant Medical History of Family Members]</li>
            </ul>
      </div>

       <div class="section">
        <h2 class="section-title">Social History</h2>
        <p class="paragraph">[Social History (Paragraph)]</p>
           <ul class="list">
              <li class="list-item"><span class="list-label">Home Environment: 🏠</span> [Home Environment]</li>
              <li class="list-item"><span class="list-label">School/Daycare: 🏫</span> [School/Daycare]</li>
               <li class="list-item"><span class="list-label">Family Support: 👨‍👩‍👧‍👦</span> [Family Support]</li>
          </ul>
      </div>

      <div class="section">
        <h2 class="section-title">Physical Examination</h2>
        <div class="subsection">
            <h3 class="subsection-title">Vital Signs</h3>
            <table class="vital-signs-table">
                <tr>
                    <td class="label">Temperature: 🌡️</td>
                    <td>[Temperature]</td>
                    <td class="label">Heart Rate: 💗</td>
                    <td>[Heart Rate]</td>
                </tr>
                 <tr>
                    <td class="label">Respiratory Rate: 🫁</td>
                    <td>[Respiratory Rate]</td>
                    <td class="label">Blood Pressure: 🩸</td>
                    <td>[Blood Pressure]</td>
                </tr>
                 <tr>
                    <td class="label">Oxygen Saturation: 💨</td>
                    <td>[Oxygen Saturation]</td>
                    <td class="label">Pain Scale: 😖</td>
                   <td>[Pain Scale]</td>
                </tr>
            </table>
          </div>

           <div class="subsection">
            <h3 class="subsection-title">General Appearance</h3>
            <p class="paragraph">[General Appearance (Paragraph)]</p>
          </div>

            <div class="subsection">
              <h3 class="subsection-title">Head and Neck</h3>
               <p class="paragraph">[Head and Neck Exam (Paragraph)]</p>
            </div>

            <div class="subsection">
               <h3 class="subsection-title">Respiratory</h3>
               <p class="paragraph">[Respiratory Exam (Paragraph)]</p>
            </div>

            <div class="subsection">
                 <h3 class="subsection-title">Cardiovascular</h3>
                <p class="paragraph">[Cardiovascular Exam (Paragraph)]</p>
            </div>

            <div class="subsection">
                 <h3 class="subsection-title">Gastrointestinal</h3>
                <p class="paragraph">[Gastrointestinal Exam (Paragraph)]</p>
            </div>
            <div class="subsection">
                <h3 class="subsection-title">Genitourinary</h3>
                 <p class="paragraph">[Genitourinary Exam (Paragraph)]</p>
            </div>
             <div class="subsection">
               <h3 class="subsection-title">Musculoskeletal</h3>
                <p class="paragraph">[Musculoskeletal Exam (Paragraph)]</p>
           </div>
           <div class="subsection">
                <h3 class="subsection-title">Neurological</h3>
                <p class="paragraph">[Neurological Exam (Paragraph)]</p>
            </div>
             <div class="subsection">
               <h3 class="subsection-title">Skin</h3>
               <p class="paragraph">[Skin Exam (Paragraph)]</p>
           </div>
      </div>


       <div class="section">
            <h2 class="section-title">Laboratory Results</h2>
             <p class="paragraph">[Laboratory Results (Paragraph)]</p>
             <ul class="list">
                 <li class="list-item"><span class="list-label">CBC: 🩸</span> [CBC Results]</li>
                 <li class="list-item"><span class="list-label">Electrolytes: ⚡</span> [Electrolytes Results]</li>
                  <li class="list-item"><span class="list-label">Blood Culture: 💉</span> [Blood Culture Results]</li>
                  <li class="list-item"><span class="list-label">Urinalysis: 🧪</span> [Urinalysis Results]</li>
                   <li class="list-item"><span class="list-label">Other Labs: 🔬</span> [Other Labs Results]</li>
            </ul>
        </div>

       <div class="section">
            <h2 class="section-title">Imaging Results</h2>
            <p class="paragraph">[Imaging Results (Paragraph)]</p>
             <ul class="list">
                   <li class="list-item"><span class="list-label">X-ray: ☢️</span> [X-ray Results]</li>
                 <li class="list-item"><span class="list-label">Ultrasound: 🔊</span> [Ultrasound Results]</li>
                  <li class="list-item"><span class="list-label">CT Scan: ☢️</span> [CT Scan Results]</li>
                  <li class="list-item"><span class="list-label">MRI: 🧲</span> [MRI Results]</li>
             </ul>
        </div>


        <div class="section">
            <h2 class="section-title">Assessment and Plan</h2>
            <p class="paragraph">[Assessment and Plan (Paragraph)]</p>
        </div>



      <div class="section">
        <h2 class="section-title">Consultations</h2>
          <ul class="list">
            <li class="list-item">[Consultation 1]</li>
            <li class="list-item">[Consultation 2]</li>
             <li class="list-item">[Consultation 3]</li>
          </ul>
      </div>



       <div class="section">
        <h2 class="section-title">Medications Administered</h2>
         <p class="paragraph">[Medications Administered (Paragraph)]</p>
           <ul class="list">
            <li class="list-item"><span class="list-label">Medication 1: 💊</span> [Medication 1 Details]</li>
              <li class="list-item"><span class="list-label">Medication 2: 💊</span> [Medication 2 Details]</li>
              <li class="list-item"><span class="list-label">Medication 3: 💊</span> [Medication 3 Details]</li>
          </ul>
      </div>


        <div class="section">
            <h2 class="section-title">Nursing Notes</h2>
            <p class="paragraph">[Nursing Notes (Paragraph)]</p>
          </div>


       <div class="section">
        <h2 class="section-title">Discharge Plan</h2>
           <p class="paragraph">[Discharge Plan (Paragraph)]</p>
           <ul class="list">
            <li class="list-item"><span class="list-label">Discharge Instructions: 📝</span> [Discharge Instructions]</li>
               <li class="list-item"><span class="list-label">Follow Up Appointments: 📅</span> [Follow Up Appointments]</li>
          </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Additional Notes</h2>
            <p class="paragraph">[Additional Notes (Paragraph)]</p>
        </div>
       <div class="section">
          <h2 class="section-title">Assessed by:</h2>
          <p class="assessor-info">[Assessor Name], [Assessor Title]</p>
          <p class="assessor-info">Date: [Date]</p>
       </div>
    </div>
  `,
	geriatricAssessment: `
    <style>
      /* Reuse the same classes from childAssessment for consistency */
      .assessment-container {
            font-family: Arial, sans-serif;
            margin: 10px;
            line-height: 1.3;
            background: #ffffff;
            padding: 0.5rem;
            font-size: 7pt;
        }
        .assessment-title {
            font-size: 12pt;
            color: #000;
            margin: 5px 0 10px 0;
            text-align: center;
            padding: 5px;
            border-bottom: 2px solid #000;
        }
        .section {
            margin-bottom: 10px;
            border: 0.5px solid #ccc;
            padding: 8px;
            border-radius: 0;
            page-break-inside: avoid;
        }
        .section-title {
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
            margin-bottom: 5px;
            font-size: 10pt;
            font-weight: bold;
        }
        .subsection {
            margin-left: 15px;
            margin-bottom: 5px;
            padding: 5px;
        }
        .subsection-title {
            font-size: 9pt;
            margin-bottom: 3px;
            font-weight: bold;
        }
        .patient-info-table, .vital-signs-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }
        .patient-info-table td, .vital-signs-table td {
            padding: 3px 5px;
            border: 0.5px solid #ccc;
            font-size: 7pt;
        }
        .label {
            font-weight: bold;
        }
        .paragraph {
            margin: 3px 0;
            font-size: 7pt;
        }
        .list {
            padding-left: 15px;
            margin: 3px 0;
            list-style-type: disc;
        }
        .list li {
            margin-bottom: 2px;
            font-size: 7pt;
        }
        .list-label {
            font-weight: bold;
        }
        .assessor-info {
            margin: 2px 0;
            font-style: italic;
            font-size: 7pt;
        }
    </style>
    <div class="assessment-container">
      <h1 class="assessment-title">Geriatric Assessment</h1>

      <div class="section">
        <h2 class="section-title">Patient Information</h2>
          <table class="patient-info-table">
            <tr>
                <td class="label">Patient Name: 👤</td>
                <td>[Patient Name]</td>
                <td class="label">Date of Birth: 🎂</td>
                <td>[Date of Birth]</td>
            </tr>
            <tr>
                <td class="label">Medical Record Number: 🆔</td>
                <td>[Medical Record Number]</td>
                <td class="label">Gender: 🚻</td>
                <td>[Gender]</td>
            </tr>
              <tr>
                <td class="label">Admission Date: 📅</td>
                <td>[Admission Date]</td>
                <td class="label">Current Age: ⏳</td>
                 <td>[Current Age]</td>
             </tr>
        </table>
      </div>

      <div class="section">
        <h2 class="section-title">Reason for Admission/Visit</h2>
        <p class="paragraph">[Reason for Admission/Visit (Paragraph)]</p>
      </div>

      <div class="section">
        <h2 class="section-title">Chief Complaint</h2>
        <p class="paragraph">[Chief Complaint (Paragraph)]</p>
      </div>

      <div class="section">
        <h2 class="section-title">History of Present Illness (HPI)</h2>
        <p class="paragraph">[History of Present Illness (Paragraph)]</p>
      </div>


      <div class="section">
        <h2 class="section-title">Past Medical History (PMH)</h2>
        <p class="paragraph">[Past Medical History (Paragraph)]</p>
            <ul class="list">
                <li class="list-item"><span class="list-label">Allergies: 🤧</span> [Allergies]</li>
                <li class="list-item"><span class="list-label">Medications: 💊</span> [Medications]</li>
                <li class="list-item"><span class="list-label">Immunizations: ✅</span> [Immunizations]</li>
               <li class="list-item"><span class="list-label">Previous Hospitalizations/Surgeries: 🏥</span> [Previous Hospitalizations/Surgeries]</li>
          </ul>
      </div>

      <div class="section">
         <h2 class="section-title">Functional Assessment</h2>
         <div class="subsection">
              <h3 class="subsection-title">Activities of Daily Living (ADLs)</h3>
                <ul class="list">
                    <li class="list-item"><span class="list-label">Bathing: 🛁</span> [Bathing Ability]</li>
                    <li class="list-item"><span class="list-label">Dressing: 👕</span> [Dressing Ability]</li>
                    <li class="list-item"><span class="list-label">Toileting: 🚽</span> [Toileting Ability]</li>
                    <li class="list-item"><span class="list-label">Transferring: 🦽</span> [Transferring Ability]</li>
                    <li class="list-item"><span class="list-label">Eating: 🍽️</span> [Eating Ability]</li>
                </ul>
        </div>
          <div class="subsection">
            <h3 class="subsection-title">Instrumental Activities of Daily Living (IADLs)</h3>
               <ul class="list">
                    <li class="list-item"><span class="list-label">Managing Finances: 💰</span> [Managing Finances Ability]</li>
                    <li class="list-item"><span class="list-label">Preparing Meals: 🍳</span> [Preparing Meals Ability]</li>
                    <li class="list-item"><span class="list-label">Managing Medications: 💊</span> [Managing Medications Ability]</li>
                     <li class="list-item"><span class="list-label">Using Transportation: 🚗</span> [Using Transportation Ability]</li>
                     <li class="list-item"><span class="list-label">Shopping: 🛒</span> [Shopping Ability]</li>
                </ul>
           </div>
      </div>

      <div class="section">
         <h2 class="section-title">Cognitive Assessment</h2>
         <div class="subsection">
            <h3 class="subsection-title">Mini-Mental State Examination (MMSE)</h3>
            <p class="paragraph"><span class="list-label">[MMSE Score]:</span> [MMSE Interpretation]</p>
          </div>
         <div class="subsection">
            <h3 class="subsection-title">Dementia Screening</h3>
            <p class="paragraph">[Dementia Screening Results and Notes]</p>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Falls History</h2>
        <p class="paragraph">[Falls History (Paragraph)]</p>
            <ul class="list">
                <li class="list-item"><span class="list-label">Number of Falls in Past Year: 🤕</span> [Number of Falls in Past Year]</li>
               <li class="list-item"><span class="list-label">Fall Risk Assessment: ✅</span> [Fall Risk Assessment Results]</li>
            </ul>
      </div>


      <div class="section">
        <h2 class="section-title">Social and Environmental History</h2>
        <p class="paragraph">[Social and Environmental History (Paragraph)]</p>
           <ul class="list">
                <li class="list-item"><span class="list-label">Living Situation: 🏠</span> [Living Situation]</li>
                <li class="list-item"><span class="list-label">Social Support: 🧑‍🤝‍🧑</span> [Social Support]</li>
                <li class="list-item"><span class="list-label">Home Safety: ⛑️</span> [Home Safety Assessment]</li>
          </ul>
      </div>


      <div class="section">
        <h2 class="section-title">Nutritional Assessment</h2>
        <p class="paragraph">[Nutritional Assessment (Paragraph)]</p>
        <ul class="list">
            <li class="list-item"><span class="list-label">Weight Change: ⚖️</span> [Weight Change Details]</li>
            <li class="list-item"><span class="list-label">Appetite: 🍽️</span> [Appetite Details]</li>
        </ul>
      </div>

      <div class="section">
          <h2 class="section-title">Pain Assessment</h2>
          <p class="paragraph">[Pain Assessment (Paragraph)]</p>
           <ul class="list">
             <li class="list-item"><span class="list-label">Pain Scale: 😖</span> [Pain Scale]</li>
           </ul>
      </div>

        <div class="section">
            <h2 class="section-title">Physical Examination</h2>
              <div class="subsection">
                    <h3 class="subsection-title">Vital Signs</h3>
                    <table class="vital-signs-table">
                        <tr>
                            <td class="label">Temperature: 🌡️</td>
                            <td>[Temperature]</td>
                            <td class="label">Heart Rate: 💗</td>
                            <td>[Heart Rate]</td>
                        </tr>
                         <tr>
                            <td class="label">Respiratory Rate: 🫁</td>
                            <td>[Respiratory Rate]</td>
                            <td class="label">Blood Pressure: 🩸</td>
                            <td>[Blood Pressure]</td>
                        </tr>
                         <tr>
                            <td class="label">Oxygen Saturation: 💨</td>
                            <td>[Oxygen Saturation]</td>
                            <td class="label">Pain Scale: 😖</td>
                            <td>[Pain Scale]</td>
                       </tr>
                    </table>
            </div>
              <div class="subsection">
                <h3 class="subsection-title">General Appearance</h3>
                <p class="paragraph">[General Appearance (Paragraph)]</p>
            </div>
              <div class="subsection">
                  <h3 class="subsection-title">HEENT</h3>
                 <p class="paragraph">[HEENT Exam (Paragraph)]</p>
              </div>
              <div class="subsection">
                   <h3 class="subsection-title">Cardiovascular</h3>
                  <p class="paragraph">[Cardiovascular Exam (Paragraph)]</p>
              </div>
               <div class="subsection">
                   <h3 class="subsection-title">Respiratory</h3>
                   <p class="paragraph">[Respiratory Exam (Paragraph)]</p>
               </div>
                <div class="subsection">
                      <h3 class="subsection-title">Abdomen</h3>
                    <p class="paragraph">[Abdominal Exam (Paragraph)]</p>
                 </div>
                 <div class="subsection">
                      <h3 class="subsection-title">Musculoskeletal</h3>
                    <p class="paragraph">[Musculoskeletal Exam (Paragraph)]</p>
                 </div>
                 <div class="subsection">
                     <h3 class="subsection-title">Neurological</h3>
                     <p class="paragraph">[Neurological Exam (Paragraph)]</p>
                 </div>
                 <div class="subsection">
                     <h3 class="subsection-title">Skin</h3>
                    <p class="paragraph">[Skin Exam (Paragraph)]</p>
                 </div>
        </div>


      <div class="section">
        <h2 class="section-title">Medication Review</h2>
        <p class="paragraph">[Medication Review (Paragraph)]</p>
           <ul class="list">
             <li class="list-item"><span class="list-label">Polypharmacy Concerns: 💊💊💊</span> [Polypharmacy Concerns]</li>
              <li class="list-item"><span class="list-label">Medication Adherence: ✅</span> [Medication Adherence]</li>
             </ul>
      </div>

        <div class="section">
            <h2 class="section-title">Laboratory Results</h2>
            <p class="paragraph">[Laboratory Results (Paragraph)]</p>
              <ul class="list">
                  <li class="list-item"><span class="list-label">CBC: 🩸</span> [CBC Results]</li>
                  <li class="list-item"><span class="list-label">Electrolytes: ⚡</span> [Electrolytes Results]</li>
                  <li class="list-item"><span class="list-label">Renal Function: 🫘</span> [Renal Function Results]</li>
                  <li class="list-item"><span class="list-label">Liver Function: 🧪</span> [Liver Function Results]</li>
                   <li class="list-item"><span class="list-label">Other Labs: 🔬</span> [Other Labs Results]</li>
               </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Imaging Results</h2>
            <p class="paragraph">[Imaging Results (Paragraph)]</p>
             <ul class="list">
                 <li class="list-item"><span class="list-label">X-ray: ☢️</span> [X-ray Results]</li>
                  <li class="list-item"><span class="list-label">Ultrasound: 🔊</span> [Ultrasound Results]</li>
                   <li class="list-item"><span class="list-label">CT Scan: ☢️</span> [CT Scan Results]</li>
                   <li class="list-item"><span class="list-label">MRI: 🧲</span> [MRI Results]</li>
             </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Assessment and Plan</h2>
            <p class="paragraph">[Assessment and Plan (Paragraph)]</p>
        </div>

      <div class="section">
        <h2 class="section-title">Consultations</h2>
          <ul class="list">
            <li class="list-item">[Consultation 1]</li>
            <li class="list-item">[Consultation 2]</li>
             <li class="list-item">[Consultation 3]</li>
          </ul>
      </div>

        <div class="section">
        <h2 class="section-title">Discharge Plan</h2>
         <p class="paragraph">[Discharge Plan (Paragraph)]</p>
          <ul class="list">
            <li class="list-item"><span class="list-label">Discharge Instructions: 📝</span> [Discharge Instructions]</li>
               <li class="list-item"><span class="list-label">Follow Up Appointments: 📅</span> [Follow Up Appointments]</li>
         </ul>
      </div>

        <div class="section">
            <h2 class="section-title">Additional Notes</h2>
            <p class="paragraph">[Additional Notes (Paragraph)]</p>
        </div>

        <div class="section">
          <h2 class="section-title">Assessed by:</h2>
          <p class="assessor-info">[Assessor Name], [Assessor Title]</p>
          <p class="assessor-info">Date: [Date]</p>
        </div>
    </div>
  `,
	// Continuing from the previous response... within templates.js

	womensHealthAssessment: `
     <style>
      /* Reuse the same classes from childAssessment for consistency */
      .assessment-container {
            font-family: Arial, sans-serif;
            margin: 10px;
            line-height: 1.3;
            background: #ffffff;
            padding: 0.5rem;
            font-size: 7pt;
        }
        .assessment-title {
            font-size: 12pt;
            color: #000;
            margin: 5px 0 10px 0;
            text-align: center;
            padding: 5px;
            border-bottom: 2px solid #000;
        }
        .section {
            margin-bottom: 10px;
            border: 0.5px solid #ccc;
            padding: 8px;
            border-radius: 0;
            page-break-inside: avoid;
        }
        .section-title {
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
            margin-bottom: 5px;
            font-size: 10pt;
            font-weight: bold;
        }
        .subsection {
            margin-left: 15px;
            margin-bottom: 5px;
            padding: 5px;
        }
        .subsection-title {
            font-size: 9pt;
            margin-bottom: 3px;
            font-weight: bold;
        }
        .patient-info-table, .vital-signs-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }
        .patient-info-table td, .vital-signs-table td {
            padding: 3px 5px;
            border: 0.5px solid #ccc;
            font-size: 7pt;
        }
        .label {
            font-weight: bold;
        }
        .paragraph {
            margin: 3px 0;
            font-size: 7pt;
        }
        .list {
            padding-left: 15px;
            margin: 3px 0;
            list-style-type: disc;
        }
        .list li {
            margin-bottom: 2px;
            font-size: 7pt;
        }
        .list-label {
            font-weight: bold;
        }
        .assessor-info {
            margin: 2px 0;
            font-style: italic;
            font-size: 7pt;
        }
    </style>
    <div class="assessment-container">
      <h1 class="assessment-title">Women's Health Assessment</h1>

     <div class="section">
        <h2 class="section-title">Patient Information</h2>
          <table class="patient-info-table">
            <tr>
                <td class="label">Patient Name: 👤</td>
                <td>[Patient Name]</td>
                <td class="label">Date of Birth: 🎂</td>
                <td>[Date of Birth]</td>
            </tr>
            <tr>
                <td class="label">Medical Record Number: 🆔</td>
                <td>[Medical Record Number]</td>
                <td class="label">Gender: 🚻</td>
                <td>[Gender]</td>
            </tr>
              <tr>
                  <td class="label">Admission Date: 📅</td>
                  <td>[Admission Date]</td>
                  <td class="label">Current Age: ⏳</td>
                 <td>[Current Age]</td>
             </tr>
        </table>
      </div>

      <div class="section">
        <h2 class="section-title">Reason for Visit</h2>
        <p class="paragraph">[Reason for Visit (Paragraph)]</p>
      </div>

       <div class="section">
            <h2 class="section-title">Chief Complaint</h2>
            <p class="paragraph">[Chief Complaint (Paragraph)]</p>
        </div>

      <div class="section">
        <h2 class="section-title">History of Present Illness (HPI)</h2>
        <p class="paragraph">[History of Present Illness (Paragraph)]</p>
      </div>

      <div class="section">
        <h2 class="section-title">Past Medical History (PMH)</h2>
        <p class="paragraph">[Past Medical History (Paragraph)]</p>
           <ul class="list">
                <li class="list-item"><span class="list-label">Allergies: 🤧</span> [Allergies]</li>
                <li class="list-item"><span class="list-label">Medications: 💊</span> [Medications]</li>
                 <li class="list-item"><span class="list-label">Immunizations: ✅</span> [Immunizations]</li>
                <li class="list-item"><span class="list-label">Previous Hospitalizations/Surgeries: 🏥</span> [Previous Hospitalizations/Surgeries]</li>
           </ul>
      </div>

        <div class="section">
            <h2 class="section-title">Obstetric History</h2>
           <p class="paragraph">[Obstetric History (Paragraph)]</p>
            <ul class="list">
                <li class="list-item"><span class="list-label">Gravida/Para: 🤰</span> [Gravida/Para Details]</li>
                <li class="list-item"><span class="list-label">Menarche: 🌸</span> [Menarche Age]</li>
                <li class="list-item"><span class="list-label">Last Menstrual Period (LMP): 🩸</span> [Last Menstrual Period]</li>
                <li class="list-item"><span class="list-label">Menopause Status: ⏳</span> [Menopause Status]</li>
               <li class="list-item"><span class="list-label">Contraceptive History: 💊</span> [Contraceptive History]</li>
              </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Gynecological History</h2>
              <p class="paragraph">[Gynecological History (Paragraph)]</p>
                <ul class="list">
                  <li class="list-item"><span class="list-label">Previous Pap Smears: 🧪</span> [Previous Pap Smears Details]</li>
                   <li class="list-item"><span class="list-label">STD/STI History: 🦠</span> [STD/STI History]</li>
               </ul>
        </div>


      <div class="section">
        <h2 class="section-title">Family History</h2>
         <p class="paragraph">[Family History (Paragraph)]</p>
          <ul class="list">
              <li class="list-item"><span class="list-label">Relevant Medical History of Family Members: 👪</span> [Relevant Medical History of Family Members]</li>
         </ul>
      </div>

     <div class="section">
        <h2 class="section-title">Social History</h2>
        <p class="paragraph">[Social History (Paragraph)]</p>
          <ul class="list">
               <li class="list-item"><span class="list-label">Smoking/Alcohol/Drug Use: 🚭🍺💉</span> [Smoking/Alcohol/Drug Use Details]</li>
               <li class="list-item"><span class="list-label">Occupation: 💼</span> [Occupation Details]</li>
            </ul>
      </div>


        <div class="section">
          <h2 class="section-title">Physical Examination</h2>
           <div class="subsection">
            <h3 class="subsection-title">Vital Signs</h3>
            <table class="vital-signs-table">
                <tr>
                    <td class="label">Temperature: 🌡️</td>
                    <td>[Temperature]</td>
                    <td class="label">Heart Rate: 💗</td>
                    <td>[Heart Rate]</td>
                </tr>
                 <tr>
                    <td class="label">Respiratory Rate: 🫁</td>
                    <td>[Respiratory Rate]</td>
                    <td class="label">Blood Pressure: 🩸</td>
                    <td>[Blood Pressure]</td>
                </tr>
                 <tr>
                    <td class="label">Oxygen Saturation: 💨</td>
                    <td>[Oxygen Saturation]</td>
                     <td class="label">Pain Scale: 😖</td>
                     <td>[Pain Scale]</td>
               </tr>
            </table>
            </div>
             <div class="subsection">
                <h3 class="subsection-title">General Appearance</h3>
                 <p class="paragraph">[General Appearance (Paragraph)]</p>
             </div>
            <div class="subsection">
                <h3 class="subsection-title">HEENT</h3>
                <p class="paragraph">[HEENT Exam (Paragraph)]</p>
             </div>
              <div class="subsection">
                 <h3 class="subsection-title">Cardiovascular</h3>
                 <p class="paragraph">[Cardiovascular Exam (Paragraph)]</p>
              </div>
               <div class="subsection">
                   <h3 class="subsection-title">Respiratory</h3>
                  <p class="paragraph">[Respiratory Exam (Paragraph)]</p>
               </div>
            <div class="subsection">
                <h3 class="subsection-title">Abdomen</h3>
                <p class="paragraph">[Abdominal Exam (Paragraph)]</p>
             </div>
            <div class="subsection">
               <h3 class="subsection-title">Breast Exam</h3>
                <p class="paragraph">[Breast Exam (Paragraph)]</p>
           </div>
              <div class="subsection">
                <h3 class="subsection-title">Pelvic Exam</h3>
                  <p class="paragraph">[Pelvic Exam (Paragraph)]</p>
               </div>
            <div class="subsection">
                 <h3 class="subsection-title">Musculoskeletal</h3>
                   <p class="paragraph">[Musculoskeletal Exam (Paragraph)]</p>
               </div>
             <div class="subsection">
                 <h3 class="subsection-title">Neurological</h3>
                <p class="paragraph">[Neurological Exam (Paragraph)]</p>
            </div>
             <div class="subsection">
                <h3 class="subsection-title">Skin</h3>
                 <p class="paragraph">[Skin Exam (Paragraph)]</p>
             </div>
        </div>


        <div class="section">
            <h2 class="section-title">Laboratory Results</h2>
            <p class="paragraph">[Laboratory Results (Paragraph)]</p>
            <ul class="list">
               <li class="list-item"><span class="list-label">CBC: 🩸</span> [CBC Results]</li>
                  <li class="list-item"><span class="list-label">Electrolytes: ⚡</span> [Electrolytes Results]</li>
                   <li class="list-item"><span class="list-label">Hormone Levels: 🧪</span> [Hormone Levels Results]</li>
                   <li class="list-item"><span class="list-label">Pap Smear Results: 🔬</span> [Pap Smear Results]</li>
                   <li class="list-item"><span class="list-label">STD/STI Screening: 🦠</span> [STD/STI Screening Results]</li>
                              <li class="list-item"><span class="list-label">Other Labs: 🔬</span> [Other Labs Results]</li>
            </ul>
        </div>


        <div class="section">
            <h2 class="section-title">Imaging Results</h2>
              <p class="paragraph">[Imaging Results (Paragraph)]</p>
             <ul class="list">
                <li class="list-item"><span class="list-label">Mammogram: ☢️</span> [Mammogram Results]</li>
                <li class="list-item"><span class="list-label">Ultrasound: 🔊</span> [Ultrasound Results]</li>
               <li class="list-item"><span class="list-label">X-ray: ☢️</span> [X-ray Results]</li>
                   <li class="list-item"><span class="list-label">CT Scan: ☢️</span> [CT Scan Results]</li>
                    <li class="list-item"><span class="list-label">MRI: 🧲</span> [MRI Results]</li>
             </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Assessment and Plan</h2>
            <p class="paragraph">[Assessment and Plan (Paragraph)]</p>
        </div>


      <div class="section">
        <h2 class="section-title">Consultations</h2>
           <ul class="list">
              <li class="list-item">[Consultation 1]</li>
              <li class="list-item">[Consultation 2]</li>
               <li class="list-item">[Consultation 3]</li>
           </ul>
      </div>

      <div class="section">
        <h2 class="section-title">Discharge Plan</h2>
          <p class="paragraph">[Discharge Plan (Paragraph)]</p>
             <ul class="list">
               <li class="list-item"><span class="list-label">Discharge Instructions: 📝</span> [Discharge Instructions]</li>
                <li class="list-item"><span class="list-label">Follow Up Appointments: 📅</span> [Follow Up Appointments]</li>
           </ul>
      </div>

        <div class="section">
            <h2 class="section-title">Additional Notes</h2>
            <p class="paragraph">[Additional Notes (Paragraph)]</p>
        </div>

      <div class="section">
          <h2 class="section-title">Assessed by:</h2>
          <p class="assessor-info">[Assessor Name], [Assessor Title]</p>
          <p class="assessor-info">Date: [Date]</p>
      </div>
    </div>
  `,
	criticalCareAssessment: `
    <style>
        /* Reuse common classes and add critical-care specific ones */
        .assessment-container {
            font-family: Arial, sans-serif;
            margin: 10px;
            line-height: 1.3;
            background: #ffffff;
            padding: 0.5rem;
            font-size: 7pt;
        }
        .assessment-title {
            font-size: 12pt;
            color: #000;
            margin: 5px 0 10px 0;
            text-align: center;
            padding: 5px;
            border-bottom: 2px solid #000;
        }
        .section {
            margin-bottom: 10px;
            border: 0.5px solid #ccc;
            padding: 8px;
            border-radius: 0;
            page-break-inside: avoid;
        }
        .section-title {
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
            margin-bottom: 5px;
            font-size: 10pt;
            font-weight: bold;
        }
        .subsection {
            margin-left: 15px;
            margin-bottom: 5px;
            padding: 5px;
        }
        .subsection-title {
            font-size: 9pt;
            margin-bottom: 3px;
            font-weight: bold;
        }
        .patient-info-table, .vital-signs-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }
        .patient-info-table td, .vital-signs-table td {
            padding: 3px 5px;
            border: 0.5px solid #ccc;
            font-size: 7pt;
        }
        .label {
            font-weight: bold;
        }
        .paragraph {
            margin: 3px 0;
            font-size: 7pt;
        }
        .list {
            padding-left: 15px;
            margin: 3px 0;
            list-style-type: disc;
        }
        .list li {
            margin-bottom: 2px;
            font-size: 7pt;
        }
        .list-label {
            font-weight: bold;
        }
        .assessor-info {
            margin: 2px 0;
            font-style: italic;
            font-size: 7pt;
        }
    </style>
    <div class="assessment-container">
      <h1 class="assessment-title">Critical Care Assessment</h1>

      <div class="section">
        <h2 class="section-title">Patient Information</h2>
          <table class="patient-info-table">
            <tr>
                <td class="label">Patient Name: 👤</td>
                <td>[Patient Name]</td>
                <td class="label">Date of Birth: 🎂</td>
                <td>[Date of Birth]</td>
            </tr>
            <tr>
                <td class="label">Medical Record Number: 🆔</td>
                <td>[Medical Record Number]</td>
                <td class="label">Gender: 🚻</td>
                <td>[Gender]</td>
            </tr>
              <tr>
                <td class="label">Admission Date: 📅</td>
                <td>[Admission Date]</td>
                <td class="label">Current Age: ⏳</td>
                 <td>[Current Age]</td>
             </tr>
        </table>
      </div>

        <div class="section">
          <h2 class="section-title">Reason for Admission to ICU</h2>
          <p class="paragraph">[Reason for Admission to ICU (Paragraph)]</p>
        </div>


      <div class="section">
        <h2 class="section-title">Chief Complaint/Presenting Problem</h2>
        <p class="paragraph">[Chief Complaint/Presenting Problem (Paragraph)]</p>
      </div>

      <div class="section">
        <h2 class="section-title">History of Present Illness (HPI)</h2>
        <p class="paragraph">[History of Present Illness (Paragraph)]</p>
      </div>

       <div class="section">
        <h2 class="section-title">Past Medical History (PMH)</h2>
          <p class="paragraph">[Past Medical History (Paragraph)]</p>
           <ul class="list">
               <li class="list-item"><span class="list-label">Allergies: 🤧</span> [Allergies]</li>
              <li class="list-item"><span class="list-label">Medications: 💊</span> [Medications]</li>
               <li class="list-item"><span class="list-label">Immunizations: ✅</span> [Immunizations]</li>
               <li class="list-item"><span class="list-label">Previous Hospitalizations/Surgeries: 🏥</span> [Previous Hospitalizations/Surgeries]</li>
          </ul>
      </div>

      <div class="section">
        <h2 class="section-title">Family History</h2>
           <p class="paragraph">[Family History (Paragraph)]</p>
         <ul class="list">
              <li class="list-item"><span class="list-label">Relevant Medical History of Family Members: 👪</span> [Relevant Medical History of Family Members]</li>
          </ul>
      </div>

      <div class="section">
        <h2 class="section-title">Social History</h2>
         <p class="paragraph">[Social History (Paragraph)]</p>
            <ul class="list">
                <li class="list-item"><span class="list-label">Smoking/Alcohol/Drug Use: 🚭🍺💉</span> [Smoking/Alcohol/Drug Use Details]</li>
                <li class="list-item"><span class="list-label">Occupation: 💼</span> [Occupation Details]</li>
            </ul>
      </div>

     <div class="section">
       <h2 class="section-title">Neurological Assessment</h2>
       <div class="subsection">
        <h3 class="subsection-title">Glasgow Coma Scale (GCS)</h3>
        <p class="paragraph"><span class="list-label">[GCS Score]:</span> [GCS Details/Interpretation]</p>
        </div>
         <div class="subsection">
              <h3 class="subsection-title">Pupillary Response</h3>
            <p class="paragraph">[Pupillary Response Details]</p>
         </div>
          <div class="subsection">
                <h3 class="subsection-title">Motor Function</h3>
              <p class="paragraph">[Motor Function Details]</p>
         </div>
      </div>

      <div class="section">
        <h2 class="section-title">Cardiovascular Assessment</h2>
           <div class="subsection">
               <h3 class="subsection-title">Heart Rate/Rhythm</h3>
                <p class="paragraph">[Heart Rate/Rhythm Details]</p>
           </div>
        <div class="subsection">
             <h3 class="subsection-title">Blood Pressure</h3>
               <p class="paragraph">[Blood Pressure Details]</p>
           </div>
          <div class="subsection">
               <h3 class="subsection-title">Peripheral Pulses</h3>
                <p class="paragraph">[Peripheral Pulses Details]</p>
          </div>
            <div class="subsection">
                <h3 class="subsection-title">ECG Findings</h3>
                  <p class="paragraph">[ECG Findings (Paragraph)]</p>
              </div>
      </div>


        <div class="section">
            <h2 class="section-title">Respiratory Assessment</h2>
             <div class="subsection">
               <h3 class="subsection-title">Respiratory Rate/Pattern</h3>
               <p class="paragraph">[Respiratory Rate/Pattern Details]</p>
           </div>
              <div class="subsection">
               <h3 class="subsection-title">Oxygen Saturation</h3>
              <p class="paragraph">[Oxygen Saturation Details]</p>
            </div>
           <div class="subsection">
                 <h3 class="subsection-title">Mechanical Ventilation Settings</h3>
                <p class="paragraph">[Mechanical Ventilation Settings Details]</p>
           </div>
         <div class="subsection">
                <h3 class="subsection-title">Breath Sounds</h3>
                 <p class="paragraph">[Breath Sounds Details]</p>
         </div>
        </div>

      <div class="section">
        <h2 class="section-title">Gastrointestinal Assessment</h2>
        <div class="subsection">
            <h3 class="subsection-title">Abdomen</h3>
              <p class="paragraph">[Abdominal Exam Details]</p>
        </div>
          <div class="subsection">
            <h3 class="subsection-title">Bowel Sounds</h3>
              <p class="paragraph">[Bowel Sounds Details]</p>
         </div>
            <div class="subsection">
                <h3 class="subsection-title">Feeding/Nutrition</h3>
                 <p class="paragraph">[Feeding/Nutrition Details]</p>
            </div>
        </div>


      <div class="section">
        <h2 class="section-title">Renal Assessment</h2>
        <div class="subsection">
            <h3 class="subsection-title">Urine Output</h3>
             <p class="paragraph">[Urine Output Details]</p>
        </div>
         <div class="subsection">
              <h3 class="subsection-title">Fluid Balance</h3>
               <p class="paragraph">[Fluid Balance Details]</p>
        </div>
      </div>


      <div class="section">
          <h2 class="section-title">Skin Assessment</h2>
         <p class="paragraph">[Skin Assessment Details (Paragraph)]</p>
          <ul class="list">
           <li class="list-item"><span class="list-label">Wound/Pressure Ulcer Assessment: 🩹</span> [Wound/Pressure Ulcer Assessment Details]</li>
          </ul>
      </div>

      <div class="section">
          <h2 class="section-title">Lines and Tubes</h2>
          <p class="paragraph">[Lines and Tubes Details (Paragraph)]</p>
          <ul class="list">
              <li class="list-item"><span class="list-label">Central Lines: ➖</span> [Central Lines Details]</li>
               <li class="list-item"><span class="list-label">Arterial Lines: ➖</span> [Arterial Lines Details]</li>
               <li class="list-item"><span class="list-label">Foley Catheter: ➖</span> [Foley Catheter Details]</li>
               <li class="list-item"><span class="list-label">Nasogastric Tube: ➖</span> [Nasogastric Tube Details]</li>
           </ul>
      </div>
       <div class="section">
            <h2 class="section-title">Pain Assessment</h2>
            <p class="paragraph">[Pain Assessment (Paragraph)]</p>
                <ul class="list">
                     <li class="list-item"><span class="list-label">Pain Scale: 😖</span> [Pain Scale Details]</li>
               </ul>
        </div>
        <div class="section">
            <h2 class="section-title">Physical Examination</h2>
            <div class="subsection">
                 <h3 class="subsection-title">Vital Signs</h3>
                    <table class="vital-signs-table">
                        <tr>
                            <td class="label">Temperature: 🌡️</td>
                            <td>[Temperature]</td>
                            <td class="label">Heart Rate: 💗</td>
                            <td>[Heart Rate]</td>
                        </tr>
                         <tr>
                            <td class="label">Respiratory Rate: 🫁</td>
                            <td>[Respiratory Rate]</td>
                            <td class="label">Blood Pressure: 🩸</td>
                            <td>[Blood Pressure]</td>
                        </tr>
                         <tr>
                            <td class="label">Oxygen Saturation: 💨</td>
                            <td>[Oxygen Saturation]</td>
                             <td class="label">Pain Scale: 😖</td>
                             <td>[Pain Scale]</td>
                       </tr>
                    </table>
               </div>
               <div class="subsection">
                <h3 class="subsection-title">General Appearance</h3>
                 <p class="paragraph">[General Appearance (Paragraph)]</p>
            </div>
             <div class="subsection">
                <h3 class="subsection-title">HEENT</h3>
               <p class="paragraph">[HEENT Exam (Paragraph)]</p>
             </div>
          </div>
          <div class="section">
              <h2 class="section-title">Laboratory Results</h2>
              <p class="paragraph">[Laboratory Results (Paragraph)]</p>
               <ul class="list">
                  <li class="list-item"><span class="list-label">CBC: 🩸</span> [CBC Results]</li>
                    <li class="list-item"><span class="list-label">Electrolytes: ⚡</span> [Electrolytes Results]</li>
                   <li class="list-item"><span class="list-label">ABG: 💨</span> [ABG Results]</li>
                    <li class="list-item"><span class="list-label">Renal Function: 🫘</span> [Renal Function Results]</li>
                    <li class="list-item"><span class="list-label">Liver Function: 🧪</span> [Liver Function Results]</li>
                    <li class="list-item"><span class="list-label">Coagulation Studies: 🩸</span> [Coagulation Studies Results]</li>
                   <li class="list-item"><span class="list-label">Blood Cultures: 💉</span> [Blood Cultures Results]</li>
                   <li class="list-item"><span class="list-label">Other Labs: 🔬</span> [Other Labs Results]</li>
                </ul>
           </div>

      <div class="section">
         <h2 class="section-title">Imaging Results</h2>
          <p class="paragraph">[Imaging Results (Paragraph)]</p>
           <ul class="list">
               <li class="list-item"><span class="list-label">X-ray: ☢️</span> [X-ray Results]</li>
               <li class="list-item"><span class="list-label">Ultrasound: 🔊</span> [Ultrasound Results]</li>
               <li class="list-item"><span class="list-label">CT Scan: ☢️</span> [CT Scan Results]</li>
                <li class="list-item"><span class="list-label">MRI: 🧲</span> [MRI Results]</li>
            </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Medications</h2>
               <p class="paragraph">[Medications (Paragraph)]</p>
                <ul class="list">
                     <li class="list-item"><span class="list-label">Continuous Infusions: 💧</span> [Continuous Infusions Details]</li>
                    <li class="list-item"><span class="list-label">Scheduled Medications: 💊</span> [Scheduled Medications Details]</li>
                    <li class="list-item"><span class="list-label">PRN Medications: 💊</span> [PRN Medications Details]</li>
              </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Assessment and Plan</h2>
            <p class="paragraph">[Assessment and Plan (Paragraph)]</p>
        </div>
        <div class="section">
            <h2 class="section-title">Consultations</h2>
               <ul class="list">
                   <li class="list-item">[Consultation 1]</li>
                   <li class="list-item">[Consultation 2]</li>
                    <li class="list-item">[Consultation 3]</li>
                </ul>
        </div>

        <div class="section">
        <h2 class="section-title">Nursing Notes</h2>
        <p class="paragraph">[Nursing Notes (Paragraph)]</p>
      </div>
        <div class="section">
            <h2 class="section-title">Additional Notes</h2>
            <p class="paragraph">[Additional Notes (Paragraph)]</p>
        </div>

      <div class="section">
          <h2 class="section-title">Assessed by:</h2>
          <p class="assessor-info">[Assessor Name], [Assessor Title]</p>
          <p class="assessor-info">Date: [Date]</p>
      </div>
    </div>
  `,
};

export default assessmentTemplates;
