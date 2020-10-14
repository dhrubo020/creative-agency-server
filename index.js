const express = require('express')
const app = express()
const port = 3001

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors')
app.use(cors())

require('dotenv').config()

const ObjectId = require('mongodb').ObjectId;


const MongoClient = require('mongodb').MongoClient;

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.fxpfd.mongodb.net:27017,cluster0-shard-00-01.fxpfd.mongodb.net:27017,cluster0-shard-00-02.fxpfd.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-we805n-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const service_collection = client.db("db_creative_agency").collection("coll_services");
    const admin_email_collection = client.db("db_creative_agency").collection("coll_admin_email");

    const order_collection = client.db("db_creative_agency").collection("coll_orders");
    const review_collection = client.db("db_creative_agency").collection("coll_reviews");
    console.log("db connected")


    //---------- total 12 apis --------


    app.post('/addNewService', (req, res) => { //---------------- add New Service
        service_collection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.post('/addNewAdmin', (req, res) => { // ------------------ add New Admin
        admin_email_collection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/getAdminEmails', (req, res) => { //---------------- get all admin emails
        admin_email_collection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/checkingWhoYouAre' , (req, res)=>{ //---------------- checking Who You Are - admin or not
        admin_email_collection.find({email: req.body.email})
            .toArray((err, documents) => {
                if(documents.length > 0){
                    res.send({person: 'admin'})
                }else{
                    res.send({person: 'user'})
                }
            })
    })

    app.get('/getService', (req, res) => { //---------------- get all Service
        service_collection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.delete('/deleteItem/:id', (req, res) => { // --------------------- admin can delete a service
        service_collection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                if (documents.length > 0) {
                    service_collection.deleteOne({ _id: ObjectId(req.params.id) })
                        .then(result => {
                            res.send(result.deletedCount > 0)
                        })
                }
            })
    })

    app.get('/getAllOrder', (req, res) => { //---------------- get All Orders
        order_collection.find({})
            .toArray((err, documents)=>{
                res.send(documents)
            })
    })

    app.patch('/updateStatus', (req,res)=>{ //---------------- update Status
        order_collection.updateOne(
            {_id : ObjectId(req.body.id)},
            {
                $set: { status: req.body.newStatus},
                $currentDate : { "lastModified": true }
            }
        )
        .then(result =>{
            res.send(result.modifiedCount > 0)
        })
    })


    // ---------- API FOR USER -----------------


    app.post('/placeOrder', (req, res) => { //----------------user place Order
        order_collection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/addReview', (req, res) => { //---------------- user add Review
        review_collection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/allReview', (req, res) => { //---------------- showing all user Review
        review_collection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })
    app.post('/getOrderedItems' , (req, res) => { //---------------- get a users Ordered Items by email
        order_collection.find({email: req.body.email})
            .toArray((err, documents) =>{
                res.send(documents);
            })
    })

});



app.get('/', (req, res) => {
    res.send('Creative Agency Backend Server!')
})

app.listen(process.env.PORT || port, () => {
    console.log(`Listening at http://localhost:${port}`)
})