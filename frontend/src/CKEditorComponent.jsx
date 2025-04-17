import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Spin } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";

// --- Plugin Imports (Ensure ALL from V1 are here, especially FullPage) ---
import { ClassicEditor } from "ckeditor5";
import { Essentials, Paragraph, Bold, Italic, Underline, Link, List, Heading, BlockQuote } from "ckeditor5"; // Add core ones explicitly just in case
import {
	Autoformat,
	AutoImage,
	Autosave,
	Base64UploadAdapter,
	CloudServices,
	FontBackgroundColor,
	FontColor,
	FontSize,
	FontFamily,
	FullPage, // <<< --- CRITICAL: Make sure FullPage is included
	GeneralHtmlSupport,
	HtmlComment,
	HtmlEmbed,
	ImageBlock,
	ImageCaption,
	ImageInline,
	ImageInsert,
	ImageInsertViaUrl,
	ImageResize,
	ImageStyle,
	ImageTextAlternative,
	ImageToolbar,
	ImageUpload,
	Indent,
	IndentBlock,
	LinkImage,
	ListProperties,
	Markdown,
	MediaEmbed,
	PageBreak,
	PasteFromOffice,
	ShowBlocks,
	SourceEditing,
	Superscript,
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableToolbar,
	TextPartLanguage,
	TextTransformation,
	TodoList,
} from "ckeditor5";
// --- End Plugin Imports ---

import "ckeditor5/ckeditor5.css";

const LICENSE_KEY = "GPL";

