import React, { useState, useEffect, useRef, useMemo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
	ClassicEditor,
	Autoformat,
	AutoImage,
	Autosave,
	Base64UploadAdapter,
	BlockQuote,
	Bold,
	CloudServices,
	Essentials,
	FontBackgroundColor,
	FontColor,
	FontSize,
	FullPage,
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
	Paragraph,
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
	FontFamily,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import "./App.css";

/**
 * Create a free account with a trial: https://portal.ckeditor.com/checkout?plan=free
 */
const LICENSE_KEY = "GPL"; // or <YOUR_LICENSE_KEY>.

const NAV_BAR_HEIGHT = 118;

const CKEditorComponent = ({ onChange, data }) => {
	const editorContainerRef = useRef(null);
	const editorRef = useRef(null);
	const [isLayoutReady, setIsLayoutReady] = useState(false);
	const [toolbarHeight, setToolbarHeight] = useState(0);

	useEffect(() => {
		const handleResize = () => {
			if (editorContainerRef.current) {
				const toolbarElement = editorContainerRef.current.querySelector(".ck.ck-toolbar");
				if (toolbarElement) {
					setToolbarHeight(toolbarElement.offsetHeight);
				}
			}
		};
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

	const { editorConfig } = useMemo(() => {
		if (!isLayoutReady) {
			return {};
		}

		return {
			editorConfig: {
				toolbar: {
					items: [
						"sourceEditing",
						"showBlocks",
						"textPartLanguage",
						"|",
						"heading",
						"|",
						"fontSize",
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
						"insertImageViaUrl",
						"mediaEmbed",
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
					FontFamily,
					Autoformat,
					AutoImage,
					Autosave,
					Base64UploadAdapter,
					BlockQuote,
					Bold,
					CloudServices,
					Essentials,
					FontBackgroundColor,
					FontColor,
					FontSize,
					FullPage,
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
					Paragraph,
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
				fontSize: {
					options: [10, 12, 14, "default", 18, 20, 22],
					supportAllValues: true,
				},
				heading: {
					options: [
						{
							model: "paragraph",
							title: "Paragraph",
							class: "ck-heading_paragraph",
						},
						{
							model: "heading1",
							view: "h1",
							title: "Heading 1",
							class: "ck-heading_heading1",
						},
						{
							model: "heading2",
							view: "h2",
							title: "Heading 2",
							class: "ck-heading_heading2",
						},
						{
							model: "heading3",
							view: "h3",
							title: "Heading 3",
							class: "ck-heading_heading3",
						},
						{
							model: "heading4",
							view: "h4",
							title: "Heading 4",
							class: "ck-heading_heading4",
						},
						{
							model: "heading5",
							view: "h5",
							title: "Heading 5",
							class: "ck-heading_heading5",
						},
						{
							model: "heading6",
							view: "h6",
							title: "Heading 6",
							class: "ck-heading_heading6",
						},
					],
				},
				fontFamily: {
					supportAllValues: true,
				},
				htmlSupport: {
					allow: [
						{
							name: /^.*$/,
							styles: true,
							attributes: true,
							classes: true,
						},
					],
				},
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
				initialData: data,
				licenseKey: LICENSE_KEY,
				link: {
					addTargetToExternalLinks: true,
					defaultProtocol: "https://",
					decorators: {
						toggleDownloadable: {
							mode: "manual",
							label: "Downloadable",
							attributes: {
								download: "file",
							},
						},
					},
				},
				list: {
					properties: {
						styles: true,
						startIndex: true,
						reversed: true,
					},
				},
				menuBar: {
					isVisible: true,
				},
				placeholder: "Type or paste your content here!",
				table: {
					contentToolbar: ["tableColumn", "tableRow", "mergeTableCells", "tableProperties", "tableCellProperties"],
				},
			},
		};
	}, [isLayoutReady, data]);

	return (
		<div className="main-container">
			<div className="editor-container editor-container_classic-editor" ref={editorContainerRef} style={{ paddingTop: `${toolbarHeight}px` }}>
				<div className="editor-container__toolbar" style={{ top: `${NAV_BAR_HEIGHT}px`, position: "sticky", zIndex: 100 }}></div>
				<div className="editor-container__editor">
					<div ref={editorRef}>
						{editorConfig && (
							<CKEditor
								editor={ClassicEditor}
								config={editorConfig}
								data={data}
								onChange={(event, editor) => {
									const data = editor.getData();
									onChange(data);
								}}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CKEditorComponent;
