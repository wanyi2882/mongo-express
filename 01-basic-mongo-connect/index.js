// const { MongoClient } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://root:rotiprata123@cluster0.uqm61.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

async function connect() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log("Database has been connected successfully")
    // use the db function to connect to a database server
    let db = client.db("sample_airbnb");
    // have to use the collection function
    let records = await db.collection('listingsAndReviews').find({}).limit(10).toArray();
    // let collection = db.collection('listingsAndReviews');
    // let results = await collection.find({}).limit(10);
    // let records= await results.toArray();
    for (let r of records) {
        console.log(r);
    }

}

connect();