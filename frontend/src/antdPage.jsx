import React from "react";
import {
	Alert,
	Anchor,
	AutoComplete,
	Avatar,
	BackTop,
	Badge,
	Breadcrumb,
	Button,
	Calendar,
	Card,
	Carousel,
	Cascader,
	Checkbox,
	Collapse,
	ColorPicker,
	DatePicker,
	Descriptions,
	Divider,
	Drawer,
	Dropdown,
	Empty,
	Form,
	Input,
	InputNumber,
	Layout,
	List,
	Mentions,
	Menu,
	Modal,
	Pagination,
	Popconfirm,
	Popover,
	Progress,
	Radio,
	Rate,
	Result,
	Segmented,
	Select,
	Skeleton,
	Slider,
	Space,
	Spin,
	Statistic,
	Steps,
	Switch,
	Table,
	Tabs,
	Tag,
	TimePicker,
	Timeline,
	Tooltip,
	Transfer,
	Tree,
	TreeSelect,
	Typography,
	Upload,
} from "antd";
import { LaptopOutlined, NotificationOutlined, SmileOutlined, FrownOutlined, MenuOutlined } from "@ant-design/icons";

const { Header, Content, Footer, Sider } = Layout;
const { Title, Paragraph, Text, Link } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { TabPane } = Tabs;

