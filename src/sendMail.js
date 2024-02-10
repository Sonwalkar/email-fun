const nodeMailer = require("nodemailer");

const transporter = new nodeMailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: "YOUR USERNAME OR EMAIL",
    pass: "YOUR PASSWORD OR KEY",
  },
});

module.exports.sendEmail = async (recipient, htmlContent) => {
  const info = await transporter.sendMail({
    from: "Just For Fun 👻 <emailFunWbsite@gmail.com>",
    to: recipient,
    subject: "Hey, This is a fun project. Have fun!!!",
    text: htmlContent,
    html: htmlContent,
  });

  console.log(info);
};
