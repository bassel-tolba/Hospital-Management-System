// templates.js

const assessmentTemplates = {
	childAssessment: `
    <div class="hospital-child-assessment">
      <h1 class="assessment-title">Hospital Child Assessment</h1>

      <div class="section">
        <h2 class="section-title">Patient Information</h2>
        <table class="patient-info-table">
            <tr>
                <td class="label"><strong>Patient Name:</strong></td>
                <td>[Patient Name]</td>
                <td class="label"><strong>Date of Birth:</strong></td>
                <td>[Date of Birth]</td>
            </tr>
            <tr>
                <td class="label"><strong>Medical Record Number:</strong></td>
                <td>[Medical Record Number]</td>
                 <td class="label"><strong>Gender:</strong></td>
                <td>[Gender]</td>
            </tr>
              <tr>
                  <td class="label"><strong>Admission Date:</strong></td>
                  <td>[Admission Date]</td>
                  <td class="label"><strong>Current Age:</strong></td>
                 <td>[Current Age]</td>
             </tr>
        </table>
      </div>


      <div class="section">
        <h2 class="section-title">Reason for Admission</h2>
        <p class="paragraph-content">[Reason for Admission (Paragraph)]</p>
      </div>


        <div class="section">
            <h2 class="section-title">Chief Complaint</h2>
            <p class="paragraph-content">[Chief Complaint (Paragraph)]</p>
        </div>


      <div class="section">
        <h2 class="section-title">History of Present Illness (HPI)</h2>
        <p class="paragraph-content">[History of Present Illness (Paragraph)]</p>
      </div>


      <div class="section">
        <h2 class="section-title">Past Medical History (PMH)</h2>
          <p class="paragraph-content">[Past Medical History (Paragraph)]</p>
           <ul class="list">
                <li><span class="list-label"><strong>Allergies:</strong></span> [Allergies]</li>
                <li><span class="list-label"><strong>Medications:</strong></span> [Medications]</li>
                <li><span class="list-label"><strong>Vaccinations:</strong></span> [Vaccinations]</li>
                <li><span class="list-label"><strong>Previous Hospitalizations/Surgeries:</strong></span> [Previous Hospitalizations/Surgeries]</li>
            </ul>
      </div>

      <div class="section">
        <h2 class="section-title">Developmental History</h2>
          <p class="paragraph-content">[Developmental History (Paragraph)]</p>
            <ul class="list">
                <li><span class="list-label"><strong>Gross Motor Skills:</strong></span> [Gross Motor Skills]</li>
                <li><span class="list-label"><strong>Fine Motor Skills:</strong></span> [Fine Motor Skills]</li>
                <li><span class="list-label"><strong>Language Skills:</strong></span> [Language Skills]</li>
                <li><span class="list-label"><strong>Social Skills:</strong></span> [Social Skills]</li>
            </ul>
      </div>


      <div class="section">
        <h2 class="section-title">Family History</h2>
        <p class="paragraph-content">[Family History (Paragraph)]</p>
            <ul class="list">
                  <li><span class="list-label"><strong>Relevant Medical History of Family Members:</strong></span> [Relevant Medical History of Family Members]</li>
            </ul>
      </div>

       <div class="section">
        <h2 class="section-title">Social History</h2>
        <p class="paragraph-content">[Social History (Paragraph)]</p>
           <ul class="list">
              <li><span class="list-label"><strong>Home Environment:</strong></span> [Home Environment]</li>
              <li><span class="list-label"><strong>School/Daycare:</strong></span> [School/Daycare]</li>
               <li><span class="list-label"><strong>Family Support:</strong></span> [Family Support]</li>
          </ul>
      </div>

      <div class="section">
        <h2 class="section-title">Physical Examination</h2>
        <div class="subsection">
            <h3 class="subsection-title">Vital Signs</h3>
            <table class="subsection-table">
                <tr>
                    <td class="label"><strong>Temperature:</strong></td>
                    <td>[Temperature]</td>
                    <td class="label"><strong>Heart Rate:</strong></td>
                    <td>[Heart Rate]</td>
                </tr>
                 <tr>
                    <td class="label"><strong>Respiratory Rate:</strong></td>
                    <td>[Respiratory Rate]</td>
                    <td class="label"><strong>Blood Pressure:</strong></td>
                    <td>[Blood Pressure]</td>
                </tr>
                 <tr>
                    <td class="label"><strong>Oxygen Saturation:</strong></td>
                    <td>[Oxygen Saturation]</td>
                    <td class="label"><strong>Pain Scale:</strong></td>
                   <td>[Pain Scale]</td>
                </tr>
            </table>
          </div>

           <div class="subsection">
            <h3 class="subsection-title">General Appearance</h3>
            <p class="paragraph-content">[General Appearance (Paragraph)]</p>
          </div>

            <div class="subsection">
              <h3 class="subsection-title">Head and Neck</h3>
               <p class="paragraph-content">[Head and Neck Exam (Paragraph)]</p>
            </div>

            <div class="subsection">
               <h3 class="subsection-title">Respiratory</h3>
               <p class="paragraph-content">[Respiratory Exam (Paragraph)]</p>
            </div>

            <div class="subsection">
                 <h3 class="subsection-title">Cardiovascular</h3>
                <p class="paragraph-content">[Cardiovascular Exam (Paragraph)]</p>
            </div>

            <div class="subsection">
                 <h3 class="subsection-title">Gastrointestinal</h3>
                <p class="paragraph-content">[Gastrointestinal Exam (Paragraph)]</p>
            </div>
            <div class="subsection">
                <h3 class="subsection-title">Genitourinary</h3>
                 <p class="paragraph-content">[Genitourinary Exam (Paragraph)]</p>
            </div>
             <div class="subsection">
               <h3 class="subsection-title">Musculoskeletal</h3>
                <p class="paragraph-content">[Musculoskeletal Exam (Paragraph)]</p>
           </div>
           <div class="subsection">
                <h3 class="subsection-title">Neurological</h3>
                <p class="paragraph-content">[Neurological Exam (Paragraph)]</p>
            </div>
             <div class="subsection">
               <h3 class="subsection-title">Skin</h3>
               <p class="paragraph-content">[Skin Exam (Paragraph)]</p>
           </div>
      </div>


       <div class="section">
            <h2 class="section-title">Laboratory Results</h2>
             <p class="paragraph-content">[Laboratory Results (Paragraph)]</p>
             <ul class="list">
                 <li><span class="list-label"><strong>CBC:</strong></span> [CBC Results]</li>
                 <li><span class="list-label"><strong>Electrolytes:</strong></span> [Electrolytes Results]</li>
                  <li><span class="list-label"><strong>Blood Culture:</strong></span> [Blood Culture Results]</li>
                  <li><span class="list-label"><strong>Urinalysis:</strong></span> [Urinalysis Results]</li>
                   <li><span class="list-label"><strong>Other Labs:</strong></span> [Other Labs Results]</li>
            </ul>
        </div>

       <div class="section">
            <h2 class="section-title">Imaging Results</h2>
            <p class="paragraph-content">[Imaging Results (Paragraph)]</p>
             <ul class="list">
                   <li><span class="list-label"><strong>X-ray:</strong></span> [X-ray Results]</li>
                 <li><span class="list-label"><strong>Ultrasound:</strong></span> [Ultrasound Results]</li>
                  <li><span class="list-label"><strong>CT Scan:</strong></span> [CT Scan Results]</li>
                  <li><span class="list-label"><strong>MRI:</strong></span> [MRI Results]</li>
             </ul>
        </div>


        <div class="section">
            <h2 class="section-title">Assessment and Plan</h2>
            <p class="paragraph-content">[Assessment and Plan (Paragraph)]</p>
        </div>



      <div class="section">
        <h2 class="section-title">Consultations</h2>
          <ul class="list">
            <li>[Consultation 1]</li>
            <li>[Consultation 2]</li>
             <li>[Consultation 3]</li>
          </ul>
      </div>



       <div class="section">
        <h2 class="section-title">Medications Administered</h2>
         <p class="paragraph-content">[Medications Administered (Paragraph)]</p>
           <ul class="list">
            <li><span class="list-label"><strong>Medication 1:</strong></span> [Medication 1 Details]</li>
              <li><span class="list-label"><strong>Medication 2:</strong></span> [Medication 2 Details]</li>
              <li><span class="list-label"><strong>Medication 3:</strong></span> [Medication 3 Details]</li>
          </ul>
      </div>


        <div class="section">
            <h2 class="section-title">Nursing Notes</h2>
            <p class="paragraph-content">[Nursing Notes (Paragraph)]</p>
          </div>


       <div class="section">
        <h2 class="section-title">Discharge Plan</h2>
           <p class="paragraph-content">[Discharge Plan (Paragraph)]</p>
           <ul class="list">
            <li><span class="list-label"><strong>Discharge Instructions:</strong></span> [Discharge Instructions]</li>
               <li><span class="list-label"><strong>Follow Up Appointments:</strong></span> [Follow Up Appointments]</li>
          </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Additional Notes</h2>
            <p class="paragraph-content">[Additional Notes (Paragraph)]</p>
        </div>
       <div class="section">
          <h2 class="section-title">Assessed by:</h2>
          <p class="assessor-info">[Assessor Name], [Assessor Title]</p>
          <p class="assessor-info">Date: [Date]</p>
       </div>
    </div>

    <style>
      .hospital-child-assessment {
          font-family: sans-serif;
          margin: 20px;
          line-height: 1.6;
      }

     .assessment-title {
        font-size: 2rem;
        color: #333;
        margin-bottom: 20px;
        text-align: center;
    }

    .section {
        margin-bottom: 25px;
        border: 1px solid #ddd;
        padding: 20px;
        border-radius: 8px;
        background-color: #f9f9f9;
    }

    .section-title {
        border-bottom: 2px solid #ccc;
        padding-bottom: 8px;
        margin-bottom: 15px;
        font-size: 1.5rem;
        color: #444;
    }


     .subsection {
         margin-left: 25px;
          margin-bottom: 15px;
    }

   .subsection-title {
        font-size: 1.3rem;
        color: #555;
         margin-bottom: 10px;
    }

     .patient-info-table {
         width: 100%;
         border-collapse: collapse;
         margin-bottom: 10px;
     }
     .patient-info-table td {
         padding: 8px;
     }
      .label {
       font-weight: bold;
      }

     .subsection-table {
         width: 100%;
        border-collapse: collapse;
         margin-bottom: 10px;
    }
     .subsection-table td {
       padding: 8px;
    }
      .paragraph-content {
        margin-bottom: 10px;
       }


      .list {
        padding-left: 20px;
        margin-bottom: 10px;
        list-style-type: disc;
    }
    .list li {
        margin-bottom: 5px;
    }
   .list-label {
        font-weight: bold;
    }
    .assessor-info {
        margin-bottom: 5px;
        font-style: italic;
    }

    </style>
  `,
	geriatricAssessment: `
    <div class="geriatric-assessment">
      <h1 class="assessment-title">Geriatric Assessment</h1>

      <div class="section">
        <h2 class="section-title">Patient Information</h2>
          <table class="patient-info-table">
            <tr>
                <td class="label"><strong>Patient Name:</strong></td>
                <td>[Patient Name]</td>
                <td class="label"><strong>Date of Birth:</strong></td>
                <td>[Date of Birth]</td>
            </tr>
            <tr>
                <td class="label"><strong>Medical Record Number:</strong></td>
                <td>[Medical Record Number]</td>
                <td class="label"><strong>Gender:</strong></td>
                <td>[Gender]</td>
            </tr>
              <tr>
                <td class="label"><strong>Admission Date:</strong></td>
                <td>[Admission Date]</td>
                <td class="label"><strong>Current Age:</strong></td>
                 <td>[Current Age]</td>
             </tr>
        </table>
      </div>

      <div class="section">
        <h2 class="section-title">Reason for Admission/Visit</h2>
        <p class="paragraph-content">[Reason for Admission/Visit (Paragraph)]</p>
      </div>

      <div class="section">
        <h2 class="section-title">Chief Complaint</h2>
        <p class="paragraph-content">[Chief Complaint (Paragraph)]</p>
      </div>

      <div class="section">
        <h2 class="section-title">History of Present Illness (HPI)</h2>
        <p class="paragraph-content">[History of Present Illness (Paragraph)]</p>
      </div>


      <div class="section">
        <h2 class="section-title">Past Medical History (PMH)</h2>
        <p class="paragraph-content">[Past Medical History (Paragraph)]</p>
            <ul class="list">
                <li><span class="list-label"><strong>Allergies:</strong></span> [Allergies]</li>
                <li><span class="list-label"><strong>Medications:</strong></span> [Medications]</li>
                <li><span class="list-label"><strong>Immunizations:</strong></span> [Immunizations]</li>
               <li><span class="list-label"><strong>Previous Hospitalizations/Surgeries:</strong></span> [Previous Hospitalizations/Surgeries]</li>
          </ul>
      </div>

      <div class="section">
         <h2 class="section-title">Functional Assessment</h2>
         <div class="subsection">
              <h3 class="subsection-title">Activities of Daily Living (ADLs)</h3>
                <ul class="list">
                    <li><span class="list-label"><strong>Bathing:</strong></span> [Bathing Ability]</li>
                    <li><span class="list-label"><strong>Dressing:</strong></span> [Dressing Ability]</li>
                    <li><span class="list-label"><strong>Toileting:</strong></span> [Toileting Ability]</li>
                    <li><span class="list-label"><strong>Transferring:</strong></span> [Transferring Ability]</li>
                    <li><span class="list-label"><strong>Eating:</strong></span> [Eating Ability]</li>
                </ul>
        </div>
          <div class="subsection">
            <h3 class="subsection-title">Instrumental Activities of Daily Living (IADLs)</h3>
               <ul class="list">
                    <li><span class="list-label"><strong>Managing Finances:</strong></span> [Managing Finances Ability]</li>
                    <li><span class="list-label"><strong>Preparing Meals:</strong></span> [Preparing Meals Ability]</li>
                    <li><span class="list-label"><strong>Managing Medications:</strong></span> [Managing Medications Ability]</li>
                     <li><span class="list-label"><strong>Using Transportation:</strong></span> [Using Transportation Ability]</li>
                     <li><span class="list-label"><strong>Shopping:</strong></span> [Shopping Ability]</li>
                </ul>
           </div>
      </div>

      <div class="section">
         <h2 class="section-title">Cognitive Assessment</h2>
         <div class="subsection">
            <h3 class="subsection-title">Mini-Mental State Examination (MMSE)</h3>
            <p class="paragraph-content"><span class="list-label">[MMSE Score]:</span> [MMSE Interpretation]</p>
          </div>
         <div class="subsection">
            <h3 class="subsection-title">Dementia Screening</h3>
            <p class="paragraph-content">[Dementia Screening Results and Notes]</p>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Falls History</h2>
        <p class="paragraph-content">[Falls History (Paragraph)]</p>
            <ul class="list">
                <li><span class="list-label"><strong>Number of Falls in Past Year:</strong></span> [Number of Falls in Past Year]</li>
               <li><span class="list-label"><strong>Fall Risk Assessment:</strong></span> [Fall Risk Assessment Results]</li>
            </ul>
      </div>


      <div class="section">
        <h2 class="section-title">Social and Environmental History</h2>
        <p class="paragraph-content">[Social and Environmental History (Paragraph)]</p>
           <ul class="list">
                <li><span class="list-label"><strong>Living Situation:</strong></span> [Living Situation]</li>
                <li><span class="list-label"><strong>Social Support:</strong></span> [Social Support]</li>
                <li><span class="list-label"><strong>Home Safety:</strong></span> [Home Safety Assessment]</li>
          </ul>
      </div>


      <div class="section">
        <h2 class="section-title">Nutritional Assessment</h2>
        <p class="paragraph-content">[Nutritional Assessment (Paragraph)]</p>
        <ul class="list">
            <li><span class="list-label"><strong>Weight Change:</strong></span> [Weight Change Details]</li>
            <li><span class="list-label"><strong>Appetite:</strong></span> [Appetite Details]</li>
        </ul>
      </div>

      <div class="section">
          <h2 class="section-title">Pain Assessment</h2>
          <p class="paragraph-content">[Pain Assessment (Paragraph)]</p>
           <ul class="list">
             <li><span class="list-label"><strong>Pain Scale:</strong></span> [Pain Scale]</li>
           </ul>
      </div>

        <div class="section">
            <h2 class="section-title">Physical Examination</h2>
              <div class="subsection">
                    <h3 class="subsection-title">Vital Signs</h3>
                    <table class="subsection-table">
                        <tr>
                            <td class="label"><strong>Temperature:</strong></td>
                            <td>[Temperature]</td>
                            <td class="label"><strong>Heart Rate:</strong></td>
                            <td>[Heart Rate]</td>
                        </tr>
                         <tr>
                            <td class="label"><strong>Respiratory Rate:</strong></td>
                            <td>[Respiratory Rate]</td>
                            <td class="label"><strong>Blood Pressure:</strong></td>
                            <td>[Blood Pressure]</td>
                        </tr>
                         <tr>
                            <td class="label"><strong>Oxygen Saturation:</strong></td>
                            <td>[Oxygen Saturation]</td>
                            <td class="label"><strong>Pain Scale:</strong></td>
                            <td>[Pain Scale]</td>
                       </tr>
                    </table>
            </div>
              <div class="subsection">
                <h3 class="subsection-title">General Appearance</h3>
                <p class="paragraph-content">[General Appearance (Paragraph)]</p>
            </div>
              <div class="subsection">
                  <h3 class="subsection-title">HEENT</h3>
                 <p class="paragraph-content">[HEENT Exam (Paragraph)]</p>
              </div>
              <div class="subsection">
                   <h3 class="subsection-title">Cardiovascular</h3>
                  <p class="paragraph-content">[Cardiovascular Exam (Paragraph)]</p>
              </div>
               <div class="subsection">
                   <h3 class="subsection-title">Respiratory</h3>
                   <p class="paragraph-content">[Respiratory Exam (Paragraph)]</p>
               </div>
                <div class="subsection">
                      <h3 class="subsection-title">Abdomen</h3>
                    <p class="paragraph-content">[Abdominal Exam (Paragraph)]</p>
                 </div>
                 <div class="subsection">
                      <h3 class="subsection-title">Musculoskeletal</h3>
                    <p class="paragraph-content">[Musculoskeletal Exam (Paragraph)]</p>
                 </div>
                 <div class="subsection">
                     <h3 class="subsection-title">Neurological</h3>
                     <p class="paragraph-content">[Neurological Exam (Paragraph)]</p>
                 </div>
                 <div class="subsection">
                     <h3 class="subsection-title">Skin</h3>
                    <p class="paragraph-content">[Skin Exam (Paragraph)]</p>
                 </div>
        </div>


      <div class="section">
        <h2 class="section-title">Medication Review</h2>
        <p class="paragraph-content">[Medication Review (Paragraph)]</p>
           <ul class="list">
             <li><span class="list-label"><strong>Polypharmacy Concerns:</strong></span> [Polypharmacy Concerns]</li>
              <li><span class="list-label"><strong>Medication Adherence:</strong></span> [Medication Adherence]</li>
             </ul>
      </div>

        <div class="section">
            <h2 class="section-title">Laboratory Results</h2>
            <p class="paragraph-content">[Laboratory Results (Paragraph)]</p>
              <ul class="list">
                  <li><span class="list-label"><strong>CBC:</strong></span> [CBC Results]</li>
                  <li><span class="list-label"><strong>Electrolytes:</strong></span> [Electrolytes Results]</li>
                  <li><span class="list-label"><strong>Renal Function:</strong></span> [Renal Function Results]</li>
                  <li><span class="list-label"><strong>Liver Function:</strong></span> [Liver Function Results]</li>
                   <li><span class="list-label"><strong>Other Labs:</strong></span> [Other Labs Results]</li>
               </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Imaging Results</h2>
            <p class="paragraph-content">[Imaging Results (Paragraph)]</p>
             <ul class="list">
                 <li><span class="list-label"><strong>X-ray:</strong></span> [X-ray Results]</li>
                  <li><span class="list-label"><strong>Ultrasound:</strong></span> [Ultrasound Results]</li>
                   <li><span class="list-label"><strong>CT Scan:</strong></span> [CT Scan Results]</li>
                   <li><span class="list-label"><strong>MRI:</strong></span> [MRI Results]</li>
             </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Assessment and Plan</h2>
            <p class="paragraph-content">[Assessment and Plan (Paragraph)]</p>
        </div>

      <div class="section">
        <h2 class="section-title">Consultations</h2>
          <ul class="list">
            <li>[Consultation 1]</li>
            <li>[Consultation 2]</li>
             <li>[Consultation 3]</li>
          </ul>
      </div>

        <div class="section">
        <h2 class="section-title">Discharge Plan</h2>
         <p class="paragraph-content">[Discharge Plan (Paragraph)]</p>
          <ul class="list">
            <li><span class="list-label"><strong>Discharge Instructions:</strong></span> [Discharge Instructions]</li>
               <li><span class="list-label"><strong>Follow Up Appointments:</strong></span> [Follow Up Appointments]</li>
         </ul>
      </div>

        <div class="section">
            <h2 class="section-title">Additional Notes</h2>
            <p class="paragraph-content">[Additional Notes (Paragraph)]</p>
        </div>

        <div class="section">
          <h2 class="section-title">Assessed by:</h2>
          <p class="assessor-info">[Assessor Name], [Assessor Title]</p>
          <p class="assessor-info">Date: [Date]</p>
        </div>
    </div>
    <style>
     .geriatric-assessment {
          font-family: sans-serif;
          margin: 20px;
          line-height: 1.6;
      }

     .assessment-title {
        font-size: 2rem;
        color: #333;
        margin-bottom: 20px;
        text-align: center;
    }

    .section {
        margin-bottom: 25px;
        border: 1px solid #ddd;
        padding: 20px;
        border-radius: 8px;
        background-color: #f9f9f9;
    }

    .section-title {
        border-bottom: 2px solid #ccc;
        padding-bottom: 8px;
        margin-bottom: 15px;
        font-size: 1.5rem;
        color: #444;
    }


     .subsection {
         margin-left: 25px;
          margin-bottom: 15px;
    }

   .subsection-title {
        font-size: 1.3rem;
        color: #555;
         margin-bottom: 10px;
    }

     .patient-info-table {
         width: 100%;
         border-collapse: collapse;
         margin-bottom: 10px;
     }
     .patient-info-table td {
         padding: 8px;
     }
      .label {
       font-weight: bold;
      }

     .subsection-table {
         width: 100%;
        border-collapse: collapse;
         margin-bottom: 10px;
    }
     .subsection-table td {
       padding: 8px;
    }
      .paragraph-content {
        margin-bottom: 10px;
       }


      .list {
        padding-left: 20px;
        margin-bottom: 10px;
        list-style-type: disc;
    }
    .list li {
        margin-bottom: 5px;
    }
   .list-label {
        font-weight: bold;
    }
    .assessor-info {
        margin-bottom: 5px;
        font-style: italic;
    }

    </style>
  `,
	womensHealthAssessment: `
    <div class="womens-health-assessment">
      <h1 class="assessment-title">Women's Health Assessment</h1>

     <div class="section">
        <h2 class="section-title">Patient Information</h2>
          <table class="patient-info-table">
            <tr>
                <td class="label"><strong>Patient Name:</strong></td>
                <td>[Patient Name]</td>
                <td class="label"><strong>Date of Birth:</strong></td>
                <td>[Date of Birth]</td>
            </tr>
            <tr>
                <td class="label"><strong>Medical Record Number:</strong></td>
                <td>[Medical Record Number]</td>
                <td class="label"><strong>Gender:</strong></td>
                <td>[Gender]</td>
            </tr>
              <tr>
                  <td class="label"><strong>Admission Date:</strong></td>
                  <td>[Admission Date]</td>
                  <td class="label"><strong>Current Age:</strong></td>
                 <td>[Current Age]</td>
             </tr>
        </table>
      </div>

      <div class="section">
        <h2 class="section-title">Reason for Visit</h2>
        <p class="paragraph-content">[Reason for Visit (Paragraph)]</p>
      </div>

       <div class="section">
            <h2 class="section-title">Chief Complaint</h2>
            <p class="paragraph-content">[Chief Complaint (Paragraph)]</p>
        </div>

      <div class="section">
        <h2 class="section-title">History of Present Illness (HPI)</h2>
        <p class="paragraph-content">[History of Present Illness (Paragraph)]</p>
      </div>

      <div class="section">
        <h2 class="section-title">Past Medical History (PMH)</h2>
        <p class="paragraph-content">[Past Medical History (Paragraph)]</p>
           <ul class="list">
                <li><span class="list-label"><strong>Allergies:</strong></span> [Allergies]</li>
                <li><span class="list-label"><strong>Medications:</strong></span> [Medications]</li>
                 <li><span class="list-label"><strong>Immunizations:</strong></span> [Immunizations]</li>
                <li><span class="list-label"><strong>Previous Hospitalizations/Surgeries:</strong></span> [Previous Hospitalizations/Surgeries]</li>
           </ul>
      </div>

        <div class="section">
            <h2 class="section-title">Obstetric History</h2>
           <p class="paragraph-content">[Obstetric History (Paragraph)]</p>
            <ul class="list">
                <li><span class="list-label"><strong>Gravida/Para:</strong></span> [Gravida/Para Details]</li>
                <li><span class="list-label"><strong>Menarche:</strong></span> [Menarche Age]</li>
                <li><span class="list-label"><strong>Last Menstrual Period (LMP):</strong></span> [Last Menstrual Period]</li>
                <li><span class="list-label"><strong>Menopause Status:</strong></span> [Menopause Status]</li>
               <li><span class="list-label"><strong>Contraceptive History:</strong></span> [Contraceptive History]</li>
              </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Gynecological History</h2>
              <p class="paragraph-content">[Gynecological History (Paragraph)]</p>
                <ul class="list">
                  <li><span class="list-label"><strong>Previous Pap Smears:</strong></span> [Previous Pap Smears Details]</li>
                   <li><span class="list-label"><strong>STD/STI History:</strong></span> [STD/STI History]</li>
               </ul>
        </div>


      <div class="section">
        <h2 class="section-title">Family History</h2>
         <p class="paragraph-content">[Family History (Paragraph)]</p>
          <ul class="list">
              <li><span class="list-label"><strong>Relevant Medical History of Family Members:</strong></span> [Relevant Medical History of Family Members]</li>
         </ul>
      </div>

     <div class="section">
        <h2 class="section-title">Social History</h2>
        <p class="paragraph-content">[Social History (Paragraph)]</p>
          <ul class="list">
               <li><span class="list-label"><strong>Smoking/Alcohol/Drug Use:</strong></span> [Smoking/Alcohol/Drug Use Details]</li>
               <li><span class="list-label"><strong>Occupation:</strong></span> [Occupation Details]</li>
            </ul>
      </div>


        <div class="section">
          <h2 class="section-title">Physical Examination</h2>
           <div class="subsection">
            <h3 class="subsection-title">Vital Signs</h3>
            <table class="subsection-table">
                <tr>
                    <td class="label"><strong>Temperature:</strong></td>
                    <td>[Temperature]</td>
                    <td class="label"><strong>Heart Rate:</strong></td>
                    <td>[Heart Rate]</td>
                </tr>
                 <tr>
                    <td class="label"><strong>Respiratory Rate:</strong></td>
                    <td>[Respiratory Rate]</td>
                    <td class="label"><strong>Blood Pressure:</strong></td>
                    <td>[Blood Pressure]</td>
                </tr>
                 <tr>
                    <td class="label"><strong>Oxygen Saturation:</strong></td>
                    <td>[Oxygen Saturation]</td>
                     <td class="label"><strong>Pain Scale:</strong></td>
                     <td>[Pain Scale]</td>
               </tr>
            </table>
            </div>
             <div class="subsection">
                <h3 class="subsection-title">General Appearance</h3>
                 <p class="paragraph-content">[General Appearance (Paragraph)]</p>
             </div>
            <div class="subsection">
                <h3 class="subsection-title">HEENT</h3>
                <p class="paragraph-content">[HEENT Exam (Paragraph)]</p>
             </div>
              <div class="subsection">
                 <h3 class="subsection-title">Cardiovascular</h3>
                 <p class="paragraph-content">[Cardiovascular Exam (Paragraph)]</p>
              </div>
               <div class="subsection">
                   <h3 class="subsection-title">Respiratory</h3>
                  <p class="paragraph-content">[Respiratory Exam (Paragraph)]</p>
               </div>
            <div class="subsection">
                <h3 class="subsection-title">Abdomen</h3>
                <p class="paragraph-content">[Abdominal Exam (Paragraph)]</p>
             </div>
            <div class="subsection">
               <h3 class="subsection-title">Breast Exam</h3>
                <p class="paragraph-content">[Breast Exam (Paragraph)]</p>
           </div>
              <div class="subsection">
                <h3 class="subsection-title">Pelvic Exam</h3>
                  <p class="paragraph-content">[Pelvic Exam (Paragraph)]</p>
               </div>
            <div class="subsection">
                 <h3 class="subsection-title">Musculoskeletal</h3>
                   <p class="paragraph-content">[Musculoskeletal Exam (Paragraph)]</p>
               </div>
             <div class="subsection">
                 <h3 class="subsection-title">Neurological</h3>
                <p class="paragraph-content">[Neurological Exam (Paragraph)]</p>
            </div>
             <div class="subsection">
                <h3 class="subsection-title">Skin</h3>
                 <p class="paragraph-content">[Skin Exam (Paragraph)]</p>
             </div>
        </div>


        <div class="section">
            <h2 class="section-title">Laboratory Results</h2>
            <p class="paragraph-content">[Laboratory Results (Paragraph)]</p>
            <ul class="list">
               <li><span class="list-label"><strong>CBC:</strong></span> [CBC Results]</li>
                  <li><span class="list-label"><strong>Electrolytes:</strong></span> [Electrolytes Results]</li>
                   <li><span class="list-label"><strong>Hormone Levels:</strong></span> [Hormone Levels Results]</li>
                   <li><span class="list-label"><strong>Pap Smear Results:</strong></span> [Pap Smear Results]</li>
                   <li><span class="list-label"><strong>STD/STI Screening:</strong></span> [STD/STI Screening Results]</li>
                              <li><span class="list-label"><strong>Other Labs:</strong></span> [Other Labs Results]</li>
            </ul>
        </div>


        <div class="section">
            <h2 class="section-title">Imaging Results</h2>
              <p class="paragraph-content">[Imaging Results (Paragraph)]</p>
             <ul class="list">
                <li><span class="list-label"><strong>Mammogram:</strong></span> [Mammogram Results]</li>
                <li><span class="list-label"><strong>Ultrasound:</strong></span> [Ultrasound Results]</li>
               <li><span class="list-label"><strong>X-ray:</strong></span> [X-ray Results]</li>
                   <li><span class="list-label"><strong>CT Scan:</strong></span> [CT Scan Results]</li>
                    <li><span class="list-label"><strong>MRI:</strong></span> [MRI Results]</li>
             </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Assessment and Plan</h2>
            <p class="paragraph-content">[Assessment and Plan (Paragraph)]</p>
        </div>


      <div class="section">
        <h2 class="section-title">Consultations</h2>
           <ul class="list">
              <li>[Consultation 1]</li>
              <li>[Consultation 2]</li>
               <li>[Consultation 3]</li>
           </ul>
      </div>

      <div class="section">
        <h2 class="section-title">Discharge Plan</h2>
          <p class="paragraph-content">[Discharge Plan (Paragraph)]</p>
             <ul class="list">
               <li><span class="list-label"><strong>Discharge Instructions:</strong></span> [Discharge Instructions]</li>
                <li><span class="list-label"><strong>Follow Up Appointments:</strong></span> [Follow Up Appointments]</li>
           </ul>
      </div>

        <div class="section">
            <h2 class="section-title">Additional Notes</h2>
            <p class="paragraph-content">[Additional Notes (Paragraph)]</p>
        </div>

      <div class="section">
          <h2 class="section-title">Assessed by:</h2>
          <p class="assessor-info">[Assessor Name], [Assessor Title]</p>
          <p class="assessor-info">Date: [Date]</p>
      </div>
    </div>
    <style>
    .womens-health-assessment {
          font-family: sans-serif;
          margin: 20px;
          line-height: 1.6;
      }

     .assessment-title {
        font-size: 2rem;
        color: #333;
        margin-bottom: 20px;
        text-align: center;
    }

    .section {
        margin-bottom: 25px;
        border: 1px solid #ddd;
        padding: 20px;
        border-radius: 8px;
        background-color: #f9f9f9;
    }

    .section-title {
        border-bottom: 2px solid #ccc;
        padding-bottom: 8px;
        margin-bottom: 15px;
        font-size: 1.5rem;
        color: #444;
    }


     .subsection {
         margin-left: 25px;
          margin-bottom: 15px;
    }

   .subsection-title {
        font-size: 1.3rem;
        color: #555;
         margin-bottom: 10px;
    }

     .patient-info-table {
         width: 100%;
         border-collapse: collapse;
         margin-bottom: 10px;
     }
     .patient-info-table td {
         padding: 8px;
     }
      .label {
       font-weight: bold;
      }

     .subsection-table {
         width: 100%;
        border-collapse: collapse;
         margin-bottom: 10px;
    }
     .subsection-table td {
       padding: 8px;
    }
      .paragraph-content {
        margin-bottom: 10px;
       }


      .list {
        padding-left: 20px;
        margin-bottom: 10px;
        list-style-type: disc;
    }
    .list li {
        margin-bottom: 5px;
    }
   .list-label {
        font-weight: bold;
    }
    .assessor-info {
        margin-bottom: 5px;
        font-style: italic;
    }
    </style>
  `,
	criticalCareAssessment: `
    <div class="critical-care-assessment">
      <h1 class="assessment-title">التقييم السريري </h1>
      <h1 class="assessment-title">Critical Care Assessment</h1>

      <div class="section">
        <h2 class="section-title">Patient Information</h2>
          <table class="patient-info-table">
            <tr>
                <td class="label"><strong>Patient Name:</strong></td>
                <td>[Patient Name]</td>
                <td class="label"><strong>Date of Birth:</strong></td>
                <td>[Date of Birth]</td>
            </tr>
            <tr>
                <td class="label"><strong>Medical Record Number:</strong></td>
                <td>[Medical Record Number]</td>
                <td class="label"><strong>Gender:</strong></td>
                <td>[Gender]</td>
            </tr>
              <tr>
                <td class="label"><strong>Admission Date:</strong></td>
                <td>[Admission Date]</td>
                <td class="label"><strong>Current Age:</strong></td>
                 <td>[Current Age]</td>
             </tr>
        </table>
      </div>

        <div class="section">
          <h2 class="section-title">Reason for Admission to ICU</h2>
          <p class="paragraph-content">[Reason for Admission to ICU (Paragraph)]</p>
        </div>


      <div class="section">
        <h2 class="section-title">Chief Complaint/Presenting Problem</h2>
        <p class="paragraph-content">[Chief Complaint/Presenting Problem (Paragraph)]</p>
      </div>

      <div class="section">
        <h2 class="section-title">History of Present Illness (HPI)</h2>
        <p class="paragraph-content">[History of Present Illness (Paragraph)]</p>
      </div>

       <div class="section">
        <h2 class="section-title">Past Medical History (PMH)</h2>
          <p class="paragraph-content">[Past Medical History (Paragraph)]</p>
           <ul class="list">
               <li><span class="list-label"><strong>Allergies:</strong></span> [Allergies]</li>
              <li><span class="list-label"><strong>Medications:</strong></span> [Medications]</li>
               <li><span class="list-label"><strong>Immunizations:</strong></span> [Immunizations]</li>
               <li><span class="list-label"><strong>Previous Hospitalizations/Surgeries:</strong></span> [Previous Hospitalizations/Surgeries]</li>
          </ul>
      </div>

      <div class="section">
        <h2 class="section-title">Family History</h2>
           <p class="paragraph-content">[Family History (Paragraph)]</p>
         <ul class="list">
              <li><span class="list-label"><strong>Relevant Medical History of Family Members:</strong></span> [Relevant Medical History of Family Members]</li>
          </ul>
      </div>

      <div class="section">
        <h2 class="section-title">Social History</h2>
         <p class="paragraph-content">[Social History (Paragraph)]</p>
            <ul class="list">
                <li><span class="list-label"><strong>Smoking/Alcohol/Drug Use:</strong></span> [Smoking/Alcohol/Drug Use Details]</li>
                <li><span class="list-label"><strong>Occupation:</strong></span> [Occupation Details]</li>
            </ul>
      </div>

     <div class="section">
       <h2 class="section-title">Neurological Assessment</h2>
       <div class="subsection">
        <h3 class="subsection-title">Glasgow Coma Scale (GCS)</h3>
        <p class="paragraph-content"><span class="list-label">[GCS Score]:</span> [GCS Details/Interpretation]</p>
        </div>
         <div class="subsection">
              <h3 class="subsection-title">Pupillary Response</h3>
            <p class="paragraph-content">[Pupillary Response Details]</p>
         </div>
          <div class="subsection">
                <h3 class="subsection-title">Motor Function</h3>
              <p class="paragraph-content">[Motor Function Details]</p>
         </div>
      </div>

      <div class="section">
        <h2 class="section-title">Cardiovascular Assessment</h2>
           <div class="subsection">
               <h3 class="subsection-title">Heart Rate/Rhythm</h3>
                <p class="paragraph-content">[Heart Rate/Rhythm Details]</p>
           </div>
        <div class="subsection">
             <h3 class="subsection-title">Blood Pressure</h3>
               <p class="paragraph-content">[Blood Pressure Details]</p>
           </div>
          <div class="subsection">
               <h3 class="subsection-title">Peripheral Pulses</h3>
                <p class="paragraph-content">[Peripheral Pulses Details]</p>
          </div>
            <div class="subsection">
                <h3 class="subsection-title">ECG Findings</h3>
                  <p class="paragraph-content">[ECG Findings (Paragraph)]</p>
              </div>
      </div>


        <div class="section">
            <h2 class="section-title">Respiratory Assessment</h2>
             <div class="subsection">
               <h3 class="subsection-title">Respiratory Rate/Pattern</h3>
               <p class="paragraph-content">[Respiratory Rate/Pattern Details]</p>
           </div>
              <div class="subsection">
               <h3 class="subsection-title">Oxygen Saturation</h3>
              <p class="paragraph-content">[Oxygen Saturation Details]</p>
            </div>
           <div class="subsection">
                 <h3 class="subsection-title">Mechanical Ventilation Settings</h3>
                <p class="paragraph-content">[Mechanical Ventilation Settings Details]</p>
           </div>
         <div class="subsection">
                <h3 class="subsection-title">Breath Sounds</h3>
                 <p class="paragraph-content">[Breath Sounds Details]</p>
         </div>
        </div>

      <div class="section">
        <h2 class="section-title">Gastrointestinal Assessment</h2>
        <div class="subsection">
            <h3 class="subsection-title">Abdomen</h3>
              <p class="paragraph-content">[Abdominal Exam Details]</p>
        </div>
          <div class="subsection">
            <h3 class="subsection-title">Bowel Sounds</h3>
              <p class="paragraph-content">[Bowel Sounds Details]</p>
         </div>
            <div class="subsection">
                <h3 class="subsection-title">Feeding/Nutrition</h3>
                 <p class="paragraph-content">[Feeding/Nutrition Details]</p>
            </div>
        </div>


      <div class="section">
        <h2 class="section-title">Renal Assessment</h2>
        <div class="subsection">
            <h3 class="subsection-title">Urine Output</h3>
             <p class="paragraph-content">[Urine Output Details]</p>
        </div>
         <div class="subsection">
              <h3 class="subsection-title">Fluid Balance</h3>
               <p class="paragraph-content">[Fluid Balance Details]</p>
        </div>
      </div>


      <div class="section">
          <h2 class="section-title">Skin Assessment</h2>
         <p class="paragraph-content">[Skin Assessment Details (Paragraph)]</p>
          <ul class="list">
           <li><span class="list-label"><strong>Wound/Pressure Ulcer Assessment:</strong></span> [Wound/Pressure Ulcer Assessment Details]</li>
          </ul>
      </div>

      <div class="section">
          <h2 class="section-title">Lines and Tubes</h2>
          <p class="paragraph-content">[Lines and Tubes Details (Paragraph)]</p>
          <ul class="list">
              <li><span class="list-label"><strong>Central Lines:</strong></span> [Central Lines Details]</li>
               <li><span class="list-label"><strong>Arterial Lines:</strong></span> [Arterial Lines Details]</li>
               <li><span class="list-label"><strong>Foley Catheter:</strong></span> [Foley Catheter Details]</li>
               <li><span class="list-label"><strong>Nasogastric Tube:</strong></span> [Nasogastric Tube Details]</li>
           </ul>
      </div>
       <div class="section">
            <h2 class="section-title">Pain Assessment</h2>
            <p class="paragraph-content">[Pain Assessment (Paragraph)]</p>
                <ul class="list">
                     <li><span class="list-label"><strong>Pain Scale:</strong></span> [Pain Scale Details]</li>
               </ul>
        </div>
        <div class="section">
            <h2 class="section-title">Physical Examination</h2>
            <div class="subsection">
                 <h3 class="subsection-title">Vital Signs</h3>
                    <table class="subsection-table">
                        <tr>
                            <td class="label"><strong>Temperature:</strong></td>
                            <td>[Temperature]</td>
                            <td class="label"><strong>Heart Rate:</strong></td>
                            <td>[Heart Rate]</td>
                        </tr>
                         <tr>
                            <td class="label"><strong>Respiratory Rate:</strong></td>
                            <td>[Respiratory Rate]</td>
                            <td class="label"><strong>Blood Pressure:</strong></td>
                            <td>[Blood Pressure]</td>
                        </tr>
                         <tr>
                            <td class="label"><strong>Oxygen Saturation:</strong></td>
                            <td>[Oxygen Saturation]</td>
                             <td class="label"><strong>Pain Scale:</strong></td>
                             <td>[Pain Scale]</td>
                       </tr>
                    </table>
               </div>
               <div class="subsection">
                <h3 class="subsection-title">General Appearance</h3>
                 <p class="paragraph-content">[General Appearance (Paragraph)]</p>
            </div>
             <div class="subsection">
                <h3 class="subsection-title">HEENT</h3>
               <p class="paragraph-content">[HEENT Exam (Paragraph)]</p>
             </div>
          </div>
          <div class="section">
              <h2 class="section-title">Laboratory Results</h2>
              <p class="paragraph-content">[Laboratory Results (Paragraph)]</p>
               <ul class="list">
                  <li><span class="list-label"><strong>CBC:</strong></span> [CBC Results]</li>
                    <li><span class="list-label"><strong>Electrolytes:</strong></span> [Electrolytes Results]</li>
                   <li><span class="list-label"><strong>ABG:</strong></span> [ABG Results]</li>
                    <li><span class="list-label"><strong>Renal Function:</strong></span> [Renal Function Results]</li>
                    <li><span class="list-label"><strong>Liver Function:</strong></span> [Liver Function Results]</li>
                    <li><span class="list-label"><strong>Coagulation Studies:</strong></span> [Coagulation Studies Results]</li>
                   <li><span class="list-label"><strong>Blood Cultures:</strong></span> [Blood Cultures Results]</li>
                   <li><span class="list-label"><strong>Other Labs:</strong></span> [Other Labs Results]</li>
                </ul>
           </div>

      <div class="section">
         <h2 class="section-title">Imaging Results</h2>
          <p class="paragraph-content">[Imaging Results (Paragraph)]</p>
           <ul class="list">
               <li><span class="list-label"><strong>X-ray:</strong></span> [X-ray Results]</li>
               <li><span class="list-label"><strong>Ultrasound:</strong></span> [Ultrasound Results]</li>
               <li><span class="list-label"><strong>CT Scan:</strong></span> [CT Scan Results]</li>
                <li><span class="list-label"><strong>MRI:</strong></span> [MRI Results]</li>
            </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Medications</h2>
               <p class="paragraph-content">[Medications (Paragraph)]</p>
                <ul class="list">
                     <li><span class="list-label"><strong>Continuous Infusions:</strong></span> [Continuous Infusions Details]</li>
                    <li><span class="list-label"><strong>Scheduled Medications:</strong></span> [Scheduled Medications Details]</li>
                    <li><span class="list-label"><strong>PRN Medications:</strong></span> [PRN Medications Details]</li>
              </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Assessment and Plan</h2>
            <p class="paragraph-content">[Assessment and Plan (Paragraph)]</p>
        </div>
        <div class="section">
            <h2 class="section-title">Consultations</h2>
               <ul class="list">
                   <li>[Consultation 1]</li>
                   <li>[Consultation 2]</li>
                    <li>[Consultation 3]</li>
                </ul>
        </div>

        <div class="section">
        <h2 class="section-title">Nursing Notes</h2>
        <p class="paragraph-content">[Nursing Notes (Paragraph)]</p>
      </div>
        <div class="section">
            <h2 class="section-title">Additional Notes</h2>
            <p class="paragraph-content">[Additional Notes (Paragraph)]</p>
        </div>

      <div class="section">
          <h2 class="section-title">Assessed by:</h2>
          <p class="assessor-info">[Assessor Name], [Assessor Title]</p>
          <p class="assessor-info">Date: [Date]</p>
      </div>
    </div>
<style>
.critical-care-assessment {
    font-family: Arial, sans-serif;
    margin: 10px;
    line-height: 1.3;
    background: #ffffff;
    padding: 0.5rem;
    font-size: 11pt;
}

.assessment-title {
    font-size: 16pt;
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
    font-size: 12pt;
    font-weight: bold;
}

.subsection {
    margin-left: 15px;
    margin-bottom: 5px;
    padding: 5px;
}

.subsection-title {
    font-size: 11pt;
    margin-bottom: 3px;
    font-weight: bold;
}

.patient-info-table, .subsection-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 5px;
}

.patient-info-table td, .subsection-table td {
    padding: 3px 5px;
    border: 0.5px solid #ccc;
    font-size: 10pt;
}

.label {
    font-weight: bold;
    font-size: 10pt;
}

.paragraph-content {
    margin: 3px 0;
    font-size: 10pt;
}

.list {
    padding-left: 15px;
    margin: 3px 0;
    list-style-type: disc;
}

.list li {
    margin-bottom: 2px;
    font-size: 10pt;
}

.list-label {
    font-weight: bold;
}

.assessor-info {
    margin: 2px 0;
    font-style: italic;
    font-size: 10pt;
}

/* RTL Support for Arabic */
[dir="rtl"] .section-title,
[dir="rtl"] .subsection-title,
[dir="rtl"] .paragraph-content,
[dir="rtl"] .list {
    text-align: right;
}

/* Print-specific optimizations */
@media print {
    @page {
        margin: 1cm;
    }

    .critical-care-assessment {
        margin: 0;
        padding: 0;
        width: 100%;
    }

    .section {
        break-inside: avoid;
        border: 0.5px solid #000;
    }

    /* Ensure black text for printing */
    * {
        color: #000 !important;
        text-shadow: none !important;
        background: transparent !important;
    }

    /* Remove any box shadows */
    .section, .subsection {
        box-shadow: none !important;
    }

    /* Optimize tables for print */
    table {
        border-collapse: collapse !important;
    }

    td {
        border: 0.5px solid #000 !important;
    }

    /* Reduce white space */
    p, h1, h2, h3, table {
        orphans: 3;
        widows: 3;
        margin: 0 !important;
        padding: 2px !important;
    }
}
</style>
  `,
};

export default assessmentTemplates;
