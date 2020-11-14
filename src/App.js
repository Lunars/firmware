import React, { useRef } from "react";
import useSWR from "swr";
import {
  Tooltip,
  Space,
  Input,
  Table,
  Layout,
  Menu,
  Button,
  message,
  Typography,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { useWindowWidth } from "@react-hook/window-size";

import "./App.less";

const { Content, Footer, Sider } = Layout;
const { Text, Paragraph } = Typography;

const App = () => {
  const searchInput = useRef(null);

  function handleSearch(selectedKeys, confirm) {
    confirm();
  }

  function handleReset(clearFilters) {
    clearFilters();
  }

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered && "#1890ff" }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current.select());
      }
    },
  });

  const { data: response, error } = useSWR("/firmware/signatures.json");
  const loading = !response;

  if (!loading && error) {
    message.error("Could not load firmwares");
  }

  const columns = [
    {
      title: "Build Date",
      dataIndex: "firmwareDate",
      key: "firmwareDate",
      defaultSortOrder: "descend",
      sorter: (a, b) => new Date(a.firmwareDate) - new Date(b.firmwareDate),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: "10%",
      render: (b, a) => a.downloadUrl.split(".").splice(-1)[0],
      onFilter: (value, record) => record.downloadUrl.includes(value),
    },
    {
      title: "Version",
      dataIndex: "firmwareVersion",
      key: "firmwareVersion",
      ...getColumnSearchProps("firmwareVersion"),
    },
    {
      title: "Security Version",
      dataIndex: "secVersion",
      key: "secVersion",
      onFilter: (value, record) => record.secVersion.indexOf(value) === 0,
      sorter: (a, b) => a.secVersion - b.secVersion,
    },
    {
      title: "Signature",
      dataIndex: "signature",
      key: "signature",
      ellipsis: true,
      ...getColumnSearchProps("signature"),
    },
    {
      width: "5%",
      title: "",
      dataIndex: "downloadUrl",
      key: "downloadUrl",
      render: (r) => (
        <Tooltip title="download">
          <Button
            href={r}
            type="primary"
            shape="circle"
            icon={<DownloadOutlined />}
          />
        </Tooltip>
      ),
    },
  ];

  if (!loading && !error && Array.isArray(response) && response.length) {
    const versions = response.map((a) => a.secVersion);
    columns[3].filters = [...new Set(versions)]
      .filter(Boolean)
      .sort((a, b) => b - a)
      .map((n) => ({
        text: n,
        value: n,
      }));

    const types = response.map((a) => a.downloadUrl.split(".").splice(-1)[0]);
    columns[1].filters = [...new Set(types)]
      .filter(Boolean)
      .sort()
      .map((n) => ({
        text: n,
        value: n,
      }));
  }

  const windowWidth = useWindowWidth();

  const scrollProp =
    (windowWidth < 700 && {
      scroll: { x: 700 },
    }) ||
    {};

  return (
    <Layout>
      <Sider breakpoint="lg" collapsedWidth="0">
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["4"]}>
          <Menu.Item key="bulletins">
            <a href="/docs/bulletins/">Bulletins</a>
          </Menu.Item>
          <Menu.Item key="wirings">
            <a href="/docs/wirings/">Wirings</a>
          </Menu.Item>
          <Menu.Item key="more">
            <a href="/docs/more/">Misc docs</a>
          </Menu.Item>
          <Menu.Item key="sb">
            <a href="/docs/sb/">Service manual</a>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ margin: "24px 16px 0" }}>
          <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
            <Table
              {...scrollProp}
              loading={loading}
              expandedRowRender={(record) => (
                <>
                  <Paragraph>
                    Signature:{" "}
                    <Text code copyable>
                      {record.signature}
                    </Text>
                  </Paragraph>
                  <Paragraph>
                    MD5:{" "}
                    <Text code copyable>
                      {record.md5}
                    </Text>
                  </Paragraph>
                </>
              )}
              rowKey={"signature"}
              dataSource={response}
              columns={columns}
            />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          <a href="https://github.com/Lunars/tesla">
            <GithubOutlined /> Lunars Github
          </a>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
