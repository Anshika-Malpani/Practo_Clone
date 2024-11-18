const express=require("express")
const app=express();
const port=process.env.PORT || 3000;
const cookieParser=require("cookie-parser")
const path=require("path")
const mongooseConnection=require('./config/mongoose-connection')
const cors = require('cors');
const usersRouter=require("./routes/userRouter")
const docotrsRouter=require("./routes/doctorRouter")
const chatRouter=require("./routes/chatRouter")
const messageRouter=require("./routes/messageRouter")
const consulationRouter=require("./routes/consulationRouter")
const meetingRouter=require("./routes/meetingRouter")
const recordingRouter=require("./routes/recordingRouter")
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

app.use("/doctor",docotrsRouter)

app.use("/chat",chatRouter)

app.use("/messages",messageRouter)

app.use("/consultation",consulationRouter)

app.use("/meeting",meetingRouter)

app.use("/recording",recordingRouter)

mongooseConnection()

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
  });