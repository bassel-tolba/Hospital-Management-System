// themeConfig.js
import React, { useMemo } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";

const { defaultAlgorithm, darkAlgorithm } = antdTheme;

// --- Basic Color Token Definitions ---
export const colorTokens = {
	light: {
		isDark: false, // Explicitly state if it's a dark theme
		primaryColor: "#1890ff",
		successColor: "#52c41a",
		warningColor: "#faad14",
		errorColor: "#ff4d4f",
		infoColor: "#1677ff",
		// Ant Design v5 standard token names:
		layoutBackground: "#ffffff", // Was 'backgroundColor', used for token.colorBgLayout
		paperColor: "#ffffff", // Used for token.colorBgContainer
		textColor: "rgba(0, 0, 0, 0.88)",
		borderColor: "#d9d9d9",
		dividerColor: "#f0f0f0",
		// Button specific tokens can be part of components override if needed,
		// or Ant Design will derive them.
		// For general theme, Button.algorithm is not a standard token.
		// The main algorithm is set at the ConfigProvider level.
	},
	dark: {
		isDark: true,
		primaryColor: "#1677ff",
		successColor: "#52c41a",
		warningColor: "#faad14",
		errorColor: "#ff4d4f",
		infoColor: "#1677ff",
		layoutBackground: "#001529", // Was 'backgroundColor'
		paperColor: "#001f38", // Stays 'paperColor'
		textColor: "rgba(255, 255, 255, 0.85)",
		borderColor: "#424242",
		dividerColor: "#303030",
	},
	green: {
		isDark: false,
		primaryColor: "#52c41a",
		successColor: "#73d13d",
		warningColor: "#ffc53d",
		errorColor: "#ff7875",
		infoColor: "#69b1ff",
		layoutBackground: "#f6ffed",
		paperColor: "#ffffff",
		textColor: "rgba(0, 0, 0, 0.88)",
		borderColor: "#b7eb8f",
		dividerColor: "#d9f7be",
	},
	green_dark: {
		isDark: true,
		primaryColor: "#73d13d",
		successColor: "#95de64",
		warningColor: "#ffec3d",
		errorColor: "#ff7875",
		infoColor: "#69b1ff",
		layoutBackground: "#002329",
		paperColor: "#003a3e",
		textColor: "rgba(255, 255, 255, 0.85)",
		borderColor: "#389e0d",
		dividerColor: "#237804",
	},
	red: {
		isDark: false,
		primaryColor: "#f5222d",
		successColor: "#73d13d",
		warningColor: "#ffc53d",
		errorColor: "#ff4d4f",
		infoColor: "#4096ff",
		layoutBackground: "#fff1f0",
		paperColor: "#ffffff",
		textColor: "rgba(0, 0, 0, 0.88)",
		borderColor: "#ffccc7",
		dividerColor: "#ffa39e",
	},
	red_dark: {
		isDark: true,
		primaryColor: "#ff4d4f",
		successColor: "#73d13d",
		warningColor: "#ffc53d",
		errorColor: "#ff7875",
		infoColor: "#69b1ff",
		layoutBackground: "#2a1215",
		paperColor: "#40161a",
		textColor: "rgba(255, 255, 255, 0.85)",
		borderColor: "#a8071a",
		dividerColor: "#820014",
	},
};

// --- Complex Theme Definition ---
export const darkKillerTheme = {
	// This theme is passed to ComplexThemeProvider which handles the algorithm.
	// So, 'algorithm: darkAlgorithm' here is good for self-documentation
	// but ComplexThemeProvider will also apply it.
	algorithm: darkAlgorithm, // Good for clarity
	token: {
		colorPrimary: "#000000",
		colorInfo: "#000000",
		borderRadius: 10,
		colorLink: "#9bfff5",
		// Explicitly define layout and container backgrounds using standard names
		// that App.js looks for, or ensure App.js logic for dark_killer knows these specific names.
		// For consistency with App.js logic:
		layoutBackground: "#0e3939", // Renamed from colorBgBase for App.js
		paperColor: "#1a4f4f", // Renamed from colorBgContainer for App.js token construction (though antd components would use colorBgContainer if set)
		// OR, if you want to keep darkKillerTheme.token distinct:
		// colorBgBase: "#0e3939", // if App.js is modified to check this for dark_killer
		// colorBgContainer: "#1a4f4f", // this is standard antd token name

		colorTextBase: "#ffffff",
		colorBorder: "#2c6b6b",
		colorBorderSecondary: "#1f5a5a",
	},
	components: {
		Breadcrumb: {
			// colorText: 'rgba(255, 255, 255, 0.65)',
			// colorTextDescription: 'rgba(255, 255, 255, 0.45)'
		},
		Menu: {
			colorItemBg: "transparent",
			colorSubMenuTitle: "rgba(255, 255, 255, 0.85)",
			colorItemText: "rgba(255, 255, 255, 0.85)",
			colorItemTextHover: "#9bfff5",
			colorItemTextSelected: "#9bfff5",
			colorItemBgSelected: "rgba(155, 255, 245, 0.1)",
		},
		Table: {
			colorBgContainer: "#1a4f4f", // Good, this is standard
			colorTextHeading: "#ffffff",
		},
	},
};

