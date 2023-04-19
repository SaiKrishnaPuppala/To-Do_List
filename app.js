const express = require("express");
const request = require('request');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');


// 
const app= express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set('view engine','ejs');

mongoose.connect("mongodb+srv://saikrishna:sai123456@todolist.uv4ryyy.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = {
    name:String
}


const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name:"welcome to do list"
});

const item2 = new Item({
    name:"hit + button to add new item"
});

const item3 = new Item({
    name:"check the box if you complete the task"
});

const defaultItems = [item1,item2,item3];

const listSchema= {
    name:String,
    items:[itemsSchema]
};

const List= mongoose.model("List",listSchema);

async function getItems(){
    const Items = await Item.find({});
    return Items;
}

app.get("/",(req,res)=>{

    
    getItems().then(function(itemsFound){

        if(itemsFound.length===0){
            Item.insertMany(defaultItems).then(()=>{
                console.log("data inserted");
            });
            res.redirect("/");
        }
        else{
            res.render("list",{kindOfDay:"Today",newListItem:itemsFound});
        }
    });
    
});
app.get("/about",(req,res)=>{
    res.render("about");
});
app.get("/:customListName",(req,res)=>{
    const listNames = _.startCase(req.params.customListName);
    List.findOne({name:listNames})
    .then((foundList)=>{
        if(foundList===null){
            const list = new List({
                name:listNames,
                items:defaultItems
            });
            list.save();
            res.redirect("/"+listNames);
        }
        else{
            res.render("list",{kindOfDay:foundList.name,newListItem:foundList.items});
        }
    })
    .catch((e)=>{
        console.log(e);
    })

});
app.post("/",async (req,res)=>{
    const itemName = req.body.newItem;    
    const listName = req.body.list;

    const item = new Item({
        name:itemName
    });

    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
        await List.findOne({name:listName}).exec().then((foundList)=>{
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+listName); 
        }).catch(err=>{
            console.log(err);
        })
    }
    
});

app.post("/delete",(req,res)=>{
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    
    if(listName ==="Today"){
        Item.findByIdAndRemove(checkedItemId)
        .then(function(){
            console.log("succesfully deleted");
            res.redirect("/");
        })
            .catch((err)=>{
            console.log(err);
        })
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
        .then(function(){
            console.log("succesfully deleted");
            res.redirect("/"+listName);
        })
            .catch((err)=>{
            console.log(err);
        })
    }
    
});

app.listen(3000,(req,res)=>{
    console.log("server is started");
});

