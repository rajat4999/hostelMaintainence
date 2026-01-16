const checkStudent=async (req,res,next)=>{
    try{
      if(req.user.role!=='Student') return res.status(403).json({error:"access denied"});
      next();
    }
    catch(err){
      res.status(500).json({error:"internal server error"});
    }
}

module.exports=checkStudent;