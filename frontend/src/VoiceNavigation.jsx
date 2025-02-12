// VoiceNavigation.js
import React, { useState, useRef, useEffect } from "react";
import { Button, notification } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import { useAuthStore } from "./services/auth.service";

const VoiceNavigation = ({ onNavigate }) => {
	const [isRecording, setIsRecording] = useState(false);
	const mediaRecorder = useRef(null);
	const recordedChunks = useRef([]);
	const [volume, setVolume] = useState(0); // Add volume state
	const audioContext = useRef(null);
	const analyser = useRef(null);
	const dataArray = useRef(null);
	const animationFrameId = useRef(null);

	const { user } = useAuthStore();

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
				await processNavigationRequest(audioBlob);
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

	const processNavigationRequest = async (audioBlob) => {
		try {
			const formData = new FormData();
			formData.append("audio", audioBlob, "navigation-audio.webm");

			const response = await fetch(`http://localhost:8080/api/gemini/navigate`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				let errorMessage = `Server error: ${response.status}`;
				if (errorData && errorData.message) {
					errorMessage += ` Details: ${errorData.message}`;
				}
				throw new Error(errorMessage);
			}

			const responseData = await response.json(); // Parse the *outer* response

			// Extract the inner JSON string
			const extractedJsonText = responseData.candidates[0].content.parts[0].text;
			const data = JSON.parse(extractedJsonText); // *Now* parse the inner JSON

			console.log("Navigation API Response:", data);

			if (data && data.success && data.pageName) {
				onNavigate(data.pageName.trim()); // Trim whitespace
			} else {
				notification.warning({
					message: "Navigation Failed",
					description: "Could not determine the page you requested. Please try again.",
				});
			}
		} catch (error) {
			console.error("Error processing navigation request:", error);
			notification.error({
				message: "Navigation Error",
				description: `Failed to process navigation: ${error.message}`,
			});
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
		<Button
			type={isRecording ? "primary" : "default"}
			// danger={isRecording} // Remove danger, as we handle color dynamically
			icon={<AudioOutlined />}
			onClick={isRecording ? stopRecording : startRecording}
			style={buttonStyle} // Apply dynamic styles
		>
			{isRecording ? "Recording..." : "Voice Navigate"}
		</Button>
	);
};

export default VoiceNavigation;
