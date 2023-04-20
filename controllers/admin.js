const Admin = require('../models/admin');
const SubAdmin= require('../models/SubAdmin.model');
const User= require('../models/user')
const Order = require("./../models/order");
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const IO =  require('../socket')
const path = require('path');
const csvWriter =  require('csv-writer');
require('dotenv').config();
const writer = csvWriter.createObjectCsvWriter(
    {path:path.resolve(__dirname,'public/weeklyOrder.csv'),
    header:[
    { id: '_id', title: 'ID' },
    { id: 'createdAt', title: 'Week'}
]});
const writer1 = csvWriter.createObjectCsvWriter(
    {path:path.resolve(__dirname,'public/MonthlyOrder.csv'),
    header:[ 
    { id: '_id', title: 'ID' },
    { id: 'createdAt', title: 'Week'}
]});
const writer2 = csvWriter.createObjectCsvWriter(
    {path:path.resolve(__dirname,'public/YearlyOrder.csv'),
    header:[
        { id: '_id', title: 'ID' },
        { id: 'createdAt', title: 'Week'}
    ]});

const postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    Admin.findOne({ email: email})
    .then(admin => {
        if(!admin){
            const error = new Error('Admin not found');
            error.status = 404;
            next(error);
        }
        loadedUser = admin;
        bcrypt.compare(password, admin.password)
        .then(doMatch => {
            if(!doMatch){
                const error = new Error('Password do not match');
                error.status = 401;
                next(error);
            }
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id,
            },"!23ThisisaSecretFor@#$%^%^^&&allthebest", {expiresIn: '3h'});
            const  postResponse={   
                token: token,
                userId: loadedUser._id.toString()
            }
            res.status(200).json({message: 'Sign In Successful',postResponse})
                IO.getIO.emit('post admin Login',postResponse);
        });
    }).catch(err =>{
        console.log(err)
        res.status(400).json({message: err.message, status:'error'});
    }).catch(error =>{
        console.log(error)
        res.status(400).json({message: error.message, status:'error'});
    })
}


const postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    Admin.findOne({ email: email})
    .then(admin => {
        if(admin){
            res.status(400).json({
            status: false,
            message: 'User with email Already Exists'
        })
        }
        bcrypt.hash(password, 12)
        .then((hashedPasswords) => {
            const admin = new Admin({
                email: email,
                password: hashedPasswords
            })
            return admin.save();
        }).then((result) => {
            //IO.getIO.emit('post admin Signup',result);
            return res.status(201).json({message: 'Admin Created Successfully!', status: '201', userId: result._id});
        
        })
    })
    
.catch(error =>{
    res.status(400).json({message: error.message, status:'error'});
    })
}

async function acceptUserReq(req, res, next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const savedUser = await User.findById({_id:req.body.id});
    if(!savedUser){
        return res.status(400).json({message: 'User dose not exist !'});
    }
    savedUser.isActive = req.body.isActive 

    const saveUser = await savedUser.save();
    const postResponse={
        userId:saveUser._id,
        isActive:saveUser.isActive
    }
    res.status(200).json({message: 'User updated Successfully!',postResponse});
    IO.getIO.emit('admin accept User Req',postResponse);
}

async function UpdateOrderReq(req, res, next){
    const savedAdmin =  await Admin.findOne({_id:req.params.id});
    if (!savedAdmin){
        return res.status(400).json({message: 'User dose not have admin access!'});
    }
    const savedOrder = await Order.findOne({_id:req.body.id});
    if(!savedOrder){
        return res.status(400).json({message: 'Order dose not exist !'});
    }
    savedOrder.isAccepted = req.body.isAccepted;
    
    const updateOrder = await savedOrder.save();
const  postResponse={
    isAccepted:updateOrder.isAccepted
}
    res.status(200).json({message: 'Order updated Successfully!',postResponse});
    IO.getIO().emit('get:order',postResponse);
}
async function UpdateOrderStatus(req, res, next){
    const savedAdmin =  await Admin.findOne({_id:req.params.id});
    if (!savedAdmin){
        return res.status(400).json({message: 'User dose not have admin access!'});
    }
    const savedOrder = await Order.findOne({_id:req.body.id});
    if(!savedOrder){
        return res.status(400).json({message: 'Order dose not exist!'});
    }
    savedOrder.status = req.body.status 
    savedOrder.message = req.body.message 
  
    const updateOrder = await savedOrder.save();

    res.status(200).json({message: 'Order updated Successfully!',updateOrder});
    IO.getIO().emit('get:order',updateOrder);
}

async function GrantSubAdmin(req, res, next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const savedUser = await SubAdmin.findById({_id:req.body.id});
    if(!savedUser){
        return res.status(400).json({message: 'User dose not exist !'});
    }
    savedUser.isActive = req.body.isActive 
    savedUser.canAcceptOrder= req.body.canAcceptOrder 
    savedUser.canUpdateOrder= req.body.canUpdateOrder
    savedUser.canAcceptUser = req.body.canAcceptUser
    savedUser.canDeleteOrder = req.body.canDeleteOrder
    const UpdatedSubAdmin = await savedUser.save();
    const postResponse={
        userId:UpdatedSubAdmin._id,
        isActive:UpdatedSubAdmin.isActive,
        canAcceptUser:UpdatedSubAdmin.canAcceptUser,
        canAcceptOrder:UpdatedSubAdmin.canAcceptOrder,
        canUpdateOrder:UpdatedSubAdmin.canUpdateOrder,
        canDeleteOrder:UpdatedSubAdmin.canDeleteOrder
        
    }
    res.status(200).json({message: 'User updated Successfully!',postResponse});
    IO.getIO.emit('admin Grant Sub Admin',postResponse);
}

