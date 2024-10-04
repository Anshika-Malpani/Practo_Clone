const express=require("express")
const app=express();
const port=process.env.PORT || 3000;
const cookieParser=require("cookie-parser")
const path=require("path")
const mongooseConnection=require('./config/mongoose-connection')
const cors = require('cors');
const usersRouter=require("./routes/userRouter")
const signalingServer = require('./signalingServer');

require("dotenv").config();

const corsOptions = {
    origin: 'http://localhost:5173', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
    optionsSuccessStatus: 204 
};


app.use(cors(corsOptions));
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())



app.use(express.static(path.join(__dirname,"public")));

app.use("/users",usersRouter)

mongooseConnection()

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
  });