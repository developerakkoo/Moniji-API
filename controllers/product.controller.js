
const Product = require('../models/product');
const Order = require("./../models/order");


exports.addProduct = async(req,res) => {
    const productDataObj={
        Make:req.body.Make,
        Type:req.body.Type,
        DiaInMm:req.body.DiaInMm,
        LengthInMm:req.body.LengthInMm,
        PartNo:req.body.PartNo
    }
    try{
        const createdProduct =  await Product.create(productDataObj);
        res.status(201).json({message:`Product Created Successfully`,createdProduct});
    }catch(error){
        res.status(500).json({message:`Something Went wrong try again`,status:`ERROR`,ERROR:error.message});
    }
}

exports.getAll = async(req,res) => {
    try{
        const savedProduct = await Product.find();
        if(!savedProduct){
            return res.status(400).json({message:`Products Not Found.!`})
        }
        res.status(200).json({message:'Products Fetched Successfully',count:savedProduct.length,savedProduct})
    }catch(error){
        
    res.status(500).json({message: error.message, status:`ERROR`});
    }
}

exports.productGetById = async (req,res) => {
    try{
        const Id = req.params.productId;
        const savedProduct = await Product.findOne({_id:Id});
        if(!savedProduct){
            return res.status(400).json({message:`Product Not Found`});
        }
        res.status(200).json({message:`Product Fetched Successfully.!`, savedProduct});
    }catch(error){
        console.log(error);
        res.status(500).json({message:error.message,status:`ERROR`});
    }
}


exports.updateProduct = async (req,res) => {
    try{
        const Id = req.params.productId
        const savedProduct = await Product.findById(Id);
        if(!savedProduct){
            return res.status(400).json({message:`Product Not Found`});
        }
        savedProduct.Make = req.body.Make != undefined
        ? req.body.Make
        : savedProduct.Make

        savedProduct.Type = req.body.Type != undefined
        ? req.body.Type
        :savedProduct.Type

        savedProduct.DiaInMm = req.body.DiaInMm != undefined
        ? req.body.DiaInMm
        :savedProduct.DiaInMm

        savedProduct.LengthInMm = req.body.LengthInMm != undefined
        ? req.body.LengthInMm
        :savedProduct.LengthInMm

        savedProduct.PartNo = req.body.PartNo != undefined
        ? req.body.PartNo
        :savedProduct.PartNo

        const updatedProduct =  await savedProduct.save();

        res.status(200).json({message:`Product Updated Successfully.!`,updatedProduct});
        
    }catch(error){
        console.log(error);
        res.status(500).json({message:error.message,status:`ERROR`});
    }
}

exports.deleteProduct = async (req,res) => {
    try{   const Id = req.params.productId;
    const savedProduct = await Product.findById(Id);
    if(!savedProduct){
        return res.status(400).json({message:`Product Does Not exist`});
    }
    await Product.deleteOne({
        _id : Id
    });
    res.status(200).json({message:`Product Deleted Successfully With ID:${Id}`});
    }catch(error){
        res.status(500).json({message:error.message,status:`ERROR`});
    }
}

exports.addProductToOrder = async(req,res) => {
    try{    const orderId = req.params.orderId;

    const savedOrder = await Order.findOne({_id:orderId});
    if (!savedOrder){
        return res.status(400).send({message:"savedOrder doesn't exists"});
    }
    const products =  req.body.Products;
    if (req.body.insert ){
        products.forEach(product => {
            savedOrder.OrderedProducts.push(product)
            
        });
        const updateOrder = await savedOrder.save();
        return res.status(200).json({message:"Order Updated",updateOrder});
    }
        else if (req.body.Delete){
            const savedProducts = savedOrder.OrderedProducts.filter((product)=>{
                let Id = product['_id']
                return !products.includes(Id.toString());
            })
            
            savedOrder.OrderedProducts=savedProducts;
            const updateOrder = await savedOrder.save();
            return res.status(200).json({message:"Order Deleted Successfully",updateOrder});
        }
        
    }catch(error){
        res.status(500).json({message:error.message,status:"ERROR"})
    }
}