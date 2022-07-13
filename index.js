const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT ||5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.beeqz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run () {
    try{
        await client.connect();
        const dataCollection = client.db('chart-data').collection('data');
        
        app.post('/data', async(req, res) => {
            const info = req.body;
            const result = await dataCollection.insertOne(info);
            res.send(result);
        });
        
        app.get('/data', async(req, res) => {
            const query = {};
            const cursor = dataCollection.find(query) ;
            const data = await cursor.toArray();
            res.send(data);
        })
    }
    finally{

    }
};
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hollo from info server');
});

app.listen(port, () => {
    console.log('Listening to port', port)
})