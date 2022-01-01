const express = require('express');
const app = express();
const mysql= require('mysql');
const cors = require('cors');
const https = require('https');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const http = require("http").Server(app);
const io = require("socket.io")(http,{
    cors:{
        origin:'*',
    }
});


app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use('/images', express.static('images'));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
const storage = multer.diskStorage({
    destination: "images/profile-pic/",
   
    filename: function(req, file, cb){
        
      cb(null,"IMAGE-"  + Date.now() + path.extname(file.originalname));
   }
   
})

const upload = multer({
    storage: storage,
   
    
}).single('myImage' );

const db = mysql.createConnection({
    host : 'localhost',
    user :'mohit9313',
    password:'mohit9313',
    database:'talkntyp_serverapp'
});
let onlineUsers = [];
const addUserName = (data, socketId) =>{
    username = data[0].userName;
    fullName = data[0].fullName;
    profilePic =  data[0].pic;
    !onlineUsers.some((user)=> user.username === username) && onlineUsers.push({username, fullName ,profilePic, socketId})
};
const removeUser = (socketId) =>{
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};
const getUser = (username) =>{
    return onlineUsers.find((user) => user.username === username)
}

// getting chatting users
getChatUsers = (username) =>{
    return new Promise((resolve, reject)=>{
        db.query("SELECT  *  FROM msglist WHERE userName = '"+ username +"'",  (error, results)=>{
            if(error){
                return reject(error);
            }
            return resolve(results);
        });
    });
};
// end getting chatting users

// getSingleUserFullInformation
getSingleUserFullInformation = (username) =>{
    return new Promise((resolve, reject)=>{
        db.query("SELECT  *  FROM user WHERE userName = '"+ username +"'",  (error, results)=>{
            if(error){
                return reject(error);
            }
            return resolve(results);
        });
    });
};
// end getSingleUserFullInformation



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
          
            if(userExist[0].password == password) {
                res.json({
                loginMark : 'login',
                message:'User login Sucessfully hhhh',
                json: [{'userName': userExist[0].userName, 'password': userExist[0].password, 'fullName': userExist[0].fullName, 'gender': userExist[0].gender, 'email': userExist[0].email, 'birthDate': userExist[0].birthDate }],
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

   
});
io.on('connection',(socket)=>{

    socket.on('userJoin', (data)=>{
        addUserName(data , socket.id);
        
        io.emit('online-users', onlineUsers)
    });
   
    socket.on('getChatList', async (data)=>{
        const chatListForUser = data[0].userName;
        var reciver = getUser(chatListForUser);
        if(reciver) {
        socket.join(reciver.socketId);
        }
        try{ 
            
            let msgWithList = await getChatUsers(chatListForUser);
            msgWithList = msgWithList[0].msgWithList;
            console.log(msgWithList);
            msgWithList.split(',').forEach(async(ele) => {
                try {
                    let singleUserInfo = await getSingleUserFullInformation(ele);
                    //singleUserInfo = Object.filter(singleUserInfo[0], ele => ele[key] === 'password');
                
                
                    singleUserInfo = Object.entries(singleUserInfo[0]).filter(([key , ele]) => key !== 'password');
                    console.log(Object.fromEntries(singleUserInfo));
                    
                    if(reciver) {
                    io.to(reciver.socketId).emit('reciveChatList',  Object.fromEntries(singleUserInfo));
                    }
                  }
                
                catch(error){
                    console.log(error)
                    }
            });
        } catch(error) {
                console.log(error)
            }
        //io.emit('online-users', onlineUsers)
    });

    socket.on('sendMsg', async (data)=> {
        try { 
            const reciver = getUser(data.reciversName);
            const user =  await getSingleUserFullInformation(data.userName);
            const txtMsg = data.textMsg;
        if(reciver) {
            socket.join(reciver.socketId);
            io.to(reciver.socketId).emit('msg-recived', {user, txtMsg})
            }
        } catch(error) {
            console.log(error)
        }
    })
    

    socket.on('disconnect', ()=>{
        removeUser(socket.id);
        io.emit('online-users', onlineUsers);
    })
})

http.listen(3001, function() {
  console.log("listening on *:4000");
});
// start the server in the port 3000 !

