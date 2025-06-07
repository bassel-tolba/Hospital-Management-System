// VoiceNavigation.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button, notification, Tooltip, Grid } from "antd";
import { AudioOutlined, AudioMutedOutlined, LoadingOutlined } from "@ant-design/icons";
import { useAuthStore } from "./services/auth.service";
import axios from "axios";

const VoiceNavigation = ({ onNavigate }) => {
	const [isRecording, setIsRecording] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const mediaRecorder = useRef(null);
	const recordedChunks = useRef([]);
	const [volume, setVolume] = useState(0);
	const audioContext = useRef(null);
	const analyser = useRef(null);
	const dataArray = useRef(null);
	const animationFrameId = useRef(null);
	const silenceTimer = useRef(null);
	const lastVolumesRef = useRef([]);
	const { xs } = Grid.useBreakpoint() || {};
	const userToken = useAuthStore((state) => state.user?.token);

	const SILENCE_THRESHOLD = 0.1;
	const SILENCE_DURATION = 1500;
	const VOLUME_MEMORY = 10;

	// --- Silence Detection Logic (Keep as is) ---
	const updateSilenceDetection = useCallback(
		(currentVolume) => {
			/* ... */
		},
		[isRecording, isProcessing]
	);

	// --- Microphone Access & Volume Analysis Effect (Keep as is) ---
	useEffect(() => {
		/* ... */
	}, [isRecording, updateSilenceDetection]);

	// --- Helper to get button color based on volume (Keep as is) ---
	const getVolumeColor = (volume) => {
		/* ... */
	};

	// --- Start Recording Logic (Keep as is, but ensure onstop is correctly defined below) ---
	const startRecording = useCallback(async () => {
		if (isProcessing) return;

		lastVolumesRef.current = [];
		recordedChunks.current = [];
		if (silenceTimer.current) clearTimeout(silenceTimer.current);
		silenceTimer.current = null;

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const options = { mimeType: "audio/webm;codecs=opus" };
			if (!MediaRecorder.isTypeSupported(options.mimeType)) {
				console.warn(`${options.mimeType} not supported, using default.`);
				delete options.mimeType;
			}
			mediaRecorder.current = new MediaRecorder(stream, options);

			// --- Define onstop Handler HERE (Crucial Change) ---
			mediaRecorder.current.onstop = async () => {
				console.log("MediaRecorder stopped. Processing audio...");
				const actualMimeType = mediaRecorder.current?.mimeType || "audio/webm";
				const audioBlob = new Blob(recordedChunks.current, { type: actualMimeType });
				const currentChunks = [...recordedChunks.current]; // Copy chunks before clearing
				recordedChunks.current = []; // Clear chunks immediately

				// Clean up stream tracks *after* creating blob
				stream.getTracks().forEach((track) => track.stop());

				if (audioBlob.size > 0) {
					// Call process directly from onstop
					await processNavigationRequest(audioBlob);
				} else {
					console.warn("Recording stopped but audio blob size is 0.");
					// Still need to reset processing state if blob is empty
					setIsProcessing(false);
				}
				// This state update might happen *after* processNavigationRequest finishes or errors
				setIsRecording(false); // Update UI state once stopped and processed/failed
			};
			// --- End of onstop Handler Definition ---

			mediaRecorder.current.ondataavailable = (event) => {
				if (event.data.size > 0) recordedChunks.current.push(event.data);
			};

			mediaRecorder.current.onerror = (event) => {
				console.error("MediaRecorder error:", event.error);
				notification.error({ message: "Recording Error", description: `Error during recording: ${event.error.name}` });
				setIsRecording(false);
				setIsProcessing(false);
				if (silenceTimer.current) clearTimeout(silenceTimer.current);
				// Ensure stream is stopped on error too
				stream?.getTracks().forEach((track) => track.stop());
			};

			mediaRecorder.current.start();
			setIsRecording(true);
			console.log("MediaRecorder started.");
		} catch (err) {
			console.error("Error accessing microphone:", err);
			notification.error({ message: "Microphone Error", description: "Could not access microphone." });
			setIsRecording(false);
		}
	}, [isProcessing]); // Keep isProcessing dependency

	// --- Stop Recording Logic (SIMPLIFIED) ---
	const stopRecording = useCallback(() => {
		console.log("Stop recording action triggered...");
		if (silenceTimer.current) {
			clearTimeout(silenceTimer.current);
			silenceTimer.current = null;
		}

		// Check if recorder exists and is recording
		if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
			// Set processing state *immediately* to give visual feedback
			setIsProcessing(true);
			console.log("Requesting MediaRecorder.stop()...");
			// Simply call stop. The processing logic is now *inside* the onstop handler.
			mediaRecorder.current.stop();
		} else if (isRecording) {
			// Handle inconsistent state
			console.warn("Stop called, but MediaRecorder not recording. Resetting UI state.");
			setIsRecording(false);
			setIsProcessing(false); // Should already be false, but ensure it
		} else {
			console.log("Stop called, but not recording."); // Do nothing if not recording
		}
	}, [isRecording]); // Keep isRecording dependency

	// --- Process Navigation Request (Keep as is) ---
	const processNavigationRequest = async (audioBlob) => {
		console.log(`Processing audio blob of size: ${audioBlob.size}, type: ${audioBlob.type}`);
		// Assume isProcessing is true when this is called from onstop
		if (!isProcessing) {
			console.warn("processNavigationRequest called but isProcessing was false. Setting true.");
			setIsProcessing(true); // Ensure it's set if called unexpectedly
		}

		try {
			const formData = new FormData();
			formData.append("audio", audioBlob, "navigation-audio.webm");

			const response = await axios.post(`http://localhost:8080/api/gemini/navigate`, formData, {
				headers: { Authorization: `Bearer ${userToken}` },
				timeout: 30000,
			});

			const responseData = response.data;
			console.log("Parsed Backend Response:", responseData);

			if (responseData && responseData.success === true && responseData.pageName) {
				if (responseData.pageName.trim()) {
					onNavigate(responseData.pageName.trim());
				} else {
					notification.warning({ message: "Navigation Uncertain", description: "Could not determine page." });
				}
			} else {
				notification.warning({ message: "Navigation Failed", description: responseData?.message || "Could not determine page." });
			}
		} catch (error) {
			console.error("Error processing navigation request:", error);
			let errorMessage = "Failed to process navigation request.";
			if (axios.isCancel(error)) {
				errorMessage = "Request timed out.";
			} else if (error.response) {
				errorMessage = error.response.data?.message || `Server Error: ${error.response.status}`;
			} else if (error.request) {
				errorMessage = "No response from server.";
			} else {
				errorMessage = error.message;
			}
			notification.error({ message: "Navigation Error", description: errorMessage });
		} finally {
			// Reset processing state *after* request finishes/errors
			setIsProcessing(false);
			console.log("Processing finished.");
		}
	};

	// --- Button Style Calculation (Keep as is) ---
	const getButtonStyle = () => {
		/* ... */
	};

	// --- Render Logic (Keep as is) ---
	return (
		<>
			<Tooltip title={isProcessing ? "Processing..." : `${isRecording ? "Stop" : "Start"} voice navigation`}>
				<Button
					icon={isProcessing ? <LoadingOutlined /> : isRecording ? <AudioOutlined /> : <AudioMutedOutlined />}
					onClick={isRecording ? stopRecording : startRecording}
					shape="circle"
					style={getButtonStyle()}
					disabled={isProcessing}
					size="large"
					aria-label={isProcessing ? "Processing voice" : isRecording ? "Stop recording" : "Start voice navigation"}
				/>
			</Tooltip>
			<style jsx>{`
				@keyframes pulse {
					/* ... */
				}
			`}</style>
		</>
	);
};

export default VoiceNavigation;
