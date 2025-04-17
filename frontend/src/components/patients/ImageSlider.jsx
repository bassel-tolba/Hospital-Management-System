// ImageSlider.js
import React, { useState, useEffect } from "react";
import { Modal, Carousel, Spin, Radio, Image } from "antd";
import "./ImageSlider.css";
import { useTranslation } from "react-i18next";

const ImageSlider = React.memo(({ open, onClose, data }) => {
	const { t } = useTranslation(); // Initialize
	// Use React.memo
	const [loading, setLoading] = useState(true);
	const [filteredMedia, setFilteredMedia] = useState([]);
	const [mediaTypeFilter, setMediaTypeFilter] = useState("All");

	useEffect(() => {
		if (!data || !data.imageUrls) {
			setLoading(false); // Ensure loading is set to false even if there's no data
			return;
		}

		setLoading(true);
		let filtered = data.imageUrls;
		setFilteredMedia(filtered);
		setLoading(false);
	}, [data]);

	useEffect(() => {
		if (!data || !data.imageUrls) {
			return;
		}
		setLoading(true);

		let filtered;
		if (mediaTypeFilter === "All") {
			filtered = data.imageUrls;
		} else {
			filtered = data.imageUrls.filter((url) => {
				const isVideo = [".mp4", ".webm", ".ogg"].some((ext) => url.toLowerCase().endsWith(ext));
				return (mediaTypeFilter === "Image" && !isVideo) || (mediaTypeFilter === "Video" && isVideo);
			});
		}

		setFilteredMedia(filtered);
		setLoading(false);
	}, [mediaTypeFilter, data]);

	if (!data || !data.imageUrls || data.imageUrls.length === 0) {
		return null;
	}

	const handleFilterChange = (e) => {
		setMediaTypeFilter(e.target.value);
	};

	const getVideoType = (url) => {
		const ext = url.toLowerCase().split(".").pop();
		switch (ext) {
			case "mp4":
				return "video/mp4";
			case "webm":
				return "video/webm";
			case "ogg":
				return "video/ogg";
			default:
				return ""; // Unknown type
		}
	};

	const renderMediaItem = (url, index) => {
		const isVideo = [".mp4", ".webm", ".ogg"].some((ext) => url.toLowerCase().endsWith(ext));

		return (
			<div key={url} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
				{" "}
				{/* Use the URL as key */}
				{isVideo ? (
					<video
						controls
						preload="metadata" // Optimized preload setting
						style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain" }}
						onError={() => {
							console.error("Error loading video:", url);
						}}>
						<source src={url} type={getVideoType(url)} />
						{t("browser-not-support-video")}
					</video>
				) : (
					<Image src={url} style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain" }} preview={false} />
				)}
			</div>
		);
	};

	const carouselSettings = {
		dots: filteredMedia.length > 1,
		arrows: true,
		className: "custom-carousel",
	};

	return (
		<Modal open={open} onCancel={onClose} title={t("media-viewer")} width={800} style={{ top: 20 }} footer={null}>
			<div style={{ marginBottom: 16, textAlign: "center" }}>
				<Radio.Group value={mediaTypeFilter} onChange={handleFilterChange}>
					<Radio.Button value="All">{t("all")}</Radio.Button>
					<Radio.Button value="Image">{t("image")}</Radio.Button>
					<Radio.Button value="Video">{t("video")}</Radio.Button>
				</Radio.Group>
			</div>
			<div style={{ position: "relative", height: "60vh" }}>
				{loading ? (
					<div
						style={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
						}}>
						<Spin size="large" />
					</div>
				) : (
					<Carousel {...carouselSettings}>{filteredMedia.map((url, index) => renderMediaItem(url, index))}</Carousel>
				)}
			</div>
		</Modal>
	);
});

export default ImageSlider;
