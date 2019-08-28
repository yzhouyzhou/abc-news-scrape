var express = require("express");
const exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");

// Require all models
var db = require("./models");

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

const PORT = process.env.PORT || 3000;
// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/unit18Populater";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes
require("./routes/htmlRoutes")(app);

// Start the server
app.listen(PORT, () => {
  console.log("App running http://localhost:" + PORT);
});
