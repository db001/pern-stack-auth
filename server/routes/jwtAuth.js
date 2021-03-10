const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const validInfo = require("../middleware/validInfo");
const jwtGenerator = require("../utils/jwtGenerator");
const authorize = require("../middleware/authorize");
// const transport = require("../utils/nodemailer");
const sgMail = require("@sendgrid/mail");

//authorization
router.post("/register", validInfo, async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
      email
    ]);

    if (user.rows.length > 0) {
      return res.status(401).json("User already exist!");
    } else {
      console.log('Creating new user');
    }

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    const token = jwtGenerator(name).slice(0, 26);
    
    let newUser = await pool.query(
      "INSERT INTO users (user_name, user_email, user_password, token) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, bcryptPassword, token]
      );
      
    const jwtToken = jwtGenerator(newUser.rows[0].user_id);

    sgMail.setApiKey(process.env.SENDGRIDAPI);

    const message = {
      from: 'doggadave+sendgriduser@gmail.com',
      to: email,
      subject: 'It lives',
      text: 'My message',
      html: `
        <h1>Hello ${name}</h1>
        <p>Thanks for signing up</p>
        <p>To confirm your email, please <a href="http://localhost:3000/confirm/${token}">click here</a>
      `
    }

    sgMail.send(message)
    .then(() => {
      console.log('Sendgrid mail sent');
    })
    .catch(err => {
      console.log(`Sendgrid error: ${err}`);
    });

    /* Nodemailer code */
    // transport.sendMail(message, (err, info) => {
    //   if(err) {
    //     console.log(`Email error: ${err}`);
    //   } else {
    //     console.log('Email sent');
    //   }
    // })

    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/login", validInfo, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
      email
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json("Invalid Credential");
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].user_password
    );

    if (!validPassword) {
      return res.status(401).json("Invalid Credential");
    }
    const jwtToken = jwtGenerator(user.rows[0].user_id);
    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/verify", authorize, (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.put("/confirm/:token", async (req, res) => {
  const confirmCode = req.params.token;

  console.log('Code: ' + confirmCode);

  try {
    const user = await pool.query("SELECT * FROM users WHERE token = $1 RETURNING *", [
      confirmCode
    ]);

    if (user.rows.length === 0) {
      return res.json("Invalid Credential");
    }

    await pool.query("UPDATE users SET is_verified = $1 WHERE token = $2", [
      TRUE, confirmCode
    ]);

    res.json({ user: user.rows[0].name });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }

})

module.exports = router;
