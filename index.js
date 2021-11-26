const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("server side of theme park site");
});

async function run() {
  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dsdfh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    client.connect();
    const rideCollection = client.db("themepark").collection("rides");
    const orderCollection = client.db("themepark").collection("orders");

    app.post("/addride", async (req, res) => {
      const ride = req.body;
      const result = await rideCollection.insertOne(ride);
      res.json(result);
    });

    app.get("/rides", async (req, res) => {
      const rides = await rideCollection.find({}).toArray();
      res.json(rides);
    });

    app.get("/ride/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };
      const ride = await rideCollection.findOne(query);
      res.json(ride);
    });

    app.post("/order", async (req, res) => {
      const result = await orderCollection.insertOne(req.body);
      res.json(result);
    });

    app.get("/order", async (req, res) => {
      const result = await orderCollection
        .find({ email: req.query.email })
        .toArray();
      res.json(result);
    });

    app.get("/allorders", async (req, res) => {
      const result = await orderCollection.find({}).toArray();

      res.json(result);
    });

    app.delete("/deleteplan", async (req, res) => {
      const query = { _id: ObjectId(req.query.id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
      console.log(result);
    });

    app.put("/confirmplan/:id", async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: updatedUser.name,
          rideName: updatedUser.rideName,
          imgLink: updatedUser.imgLink,
          email: updatedUser.email,
          status: "Confirmed",
          rideFare: updatedUser.rideFare,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
    });
  } finally {
    // await client.close()
  }
}

run().catch(console.dir);

app.listen(PORT, () => {
  console.log("listening to port", PORT);
});
