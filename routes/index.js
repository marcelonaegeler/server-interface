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

  var bitbucketFile = function(first) {
    fs.readFile('.bitbucketinfo', 'utf8', function(err, doc) {
      if(err && err.code == 'ENOENT') {
        fs.writeFile('.bitbucketinfo', [ defaultUser.username, defaultUser.password ].join(':'), function() {
          fs.watch('.bitbucketinfo', bitbucketFile);
        });
      }
      if(doc) {
        var defaults = doc.split(':');
        defaultUser.username = defaults[0].trim();
        defaultUser.password = defaults[1].trim();

        if(first) fs.watch('.bitbucketinfo', bitbucketFile);
      }
    });
  };

  bitbucketFile(true);

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

    var repo = [ 'https://', defaultUser.username, ':', defaultUser.password, '@bitbucket.org/soudigital/', req.body.repo, '.git' ].join('');
    var command = [ 'cd ', dir, ' && git clone ', repo ].join('');
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

    exec(cdCommand +' && git pull', function(err, stdout, stderr) {
      if(stdout)
        return res.send({ message: stdout.trim() });
    });
  });

  router.get('/install', function(req, res) {
    if(!req.query.repo) return res.status(500).send(new Error('Invalid repository.'));

    var repo = req.query.repo;
    var cdCommand = [ 'cd ', dir, '/', repo ].join('');

    exec(cdCommand +' && composer install && bower install', function(err, stdout, stderr) {
      if(err)
        return res.send({ status: 1, message: err });
      if(stdout)
        return res.send({ status: 0, message: 'Dependências instaladas.' });
    });

    //res.send({ status: 0 });
  });

  return router;
}();
