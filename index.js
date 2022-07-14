const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const app = express();
const port = process.env.PORT ||5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.beeqz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const auth = {
    auth: {
      api_key: `${process.env.MAILGUN_API_KEY}`,
      domain: `${process.env.MAILGUN_DOMAIN}`
    }
  }
  
  const nodemailerMailgun = nodemailer.createTransport(mg(auth));

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
        });

        app.delete('/data/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await dataCollection.deleteOne(filter);
            res.send(result);
        });

        app.post('/email', async(req, res) => {
            const info = req.body;
            nodemailerMailgun.sendMail({
                from: 'xyz@gmail.com',
                to: 'mdomarfaruk149518@gmail.com',
                subject: 'Send mail from intersshala assesment.',
                html:`<h1>${info.name}'s info is saved on mongodb. </h1>
                <h3>Detail info</h3>
                <p>Name: ${info.name}</p>
                <p>Email: ${info.email}</p>
                <p>Phone Number: ${info.phoneNumber}</p>
                <p>Hobby: ${info.hobbies}</p>`,
                text: '<b>Wow Big powerful letters</b>'
              }, (err, info) => {
                if (err) {
                  console.log(`Error: ${err}`);
                }
                else {
                  console.log(`Response: ${info}`);
                }
              });
            res.send({status: true});
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