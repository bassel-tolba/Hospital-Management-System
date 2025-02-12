import React from "react";
import styled from "styled-components";

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
	return (
		<Container>
			<Logo src="/aboutus-logo.png" alt="About Us Logo" />
			<TextContent>
				{/* Your content here */}
				<h1>About Pro Hospital</h1>
				<p>
					Welcome to Pro Hospital, where your health and well-being are our top priorities. We are dedicated to providing exceptional
					healthcare services to our community with compassion, expertise, and innovation.
				</p>
				<p>
					Our state-of-the-art facilities and highly skilled medical professionals work together to offer a comprehensive range of medical
					care, from routine check-ups to complex surgical procedures. We strive to create a warm and welcoming environment where patients
					and their families feel comfortable and cared for.
				</p>
				<p>
					At Pro Hospital, we are committed to continuous improvement and embrace the latest medical technologies to ensure our patients
					receive the highest quality care possible. Thank you for choosing us as your healthcare provider.
				</p>
			</TextContent>
		</Container>
	);
};

export default AboutUs;
