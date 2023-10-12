const Order = require("./../models/order");
const Admin = require('../models/admin');
const aleaRNGFactory = require("number-generator/lib/aleaRNGFactory");
const { uInt32 } = aleaRNGFactory(2);
const IO = require("../socket");
exports.postOrder = async(req, res, next) =>{
    try {
        const orderObj={
            orderId:uInt32(),
            userId:req.body.userId
        }
        const order = await new Order(orderObj);
        await order.save().then((result) => {
            res.status(201).json({ message: 'order Created Successfully!',order, });
            IO.getIO().emit('post:order',order);
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
        const order = await Order.findOne({userId: userid}).lean().populate("userId","-password") 
        if(order){
            IO.getIO().emit('get:order',order);
            return res.status(200).json({
                order,
                message: "User Orders",
                length: order.length
            })
        }
        IO.getIO().emit('get:order',order);
        res.status(200).json({
            order,
            message: "User Orders",
            length: order.length
        })
    }catch (error) {
        console.log(error); 
        res.status(500).json({
            message: "Something went wrong!",
            
        })
    }
}

exports.getAllOrder = async (req, res, next) =>{
    try {
        
        const order = await Order.find({}).lean().populate("userId","-password") 
        if(order){
            res.status(200).json({
                order,
                length: order.length,
                message: "All Orders"
            })
            IO.getIO().emit('get:order',order);
            
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!",
            
        })
    }
}

exports.getOrderById = async(req, res, next) =>{
    try{
        const id = req.params.id;

        const order = await Order.findById(id);

        if(order){
            res.status(200).json({
                order
            })
        }
    }catch(error){
        res.status(500).json({
            error,
            message: "Something went Wrong!"
        })
    }
}
exports.updateOrder = async (req, res, next) =>{
    try {
        const id = req.params.id;
        const order = await Order.findByIdAndUpdate(id, req.body);
        if(order){
            res.status(201).json({
                order,
                message: "Updated Order"
            })
            IO.getIO().emit('get:order',order);
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
        res.status(201).json({message: "order Deleted !"})
        IO.getIO().emit('get:order',deletedOrder);
    }catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
}

exports.getOrderById = async(req, res, next) =>{
    try{
        const order = await Order.find({_id: req.params.orderId}).lean().populate("userId","-password")
        if(order){
            IO.getIO().emit('get:order',order);
            return res.status(200).json({
                order,
                message: "User Orders",
                length: order.length
            })
        }
        IO.getIO().emit('get:order',order);
        res.status(200).json({
            order,
            message: "User Orders",
            length: order.length
        })
    }catch (error) {
        console.log(error); 
        res.status(500).json({
            message: "Something went wrong!",
            
        })
    }
}

exports.placeOrder = async(req, res, next) =>{
    try {
        const savedUserOrder = await Order.findOne({userId:req.params.userId});
        if (!savedUserOrder) {
            const orderObj={
            orderId:uInt32(),
            userId:req.params.userId
        }
        const createdOrder = await Order.create(orderObj);
        const products =  req.body.Products;
        if (req.body.insert ){
            products.forEach(product => {
                createdOrder.OrderedProducts.push(product)
                
            });
            const updateOrder = await createdOrder.save();
            return res.status(200).json({message:"Order Updated",updateOrder});
        }
            else if (req.body.Delete){
                const savedProducts = createdOrder.OrderedProducts.filter((product)=>{
                    let Id = product['_id']
                    return !products.includes(Id.toString());
                })
                
                createdOrder.OrderedProducts=savedProducts;
                const updateOrder = await createdOrder.save();
                return res.status(200).json({message:"Order Deleted Successfully",updateOrder});
            }
        }
        const products =  req.body.Products;
        if (req.body.insert ){
            products.forEach(product => {
                // console.log(product);
                savedUserOrder.OrderedProducts.push(product);
                
            });
            const updateOrder = await savedUserOrder.save();
            return res.status(200).json({message:"Order Updated",updateOrder});
        }
            else if (req.body.Delete){
                const savedProducts = savedUserOrder.OrderedProducts.filter((product)=>{
                    let Id = product['_id']
                    return !products.includes(Id.toString());
                })
                
                savedUserOrder.OrderedProducts=savedProducts;
                const updateOrder = await savedUserOrder.save();
                return res.status(200).json({message:"Order Deleted Successfully",updateOrder});
            }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        })
    }
}