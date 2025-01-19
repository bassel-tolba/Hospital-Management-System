import React, { useState } from "react";
import { Dropdown, Menu, Button, Space } from "antd";
import { MoreOutlined } from "@ant-design/icons";

const MoreMenu = () => {
	const [open, setOpen] = useState(false);
	const handleOpenChange = (flag) => {
		setOpen(flag);
	};
	const handleMenuClick = (e) => {
		console.log("click", e);
		setOpen(false);
	};

	const menu = (
		<Menu
			onClick={handleMenuClick}
			items={[
				{
					key: "1",
					label: "Refresh",
				},
				{
					key: "2",
					label: "Export",
				},
				{
					key: "3",
					label: "Settings",
				},
			]}
		/>
	);

	return (
		<Dropdown open={open} onOpenChange={handleOpenChange} overlay={menu} trigger={["click"]}>
			<Button type="text">
				<Space>
					<MoreOutlined />
				</Space>
			</Button>
		</Dropdown>
	);
};

export default MoreMenu;
