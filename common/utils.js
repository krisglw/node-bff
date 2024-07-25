const axios = require("axios");

module.exports = async function handleRequest(method, url, req, res) {
  // 创建一个 Axios 实例，并设置公共的 headers
  const instance = axios.create({
    headers: {
      Authorization: req.headers.authorization,
      "Tenant-Id": req.headers.tenantId,
      "Terminal-Type": "web",
    },
  });
  try {
    let response;
    switch (method) {
      case "GET":
        response = await instance.get(url);
        break;
      case "POST":
        response = await instance.post(url, req);
        break;
      case "DELETE":
        response = await instance.delete(url);
        break;
      case "PUT":
        response = await instance.put(url, req.body);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    // 将后端服务的响应发送回前端
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json(error || "something went wrong");
  }
};
