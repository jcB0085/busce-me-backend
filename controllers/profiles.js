const clarifai = require('clarifai');

const clarifaiApp = new Clarifai.App({
  apiKey: process.env.CLARIFAIKEY
});

const handleApiCall = (req, res) => {
  clarifaiApp.models
    .predict('a403429f2ddf4b49b307e318f00e528b', req.body.input)
    .then(data => res.json(data))
    .catch(err => res.status(400).json('unable to work with API'));
};

const postProfile = (db, bcrypt) => (req, res) => {
  const {email, name, password} = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect submission');
  }
  bcrypt.hash(password, null, null, (err, hash) => {
    db.transaction(trx => {
      trx
        .insert({
          hash,
          email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
          return trx('users')
            .returning('*')
            .insert({
              name,
              email: loginEmail[0],
              joined: new Date()
            })
            .then(user => res.json(user[0]));
        })
        .then(trx.commit)
        .catch(trx.rollback);
    }).catch(err =>
      res.status(400).json('Unable to register (email may be already taken)')
    );
  });
};

getProfile = db => (req, res) => {
  const {id} = req.params;
  db.select('*')
    .from('users')
    .where({id})
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(404).json('No profile found with that id');
      }
    })
    .catch(err => res.status(400).json('Error retrieving user'));
};

putProfile = db => (req, res) => {
  const {id} = req.params;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json('Unable to update given id'));
};

module.exports = {
  postProfile,
  getProfile,
  putProfile,
  handleApiCall
};
