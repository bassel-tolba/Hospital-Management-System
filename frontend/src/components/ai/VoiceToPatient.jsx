// components/ai/VoiceToPatient.js
import React, { useState, useEffect, useRef } from "react";
import { notification, Button, Upload, Progress, Space, Tooltip } from "antd";
import { UploadOutlined, AudioOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../services/auth.service"; // Adjust path as needed
import moment from "moment";

const getVolumeColor = (volume) => {
	if (volume < 0.1) return "#4ade80";
	if (volume < 0.2) return "#22c55e";
	if (volume < 0.3) return "#eab308";
	if (volume < 0.4) return "#f59e0b";
	if (volume < 0.5) return "#f97316";
	if (volume < 0.6) return "#ef4444";
	if (volume < 0.7) return "#dc2626";
	if (volume < 0.8) return "#b91c1c";
	if (volume < 0.9) return "#991b1b";
	return "#7f1d1d";
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

					let sum = 0;
					let peakCount = 0;
					const threshold = 128;

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
		transform: isRecording ? `scale(${1 + volume * 0.2})` : "scale(1)",
		transition: "all 0.1s ease-out",
		boxShadow: isRecording ? `0 0 ${20 + volume * 30}px ${buttonColor}` : "none",
		color: "red",
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

const VoiceToPatient = ({ onFormFill, disabled }) => {
	const [isRecording, setIsRecording] = useState(false);
	const [isTranscribing, setIsTranscribing] = useState(false);
	const [transcriptionProgress, setTranscriptionProgress] = useState(0);
	const mediaRecorder = useRef(null);
	const recordedChunks = useRef([]);
	const { hasAuthority } = useAuthStore();

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
				await transcribeAndFillPatientForm(audioBlob);
				setIsRecording(false);
			};

			mediaRecorder.current.start();
			setIsRecording(true);
		} catch (err) {
			console.error("Error accessing microphone:", err);
			notification.error({
				message: "Microphone Error",
				description: "Could not access the microphone. Please ensure it is connected and permissions are granted.",
			});
		}
	};

	const stopRecording = () => {
		if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
			mediaRecorder.current.stop();
		}
	};

	const handleAudioUpload = async (file) => {
		await transcribeAndFillPatientForm(file);
	};

	const transcribeAndFillPatientForm = async (audioBlob) => {
		try {
			setIsTranscribing(true);
			setTranscriptionProgress(0);

			const progressInterval = setInterval(() => {
				setTranscriptionProgress((prevProgress) => {
					const newProgress = prevProgress + 10;
					return newProgress > 90 ? 90 : newProgress;
				});
			}, 250);

			const user = useAuthStore.getState().user;
			const formData = new FormData();
			formData.append("audio", audioBlob, "patient-audio.webm");
			const response = await fetch(`/api/patients/transcribe`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
				body: formData,
			});

			clearInterval(progressInterval);
			setTranscriptionProgress(100);

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
					data.dateOfBirth = null; // or some other default
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

			onFormFill(formDataParsed);
			notification.success({ message: "Form filled from audio." });
		} catch (error) {
			console.error("Error transcribing:", error);
			notification.error({
				message: "Transcription Error",
				description: `Failed to transcribe audio: ${error.message}`,
			});
		} finally {
			setIsTranscribing(false);
			setTranscriptionProgress(0);
		}
	};

	return (
		<>
			<AIProcessingIndicator isProcessing={isTranscribing} />
			{isTranscribing && (
				<div style={{ marginBottom: 20 }}>
					<Progress percent={transcriptionProgress} status="active" />
				</div>
			)}
			<Space>
				<RecordingButton isRecording={isRecording} onStartRecording={startRecording} onStopRecording={stopRecording} disabled={disabled} />
				<Tooltip title="Upload Audio">
					<Upload accept="audio/*" showUploadList={false} beforeUpload={handleAudioUpload} disabled={disabled}>
						<Button icon={<UploadOutlined />} disabled={disabled} />
					</Upload>
				</Tooltip>
			</Space>
		</>
	);
};

export default VoiceToPatient;
