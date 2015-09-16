;!function() {
  var form = document.getElementById('form-clone');
  var showRepos = document.getElementById('show-repos');
  
  var layout = {
    list: '<ul class="ul">{items}</ul>'
    , listItem: '<li>{name} <button type="button" class="btn btn-sm btn-default" onclick="window.gitPull(\'{name}\')">git pull</button></li>'
    , emptyListItem: '<li>Não foram encontrados repositórios.</li>'
  };

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    api.ajax({
      url: form.action
      , method: form.method
      , data: {
        repo: form.elements.repo
      }
      , success: function(data) {
        console.log(data);
      }
    });
    return false;
  });

  var localRepos = (function() {
    var repos = [];
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
      }
    });
  })();

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
