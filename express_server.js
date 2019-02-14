var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};
app.get("/", (req, res) => {
    res.redirect("/urls");
});
app.get("/urls", (req, res) => {
    var templateVars = {
        urls: urlDatabase
    };
    res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
    let templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL]
    };
    //console.log(templateVars.longURL);
    res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
    var shorturl = generateRandomString();
    urlDatabase[shorturl] = req.body.longURL;
    res.redirect(`/urls/${shorturl}`);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}