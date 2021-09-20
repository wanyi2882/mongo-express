const express = require('express')
const hbs = require('hbs');
const { Db } = require('mongodb');
const wax = require('wax-on')
const MongoUtil = require('./MongoUtil')
// import in ObjectId function from the mongodb package
const ObjectId = require('mongodb').ObjectId;

// setup dotenv library
// const dotenv = require('dotenv');
// dotenv.config();
// OR:
require('dotenv').config(); // <-- nodejs will read the content of the .env
                            // file and put the variables inside there
                            // into the operating system

// how to access varaible in operating system?
// console.log(process.env.MONGO_URI);

let app = express();
// use handlebars for the view engines
app.set('view engine', 'hbs');
// set the public folder to store all the static files
app.use(express.static('public'));

// enable template inheritance
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

// setup handlebars-heleprs
const heleprs = require('handlebars-helpers')({
    "handlebars": hbs.handlebars
})

// enable forms
app.use(express.urlencoded({extended: false}));

// ROUTES
async function main(){
    await MongoUtil.connect(process.env.MONGO_URI, "tgc14_cico");


    app.get('/', async function(req,res){
       res.send("welcome")
    })

    app.get('/food_record/add', function(req,res){
        res.render('add_food_record')
    })

    app.post('/food_record/add', async function(req,res){
        // let foodRecordName = req.body.foodRecordName;
        // let calories = req.body.calories;
        // let tags = req.body.tags;
        // OR use object destructuring:
        let { foodRecordName, calories, tags} = req.body;

        // normalize the tags 
        // 1. if tags is undefined, normalize to empty array
        tags = tags || [];
        // 2. if tags is a string (i.e not an array), normalize to an array with that string as its only element
        if (Array.isArray(tags) == false) {
            tags = [ tags ];
        }
        // 3. if tags ia already an array, leave it alone

        let db = MongoUtil.getDB();
        // Mongo CLI Client: insert()
        // NodeJS client: insertOne()
        // 
        // await db.collection("food_records").insertOne({
        //     "foodRecordName" : foodRecordName,
        //     "calories" : calories,
        //     "tags": tags
        // })
        // alternative:
        await db.collection("food_records").insertOne({
            foodRecordName, calories, tags
        })

        res.send("Add new food ok")
        
    })

    app.get("/food_records", async function(req, res){
        let db = MongoUtil.getDB();
        let records = await db.collection('food_records')
                              .find()
                              .toArray();

        res.render('food_records', {
            'records': records
        })
    })

    // display the form that allows the user to edit the food record
    app.get('/food_record/:food_record_id/edit', async function(req, res){
        let db = MongoUtil.getDB();
        // use findOne  when we expect only one result
        // use find when we expect an array of results (have to remember to use toArray())
        let foodRecord = await db.collection('food_records')
                                            .findOne({
                                                "_id":ObjectId(req.params.food_record_id)
                                            })
        res.render('edit_food_record',{
            'foodRecord':foodRecord
        })
    })

    app.post('/food_record/:food_record_id/edit', async function(req,res){
        let db = MongoUtil.getDB();
        let { foodRecordName, calories, tags} = req.body;
         // normalize the tags 
        // 1. if tags is undefined, normalize to empty array
        tags = tags || [];
        // 2. if tags is a string (i.e not an array), normalize to an array with that string as its only element
        if (Array.isArray(tags) == false) {
            tags = [ tags ];
        }

        await db.collection('food_records').updateOne({
            '_id':ObjectId(req.params.food_record_id)
        },{
            '$set':{
                // 'foodRecordName': foodRecordName,
                // 'calories': calories,
                // 'tags':tags
                foodRecordName, calories, tags
            }
        })

        res.redirect('/food_records')

    })

        // display the page that allows the user to delete the food record
        app.get('/food_record/:food_record_id/delete', async function(req, res){
            let db = MongoUtil.getDB();
            // use findOne to find one record 
            let foodRecord = await db.collection('food_records')
                                                .findOne({
                                                    "_id":ObjectId(req.params.food_record_id)
                                                })
            res.render('delete_food_record',{
                'foodRecord':foodRecord
            })
        })

        app.post('/food_record/:food_record_id/delete', async function(req,res){
            let db = MongoUtil.getDB();
            // use deleteOne when we expect only one result
            await db.collection('food_records').deleteOne({
                '_id':ObjectId(req.params.food_record_id)
            })
            res.redirect('/food_records')
    
        })
}

main();

app.listen(3000, function(){
    console.log("Server has started")
});