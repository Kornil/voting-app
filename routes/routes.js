var passport = require('passport');
var Account = require('../models/account');
var Poll = require('../models/poll');

module.exports = function (app) {

  app.use(require('body-parser').urlencoded({ extended: true }));

  app.get('/', function (req, res) {
      Poll.find({}, function(err, polls){
      if (err) throw err;
        res.render('index', { user: req.user, polls: polls});
      })
  });

  app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
      Poll.find({ 'user': req.user.username }, function(err, polls){
        if (err) throw err;        
        res.render('profile', { user: req.user, polls: polls});
      })
  });

  app.post('/profile', function(req, res){
      var arr= req.body.options.split(","), result = [];
      for(var i=0;i<arr.length;i++){
        result.push({
          label: arr[i],
          value: 0
        });
      }
      var newPoll = Poll({
      title: req.body.title,
      options: result,
      user: req.user.username
    });            
    newPoll.save(function(err) {
      if (err) throw err;
      res.redirect('/profile');
    });
  });

  app.delete('/profile/:id', function(req, res){
      Poll.findByIdAndRemove(req.params.id, function(err){
        if (err) throw err;
        res.redirect('/profile');
      });
    });

  app.post('/vote/:id/:pos', function(req, res){
    if (typeof user !== 'undefined') {
    Poll.findById(req.params.id).exec()
      .then(function(poll){
        if(poll.hasVoted.includes(req.user.username)){
          res.redirect('/');
        }else{
          Poll.update({_id: req.params.id, 'options.label': req.params.pos },  {$inc: { 'options.$.value': 1}, $push: { hasVoted: req.user.username }}).exec()
            .then(function(poll){
              res.redirect('/');
            });
        }
      }).catch(function(err){
        throw err;
      });
    }else{
      res.redirect('/');
    }
  });

  app.get('/register', function(req, res) {
      res.render('register', { });
  });

  app.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }
    });
    passport.authenticate('local', { successRedirect: '/profile', failureRedirect: '/login'} );
    res.redirect('/');
  });

  app.get('/login', function(req, res) {
      res.render('login', { user : req.user });
  });

  app.post('/login', passport.authenticate('local', { successRedirect: '/profile', failureRedirect: '/login'}) );

  app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });

}