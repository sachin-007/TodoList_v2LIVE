//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sachin600:sachin_600@cluster0.jipil.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemSchema={
   name:String
 }

const Item = mongoose.model("Item",itemSchema)

const item1 = new Item({
  name:"Welcome to your todoList!"
});

const item2 = new Item({
  name:"Hit the + button to add a new item."
});

const item3 = new Item({
  name:"<-- Hit this to delete an item."
});

const item4 = new Item({
  name:"so you can add your own title. for that you have to add your title after end for url link for ex:https://arcane-wildwood-45756.herokuapp.com/<title_name>"
});

const defaultItems = [item1,item2,item3,item4];

const listSchema = {
  name:String,
  items:[itemSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {



  Item.find({},function(err,foundItems){
    if (foundItems.length===0) {
      Item.insertMany(defaultItems,function(err){
        if (err) {
          console.log(err);
        }else{
          console.log("successfull saved default items to DB.");
        }
      });
      res.redirect("/")
      }else{
          res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
    // const items = ["Buy Food", "Cook Food", "Eat Food"];
    // const workItems = [];
    // }
    // console.log(foundItems);
  });

// const day = date.getDate();


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName==="Today") {
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName  = req.body.listName;

    if (listName==="Today") {
      Item.findByIdAndRemove(checkedItemId,function(err){
        if (!err){
          console.log("successfully deleted checked item.");
          res.redirect("/");
        }

    });
  }else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if (!err) {
        res.redirect("/"+listName);
      }
    })
  }


  // });


  //
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});
//
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if (!err) {
      if (!foundList) {
        // creare a new list

          const list = new List({
            name:customListName,
            items:defaultItems
          });

          list.save();

          res.redirect("/"+customListName);
        // console.log("Doesn't exist!");
      }else {
        //Show an existing List
        // console.log("Exist!");

        res.render("list",{listTitle: foundList.name, newListItems:foundList.items});


      }
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
// app.listen(port);

app.listen(port, function() {
  console.log("Server has started successfully");;


});
