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

exports.sendNewUserEmail = (user) => {
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
