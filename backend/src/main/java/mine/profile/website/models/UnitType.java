package mine.profile.website.models;

public enum UnitType {
    WARD("Ward"),
    GENERAL_MEDICAL("General Medical"), // Main medical ward
    GENERAL_SURGICAL("General Surgical"), // Main surgical ward
    PEDIATRIC("Pediatric"), // Children's ward
    OBSTETRICS_GYNECOLOGY("Obstetrics & Gynecology"), // Women's health and pregnancy
    ORTHOPEDIC("Orthopedic"), // Musculoskeletal system

    ICU("Intensive Care Unit"), // Critically ill patients
    CCU("Cardiac Care Unit"), // Heart patients
    NICU("Neonatal ICU"), // Critically ill newborns

    ONCOLOGY("Oncology"), // Cancer treatment
    DIALYSIS("Dialysis"), // Kidney failure treatment
    PSYCHIATRIC("Psychiatric"), // Mental health treatment
    NEUROLOGY("Neurology"), // Nervous system treatment
    PULMONARY("Pulmonary"), // Respiratory treatment
    GASTROENTEROLOGY("Gastroenterology"), // Digestive system treatment
    OPHTHALMOLOGY("Ophthalmology"), // Eye treatment
    ENT("ENT"), // Ear, nose, and throat treatment
    DERMATOLOGY("Dermatology"), // Skin treatment
    REHABILITATION("Rehabilitation"), // Physical and occupational therapy
    INFECTIOUS_DISEASE("Infectious Disease"), // Treatment of infections

    EMERGENCY("Emergency"), // Immediate care
    OPERATING_ROOM("Operating Room"), // Surgical procedures
    LABORATORY("Laboratory"), // Diagnostic testing
    RADIOLOGY("Radiology"), // Imaging
    PHARMACY("Pharmacy"), // Medication dispensing
    OUTPATIENT("Outpatient Clinic"); // Appointments

    private final String displayName;

    UnitType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}