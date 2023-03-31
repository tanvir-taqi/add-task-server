const express = require('express');
const app = express();
const port = process.env.PORT || 5000
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send("adoor designs server is running ")
})



const uri = process.env.DATABASE_ACCESS
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async () => {
    try {
        const todosCollection = client.db('addtodos').collection('todos')

        app.post('/addtodos', async (req, res) => {

            const todo = req.body
            const result = await todosCollection.insertOne(todo)
            res.status(200).send(result)
        })

        app.get('/todos', async (req, res) => {
            const query = {}
            const result = await todosCollection.find(query).toArray()
            res.status(200).send(result)
        })

        app.put('/todos/:id', async (req, res) => {
            const id = req.params.id
            const status = req.body.toggleComplete

            const filter = { _id: new ObjectId(id) };

            const options = { upsert: true };
           

            const updateDoc = {
                $set: {
                    completed: status
                },
            };
            const result = await todosCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.put('/todosorder', async (req, res) => {
            const newOrder = req.body.todos;
            const newOrderWithoutId = newOrder.map(todo => {
                const newItem = { ...todo }
                newItem._id = new ObjectId(todo._id)
                delete newItem['id'] 
                return newItem
              });
         
            
            const result = await todosCollection.deleteMany({});
            const insertResult = await todosCollection.insertMany(newOrderWithoutId);
          
            res.status(200).send(insertResult);
          });
          
    }
    finally {

    }
}
run().catch(err => console.log(err))




app.listen(port, () => {
    console.log('====================================');
    console.log("App listening on port", port);
    console.log('====================================');
})