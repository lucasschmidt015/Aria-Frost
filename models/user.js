const mongoose = require("mongoose");
const cryptoGenerate = require("../util/cryptoGenerate");
const nodemailer = require("nodemailer");
const {
  parsed: { USER_EMAIL_SERVER, PASS_EMAIL_SERVER },
} = require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: USER_EMAIL_SERVER,
    pass: PASS_EMAIL_SERVER,
  },
});

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  imageName: {
    type: String,
    required: false,
  },
  verificated: {
    type: Boolean,
    required: false,
  },
  verificationToken: {
    type: String,
    required: false,
  },
  verificationTokenExpiration: {
    type: Date,
    required: false,
  },
  passwordResetToken: {
    type: String,
    required: false,
  },
  passwordResetTokenExpiration: {
    type: Date,
    required: false,
  },
  chats: [
    {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: false,
    },
  ],
});

userSchema.methods.updateUserConfirmationToken = function (user) {
  return new Promise((resolve, reject) => {
    if (user.verificationTokenExpiration < new Date()) {
      cryptoGenerate
        .createRandomToken()
        .then((token) => {
          user.verificationToken = token;
          user.verificationTokenExpiration = Date.now() + 300000;
          return user.save();
        })
        .then((updatedUser) => {
          updatedUser.sendNewUserEmail(updatedUser);
          resolve(updatedUser);
        })
        .catch((err) => {
          reject(err);
        });
    } else {
      resolve({});
    }
  });
};

userSchema.methods.sendNewUserEmail = function (user) {
  transporter.sendMail({
    to: user.email,
    from: `ChatApp <${USER_EMAIL_SERVER}>`,
    subject: "Confirm your account.",
    html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Account Confirmation</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f3f3f3; padding: 20px; text-align: center;">
                <table style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="padding: 20px;">
                            <h1 style="color: #333;">Account Confirmation</h1>
                            <p style="font-size: 16px; color: #555; margin: 20px 0;">Hello ${user.name}</p>
                            <p style="font-size: 16px; color: #555; margin: 20px 0;">Thank you for creating an account with us. To activate your account, please click the confirmation link below:</p>
                            <a href="http://localhost:3000/confirmAccount/${user.verificationToken}" style="background-color: #007BFF; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">Confirm Your Account</a>
                            <p style="font-size: 14px; color: #555;">If you didn't create this account, please ignore this email.</p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
  });
};

userSchema.methods.updateResetPasswordToken = function (user) {
  return new Promise((resolve, reject) => {
    let newToken;
    cryptoGenerate
      .createRandomToken()
      .then((token) => {
        user.passwordResetToken = token;
        user.passwordResetTokenExpiration = Date.now() + 3600000;
        newToken = token;
        return user.save();
      })
      .then((updatedUser) => {
        updatedUser.sendResetPasswordEmail(updatedUser, newToken);
        resolve(updatedUser);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

userSchema.methods.sendResetPasswordEmail = function (user, token) {
  transporter.sendMail({
    to: user.email,
    from: `ChatApp <${USER_EMAIL_SERVER}>`,
    subject: "Confirm your account.",
    html: `
            <!DOCTYPE html>
            <html>
            
            <head>
                <meta charset="UTF-8">
                <title>Password Reset</title>
            </head>
            
            <body>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4f4f4">
                    <tr>
                        <td align="center">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border: 1px solid #e4e4e4;">
                                <tr>
                                    <td align="center" style="padding: 20px;">
                                        <h1>Password Reset</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px;">
                                        <p>Hello,</p>
                                        <p>You are receiving this email because you requested a password reset for your account.</p>
                                        <p>To reset your password, click the link below:</p>
                                        <p><a href="http://localhost:3000/passwordReset/${token}">Reset Password</a></p>
                                        <p>If you did not request this password reset, please ignore this email.</p>
                                        <p>Thank you!</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="background-color: #f4f4f4; padding: 20px;">
                                        <p>&copy; 2023 Lucas Schmidt</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            
            </html>
        `,
  });
};

module.exports = mongoose.model("User", userSchema);
