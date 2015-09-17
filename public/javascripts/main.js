;!function() {
  var form = document.getElementById('form-clone');
  var showRepos = document.getElementById('show-repos');
  var folderSelect = document.getElementById('folder-select');

  var layout = {
    list: '<ul class="ul">{items}</ul>'
    , listItem: [ '<li>{name} <button type="button" class="btn btn-sm btn-default" onclick="'
        , 'window.gitPull(\'{name}\')">Git pull</button>'
        , ' <button type="button" class="btn btn-sm btn-default" onclick="window.installDependencies(\'{name}\')">Install</button></li>' ].join('')
    , emptyListItem: '<li>Não foram encontrados repositórios.</li>'
  };

  var status = (function() {
    var el = document.querySelector('.statusText');
    var setMessage = function(text) {
      el.innerHTML = text;
    };
    return {
      setMessage: setMessage
    };
  })();

  var folder = (function() {
    var selected = folderSelect.value;

    var setFolder = function() {
      selected = folderSelect.value;
      loadRepositories();
    };

    var getFolder = function() {
      return selected;
    };

    return {
      setFolder: setFolder
      , getFolder: getFolder
    };
  })();

  var loadRepositories = function() {
    var repos = [];
    status.setMessage('Carregando repositórios...');

    showRepos.innerHTML = api.layout(layout.list)({ items: '<li>Carregando...</li>' });

    api.ajax({
      url: '/list'
      , method: 'GET'
      , data: {
        folder: folder.getFolder()
      }
      , success: function(data) {
        var items = [];
        if(!data.length)
          items.push(layout.emptyListItem);
        for(var i = 0; i < data.length; i++)
          items.push(api.layout(layout.listItem)({ name: data[i] }));

        items = api.layout(layout.list)({ items: items.join('') });
        showRepos.innerHTML = items;
        status.setMessage('Pronto');
      }
    });
  };

  var gitClone = function(options, callback) {
    api.ajax({
      url: options.action
      , method: options.method
      , data: {
        repo: options.repo
      }
      , success: callback
      , error: callback
    });
  };

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


  /*
  * Event Listeners
  */

  // Folder select
  folderSelect.onchange = function() {
    folder.setFolder(this.value);
  };

  // Clone form
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    var btn = form.querySelector('[type="submit"]');
    btn.setAttribute('disabled', 'disabled');
    btn.innerHTML = 'Clonando...';
    var message = form.querySelector('.message');

    gitClone({
        action: form.action
        , method: form.method
        , repo: form.elements.repo.value
      }, function(data) {
        if(!data || data.status)
          message.innerHTML = "Erro ao clonar o repositório, o nome está correto?";
        else {
          message.innerHTML = "Repositório clonado.";
          form.elements.repo.value = '';
          loadRepositories();
        }
        btn.removeAttribute('disabled');
        btn.innerHTML = 'Clonar!';
      }
    );
    return false;
  });


  /*
  * Global access functions
  */
  window.gitPull = gitPull;
  window.installDependencies = installDependencies;

  // Init
  loadRepositories();
}();
