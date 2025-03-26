import React, { useMemo } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";

const { defaultAlgorithm, darkAlgorithm } = antdTheme;

// --- Basic Color Token Definitions ---
// Extracted directly from the original App.js
export const colorTokens = {
	light: {
		primaryColor: "#1890ff",
		successColor: "#52c41a",
		warningColor: "#faad14",
		errorColor: "#ff4d4f",
		infoColor: "#1677ff",
		backgroundColor: "#ffffff", // Changed from #fff for clarity
		textColor: "rgba(0, 0, 0, 0.88)",
		borderColor: "#d9d9d9",
		paperColor: "#ffffff", // Changed from #fff for clarity
		dividerColor: "#f0f0f0", // Changed from #e8e8e8 for consistency with antd v5
		Button: {
			colorPrimary: "#1677ff",
			algorithm: false, // Indicates it's NOT a dark theme variant for button logic
		},
	},
	dark: {
		primaryColor: "#1677ff", // Primary color can remain the same or change for dark mode
		successColor: "#52c41a",
		warningColor: "#faad14",
		errorColor: "#ff4d4f",
		infoColor: "#1677ff",
		backgroundColor: "#001529", // Common dark bg for layouts
		textColor: "rgba(255, 255, 255, 0.85)",
		borderColor: "#424242",
		paperColor: "#001f38", // Slightly lighter dark bg for cards/containers
		dividerColor: "#303030",
		Button: {
			colorPrimary: "#1677ff", // Often keep the same, Antd adjusts hover/active
			algorithm: true, // Indicates it IS a dark theme variant
		},
	},
	green: {
		primaryColor: "#52c41a",
		successColor: "#73d13d", // Brighter success
		warningColor: "#ffc53d",
		errorColor: "#ff7875",
		infoColor: "#69b1ff",
		backgroundColor: "#f6ffed", // Light green background
		textColor: "rgba(0, 0, 0, 0.88)",
		borderColor: "#b7eb8f",
		paperColor: "#ffffff", // Keep paper white usually
		dividerColor: "#d9f7be",
		Button: {
			colorPrimary: "#52c41a",
			algorithm: false,
		},
	},
	green_dark: {
		primaryColor: "#73d13d", // Brighter green for dark mode
		successColor: "#95de64",
		warningColor: "#ffec3d",
		errorColor: "#ff7875",
		infoColor: "#69b1ff",
		backgroundColor: "#002329", // Dark green-ish background
		textColor: "rgba(255, 255, 255, 0.85)",
		borderColor: "#389e0d", // Darker green border
		paperColor: "#003a3e", // Darker container background
		dividerColor: "#237804",
		Button: {
			colorPrimary: "#73d13d",
			algorithm: true,
		},
	},
	red: {
		primaryColor: "#f5222d", // Standard Antd Red-6
		successColor: "#73d13d",
		warningColor: "#ffc53d",
		errorColor: "#ff4d4f", // Standard Red-5
		infoColor: "#4096ff",
		backgroundColor: "#fff1f0", // Light red background
		textColor: "rgba(0, 0, 0, 0.88)",
		borderColor: "#ffccc7",
		paperColor: "#ffffff",
		dividerColor: "#ffa39e",
		Button: {
			colorPrimary: "#f5222d",
			algorithm: false,
		},
	},
	red_dark: {
		primaryColor: "#ff4d4f", // Red-5 for dark
		successColor: "#73d13d",
		warningColor: "#ffc53d",
		errorColor: "#ff7875", // Red-4 for dark error
		infoColor: "#69b1ff",
		backgroundColor: "#2a1215", // Dark red background
		textColor: "rgba(255, 255, 255, 0.85)",
		borderColor: "#a8071a", // Darker red border
		paperColor: "#40161a", // Darker container background
		dividerColor: "#820014",
		Button: {
			colorPrimary: "#ff4d4f",
			algorithm: true,
		},
	},
	// Add pink, blue, purple light/dark pairs similarly,
	// adjusting colors based on Ant Design color palettes if desired
	// For brevity, including only light/dark and green/green_dark, red/red_dark
	// You can copy the others from your original App.js if needed
};

// --- Complex Theme Definition ---
// Extracted directly from the original App.js
export const darkKillerTheme = {
	token: {
		colorPrimary: "#000000", // Pure black primary
		colorInfo: "#000000", // Info also black
		borderRadius: 10,
		colorLink: "#9bfff5", // Cyan link
		colorBgBase: "#0e3939", // Dark teal background
		colorTextBase: "#ffffff", // White text
		// Add other necessary tokens for consistency
		colorBgContainer: "#1a4f4f", // Slightly lighter container bg
		colorBorder: "#2c6b6b",
		colorBorderSecondary: "#1f5a5a",
	},
	components: {
		// Component customizations from original App.js...
		// Keeping a few examples for structure
		Breadcrumb: {
			// fontFamily: "Arcuata, serif, ...", // Consider if custom font is really needed
			// colorText: 'rgba(255, 255, 255, 0.65)', // Example customization
			// colorTextDescription: 'rgba(255, 255, 255, 0.45)'
		},
		Menu: {
			// fontFamily: "Arcuata, serif, ...",
			colorItemBg: "transparent",
			colorSubMenuTitle: "rgba(255, 255, 255, 0.85)",
			colorItemText: "rgba(255, 255, 255, 0.85)",
			colorItemTextHover: "#9bfff5", // Link color on hover
			colorItemTextSelected: "#9bfff5", // Link color when selected
			colorItemBgSelected: "rgba(155, 255, 245, 0.1)", // Subtle selected bg
		},
		Table: {
			// fontFamily: "Arcuata, serif, ...",
			colorBgContainer: "#1a4f4f", // Ensure table bg matches container
			colorTextHeading: "#ffffff",
			// fontWeightStrong: 800, // Use sparingly
		},
		// Add other component styles from your original definition
		// ...
	},
	// Important: Specify the algorithm for dark themes
	algorithm: darkAlgorithm,
};

