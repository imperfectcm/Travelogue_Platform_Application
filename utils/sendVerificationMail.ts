import nodemailer from "nodemailer";

const testEmail = (email: string, emailtoken: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "tecky31project@gmail.com",
      pass: "lwkh vhha fqla zaqk",
    },
  });

  const mailOptions = {
    from: "tecky31project@gmail.com",
    to: email,

    subject: "Verify your email...",
    //html: `Next Step is fix register and putting token`,
    html: `<p>Hello 👋 ${email}, verify your email by clicking this link...</p>
    <a href ='${process.env.CLIENT_URL}auth/verify-email?emailToken=${emailtoken}'>Verify Your Email</a>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      // console.log ("Email:" email);
      // console.log ('<p>Hello ${user.name}, verify your email by clicking this link...</p><a href =" ${process.env.CLIENT_URL}/verify-email?emailtoken=${user.emailtoken}'>Verify Your Email</a>));
      console.log("Verification email sent");
    }
  });
};

export { testEmail };
