import { useState } from "react";
import { usePatientStore } from "../../services/patient.service";

const usePrescriptionPatient = () => {
	const { getPatientById, searchPatients } = usePatientStore();
	const [patientOptions, setPatientOptions] = useState([]);
	const [loading, setLoading] = useState(false);

	const fetchPatientById = async (patientId) => {
		if (!patientId) return null;
		try {
			setLoading(true);
			const patient = await getPatientById(patientId);
			setLoading(false);
			return patient;
		} catch (error) {
			console.error("Error fetching patient by ID:", error);
			setLoading(false);
			return null;
		}
	};

	const searchPatientOptions = async (value) => {
		if (value) {
			try {
				setLoading(true);
				const searchResults = await searchPatients({ searchTerm: value, page: 0, size: 10 });
				setPatientOptions(
					searchResults?.content?.map((patient) => ({
						label: `${patient.firstName} ${patient.lastName}`,
						value: patient.id,
						patient,
					})) || []
				);
				setLoading(false);
			} catch (error) {
				console.error("Failed to search patients:", error);
				setLoading(false);
				setPatientOptions([]);
			}
		} else {
			setLoading(false);
			setPatientOptions([]);
		}
	};

	const clearPatientOptions = () => {
		setPatientOptions([]);
	};

	return { fetchPatientById, searchPatientOptions, patientOptions, clearPatientOptions, loading };
};

export default usePrescriptionPatient;
