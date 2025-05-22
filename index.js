const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@alpha10.qadkib3.mongodb.net/?retryWrites=true&w=majority&appName=Alpha10`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
    const gardenersCollection = client
      .db("gardenersdb")
      .collection("gardeners");

    const tipsCollection = client.db("gardenersdb").collection("tips");

    app.post("/tips", async (req, res) => {
      const newTip = req.body;
      const result = await tipsCollection.insertOne(newTip);
      res.send(result);
    });

    app.get("/tips", async (req, res) => {
      const query = { availability: "Public" };
      const result = await tipsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/tips/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tipsCollection.findOne(query);
      res.send(result);
    });

    app.put("/tips/uniqueUser/:id", async (req, res) => {
      const id = req.params.id;
      const updatedTip = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDocument = {
        $set: updatedTip,
      };
      const result = await tipsCollection.updateOne(filter, updateDocument);
      res.send(result);
    });

    app.get("/tips/user/:mail", async (req, res) => {
      const mail = req.params.mail;
      const query = { email: mail };
      const result = await tipsCollection.find(query).toArray();
      res.send(result);
    });

    app.patch("/tips/like/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $inc: { totalLiked: 1 },
      };
      const result = await tipsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/trending", async (req, res) => {
      const query = { availability: "Public" };
      const result = await tipsCollection
        .find(query)
        .sort({ totalLiked: -1 })
        .limit(6)
        .toArray();

      res.send(result);
    });

    app.delete("/tips/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tipsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/gardeners/active", async (req, res) => {
      const result = await gardenersCollection
        .find({ status: "Active" })
        .limit(6)
        .toArray();
      res.send(result);
    });
    app.get("/gardeners", async (req, res) => {
      const result = await gardenersCollection.find().toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log("server is running at", port);
});
