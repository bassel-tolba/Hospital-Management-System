import React, { useState, useEffect } from "react";
import { Button, Input, Table, Space, Popconfirm, message } from "antd";
import { v4 as uuidv4 } from "uuid";

const LabTestTableBuilder = ({ onTableChange, initialTableData }) => {
	const [headers, setHeaders] = useState([]);
	const [rows, setRows] = useState([]);
	const [newHeaderName, setNewHeaderName] = useState("");
	const [newRowData, setNewRowData] = useState({});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		if (initialTableData) {
			setHeaders(initialTableData.headers?.map((header) => ({ key: uuidv4(), name: header })) || []);
			setRows(
				initialTableData.rows?.map((row) => {
					const rowObj = { key: uuidv4() };
					initialTableData.headers?.forEach((header, i) => {
						rowObj[header] = row[i];
					});
					return rowObj;
				}) || []
			);
		}
		setLoading(false);
	}, [initialTableData]);

	const addHeader = () => {
		if (newHeaderName.trim() !== "") {
			setHeaders([...headers, { key: uuidv4(), name: newHeaderName.trim() }]);
			setNewHeaderName("");
		}
	};

	const addRow = () => {
		if (headers.length === 0) {
			message.error("Please add a header first");
			return;
		}
		const newRow = { key: uuidv4() };
		headers.forEach((header) => {
			newRow[header.name] = newRowData[header.name] || "";
		});
		setRows([...rows, newRow]);
		setNewRowData({});
	};
	const handleHeaderChange = (key, value) => {
		setHeaders((prevHeaders) => {
			return prevHeaders.map((header) => {
				if (header.key === key) {
					return { ...header, name: value };
				}
				return header;
			});
		});
		setRows((prevRows) => {
			return prevRows.map((row) => {
				const newRow = { ...row };
				delete Object.assign(newRow, { [value]: newRow[headers.find((header) => header.key === key).name] })[
					headers.find((header) => header.key === key).name
				];
				return newRow;
			});
		});
	};
	const handleRowChange = (key, header, value) => {
		setRows((prevRows) => {
			return prevRows.map((row) => {
				if (row.key === key) {
					return { ...row, [header]: value };
				}
				return row;
			});
		});
	};
	const handleNewRowDataChange = (header, value) => {
		setNewRowData((prev) => ({ ...prev, [header]: value }));
	};
	const deleteRow = (key) => {
		setRows((prevRows) => prevRows.filter((row) => row.key !== key));
	};

	const handleGenerateJSON = () => {
		if (headers.length === 0) {
			message.error("Please add a header first");
			return;
		}
		if (rows.length === 0) {
			message.error("Please add a row first");
			return;
		}
		const jsonStructure = {
			headers: headers.map((header) => header.name),
			rows: rows.map((row) => {
				let rowArr = [];
				headers.forEach((header) => {
					rowArr.push(row[header.name]);
				});
				return rowArr;
			}),
		};
		onTableChange(jsonStructure);
	};
	const columns = headers.map((header) => ({
		title: <Input value={header.name} onChange={(e) => handleHeaderChange(header.key, e.target.value)} />,
		dataIndex: header.name,
		key: header.key,
		render: (_, record) => {
			return <Input value={record[header.name] || ""} onChange={(e) => handleRowChange(record.key, header.name, e.target.value)} />;
		},
	}));
	columns.push({
		title: "Action",
		key: "action",
		render: (_, record) => (
			<Space size="middle">
				<Popconfirm title="Are you sure to delete this row?" onConfirm={() => deleteRow(record.key)} okText="Yes" cancelText="No">
					<Button danger>Delete</Button>
				</Popconfirm>
			</Space>
		),
	});

	return (
		<div>
			{loading ? (
				<div>Loading...</div>
			) : (
				<Space direction="vertical">
					<div>
						<Input
							placeholder="Enter Header Name"
							value={newHeaderName}
							onChange={(e) => setNewHeaderName(e.target.value)}
							style={{ width: 200 }}
						/>
						<Button type="primary" onClick={addHeader}>
							Add Header
						</Button>
					</div>
					{headers.length > 0 && (
						<div>
							{headers.map((header) => {
								return (
									<Input
										key={header.key}
										placeholder={`Enter ${header.name}`}
										value={newRowData[header.name] || ""}
										onChange={(e) => handleNewRowDataChange(header.name, e.target.value)}
										style={{ width: 200, marginBottom: "10px", marginRight: "10px" }}
									/>
								);
							})}
							<Button type="primary" onClick={addRow}>
								Add Row
							</Button>
						</div>
					)}
					<Table bordered columns={columns} dataSource={rows} loading={loading} />
					<Button type="primary" onClick={handleGenerateJSON}>
						Generate JSON
					</Button>
				</Space>
			)}
		</div>
	);
};

export default LabTestTableBuilder;
