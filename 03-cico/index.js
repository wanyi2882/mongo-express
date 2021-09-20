const express = require("express")
const hbs = require("hbs")
const wax = require("wax-on")
const MongoUtil = require("./MongoUtil")

//setup dotenv library
// const dotenv = require("dotenv")
// dotenv.config();
//or
require("dotenv").config(); //nodejs will read the content of the .env file and put the variables inside there into the operating system

//how to access variable in operating system
//console.log(process.env.MONGO_URI)

let app = express()
//use handlebars for the view engine
app.set("view engine", "hbs")
//set the public folder to store all the static files
app.use(express.static("public"))

wax.on(hbs.handlebars)
wax.setLayoutPath("./views/layouts")

//enable forms
app.use(express.urlencoded({extended: false}));

// ROUTES
async function main(){
    await MongoUtil.connect(process.env.MONGO_URI, "tgc14_cico")

    app.get('/', async function(req,res){
        res.send("welcome")
    })

    app.get("/food_record/add", function(req,res){
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
}

main()

app.listen(3000, function(){
    console.log("Server has started")
});

