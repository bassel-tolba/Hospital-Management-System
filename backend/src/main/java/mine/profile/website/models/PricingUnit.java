package mine.profile.website.models;

public enum PricingUnit {
    PER_MG("per milligram"),
    PER_ML("per milliliter"),
    PER_DOSE("per dose"),
    PER_VIAL("per vial"),
    PER_UNIT("per unit"),
    PER_PEN("per pen"),
    PER_GRAM("per gram"),
    PER_TABLET("per tablet"),
    PER_CAPSULE("per capsule"),
    PER_PATCH("per patch"),
    PER_INHALER("per inhaler"),
    PER_BOX("per box"),
    PER_PACK("per pack");

    private final String displayValue;

    PricingUnit(String displayValue) {
        this.displayValue = displayValue;
    }

    public String getDisplayValue() {
        return displayValue;
    }
}