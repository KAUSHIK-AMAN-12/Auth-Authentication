const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const session = require("express-session");
const userAuth = require("./DBmodel/models");
const app = express();

// connect css file to handlebars
app.use(express.static('.'));

//----       connect mongoose lib to mongo DB    --------///

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => {
  console.log(error);
});
db.once("open", () => {
  console.log("Connected successfully");
});

///-----------------------------------------------------------////

app.set("view engine", "hbs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


////----   session setup ---------------/////
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "killer",
  })
);

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  try {
    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    console.log(hashedpassword);
    const user = new userAuth({
      name: req.body.name,
      email: req.body.email,
      password: hashedpassword,
      age: req.body.age,
      profession: req.body.profession,
      githublink: req.body.githublink,
      Dateofbirth: req.body.DOB,
      Monthofbirth: req.body.MOB,
      Yearofbirth: req.body.YOB,
    });
    const newuser = await user.save();

    res.status(201).send(newuser);
  } catch (e) {
    res.status(404).redirect("/signup"); ///send back app.get('/signup')
  }
});

////------------------------ all user  -----------------------------///
app.get("/allusers", async (req, res) => {
  try {
    const userval = await userAuth.find();
    if (userval == null) {
      return res.send("there are no users");
    }
    console.log(userval);
    res.send(userval);
  } catch {
    res.status(500).send("sorry there is an error");
  }
});

//// --------------------- to get user by LOGIN -------------------------///
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  var uservalue = await userAuth.findOne({ email: req.body.email });
  console.log(uservalue);
  if (!uservalue) {
    return res.redirect("/login");
  }
  try {
    if (await bcrypt.compare(req.body.password, uservalue.password)) {
      req.session.userId = uservalue.id; //yaha se ye cookie value login ke liye use hogi
      res.redirect("/profile"); //directed to app.get('/profile')
    } else {
      res.render("login");
    }
  } catch {
    res.redirect("/login");
  }
});

/// ------- profile page  -------------------------///
app.get("/profile", async (req, res) => {
  if (!req.session.userId) {
    //if cookie is not available thn redirect to login again
    res.redirect("/login");
  }
  const id = req.session.userId;
  const user = await userAuth.findById(id);
  //res.send(user_value);
  res.render("profile", { user });
});

//--------  Forgot PAssword ------------------///
app.get('/ForgotPass', (req, res) => {
  res.render('forgotPass');
});

app.post('/ForgotPass', async (req, res) => {
  const userpass = await userAuth.findOne({ email: req.body.email });
  if (!userpass) {
    return res.render("forgotPass", {
      error: "No such email exist ,Please Enter it again",
    });
  }
  req.session.userId = userpass.id;
  res.render("setPass");
});

//----------    Update/Set new password   ---------------------///

app.patch('/setnewpass', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/forgotPass');
  }
  const id = req.session.userId;
  console.log(id)
  const user = await userAuth.findById(id);
//   if(req.body.setnewpassword == null)
//   {
//   res.redirect('/forgotPass')
//   }

  //res.send(user)
  res.render('setPass')
});

/////--------  LOGOUT --------------/////
app.get('/logout', (req, res) => {
  req.session.userId = null;
  res.redirect('/login');
});

app.listen(3456, () => {
  console.log("http://localhost:3456");
});
