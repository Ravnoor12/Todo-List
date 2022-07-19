//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const srvr = process.env.N1_KEY; 
const srvrCred = process.env.N1_SECRET; 
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://"+ srvr + ":" + srvrCred +"@test-1.gmd57.mongodb.net/todolistDB");
const ItemsSchema = {
  name:String
}
const Item = mongoose.model("Item",ItemsSchema);
const item1 = new Item({
  name: "Welcome to ToDO List"
});
const item2 = new Item({
  name: "Hit the + button to add new item "
});
const item3 = new Item({
  name: "<-- Hit to delete the item"
}); 
const defaultItems = [item1,item2,item3];
const listSchema = {
  name:String,
  items:[ItemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {  
//const day = date.getDate();
  Item.find({},function(err,foundItem){
     //console.log(foundItem);
     if(foundItem.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err)console.log(err)
        else console.log("Added Successfully")
      })
      res.redirect("/");
    }
    else{
     res.render("list", {listTitle: "Today", newListItems: foundItem});
    }
  })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);       //items is from ListSchema items
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});


app.post("/delete",function(req,res){
  const checkedItemID = req.body.checkBox;
  const listName = req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemID,function(err){
      if(err) console.log(err);
      else console.log("Successfully Deleted the item")
    });  
    res.redirect("/");
  }
else {
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}},function(err,foundOne){
    if(!err) {
      res.redirect("/" + listName);
    }
  })
}
});

app.post("/deleteHeading",function(req,res){
    //console.log(req.body);
    const checkedItemID = req.body.checkBox;
    const listName = req.body.listName;
    if(listName==="Today"){ 
      res.redirect("/");
    }
    else{
      List.deleteMany({_id:checkedItemID},function(err,foundOne){
        if(!err) {
          res.redirect("/listnames");
        }
        else console.log(err)
      })
    }
})

app.post("/listnames",function(req,res){
  const custonListName = _.capitalize(req.body.newListName);
  List.findOne({name:custonListName},function(err,foundItem){
    if(!err){
      if(!foundItem){
        //console.log("Doesn't exit");
        const list = new List({
          name: custonListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/listnames");
      }
      else{
        //console.log("Listname already Exists!")
        res.redirect("/" + custonListName);
        // res.render("list", {listTitle: custonListName, newListItems: foundItem.items});
      }
    }
})
})

app.post("/newTitle",function(req,res){
  //console.log(req.body);
  const newTitle = _.capitalize(req.body.newTitle);
  const curTitle = req.body.listName;
  if(curTitle==="Today"){
    res.redirect("/" + curTitle)
  }
  else{
    List.findOne({name:curTitle},function(err,foundOne){
      if(!err) {
        if(foundOne){
          foundOne.name = newTitle;
          foundOne.save();
          res.redirect("/" + newTitle);
        }
      }
    })
  }
})

app.get("/:param", function(req,res){
  const custonListName = _.capitalize(req.params.param);
  if(custonListName==="Listnames"){
    //console.log("show all lists")
    List.find({},function(err,foundItem){
      res.render("listsname",{listName:foundItem});
    })
  }
  else{
    List.findOne({name:custonListName},function(err,foundItem){
        if(!err){
          if(!foundItem){
            //console.log("Doesn't exit");
            const list = new List({
              name: custonListName,
              items: defaultItems
            });
            list.save();
            res.redirect("/" + custonListName);
          }
          else{
            //console.log("Exists!")
            res.render("list", {listTitle: custonListName, newListItems: foundItem.items});
          }
        }
    })
  }
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () { 
  console.log("Server started.");
   }); 