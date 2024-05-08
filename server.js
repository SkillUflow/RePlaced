const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const exp = require('constants');

const app = express();
const port = 3000;
const dbPath = "./usersDB.json";
const expireTime = 1000 * 15; // One day

app.use(bodyParser.json());

let json = {};

for(let i = 0; i < 5; ++i) {
  json[i] = {
    lat: Math.random(),
    long: Math.random()
  }
}

function getDB() {
  return JSON.parse(fs.readFileSync(dbPath)).users;
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify({ users : db }, null, 2));
}



app.get('/', (req, res) => {
  res.json(json)
})


app.post('/login', (req, res) => {

  let db = getDB();
  let user = db.find(user => user.email == req.body.email);


  if(!user) {
    return res.json({response: false, error: 'Invalid email adress'});
  }

  if(user.password != req.body.password) {
    return res.json({response: false, error: 'Incorrect password'});
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

app.post('/isLogged', (req, res) => {

  let db = getDB();
  let user = db.find(user => user.session.key == req.body.sessionKey);


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