// --- Complex Theme Provider Component ---
export const ComplexThemeProvider = ({ theme: themeProp, children }) => {
	// Renamed theme to themeProp to avoid conflict
	const mergedTheme = useMemo(() => {
		if (!themeProp) {
			return {};
		}
		// Ensure algorithm is included.
		// The themeProp itself (darkKillerTheme) already specifies its algorithm.
		return {
			algorithm:
				themeProp.algorithm ||
				(themeProp?.token?.colorBgBase && themeProp.token.colorBgBase.startsWith("#0") ? darkAlgorithm : defaultAlgorithm),
			token: themeProp.token || {},
			components: themeProp.components || {},
		};
	}, [themeProp]);

	return <ConfigProvider theme={mergedTheme}>{children}</ConfigProvider>;
};

// --- G2 Chart Themes Mapping ---
// (No changes needed here for layout theming, but ensure token names are consistent if used)
export const g2Themes = {
	light: {
		type: "light",
		color: colorTokens.light.primaryColor,
		viewFill: colorTokens.light.layoutBackground, // Use the new name
	},
	dark: {
		type: "dark",
		// color: colorTokens.dark.primaryColor,
		// viewFill: colorTokens.dark.layoutBackground, // Use the new name
	},
	green: {
		type: "light",
		color: colorTokens.green.primaryColor,
		viewFill: colorTokens.green.layoutBackground,
	},
	green_dark: {
		type: "dark",
		// color: colorTokens.green_dark.primaryColor,
		// viewFill: colorTokens.green_dark.layoutBackground,
	},
	red: {
		type: "light",
		color: colorTokens.red.primaryColor,
		viewFill: colorTokens.red.layoutBackground,
	},
	red_dark: {
		type: "dark",
		// color: colorTokens.red_dark.primaryColor,
		// viewFill: colorTokens.red_dark.layoutBackground,
	},
	dark_killer: {
		type: "dark",
		color: darkKillerTheme.token.colorPrimary,
		viewFill: darkKillerTheme.token.layoutBackground, // Use the new name
	},
};

// --- Helper function to generate full Ant Design theme configuration ---
// This function is GOOD. If App.js used this, it would simplify App.js.
// For now, App.js has its own logic.
export const getAntdThemeConfig = (themeName = "light") => {
	if (themeName === "dark_killer") {
		// For dark_killer, we need to ensure the token names align with what antd expects,
		// or that darkKillerTheme is already correctly structured.
		// The `darkKillerTheme` object itself should be directly usable.
		// We just need to ensure `layoutBackground` and `paperColor` are correctly sourced by App.js.
		const dkTheme = { ...darkKillerTheme }; // shallow copy
		// Ensure the primary Ant Design layout/container tokens are what App.js will use:
		dkTheme.token.colorBgLayout = dkTheme.token.layoutBackground || dkTheme.token.colorBgBase;
		dkTheme.token.colorBgContainer = dkTheme.token.paperColor || dkTheme.token.colorBgContainer;
		return dkTheme;
	}

	const currentTokens = colorTokens[themeName] || colorTokens.light;
	const isSystemDark = currentTokens.isDark; // Use the new 'isDark' flag

	return {
		algorithm: isSystemDark ? darkAlgorithm : defaultAlgorithm, // Simplified algorithm logic
		token: {
			colorPrimary: currentTokens.primaryColor,
			colorSuccess: currentTokens.successColor,
			colorWarning: currentTokens.warningColor,
			colorError: currentTokens.errorColor,
			colorInfo: currentTokens.infoColor,
			// Standard Ant Design token names:
			colorBgLayout: currentTokens.layoutBackground, // Mapped from your new 'layoutBackground'
			colorBgContainer: currentTokens.paperColor, // Mapped from your 'paperColor'
			colorBgElevated: currentTokens.paperColor, // Often same as paperColor
			colorTextBase: currentTokens.textColor,
			colorTextSecondary: currentTokens.textColor, // You might want a specific textSecondaryColor
			colorBorder: currentTokens.borderColor,
			colorBorderSecondary: currentTokens.dividerColor,
			borderRadius: 6,
			// Add other common tokens if App.js relies on them directly from currentTokens
		},
		components: {
			// Button component tokens are usually derived by Ant Design based on primaryColor and algorithm.
			// Explicit Button component overrides are for more fine-grained control.
			Layout: {
				// These component-specific overrides ensure the parts of the Layout component get the right colors
				// if the global tokens aren't perfectly picked up or if you need specific overrides.
				sider: { colorBgSider: currentTokens.paperColor }, // Sider often matches paper/container
				header: { colorBgHeader: currentTokens.paperColor, colorHeaderTitle: currentTokens.textColor },
				footer: { colorBgFooter: currentTokens.layoutBackground, colorTextFooter: currentTokens.textColor }, // Footer matches layout bg
			},
			Menu: {
				colorItemText: currentTokens.textColor,
				colorItemTextHover: currentTokens.primaryColor,
				colorItemTextSelected: currentTokens.primaryColor, // Or specific color
				colorItemBgSelected: isSystemDark ? "rgba(255, 255, 255, 0.1)" : currentTokens.primaryColor + "1A", // Common pattern for selected bg
				colorItemBgHover: isSystemDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
				...(isSystemDark
					? {
							colorItemText: "rgba(255, 255, 255, 0.75)",
							colorItemTextHover: "#ffffff",
							colorItemTextSelected: "#ffffff",
							colorSubmenuArrow: "rgba(255, 255, 255, 0.75)",
					  }
					: {}),
			},
		},
	};
};
