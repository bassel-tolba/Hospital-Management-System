import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next"; // Import

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20px;
`;

const Logo = styled.img`
	width: 200px;
	margin-bottom: 20px;
`;

const TextContent = styled.div`
	max-width: 800px;
	text-align: center;
	margin-top: 10px;
`;

const AboutUs = () => {
	const { t } = useTranslation(); // Initialize

	return (
		<Container>
			<Logo src="/aboutus-logo.png" alt="About Us Logo" />
			<TextContent>
				{/* Your content here */}
				<h1>{t("about-pro-hospital")}</h1>
				<p>{t("welcome-message")}</p>
				<p>{t("facilities-message")}</p>
				<p>{t("commitment-message")}</p>
			</TextContent>
		</Container>
	);
};

export default AboutUs;
