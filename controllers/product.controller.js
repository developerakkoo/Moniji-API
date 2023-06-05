const product = require('../models/product');
const Product = require('../models/product');



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
    const pageNumber = req.query.page || 1; // Get the current page number from the query parameters
    const pageSize = 10; // Number of items per page
    
    Product.paginate({}, { page: pageNumber, limit: pageSize }, (err, result) => {
    if (err) {
        return res.status(500).json({ message: 'Error occurred while fetching Data.' });
    }
    
    const { docs, total, limit, page, pages } = result;
    res.json({ Products: docs, total, limit, page, pages });
    });
    }catch(error){
        console.log(error);
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