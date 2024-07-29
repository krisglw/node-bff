var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");

var app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/api/data", (req, res) => {
  const users = [
    { id: 1, name: "Alice77" },
    { id: 2, name: "Bob8888" },
    { id: 3, name: "Charlie8888" },
  ];
  res.json(users);
});

const host = "http://192.168.33.41:50000";

// 中间件：根据请求路径转发到不同的后端服务
app.use("/courseTest", (req, res) => {
  //  将所有 /courseTest 开头的请求转发到后端服务
  const backendUrl = `${host}/api/ac-course/v1/courses/own-teacher-recent`;
  axios
    .get(backendUrl, {
      headers: {
        Authorization: req.headers.authorization,
        "Tenant-Id": req.headers.tenantId,
        "Terminal-Type": "web",
      },
    })
    .then((response) => {
      if (response.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((item) => ({
          courseId: item.courseId,
          courseName: item.courseName,
          teacherList: item.teacherList,
          classBeginSemesterName: item.courseSemester.classBeginSemesterName,
        }));
      }
      res.json(response.data);
    })
    .catch((error) => {
      if (error.response.data.code && error.response.data.code === 401) {
        return res.status(401).json(error.response.data);
      }
      return res.status(500).json(error || error.response.data);
    });
});

app.use("/mergeDataTest", (req, res) => {
  // 合并接口数据
  const backendUrl1 = `${host}/api/ac-course/v1/courses/teachers/power?courseId=${req.query.courseId}&courseSemesterId=${req.query.courseSemesterId}`;
  const backendUrl2 = `${host}/api/ac-course/v1/courses/teachers?courseId=${req.query.courseId}&courseSemesterId=${req.query.courseSemesterId}`;
  const headers = {
    Authorization: req.headers.authorization,
    "Tenant-Id": req.headers.tenantId,
    "Terminal-Type": "web",
  };
  Promise.all([
    axios.get(backendUrl1, { headers }),
    axios.get(backendUrl2, { headers }),
  ])
    .then((responses) => {
      const response1 = responses[0].data;
      const response2 = responses[1].data;
      const data = response2.data.map((item) => ({
        ...item,
        powerKey: response1.data.powerKey,
      }));
      res.json(data);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

app.use("/statisticsTest", (req, res) => {
  const backendUrl = `${host}/api/ac-classroom/v1/data-statistics/classrooms/${req.body.classroomId}/v2`;
  axios
    .post(backendUrl, req.body, {
      headers: {
        Authorization: req.headers.authorization,
        "Tenant-Id": req.headers.tenantId,
        "Terminal-Type": "web",
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.status(500).json(error || error.response.data);
    });
});

app.use("/testPutMethod", (req, res) => {
  const backendUrl = `${host}/api/ac-general/api/resource/puts`;
  axios
    .put(backendUrl, "", {
      headers: {
        Authorization: req.headers.authorization,
        "Tenant-Id": req.headers.tenantId,
        "Terminal-Type": "web",
      },
    })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.status(500).json(error || error.response.data);
    });
});

app.use("/testDeleteMethod", (req, res) => {
  const backendUrl = `${host}/api/ac-general/api/resource/move`;
  axios
    .delete(backendUrl, {
      headers: {
        Authorization: req.headers.authorization,
        "Tenant-Id": req.headers.tenantId,
        "Terminal-Type": "web",
      },
    })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.status(500).json(error || error.response.data);
    });
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
