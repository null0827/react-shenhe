import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
//import "@ant-design/v5-patch-for-react-19";
import {
  getPostsAPI,
  deletePostAPI,
  rejectPostAPI,
  approvePostAPI,
} from "@/lib/appwrite.ts";
import {
  Card,
  Breadcrumb,
  Form,
  Button,
  Radio,
  //Select,
  Popconfirm,
  Dropdown,
} from "antd";
// 引入汉化包 时间选择器显示中文
//import locale from "antd/es/date-picker/locale/zh_CN";

// 导入资源
import { Table, Tag, Space } from "antd";
//import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import img404 from "@/assets/error.png";
//import { useChannel } from "@/hooks/useChannel";
import { useEffect, useState } from "react";
//import { delArticleAPI, getArticleListAPI } from "@/apis/article";

//const { Option } = Select;
//const { RangePicker } = DatePicker;

const Article = () => {
  //const navigate = useNavigate();
  //const { channelList } = useChannel();
  // 准备列数据

  // 获取用户信息
  const userInfo = useSelector((state) => state.user.userInfo);
  const [reqData, setReqData] = useState({
    status: 0, // 默认显示待审核
    page: 1,
    per_page: 5,
  });

  const statusMap = {
    0: { text: "待审核", color: "warning" },
    1: { text: "审核通过", color: "success" },
    2: { text: "审核未通过", color: "error" },
  };
  // // 定义状态枚举
  // const status = {
  //   1: <Tag color="warning">待审核</Tag>,
  //   2: <Tag color="success">审核通过</Tag>,
  //   3: <Tag color="error">审核未通过</Tag>,
  // };
  const columns = [
    {
      title: "封面",
      dataIndex: "image_first_url",
      render: (url) => (
        <img src={url || img404} width={80} height={60} alt="封面" />
      ),
    },
    {
      title: "标题",
      dataIndex: "title",
      width: 220,
    },
    {
      title: "状态",
      dataIndex: "via_state",
      render: (state) => (
        <Tag color={statusMap[state].color}>{statusMap[state].text}</Tag>
      ),
    },
    { title: "作者", dataIndex: "creator_name" },

    {
      title: "操作",
      render: (data) => (
        <Space>
          <Dropdown
            menu={{
              items: [
                {
                  key: "approve",
                  label: (
                    <Popconfirm
                      title="确认通过审核？"
                      onConfirm={() => handleApprove(data.$id)}
                    >
                      <span>通过审核</span>
                    </Popconfirm>
                  ),
                },
                {
                  key: "reject",
                  label: (
                    <Popconfirm
                      title="确认拒绝审核？"
                      onConfirm={() => handleReject(data.$id)}
                    >
                      <span>拒绝审核</span>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <Button type="link">审核操作</Button>
          </Dropdown>

          {userInfo?.super_type === 1 && (
            <Popconfirm
              title="确认逻辑删除？"
              onConfirm={() => handleDelete(data.$id)}
            >
              <Button danger type="link">
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  // 获取帖子列表
  useEffect(() => {
    const getList = async () => {
      const res = await getPostsAPI(
        reqData.page,
        reqData.per_page,
        reqData.status
      );
      setList(res.documents);
      setCount(res.total);
    };
    getList();
  }, [reqData]);

  // // 2. 获取筛选数据
  // const onFinish = (formValue) => {
  //   console.log(formValue);
  //   // 3. 把表单收集到数据放到参数中(不可变的方式)
  //   setReqData({
  //     ...reqData,
  //     channel_id: formValue.channel_id,
  //     status: formValue.status,
  //     begin_pubdate: formValue.date[0].format("YYYY-MM-DD"),
  //     end_pubdate: formValue.date[1].format("YYYY-MM-DD"),
  //   });
  //   // 4. 重新拉取文章列表 + 渲染table逻辑重复的 - 复用
  //   // reqData依赖项发生变化 重复执行副作用函数
  // };
  // 2. 获取筛选数据
  // const onFinish = (formValue) => {
  //   console.log(formValue);
  //   // 检查日期是否存在，避免未选择日期时报错
  //   const begin_pubdate = formValue.date
  //     ? formValue.date[0].format("YYYY-MM-DD")
  //     : "";
  //   const end_pubdate = formValue.date
  //     ? formValue.date[1].format("YYYY-MM-DD")
  //     : "";

  //   // 更新筛选参数
  //   setReqData({
  //     ...reqData,
  //     channel_id: formValue.channel_id || "",
  //     status: formValue.status || "",
  //     begin_pubdate,
  //     end_pubdate,
  //     page: 1, // 重置分页为第一页
  //   });
  // };

  // 新增处理函数
  const handleApprove = async (postId) => {
    await approvePostAPI(postId);
    setReqData((prev) => ({ ...prev }));
  };

  const handleReject = async (postId) => {
    await rejectPostAPI(postId);
    setReqData((prev) => ({ ...prev }));
  };

  // 处理删除
  const handleDelete = async (postId) => {
    await deletePostAPI(postId);
    setReqData((prev) => ({ ...prev })); // 刷新列表
  };

  // 筛选表单提交
  const onFinish = (values) => {
    setReqData({
      ...reqData,
      status: values.status,
      page: 1, // 重置到第一页
    });
  };

  // 分页
  const onPageChange = (page) => {
    console.log(page);
    // 修改参数依赖项 引发数据的重新获取列表渲染
    setReqData({
      ...reqData,
      page,
    });
  };

  // // 删除
  // const onConfirm = async (data) => {
  //   console.log("删除点击了", data);
  //   await delArticleAPI(data.id);
  //   setReqData({
  //     ...reqData,
  //   });
  // };

  return (
    <div>
      <Card
        title={
          <Breadcrumb
            items={[
              { title: <Link to={"/"}>首页</Link> },
              { title: "文章列表" },
            ]}
          />
        }
        style={{ marginBottom: 20 }}
      >
        <Form onFinish={onFinish} initialValues={{ status: 0 }}>
          <Form.Item label="审核状态" name="status">
            <Radio.Group>
              <Radio value={0}>待审核</Radio>
              <Radio value={1}>审核通过</Radio>
              <Radio value={2}>审核未通过</Radio>
            </Radio.Group>
          </Form.Item>

          {/* <Form.Item label="频道" name="channel_id">
            <Select placeholder="请选择文章频道" style={{ width: 120 }}>
              {channelList.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item> */}

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginLeft: 40 }}>
              筛选
            </Button>
          </Form.Item>
        </Form>
      </Card>
      {/* 表格区域 */}
      <Card title={`根据筛选条件共查询到 ${count} 条结果：`}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          pagination={{
            total: count,
            pageSize: reqData.per_page,
            onChange: onPageChange,
          }}
        />
      </Card>
    </div>
  );
};

export default Article;
