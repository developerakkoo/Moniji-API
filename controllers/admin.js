const Admin = require('../models/admin');
const moment = require('moment')
const SubAdmin= require('../models/SubAdmin.model');
const User= require('../models/user')
const Order = require("./../models/order");
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const IO =  require('./../socket');
const path = require('path');
const csvWriter =  require('csv-writer');
require('dotenv').config();
const writer = csvWriter.createObjectCsvWriter(
    {path:path.resolve(__dirname,'public/weeklyOrder.csv'),
    header:[
        { id: 'orderId', title: 'orderId'},
        { id: 'diameter', title: 'diameter'},
        { id: 'length', title: 'length' },
        { id: 'make', title: 'make'},
        { id: 'quantity', title: 'quantity'},
        { id: 'status', title: 'status' },
        { id: 'type', title: 'type'},
        { id: 'message', title: 'message' },
        { id: 'Date', title: 'Date'},
]});
const writer1 = csvWriter.createObjectCsvWriter(
    {path:path.resolve(__dirname,'public/oneMonthOrder.csv'),
    header:[ 
        { id: 'orderId', title: 'orderId'},
        { id: 'diameter', title: 'diameter'},
        { id: 'length', title: 'length' },
        { id: 'make', title: 'make'},
        { id: 'quantity', title: 'quantity'},
        { id: 'status', title: 'status' },
        { id: 'type', title: 'type'},
        { id: 'message', title: 'message' },
        { id: 'Date', title: 'Date'},
]});
const writer2 = csvWriter.createObjectCsvWriter(
    {path:path.resolve(__dirname,'public/ThreeMonthOrder.csv'),
    header:[ 
        { id: 'orderId', title: 'orderId'},
        { id: 'diameter', title: 'diameter'},
        { id: 'length', title: 'length' },
        { id: 'make', title: 'make'},
        { id: 'quantity', title: 'quantity'},
        { id: 'status', title: 'status' },
        { id: 'type', title: 'type'},
        { id: 'message', title: 'message' },
        { id: 'Date', title: 'Date'},
]});
const writer3 = csvWriter.createObjectCsvWriter(
    {path:path.resolve(__dirname,'public/sixMonthOrder.csv'),
    header:[ 
        { id: 'orderId', title: 'orderId'},
        { id: 'diameter', title: 'diameter'},
        { id: 'length', title: 'length' },
        { id: 'make', title: 'make'},
        { id: 'quantity', title: 'quantity'},
        { id: 'status', title: 'status' },
        { id: 'type', title: 'type'},
        { id: 'message', title: 'message' },
        { id: 'Date', title: 'Month'},
]});

