var express = require("express");
var mysql = require("mysql");
var connected=false;
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "havi"
});

con.connect(function (err) {
    if (err) throw err;
    connected=true;
    console.log("Connected!");
});

var app = express();

app.set("view engine", "ejs");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log(`To open application open here http://localhost:${PORT}`)
});

app.use(express.static("public"));
app.use(express.urlencoded({
    extended: true,
}));

app.get("/", (req, res) => {
    res.render("index");
});
app.get("/signup",(req,res)=>{
    res.render("signup")
})
app.post("/login",(req,res)=>{
    const email = req.body.email;
    const password = req.body.password;
    if (connected == true) {
        con.query(`SELECT * FROM users where email="${email}"`, function (err,result,fields) {
            if (err) res.json({
                err: err,
                loginstat: false
            });
            if (result.length == 0) {
                res.json({
                    err: "User not found",
                    loginstat: false,
                });
            } else {
                if (password == result[0].password) {
                    res.json({
                        err: "Authorized User ",
                        loginstat: true,
                    });
                } else {
                    res.json({
                        err: "Email/Password is invalid",
                        loginstat: false,
                    });
                }
            }
        });
    }
});
app.post("/signup", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const dob=req.body.dob;
    const name=req.body.name;
    const gender=req.body.gender;
    if (connected == true) {
        con.query(`SELECT email FROM users where email="${email}"`, function (err, result, fields) {
            if (err) res.json({
                err: err,
                signupstat: false
            });
            if (result.length != 0) {
                res.json({
                    err: "User Already Exists in System",
                    signupstat: false
                });
            } else {
                con.query(
                    `insert into users (name,email,password,dob,gender) values ("${name}","${email}","${password}","${dob}","${gender}")`,
                    function (err, result, fields) {
                        if (err) throw err;
                        res.json({
                            err: "Successful",
                            signupstat: true
                        });
                    }
                );
            }
        });
    }
});
app.get("/user/home",(req,res)=>{
    if (connected == true) {
        con.query(`SELECT text FROM users where email="${req.query.email}"`, function (err, result, fields) {
            if (err) res.send("Some Error Occurred")
            res.render("home",{text: result[0].text,email: req.query.email})
        })
    }
});
app.post("/update",(req,res)=>{
    if (connected == true) {
        con.query(`SELECT text FROM users where email="${req.body.email}"`, function (err, result, fields) {
            if (err)res.send("Some Error Occurred")
            if(result[0].text==""){
                con.query(`update users set text="${req.body.text}" where email="${req.body.email}"`, function (err, result, fields) {
                    if (err)res.send("Some Error Occurred")  
                    res.json({updatestat:true})
                })
            }else{
            con.query(`update users set text="${result[0].text}$${req.body.text}" where email="${req.body.email}"`, function (err, result, fields) {
                if (err)res.send("Some Error Occurred")  
                res.json({updatestat:true})
            })
        }
        })
    }
});
app.get("/admin",(req,res)=>{
    if (connected == true) {
        con.query(`SELECT * FROM users`, function (err, result, fields) {
            if (err) res.send("Some Error Occurred")
            res.render("admin",{res: result})
        })
    }
})
app.use((req, res) => {
    res.render("404")
});

