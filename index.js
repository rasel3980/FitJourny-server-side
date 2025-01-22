const express = require('express');
const app = express();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n4ll4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    // await client.connect();

    const trainersCollection = client.db("FitJourney").collection("trainers");
    const classesCollection = client.db("FitJourney").collection("classes");
    const bookedCollection = client.db("FitJourney").collection("booked");
    const appliedCollection = client.db("FitJourney").collection("applied");
    // const reviewCollection = client.db("FitJourney").collection("reviews");
    app.get('/class', async(req, res) =>{
      const result = await classesCollection.find().toArray();
      res.send(result);
  })

    app.get('/trainer', async(req, res) =>{
      const result = await trainersCollection.find().toArray();
      res.send(result);
  })
// trainer details
  app.get('/trainer-details/:id', async(req,res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await trainersCollection.findOne(query);
    res.send(result);
    console.log("result",result);
    console.log("id",id);
  })
// trainer booked 
  app.post("/trainer-booked", async (req, res) => {
    const trainerBooked = req.body;
    const result = await bookedCollection.insertOne(trainerBooked);
    res.send(result);
  });

  app.get("/trainer-booked/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { slotId: new ObjectId(id) };
    const result = await bookedCollection.findOne(filter);
    res.send(result);
  });
  // applied trainer information

  app.post("/trainer-apply", async (req, res) => {
    const data = req.body;
    const result = await appliedCollection.insertOne(data);
    res.send(result);
  });

    // jwt related api
    app.post("/jwt", async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.SECRET_KEY, {
          expiresIn: "365d",
        });
        res.send({token});

    })

    // middleware for verify token

    // TODO


    //  Trainers
    


    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('fitJourny is running')
})

app.listen(port,()=>{
    console.log(`FitJourny is running on ${port}`);
})