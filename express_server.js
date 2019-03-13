const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
let loggedIn = false;
const ID = generateRandomString(6); //generates random string
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
    },
    s9m5xK: {
        longURL: "http://www.google.com",
    },
    b3x4sc: {
        longURL: "http://woopyland.com",
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
        if (users[user].username === username && (bcrypt.compareSync(password, users[user].password))) {
            return user;
        }
    }
    return false;
}
//A get function for comparing ID to the database and returning username value
function getName(ID) {
    for (var user in users) {
        if (user === ID) {
            return users[ID].username;
        }
    }
}

function generateRandomString(length) {
    let text = '';
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
//Function to check if username already exists in database
function checkIfExists(username) {
    for (var user in users) {
        if (users[user].username === username) {
            throw "Error 400: User already exists";
        }
    }
}
//Checks if user has access to certain links
function checkCredentials(user, link) {}
/*
-------LogIn-----------
*/
app.get("/", (req, res) => {
    res.redirect("/login");
});
app.get("/login", (req, res) => {
    req.session.user_id = null;
    res.render("login");
    console.log("You tried to log out");
    loggedIn = false;
});
app.post("/login", (req, res) => {
    console.log("but you somehow made it here");
    const username = req.body.username;
    const password = req.body.password;
    if (username === "" || password === ""){
        throw ("Username or Password is empty, please put something in");
    }
    const user = checkLogin(username, password);
    if (user) {
        // success
        req.session.user_id = user;
        loggedIn = true;
        res.redirect('/urls');
    } else {
        throw ("Password or Username did NOT match!");
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
    if (username === "" || password === ""){
        throw ("Username or Password is empty, please put something in");
    }
    const hashedPassword = bcrypt.hashSync(password, 10); //encrypts password
    checkIfExists(username, users); //should console.log ok if it passed
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
    res.redirect("/")
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
    };
    if (loggedIn) {
        res.render("urls_index", templateVars);
    } else {
        res.redirect("/login");
    }
});
// Get to create new link page
app.get("/urls/new", (req, res) => {
    const name = getName(req.session.user_id);
    const    templateVars = {
        username: name,
    }
    res.render("urls_new", templateVars);
});
// POST to accept new information and slap it into the DB
app.post("/makeNewUrl", (req, res) => {
    const ranID = generateRandomString(6);
    urlDatabase[ranID] = {
        id: ID,
        longURL: req.body.longurl
    };
    res.redirect("/urls");
});
// Send the user to the long url link
app.get("/u/:shortURL", (req, res) => {
    //MUST be a http:// link or it will not recognize it
    const sendLong = urlDatabase[req.params.shortURL].longURL;
    res.redirect(sendLong);
});
// -- forms from url-show ---
// Get method upon clicking one of the short links which will take you to its individual page
app.get("/urls/:shortURL", (req, res) => {
    const templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL
    };
    res.render("urls_show", templateVars);
});
app.post("/urls/:shortURL/update", (req, res) => {
    if (req.session.user_id === urlDatabase[req.params.shortURL].id) {
        if (req.body.longurl != "") {
            urlDatabase[req.params.shortURL].longURL = req.body.longurl;
        } else {
            throw ("please enter something to update the link");
        }
    } else {
        throw ("You do not have acess to edit this URL");
    }
    res.redirect("/urls");
});
app.post("/urls/:shortURL/delete", (req, res) => {
    if (req.session.user_id === urlDatabase[req.params.shortURL].id) {
        delete urlDatabase[req.params.shortURL];
    } else {
        throw ("You do not have acess to edit this URL");
    }
    res.redirect("/urls");
});
// -- port --
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});