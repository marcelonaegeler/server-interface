;!function() {
  var form = document.getElementById('form-clone');
  var showRepos = document.getElementById('show-repos');

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    var dataElements = form.elements;
    api.ajax({
      url: form.action
      , method: form.method
      , data: {
        repo: dataElements.repo
        , username: dataElements.username
        , password: dataElements.password
      }
      , success: function(data) {
        console.log(data);
      }
    });
    return false;
  });

  var repos = [];
  api.ajax({
    url: '/list'
    , method: 'GET'
    , success: function(data) {
      if(!data.length)
        repos.push('<p>Não foram encontrados repositórios.</p>');
      for(var i = 0; i < data.length; i++)
        repos.push([
          '<p>'
          , data[i]
          , ' - <button type="button" onclick="window.gitPull(\''
          , data[i]
          , '\');">git pull</button></p>' ].join(''));

      showRepos.innerHTML = repos.join('');
    }
  });

  var gitPull = function(repo) {
    api.ajax({
      url: '/pull'
      , method: 'GET'
      , data: {
        repo: repo
      }
      , success: function(data) {
        console.log(data);
      }
    });
  };

  window.gitPull = gitPull;
}();
