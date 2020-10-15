import React from "react";

import { Table, Layout, Menu, Button } from "antd";
import "./App.less";

const { Header, Content, Footer, Sider } = Layout;

const columns = [
  {
    title: "Build Date",
    dataIndex: "firmwareDate",
    key: "firmwareDate",
  },
  {
    title: "Version",
    dataIndex: "firmwareVersion",
    key: "firmwareVersion",
  },
  {
    title: "Security Version",
    dataIndex: "secVersion",
    key: "secVersion",
  },
  {
    title: "Download",
    dataIndex: "downloadUrl",
    key: "downloadUrl",
    render: (r) => (
      <Button href={r} type="primary">
        Download
      </Button>
    ),
  },
];

const useFetch = (url, options) => {
  const [response, setResponse] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const FetchData = async () => {
      try {
        const res = await fetch(url, options);
        const json = await res.json();
        setResponse(json);
      } catch (error) {
        setError(error);
      }
    };
    FetchData();
  }, [options, url]);
  return { response, error };
};

const Tabby = () => {
  const res = useFetch(`/signatures.json`, {});

  if (!res.response) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Table
        expandedRowRender={(record) => (
          <>
            <p style={{ margin: 0 }}>Signature: {record.signature}</p>
            <p style={{ margin: 0 }}>MD5: {record.md5}</p>
          </>
        )}
        rowKey={"signature"}
        dataSource={res.response}
        columns={columns}
      />
    </div>
  );
};

const App = () => (
  <Layout>
    <Sider breakpoint="lg" collapsedWidth="0">
      <div className="logo" />
      <Menu theme="dark" mode="inline" defaultSelectedKeys={["4"]}>
        <Menu.Item key="1">
          <span className="nav-text">nav 1</span>
        </Menu.Item>
        <Menu.Item key="2">
          <span className="nav-text">nav 2</span>
        </Menu.Item>
        <Menu.Item key="3">
          <span className="nav-text">nav 3</span>
        </Menu.Item>
        <Menu.Item key="4">
          <span className="nav-text">nav 4</span>
        </Menu.Item>
      </Menu>
    </Sider>
    <Layout>
      <Header style={{ background: "#fff", padding: 0 }} />
      <Content style={{ margin: "24px 16px 0" }}>
        <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
          <Tabby />
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Ant Design ©2018 Created by Ant UED
      </Footer>
    </Layout>
  </Layout>
);

export default App;
