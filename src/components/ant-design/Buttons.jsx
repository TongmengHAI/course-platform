import React, { useState } from "react";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, Divider, Flex, Radio } from "antd";
const App = () => {
  const [size, setSize] = useState("large"); // default is 'medium'
  return (
    <>
      <Button
        type="primary"
        shape="round"
        icon={<DownloadOutlined />}
        size={size}
      >
        Download
      </Button>
    </>
  );
};
export default App;
