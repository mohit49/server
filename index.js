const express = require('express');
const app = express();
const mysql= require('mysql');
const cors = require('cors');
//const https = require('https');
const fs = require('fs');
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  };
app.use(cors());
app.use(express.json());
const db = mysql.createConnection({
    host : 'localhost',
    user :'mohit9313',
    password:'mohit9313',
    database:'nodejs-react'
})
app.post("/register" ,(req, res) => {

    const usernamen = req.body.userName;
    const passwordn = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const phone = req.body.phone;
    db.query("SELECT  email  FROM Users WHERE email = '"+ email +"'", function(err1, checkMail, field){
        if(checkMail.length == 0 ) {
            db.query("SELECT  phone FROM Users WHERE  phone = '"+ phone +"'", function(err2, checkPhone, field){
               
                if(checkPhone.length == 0 ) {
                    res.status(200);
                    db.query("INSERT INTO Users (userName , Password, LastName , FirstName , email , phone) VALUES(?,?,?,?,?,?);", [usernamen, passwordn, firstName, lastName, email, phone] ,(err,result)=>{
                    res.send(result);
                    })
                } else {
                    res.json({
                        message:'phoneExist',
                        json: checkPhone,
                       

                        
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
app.post("/login" ,(req, res) => {

    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    let  $query;
if(email.length > 0) {
    $query = "SELECT * FROM Users WHERE  email = '"+ email +"'";
}
else {
    $query = "SELECT  * FROM Users WHERE  phone = '"+ phone +"'";
}
console.log( $query);
db.query( $query, function(err2, userResults , field) { 

 if(userResults) {
    if(userResults.length > 0) {

    if(userResults[0].Password !== password) {
        res.json({
            message:'invelidCred'
            
        })     
    }
    else if(userResults[0].Password === password) {
        let loginToken = Math.random();
        res.json({
            message:'loggedIn',
            loginToken: loginToken,
            userData : {'phone': userResults[0].phone , 'email': userResults[0].email}
            
        });  
        db.query("UPDATE Users SET loginToken = '"+ loginToken + "' WHERE email = '"+ userResults[0].email +"'")

    }

    }
    else {
        res.json({
            message:'userNotfound',
            
        }) 
    }
 } 
 else {
     console.log(err2)
 }


});
  
   
})
app.post("/profileFetch" ,(req, res) => {

    const loginToken = req.body.loginToken;
    let  $query = "SELECT * FROM Users WHERE  loginToken = '"+ loginToken +"'";


    db.query( $query, function(err2, userResults , field) { 
        if(userResults) {
            const {FirstName,LastName,email,phone} = userResults[0];
            res.json({
                message:'personLoggedIn',
                json: {'firstName':LastName, 'lastName' : FirstName, 'email':email, 'phone':phone}
            })
        }


    });
 
})
app.post("/registerLab" ,(req, res) => {
    const labUserName = req.body.labUserName;
    const labOwner = req.body.labOwner;
    const labName = req.body.labName;
    const labLocation = req.body.labLocation;
    const email = req.body.email;
    const password = req.body.password;
    const labPhone = req.body.labPhone;
    db.query("SELECT  email  FROM Labs WHERE email = '"+ email +"'", function(err1, checklabMail, field){
        console.log(checklabMail)
        if(checklabMail == 0 ) {
            db.query("SELECT  phone FROM Labs WHERE  phone = '"+ labPhone +"'", function(err2, checkLabPhone, field){
                console.log(checklabMail)
                console.log(checkLabPhone)
                if(checkLabPhone.length == 0 ) {
                    res.status(200);
                    db.query("INSERT INTO Labs (labUserName , Password, labOwner , labName, labLocation , email , phone) VALUES(?,?,?,?,?,?,?);", [labUserName, password, labOwner, labName, labLocation, email, labPhone] ,(err,result)=>{
                    console.log(result);
                        res.send(result);
                    })
                } else {
                    res.json({
                        message:'phoneExist',
                        json: checkLabPhone

                    }) 
                }

            })
        }
        else {
            res.json({
                message:'emailExist',
                json: checklabMail
            }) 
        }

    })

   
})
app.post("/nearBylabs" ,(req, res) => {
    const city = req.body.city;
    const state = req.body.state;
    let  $query;
    $query = "SELECT * FROM Labs";
    db.query( $query, function(err2, userResults , field) { 
        if(userResults) {
            const labs = []; 
            userResults.forEach((location ,index) => {
              
                if(location.labLocation.includes(city) && location.labLocation.includes(state)) {
                    labs.push(userResults[index]);

                }
            });
            res.json({
                message:'emailExist',
                json: labs
            }) 
            
        }


    });

})
app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

// Create an HTTPS service identical to the HTTP service.
//https.createServer(options, app).listen(PORT);
