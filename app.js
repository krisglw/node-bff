var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const axios = require("axios");
const cors = require("cors");
const { Authorization } = require("./common/constants");

var app = express();
app.use(cors());

app.get("/api/data", (req, res) => {
  const users = [
    { id: 1, name: "Alice77" },
    { id: 2, name: "Bob8888" },
    { id: 3, name: "Charlie8888" },
  ];
  res.json(users);
});

// 中间件：根据请求路径转发到不同的后端服务
app.use("/service1", (req, res) => {
  console.log(req.headers, 22222222);
  //  将所有 /service1 开头的请求转发到后端服务1
  const backendUrl =
    "http://192.168.33.41:50000/api/ac-course/v1/courses/1750336057783644162";
  axios
    .get(backendUrl, {
      headers: {
        // Authorization: `Bearer ${Authorization}`,
        Authorization,
        "Tenant-Id": "9527",
        "Terminal-Type": "web",
      },
    })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      if (error.response.data.code === 401) {
        return res.status(401).json(error.response.data);
      }
      return res.status(500).json(error.response.data);
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
