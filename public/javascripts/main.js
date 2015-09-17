;!function() {
  var form = document.getElementById('form-clone');
  var showRepos = document.getElementById('show-repos');

  var layout = {
    list: '<ul class="ul">{items}</ul>'
    , listItem: [ '<li>{name} <button type="button" class="btn btn-sm btn-default" onclick="'
        , 'window.gitPull(\'{name}\')">Git pull</button>'
        , ' <button type="button" class="btn btn-sm btn-default" onclick="window.installDependencies(\'{name}\')">Install</button></li>' ].join('')
    , emptyListItem: '<li>Não foram encontrados repositórios.</li>'
  };

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    var btn = form.querySelector('[type="submit"]');
    btn.setAttribute('disabled', 'disabled');
    btn.innerHTML = 'Clonando...';
    var message = form.querySelector('.message');

    api.ajax({
      url: form.action
      , method: form.method
      , data: {
        repo: form.elements.repo.value
      }
      , success: function(data) {
        if(!data.status) {
          message.innerHTML = "Repositório clonado.";
          localRepos();
        } else {
          message.innerHTML = "Erro ao clonar o repositório, o nome está correto?";
        }
        btn.removeAttribute('disabled');
        btn.innerHTML = 'Clonar!';
      }
      , error: function() {
        message.innerHTML = "Erro ao clonar o repositório, o nome está correto?";
        btn.removeAttribute('disabled');
        btn.innerHTML = 'Clonar!';
      }
    });
    return false;
  });

  var status = (function() {
    var el = document.querySelector('.statusText');

    var setMessage = function(text) {
      el.innerHTML = text;
    };

    var ready = function() {
      el.innerHTML = 'Pronto.';
    };

    return {
      setMessage: setMessage
      , ready: ready
    };
  })();

  var localRepos = (function() {
    var repos = [];
    status.setMessage('Carregando repositórios...');

    api.ajax({
      url: '/list'
      , method: 'GET'
      , success: function(data) {
        var items = [];
        if(!data.length)
          items.push(layout.emptyListItem);
        for(var i = 0; i < data.length; i++)
          items.push(api.layout(layout.listItem)({ name: data[i] }));

        items = api.layout(layout.list)({ items: items.join('') });
        showRepos.innerHTML = items;
        status.ready();
      }
    });
  })();

  var gitPull = function(repo) {
    status.setMessage([ 'Executando "git pull" em ', repo, '...' ].join(''));
    api.ajax({
      url: '/pull'
      , method: 'GET'
      , data: {
        repo: repo
      }
      , success: function(data) {
        status.setMessage([ 'Git pull executado (', repo,'): ', data.message ].join(''));
      }
    });
  };

  var installDependencies = function(repo) {
    status.setMessage([ 'Instalando dependências em ', repo, '...' ].join(''));
    api.ajax({
      url: '/install'
      , method: 'GET'
      , data: {
        repo: repo
      }
      , success: function(data) {
          status.setMessage([ data.message ].join(''));
      }
    });
  };

  window.gitPull = gitPull;
  window.installDependencies = installDependencies;
}();
