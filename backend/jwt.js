const jwt=require('jsonwebtoken')

const jwtAuthMiddleware=(req,res,next)=>{
  const authorizationHeader=req.headers.authorization;
  if(!authorizationHeader) return res.status(404).json({error:'token not found'});
  const token=authorizationHeader.split(' ')[1];
  if(!token) return res.status(403).json({error:'unauthorised'});
  try{
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    req.user=decoded;
    next();
  }
  catch(err){
    console.log(err);
    res.status(401).json({error:"invalid token"});
  }
}

const generateToken=(payload)=>{
  return jwt.sign(payload,process.env.JWT_SECRET);
}

module.exports={jwtAuthMiddleware,generateToken}