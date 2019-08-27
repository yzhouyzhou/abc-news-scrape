var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");

module.exports = function (app) {
    app.get("/", function (req, res) {
        db.Article.find({}).sort({ _id: -1 })
            .populate("note")
            .then(dbArticles => {
                console.log(dbArticles);
                res.render("index", { dbArticles });
            })
            .catch(err => {
                res.json(err);
            });
    });

    app.get("/clear", function (req, res) {
        // Grab every document in the Articles collection
        db.Note.deleteMany({})
            .catch(function (err) {
                // If an error occurred, send it to the client
                console.log(err);
            });
        db.Article.deleteMany({})
            .catch(function (err) {
                // If an error occurred, send it to the client
                console.log(err);
            });
        res.send("All articles with notes are cleared");
    });

    app.get("/scrape", function (req, res) {
        let count = 0;
        axios.get("https://abcnews.go.com/US").then(function (response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            // console.log(response.data);
            var $ = cheerio.load(response.data);

            // Now, we grab every h2 within an article tag, and do the following:
            // $("li.headlines-li").each(function (i, element) {
            $("h1").each(function (i, element) {
                // Save an empty result object
                var result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(this)
                    .children("a")
                    .text();
                result.link = $(this)
                    .children("a")
                    .attr("href");
                result.summary = $(this)
                    .find("div.desc")
                    .text();               

                if ((result.title.trim().length > 25) &&
                    (result.link.indexOf("abcnews") !== -1) &&
                    (result.summary.trim().length > 25) &&
                    count < 20) {
                    // Create a new Article using the `result` object built from scraping
                    db.Article.create(result)
                        .then(function (dbArticle) {
                            // View the added result in the console
                            console.log(dbArticle);
                        })
                        .catch(function (err) {
                            // If an error occurred, log it
                            console.log(err);
                        });
                    count++;
                }
            });

            // Send a message to the client
            res.send(count + " News Scraped Complete");
        });
    });

    // Route for getting all Articles from the db
    app.get("/articles", function (req, res) {
        // Grab every document in the Articles collection
        db.Article.find({}).sort({ _id: -1 })
            .then(function (dbArticle) {
                // If we were able to successfully find Articles, send them back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });


    // Route for grabbing a specific Article by id, populate it with it's note
    app.get("/articles/:id", function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({ _id: req.params.id })
            // ..and populate all of the notes associated with it
            .populate("note")
            .then(function (dbArticle) {
                // If we were able to successfully find an Article with the given id, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for creating an Article's associated Note
    app.post("/articles/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry
        db.Note.create(req.body)
            .then(function (dbNote) {
                // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
                // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
            })
            .then(function (dbArticle) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for updating an Article's associated Note
    app.put("/note/:noteid", function (req, res) {
        // Create a new note and pass the req.body to the entry
        db.Note.findOneAndUpdate({ _id: req.params.noteid },
            {
                title: req.body.title,
                body: req.body.body
            }
        ).then(dbNote => {
            res.json(dbNote);
        });
    });

    app.delete("/note/:noteid", function (req, res) {
        console.log("hey, here", req.params.noteid);
        db.Note.deleteOne({ _id: req.params.noteid }).then(dbNote => {
            console.log("Note is deleted now checking its Article...");
            db.Article.findOne({ note: req.params.noteid }, function (err, dbArticle) {
                if (dbArticle != null) {
                    db.Article.update({ note: req.params.noteid },
                        { $unset: { note: "" } }, function (err, newdbArticle) {
                            console.log("Unset note property from article property ok ", newdbArticle); //output all props
                        }
                    )
                }
            });
        });
    });
};