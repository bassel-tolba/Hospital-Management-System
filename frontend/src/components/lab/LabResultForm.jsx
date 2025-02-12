import React, { useState, useEffect } from "react";
import { Form, Button, Space, notification, Input, Table, Row, Col } from "antd";
import { useLabStore } from "../../services/lab.service";
import { v4 as uuidv4 } from "uuid";

const LabResultForm = ({ form, labTestId, onSubmit, onCancel, selectedLabResult, setLoading }) => {
	const { labTests, getLabResultById } = useLabStore();
	const [headers, setHeaders] = useState([]);
	const [rows, setRows] = useState([]);

	useEffect(() => {
		const fetchLabTest = async () => {
			if (labTestId) {
				try {
					setLoading(true);
					const currentLabTest = labTests?.find((test) => test.id === labTestId);

					if (currentLabTest?.structureMap?.table) {
						const { headers, rows: structRows } = currentLabTest.structureMap.table;
						setHeaders(headers);

						if (selectedLabResult) {
							const labResult = await getLabResultById(selectedLabResult.id);
							const resultMap = labResult.resultMap;

							if (resultMap) {
								const initialRows = structRows.map((row) => {
									const rowObj = { key: uuidv4() };
									headers.forEach((header, i) => {
										const initialValue =
											resultMap[row[0]]?.[header] != null ? resultMap[row[0]][header] : row[i] != null ? row[i] : null;
										rowObj[header] = initialValue;
										rowObj[`${header}_isEditable`] = initialValue === null || initialValue === "";
									});
									return rowObj;
								});

								setRows(initialRows);
							} else {
								const initialRows = structRows.map((row) => {
									const rowObj = { key: uuidv4() };
									headers.forEach((header, i) => {
										const initialValue = row[i] != null ? row[i] : null;
										rowObj[header] = initialValue;
										rowObj[`${header}_isEditable`] = initialValue === null || initialValue === "";
									});
									return rowObj;
								});
								setRows(initialRows);
							}
						} else {
							const initialRows = structRows.map((row) => {
								const rowObj = { key: uuidv4() };
								headers.forEach((header, i) => {
									const initialValue = row[i] != null ? row[i] : null;
									rowObj[header] = initialValue;
									rowObj[`${header}_isEditable`] = initialValue === null || initialValue === "";
								});
								return rowObj;
							});
							setRows(initialRows);
						}
					} else {
						setHeaders([]);
						setRows([]);
					}
				} catch (error) {
					handleError(error, "Failed to fetch lab test");
				} finally {
					setLoading(false);
				}
			}
		};
		fetchLabTest();
	}, [labTestId, labTests, form, selectedLabResult, getLabResultById, setLoading]);

	const handleInputChange = (key, header, value) => {
		setRows((prevRows) => {
			return prevRows.map((row) => {
				if (row.key === key) {
					return { ...row, [header]: value };
				}
				return row;
			});
		});
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();

			const resultMap = {};
			const structureRows = labTests?.find((test) => test.id === labTestId)?.structureMap?.table?.rows;

			rows.forEach((row, i) => {
				const key = structureRows[i][0]; // Assuming the first element is the key for resultMap
				resultMap[key] = { ...row };
				// Remove the isEditable fields from the result
				headers.forEach((header) => {
					delete resultMap[key][`${header}_isEditable`];
				});
			});

			const labResultData = {
				...values,
				resultDateTime: values.resultDateTime.format("YYYY-MM-DDTHH:mm:ss"),
				resultMap: resultMap,
			};
			await onSubmit(labResultData);
		} catch (error) {
			handleError(error, "Failed to submit form");
		}
	};

	const handleError = (error, message) => {
		notification.error({
			message: "Error",
			description: `${message}: ${error.message}`,
		});
		setLoading(false);
	};

	const columns = headers.map((header) => ({
		title: header,
		dataIndex: header,
		key: header,
		render: (text, record) => {
			const isEditable = record[`${header}_isEditable`];
			if (isEditable) {
				return <Input value={record[header]} onChange={(e) => handleInputChange(record.key, header, e.target.value)} />;
			}
			return <Input readOnly value={record[header]} />;
		},
	}));

	return (
		<>
			{rows?.length > 0 && <Table bordered columns={columns} dataSource={rows} pagination={false} scroll={{ x: true }} />}
			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				<Col xs={24} sm={12}>
					<Button block onClick={onCancel}>
						Cancel
					</Button>
				</Col>
				<Col xs={24} sm={12}>
					<Button type="default" block onClick={handleFormSubmit} loading={false}>
						{selectedLabResult ? "Update" : "Save"}
					</Button>
				</Col>
			</Row>
		</>
	);
};

export default LabResultForm;