// --- Complex Theme Provider Component ---
// Extracted directly from the original App.js
// This is useful if a theme (like darkKillerTheme) has a fundamentally different structure
// or needs the explicit darkAlgorithm applied outside the simple token mapping.
export const ComplexThemeProvider = ({ theme, children }) => {
	const mergedTheme = useMemo(() => {
		if (!theme) {
			return {}; // Return an empty object if no theme is provided
		}
		// Ensure algorithm is included, defaulting to dark if theme suggests it
		return {
			algorithm: theme.algorithm || (theme?.token?.colorBgBase && theme.token.colorBgBase.startsWith("#0") ? darkAlgorithm : defaultAlgorithm),
			token: theme.token || {},
			components: theme.components || {},
		};
	}, [theme]);

	return <ConfigProvider theme={mergedTheme}>{children}</ConfigProvider>;
};

// --- G2 Chart Themes Mapping ---
// Extracted directly from the original App.js
// Maps Ant Design theme names to G2 theme configurations
export const g2Themes = {
	light: {
		type: "light",
		color: colorTokens.light.primaryColor,
		viewFill: colorTokens.light.backgroundColor,
	},
	dark: {
		// Consider using G2's built-in 'dark' theme for better consistency
		type: "dark", // Use G2's dark theme
		// Or customize fully:
		// type: "classicDark",
		// color: colorTokens.dark.primaryColor,
		// viewFill: colorTokens.dark.backgroundColor,
	},
	green: {
		type: "light",
		color: colorTokens.green.primaryColor,
		viewFill: colorTokens.green.backgroundColor,
	},
	green_dark: {
		type: "dark", // Use G2's dark theme base
		// Customize primary color if needed
		// color: colorTokens.green_dark.primaryColor,
		// viewFill: colorTokens.green_dark.backgroundColor,
	},
	red: {
		type: "light",
		color: colorTokens.red.primaryColor,
		viewFill: colorTokens.red.backgroundColor,
	},
	red_dark: {
		type: "dark",
		// color: colorTokens.red_dark.primaryColor,
		// viewFill: colorTokens.red_dark.backgroundColor,
	},
	// Add mappings for pink, blue, purple etc. if needed

	dark_killer: {
		type: "dark", // Use G2's dark theme base
		color: darkKillerTheme.token.colorPrimary, // Use primary from darkKiller
		viewFill: darkKillerTheme.token.colorBgBase,
		// Potentially add more G2 theme overrides here to match dark_killer style
	},
};

// You might also want helper functions here, e.g., a function to get the full antd theme config
export const getAntdThemeConfig = (themeName = "light") => {
	if (themeName === "dark_killer") {
		return darkKillerTheme; // Return the complex object directly
	}

	const currentTokens = colorTokens[themeName] || colorTokens.light; // Default to light
	const isSystemDark = currentTokens.Button.algorithm;

	return {
		algorithm: isSystemDark ? [defaultAlgorithm, darkAlgorithm] : defaultAlgorithm,
		token: {
			colorPrimary: currentTokens.primaryColor,
			colorSuccess: currentTokens.successColor,
			colorWarning: currentTokens.warningColor,
			colorError: currentTokens.errorColor,
			colorInfo: currentTokens.infoColor,
			colorBgLayout: currentTokens.backgroundColor,
			colorBgContainer: currentTokens.paperColor,
			colorTextBase: currentTokens.textColor,
			colorBorder: currentTokens.borderColor,
			colorBorderSecondary: currentTokens.dividerColor,
			borderRadius: 6,
		},
		components: {
			Button: {
				colorPrimary: currentTokens.Button.colorPrimary,
				algorithm: currentTokens.Button.algorithm,
			},
			Layout: {
				sider: { colorBgLayout: currentTokens.backgroundColor },
				header: { colorBgHeader: currentTokens.paperColor, colorHeaderTitle: currentTokens.textColor },
				footer: { colorBgFooter: currentTokens.backgroundColor, colorTextFooter: currentTokens.textColor },
			},
			Menu: {
				colorItemText: currentTokens.textColor,
				colorItemTextHover: currentTokens.primaryColor,
				colorItemTextSelected: currentTokens.primaryColor,
				colorItemBgSelected: isSystemDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.04)",
				...(isSystemDark
					? {
							colorItemText: "rgba(255, 255, 255, 0.75)",
							colorItemTextHover: "#ffffff",
							colorItemTextSelected: "#ffffff",
							colorSubmenuArrow: "rgba(255, 255, 255, 0.75)",
					  }
					: {}),
			},
			// Add other default component overrides if needed
		},
	};
};
