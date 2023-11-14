const User = require("../models/user");
const { validationResult } = require("express-validator");

const fs = require("fs");
const path = require("path");

exports.getEditUserProfile = (req, res, next) => {
  res.render("user/editUser", {
    pageTitle: "Edit User",
    user: req.user,
    errorMessage: "",
    oldInput: {
      name: "",
    },
  });
};

exports.postEditUserProfile = (req, res, next) => {
  const updatedName = req.body.name;
  const userId = req.body.userId;
  const image = req.file;

  const errors = validationResult(req);

  let imageToRemove;

  if (!errors.isEmpty()) {
    return res.render("user/editUser", {
      pageTitle: "Edit User",
      user: req.user,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        name: updatedName,
      },
    });
  }

  User.findById(userId)
    .then((user) => {
      user.name = updatedName;
      if (image) {
        imageToRemove = user.imageName;
        user.imageName = image.filename;
      }
      return user.save();
    })
    .then((updatedUser) => {
      req.session.user = updatedUser;
      req.session.save((err) => {
        if (imageToRemove) {
          const dedBin = path.resolve(__dirname, "..");
          fs.unlink(
            path.join(dedBin, "public", "chat_img", imageToRemove),
            (err) => {
              return res.redirect(`/`);
            }
          );
        } else {
          return res.redirect(`/`);
        }
      });
    })
    .catch((err) => {
      const erro = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};
