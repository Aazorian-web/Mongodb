require('dotenv').config(); // access env file which is hidden to the public
const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');
const ProfileModel = require('./profile');
const {MongoClient} = require('mongodb');

const app = express();
const port = process.env.PORT;
const uri = process.env.MONGO_DB_URI;
const client = new MongoClient(uri);


app.use(cors({
    orgin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
    

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => (console.log('connect to mongodb')), err => {console.log(`cant connect to db ${err}`)});

    app.get('/get-profiles', async (req, res) => {
        try {
            const profiles = await ProfileModel.find();
            res.status(200).json(profiles);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to fetch profiles' });
        }
    });

app.delete('/delete-profiles', (req, res) => {
    async function run() {
    try {
        const database = client.db("project-forms");
        const profiles = database.collection("mongochallenge")
        const result = await profiles.deleteOne();
        if (result.deletedCount ===1 ) {
          res.status(200).send({  
        message: 'Successfully deleted one document.'
    });
  }  else {
    res.status(200).send({  
        message: 'No documents matched the query. Deleted 0 documents.'
    });
}
    } catch (err) {
        console.log(err);
    }
    }
    run().catch(console.dir);
})

app.post('/add-profile', async (req, res) => {
    const incomingData = req.body;
    try {
        const newProfile = new ProfileModel(incomingData);
        await newProfile.save();
        res.status(200).json({ message: 'Profile added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add profile' });
    }
});

 app.listen(port , () => {
    console.log(`server is running at https://localhost:${port}`);
 });
