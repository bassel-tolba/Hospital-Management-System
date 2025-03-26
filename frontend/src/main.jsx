import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "antd/dist/reset.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "./i18n"; // Your i18n setup
const theme = createTheme();

ReactDOM.createRoot(document.getElementById("root")).render(
	// <React.StrictMode>
	// 	<ThemeProvider theme={theme}>
	// 		<App />
	// 	</ThemeProvider>
	// </React.StrictMode>

	// After (for testing only):
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<App />
		</ThemeProvider>
	</React.StrictMode>
);
