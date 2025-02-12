import React, { useState, useRef, useEffect } from "react";
import { Button, notification, Progress } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../services/auth.service"; // Adjust path if needed
import moment from "moment";

const VoiceToVitalSigns = ({ onDataExtracted, disabled, isUpdate = false, originalData = {} }) => {
	// Add isUpdate and originalData
	const [isRecording, setIsRecording] = useState(false);
	const [isTranscribing, setIsTranscribing] = useState(false);
	const [transcriptionProgress, setTranscriptionProgress] = useState(0);
	const mediaRecorder = useRef(null);
	const recordedChunks = useRef([]);
	const [volume, setVolume] = useState(0);
	const audioContext = useRef(null);
	const analyser = useRef(null);
	const dataArray = useRef(null);
	const animationFrameId = useRef(null);

	const { user } = useAuthStore();

	const VITAL_SIGNS_PROMPT = `...`; // Your original prompt (for new records) -  MAKE SURE TO FILL THIS IN.  It's important.
	const VITAL_SIGNS_UPDATE_PROMPT = `You are updating vital signs information based on audio input. The output MUST be a single JSON object...`; //Your update prompt  -  MAKE SURE TO FILL THIS IN.  It's important.

	// Microphone volume analysis (same as previous example)
	useEffect(() => {
		let stream = null;

		const startAudioAnalysis = async () => {
			// ... (same audio analysis code as before) ...
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

	const startRecording = async () => {
		// ... (same recording start logic) ...
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
				await transcribeAndExtract(audioBlob); // Call the transcription function
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
		// ... (same recording stop logic) ...
		if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
			mediaRecorder.current.stop();
		}
	};

	const transcribeAndExtract = async (audioBlob) => {
		try {
			setIsTranscribing(true);
			setTranscriptionProgress(0);

			const progressInterval = setInterval(() => {
				// Progress simulation - Doubled the time it takes to get to 90
				setTranscriptionProgress((prevProgress) => {
					const newProgress = prevProgress + 5; // Increment by 5 instead of 10
					return newProgress > 90 ? 90 : newProgress;
				});
			}, 250); // Keep interval the same, but increment less

			const formData = new FormData();
			formData.append("audio", audioBlob, "vitals-audio.webm");

			let url, method;
			if (isUpdate) {
				url = `http://localhost:8080/api/gemini/transcribe-vitals-update/${originalData.id}`;
				// Convert originalData to JSON string
				const originalDataJson = JSON.stringify(originalData);
				formData.append("originalData", originalDataJson); // Append as a string
			} else {
				url = `http://localhost:8080/api/gemini/transcribe-vitals`;
			}

			const response = await fetch(url, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${user?.token}`,
					// Don't set Content-Type for FormData
				},
				body: formData,
			});

			clearInterval(progressInterval);
			setTranscriptionProgress(100);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(`Transcription failed: ${errorData.message || response.statusText}`);
			}

			const data = await response.json();
			console.log("API Response:", data);
			// Basic validation and "did not get" handling (Keep this, it's still useful)
			const processedData = {};
			for (const key in data) {
				if (data.hasOwnProperty(key)) {
					processedData[key] = data[key] === "did not get" ? null : data[key];
				}
			}
			// Convert timestamp to moment object if it exists and is not "did not get"
			if (processedData.timestamp && processedData.timestamp !== "did not get") {
				processedData.timestamp = moment(processedData.timestamp, "YYYY-MM-DDTHH:mm:ss");
			}

			// Convert height and weight units
			processedData.heightUnit = processedData.heightUnit === "did not get" ? "cm" : processedData.heightUnit;
			processedData.weightUnit = processedData.weightUnit === "did not get" ? "kg" : processedData.weightUnit;
			processedData.glucoseUnit = processedData.glucoseUnit === "did not get" ? "mg/dL" : processedData.glucoseUnit;
			onDataExtracted(processedData);
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
	const buttonColor = isRecording ? getVolumeColor(volume) : "none";
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
		<>
			<Button
				type={isRecording ? "primary" : "default"}
				danger={isRecording}
				icon={<AudioOutlined />}
				onClick={isRecording ? stopRecording : startRecording}
				disabled={disabled || isTranscribing}
				style={buttonStyle}>
				{isRecording ? "Recording..." : "Record Vital Signs"}
			</Button>
			{isTranscribing && (
				<div style={{ marginTop: 8 }}>
					<Progress percent={transcriptionProgress} status="active" />
				</div>
			)}
		</>
	);
};

export default VoiceToVitalSigns;
