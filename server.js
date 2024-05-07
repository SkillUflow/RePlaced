const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

let json = {};

for(let i = 0; i < 5; ++i) {
  json[i] = {
    lat: Math.random(),
    long: Math.random()
  }
}



app.get('/', (req, res) => {
  res.json(json)
})


app.post('/login', (req, res) => {

  let db = JSON.parse(fs.readFileSync('./usersDB.json'));

  if(!db[req.body.email]) {
    return res.json({response: false, error: 'Invalid email adress'});
  }

  if(db[req.body.email].password != req.body.password) {
    return res.json({response: false, error: 'Incorrect password'});
  }

  return res.json({response: 'ok', error: undefined});
})

// knex.schema.createTable('user', (table) => {
//   table.increments('id')
//   table.string('name')
//   table.integer('age')
// })
// .then(() => ···)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})