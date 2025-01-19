import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, IconButton, Box, Typography, useTheme } from "@mui/material";
import { ArrowBack, ArrowForward, Close } from "@mui/icons-material";
import styled from "@emotion/styled";

const DialogStyled = styled(Dialog)`
	& .MuiPaper-root {
		border-radius: 12px;
		background-color: ${({ theme }) => (theme.palette.mode === "light" ? "rgba(245, 245, 245, 0.95)" : "rgba(48, 48, 48, 0.95)")};
		backdrop-filter: blur(10px);
	}
`;

const MediaContainer = styled(Box)`
	display: flex;
	justify-content: center;
	align-items: center;
	max-height: 70vh;
`;

const SliderImage = styled("img")`
	max-width: 90%;
	max-height: 100%;
	object-fit: contain;
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	transition: transform 0.3s ease;
	&:hover {
		transform: scale(1.02);
	}
`;

const SliderVideo = styled("video")`
	max-width: 90%;
	max-height: 100%;
	object-fit: contain;
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	transition: transform 0.3s ease;
	&:hover {
		transform: scale(1.02);
	}
`;

const NavigationButton = styled(IconButton)`
	background: ${({ theme }) => (theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.6)" : "rgba(60, 60, 60, 0.6)")};
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	border-radius: 50%;
	border: 1px solid rgba(0, 0, 0, 0.1);

	&:hover {
		background: ${({ theme }) => (theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.8)" : "rgba(70, 70, 70, 0.8)")};
	}

	& svg {
		color: ${({ theme }) => (theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)")};
	}
`;

const CloseButton = styled(IconButton)`
	position: absolute;
	top: 10px;
	right: 10px;
	background-color: ${({ theme }) => (theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.8)" : "rgba(60, 60, 60, 0.8)")};
	border-radius: 50%;
	border: 1px solid rgba(0, 0, 0, 0.1);

	&:hover {
		background-color: ${({ theme }) => (theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(70, 70, 70, 0.9)")};
	}
	& svg {
		color: ${({ theme }) => (theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)")};
	}
`;

const LazyVideo = ({ src }) => {
	const videoRef = useRef(null);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && !isLoaded) {
					setIsLoaded(true);
				}
			});
		});

		if (videoRef.current) {
			observer.observe(videoRef.current);
		}

		return () => {
			if (videoRef.current) {
				observer.unobserve(videoRef.current);
			}
		};
	}, [isLoaded]);

	return <SliderVideo ref={videoRef} controls src={isLoaded ? src : null} />;
};

const ImageSlider = ({ open, images, onClose }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const theme = useTheme();

	const handlePrev = () => {
		setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
	};

	const handleNext = () => {
		setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
	};

	const cleanImageUrl = (url) => {
		if (url && url.startsWith(".")) {
			return url.substring(1);
		}
		return url;
	};

	const isVideo = (url) => {
		if (!url) return false;
		const lowerCaseUrl = url.toLowerCase();
		return lowerCaseUrl.endsWith(".mp4") || lowerCaseUrl.endsWith(".mov") || lowerCaseUrl.endsWith(".webm");
	};

	if (!images || images.length === 0) return null;
	const currentMedia = images[currentIndex];
	const mediaUrl = `http://localhost:8080${cleanImageUrl(currentMedia)}`;
	const isCurrentVideo = isVideo(currentMedia);

	return (
		<DialogStyled open={open} onClose={onClose} maxWidth="md" fullWidth theme={theme}>
			<DialogContent style={{ position: "relative", background: "transparent" }}>
				<CloseButton onClick={onClose} theme={theme}>
					<Close />
				</CloseButton>
				{images.length > 1 && (
					<NavigationButton style={{ left: 10 }} onClick={handlePrev} theme={theme}>
						<ArrowBack />
					</NavigationButton>
				)}
				<MediaContainer>
					{currentMedia &&
						(isCurrentVideo ? <LazyVideo src={mediaUrl} /> : <SliderImage src={mediaUrl} alt={`Media ${currentIndex + 1}`} />)}
					{!currentMedia && (
						<Typography variant="h5" color="textSecondary">
							No Media Available
						</Typography>
					)}
				</MediaContainer>
				{images.length > 1 && (
					<NavigationButton style={{ right: 10 }} onClick={handleNext} theme={theme}>
						<ArrowForward />
					</NavigationButton>
				)}
			</DialogContent>
		</DialogStyled>
	);
};

export default ImageSlider;
