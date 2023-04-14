const SubAdmin= require('../models/SubAdmin.model');
const Admin = require('../models/admin');
const User= require('../models/user')
const Order = require("./../models/order");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');




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
        res.status(200).json({
            message: 'Sign In Successfull',
            token: token,
            userId: SavedUser._id
        })
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
            res.status(201).json({message: 'Sub Admin Created Successfully!', userId: result._id});
        }
        catch(error){
            res.status(400).send({message: error.message});
        
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
    return res.status(200).json({message: 'Order updated Successfully!',postResponse});
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
        return res.status(201).json({message: "order Deleted !"})

    }catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong!"
        })
}
}


module.exports ={
    postLogin,
    postSignup,
    subAcceptUserReq,
    subUpdateOrderReq,
    subUpdateOrderStatus,
    SubAdminDeleteOrder
}


