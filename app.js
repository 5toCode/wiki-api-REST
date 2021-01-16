const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

const dburl = process.env.DATABASEURL || 'mongodb://localhost:27017/wikiDB'

mongoose.connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const articleSchema = new mongoose.Schema({
    title: String,
    content: String
});

const Article = mongoose.model('Article', articleSchema);

// Route targeting all articles

app.route('/articles')
    .get((req, res) => {
        Article.find({}, (err, foundArticles) => {
            if (err) {
                console.log(err);
            } else {
                res.send(foundArticles);
            }
        })
    })
    .post((req, res) => {
        const title = req.body.title;
        const content = req.body.content;
        const article = new Article({
            title: title,
            content: content
        });
        article.save((err) => {
            if (!err) {
                res.send('Successfully added a new article.');
            } else {
                res.send(err);
            }
        });
    })
    .delete((req, res) => {
        Article.deleteMany({}, (err) => {
            if (!err) {
                res.send('Successfully deleted all articles.');
            } else {
                res.send(err);
            }
        });
    });

// Route targeting a specific article

app.route('/articles/:articleTitle')
    .get((req, res) => {
        const title = req.params.articleTitle;
        Article.findOne({
            title: title
        }, (err, article) => {
            if (article) {
                res.send(article);
            } else {
                res.send('No matching articles were found.');
            }
        })
    })
    .put((req, res) => {
        const title = req.params.articleTitle;
        Article.updateOne(
            {title: title},
            {title: req.body.title, content: req.body.content},
            (err) => {
                if(!err) {
                    res.send('Successfully updated article.');
                } else {
                    res.send(err);
                }
            }
        );
    })
    .patch((req,res) => {
        const title = req.params.articleTitle;
        Article.updateOne(
            {title: title},
            {$set: req.body},
            (err) => {
                if (!err) {
                    res.send('Successfully updated article.');
                } else {
                    res.send(err);
                }
            }
        );
    })
    .delete((req, res) => {
        const title = req.params.articleTitle;
        Article.deleteOne(
            {title: title},
            (err) => {
                if (!err) {
                    res.send('Successfully deleted article');
                } else {
                    res.send(err)
                }
            }
        );
    });

app.listen(3000, () => {
    console.log("Server started on port 3000");
});