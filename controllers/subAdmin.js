const SubAdmin= require('../models/SubAdmin.model');
const nodemailer = require('nodemailer');
const Admin = require('../models/admin');
const User= require('../models/user')
const Order = require("./../models/order");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const IO = require('../socket') 
const path = require('path');
require('dotenv').config();



async function postLogin (req, res, next) {
    try{
    const SavedUser = await SubAdmin.findOne({email:req.body.email});
        if(!SavedUser){
        return res.status(400).send({message:`User not found ${req.body.email}`})
        }
        if(SavedUser.isActive == false){
            return res.status(400).send({message:`User dose not have access to Login ! ${req.body.email}`})
            }
        let passwordIsValid = bcrypt.compareSync(req.body.password, SavedUser.password)
        if (!passwordIsValid) {
            return res.status(401).send({
                message: "Invalid Password or user name !"
            });
        }
        let token = jwt.sign({ userId: SavedUser._id ,email:SavedUser.email}, "!23ThisisaSecretFor@#$%^%^^&&allthebest", {
            expiresIn: '3h' // 3 hours
        })
        const postResponse={
            token: token,
            userId: SavedUser._id
        }
        IO.getIO().emit('post:subAdmin',postResponse);
        res.status(200).json({message: 'Sign In Successful',postResponse});
    }catch(error){
        res.status(400).json({
            message: `something went wrong ${error.message}`,
        })
    }
}

async function postSignup  (req, res, next) {
    const SubAdminObj={
        name : req.body.name,
        email : req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    }
    try{
    const SavedUser = await SubAdmin.findOne({email:req.body.email})
    if (SavedUser){
    return res.status(400).json({message: 'User with email Already Exists'});
    }
            const result = await SubAdmin.create(SubAdminObj);
            IO.getIO().emit('post:SubAdmin',result);
            return res.status(201).json({message: 'Sub Admin Created Successfully!', userId: result._id});
            
        }
        catch(error){
            res.status(400).send({message: error.message});
            console.log("error message >>",error)
        
        } 
}


async function subAcceptUserReq(req, res, next){
    const savedSubAdmin =  await SubAdmin.findById({_id:req.params.id});
    if (!savedSubAdmin){
        return  res.status(400).json({message: 'User dose not have sub admin access!'});
    }
    if (!savedSubAdmin.isActive){
        return  res.status(400).json({message: 'Sub Admin not activate !'});
    }
    const savedUser = await User.findById({_id:req.body.id});
    if(!savedUser){
        return res.status(400).json({message: 'User dose not exist !'});
    }
    if (!savedSubAdmin.canAcceptUser){
        return  res.status(400).json({message: 'you dont have admin permission   to accept user !'});
    }
    savedUser.isActive = req.body.isActive 
    const saveUser = await savedUser.save();
    const postResponse={
        userId:saveUser._id,
        isActive:saveUser.isActive
    }
    IO.getIO().emit('put:subAdmin',postResponse);
    res.status(200).json({message: 'User updated Successfully!',postResponse});
}

async function subUpdateOrderReq(req, res, next){
    const savedSubAdmin =  await SubAdmin.findOne({_id:req.params.id});
    if (!savedSubAdmin){
        return res.status(400).json({message: 'User dose not have sub admin access!'});
    }
    if (!savedSubAdmin.isActive){
        return  res.status(400).json({message: 'Sub Admin not activate !'});
    }
    const savedOrder = await Order.findOne({_id:req.body.id});
    if(!savedOrder){
        return res.status(400).json({message: 'Order dose not exist !'});
    }
    if (!savedSubAdmin.canAcceptOrder){
        return  res.status(400).json({message: 'you dont have admin permission   to accept Order !'});
    }
    savedOrder.isAccepted = req.body.isAccepted 
    const updateOrder = await savedOrder.save();
    const  postResponse={
    isAccepted:updateOrder.isAccepted
}
    IO.getIO().emit('get:subAdmin',postResponse);
    res.status(200).json({message: 'Order updated Successfully!',postResponse});
}

