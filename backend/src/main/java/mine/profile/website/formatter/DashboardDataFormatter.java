package mine.profile.website.formatter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class DashboardDataFormatter {
    public List<Map<String, Object>> formatBedsByUnitType(List<Object[]> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("unitType", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> formatBedsByRoomNumber(List<Object[]> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("roomNumber", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> formatBloodTypeData(List<Object[]> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("bloodType", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> formatBirthYearData(List<Object[]> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("year", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> formatAdmissionsByDate(List<Object[]> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> formatDischargesByDate(List<Object[]> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> formatMedicationAdminData(List<Object[]> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("medicationName", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> formatProcedureLogData(List<Object[]> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("procedureName", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> formatProceduresByDate(List<Object[]> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> formatAppointmentsByDate(List<Object[]> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> formatNurseActivityData(List<Object[]> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("activityType", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> formatLabResultData(List<Object[]> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("testName", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> formatProductUsageData(List<Object[]> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("productName", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> formatMedicationPrescribedData(List<Object[]> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("medicationName", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .toList();
    }

}