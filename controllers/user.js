const User = require("./../models/user");
const nodemailer = require('nodemailer');
const IO = require('../socket')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const io = require('./../socket');
const path = require('path');
require('dotenv').config();


async function loginUser(req, res, next)  {

    const email = req.body.email;
    const password = req.body.password;

    let loadedUser;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                res.status(400).json({ message: 'User not found', status: 'error' })
            }

            loadedUser = user;

            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (!doMatch) {
                        res.status(400).json({ message: 'Password do not match', status: 'error' })

                    }

                    //const online= ()=>{
                    const token = jwt.sign({
                        email: loadedUser.email,
                        userId: loadedUser._id.toString(),
                    }, "!23ThisisaSecretFor@#$%^%^^&&allthebest", { expiresIn: '3h' })



                    res.status(200).json({
                        message: 'Sign In Successfull',
                        token: token,
                        userId: loadedUser._id.toString(),
                        expiresIn: '3h',
                        //isOnline:User.isOnline
                    })
                    // }
                });
        }).catch(err => {
            return res.status(500).json({ err: err.message, message: 'Something went wrong!' })

        })
                
}

async function postSignup (req, res, next) {
    
    try{
        
        const SavedUser = await User.findOne({email:req.body.email})
        if (SavedUser){
        return res.status(400).json({message: 'User with email Already Exists'});
        }

        bcrypt.hash(req.body.password, 12)
        .then((hashedPassword) =>{
            const user = new User({
                password : hashedPassword,
            email : req.body.email,
            name : req.body.name,
            mobileno : req.body.mobileno,
            address : req.body.address,
            city : req.body.city,
            gst : req.body.gst,
            company : req.body.company
            })

            return user.save();
        }).then((user) =>{
            
            res.status(201).send({message:`User registered successfully `,user})
            io.getIO().emit("get:user", SavedUser);
        })

        
    }    catch(error){
        res.status(500).send({message:`Error while creating User ${error.message}`})
    }

}

async function getAllUser (req, res, next){
    try {
            const user = await User.find({isActive: false});
            if(user){
                res.status(200).json({
                    user,
                    message: "All user Found!"
                })
                IO.getIO().emit('get:user',user);
            }
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Something went wrong!' })
    }
}

async function getUserById  (req, res, next){
    try {
            let id = req.params.id;
            const user = await User.findById(id);
            if(user){
                res.status(200).json({
                    user,
                    message: "user Found!"
                })
                IO.getIO().emit('get:user',user);
            }
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Something went wrong!' })
    }
}

async function updateUserById  (req, res, next){
    try {
            let id = req.params.id;
            const user = await User.findByIdAndUpdate(id, req.body);
            if(user){
                res.status(200).json({
                    user,
                    message: "user Updated!"
                })
                IO.getIO().emit('get:user',user);
            }
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Something went wrong!' })
    }
}


//transporter contain our mail sender and password
let msg = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS_KEY
    }
});
//sending mail about rest password with rest password page link
async function UserForgotPassword(req,res){
    const {email}= req.body;
    const user = await User.findOne({ email: req.body.email });
    if(!user){
        res.send('User not registered');
        return;
    }
    
    const payload = {
        userId: user._id,
        email:user.email 
    }
    let token = jwt.sign(payload, process.env.SECRET_KEY + user.password, { expiresIn: 86400 });// 24 hours
    const Link = `http://localhost:8080/rest-password-user/${user._id}/${token}`
    console.log(Link)


    let mailOptions = {
        from: 'serviceacount.premieleague@gmail.com',
        to: user.email,
        subject:'Rest password' ,
        text:`Click on link to reset your password    ${Link}`
    };
    msg.sendMail(mailOptions, function(error, info){
        if (error) {
        console.log(error);
        } else {
        console.log('Email sent: ' + info.response);
        }
    });
    res.send('Password reset link has been sent to your email..!')
    
    }


//user rest password page for getting the new password from user

async function getUserResetPassword(req,res){
    const{id,token} =  req.params;
    const user = await User.findOne({ _id: req.params.id })
    if(!user){
        res.send('Invalid Id...!');
    }
    try{
        const payload =jwt.verify(token,process.env.SECRET_KEY + user.password);
        res.render('user-reset-password',{email:user.email});

    }catch(error){
        console.log(error.message);
        res.send(error.message);
    }
}

//updating user password

async function ResetUserPassword(req,res){
    const{id,token} =  req.params;
    const user = await User.findOne({ _id: req.params.id });
    if(!user){
        res.send('Invalid Id...!');
    }
    try{
        const payload = jwt.verify(token,process.env.SECRET_KEY + user.password);
        
            user.password= bcrypt.hashSync(req.body.password, 16) ? bcrypt.hashSync(req.body.password, 16) : user.password
        const updatedUser= await user.save(user);
        res.status(200).send(updatedUser);

    }catch(error){
        console.log(error.message);
        res.send(error.message);
    }
}
module.exports={
    loginUser,
    postSignup,
    getAllUser,
    getUserById,
    updateUserById,
    UserForgotPassword,
    getUserResetPassword,
    ResetUserPassword
}