async function subUpdateOrderStatus(req, res, next){
    const savedSubAdmin =  await SubAdmin.findOne({_id:req.params.id});
    if (!savedSubAdmin){
        return res.status(400).json({message: 'User dose not have Sub admin access!'});
    }
    if (!savedSubAdmin.isActive){
        return  res.status(400).json({message: 'Sub Admin not activate !'});
    }
    if (!savedSubAdmin.canUpdateOrder){
        return  res.status(400).json({message: 'you dont have admin permission   to Update Order !'});
    }
    const savedOrder = await Order.findOne({_id:req.body.id});
    if(!savedOrder){
        return res.status(400).json({message: 'Order dose not exist !'});
    }
    savedOrder.status = req.body.status 
    savedOrder.message = req.body.message 
    if(req.body.status==3){
        savedOrder.isAccepted = false
    }
    const updateOrder = await savedOrder.save();
const  postResponse={
    status:updateOrder.status,
    message:updateOrder.message,
    isAccepted:updateOrder.isAccepted
}
    IO.getIO().emit('get:subAdminUpdateOrder',postResponse);
    res.status(200).json({message: 'Order updated Successfully!',postResponse});
}


async function SubAdminDeleteOrder (req, res, next){
    try{
        const savedSubAdmin =  await SubAdmin.findById({_id:req.params.id});
        if (!savedSubAdmin){
            return  res.status(400).json({message: 'User dose not have sub admin access!'});
        }
        if (!savedSubAdmin.canDeleteOrder){
            return  res.status(400).json({message: 'User dose not have  admin permission!'});
        }
        const id = req.body.id;
        const order = await Order.findById(id);
        if(!order){
            return res.status(201).json({message: "order dose not exist"})
        }
        await Order.deleteOne({
            _id : req.params.id
        });
        res.status(201).json({message: "order Deleted !"})
        IO.getIO.emit('Sub Admin Delete Order',req.params.id);
    }catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong!"
        })
}
}

async function getAllSubAdmin (req, res, next){
    try{
        const sub =  await SubAdmin.find({});
        
        if(sub){
            res.status(200).json({sub})
        }
        IO.getIO().emit('get:subadmin',sub);
        res.status(201).json({message: "order Deleted !"})
    }catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong!"
        })
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
async function SubAdminForgotPassword(req,res){
    const {email}= req.body;
    const user = await SubAdmin.findOne({ email: req.body.email });
    if(!user){
        res.send('User not registered');
        return;
    }
    
    const payload = {
        userId: user._id,
        email:user.email 
    }
    let token = jwt.sign(payload, process.env.SECRET_KEY + user.password, { expiresIn: 86400 });// 24 hours
    const Link = `http://localhost:8080/rest-password-SubAdmin/${user._id}/${token}`
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

async function getSubAdminResetPassword(req,res){
    const{id,token} =  req.params;
    const user = await SubAdmin.findOne({ _id: req.params.id })
    if(!user){
        res.send('Invalid Id...!');
    }
    try{
        const payload =jwt.verify(token,process.env.SECRET_KEY + user.password);
        res.render('subAdmin-reset-password',{email:user.email});
        
    }catch(error){
        console.log(error);
        res.send(error.message);
    }
}

//updating user password

async function ResetSubAdminPassword(req,res){
    const{id,token} =  req.params;
    const user = await SubAdmin.findOne({ _id: req.params.id });
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

module.exports ={
    getAllSubAdmin,
    postLogin,
    postSignup,
    subAcceptUserReq,
    subUpdateOrderReq,
    subUpdateOrderStatus,
    SubAdminDeleteOrder,
    SubAdminForgotPassword,
    getSubAdminResetPassword,
    ResetSubAdminPassword
}


