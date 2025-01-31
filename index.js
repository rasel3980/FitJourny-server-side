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
    const subscribeCollection = client.db("FitJourney").collection("subscribe");
    const usersCollection = client.db("FitJourney").collection("users");
    // const reviewCollection = client.db("FitJourney").collection("reviews");
    app.get('/class', async(req, res) =>{
      const result = await classesCollection.find().toArray();
      res.send(result);
  })

  app.post('/add-class', async(req,res)=>{
    const newClass = req.body
    const result = await classesCollection.insertOne(newClass)
    res.send(result)
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
    // console.log('result',result);
    res.send(result);
  })
// NewsLetter Subscriber
app.post('/Subscriber', async (req, res) => {
  const { name, email } = req.body; // Destructure name and email from the request body
  if (!name || !email) {
    return res.status(400).send({ error: "Name and Email are required." });
  }

  try {
    const userSubscribe = { name, email }; // Store name and email in the object
    const result = await subscribeCollection.insertOne(userSubscribe); // Insert the data into the collection
    res.send(result); // Send the result back to the client
  } catch (error) {
    console.error("Database error:", error); // Log any errors
    res.status(500).send({ error: "An error occurred while processing your request." });
  }
});

app.get('/subscriber', async(req,res)=>{
  const result = await subscribeCollection.find().toArray()
  res.send(result)
})



 // save or update a user in db
 app.post('/user/:email', async (req, res) => {
  const email = req.params.email
  const query = { email }
  const user = req.body
  const isExist = await usersCollection.findOne(query)
  if (isExist) {
    return res.send(isExist)
  }
  const result = await usersCollection.insertOne({
    ...user,
    role: 'Member',
    timestamp: Date.now(),
  })
  res.send(result)
})

// get users role

app.get('/users/role/:email', async(req,res)=>{
  const email = req.params.email
  const result = await usersCollection.findOne({email})
  res.send({role: result?.role})
})

// trainer booked 
  app.post("/trainer-booked", async (req, res) => {
    const trainerBooked = req.body;
    const result = await bookedCollection.insertOne(trainerBooked);
    res.send(result);
  });

  app.get("/trainer/booked/:id", async (req, res) => {
    const { id } = req.params; // Extract the trainer's ID from the URL
    try {
      const result = await bookedCollection.findOne({ _id: id }); // Assuming you store the ID as '_id' in the database
      if (!result) {
        return res.status(404).send({ message: "Trainer not found" });
      }
      res.send(result); // Send the trainer's booking details
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error fetching trainer data" });
    }
  });
  
  
  // Example route for booking a slot
app.get("/booking/:trainerId/:slotId", async (req, res) => {
  const { trainerId, slotId } = req.params;
  
  // Query the database for the trainer and slot details
  const trainer = await trainerCollection.findOne({ _id: trainerId });
  const slot = trainer.availableSlots
    .flatMap((s) => s.timeSlots)
    .find((s) => s.slotId === slotId);

  if (!trainer || !slot) {
    return res.status(404).send("Trainer or Slot not found");
  }

  res.send({ trainer, slot });
});



  // applied trainer information

  app.post("/trainer-apply", async (req, res) => {
    const data = req.body;
    const result = await appliedCollection.insertOne(data);
    res.send(result);
  });

  // Sample backend endpoint to fetch posts with pagination
app.get("/posts", async (req, res) => {
  const { page = 1, limit = 6 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const posts = await Post.find().skip(offset).limit(Number(limit)); // MongoDB query
    const totalPosts = await Post.countDocuments(); // Get total number of posts for pagination

    res.json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

// Sample backend endpoint to handle votes
app.post("/api/vote", async (req, res) => {
  const { postId, voteType, userId } = req.body; // postId and voteType (upvote/downvote)

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    const post = await Post.findById(postId);

    if (voteType === "upvote") {
      post.upvotes += 1;
    } else if (voteType === "downvote") {
      post.downvotes += 1;
    }

    await post.save();
    res.json({ message: "Vote successfully recorded." });
  } catch (err) {
    res.status(500).json({ error: "Failed to vote." });
  }
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
    res.send('fitJourney is running')
})

app.listen(port,()=>{
    console.log(`FitJourney is running on ${port}`);
})