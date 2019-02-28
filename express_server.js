const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
// Middleware decleration
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieSession({
    name: "session",
    keys: ["sdasd edfgdg asd"]
}));
app.set("view engine", "ejs");
// Test Data for TinyApp
var urlDatabase = {
    b2xVn2: {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID"
    },
    s9m5xK: {
        longURL: "http://www.google.com",
        userID: "user2RandomID"
    },
    b3x4sc: {
        longURL: "http://woopyland.com",
        userID: "user3RandomID"
    }
};
const users = {
    "admin": {
        id: "admin",
        username: "admin",
        password: "admin"
    }
}
//Function to check whether user input matches database
function checkLogin(username, password) {
    for (var user in users) {
        if (users[user].username === username) {
            if (bcrypt.compareSync(password, users[user].password)) {
                return user;
            }
        }
    }
}
//A get function for comparing ID to the database and returning username value
function getName(ID) {
    for (var user in users) {
        if (user === ID) {
            return users[ID].username;
        }
    }
}
//Function to check if username already exists in database
function checkIfExists(username) {
    for (var user in users) {
        if (users[user].username === username) {
            throw "Error 400: User already exists";
        } else {
            console.log("all is fine username is not the same");
        }
    }
}
//Function for generating a random string of letters and numbers
function generateRandomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
/*
-------LogIn-----------
*/
app.get("/", (req, res) => {
    res.redirect("/login");
});
app.get("/login", (req, res) => {
    req.session.user_id = null;
    res.render("login");
});
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = checkLogin(username, password);
    if (user) {
        // success
        req.session.user_id = user;
        res.redirect('/urls');
    } else {
        // failed attempt
        res.render('login', {
            errorFeedback: 'Failed to find a user.'
        });
    }
    // console.log(`You attempted to log in with ${users.user.username}.`);
});
/*
-------SignUp-----------
*/
app.get("/signup", (req, res) => {
    res.render("signup");
});
app.post("/signup", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10); //encrypts password
    checkIfExists(username, users); //should console.log ok if it passed
    const ID = generateRandomString(6); //generates random string
    users[ID] = { // Builds the new data entry for new user
        id: ID,
        username: username,
        password: hashedPassword
    }
    res.redirect('/');
});
/*
-------LogOut-----------
*/
app.post("/logout", (req, res) => {
    res.redirect("/login")
})
/*
-------HTML_ROUTING-----------
*/
app.get("/urls", (req, res) => {
    const name = getName(req.session.user_id);
    var templateVars = {
        username: name,
        ID: req.session.user_id,
        urls: urlDatabase
    }
    res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
    const name = getName(req.session.user_id);
    var templateVars = {
        username: name,
    }
    res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
    let templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
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