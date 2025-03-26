// src/i18n.js (Your i18n configuration)
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fa from "./locales/fa.json";
import ar from "./locales/ar.json";
import LanguageDetector from "i18next-browser-languagedetector"; // Import

i18n.use(LanguageDetector) // Add LanguageDetector
	.use(initReactI18next)
	.init({
		resources: {
			en: { translation: en },
			fa: { translation: fa },
			ar: { translation: ar },
		},
		// lng: "en",  // REMOVE: Let LanguageDetector handle the initial language.
		fallbackLng: "en",
		interpolation: {
			escapeValue: false, // React already escapes, as you had it.
		},
	});

export default i18n;
