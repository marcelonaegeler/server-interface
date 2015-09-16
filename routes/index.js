module.exports = function() {
  var express = require('express')
    , router = express.Router()
    , fs = require('fs')
    , dir = '/home/marcelo/Projects'
    , exec = require('child_process').exec
    ;

  var defaultUser = {
    username: 'username'
    , password: 'password'
  };

  router.get('/', function(req, res) {
    res.render('index', { title: 'Server repositories' });
  });

  router.get('/list', function(req, res) {
    fs.readdir(dir, function(err, files) {
      if(err) throw err;
      res.status(200).send(files);
    });
  });

  router.post('/clone', function(req, res) {
    if(!req.body.repo) return res.status(500).send(new Error('Invalid repository.'));

    var command = [ 'cd ', dir, ' && git clone ', req.body.repo ].join('');
    exec(command, function(err, stdout, stderr) {
      var response = {};
      if(err) {
        response['status'] = 1;
        response['err'] = err;
      } else response['status'] = 0;
      res.status(200).send(response);
    });
  });

  router.get('/pull', function(req, res) {
    if(!req.query.repo) return res.status(500).send(new Error('Invalid repository.'));

    var cdCommand = [ 'cd ', dir, '/', req.query.repo ].join('');

    exec(cdCommand +' && cat .git/config | grep bitbucket', function(err, stdout, stderr) {
      console.log(!!stdout);
    });
  /*
    exec(command, function(err, stdout, stderr) {
      var response = {};
      if(err) response['status'] = 1;
      else response['status'] = 0;
      res.status(200).send(response);
    });
  */
  });

  return router;
}();
