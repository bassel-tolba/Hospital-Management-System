const assessmentTemplates = {
	childAssessment: `
    <style>
      ${getStyles()}
    </style>
    <div class="assessment-container">
      <h1 class="assessment-title">Pediatric Assessment</h1>
      <div class="section">
        <h2 class="section-title">Patient Information</h2>
        <table class="patient-info-table">
            <tr>
                <td class="label">Patient Name</td>
                <td>[Patient Name]</td>
                <td class="label">Date of Birth</td>
                <td>[Date of Birth]</td>
            </tr>
            <tr>
                <td class="label">Medical Record Number</td>
                <td>[Medical Record Number]</td>
                 <td class="label">Gender</td>
                <td>[Gender]</td>
            </tr>
              <tr>
                  <td class="label">Admission Date</td>
                  <td>[Admission Date]</td>
                  <td class="label">Current Age</td>
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
                  <li class="list-item"><span class="list-label">Allergies</span> [Allergies]</li>
                <li class="list-item"><span class="list-label">Medications</span> [Medications]</li>
                <li class="list-item"><span class="list-label">Vaccinations</span> [Vaccinations]</li>
                <li class="list-item"><span class="list-label">Previous Hospitalizations/Surgeries</span> [Previous Hospitalizations/Surgeries]</li>
            </ul>
      </div>
      <div class="section">
        <h2 class="section-title">Developmental History</h2>
          <p class="paragraph">[Developmental History (Paragraph)]</p>
            <ul class="list">
                <li class="list-item"><span class="list-label">Gross Motor Skills</span> [Gross Motor Skills]</li>
                <li class="list-item"><span class="list-label">Fine Motor Skills</span> [Fine Motor Skills]</li>
                <li class="list-item"><span class="list-label">Language Skills</span> [Language Skills]</li>
                <li class="list-item"><span class="list-label">Social Skills</span> [Social Skills]</li>
            </ul>
      </div>
      <div class="section">
        <h2 class="section-title">Family History</h2>
        <p class="paragraph">[Family History (Paragraph)]</p>
            <ul class="list">
                  <li class="list-item"><span class="list-label">Relevant Medical History of Family Members</span> [Relevant Medical History of Family Members]</li>
            </ul>
      </div>
       <div class="section">
        <h2 class="section-title">Social History</h2>
        <p class="paragraph">[Social History (Paragraph)]</p>
           <ul class="list">
              <li class="list-item"><span class="list-label">Home Environment</span> [Home Environment]</li>
              <li class="list-item"><span class="list-label">School/Daycare</span> [School/Daycare]</li>
               <li class="list-item"><span class="list-label">Family Support</span> [Family Support]</li>
          </ul>
      </div>
      <div class="section">
        <h2 class="section-title">Physical Examination</h2>
        <div class="subsection">
            <h3 class="subsection-title">Vital Signs</h3>
            <table class="vital-signs-table">
                <tr>
                    <td class="label">Temperature</td>
                    <td>[Temperature]</td>
                    <td class="label">Heart Rate</td>
                    <td>[Heart Rate]</td>
                </tr>
                 <tr>
                    <td class="label">Respiratory Rate</td>
                    <td>[Respiratory Rate]</td>
                    <td class="label">Blood Pressure</td>
                    <td>[Blood Pressure]</td>
                </tr>
                 <tr>
                    <td class="label">Oxygen Saturation</td>
                    <td>[Oxygen Saturation]</td>
                    <td class="label">Pain Scale</td>
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
                 <li class="list-item"><span class="list-label">CBC</span> [CBC Results]</li>
                 <li class="list-item"><span class="list-label">Electrolytes</span> [Electrolytes Results]</li>
                  <li class="list-item"><span class="list-label">Blood Culture</span> [Blood Culture Results]</li>
                  <li class="list-item"><span class="list-label">Urinalysis</span> [Urinalysis Results]</li>
                   <li class="list-item"><span class="list-label">Other Labs</span> [Other Labs Results]</li>
            </ul>
        </div>
       <div class="section">
            <h2 class="section-title">Imaging Results</h2>
            <p class="paragraph">[Imaging Results (Paragraph)]</p>
             <ul class="list">
                   <li class="list-item"><span class="list-label">X-ray</span> [X-ray Results]</li>
                 <li class="list-item"><span class="list-label">Ultrasound</span> [Ultrasound Results]</li>
                  <li class="list-item"><span class="list-label">CT Scan</span> [CT Scan Results]</li>
                  <li class="list-item"><span class="list-label">MRI</span> [MRI Results]</li>
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
            <li class="list-item"><span class="list-label">Medication 1</span> [Medication 1 Details]</li>
              <li class="list-item"><span class="list-label">Medication 2</span> [Medication 2 Details]</li>
              <li class="list-item"><span class="list-label">Medication 3</span> [Medication 3 Details]</li>
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
            <li class="list-item"><span class="list-label">Discharge Instructions</span> [Discharge Instructions]</li>
               <li class="list-item"><span class="list-label">Follow Up Appointments</span> [Follow Up Appointments]</li>
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
      ${getStyles()}
    </style>
    <div class="assessment-container">
      <h1 class="assessment-title">Geriatric Assessment</h1>
      <div class="section">
        <h2 class="section-title">Patient Information</h2>
          <table class="patient-info-table">
            <tr>
                <td class="label">Patient Name</td>
                <td>[Patient Name]</td>
                <td class="label">Date of Birth</td>
                <td>[Date of Birth]</td>
            </tr>
            <tr>
                <td class="label">Medical Record Number</td>
                <td>[Medical Record Number]</td>
                <td class="label">Gender</td>
                <td>[Gender]</td>
            </tr>
              <tr>
                <td class="label">Admission Date</td>
                <td>[Admission Date]</td>
                <td class="label">Current Age</td>
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
                <li class="list-item"><span class="list-label">Allergies</span> [Allergies]</li>
                <li class="list-item"><span class="list-label">Medications</span> [Medications]</li>
                <li class="list-item"><span class="list-label">Immunizations</span> [Immunizations]</li>
               <li class="list-item"><span class="list-label">Previous Hospitalizations/Surgeries</span> [Previous Hospitalizations/Surgeries]</li>
          </ul>
      </div>
      <div class="section">
         <h2 class="section-title">Functional Assessment</h2>
         <div class="subsection">
              <h3 class="subsection-title">Activities of Daily Living (ADLs)</h3>
                <ul class="list">
                    <li class="list-item"><span class="list-label">Bathing</span> [Bathing Ability]</li>
                    <li class="list-item"><span class="list-label">Dressing</span> [Dressing Ability]</li>
                    <li class="list-item"><span class="list-label">Toileting</span> [Toileting Ability]</li>
                    <li class="list-item"><span class="list-label">Transferring</span> [Transferring Ability]</li>
                    <li class="list-item"><span class="list-label">Eating</span> [Eating Ability]</li>
                </ul>
        </div>
          <div class="subsection">
            <h3 class="subsection-title">Instrumental Activities of Daily Living (IADLs)</h3>
               <ul class="list">
                    <li class="list-item"><span class="list-label">Managing Finances</span> [Managing Finances Ability]</li>
                    <li class="list-item"><span class="list-label">Preparing Meals</span> [Preparing Meals Ability]</li>
                     <li class="list-item"><span class="list-label">Managing Medications</span> [Managing Medications Ability]</li>
                     <li class="list-item"><span class="list-label">Using Transportation</span> [Using Transportation Ability]</li>
                     <li class="list-item"><span class="list-label">Shopping</span> [Shopping Ability]</li>
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
                <li class="list-item"><span class="list-label">Number of Falls in Past Year</span> [Number of Falls in Past Year]</li>
               <li class="list-item"><span class="list-label">Fall Risk Assessment</span> [Fall Risk Assessment Results]</li>
            </ul>
      </div>
      <div class="section">
        <h2 class="section-title">Social and Environmental History</h2>
        <p class="paragraph">[Social and Environmental History (Paragraph)]</p>
           <ul class="list">
                <li class="list-item"><span class="list-label">Living Situation</span> [Living Situation]</li>
                <li class="list-item"><span class="list-label">Social Support</span> [Social Support]</li>
                <li class="list-item"><span class="list-label">Home Safety</span> [Home Safety Assessment]</li>
          </ul>
      </div>
      <div class="section">
        <h2 class="section-title">Nutritional Assessment</h2>
        <p class="paragraph">[Nutritional Assessment (Paragraph)]</p>
        <ul class="list">
            <li class="list-item"><span class="list-label">Weight Change</span> [Weight Change Details]</li>
            <li class="list-item"><span class="list-label">Appetite</span> [Appetite Details]</li>
        </ul>
      </div>
      <div class="section">
          <h2 class="section-title">Pain Assessment</h2>
          <p class="paragraph">[Pain Assessment (Paragraph)]</p>
           <ul class="list">
             <li class="list-item"><span class="list-label">Pain Scale</span> [Pain Scale]</li>
           </ul>
      </div>
        <div class="section">
            <h2 class="section-title">Physical Examination</h2>
              <div class="subsection">
                    <h3 class="subsection-title">Vital Signs</h3>
                    <table class="vital-signs-table">
                        <tr>
                            <td class="label">Temperature</td>
                            <td>[Temperature]</td>
                            <td class="label">Heart Rate</td>
                            <td>[Heart Rate]</td>
                        </tr>
                         <tr>
                            <td class="label">Respiratory Rate</td>
                            <td>[Respiratory Rate]</td>
                            <td class="label">Blood Pressure</td>
                            <td>[Blood Pressure]</td>
                        </tr>
                         <tr>
                            <td class="label">Oxygen Saturation</td>
                            <td>[Oxygen Saturation]</td>
                            <td class="label">Pain Scale</td>
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
             <li class="list-item"><span class="list-label">Polypharmacy Concerns</span> [Polypharmacy Concerns]</li>
              <li class="list-item"><span class="list-label">Medication Adherence</span> [Medication Adherence]</li>
             </ul>
      </div>
        <div class="section">
            <h2 class="section-title">Laboratory Results</h2>
            <p class="paragraph">[Laboratory Results (Paragraph)]</p>
              <ul class="list">
                  <li class="list-item"><span class="list-label">CBC</span> [CBC Results]</li>
                  <li class="list-item"><span class="list-label">Electrolytes</span> [Electrolytes Results]</li>
                  <li class="list-item"><span class="list-label">Renal Function</span> [Renal Function Results]</li>
                  <li class="list-item"><span class="list-label">Liver Function</span> [Liver Function Results]</li>
                   <li class="list-item"><span class="list-label">Other Labs</span> [Other Labs Results]</li>
               </ul>
        </div>
        <div class="section">
            <h2 class="section-title">Imaging Results</h2>
            <p class="paragraph">[Imaging Results (Paragraph)]</p>
             <ul class="list">
                 <li class="list-item"><span class="list-label">X-ray</span> [X-ray Results]</li>
                  <li class="list-item"><span class="list-label">Ultrasound</span> [Ultrasound Results]</li>
                   <li class="list-item"><span class="list-label">CT Scan</span> [CT Scan Results]</li>
                   <li class="list-item"><span class="list-label">MRI</span> [MRI Results]</li>
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
            <li class="list-item"><span class="list-label">Discharge Instructions</span> [Discharge Instructions]</li>
               <li class="list-item"><span class="list-label">Follow Up Appointments</span> [Follow Up Appointments]</li>
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
	womensHealthAssessment: `
    <style>
      ${getStyles()}
    </style>
    <div class="assessment-container">
      <h1 class="assessment-title">Women's Health Assessment</h1>
     <div class="section">
        <h2 class="section-title">Patient Information</h2>
          <table class="patient-info-table">
            <tr>
                <td class="label">Patient Name</td>
                <td>[Patient Name]</td>
                <td class="label">Date of Birth</td>
                <td>[Date of Birth]</td>
            </tr>
            <tr>
                <td class="label">Medical Record Number</td>
                <td>[Medical Record Number]</td>
                <td class="label">Gender</td>
                <td>[Gender]</td>
            </tr>
              <tr>
                  <td class="label">Admission Date</td>
                  <td>[Admission Date]</td>
                  <td class="label">Current Age</td>
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
                <li class="list-item"><span class="list-label">Allergies</span> [Allergies]</li>
                <li class="list-item"><span class="list-label">Medications</span> [Medications]</li>
                 <li class="list-item"><span class="list-label">Immunizations</span> [Immunizations]</li>
                <li class="list-item"><span class="list-label">Previous Hospitalizations/Surgeries</span> [Previous Hospitalizations/Surgeries]</li>
           </ul>
      </div>
        <div class="section">
            <h2 class="section-title">Obstetric History</h2>
           <p class="paragraph">[Obstetric History (Paragraph)]</p>
            <ul class="list">
                <li class="list-item"><span class="list-label">Gravida/Para</span> [Gravida/Para Details]</li>
                <li class="list-item"><span class="list-label">Menarche</span> [Menarche Age]</li>
                <li class="list-item"><span class="list-label">Last Menstrual Period (LMP)</span> [Last Menstrual Period]</li>
                <li class="list-item"><span class="list-label">Menopause Status</span> [Menopause Status]</li>
               <li class="list-item"><span class="list-label">Contraceptive History</span> [Contraceptive History]</li>
              </ul>
        </div>
        <div class="section">
            <h2 class="section-title">Gynecological History</h2>
              <p class="paragraph">[Gynecological History (Paragraph)]</p>
                <ul class="list">
                  <li class="list-item"><span class="list-label">Previous Pap Smears</span> [Previous Pap Smears Details]</li>
                   <li class="list-item"><span class="list-label">STD/STI History</span> [STD/STI History]</li>
               </ul>
        </div>
      <div class="section">
        <h2 class="section-title">Family History</h2>
         <p class="paragraph">[Family History (Paragraph)]</p>
          <ul class="list">
              <li class="list-item"><span class="list-label">Relevant Medical History of Family Members</span> [Relevant Medical History of Family Members]</li>
         </ul>
      </div>
     <div class="section">
        <h2 class="section-title">Social History</h2>
        <p class="paragraph">[Social History (Paragraph)]</p>
          <ul class="list">
               <li class="list-item"><span class="list-label">Smoking/Alcohol/Drug Use</span> [Smoking/Alcohol/Drug Use Details]</li>
               <li class="list-item"><span class="list-label">Occupation</span> [Occupation Details]</li>
            </ul>
      </div>
        <div class="section">
          <h2 class="section-title">Physical Examination</h2>
           <div class="subsection">
            <h3 class="subsection-title">Vital Signs</h3>
            <table class="vital-signs-table">
                <tr>
                    <td class="label">Temperature</td>
                    <td>[Temperature]</td>
                    <td class="label">Heart Rate</td>
                    <td>[Heart Rate]</td>
                </tr>
                 <tr>
                    <td class="label">Respiratory Rate</td>
                    <td>[Respiratory Rate]</td>
                    <td class="label">Blood Pressure</td>
                    <td>[Blood Pressure]</td>
                </tr>
                 <tr>
                    <td class="label">Oxygen Saturation</td>
                    <td>[Oxygen Saturation]</td>
                     <td class="label">Pain Scale</td>
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
               <li class="list-item"><span class="list-label">CBC</span> [CBC Results]</li>
                  <li class="list-item"><span class="list-label">Electrolytes</span> [Electrolytes Results]</li>
                   <li class="list-item"><span class="list-label">Hormone Levels</span> [Hormone Levels Results]</li>
                   <li class="list-item"><span class="list-label">Pap Smear Results</span> [Pap Smear Results]</li>
                   <li class="list-item"><span class="list-label">STD/STI Screening</span> [STD/STI Screening Results]</li>
                              <li class="list-item"><span class="list-label">Other Labs</span> [Other Labs Results]</li>
            </ul>
        </div>
        <div class="section">
            <h2 class="section-title">Imaging Results</h2>
              <p class="paragraph">[Imaging Results (Paragraph)]</p>
             <ul class="list">
                <li class="list-item"><span class="list-label">Mammogram</span> [Mammogram Results]</li>
                <li class="list-item"><span class="list-label">Ultrasound</span> [Ultrasound Results]</li>
               <li class="list-item"><span class="list-label">X-ray</span> [X-ray Results]</li>
                   <li class="list-item"><span class="list-label">CT Scan</span> [CT Scan Results]</li>
                    <li class="list-item"><span class="list-label">MRI</span> [MRI Results]</li>
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
               <li class="list-item"><span class="list-label">Discharge Instructions</span> [Discharge Instructions]</li>
                <li class="list-item"><span class="list-label">Follow Up Appointments</span> [Follow Up Appointments]</li>
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
      ${getStyles()}
    </style>
    <div class="assessment-container">
      <h1 class="assessment-title">Critical Care Assessment</h1>
      <div class="section">
        <h2 class="section-title">Patient Information</h2>
          <table class="patient-info-table">
            <tr>
                <td class="label">Patient Name</td>
                <td>[Patient Name]</td>
                <td class="label">Date of Birth</td>
                <td>[Date of Birth]</td>
            </tr>
            <tr>
                <td class="label">Medical Record Number</td>
                <td>[Medical Record Number]</td>
                <td class="label">Gender</td>
                <td>[Gender]</td>
            </tr>
              <tr>
                <td class="label">Admission Date</td>
                <td>[Admission Date]</td>
                <td class="label">Current Age</td>
                 <td>[Current Age]</td>             </tr>
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
               <li class="list-item"><span class="list-label">Allergies</span> [Allergies]</li>
              <li class="list-item"><span class="list-label">Medications</span> [Medications]</li>
               <li class="list-item"><span class="list-label">Immunizations</span> [Immunizations]</li>
               <li class="list-item"><span class="list-label">Previous Hospitalizations/Surgeries</span> [Previous Hospitalizations/Surgeries]</li>
          </ul>
      </div>

      <div class="section">
        <h2 class="section-title">Family History</h2>
           <p class="paragraph">[Family History (Paragraph)]</p>
         <ul class="list">
              <li class="list-item"><span class="list-label">Relevant Medical History of Family Members</span> [Relevant Medical History of Family Members]</li>
          </ul>
      </div>

      <div class="section">
        <h2 class="section-title">Social History</h2>         <p class="paragraph">[Social History (Paragraph)]</p>
            <ul class="list">
                <li class="list-item"><span class="list-label">Smoking/Alcohol/Drug Use</span> [Smoking/Alcohol/Drug Use Details]</li>
                <li class="list-item"><span class="list-label">Occupation</span> [Occupation Details]</li>
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
           <li class="list-item"><span class="list-label">Wound/Pressure Ulcer Assessment</span> [Wound/Pressure Ulcer Assessment Details]</li>
          </ul>
      </div>

      <div class="section">
          <h2 class="section-title">Lines and Tubes</h2>
          <p class="paragraph">[Lines and Tubes Details (Paragraph)]</p>
          <ul class="list">
              <li class="list-item"><span class="list-label">Central Lines</span> [Central Lines Details]</li>
               <li class="list-item"><span class="list-label">Arterial Lines</span> [Arterial Lines Details]</li>
               <li class="list-item"><span class="list-label">Foley Catheter</span> [Foley Catheter Details]</li>
               <li class="list-item"><span class="list-label">Nasogastric Tube</span> [Nasogastric Tube Details]</li>
           </ul>
      </div>
       <div class="section">
            <h2 class="section-title">Pain Assessment</h2>
            <p class="paragraph">[Pain Assessment (Paragraph)]</p>
                <ul class="list">
                     <li class="list-item"><span class="list-label">Pain Scale</span> [Pain Scale Details]</li>
               </ul>
        </div>
        <div class="section">
            <h2 class="section-title">Physical Examination</h2>
            <div class="subsection">
                 <h3 class="subsection-title">Vital Signs</h3>
                    <table class="vital-signs-table">
                        <tr>
                            <td class="label">Temperature</td>
                            <td>[Temperature]</td>
                            <td class="label">Heart Rate</td>
                            <td>[Heart Rate]</td>
                        </tr>
                         <tr>
                            <td class="label">Respiratory Rate</td>
                            <td>[Respiratory Rate]</td>
                            <td class="label">Blood Pressure</td>
                            <td>[Blood Pressure]</td>
                        </tr>
                         <tr>
                            <td class="label">Oxygen Saturation</td>
                            <td>[Oxygen Saturation]</td>
                             <td class="label">Pain Scale</td>
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
                  <li class="list-item"><span class="list-label">CBC</span> [CBC Results]</li>
                    <li class="list-item"><span class="list-label">Electrolytes</span> [Electrolytes Results]</li>
                   <li class="list-item"><span class="list-label">ABG</span> [ABG Results]</li>
                    <li class="list-item"><span class="list-label">Renal Function</span> [Renal Function Results]</li>
                    <li class="list-item"><span class="list-label">Liver Function</span> [Liver Function Results]</li>
                    <li class="list-item"><span class="list-label">Coagulation Studies</span> [Coagulation Studies Results]</li>
                   <li class="list-item"><span class="list-label">Blood Cultures</span> [Blood Cultures Results]</li>
                   <li class="list-item"><span class="list-label">Other Labs</span> [Other Labs Results]</li>
                </ul>
           </div>

      <div class="section">
         <h2 class="section-title">Imaging Results</h2>
          <p class="paragraph">[Imaging Results (Paragraph)]</p>
           <ul class="list">
               <li class="list-item"><span class="list-label">X-ray</span> [X-ray Results]</li>
               <li class="list-item"><span class="list-label">Ultrasound</span> [Ultrasound Results]</li>
               <li class="list-item"><span class="list-label">CT Scan</span> [CT Scan Results]</li>
                <li class="list-item"><span class="list-label">MRI</span> [MRI Results]</li>
            </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Medications</h2>
               <p class="paragraph">[Medications (Paragraph)]</p>
                <ul class="list">
                     <li class="list-item"><span class="list-label">Continuous Infusions</span> [Continuous Infusions Details]</li>
                    <li class="list-item"><span class="list-label">Scheduled Medications</span> [Scheduled Medications Details]</li>
                    <li class="list-item"><span class="list-label">PRN Medications</span> [PRN Medications Details]</li>
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
function getStyles() {
	return `
/*
* Distinguished Medical Institution Assessment Stylesheet
* Ethereal Edition
* @version 4.0
* @lastmodified 2024-02-14
*/

:root {
  /* Professional & Magical Font Stack */
  --font-primary: 'Crimson Pro', 'Cormorant', 'Garamond Premier Pro', Georgia, serif;
  --font-headers: 'Americana Std', 'Orpheus Pro', 'Vendetta', 'Times New Roman', serif;
  --font-secondary: 'Acumin Pro', 'Source Sans Pro', system-ui, sans-serif;
  --font-mono: 'Pitch Sans', 'Input Mono', 'IBM Plex Mono', monospace;

  /* Ethereal Color Palette */
  --color-primary: #2c3e50;    /* Deep twilight blue */
  --color-secondary: #34495e;  /* Mystical slate */
  --color-accent: #3498db;     /* Celestial blue */
  --color-subtle: #bdc3c7;     /* Misty gray */
  --text-color: #2c3e50;       /* Deep text */
  --text-muted: #7f8c8d;       /* Subtle text */
  --border-color: #ecf0f1;     /* Soft borders */
  --table-border-color: #dfe6e9;
  
  /* Typography Scale (keeping your original) */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.375rem;
  --text-2xl: 1.75rem;
  --text-3xl: 2rem;
  
  /* Keeping your original spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 0.75rem;
  --spacing-lg: 1rem;
  --spacing-xl: 1.5rem;
}

/* Base Typography */
html {
  font-size: 11pt;
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  font-family: var(--font-primary);
  color: var(--text-color);
  background: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Headers */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-headers);
  line-height: 1.2;
  color: var(--color-primary);
  margin: 0 0 var(--spacing-sm) 0;
  page-break-after: avoid;
  font-weight: 600;
}

h1 { 
  font-size: var(--text-3xl); 
  letter-spacing: -0.02em;
  color: var(--color-primary);
  border-bottom: 2pt solid var(--color-accent);
  padding-bottom: var(--spacing-xs);
}

h2 { 
  font-size: var(--text-2xl); 
  color: var(--color-secondary);
}

h3 { 
  font-size: var(--text-xl); 
  border-bottom: 1pt solid var(--color-subtle);
}

/* Assessment Container */
.assessment-container {
  max-width: 100%;
  margin: 0;
  padding: var(--spacing-lg);
  position: relative;
  background-color: #fff;
}

/* Header */
.assessment-header {
  border-bottom: 3pt double var(--color-primary);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  position: relative;
}

.assessment-header::after {
  content: '';
  position: absolute;
  bottom: 3pt;
  left: 0;
  right: 0;
  border-bottom: 1pt solid var(--color-accent);
  margin-bottom: 3pt;
}

.assessment-title {
  font-family: var(--font-headers);
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
  letter-spacing: -0.01em;
}

/* Institution Seal */
.institution-seal {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 80px;
  height: 80px;
  opacity: 0.85;
}

/* Sections */
.section {
  margin: var(--spacing-sm) 0;
  break-inside: avoid;
  position: relative;
}

.section-title {
  font-family: var(--font-headers);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-secondary);
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1pt solid var(--color-accent);
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: var(--spacing-sm) 0;
  font-size: var(--text-sm);
  break-inside: avoid;
  border: 1pt solid var(--table-border-color);
}

thead {
  background-color: var(--color-primary);
  border-bottom: 2pt solid var(--color-accent);
}

th {
  font-family: var(--font-headers);
  font-weight: 600;
  text-align: left;
  padding: var(--spacing-xs) var(--spacing-sm);
  color: white;
  border-bottom: 1pt solid var(--table-border-color);
}

td {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-bottom: 1pt solid var(--table-border-color);
  vertical-align: top;
}

tbody tr:last-child td {
  border-bottom: none;
}

/* Print Optimizations */
@media print {
  @page {
    margin: 1.5cm;
    size: A4;
  }

  body {
    min-width: 992px !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;
  }

  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 90%;
    color: var(--text-muted);
    font-style: italic;
  }

  h1, h2, h3, h4, h5, h6, img, table {
    page-break-inside: avoid;
    page-break-after: avoid;
  }

  .section {
    page-break-inside: avoid;
  }

  @page {
    @bottom-right {
      content: counter(page);
      font-family: var(--font-primary);
      font-size: var(--text-sm);
    }
  }
}

/* Utility Classes */
.text-center { text-align: center; }
.text-right { text-align: right; }
.font-bold { font-weight: 600; }
.text-muted { color: var(--text-muted); }
.monospace { font-family: var(--font-mono); }
.watermark { 
  position: fixed; 
  opacity: 0.03; 
  transform: rotate(-45deg);
  font-size: 4rem;
  color: var(--color-primary);
  pointer-events: none;
}

/* Signature Block */
.signature-block {
  margin-top: var(--spacing-lg);
  border-top: 1pt solid var(--border-color);
  padding-top: var(--spacing-md);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.signature-line {
  border-top: 1pt solid var(--text-color);
  margin-top: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}
`;
}

export default assessmentTemplates;