// Merged Component
const CKEditorComponent = ({ data, onChange, onReady, readOnly, darkMode }) => {
	// --- State and Refs from V2 (Robust) ---
	const componentInstance = useRef(Symbol("CKEditorMergedInstance")).current;
	console.log(`[CKEditor ${componentInstance.description}] Instantiating/Rendering...`);
	const editorContainerRef = useRef(null);
	const editorRef = useRef(null);
	const [isLayoutReady, setIsLayoutReady] = useState(false);
	const [editorError, setEditorError] = useState(null); // Keep error state

	// --- Prop Logging from V2 ---
	useEffect(() => {
		console.log(
			`[CKEditor ${componentInstance.description}] Props update - Data length:`,
			data?.length,
			"Readonly:",
			readOnly,
			"DarkMode:",
			darkMode
		);
	}, [data, readOnly, darkMode, componentInstance]);

	// --- Layout Effect from V2 ---
	useEffect(() => {
		console.log(`[CKEditor ${componentInstance.description}] useEffect[]: Mounted. Setting layout ready.`);
		setIsLayoutReady(true);
		return () => {
			console.log(`[CKEditor ${componentInstance.description}] useEffect[]: Cleanup. Unmounting.`);
			setIsLayoutReady(false);
			setEditorError(null);
			editorRef.current = null;
		};
	}, [componentInstance]);

	// --- Editor Config calculation using V1's Config structure (with FullPage) ---
	const editorConfig = useMemo(() => {
		console.log(`[CKEditor ${componentInstance.description}] useMemo[isLayoutReady]: Recalculating config. isLayoutReady: ${isLayoutReady}`);
		if (!isLayoutReady) {
			console.log(`[CKEditor ${componentInstance.description}] useMemo: Layout not ready, null config.`);
			return null;
		}

		console.log(`[CKEditor ${componentInstance.description}] useMemo: Layout ready. Building config (using V1 structure with FullPage).`);
		// --- Configuration Object Copied Directly from Your Version 1 ---
		return {
			toolbar: {
				items: [
					// V1 Toolbar
					"sourceEditing",
					"showBlocks",
					"textPartLanguage",
					"|",
					"heading",
					"|",
					"fontSize",
					"fontFamily",
					"fontColor",
					"fontBackgroundColor",
					"|",
					"bold",
					"italic",
					"underline",
					"superscript",
					"|",
					"pageBreak",
					"link",
					"insertImage",
					/*"insertImageViaUrl",*/ "mediaEmbed",
					"insertTable",
					"blockQuote",
					"htmlEmbed",
					"|",
					"bulletedList",
					"numberedList",
					"todoList",
					"outdent",
					"indent",
				],
				shouldNotGroupWhenFull: false,
			},
			plugins: [
				// V1 Plugin List - CRUCIALLY includes FullPage
				// Add Essentials/Paragraph explicitly for good measure alongside V1 list
				Essentials,
				Paragraph,
				// The rest are from your V1 list
				FontFamily,
				Autoformat,
				AutoImage,
				Autosave,
				Base64UploadAdapter,
				BlockQuote,
				Bold,
				CloudServices,
				FontBackgroundColor,
				FontColor,
				FontSize,
				FullPage, // <<< --- ENSURE THIS IS PRESENT --- <<<
				GeneralHtmlSupport,
				Heading,
				HtmlComment,
				HtmlEmbed,
				ImageBlock,
				ImageCaption,
				ImageInline,
				ImageInsert,
				ImageInsertViaUrl,
				ImageResize,
				ImageStyle,
				ImageTextAlternative,
				ImageToolbar,
				ImageUpload,
				Indent,
				IndentBlock,
				Italic,
				Link,
				LinkImage,
				List,
				ListProperties,
				Markdown,
				MediaEmbed,
				PageBreak,
				PasteFromOffice,
				ShowBlocks,
				SourceEditing,
				Superscript,
				Table,
				TableCaption,
				TableCellProperties,
				TableColumnResize,
				TableProperties,
				TableToolbar,
				TextPartLanguage,
				TextTransformation,
				TodoList,
				Underline,
			],
			// --- Specific Plugin Configs from V1 ---
			fontSize: { options: [10, 12, 14, "default", 18, 20, 22], supportAllValues: true },
			heading: {
				options: [
					{ model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
					{ model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
					{ model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
					{ model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
					{ model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
					{ model: "heading5", view: "h5", title: "Heading 5", class: "ck-heading_heading5" },
					{ model: "heading6", view: "h6", title: "Heading 6", class: "ck-heading_heading6" },
				],
			},
			fontFamily: { supportAllValues: true },
			htmlSupport: { allow: [{ name: /.*/, styles: true, attributes: true, classes: true }] }, // V1's GHS config
			image: {
				toolbar: [
					"toggleImageCaption",
					"imageTextAlternative",
					"|",
					"imageStyle:inline",
					"imageStyle:wrapText",
					"imageStyle:breakText",
					"|",
					"resizeImage",
				],
			},
			licenseKey: LICENSE_KEY,
			link: {
				addTargetToExternalLinks: true,
				defaultProtocol: "https://",
				decorators: { toggleDownloadable: { mode: "manual", label: "Downloadable", attributes: { download: "file" } } },
			},
			list: { properties: { styles: true, startIndex: true, reversed: true } },
			placeholder: "Type or paste your content here!",
			table: { contentToolbar: ["tableColumn", "tableRow", "mergeTableCells", "tableProperties", "tableCellProperties"] },
		};
	}, [isLayoutReady, componentInstance]);

	// --- Callback Handlers from V2 (Robust using useCallback) ---
	const handleEditorReady = useCallback(
		(editor) => {
			console.log(`[CKEditor ${componentInstance.description}] CKEditor 'onReady' fired.`);
			editorRef.current = editor;
			// *** REMOVED: editor.isReadOnly = readOnly; -> Rely on disabled prop ***
			if (onReady) {
				console.log(`[CKEditor ${componentInstance.description}] Calling parent 'onReady'.`);
				onReady(editor); // Pass instance up
			} else {
				console.warn(`[CKEditor ${componentInstance.description}] 'onReady' fired, no parent handler provided.`);
			}
		},
		[onReady, componentInstance]
	); // readOnly removed from dependencies here

	const handleEditorChange = useCallback(
		(event, editor) => {
			// console.log(`[CKEditor ${componentInstance.description}] onChange`); // Noisy log
			if (onChange) {
				onChange(event, editor); // Pass event and instance up
			}
		},
		[onChange, componentInstance]
	);

	const handleEditorError = useCallback(
		(error, { phase }) => {
			console.error(`[CKEditor ${componentInstance.description}] CKEditor 'onError' fired. Phase: ${phase}`, error);
			setEditorError(`CKEditor Error (${phase}): ${error.message || String(error)}`);
		},
		[componentInstance]
	);

	// --- Render Logic from V2 ---
	console.log(
		`[CKEditor ${componentInstance.description}] Rendering. isLayoutReady: ${isLayoutReady}, config: ${!!editorConfig}, error: ${!!editorError}`
	);

	return (
		<div className={`ckeditor-component-container ${darkMode ? "ck-dark-mode" : ""}`} ref={editorContainerRef}>
			{/* Error display from V2 */}
			{editorError && (
				<div style={{ color: "red", padding: 8, border: "1px solid red", marginBottom: 8, borderRadius: "4px", background: "#fff2f0" }}>
					{editorError}
				</div>
			)}

			{/* Conditional rendering from V2 */}
			{isLayoutReady && editorConfig ? (
				<CKEditor
					editor={ClassicEditor}
					config={editorConfig} // Using V1's config structure (with FullPage)
					data={data || ""}
					disabled={readOnly} // Using disabled prop for readOnly
					onReady={handleEditorReady} // Using robust callback
					onChange={handleEditorChange} // Using robust callback
					onError={handleEditorError} // Using robust callback
					onFocus={() => {
						console.log(`[CKEditor ${componentInstance.description}] Focus`);
					}}
					onBlur={() => {
						console.log(`[CKEditor ${componentInstance.description}] Blur`);
					}}
				/>
			) : (
				<div
					style={{
						padding: "20px",
						textAlign: "center",
						border: "1px dashed #ccc",
						minHeight: "200px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: darkMode ? "#333" : "#fafafa",
						color: darkMode ? "#ccc" : "#888",
						borderRadius: "4px",
					}}>
					<Spin tip="Initializing Editor..." />
				</div>
			)}
		</div>
	);
};

export default CKEditorComponent;
