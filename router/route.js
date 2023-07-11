const express = require('express')
const bcrypt = require('bcrypt')
const Usermodel = require('../model/usermodel');
const jwt = require('jsonwebtoken')
const {secretKey} = require('../config')
const router = express.Router()
const { authfunc, localVariables } = require('../middleware/auth');
const otpGenerator = require('otp-generator')
const registerMail  = require('../controllers/mailer')


// ** POST METHOD **//

//user registration
router.post('/register',async (req,res)=>{
    try{
        const {username,password,profile,email} = req.body;
        
            let selected_user = await Usermodel.findOne({username})
            
                if(selected_user) return res.status(201).send('username is already taken')

            let selected_email = await Usermodel.findOne({email})
                if(selected_email) return res.status(201).send('email is already in use')
             if(password){
               
                try{
                    const saltRounds = 10;
                const salt = await bcrypt.genSalt(saltRounds);
        
                hashedPassword = await bcrypt.hash(password,salt)
                    let user = new Usermodel({
                        username,
                        password: hashedPassword,
                        profile: profile ||" ",
                        email
                    })
                    await user.save()
                    res.status(201).send({user,msg:"registration successfull"})
                }catch(err){
                    res.status(500).send(err)
                }
                }
    }catch(err){
        console.log('Error:', err)
        res.status(500).send('Internal Server Error');
    }
})

//user mail registration
router.post('/registerMail',registerMail)


//user authentication
router.post('/authenticate',async(req,res)=>{
    try{
        const {username} = req.body;
        let selected_user = await Usermodel.findOne({username})
        if(!selected_user) return res.status(404).send('username not found')
        res.end()
    }catch(err){
        console.log('Error:', err)
        res.status(500).send('Internal Server Error');
    }
})


//login inside the page
router.post('/login',async (req,res)=>{
    
    try{

        const {username,password} = req.body;
        let selected_user = await Usermodel.findOne({username})
        if(!selected_user) return res.status(404).send('username not found')
        const validpass = await bcrypt.compare(password,selected_user.password)
        if(validpass){
            const token = jwt.sign({_id:selected_user._id,username:selected_user.username}, secretKey)
                    res.cookie(
                        't',
                        token,
                        {
                            expire: new Date(Date.now() + 9999 * 1000),
                        }
                    )
                   return res.status(200).send({token,user: {
                        _id: selected_user._id,
                        username: selected_user.username,
                        email: selected_user.email,
                    }})
                
                }
        else{
           return res.status(401).send("invalid userid or password")
        }
        
    }catch(err){
        console.log(err)
       return res.status(500).send('Internal Server Error');
    }
})

// ** GET METHOD **//

//get details based on user name
router.get('/user/:username',async(req,res)=>{
    try{
        let selected_user = await Usermodel.findOne({username:req.params.username})
        if(!selected_user) return res.status(200).send('username is not registered')
        //remove pwd & remove unnecessay data
        const {password, ...rest} = Object.assign({}, selected_user.toJSON())
        return res.status(201).send(rest)
    }catch(err){
        console.log('Error:', err)
        res.status(500).send('Internal Server Error');
    }
})

//generate otp for registration
router.get('/generateOTP',localVariables,async(req,res)=>{
    try{
        const {username} = req.query;
        let selected_user = await Usermodel.findOne({username})
        if(!selected_user) return res.status(404).send('username not found')
        req.app.locals.OTP = otpGenerator.generate(6,{lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false})
    
        res.status(201).send({code:req.app.locals.OTP})
    }catch(err){
        console.log('Error:', err)
        res.status(500).send('Internal Server Error');
    }
})


//verify otp
router.get('/verifyOTP',async(req,res)=>{
    try{
        const {username,code} = req.query;
        let selected_user = await Usermodel.findOne({username})
        if(!selected_user) return res.status(404).send('username not found')
        if(parseInt(req.app.locals.OTP) === parseInt(code)){
            req.app.locals.OTP = null;
            req.app.locals.resetSession = true
            return res.status(201).send({msg:"verified successfully"})
        }
        return res.status(400).send({Error:"invalid OTP"})
    }catch(err){
        console.log('Error:', err)
        res.status(500).send('Internal Server Error');
    }
})


//reset all variables
router.get('/createResetSession',(req,res)=>{
    try{
        if(req.app.locals.resetSession){
            return res.status(201).send({flag:req.app.locals.resetSession})
        }else{
            return res.status(440).send({Error:"session expirerd"})
        }
    }catch(err){
        console.log('Error:', err)
        res.status(500).send('Internal Server Error');
    }
})

// **PUT METHODS**//

//update user's profile
router.put('/updateuser/:id',authfunc,async (req,res)=>{
    try{
        const {_id} = req.user;
        const payload = req.body
        let selected_user = await Usermodel.findById(_id)
        if(selected_user){
            await Usermodel.updateOne({_id:_id},payload)
           return  res.status(200).send({msg:"updated successfully"})
        }else{
            return res.status(401).send('user not found')
        }
    }catch(err){
        return res.status(500).send('Internal Server Error');
    }
})

//reset password
router.put('/resetPassword',async(req,res)=>{
    if(!req.app.locals.resetSession) return res.status(440).send({Error:"session expirerd"})

    try{
        const {username,password} = req.body;
        let selected_user = await Usermodel.findOne({username})
        if(!selected_user) return res.status(404).send('username not found')
        if(password){
            try{
                const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
    
            hashedPassword = await bcrypt.hash(password,salt)
            await Usermodel.updateOne({username},{password:hashedPassword})
                req.app.locals.resetSession = false;
                res.status(201).send({msg:"password updated"})
            }catch(Error){
                res.status(500).send({Error:"unable to hash password...."})
            }
            }
    }catch(err){
        console.log('Error:', err)
        res.status(500).send('Internal Server Error');
    }
})

module.exports = router;