async function totalActiveUser(req, res, next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const pipeline =[
        {
            '$match': {
            'isActive': true
        }
        }, {
            '$count': 'Active users'
        }
    ]
    const user = await User.aggregate(pipeline)
    res.status(200).json({message: 'User fetched Successfully!',user});
    IO.getIO.emit('total Active User',user);
}
async function totalNotActiveUser(req, res, next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const pipeline =[
        {
            '$match': {
            'isActive': false
        }
        }, {
            '$count': ' Not Active users'
        }
    ]
    const user = await User.aggregate(pipeline)
    res.status(200).json({message: 'User fetched Successfully!',user});
    IO.getIO.emit('Not Active User',user);
}

async function totalBlockedUser(req, res, next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const pipeline =
    [
        {
            '$match': {
            'isBlocked': true
        }
        }, {
            '$count': 'Blocked users'
        }
    ]
    const user = await User.aggregate(pipeline)
    res.status(200).json({message: 'User fetched Successfully!',user});
    IO.getIO.emit('total Blocked User',user);
}

async function totalUser(req, res, next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const pipeline =
    [
        {
            '$count': 'total user users'
        }
    ]
    const user = await User.aggregate(pipeline)
    res.status(200).json({message: 'User fetched Successfully!',user});
    IO.getIO.emit('Total User',user);
}

async function MonthlyActiveUser(req, res, next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const pipeline =
    [
        {
            '$match': {
            'isActive': true
        }
        }, {
            '$project': {
            'createdAt': {
            '$month': '$createdAt'
            }
        }
        }
    ]
    const user = await User.aggregate(pipeline)
    res.status(200).json({message: 'User fetched Successfully!',user});
    IO.getIO.emit('active  User Req',user);
}

async function sortOrderByStatus(req, res, next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const pipeline =
    [
        {
            '$match': {
                'status': req.body.status   // number change  different status
            }
        }
    ]
    const order = await Order.aggregate(pipeline)
    res.status(200).json({message: 'User fetched Successfully!',order});
    IO.getIO.emit('sort Order By Status',order);
}

async function OrderByMonth(req, res, next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const pipeline =
    [
        {
            '$project': {
            'createdAt': {
            '$month': '$createdAt'
            }
        }
        }
    ]
    const order = await Order.aggregate(pipeline)
    res.status(200).json({message: 'User fetched Successfully!',order});
    //IO.getIO.emit('OrderByMonth',postResponse);
    writer1.writeRecords(order)
    .then(() =>{
    console.log("DONE!");
    }).catch((error) =>{
    console.log(error);
})

    
    
}

async function OrderByYear(req, res, next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const pipeline =
    [
        {
            '$project': {
            'createdAt': {
            '$year': '$createdAt'
            }
        }
        }
    ]
    const order = await Order.aggregate(pipeline)
    res.status(200).json({message: 'User fetched Successfully!',order});
    //IO.getIO.emit('OrderByYear',postResponse);
    writer2.writeRecords(order)
    .then(() =>{
    console.log("DONE!");
    }).catch((error) =>{
    console.log(error);
})
}

async function OrderByWeek(req, res, next){
    console.log(req.params.id)
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    console.log(">>>>",savedAdmin)
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const pipeline =
    [
        {
            '$project': {
            'createdAt': {
            '$week': '$createdAt'
            }
        }
        }
    ]
    const order = await Order.aggregate(pipeline);
    res.status(200).json(order);
    //IO.getIO.emit('OrderByWeek',postResponse);
    writer.writeRecords(order)
    .then(() =>{
    console.log("DONE!");
    }).catch((error) =>{
    console.log(error);
})
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
async function forgotPassword(req,res){
    const {email}= req.body;
    const User = await Admin.findOne({ email: req.body.email });
    if(!User){
        res.send('User not registered');
        return;
    }
    
    const payload = {
        userId: User._id,
        email:User.email 
    }
    let token = jwt.sign(payload, process.env.SECRET_KEY + User.password, { expiresIn: 86400 });// 24 hours
    const Link = `http://localhost:8080/rest-password/${User._id}/${token}`
    console.log(Link)


    let mailOptions = {
        from: 'serviceacount.premieleague@gmail.com',
        to: User.email,
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

async function getResetPassword(req,res){
    const{id,token} =  req.params;
    const user = await Admin.findOne({ _id: req.params.id })
    if(!user){
        res.send('Invalid Id...!');
    }
    try{
        const payload =jwt.verify(token,process.env.SECRET_KEY + user.password);
        res.render('reset-password',{email:user.email});

    }catch(error){
        console.log(error.message);
        res.send(error.message);
    }
}

//updating user password

async function ResetPassword(req,res){
    const{id,token} =  req.params;
    const user = await Admin.findOne({ _id: req.params.id });
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
    acceptUserReq,
    postLogin,
    postSignup,
    UpdateOrderReq,
    UpdateOrderStatus,
    GrantSubAdmin,
    totalActiveUser,
    totalNotActiveUser,
    totalBlockedUser,
    totalUser,
    MonthlyActiveUser,
    sortOrderByStatus,
    OrderByMonth,
    OrderByYear,
    OrderByWeek,
    forgotPassword,
    getResetPassword,
    ResetPassword
}
