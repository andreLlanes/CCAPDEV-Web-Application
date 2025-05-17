const express = require("express");
const exphbs = require("express-handlebars");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");

const profileRoutes = require("./routes/profileRoutes");
const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");
const commentRoutes = require('./routes/commentRoutes');
const staticRoutes = require('./routes/staticRoutes');

const app = express();
const port = process.env.PORT || 5000;
//taskkill /F /IM node.exe
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const hbs = exphbs.create({
  extname: ".hbs",
  defaultLayout: "main",
  layoutsDir: __dirname + "/views/layouts",
  helpers: {
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    range: function (from, to) {
      const result = [];
      for (let i = from; i <= to; i++) {
        result.push(i);
      }
      return result;
    },
    ifEquals: function (a, b, options) {
      return a == b ? options.fn(this) : options.inverse(this);
    },
    json: function (context) {
      return JSON.stringify(context, null, 2);
    },
    formatDate: function (date) {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "./views");
app.use(express.static("public"));

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));


app.get("/", (req, res) => {
  res.redirect("/register");
});

app.use("/", authRoutes);
app.use("/", postRoutes);
app.use('/', profileRoutes);
app.use("/comments", commentRoutes);
app.use('/', staticRoutes);

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});