const Order = require("./../models/order");
const Admin = require('../models/admin');
const aleaRNGFactory = require("number-generator/lib/aleaRNGFactory");
const { uInt32 } = aleaRNGFactory(2);
const IO = require("../socket");
exports.postOrder = async(req, res, next) =>{
    try {
        const orderObj={
            diameter:req.body.diameter,
            length:req.body.length,
            make:req.body.make,
            quantity:req.body.quantity,
            orderId:uInt32(),
            type:req.body.type,
            userId:req.body.userId
        }
        const order = await new Order(orderObj);
        await order.save().then((result) => {
            res.status(201).json({ message: 'order Created Successfully!', status: '201', orderId: result.orderId, });
            IO.getIO().emit('get:order',order);
        })
        .catch(err => {
            res.status(500).json({ error: err.message, message: 'Something went wrong!' })
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
}

exports.getOrderByUserId = async(req, res, next) =>{
    try{
        const userid = req.params.userid;
        const order = await Order.find({userId: userid});
        if(order){
            IO.getIO().emit('get:order',order);
            res.status(200).json({
                order,
                message: "User Orders",
                length: order.length
            })
        }
    }catch (error) {
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
}

exports.getAllOrder = async (req, res, next) =>{
    try {
        
        const order = await Order.find({}).populate("userId");
        if(order){
            IO.getIO().emit('get:order',order);
            res.status(200).json({
                order,
                length: order.length,
                message: "All Orders"
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
}

exports.updateOrder = async (req, res, next) =>{

    try {
        const id = req.params.id;
        const order = await Order.findByIdAndUpdate(id, req.body);
        if(order){
            IO.getIO().emit('get:order',order);
            res.status(201).json({
                order,
                message: "Updated Order"
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
}

exports.deleteOrder = async(req, res, next) =>{
    try{
        const savedAdmin =  await Admin.findById({_id:req.params.id});
        if (!savedAdmin){
            return  res.status(400).json({message: 'User dose not have admin access!'});
        }
        const id = req.body.id;
        const order = await Order.findById(id);
        if(!order){
            return res.status(201).json({message: "order dose not exist"})
        }
        const deletedOrder = await Order.deleteOne({
            _id : req.params.id
        });
        IO.getIO().emit('get:order',deletedOrder);
        res.status(201).json({message: "order Deleted !"})
    }catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong!"
        })
}
}