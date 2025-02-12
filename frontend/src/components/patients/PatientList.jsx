import { notification } from "antd";
import moment from "moment";
import React, { useState, useEffect, useRef } from "react";
import {
	Table,
	Input,
	Button,
	Space,
	Typography,
	Modal,
	Form,
	DatePicker,
	Pagination,
	Select,
	Upload,
	Avatar,
	Image,
	Row,
	Col,
	Progress,
} from "antd";
import { SearchOutlined, EyeOutlined, DeleteOutlined, UploadOutlined, AudioOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { usePatientStore } from "../../services/patient.service";
import { useAuthStore } from "../../services/auth.service";

const { Title } = Typography;
const { Option } = Select;

// --- Helper Functions ---

// Function to get a color based on volume level
const getVolumeColor = (volume) => {
	if (volume < 0.1) return "#4ade80"; // Light green
	if (volume < 0.2) return "#22c55e"; // Medium green
	if (volume < 0.3) return "#eab308"; // Yellow
	if (volume < 0.4) return "#f59e0b"; // Orange
	if (volume < 0.5) return "#f97316"; // Dark orange
	if (volume < 0.6) return "#ef4444"; // Light red
	if (volume < 0.7) return "#dc2626"; // Medium red
	if (volume < 0.8) return "#b91c1c"; // Dark red
	if (volume < 0.9) return "#991b1b"; // Darker red
	return "#7f1d1d"; // Darkest red
};

const RecordingButton = ({ isRecording, onStartRecording, onStopRecording, disabled }) => {
	const [volume, setVolume] = useState(0);
	const audioContext = useRef(null);
	const analyser = useRef(null);
	const dataArray = useRef(null);
	const animationFrameId = useRef(null);

	useEffect(() => {
		let stream = null;

		const startAudioAnalysis = async () => {
			try {
				stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
				analyser.current = audioContext.current.createAnalyser();
				const source = audioContext.current.createMediaStreamSource(stream);
				source.connect(analyser.current);

				analyser.current.fftSize = 256;
				const bufferLength = analyser.current.frequencyBinCount;
				dataArray.current = new Uint8Array(bufferLength);

				const updateVolume = () => {
					if (!analyser.current || !dataArray.current) return;
					analyser.current.getByteFrequencyData(dataArray.current);

					// Enhanced volume calculation with more emphasis on peaks
					let sum = 0;
					let peakCount = 0;
					const threshold = 128; // Half of max byte value

					for (let i = 0; i < dataArray.current.length; i++) {
						sum += dataArray.current[i];
						if (dataArray.current[i] > threshold) {
							peakCount++;
						}
					}

					const average = sum / dataArray.current.length;
					const peakFactor = peakCount / dataArray.current.length;
					const normalizedVolume = (average / 255) * (1 + peakFactor);

					setVolume(Math.min(normalizedVolume, 1));
					animationFrameId.current = requestAnimationFrame(updateVolume);
				};

				animationFrameId.current = requestAnimationFrame(updateVolume);
			} catch (error) {
				console.error("Error accessing microphone:", error);
			}
		};

		const stopAudioAnalysis = () => {
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current);
			}
			if (audioContext.current) {
				audioContext.current.close().catch((error) => console.error("Error closing audio context:", error));
				audioContext.current = null;
			}
			analyser.current = null;
			dataArray.current = null;
			setVolume(0);

			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
				stream = null;
			}
		};

		if (isRecording) {
			startAudioAnalysis();
		} else {
			stopAudioAnalysis();
		}

		return () => {
			stopAudioAnalysis();
		};
	}, [isRecording]);

	const buttonColor = isRecording ? getVolumeColor(volume) : "#ffffff";
	const buttonStyle = {
		backgroundColor: buttonColor,
		borderColor: buttonColor,
		transform: isRecording ? `scale(${1 + volume * 0.2})` : "scale(1)", // Add size pulsing
		transition: "all 0.1s ease-out", // Faster transition for more responsive feel
		boxShadow: isRecording
			? `0 0 ${20 + volume * 30}px ${buttonColor}` // Dynamic glow effect
			: "none",
	};

	return (
		<div className="relative inline-block">
			<Button
				icon={<AudioOutlined className={isRecording ? "animate-pulse text-white" : ""} />}
				onClick={isRecording ? onStopRecording : onStartRecording}
				type={isRecording ? "primary" : "default"}
				danger={isRecording}
				disabled={disabled}
				style={buttonStyle}
				className={`relative ${isRecording ? "text-white" : ""}`}>
				<span className="relative z-10">{isRecording ? `Recording ${(volume * 100).toFixed(0)}%` : "Start Recording"}</span>

				{isRecording && (
					<div className="absolute inset-0 flex items-center justify-center">
						<span
							className="absolute w-full h-full animate-ping rounded-md"
							style={{
								backgroundColor: buttonColor,
								opacity: 0.5 + volume * 0.3,
							}}
						/>
					</div>
				)}
			</Button>

			{isRecording && (
				<div
					className="absolute -top-2 -right-2"
					style={{
						transform: `scale(${0.3 + volume})`,
						transition: "transform 0.05s ease-out",
					}}>
					<div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
				</div>
			)}
		</div>
	);
};

