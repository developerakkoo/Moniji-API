const SubAdmin= require('../models/SubAdmin.model');



async function isSubAdmin(req,res,next){
    const savedSubAdmin =  await SubAdmin.findById({_id:req.params.id});
    if (!savedSubAdmin){
        return  res.status(400).json({message: 'User dose not have sub admin access!'});
    }
    if (!savedSubAdmin.isActive){
        return  res.status(400).json({message: 'Sub Admin not activate !'});
    }
}