const writer4 = csvWriter.createObjectCsvWriter(
    {path:path.resolve(__dirname,'public/YearlyOrder.csv'),
    header:[
        { id: 'orderId', title: 'orderId'},
        { id: 'diameter', title: 'diameter'},
        { id: 'length', title: 'length' },
        { id: 'make', title: 'make'},
        { id: 'quantity', title: 'quantity'},
        { id: 'status', title: 'status' },
        { id: 'type', title: 'type'},
        { id: 'message', title: 'message' },
        { id: 'year', title: 'year'}
    ]});

    const writer5 = csvWriter.createObjectCsvWriter(
        {path:path.resolve(__dirname,'public/CostumeDateOrder.csv'),
        header:[
            { id: 'orderId', title: 'orderId'},
            { id: 'diameter', title: 'diameter'},
            { id: 'length', title: 'length' },
            { id: 'make', title: 'make'},
            { id: 'quantity', title: 'quantity'},
            { id: 'status', title: 'status' },
            { id: 'type', title: 'type'},
            { id: 'message', title: 'message' },
            { id: 'Date', title: 'Date'}
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
            IO.getIO().emit('post:adminLogin',postResponse);
            res.status(200).json({message: 'Sign In Successful',postResponse})
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
            IO.getIO().emit('post:adminSignup',result);
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
    IO.getIO().emit('get:user',postResponse);
    res.status(200).json({message: 'User updated Successfully!',postResponse});
}

async function BlockUser(req, res, next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const savedUser = await User.findById({_id:req.body.id});
    if(!savedUser){
        return res.status(400).json({message: 'User dose not exist !'});
    }
    savedUser.isBlocked = req.body.isBlocked 

    const saveUser = await savedUser.save();
    const postResponse={
        userId:saveUser._id,
        isBlocked:saveUser.isBlocked
    }
    IO.getIO().emit('get:user',postResponse);
    res.status(200).json({message: 'User updated Successfully!',postResponse});
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
    IO.getIO().emit('put:order',postResponse);
    res.status(200).json({message: 'Order updated Successfully!',postResponse});
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

    IO.getIO().emit('get:orderStatus',updateOrder);
    res.status(200).json({message: 'Order updated Successfully!',updateOrder});
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
    IO.getIO().emit('get:ActiveSubAdmin',postResponse);
    res.status(200).json({message: 'User updated Successfully!',postResponse});
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
    IO.getIO().emit('get:ActiveUser',user);
    res.status(200).json({message: 'User fetched Successfully!',user});
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
    IO.getIO().emit('get:NotActiveUser',user);
    res.status(200).json({message: 'User fetched Successfully!',user});
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
    IO.getIO().emit('get:BlockedUser',user);
    res.status(200).json({message: 'User fetched Successfully!',user});
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
    IO.getIO().emit('get:TotalUser',user);
    res.status(200).json({message: 'User fetched Successfully!',user});
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
    IO.getIO().emit('get:monthlyActiveUser',user);
    res.status(200).json({message: 'User fetched Successfully!',user});
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
    IO.getIO().emit('get:OrderByStatus',order);
    res.status(200).json({message: 'User fetched Successfully!',order});
}
async function OrderByWeek(req, res, next){
    console.log(req.params.id)
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const pipeline =[
    {
        $match: {
        Date: {
            $gte: moment().subtract(1, 'weeks').startOf('isoWeek').format('DD-MM-YY'),
            $lte: moment().subtract(1, 'weeks').endOf('isoWeek').format('DD-MM-YY'),
        },
        },
    },
    {
        '$project': {
            'orderId':'$orderId',
            'userId':'$userId',
            'diameter':'$diameter',
            'length':'$length',
            'quantity':'$quantity',
            'make':'$make',
            'status':'$status',
            'type':'$type',
            'Message':'$message',
            'Date' : '$Date',
        }
    },
    ]

    const order = await Order.aggregate(pipeline);
    console.log(order[0].orderDetail)
    IO.getIO().emit('get:OrderByWeek',order);
    const message ={
        message: 'order fetched Successfully!',
        
    }
    res.status(200).json(order);
        writer.writeRecords(order)
        .then(() =>{
        console.log("DONE!");
        }).catch((error) =>{
        console.log(error);
    })
    
}



async function OrderOfLastOneMonth(req, res, next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const pipeline =
    [
        { 
            $match: {
            Month: {
                $gte: moment().subtract(2, 'months').startOf('isoMonth').format('MM'),
                $lte: moment().subtract(1, 'months').endOf('isoMonth').format('MM'),
            },
            },
        },
        {
            '$project': {
                'orderId':'$orderId',
                'userId':'$userId',
                'diameter':'$diameter',
                'length':'$length',
                'quantity':'$quantity',
                'make':'$make',
                'status':'$status',
                'type':'$type',
                'Message':'$message',
                'isAccepted':'$isAccepted',
                'Date' : '$Date',
                
            }
        },
    ]
    const order = await Order.aggregate(pipeline)
    console.log('order>>',order)
    console.log('>>',order.length)
    IO.getIO().emit('get:OrderByMonth',order);
    res.status(200).json(order);
    writer1.writeRecords(order)
    .then(() =>{
    console.log("DONE!");
    }).catch((error) =>{
    console.log(error);
    })
    
}
async function OrderOfThreeMonth(req, res, next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const pipeline =
    [
        { 
            $match: {
            Month: {
                $gte: moment().subtract(3, 'months').startOf('isoMonth').format('MM'),
                $lte: moment().subtract(1, 'months').endOf('isoMonth').format('MM'),
            },
            },
        },
        {
            '$project': {
                'orderId':'$orderId',
                'userId':'$userId',
                'diameter':'$diameter',
                'length':'$length',
                'quantity':'$quantity',
                'make':'$make',
                'status':'$status',
                'type':'$type',
                'Message':'$message',
                'Date' : '$Date'
            }
        },
    ]
    const order = await Order.aggregate(pipeline)
    // console.log(order)
    IO.getIO().emit('get:OrderByMonth',order);
    res.status(200).json(order);
        writer2.writeRecords(order)
        .then(() =>{
        console.log("DONE!");
        }).catch((error) =>{
        console.log(error);
    })
}

async function OrderOfSixMonth(req, res, next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const pipeline =
    [
        { 
            $match: {
            Month: {
                $gte: moment().subtract(6, 'months').startOf('isoMonth').format('MM'),
                $lte: moment().subtract(1, 'months').endOf('isoMonth').format('MM'),
            },
            },
        },
        {
            '$project': {
                'orderId':'$orderId',
                'userId':'$userId',
                'diameter':'$diameter',
                'length':'$length',
                'quantity':'$quantity',
                'make':'$make',
                'status':'$status',
                'type':'$type',
                'Message':'$message',
                'Date' : '$Date',
            }
        },
    ]
    const order = await Order.aggregate(pipeline)
    IO.getIO().emit('get:OrderByMonth',order);
    res.status(200).json(order);
        writer3.writeRecords(order)
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
            'orderId':'$orderId',
            'userId':'$userId',
            'diameter':'$diameter',
            'length':'$length',
            'quantity':'$quantity',
            'make':'$make',
            'status':'$status',
            'type':'$type',
            'Message':'$message',
            'Date' : '$Date',
            'year': {'$year': '$createdAt'}
        }
        }
    ]
    const order = await Order.aggregate(pipeline)
    IO.getIO().emit('get:OrderByYear',order);
    res.status(200).json({message: 'User fetched Successfully!',order});
    writer4.writeRecords(order)
    .then(() =>{
    console.log("DONE!");
    }).catch((error) =>{
    console.log(error);
    })
}


