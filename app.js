const express = require('express');
const app = express();
const mysql= require('mysql');
const cors = require('cors');
const https = require('https');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(express.static('images'));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
const storage = multer.diskStorage({
    destination: "../public_html/image/profile-pic/",
   
    filename: function(req, file, cb){
        
      cb(null,"IMAGE-"  + Date.now() + path.extname(file.originalname));
   }
   
})

const upload = multer({
    storage: storage,
   
    
}).single('myImage' );

const db = mysql.createConnection({
    host : 'localhost',
    user :'talkntyp_mohit',
    password:'mohit9313#',
    database:'talkntyp_serverapp'
})




// on the request to root (localhost:3000/)
app.get('/', function (req, res) {
    res.send('<b>My</b> first express http server');
});

app.use("/upload" ,(req, res) => {

    upload(req,res,(err)=>{
const userSel  = req.body.userName;
console.log(userSel);
         if(!err) {
    db.query("SELECT *  FROM user WHERE userName = '"+ userSel +"'", function(err1, userCheck, field){
        console.log( req.file.filename);
        db.query("UPDATE user SET profilePic = '"+ req.file.filename + "' WHERE userName = '"+ userSel +"'")
        
    })
    console.log(req.file);
            return (res.status(200).send(req.file))
        }

    })
 });

app.use("/register" ,(req, res) => {

    const username = req.body.userName;
    const password = req.body.password;
    const fullName = req.body.fullName;
    const gender = req.body.gender;
    const email = req.body.email;
    const profilePic = 'image/profile-pic/dummyUser.jpeg'
    const birthDate = req.body.birthDate;
    db.query("SELECT  email  FROM user WHERE email = '"+ email +"'", function(err1, checkMail, field){
        if(checkMail.length === 0 ) {
            db.query("SELECT  userName FROM user WHERE  userName = '"+ username +"'", function(err2, checkUserName, field) {
                if(checkUserName.length === 0 ) {
                    res.status(200);
                    db.query("INSERT INTO user (userName , Password, fullName, gender , email , birthDate, profilePic) VALUES(?,?,?,?,?,?,?);", [username, password, fullName, gender, email, birthDate, profilePic] ,(err,result)=>{
                        console.log("result:"+ result)
                        res.json({
                            message:'User registered Sucessfully',
                            json: [{'userName': username, 'password':password, 'fullName': fullName, 'gender': gender, 'email': email, 'birthDate': birthDate }],
                            userImg: profilePic
                        });
                    })
                } else {
                    res.json({
                        message:'userAlreadyExist',
                        json: checkUserName,
                    })
                }
            })
        }
        else {
            res.json({
                message:'emailExist',
                json: checkMail
            })
        }

    })

   
})

// my accoutn info change

app.use("/informationUpdate" ,(req, res) => {
    const username = req.body.userName
    const fullname = req.body.fullName;
    const email = req.body.email;
    db.query("SELECT  *  FROM user WHERE userName = '"+ username +"'", function(err1, checkMail, field){
        
       if(email.length > 0) {
            db.query("UPDATE user SET email = '"+ email + "' WHERE userName = '"+ username +"'");
            res.json({
                json: [{'fullName': fullname, 'email': email}]
            });
            return (res.status(200).send(req.file))
       }
       if(fullname.length > 0) {
            db.query("UPDATE user SET fullName = '"+ fullname + "' WHERE userName = '"+ username +"'");
            res.json({
                json: [{'fullName': fullname, 'email': email}]
            });
            return (res.status(200).send(req.file))
       }
       
    });

   
})

app.use("/authentication" ,(req, res) => {
    const username = req.body.userName
    const password = req.body.password;
    db.query("SELECT  *  FROM user WHERE userName = '"+ username +"'", function(err1, userExist, field){
        if(userExist.length > 0){
            console.log(userExist[0]);
            if(userExist[0].password == password) {
                res.json({
                loginMark : 'login',
                message:'User login Sucessfully',
                json: [{'userName': userExist[0].username, 'password': userExist[0].password, 'fullName': userExist[0].fullName, 'gender': userExist[0].gender, 'email': userExist[0].email, 'birthDate': userExist[0].birthDate }],
                userImg: userExist[0].profilePic
             });
            } 
            else {
             res.json({
                loginMark:'notLogin',
                message:'User exist but password is in valid'
             });
            }
        } else {
             res.json({
                loginMark:'notLogin',
                message:'User is not exist',
            });
        }
       
      
    });

   
})

// start the server in the port 3000 !
app.listen( 3001,function () {
    console.log('Example app listening on port 3001.');
});
