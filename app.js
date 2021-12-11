const express = require('express');
const app = express();
const mysql= require('mysql');
const cors = require('cors');
const https = require('https');
const path = require('path');
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



app.use("/register" ,(req, res) => {

    const userName = req.body.userName;
    const password = req.body.password;
    const fullName = req.body.fullName;
    const gender = req.body.gender;
    const email = req.body.email;
    const birthDate = req.body.birthDate;
    db.query("SELECT  email  FROM user WHERE email = '"+ email +"'", function(err1, checkMail, field){
        if(checkMail.length == 0 ) {
            db.query("SELECT  userName FROM user WHERE  userName = '"+ userName +"'", function(err2, checkUserName, field){
               
                if(checkUserName.length == 0 ) {
                    res.status(200);
                    db.query("INSERT INTO user (userName , Password, gender , fullName , email , birthDate) VALUES(?,?,?,?,?,?);", [userName, password, fullName, gender, email, birthDate] ,(err,result)=>{
                        res.json({
                            message:'User registered Sucessfully',
                            json: [{'userName': userName, 'fullName': fullName,'gender':gender, 'email':email, 'birthday':birthDate}]
                           
    
                            
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