const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const csrf = require("csurf");
const {
  parsed: { MONGODB_URI },
} = require("dotenv").config();

//Middlewares
const isAuth = require("./middlewares/isAuth");
const isAccountValid = require("./middlewares/isAccountValid");

//routes
const authRouter = require("./routes/auth");
const chatRouter = require("./routes/chat");
const userRouter = require("./routes/user");

//DB
const User = require("./models/user");

//controllers
const errorController = require("./controllers/error");

//Utils
const findChat = require("./util/findChat");

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/chat_img"));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(":", "-").replace(":", "-") +
        "-" +
        file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("chatImage")
);
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "MySecret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.isLoggedIn = req.session.isLoggedIn;
  if (req.session.user) {
    res.locals.userName = req.session.user.name;
    res.locals.userId = req.session.user._id;
    res.locals.userImage = req.session.user.imageName;
  }
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

//Home page
app.get("/", isAuth, isAccountValid, (req, res, next) => {
  findChat
    .findAllChatsByUserId(req.user)
    .then((chats) => {
      res.render("home", {
        pageTitle: "Chat App",
        chats,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
});

app.use(authRouter);

app.use(chatRouter);

app.use(userRouter);

app.use("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render("500", {
    pageTitle: "Error",
  });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000, () => {
      console.log("Server running");
    });
  })
  .catch((err) => console.log(err));
