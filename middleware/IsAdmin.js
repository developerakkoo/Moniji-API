const Admin = require('../models/admin');






async function isAdmin (req,res,next){
    const savedAdmin =  await Admin.findById({_id:req.params.id});
    if (!savedAdmin){
    return res.status(400).json({message: 'User dose not have admin access!'});
    }
    next()
}


module.exports={
    isAdmin
}