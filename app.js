//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash")

const app = express();
const mongoose = require("mongoose")
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://the-mannl:C6o4jq@cluster0-d2oi8.mongodb.net/todolistDB',{useUnifiedTopology:true,useNewUrlParser:true});

const itemsSchema ={
  name: {
   type: String,
   required: true
 }
};
const listSchema ={
  name: {
   type: String,
   required: true
 },
 items:[itemsSchema]
};

const Items = mongoose.model("item",itemsSchema);
const List = mongoose.model("list",listSchema);

const item1 = new Items ({
  name: "welcome to your todo list",
});

const item2 = new Items ({
  name: "press + to add item",
});

const item3 = new Items ({
  name: "<-- press checkbox to delete item",
});


const defaultItems = [item1,item2,item3]


app.get("/", function(req, res) {
  Items.find({}, function(err,foundItems){
    if (foundItems.length === 0){

      Items.insertMany(defaultItems, function(err,){
        if (err){
          console.log(err)
        }else{
          console.log("Success")
        }
      });
      res.redirect("/")
    }else{
      res.render("list", {listTitle: "Today",newListItems: foundItems});
    }
  })



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list

const item = new Items ({
  name:itemName,
})

if (listName === "Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name: listName}, function (err, foundList){
    foundList.items.push(item)
    foundList.save();
    res.redirect("/" + listName);
  })
}

});

app.post("/delete",function (req, res){
  const checkedItemId= req.body.checkbox
const listName = req.body.listName

if (listName === "Today"){
  Items.findByIdAndRemove(checkedItemId,function (err){
    if (err){
      console.log(err)
    }else{
      console.log("Success")
    }
    res.redirect("/")
  } )
}else {
  List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName)
    }
  })

}



})

app.get("/:id", function(req,res){
const customListName =  _.capitalizenode(req.params.id);

List.findOne({ name: customListName}, function (err, results){
  if (!err){
  if(!results){
      // create new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save()
      res.redirect("/" + customListName)
  }else{
    res.render("list", {listTitle: results.name ,newListItems: results.items})
  }}
});



});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