const AIProcessingIndicator = ({ isProcessing }) => {
	if (!isProcessing) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white p-8 rounded-lg shadow-xl relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />

				<div className="relative z-10">
					<div className="flex flex-col items-center gap-4">
						<div className="relative">
							<div
								className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin"
								style={{ animationDuration: "3s" }}
							/>
							<div
								className="absolute inset-0 border-4 border-purple-200 rounded-full animate-spin"
								style={{ animationDuration: "2s" }}
							/>
							<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse">
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-2 h-2 bg-white rounded-full animate-ping" />
								</div>
							</div>
						</div>
						<p className="text-lg font-semibold text-gray-700">Processing</p>
						<div className="flex gap-1">
							<span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
							<span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
							<span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const AIFormField = ({ children, isProcessing }) => {
	return (
		<div className="relative group">
			{/* AI Processing Indicator */}
			{isProcessing && (
				<div className="absolute -right-6 top-1/2 -translate-y-1/2">
					<div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
				</div>
			)}

			{/* Highlight Effect -  More noticeable */}
			<div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 via-purple-100/50 to-blue-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />

			{/* Actual Form Field */}
			<div className="relative z-10">{children}</div>
		</div>
	);
};

const AIFormContainer = ({ children, isProcessing }) => {
	return (
		<div className="relative p-6 bg-white rounded-lg shadow-lg">
			{/* Background Pattern */}
			<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50" />

			{/* Animated Border -  Added animation */}
			<div
				className={`absolute inset-0 border-2 border-dashed  rounded-lg ${
					isProcessing ? "border-blue-400 animate-pulse" : "border-gray-300"
				}`}
			/>

			{/* Processing Indicator in Corner - Keeping the ping */}
			{isProcessing && (
				<div className="absolute -top-2 -right-2 w-4 h-4">
					<div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
					<div className="absolute inset-0 bg-blue-500 rounded-full" />
				</div>
			)}

			{/* Content */}
			<div className="relative z-10">{children}</div>
		</div>
	);
};

// --- Main Component ---

const PatientList = () => {
	const { patients, loading, total, searchPatients, deletePatient, createPatient, updatePatient, setLoading } = usePatientStore();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedPatient, setSelectedPatient] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const genderOptions = ["Male", "Female"];
	const [genderFilter, setGenderFilter] = useState(null);
	const [profilePicture, setProfilePicture] = useState(null);
	const [existingProfilePicture, setExistingProfilePicture] = useState(null);
	const [previewVisible, setPreviewVisible] = useState(false);
	const [previewFile, setPreviewFile] = useState(null);
	const [fileType, setFileType] = useState(null);
	const [isRecording, setIsRecording] = useState(false);
	const mediaRecorder = useRef(null);
	const recordedChunks = useRef([]);
	const [isTranscribing, setIsTranscribing] = useState(false);
	const [transcriptionProgress, setTranscriptionProgress] = useState(0); // Progress state
	const { hasAuthority } = useAuthStore();

	useEffect(() => {
		fetchPatients();
	}, [page, size, searchParams, genderFilter]);

	const fetchPatients = async () => {
		setLoading(true);
		await searchPatients({
			...searchParams,
			page: page - 1,
			size,
			gender: genderFilter,
		});
		setLoading(false);
	};

	const transformImageUrl = (url) => {
		if (!url) return null;
		let fileUrl = url;
		if (fileUrl.startsWith(".")) {
			fileUrl = fileUrl.substring(1);
		}
		return `http://localhost:8080${fileUrl}`;
	};

	const transformImageUrlOnly = (url) => {
		if (!url) return null;
		let fileUrl = url;
		if (fileUrl.startsWith(".")) {
			fileUrl = fileUrl.substring(1);
		}
		return fileUrl;
	};

	const showModal = (patient) => {
		setExistingProfilePicture(null);
		setSelectedPatient(patient);

		if (patient) {
			if (patient.profilePictureURL) {
				setExistingProfilePicture({
					url: transformImageUrl(patient.profilePictureURL),
					originalUrl: transformImageUrlOnly(patient.profilePictureURL),
				});
			}
			form.setFieldsValue({
				...patient,
				dateOfBirth: patient.dateOfBirth ? moment(patient.dateOfBirth) : null,
			});
			setProfilePicture(null);
		} else {
			form.resetFields();
			setProfilePicture(null);
			setExistingProfilePicture(null);
		}

		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedPatient(null);
		form.resetFields();
		setProfilePicture(null);
		setExistingProfilePicture(null);
		setIsTranscribing(false);
		setTranscriptionProgress(0); // Reset progress
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			const formattedDateOfBirth = values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null;
			const patientData = { ...values, dateOfBirth: formattedDateOfBirth };
			let removedProfilePictureUrl = null;
			if (existingProfilePicture && !profilePicture) {
				removedProfilePictureUrl = existingProfilePicture.originalUrl;
			}

			if (selectedPatient) {
				if (!hasAuthority("UPDATE_PATIENT")) {
					console.error("User does not have permission to update patients.");
					return;
				}
				await updatePatient(selectedPatient.id, patientData, profilePicture ? profilePicture : null, removedProfilePictureUrl);
			} else {
				if (!hasAuthority("CREATE_PATIENT")) {
					console.error("User does not have permission to create patients.");
					return;
				}
				await createPatient(patientData, profilePicture);
			}

			fetchPatients();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedPatient(null);
			setProfilePicture(null);
			setExistingProfilePicture(null);
		} catch (error) {
			console.log("Error in handle form submit", error);
		}
	};

	const handleDelete = async (patientId) => {
		if (!hasAuthority("DELETE_PATIENT")) {
			console.error("User does not have permission to delete patients.");
			return;
		}
		try {
			await deletePatient(patientId);
			fetchPatients();
		} catch (error) {
			console.error("Error deleting patient:", error);
		}
	};

	const handleSearch = (value) => {
		setSearchParams({ searchTerm: value });
		setPage(1);
	};

	const handleGenderFilterChange = (value) => {
		setGenderFilter(value);
		setPage(1);
	};

	const handlePageChange = (newPage) => {
		setPage(newPage);
	};

	const handlePageSizeChange = (current, newSize) => {
		setPage(1);
		setSize(newSize);
	};

	const handleImageChange = ({ fileList }) => {
		if (fileList.length > 0) {
			setProfilePicture(fileList[0].originFileObj);
		} else {
			setProfilePicture(null);
		}
	};

	const handlePreview = (file) => {
		setPreviewFile(file.url);
		const fileExtension = file.url.split(".").pop().toLowerCase();
		if (["mp4", "mov", "avi", "mkv"].includes(fileExtension)) {
			setFileType("video");
		} else if (["png", "jpeg", "jpg", "webp"].includes(fileExtension)) {
			setFileType("image");
		} else {
			setFileType("unknown");
		}
		setPreviewVisible(true);
	};

	const handlePreviewCancel = () => {
		setPreviewVisible(false);
		setPreviewFile(null);
		setFileType(null);
	};

	const handleRemoveExistingFile = () => {
		setExistingProfilePicture(null);
		form.setFieldsValue({ profilePictureURL: null });
	};

	const canAddPatient = hasAuthority("CREATE_PATIENT");
	const canEditPatient = hasAuthority("UPDATE_PATIENT");
	const canDeletePatient = hasAuthority("DELETE_PATIENT");
	const canViewPatient = hasAuthority("READ_PATIENT");

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder.current = new MediaRecorder(stream);

			mediaRecorder.current.ondataavailable = (event) => {
				if (event.data.size > 0) {
					recordedChunks.current.push(event.data);
				}
			};

			mediaRecorder.current.onstop = async () => {
				const audioBlob = new Blob(recordedChunks.current, { type: "audio/webm" });
				recordedChunks.current = [];
				await transcribeAndFillPatientForm(audioBlob, form);
				setIsRecording(false);
			};

			mediaRecorder.current.start();
			setIsRecording(true);
		} catch (err) {
			console.error("Error accessing microphone:", err);
			notification.error({
				message: "Microphone Error",
				description: "Could not access the microphone.  Please ensure it is connected and permissions are granted.",
			});
		}
	};

	const stopRecording = () => {
		if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
			mediaRecorder.current.stop();
		}
	};

	const handleAudioUpload = async (file) => {
		await transcribeAndFillPatientForm(file, form);
	};

	async function transcribeAndFillPatientForm(audioBlob) {
		try {
			setIsTranscribing(true);
			setTranscriptionProgress(0); // Reset progress

			// Simulate progress (replace with actual progress if your backend supports it)
			const progressInterval = setInterval(() => {
				setTranscriptionProgress((prevProgress) => {
					const newProgress = prevProgress + 10; // Increase by 10% each interval
					return newProgress > 90 ? 90 : newProgress; // Cap at 90% until actual response
				});
			}, 250); // Update every 250ms

			const user = useAuthStore.getState().user;
			const formData = new FormData();
			formData.append("audio", audioBlob, "patient-audio.webm");
			const response = await fetch(`http://localhost:8080/api/patients/transcribe`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
				body: formData,
			});

			clearInterval(progressInterval); // Stop the interval
			setTranscriptionProgress(100); // Set to 100% after response

			if (!response.ok) {
				const errorData = await response.json();
				let errorMessage = `Server error: ${response.status}`;
				if (response.status === 400) {
					errorMessage += " - Bad Request. Check your input data.";
				} else if (response.status === 401) {
					errorMessage += " - Unauthorized. Please log in.";
				} else if (response.status === 403) {
					errorMessage += " - Forbidden. You don't have permission.";
				} else if (response.status === 500) {
					errorMessage += " - Internal Server Error.  Contact support.";
				}
				if (errorData && errorData.message) {
					errorMessage += ` Details: ${errorData.message}`;
				}
				throw new Error(errorMessage);
			}

			const data = await response.json();
			console.log("API Response:", data);

			if (!data) {
				notification.error({
					message: "API Response Error",
					description: "The API response is invalid.",
				});
				setIsTranscribing(false);
				return;
			}

			if (data.dateOfBirth && data.dateOfBirth !== "did not get") {
				try {
					data.dateOfBirth = moment(data.dateOfBirth, "YYYY-MM-DD");
					if (!data.dateOfBirth.isValid()) {
						throw new Error("Invalid date format from AI");
					}
				} catch (error) {
					notification.warn({
						message: "Invalid Date",
						description: "The date format from the AI was invalid. Please check manually.",
					});
					data.dateOfBirth = null;
				}
			}

			const expectedKeys = [
				"firstName",
				"lastName",
				"dateOfBirth",
				"gender",
				"address",
				"phoneNumber",
				"email",
				"medicalRecordNumber",
				"bloodType",
				"allergies",
				"medicalHistory",
			];
			const missingKeys = expectedKeys.filter((key) => !(key in data));

			if (missingKeys.length > 0) {
				notification.error({
					message: "JSON Validation Error",
					description: `The AI's response is missing the following fields: ${missingKeys.join(", ")}`,
				});
				setIsTranscribing(false);
				return;
			}

			const formDataParsed = {};
			for (const key in data) {
				if (data.hasOwnProperty(key)) {
					formDataParsed[key] = data[key] === "did not get" ? null : data[key];
				}
			}
			form.setFieldsValue(formDataParsed);

			notification.success({ message: "Form filled from audio." });
		} catch (error) {
			console.error("Error transcribing:", error);
			notification.error({
				message: "Transcription Error",
				description: `Failed to transcribe audio: ${error.message}`,
			});
		} finally {
			setIsTranscribing(false);
			setTranscriptionProgress(0); // Reset progress
		}
	}

	const columns = [
		{
			title: "Profile Picture",
			dataIndex: "profilePictureURL",
			key: "profilePictureURL",
			render: (text, record) => (
				<Link to={`/patients/${record.id}`}>
					<Avatar
						size={40}
						src={record.profilePictureURL ? transformImageUrl(record.profilePictureURL) : null}
						style={{ objectFit: "cover", border: "2px solid #ddd", borderColor: "snow" }}
					/>
				</Link>
			),
		},
		{
			title: "First Name",
			dataIndex: "firstName",
			key: "firstName",
		},
		{
			title: "Last Name",
			dataIndex: "lastName",
			key: "lastName",
		},
		{
			title: "Date of Birth",
			dataIndex: "dateOfBirth",
			key: "dateOfBirth",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD") : null),
		},
		{
			title: "Gender",
			dataIndex: "gender",
			key: "gender",
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{canViewPatient && (
						<Button type="default" icon={<EyeOutlined />} onClick={() => showModal(record)}>
							View
						</Button>
					)}
					{canDeletePatient && (
						<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
							Delete
						</Button>
					)}
				</Space>
			),
		},
	];

	return (
		<div className="main-container">
			<Title level={2}>Patient List</Title>
			<Space style={{ marginBottom: 16 }} direction="vertical" size="middle">
				<Input.Search placeholder="Search by first name, last name, blood type..." onSearch={handleSearch} style={{ width: "100%" }} />
				<Space>
					<Select placeholder="Filter by Gender" onChange={handleGenderFilterChange} allowClear style={{ width: 150 }}>
						{genderOptions.map((gender) => (
							<Option key={gender} value={gender}>
								{gender}
							</Option>
						))}
					</Select>
					{canAddPatient && (
						<Button type="default" onClick={() => showModal(null)}>
							Add New Patient
						</Button>
					)}
				</Space>
			</Space>

			<div style={{ overflowX: "auto", margin: "0 -16px" }}>
				<Table columns={columns} dataSource={patients} loading={loading} rowKey="id" pagination={false} />
			</div>

			<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
				<Pagination
					current={page}
					pageSize={size}
					total={total}
					showSizeChanger
					onChange={handlePageChange}
					onShowSizeChange={handlePageSizeChange}
				/>
			</div>

			{/* Modal */}
			<Modal
				title={selectedPatient ? "View Patient" : "Add Patient"}
				visible={isModalVisible}
				onCancel={handleCancel}
				width="70%"
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					(selectedPatient ? canEditPatient : canAddPatient) && (
						<Button key="submit" type="default" onClick={handleFormSubmit}>
							{selectedPatient ? "Update" : "Save"}
						</Button>
					),
				]}>
				<AIProcessingIndicator isProcessing={isTranscribing} />

				{/* Progress Bar (added back) */}
				{isTranscribing && (
					<div style={{ marginBottom: 20 }}>
						<Progress percent={transcriptionProgress} status="active" />
					</div>
				)}

				<AIFormContainer isProcessing={isTranscribing}>
					<Form form={form} layout="vertical">
						{/* Recording and Upload */}
						<Form.Item>
							<AIFormField isProcessing={isTranscribing}>
								<Space>
									<RecordingButton
										isRecording={isRecording}
										onStartRecording={startRecording}
										onStopRecording={stopRecording}
										disabled={!canAddPatient}
									/>
									<Upload accept="audio/*" showUploadList={false} beforeUpload={handleAudioUpload} disabled={!canAddPatient}>
										<Button icon={<UploadOutlined />} disabled={!canAddPatient}>
											Upload Audio
										</Button>
									</Upload>
								</Space>
							</AIFormField>
						</Form.Item>

						{/* Patient Details Form Fields */}
						<Row gutter={16}>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="First Name" name="firstName" rules={[{ required: true, message: "Please input first name" }]}>
										<Input readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: "Please input last name" }]}>
										<Input readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item
										label="Date of Birth"
										name="dateOfBirth"
										rules={[{ required: true, message: "Please input date of birth" }]}>
										<DatePicker style={{ width: "100%" }} disabled={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
						</Row>
						<Row gutter={16}>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Gender" name="gender" rules={[{ required: true, message: "Please select a gender" }]}>
										<Select placeholder="Select gender" disabled={!canEditPatient}>
											{genderOptions.map((gender) => (
												<Option key={gender} value={gender}>
													{gender}
												</Option>
											))}
										</Select>
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Address" name="address">
										<Input readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Phone Number" name="phoneNumber">
										<Input readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
						</Row>

						<Row gutter={16}>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Email" name="email">
										<Input readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Medical Record Number" name="medicalRecordNumber">
										<Input readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={12} md={8} lg={8}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Blood Type" name="bloodType">
										<Input readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
						</Row>

						<Row gutter={16}>
							<Col xs={24} sm={24} md={12} lg={12}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Allergies" name="allergies">
										<Input.TextArea rows={4} readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
							<Col xs={24} sm={24} md={12} lg={12}>
								<AIFormField isProcessing={isTranscribing}>
									<Form.Item label="Medical History" name="medicalHistory">
										<Input.TextArea rows={4} readOnly={!canEditPatient} />
									</Form.Item>
								</AIFormField>
							</Col>
						</Row>

						{/* Existing File Display */}
						{selectedPatient && existingProfilePicture && (
							<AIFormField isProcessing={isTranscribing}>
								<Form.Item label="Existing File">
									<div style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
										{["png", "jpeg", "jpg", "webp"].some((ext) => existingProfilePicture.url.toLowerCase().endsWith(ext)) ? (
											<Image
												src={existingProfilePicture.url}
												alt="existing-file"
												style={{ maxHeight: "100px", maxWidth: "200px", cursor: "pointer", borderRadius: "5px" }}
												onClick={() => handlePreview(existingProfilePicture)}
											/>
										) : (
											<video
												src={existingProfilePicture.url}
												alt="existing-file"
												style={{ maxHeight: "100px", maxWidth: "200px", cursor: "pointer", borderRadius: "5px" }}
												onClick={() => handlePreview(existingProfilePicture)}
											/>
										)}

										{canEditPatient && (
											<Button type="danger" style={{ marginLeft: "10px" }} size="small" onClick={handleRemoveExistingFile}>
												Remove
											</Button>
										)}
									</div>
								</Form.Item>
							</AIFormField>
						)}

						{/* Profile Picture Upload */}
						<AIFormField isProcessing={isTranscribing}>
							<Form.Item label="Profile Picture">
								<Upload
									listType="picture-card"
									fileList={
										profilePicture
											? [
													{
														uid: "-1",
														name: profilePicture.name,
														status: "done",
														url: URL.createObjectURL(profilePicture),
													},
											  ]
											: []
									}
									onChange={handleImageChange}
									beforeUpload={() => false}
									maxCount={1}
									disabled={!canEditPatient}>
									{!profilePicture && "+ Upload"}
								</Upload>
							</Form.Item>
						</AIFormField>
					</Form>
				</AIFormContainer>
			</Modal>

			{/* File Preview Modal */}
			<Modal visible={previewVisible} title="File Preview" footer={null} onCancel={handlePreviewCancel}>
				{fileType === "image" && previewFile && <Image src={previewFile} style={{ width: "100%", borderRadius: "5px" }} />}
				{fileType === "video" && previewFile && <video src={previewFile} controls style={{ width: "100%", borderRadius: "5px" }} />}
				{fileType === "unknown" && <Typography.Text>Unsupported file type</Typography.Text>}
			</Modal>
		</div>
	);
};

export default PatientList;
