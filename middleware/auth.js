const jwt = require('jsonwebtoken')
const {secretKey} = require('../config')


const authfunc = async (req,res,next)=>{
  try{
      const headerToken = req.headers.authorization;
      if(typeof headerToken !== 'undefined'){
        const tokenval = headerToken.split(' ')[1]
        req.token = tokenval
        const decodedToken = await jwt.verify(req.token,secretKey)
        req.user = decodedToken;  //this makes the decodedToken a property of req object so it can be accessed on other files too
        next()
    }else{
        res.status(403).send('headertoken is returned as undefined')
    }
  }catch(err){
    res.status(401).json({err:"Authentication failed!"})
  }
}


const localVariables = (req,res,next)=>{
    req.app.locals = {
        OTP: null,
        resetSession: false
    }
    next()
}

module.exports = {
    authfunc: authfunc,
    localVariables: localVariables,
};