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
    database:'talkntyp_nodedb'
})




// on the request to root (localhost:3000/)
app.get('/', function (req, res) {
    res.send('<b>My</b> first express http server');
});

// On localhost:3000/welcome
app.get('/welcome', function (req, res) {
    res.send('<b>Hello</b> welcome to my http server made with express');
});


app.get("/nearBylabs" ,(req, res) => {
   
const city = req.body.city;
    const state = req.body.state;
    let  $query;
    $query = "SELECT * FROM labs";
    db.query( $query, function(err2, userResults , field) { 
        if(userResults) {
            const labs = []; 
            userResults.forEach((location ,index) => {
              
               
                    labs.push(userResults[index]);

                
            });
            res.json({
                message:'emailExist',
                json: labs
            }) 
            
        }


    });


})

// Change the 404 message modifing the middleware
app.use(function(req, res, next) {
    res.status(404).send("Sorry, that route doesn't exist. Have a nice day :)" + path.dirname(require.main.filename || process.mainModule.filename));
});

// start the server in the port 3000 !
app.listen( 3000,function () {
    console.log('Example app listening on port 3000.');
});