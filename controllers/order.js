const Order = require("./../models/order");
const aleaRNGFactory = require("number-generator/lib/aleaRNGFactory");
const { uInt32 } = aleaRNGFactory(2);

exports.postOrder = async(req, res, next) =>{
    console.log(">>>>>>>>>>>")

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
        })
        .catch(err => {
            res.status(500).json({ error: err.message, message: 'Something went wrong!' })
        })
        // if(order){
        //     res.status(200).json({
        //         message:"Order Created!",
        //         order
        //     })
        // }
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
        
        const order = await Order.find({});

        if(order){
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
        const id = req.params.id;

        const order = await Order.findByIdAndDelete(id);

        if(order){
            res.status(201).json({
                message: "Deleted Order"
            })
        }

    }catch (error) {
        res.status(500).json({
            message: "Something went wrong!"
        })
}
}