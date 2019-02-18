var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.set("view engine", "ejs");
var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};
// const data = {
//   users: [
//     { username: 'monica', password: 'testing'},
//     { username: 'khurram', password: 'testing2' }
//   ]
// }
const users = {
    "userRandomID": {
        id: "userRandomID",
        username: "monica",
        password: "t"
    },
    "user2RandomID": {
        id: "user2RandomID",
        username: "user2@example.com",
        password: "dishwasher-funk"
    }
}

function checkLogin(username, password) {
    for (var user in users) {
        if (users[user].username === username && users[user].password === password) {
            return user;
        }
    }
}
function getName(ID) {
    for(var user in users){
        if(user === ID){
            return users[user].username;
        }
    }
}
function checkIfExists(username) {
    for (var user in users) {
        if (users[user].username === username) {
            throw "Error 400: User already exists";
        }
    }
}
app.get("/login", (req, res) => {
    res.render("login");
});
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = checkLogin(username, password);

    if (user) {
        // success
        res.cookie('username', user);
        res.redirect('/urls');
    } else {
        // failed attempt
        console.log("fail");
        res.render('login', {
            errorFeedback: 'Failed to find a user.'
        });
    }
    // console.log(`You attempted to log in with ${users.user.username}.`);
});
app.get("/signup", (req, res) => {
    res.render("signup");
});
app.post("/signup", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    checkIfExists(username, users);
    const ID = generateRandomString(6);
    users[ID] = {
        id: ID,
        username: username,
        password: password
    }
    console.log(users);
    res.redirect('/');
});
app.post("/logout", (req, res) => {
    res.redirect("/login")
})
app.get("/", (req, res) => {
    res.redirect("/login");
});
app.get("/urls", (req, res) => {
    const name = getName(req.cookies.username);
    var templateVars = {
        username: name,
        urls: urlDatabase
    }
    res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
    const name = getName(req.cookies.username);
    var templateVars = {
        username: name,
    }
    res.render("urls_new",templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
    let templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
    };
    res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
    var shorturl = generateRandomString(6);
    urlDatabase[shorturl] = req.body.longURL;
    res.redirect(`/urls/${shorturl}`);
});
app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});
app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});
app.post("/urls/:shortURL/update", (req, res) => {
    urlDatabase[req.params.shortURL] = req.body.longURL;
    res.redirect("/urls");
});
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}