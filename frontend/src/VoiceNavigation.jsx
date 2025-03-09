// VoiceNavigation.js
import React, { useState, useRef, useEffect } from "react";
import { Button, notification, Tooltip, Grid } from "antd";
import { AudioOutlined, AudioMutedOutlined, LoadingOutlined } from "@ant-design/icons";
import { useAuthStore } from "./services/auth.service";

const VoiceNavigation = ({ onNavigate }) => {
	const [isRecording, setIsRecording] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const mediaRecorder = useRef(null);
	const recordedChunks = useRef([]);
	const [volume, setVolume] = useState(0); // Add volume state
	const audioContext = useRef(null);
	const analyser = useRef(null);
	const dataArray = useRef(null);
	const animationFrameId = useRef(null);
	const silenceTimer = useRef(null);
	const lastVolumesRef = useRef([]);
	const { xs } = Grid.useBreakpoint();

	const { user } = useAuthStore();

	// Silence detection configuration
	const SILENCE_THRESHOLD = 0.1;
	const SILENCE_DURATION = 1000; // 2 seconds
	const VOLUME_MEMORY = 10; // Number of volume samples to keep

	const updateSilenceDetection = (currentVolume) => {
		lastVolumesRef.current.push(currentVolume);
		if (lastVolumesRef.current.length > VOLUME_MEMORY) {
			lastVolumesRef.current.shift();
		}

		const averageVolume = lastVolumesRef.current.reduce((a, b) => a + b, 0) / lastVolumesRef.current.length;

		if (averageVolume < SILENCE_THRESHOLD) {
			if (!silenceTimer.current) {
				silenceTimer.current = setTimeout(() => {
					if (isRecording && !isProcessing) {
						stopRecording();
					}
				}, SILENCE_DURATION);
			}
		} else {
			if (silenceTimer.current) {
				clearTimeout(silenceTimer.current);
				silenceTimer.current = null;
			}
		}
	};

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

					updateSilenceDetection(normalizedVolume);
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
		lastVolumesRef.current = [];
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
		if (silenceTimer.current) {
			clearTimeout(silenceTimer.current);
			silenceTimer.current = null;
		}
		if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
			setIsProcessing(true);
			mediaRecorder.current.stop();
		}
	};

	const processNavigationRequest = async (audioBlob) => {
		try {
			const formData = new FormData();
			formData.append("audio", audioBlob, "navigation-audio.webm");

			const response = await fetch(`/api/gemini/navigate`, {
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
		} finally {
			setIsProcessing(false);
		}
	};

	const getButtonStyle = () => {
		const baseStyle = {
			transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
		};

		if (isProcessing) {
			return {
				...baseStyle,
				animation: "pulse 2s infinite",
				backgroundColor: "#1890ff",
				borderColor: "#1890ff",
				transform: "scale(1.05)",
			};
		}

		if (isRecording) {
			const buttonColor = getVolumeColor(volume);
			return {
				...baseStyle,
				backgroundColor: buttonColor,
				borderColor: buttonColor,
				transform: `scale(${1 + volume * 0.2})`,
				boxShadow: `0 0 ${20 + volume * 30}px ${buttonColor}`,
			};
		}

		return baseStyle;
	};

	return (
		<Tooltip title={`${isRecording ? "Stop" : "Start"} voice navigation`}>
			<Button
				ghost
				icon={isProcessing ? <LoadingOutlined /> : isRecording ? <AudioOutlined /> : <AudioMutedOutlined />}
				onClick={isRecording ? stopRecording : startRecording}
				type={isRecording || isProcessing ? "primary" : "default"}
				style={getButtonStyle()}
				disabled={isProcessing}>
				{/* Only show text on larger screens */}
				{!xs && (isProcessing ? "Processing..." : isRecording ? "Recording..." : "Voice Navigate")}
			</Button>
			<style jsx>{`
				@keyframes pulse {
					0% {
						transform: scale(1);
						box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.7);
					}
					70% {
						transform: scale(1.05);
						box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
					}
					100% {
						transform: scale(1);
						box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
					}
				}
			`}</style>
		</Tooltip>
	);
};

export default VoiceNavigation;
