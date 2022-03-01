import  express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js"
import Pusher from "pusher";
import cors from "cors"
const app = express()
const port = process.env.PORT || 9000

const pusher = new Pusher({
    appId: "<Pusher Id>",
    key: "<Pusher key>",
    secret: "<Pusher secret>",
    cluster: "Pusher cluster",
    useTLS: "true/false"
  });
  


app.use(express.json())
app.use(cors())

const connection_url = "<Enter_database_url>"
mongoose.connect(connection_url)

const db = mongoose.connection;

db.once("open",()=>{
    console.log("DB connected")
    const msgCollection = db.collection("messagecontents")
    const changeStream = msgCollection.watch();

    changeStream.on('change',(change) =>{
        console.log(change)

        if(change.operationType === 'insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('message','inserted',
                {
                    name: messageDetails.name,
                    message: messageDetails.message,
                    timestamp: messageDetails.timeStamp,
                    received: messageDetails.recieved
                })

        }
        else{
            console.log("err pusher")
        }
    })
})

app.get('/',(req,res) =>{ 
    res.status(200).send('hello world')
})

app.post('/message/new', (req,res) => {
    const dbMessage = req.body
    Messages.create(dbMessage, (err,data) =>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})

app.get('/message/sync', (req,res) => {
    Messages.find((err,data) =>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})


app.listen(port,()=> console.log("listeneing"))