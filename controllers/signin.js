const handleSignIn = (db, bcrypt) => (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).json('incorrect submission');
  }
  db.select('email', 'hash')
    .from('login')
    .where('email', email)
    .then(data => {
      bcrypt.compare(password, data[0].hash, function(err, match) {
        if (match) {
          db.select('*')
            .from('users')
            .where('email', email)
            .then(user => res.json(user[0]))
            .catch(err => console.log(err));
        } else {
          res.status(404).json('Wrong user and password combination');
        }
      });
    })
    .catch(err => res.status(404).json('Wrong user and password combination'));
};

module.exports = {
  handleSignIn
};
