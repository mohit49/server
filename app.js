const express = require('express');
const app = express();
const mysql= require('mysql');
const cors = require('cors');
const https = require('https');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/profile-pic' )
    },
    filename:(req, file,cb)=>{
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage
});
app.use(cors());
app.use(express.json());
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

app.use("/uploadPrifilePic", upload.single('image') ,(req, res) => {
    console.log(req);
    console.log(res)
 });

app.use("/register" ,(req, res) => {

    const username = req.body.userName;
    const password = req.body.password;
    const fullName = req.body.fullName;
    const gender = req.body.gender;
    const email = req.body.email;
    const birthDate = req.body.birthDate;
    db.query("SELECT  email  FROM user WHERE email = '"+ email +"'", function(err1, checkMail, field){
        if(checkMail.length === 0 ) {
            db.query("SELECT  userName FROM user WHERE  userName = '"+ username +"'", function(err2, checkUserName, field) {
                if(checkUserName.length === 0 ) {
                    res.status(200);
                    db.query("INSERT INTO user (userName , Password, gender , fullName , email , birthDate) VALUES(?,?,?,?,?,?);", [username, password, fullName, gender, email, birthDate] ,(err,result)=>{
                        console.log("result:"+ result)
                        res.json({
                            message:'User registered Sucessfully',
                            json: [{'userName': username, 'password':password, 'fullName': fullName, 'gender': gender, 'email': email, 'birthDate': birthDate }]
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


// start the server in the port 3000 !
app.listen( 3001,function () {
    console.log('Example app listening on port 3001.');
});
