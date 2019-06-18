const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const _ = require("lodash");
//const date = require(__dirname + "/date.js");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use("/public", express.static(__dirname + "/public"));

mongoose.connect("mongodb+srv://admin-iva:thesexyest787@cluster0-forwo.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Watch video lessons"
});

const item2 = new Item({
    name: "Breakfast time"
});

const item3 = new Item({
    name: "It's a day for sex"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
    //let day = date.getDate();
    //listTitle: day;
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Seccessfully");
                }
            });
            res.redirect("/");
        } else {
            res.render("lists", {listTitle: "Today", newListItems: foundItems});
        }
        //console.log(foundItems);
    });
});

// app.get("/work", function (req, res) {
//     res.render("lists", {listTitle: "Work items", newListItems: work})
// });

app.get("/:routeName", function (req, res) {
    let routeName = _.capitalize(req.params.routeName);

    List.findOne({name: routeName}, function (err, results) {
        if (!err) {
            if (!results) {
                const list = new List({
                    name: routeName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + routeName);
            } else {
                //console.log("Exists!");
                res.render("lists", {listTitle: results.name, newListItems: results.items});
            }
        }
    });
});

app.post("/", function (req, res) {
    let itemName = req.body.newItem;
    let listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }

});

app.post("/delete", function (req, res) {
    const checkedIdItem = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndDelete({_id: checkedIdItem}, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("This item was successfully deleted!");
            }
        });
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedIdItem}}}, function (err, foundList) {
            if (!err) {
               res.redirect("/" + listName);
            }
        });
    }
    //mongoose.connect.close();
});

app.post("/work", function (req, res) {
    let list = req.body.list;
    let item = req.body.newItem;

    if (list === "Work") {
        work.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
        res.redirect("/");
    }
});

app.get("/about", function (req, res) {
    res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
//app.listen(port);


app.listen(port, function () {
    console.log("The server was stated successfully!");
});
