// src/docs/admission.js
const admissionDocsContent = `
# Admission Page Documentation

This document provides a comprehensive guide on how to use and interact with the Admission page in the Hospital Management System.

## Overview

The Admission page allows authorized users to manage patient admissions, including creating new admissions, editing existing ones, ending admissions, and deleting admissions.  It also provides functionality to manage admission types (e.g., Emergency, Regular, etc.) and their associated prices. The interface integrates with patient, bed, room, and unit data.

## Permissions

Access to features on this page is controlled by user permissions.  You may see limited functionality or redacted data ("***") if you lack certain permissions. The main permissions are:

*   **CREATE_ADMISSION**: Allows creating new admission records.
*   **READ_ADMISSION**: Allows viewing admission details.  Without this, sensitive data is hidden.
*   **UPDATE_ADMISSION**: Allows editing existing admissions, including ending an admission.
*   **DELETE_ADMISSION**: Allows deleting admission records.

## Main Admission List

The main part of the page displays a table of current and past admissions.

### Table Columns

*   **Admission Date**:  Shows when the admission started. Displays a human-readable relative time (e.g., "5 minutes ago") on hover, the full date and time are shown.
*   **Discharge Date**: Shows when the admission ended. If the admission is ongoing, it displays "Open".  Like the admission date, a relative time and full date/time are available on hover.
*   **Patient**: The name of the patient admitted.
*   **Admission Type**:  The type of admission (e.g., Emergency, Scheduled).
*   **Bed**:  The bed number assigned to the patient.
*   **Actions**:  Buttons to interact with the admission record.

### Actions Column

*   **Completed Tag**:  If the admission has a discharge date in the past, a green "Completed" tag is displayed.  No action buttons are shown for completed admissions.
*   **Edit Button**:  (Requires \`UPDATE_ADMISSION\` permission) Opens a modal to edit the admission details.
*   **End Button**: (Requires \`UPDATE_ADMISSION\` permission). Sets the discharge date of the admission to the current time, effectively ending the admission. This will change bed availability.
*   **Delete Button**: (Requires \`DELETE_ADMISSION\` permission) Deletes the admission record.  Use with caution.

### Filtering and Searching

*   **Patient Search**:  An auto-complete search box allows you to filter admissions by patient.  Begin typing a patient's name, and suggestions will appear.  Selecting a patient filters the table to show only admissions for that patient.  This field is required before adding a new admission.
*   **Note**: the filter section can be expanded to search by unit room and beds.

### Pagination

The table supports pagination.  You can navigate through pages of admissions using the controls at the bottom of the table.

## Adding a New Admission

1.  **Search for a Patient**: Use the "Search for a patient" box to find and select the patient you want to admit. This is a required step.
2.  **Click "Add New Admission"**: This button is enabled after you select a patient.  Clicking it opens the "Add Admission" modal.
3.  **Fill out the Form**:
    *   **Patient**: This field should be pre-filled with the patient you selected. You can change it if necessary.
    *   **Admission Type**: Select the appropriate admission type from the dropdown.
    *   **Unit**: Choose the unit where the patient will be admitted.
    *   **Room**:  After selecting a unit, choose a room within that unit.
    *   **Bed**: After selecting a room, choose an available bed.  Occupied beds are marked.
    *   **Admission Date**: Select the date and time of the admission.
4.  **Click "Save"**: This creates the new admission record.

## Editing an Admission

1.  **Find the Admission**: Locate the admission you want to edit in the table.
2.  **Click "Edit"**: This opens the "Edit Admission" modal.
3.  **Modify the Fields**:  You can change the admission type, unit, room, bed, and admission date.  The patient field can also be changed.
4.  **Click "Update"**:  This saves the changes.

## Ending an Admission

1.  **Find the Admission**: Locate the ongoing admission you want to end.
2.  **Click "End"**: This sets the discharge date to the current time. *There is no confirmation dialog*.
3. The bed availability will be update automaticaly.

## Deleting an Admission

1.  **Find the Admission**: Locate the admission you want to delete.
2.  **Click "Delete"**:  This *immediately* deletes the admission record.  *There is no confirmation dialog*.

## Managing Admission Types

This section allows you to create, edit, and delete admission types.

1.  **Click "Manage Admission Types"**: This opens the "Add Admission Type" modal (it's used for both adding and editing).

### Adding a New Admission Type

1.  **Click "Manage Admission Types"**.
2.  **Fill out the Form**:
    *   **Name**: Enter the name of the admission type (e.g., "Emergency", "Standard").
    *   **Price**: Enter the price associated with this admission type.
3.  **Click "Save"**.

### Editing an Admission Type

1.  **Click "Manage Admission Types"**.
2.  **Select Type.** Click the edit option in the modal for a type
3.  **Modify the Fields**: Change the name or price.
4.  **Click "Update"**.

### Deleting an Admission Type

1.  **Click "Manage Admission Types"**.
2.  **Find the Type**: Locate the admission type you want to delete.
3. **Select Type.** Click the edit option in the modal for a type.
4.  **Click "Delete"**:  This *immediately* deletes the admission type. *There is no confirmation dialog.*

## Important Notes

*   **Permissions**: Your ability to perform actions depends on your user role and assigned permissions.
*   **No Confirmation Dialogs**:  The "End" and "Delete" actions *do not* have confirmation dialogs.  Be *extremely* careful when using these buttons.
*   **Bed Availability**: Ending an admission automatically frees up the associated bed.
*   **Required Fields**:  All fields in the "Add Admission" and "Edit Admission" forms are required. You must select a patient before adding a new admission.
* **Admission Types**: you can edit and delete any admission type by clicking its name and then a modal with those options will appear.
`;

export default admissionDocsContent;
