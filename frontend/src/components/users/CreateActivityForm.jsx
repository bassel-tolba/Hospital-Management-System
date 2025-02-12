import React, { useEffect } from "react";
import { Form, Input, Select, Button, Spin, Typography, notification, Space, AutoComplete } from "antd";
import { useActivityStore } from "../../services/activity.service";
import { usePatientStore } from "../../services/patient.service";
import { useUnitStore } from "../../services/unit.service";
import { useRoomStore } from "../../services/room.service";
import { useLabStore } from "../../services/lab.service";
import { useImageReportTypeStore } from "../../services/imageReportType.service";

const { Option } = Select;

const CreateActivityForm = ({ onActivityCreated }) => {
	const [form] = Form.useForm();
	const { createActivity, loading, error, clearError } = useActivityStore();
	const { patients, searchPatients, loading: patientLoading } = usePatientStore();
	const { units, fetchAllUnits, loading: unitLoading } = useUnitStore();
	const { rooms, searchRooms, loading: roomLoading } = useRoomStore();
	const { labTests, fetchLabTests, loading: labLoading } = useLabStore();
	const { imageReportTypes, fetchImageReportTypes, loading: imageReportLoading } = useImageReportTypeStore();

	useEffect(() => {
		fetchAllUnits();
	}, [fetchAllUnits]);

	useEffect(() => {
		const fetchDependentData = async () => {
			const activityType = form.getFieldValue("activityType");
			if (activityType === "LAB_TEST") {
				await fetchLabTests();
				const labUnit = units?.find((unit) => unit.name === "LABORATORY")?.id;
				form.setFieldsValue({ unitId: labUnit });
			} else if (activityType === "IMAGE_REPORT") {
				await fetchImageReportTypes(0, 10000);
				const radiologyUnit = units?.find((unit) => unit.name === "RADIOLOGY")?.id;
				form.setFieldsValue({ unitId: radiologyUnit });
			}
		};
		fetchDependentData();
	}, [form, units, fetchLabTests, fetchImageReportTypes]);

	const handleUnitChange = async (unitId) => {
		if (unitId) {
			const response = await searchRooms({ unitId });
			form.setFieldsValue({ roomId: null });
			form.setFieldsValue({ filteredRooms: response.content });
		} else {
			form.setFieldsValue({ roomId: null });
			form.setFieldsValue({ filteredRooms: [] });
		}
	};

	const handlePatientSearch = async (value) => {
		await searchPatients({ searchTerm: value });
	};

	const handleLabTestSelect = (value, option) => {
		form.setFieldsValue({ description: option?.test?.testName, labTestId: option?.test?.id, imageReportTypeId: null });
	};

	const handleImageReportTypeSelect = (value, option) => {
		form.setFieldsValue({ description: option?.type?.name, imageReportTypeId: option?.type?.id, labTestId: null });
	};

	const handleSubmit = async (values) => {
		try {
			await createActivity({ ...values, state: "pending" });
			form.resetFields();
			onActivityCreated();
		} catch (err) {
			console.error("Failed to create activity", err);
			notification.error({
				message: "Error",
				description: `Failed to create activity: ${error}`,
			});
		}
	};

	if (loading || patientLoading || unitLoading || roomLoading || labLoading || imageReportLoading) {
		return (
			<div style={{ textAlign: "center", padding: 20 }}>
				<Spin />
			</div>
		);
	}

	if (error) {
		return (
			<Space>
				<Typography.Text type="danger">Error: {error}</Typography.Text>
				<Button size="small" onClick={clearError}>
					Clear Error
				</Button>
			</Space>
		);
	}
	const patientOptions = patients.map((patient) => ({
		value: patient.id,
		label: `${patient.firstName} ${patient.lastName}`,
	}));
	const labTestOptions = labTests?.map((test) => ({
		value: test.testName,
		label: test.testName,
		test,
	}));
	const imageReportTypeOptions = imageReportTypes?.map((type) => ({
		value: type.name,
		label: type.name,
		type,
	}));

	return (
		<Form form={form} layout="vertical" onFinish={handleSubmit}>
			<Form.Item name="activityType" label="Activity Type" rules={[{ required: true }]}>
				<Select
					onChange={() => {
						form.setFieldsValue({ description: "", labTestId: null, imageReportTypeId: null });
						form.setFieldsValue({ unitId: null, roomId: null });
					}}>
					<Option value="LAB_TEST">Lab Test</Option>
					<Option value="IMAGE_REPORT">Image Report</Option>
					<Option value="VITAL_SIGNS">Vital Signs</Option>
					<Option value="MEDICATION_ADMINISTRATION">Medication Administration</Option>
					<Option value="ASSESSMENT">Assessment</Option>
					<Option value="PRODUCT">Product</Option>
				</Select>
			</Form.Item>

			{form.getFieldValue("activityType") === "LAB_TEST" && (
				<Form.Item label="Search Lab Tests">
					<AutoComplete
						style={{ width: "100%" }}
						filterOption={false}
						options={labTestOptions}
						onSelect={handleLabTestSelect}
						placeholder="Search Lab Tests"
					/>
				</Form.Item>
			)}
			{form.getFieldValue("activityType") === "IMAGE_REPORT" && (
				<Form.Item label="Search Image Report Types">
					<AutoComplete
						style={{ width: "100%" }}
						filterOption={false}
						options={imageReportTypeOptions}
						onSelect={handleImageReportTypeSelect}
						placeholder="Search Image Report Types"
					/>
				</Form.Item>
			)}
			<Form.Item name="description" label="Description" rules={[{ required: true }]}>
				<Input disabled={form.getFieldValue("activityType") === "LAB_TEST" || form.getFieldValue("activityType") === "IMAGE_REPORT"} />
			</Form.Item>
			<Form.Item name="unitId" label="Unit (optional)">
				<Select onChange={handleUnitChange} allowClear>
					{units?.map((unit) => (
						<Option key={unit.id} value={unit.id}>
							{unit.name}
						</Option>
					))}
				</Select>
			</Form.Item>

			<Form.Item name="roomId" label="Room (optional)">
				<Select allowClear>
					{form.getFieldValue("filteredRooms")?.map((room) => (
						<Option key={room.id} value={room.id}>
							{room.roomNumber}
						</Option>
					))}
				</Select>
			</Form.Item>

			<Form.Item name="patientIds" label="Search Patients">
				<AutoComplete
					filterOption={false}
					options={patientOptions}
					onSearch={handlePatientSearch}
					placeholder="Search Patients"
					mode={"multiple"}
				/>
			</Form.Item>

			<Form.Item>
				<Button type="default" htmlType="submit" loading={loading}>
					Create Activity
				</Button>
			</Form.Item>
		</Form>
	);
};

export default CreateActivityForm;
