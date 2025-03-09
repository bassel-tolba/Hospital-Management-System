// Register.jsx
import React from "react";
import { Card, Space } from "antd";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import UserRegistration from "./UserRegistration";

// Animation variants (kept for the Register component's animation)
const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			when: "beforeChildren",
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { y: 20, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: { type: "spring", stiffness: 300, damping: 24 },
	},
};

// StyledCard (kept, but now using Ant Design's Card directly)
const StyledCard = styled(Card)`
	// Directly style the antd Card
	border-radius: 10px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	width: 100%;
	max-width: 700px;

	@media (max-width: 768px) {
		max-width: 95%;
	}
`;

const Register = () => {
	return (
		<AnimatePresence>
			<motion.div
				style={{ padding: 20, display: "flex", justifyContent: "center" }}
				initial="hidden"
				animate="visible"
				variants={containerVariants}>
				{/* Wrap with motion.div for the itemVariants */}
				<motion.div variants={itemVariants} style={{ width: "100%", maxWidth: "700px" }}>
					<StyledCard>
						{" "}
						{/* Use StyledCard, which now styles antd's Card */}
						<Space direction="vertical" size="large" style={{ width: "100%" }}>
							<UserRegistration />
						</Space>
					</StyledCard>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default Register;
