const express = require('express');
const cors= require ('cors');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000;
const { ObjectId } = require('mongodb');
app.use(cors());
app.use(express.json());



//
//



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5w5rxcd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const gardenCollection = client.db('gardenDB').collection('ShareTips');


    //Create Tips
    app.post('/addTips', async (req, res) => {
      const shareTips = req.body;
      console.log(shareTips);
      const result = await gardenCollection.insertOne(shareTips);
    res.send(result);
    })

//Get add tips
    app.get('/addTips', async (req, res) => {
    const result = await gardenCollection.find().toArray();
    res.send(result);
    });

//Update Tips

//Delete Tips
    app.delete('/deleteTip/:id', async (req, res) => {
    const result = await gardenCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
    });

    //Get Public or Browse Tips
    app.get('/publicTips', async (req, res) => {
    const difficulty = req.query.difficulty;
    const query = { availability: 'Public' };

    if (difficulty) {
        query.difficulty = difficulty;
    }

    const result = await gardenCollection.find(query).toArray();
    res.send(result);
    });



    //Get Explore Gardeners
    app.get('/gardeners', async (req, res) => {
        try {
        const gardeners = await client.db('gardenDB')
        .collection('gardeners')
        .find({})
        .toArray();
        res.send(gardeners);
     }   catch (error) {
        console.error('Error fetching gardeners:', error);
        res.status(500).send({ message: 'Server error' });
    }
    });

    //Get Active Gardeners in homepage
    app.get('/activeGardeners', async (req, res) => {
        const gardeners = await client.db('gardenDB')
        .collection('gardeners')
        .find({ status: 'active' })
        .limit(6)
        .toArray();
        res.send(gardeners);
    });




//TipsDetails
app.get('/tip/:id', async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const tip = await gardenCollection.findOne({ _id: id });
    if (!tip) {
      return res.status(404).send({ message: 'Tip not found' });
    }
    res.send(tip);
  } catch (error) {
    console.error('Error fetching tip:', error);
    res.status(500).send({ message: 'Server error' });
  }
});






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);










app.get('/', (req, res) => {
  res.send('Garden server is running ');
})

app.listen(port, () => {
  console.log(`Garden server running on port ${port}`);
})