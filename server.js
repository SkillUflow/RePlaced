const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const dbPath = "./usersDB.json";
const expireTime = 1000 * 15; // One day

app.use(bodyParser.json());


function getDB() {
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}



app.get('/', (req, res) => {
  res.send('<h1 style="color: #2095F3">Hello World!</h1>')
})


app.post('/login', (req, res) => {

  let db = getDB();
  let user = db.users.find(user => user.email == req.body.email);


  if(!user) {
    return res.json({response: false, error: 'Adresse email incorrect'});
  }

  if(user.password != req.body.password) {
    return res.json({response: false, error: 'Mot de passe incorrect'});
  }

  let randomKey = "";
  let randomKeyLength = 20;
  let hexaChar = "0123456789ABCDEF";
  
  for(let i = 0; i < randomKeyLength; ++i) {
    let char = hexaChar[Math.round(Math.random() * (hexaChar.length - 1))];

    if(Math.round(Math.random() * 100) % 2 == 0) {
      randomKey += char.toLowerCase();
    }
    else {
      randomKey += char;
    }
  }

  user.session.key    = randomKey;
  user.session.expire = new Date().getTime() + expireTime;

  saveDB(db);

  return res.json({response: 'ok', key: randomKey});
})

app.post('/signup', (req, res) => {

  let db = getDB();
  let user = db.users.find(user => user.email == req.body.email);
  let emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;


  if(req.body.surname.length < 2) {
    return res.json({response: false, error: 'Le prénom doit contenir au moins 2 caractères'});
  }
  
  else if(user) {
    return res.json({response: false, error: 'Cet adresse email est déjà utilisé ! Essayez de vous connecter'});
  }

  else if(req.body.email.length < 5 || !emailReg.test(req.body.email)) {
    return res.json({response: false, error: 'Email invalide'});
  }

  let randomKey = "";
  let randomKeyLength = 20;
  let hexaChar = "0123456789ABCDEF";
  
  for(let i = 0; i < randomKeyLength; ++i) {
    let char = hexaChar[Math.round(Math.random() * (hexaChar.length - 1))];

    if(Math.round(Math.random() * 100) % 2 == 0) {
      randomKey += char.toLowerCase();
    }
    else {
      randomKey += char;
    }
  }

  user = {
    email: req.body.email,
    surname: req.body.surname,
    password: req.body.password,
    session: {
      key: randomKey,
      expire: new Date().getTime() + expireTime
    }
  }

  db.users.push(user);

  saveDB(db);

  return res.json({response: 'ok', key: randomKey});
})

app.post('/pinList', (req, res) => {

  let db = getDB().pinList;

  res.json(db)
})

app.post('/isLogged', (req, res) => {

  let db = getDB();
  let user = db.users.find(user => user.session.key == req.body.sessionKey);


  if(!user || user.session.expire <= new Date().getTime()) {
    return res.json({response: false});
  }

  // If user is logged in, we continue their session
  user.session.expire = new Date().getTime() + expireTime;

  // Save datas in DB
  saveDB(db);

  return res.json({response: true});
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})