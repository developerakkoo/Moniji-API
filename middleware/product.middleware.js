exports.validateProduct = async (req,res,next) => {

    const productDataObj={
        Make:req.body.Make,
        Type:req.body.Type,
        DiaInMm:req.body.DiaInMm,
        LengthInMm:req.body.LengthInMm,
        PartNo:req.body.PartNo
    }

    if(!productDataObj.Make){
    res.status(400).json({message:`Product Make Is Require.!`});
    }
    if(!productDataObj.Type){
        res.status(400).json({message:`Product Type Is Require.!`});
        }
    if(!productDataObj.DiaInMm){
        res.status(400).json({message:`Product DiaInMm Is Require.!`});
        }
    if(!productDataObj.LengthInMm){
        res.status(400).json({message:`Product LengthInMm Is Require.!`});
        }
    if(!productDataObj.PartNo){
        res.status(400).json({message:`Product PartNo Is Require.!`});
        }
}