const MyAntdPage = () => {
	const [form] = Form.useForm(); // For Form control

	// Data for Table
	const columns = [
		{ title: "Name", dataIndex: "name", key: "name" },
		{ title: "Age", dataIndex: "age", key: "age" },
		{ title: "Address", dataIndex: "address", key: "address" },
	];
	const data = [
		{ key: "1", name: "John Brown", age: 32, address: "New York No. 1 Lake Park" },
		{ key: "2", name: "Jim Green", age: 42, address: "London No. 1 Lake Park" },
		{ key: "3", name: "Joe Black", age: 32, address: "Sidney No. 1 Lake Park" },
	];

	// Options for Select, Cascader, TreeSelect
	const selectOptions = [
		{ value: "jack", label: "Jack" },
		{ value: "lucy", label: "Lucy" },
		{ value: "disabled", label: "Disabled", disabled: true },
	];
	const cascaderOptions = [
		{
			value: "zhejiang",
			label: "Zhejiang",
			children: [
				{
					value: "hangzhou",
					label: "Hangzhou",
					children: [
						{
							value: "xihu",
							label: "West Lake",
						},
					],
				},
			],
		},
		{
			value: "jiangsu",
			label: "Jiangsu",
			children: [
				{
					value: "nanjing",
					label: "Nanjing",
					children: [
						{
							value: "zhonghuamen",
							label: "Zhong Hua Men",
						},
					],
				},
			],
		},
	];
	const treeData = [
		{
			title: "Node1",
			value: "0-0",
			key: "0-0",
			children: [
				{
					title: "Child Node1",
					value: "0-0-0",
					key: "0-0-0",
				},
			],
		},
		{
			title: "Node2",
			value: "0-1",
			key: "0-1",
			children: [
				{
					title: "Child Node3",
					value: "0-1-0",
					key: "0-1-0",
				},
				{
					title: "Child Node4",
					value: "0-1-1",
					key: "0-1-1",
				},
			],
		},
	];

	const menuItems = [
		{
			key: "1",
			label: "Navigation One",
		},
		{
			key: "2",
			icon: <LaptopOutlined />,
			label: "Navigation Two",
		},
		{
			key: "sub1",
			icon: <NotificationOutlined />,
			label: "Submenu",
			children: [
				{ key: "3", label: "Option 3" },
				{ key: "4", label: "Option 4" },
			],
		},
	];

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Header style={{ background: "#fff", padding: 0 }}>
				<Title level={2} style={{ margin: "16px" }}>
					Ant Design Components Showcase
				</Title>
			</Header>

			<Layout>
				<Sider width={200} style={{ background: "#fff" }}>
					<Menu
						mode="inline"
						defaultSelectedKeys={["1"]}
						defaultOpenKeys={["sub1"]}
						style={{ height: "100%", borderRight: 0 }}
						items={menuItems}
					/>
				</Sider>

				<Content style={{ padding: "24px", overflow: "auto" }}>
					<Space direction="vertical" size="middle" style={{ display: "flex" }}>
						<Title level={3}>Alert</Title>
						<Alert message="Success Text" type="success" />
						<Alert message="Info Text" type="info" />
						<Alert message="Warning Text" type="warning" />
						<Alert message="Error Text" type="error" />
						<Title level={3}>Anchor</Title>
						<Anchor>
							<Anchor.Link href="#components-anchor-demo-basic" title="Basic demo" />
							<Anchor.Link href="#components-anchor-demo-static" title="Static demo" />
							<Anchor.Link href="#API" title="API">
								<Anchor.Link href="#Anchor-Props" title="Anchor Props" />
								<Anchor.Link href="#Link-Props" title="Link Props" />
							</Anchor.Link>
						</Anchor>
						<Title level={3}>AutoComplete</Title>
						<AutoComplete
							options={selectOptions}
							style={{ width: 200 }}
							placeholder="try to type `b`"
							filterOption={(inputValue, option) => (option?.label ?? "").toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
						/>
						<Title level={3}>Avatar</Title>
						<Avatar>U</Avatar>
						<Avatar size="large" style={{ color: "#f56a00", backgroundColor: "#fde3cf" }}>
							U
						</Avatar>
						<Title level={3}>BackTop</Title>
						<BackTop />
						Scroll down to see the bottom-right
						<strong style={{ color: "rgba(64, 64, 64, 0.6)" }}> gray </strong>
						button.
						<Title level={3}>Badge</Title>
						<Badge count={5}>
							<Avatar shape="square" size="large" />
						</Badge>
						<Badge count={0} showZero>
							<Avatar shape="square" size="large" />
						</Badge>
						<Badge dot={true}>
							<NotificationOutlined />
						</Badge>
						<Title level={3}>Breadcrumb</Title>
						<Breadcrumb>
							<Breadcrumb.Item>Home</Breadcrumb.Item>
							<Breadcrumb.Item>
								<a href="">Application Center</a>
							</Breadcrumb.Item>
							<Breadcrumb.Item>
								<a href="">Application List</a>
							</Breadcrumb.Item>
							<Breadcrumb.Item>An Application</Breadcrumb.Item>
						</Breadcrumb>
						<Title level={3}>Button</Title>
						<Button type="primary">Primary Button</Button>
						<Button>Default Button</Button>
						<Button type="dashed">Dashed Button</Button>
						<Button type="text">Text Button</Button>
						<Button type="link">Link Button</Button>
						<Title level={3}>Calendar</Title>
						<Calendar />
						<Title level={3}>Card</Title>
						<Card title="Card title" extra={<a href="#">More</a>} style={{ width: 300 }}>
							<p>Card content</p>
							<p>Card content</p>
							<p>Card content</p>
						</Card>
						<Title level={3}>Carousel</Title>
						<Carousel autoplay>
							<div>
								<h3 style={{ height: "160px", color: "#fff", lineHeight: "160px", textAlign: "center", background: "#364d79" }}>1</h3>
							</div>
							<div>
								<h3 style={{ height: "160px", color: "#fff", lineHeight: "160px", textAlign: "center", background: "#364d79" }}>2</h3>
							</div>
							<div>
								<h3 style={{ height: "160px", color: "#fff", lineHeight: "160px", textAlign: "center", background: "#364d79" }}>3</h3>
							</div>
							<div>
								<h3 style={{ height: "160px", color: "#fff", lineHeight: "160px", textAlign: "center", background: "#364d79" }}>4</h3>
							</div>
						</Carousel>
						<Title level={3}>Cascader</Title>
						<Cascader options={cascaderOptions} placeholder="Please select" />
						<Title level={3}>Checkbox</Title>
						<Checkbox>Checkbox</Checkbox>
						<Title level={3}>Collapse</Title>
						<Collapse defaultActiveKey={["1"]}>
							<Panel header="This is panel header 1" key="1">
								<p>Panel 1 Content</p>
							</Panel>
							<Panel header="This is panel header 2" key="2">
								<p>Panel 2 Content</p>
							</Panel>
							<Panel header="This is panel header 3" key="3">
								<p>Panel 3 Content</p>
							</Panel>
						</Collapse>
						<Title level={3}>ColorPicker</Title>
						<ColorPicker />
						<Title level={3}>DatePicker & RangePicker</Title>
						<DatePicker />
						<RangePicker />
						<Title level={3}>Descriptions</Title>
						<Descriptions title="User Info">
							<Descriptions.Item label="UserName">Zhou Maomao</Descriptions.Item>
							<Descriptions.Item label="Telephone">1810000000</Descriptions.Item>
							<Descriptions.Item label="Live">Hangzhou, Zhejiang</Descriptions.Item>
							<Descriptions.Item label="Address" span={2}>
								No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China
							</Descriptions.Item>
							<Descriptions.Item label="Remark">empty</Descriptions.Item>
						</Descriptions>
						<Title level={3}>Divider</Title>
						<Divider />
						Text
						<Divider type="vertical" />
						<a href="#">Link</a>
						<Divider type="vertical" />
						<a href="#">Link</a>
						<Title level={3}>Drawer</Title>
						<Button type="primary" onClick={() => Modal.info({ title: "Drawer (using Modal)", content: "Drawer Content" })}>
							Open Drawer (Simulated)
						</Button>
						<Title level={3}>Dropdown</Title>
						<Dropdown
							menu={{
								items: [
									{ key: "1", label: "1st item" },
									{ key: "2", label: "2nd item" },
									{ key: "3", label: "3rd item", disabled: true },
								],
							}}>
							<a onClick={(e) => e.preventDefault()}>
								<Space>
									Hover me
									<MenuOutlined />
								</Space>
							</a>
						</Dropdown>
						<Title level={3}>Empty</Title>
						<Empty />
						<Title level={3}>Form</Title>
						<Form form={form} name="basic" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} initialValues={{ remember: true }}>
							<Form.Item label="Username" name="username" rules={[{ required: true, message: "Please input your username!" }]}>
								<Input />
							</Form.Item>

							<Form.Item label="Password" name="password" rules={[{ required: true, message: "Please input your password!" }]}>
								<Input.Password />
							</Form.Item>
							<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
								<Button type="primary" htmlType="submit">
									Submit
								</Button>
							</Form.Item>
						</Form>
						<Title level={3}>Input</Title>
						<Input placeholder="Basic usage" />
						<TextArea rows={4} placeholder="Text Area" />
						<Title level={3}>InputNumber</Title>
						<InputNumber min={1} max={10} defaultValue={3} />
						<Title level={3}>List</Title>
						<List
							header={<div>List Header</div>}
							footer={<div>List Footer</div>}
							bordered
							dataSource={["Item 1", "Item 2", "Item 3"]}
							renderItem={(item) => <List.Item>{item}</List.Item>}
						/>
						<Title level={3}>Mentions</Title>
						<Mentions
							style={{ width: "100%" }}
							placeholder="You can use @ to ref user here"
							defaultValue="@afc163"
							options={selectOptions}
						/>
						<Title level={3}>Modal</Title>
						<Button type="primary" onClick={() => Modal.success({ title: "Modal", content: "Modal Content" })}>
							Open Modal
						</Button>
						<Title level={3}>Pagination</Title>
						<Pagination defaultCurrent={1} total={50} />
						<Title level={3}>Popconfirm</Title>
						<Popconfirm title="Are you sure delete this task?" okText="Yes" cancelText="No">
							<Button>Delete</Button>
						</Popconfirm>
						<Title level={3}>Popover</Title>
						<Popover content={"Popover Content"} title="Title">
							<Button type="primary">Hover me</Button>
						</Popover>
						<Title level={3}>Progress</Title>
						<Progress percent={30} />
						<Progress percent={50} status="active" />
						<Progress percent={70} status="exception" />
						<Progress percent={100} />
						<Progress type="circle" percent={75} />
						<Progress type="circle" percent={70} status="exception" />
						<Progress type="circle" percent={100} />
						<Title level={3}>Radio</Title>
						<Radio.Group>
							<Radio value={1}>A</Radio>
							<Radio value={2}>B</Radio>
							<Radio value={3}>C</Radio>
							<Radio value={4}>D</Radio>
						</Radio.Group>
						<Title level={3}>Rate</Title>
						<Rate />
						<Title level={3}>Result</Title>
						<Result
							status="success"
							title="Successfully Purchased Cloud Server ECS!"
							subTitle="Order number: 2017182818828182881 Cloud server configuration takes 1-5 minutes, please wait."
							extra={[
								<Button type="primary" key="console">
									Go Console
								</Button>,
								<Button key="buy">Buy Again</Button>,
							]}
						/>
						<Title level={3}>Segmented</Title>
						<Segmented options={["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"]} />
						<Title level={3}>Select</Title>
						<Select defaultValue="lucy" style={{ width: 120 }} options={selectOptions} />
						<Title level={3}>Skeleton</Title>
						<Skeleton />
						<Title level={3}>Slider</Title>
						<Slider defaultValue={30} />
						<Title level={3}>Spin</Title>
						<Spin tip="Loading..." size="large">
							<div style={{ padding: "20px", background: "rgba(0,0,0,0.05)", borderRadius: "4px" }}>Content to be loaded</div>
						</Spin>
						<Title level={3}>Statistic</Title>
						<Statistic title="Active Users" value={112893} />
						<Title level={3}>Steps</Title>
						<Steps current={1}>
							<Steps.Step title="Finished" description="This is a description." />
							<Steps.Step title="In Progress" subTitle="Left 00:00:08" description="This is a description." />
							<Steps.Step title="Waiting" description="This is a description." />
						</Steps>
						<Title level={3}>Switch</Title>
						<Switch defaultChecked />
						<Title level={3}>Table</Title>
						<Table columns={columns} dataSource={data} />
						<Title level={3}>Tabs</Title>
						<Tabs defaultActiveKey="1">
							<TabPane tab="Tab 1" key="1">
								Content of Tab Pane 1
							</TabPane>
							<TabPane tab="Tab 2" key="2">
								Content of Tab Pane 2
							</TabPane>
							<TabPane tab="Tab 3" key="3">
								Content of Tab Pane 3
							</TabPane>
						</Tabs>
						<Title level={3}>Tag</Title>
						<Tag color="magenta">magenta</Tag>
						<Tag color="red">red</Tag>
						<Tag color="volcano">volcano</Tag>
						<Tag color="orange">orange</Tag>
						<Tag color="gold">gold</Tag>
						<Title level={3}>TimePicker</Title>
						<TimePicker />
						<Title level={3}>Timeline</Title>
						<Timeline>
							<Timeline.Item>Create a services site 2015-09-01</Timeline.Item>
							<Timeline.Item>Solve initial network problems 2015-09-01</Timeline.Item>
							<Timeline.Item>Technical testing 2015-09-01</Timeline.Item>
							<Timeline.Item>Network problems being solved 2015-09-01</Timeline.Item>
						</Timeline>
						<Title level={3}>Tooltip</Title>
						<Tooltip title="prompt text">
							<span>Tooltip will show on mouse enter.</span>
						</Tooltip>
						<Title level={3}>Transfer</Title>
						<Transfer dataSource={[]} targetKeys={[]} />
						<Title level={3}>Tree</Title>
						<Tree
							checkable
							defaultExpandedKeys={["0-0-0", "0-0-1"]}
							defaultSelectedKeys={["0-0-0", "0-0-1"]}
							defaultCheckedKeys={["0-0-0", "0-0-1"]}
							treeData={treeData}
						/>
						<Title level={3}>TreeSelect</Title>
						<TreeSelect
							showSearch
							style={{ width: "100%" }}
							dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
							placeholder="Please select"
							allowClear
							treeDefaultExpandAll
							treeData={treeData}
						/>
						<Title level={3}>Typography</Title>
						<Title>h1. Ant Design</Title>
						<Title level={2}>h2. Ant Design</Title>
						<Paragraph>
							In the process of internal desktop applications development, many different design specs and implementations would be
							involved, which might cause designers's huge mental burden and repetitive work.
						</Paragraph>
						<Text strong>Strong Text</Text>
						<Link href="https://ant.design" target="_blank">
							Ant Design (Link)
						</Link>
						<Title level={3}>Upload</Title>
						<Upload></Upload>
					</Space>
				</Content>
			</Layout>

			<Footer style={{ textAlign: "center" }}>Ant Design Demo ©2023 Created by Ant UED</Footer>
		</Layout>
	);
};

export default MyAntdPage;
