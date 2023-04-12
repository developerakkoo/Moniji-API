const Order = require("./../models/order");

exports.postOrder = async(req, res, next) =>{
    try {
        const order = await Order.create(req.body);
        if(order){
            res.status(200).json({
                message:"Order Created!",
                order
            })
        }
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