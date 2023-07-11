const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const connection = require('./database/connect.js')
const router = require('./router/route.js')
const app = express()


connection.then(() => {
    console.log('Connection successful with valid connect in database');
  }).catch(err => console.log('Connection failed as invalid connection', err));

app.use(express.json())
app.use(cors())
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(morgan('tiny'))
app.use('/api',router)

const port = process.env.PORT || 8000


app.get('/',(req,res)=>{
    res.status(200).send("the get operation is succesfull")
})

app.listen(port,()=>{console.log(`running in ${port}`)})