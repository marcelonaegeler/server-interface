module.exports = function() {
  var express = require('express')
    , router = express.Router()
    , fs = require('fs')
    , exec = require('child_process').exec
    ;


  /*
  * Folders configs
  */
  var defaultFolders = [
    { value: 0, pwd: '/home/marcelo/Projects' }
    , { value: 1, pwd: '/home/marcelo/Node' }
  ];

  var folder = (function() {
    var selected;
    var setFolder = function(code) {
      for(var i = 0; i < defaultFolders.length; i++) {
        if(defaultFolders[i].value == +code)
          selected = defaultFolders[i].pwd;
      }
    };

    var getFolder = function() {
      return selected;
    };

    return {
      setFolder: setFolder
      , getFolder: getFolder
    };
  })();

  /*
  * Bitbucket user settings
  */
  // Default user
  var defaultUser = {
    username: 'username'
    , password: 'password'
  };
  // Config file
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


  /*
  * Routes
  */
  // The view
  router.get('/', function(req, res) {
    res.render('index', { title: 'Server repositories', folders: defaultFolders });
  });

  /*
  * Ajax routes
  */
  // List local repositories
  router.get('/list', function(req, res) {
    folder.setFolder(req.query.folder);
    fs.readdir(folder.getFolder(), function(err, files) {
      if(err) throw err;
      res.status(200).send(files);
    });
  });

  // Clone repository
  router.post('/clone', function(req, res) {
    if(!req.body.repo) return res.status(500).send(new Error('Invalid repository.'));

    var repo = [ 'https://', defaultUser.username, ':', defaultUser.password, '@bitbucket.org/soudigital/', req.body.repo, '.git' ].join('');
    var command = [ 'cd ', folder.getFolder(), ' && git clone ', repo ].join('');
    exec(command, function(err, stdout, stderr) {
      var response = {};
      if(err) {
        response['status'] = 1;
        response['err'] = err;
      } else response['status'] = 0;
      res.status(200).send(response);
    });
  });

  // Pull repository
  router.get('/pull', function(req, res) {
    if(!req.query.repo) return res.status(500).send(new Error('Invalid repository.'));

    var cdCommand = [ 'cd ', folder.getFolder(), '/', req.query.repo ].join('');

    exec(cdCommand +' && git pull', function(err, stdout, stderr) {
      if(stdout)
        return res.send({ message: stdout.trim() });
    });
  });

  // Install Bower and Composer
  router.get('/install', function(req, res) {
    if(!req.query.repo) return res.status(500).send(new Error('Invalid repository.'));

    var repo = req.query.repo;
    var cdCommand = [ 'cd ', folder.getFolder(), '/', repo ].join('');

    exec(cdCommand +' && composer install && bower install', function(err, stdout, stderr) {
      if(err)
        return res.send({ status: 1, message: err });
      if(stdout)
        return res.send({ status: 0, message: 'Dependências instaladas.' });
    });
  });

  return router;
}();
