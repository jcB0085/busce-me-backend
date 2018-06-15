const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt-nodejs');

const signin = require('./controllers/signin');
const profiles = require('./controllers/profiles');

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: 'busce-me'
  }
});

const app = express();
const port = process.env.PORT || process.env.PORTBE || 5000

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('I am here and listening!');
});

app.post('/signin', signin.handleSignIn(db, bcrypt));
app.post('/profiles', profiles.postProfile(db, bcrypt));
app.get('/profiles/:id', profiles.getProfile(db));
app.put('/profiles/:id', putProfile(db));
app.post('/imageurl', profiles.handleApiCall)

app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
