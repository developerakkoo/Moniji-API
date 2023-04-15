const Admin = require('../models/admin');
const SubAdmin= require('../models/SubAdmin.model');
const User= require('../models/user')
const Order = require("./../models/order");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const csvWriter =  require('csv-writer');
const writer = csvWriter.createObjectCsvWriter(
    {path:path.resolve(__dirname,'weeklyOrder.csv'),
    header:[
    { id: '_id', title: 'ID' },
    { id: 'createdAt', title: 'Week'}
]});
const writer1 = csvWriter.createObjectCsvWriter(
    {path:path.resolve(__dirname,'MonthlyOrder.csv'),
    header:[ 
    { id: '_id', title: 'ID' },
    { id: 'createdAt', title: 'Week'}
]});
const writer2 = csvWriter.createObjectCsvWriter(
    {path:path.resolve(__dirname,'YearlyOrder.csv'),
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
            },"!23ThisisaSecretFor@#$%^%^^&&allthebest", {expiresIn: '3h'})

            res.status(200).json({
                message: 'Sign In Successfull',
                token: token,
                userId: loadedUser._id.toString()
            })
        });
    }).catch(err =>{
        res.status(400).json({message: err.message, status:'error'});
    }).catch(error =>{
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
            res.status(201).json({message: 'Admin Created Successfully!', status: '201', userId: result._id});
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
    savedOrder.isAccepted = req.body.isAccepted 
    
    const updateOrder = await savedOrder.save();
const  postResponse={
    isAccepted:updateOrder.isAccepted

}
    res.status(200).json({message: 'Order updated Successfully!',postResponse});
}

async function UpdateOrderStatus(req, res, next){
    const savedAdmin =  await Admin.findOne({_id:req.params.id});
    if (!savedAdmin){
        return res.status(400).json({message: 'User dose not have admin access!'});
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
    return res.status(200).json({message: 'Order updated Successfully!',postResponse});
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
    writer2.writeRecords(order)
    .then(() =>{
    console.log("DONE!");
    }).catch((error) =>{
    console.log(error);
})
}

async function OrderByWeek(req, res, next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
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

    writer.writeRecords(order)
    .then(() =>{
    console.log("DONE!");
    }).catch((error) =>{
    console.log(error);
})
    //return res.status(200).send(order);

    
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
    OrderByWeek
}