async function OrderOfCostumeDate(req, res, next){
    console.log('Start',req.query.fromDate)
    console.log('end',req.query.toDate)
    console.log('head',req.headers.id)

    const savedAdmin =  await Admin.findById({_id:req.headers.id});
    if (!savedAdmin){
        return  res.status(400).json({message: 'User dose not have admin access!'});
    }
    const Start =req.query.fromDate
    const End =req.query.toDate
    const pipeline =
    [
        { 
            $match: {
            Month: {
                $gte: Start,
                $lte: End,
            },
            },
        },
        {
            '$project': {
                'orderId':'$orderId',
                'userId':'$userId',
                'diameter':'$diameter',
                'length':'$length',
                'quantity':'$quantity',
                'make':'$make',
                'status':'$status',
                'type':'$type',
                'Message':'$message',
                'Date' : '$Date',
                'isAccepted':'$isAccepted',
                
            }
        },
    ]
    const order = await Order.aggregate(pipeline)
    IO.getIO().emit('get:OrderByMonth',order);
    res.status(200).json(order);
    writer5.writeRecords(order)
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
    const Link = `http://localhost:8080/rest-password-admin/${User._id}/${token}`
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
        res.render('reset-password-admin',{email:user.email});

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
    BlockUser,
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
    OrderByWeek,
    OrderOfLastOneMonth,
    OrderOfThreeMonth,
    OrderOfSixMonth,
    OrderByYear,
    OrderOfCostumeDate,
    forgotPassword,
    getResetPassword,
    ResetPassword
}
