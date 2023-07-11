const nodemailer = require('nodemailer')
const Mailgen = require('mailgen')

const {Email,PASSWORD} = require('../config');



let nodeconfig = {
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: Email,
    pass: PASSWORD
  }
}

let transpoter = nodemailer.createTransport(nodeconfig);

let MailGenerator = new Mailgen({
    theme:"default",
    "product":{
        name:"mailgen",
        link:"https://mailgen.js"
    }
})

const registerMail = async(req,res)=>{
    const {username,userEmail,text,subject} = req.body;
    var email ={
        body:{
            name: username,
            intro: text||"HEY! Have a great day...",
            outro:"Thanks for your time!"
        }
    }

    var emailbody = MailGenerator.generate(email)
    let message ={
        from:Email,
        to:userEmail,
        subject: subject||"default subject",
        html:emailbody
    }

    transpoter.sendMail(message)
    .then(()=>{
        return res.status(200).send({msg:"you should recieve an email from us"})
    })
    .catch((error)=>{
         res.status(500).send({error})
    })
}

module.exports = registerMail