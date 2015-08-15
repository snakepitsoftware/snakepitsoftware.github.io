// type 1 : repos of a user
// type 2 : repos of an organization
jQuery.githubRepos = function(user, type, callback) {
  switch(type) {
    case 1:
      jQuery.getJSON("https://api.github.com/user/"+user+"/repos", callback);
      break;
    case 2:
      jQuery.getJSON("https://api.github.com/orgs/"+user+"/repos", callback);
      break;
  }
}

jQuery.fn.loadRepositories = function(user, type) {
  var target = this;

  this.html("<span>Querying GitHub for " + user +"'s repositories...</span>");

  $.githubRepos(user, type, function(data) {
    var repos = data;
    var list = $('<dl/>');

    sortByNumberOfWatchers(repos);
    target.empty().append(list);
    
    $(repos).each(function() {
      list.append('<dt><a href="'+ this.html_url +'">' + this.name + '</a></dt>');
      list.append('<dd>' + this.description + '</dd>');
    });
  });

  function sortByNumberOfWatchers(repos) {
    repos.sort(function(a,b) {
      return b.watchers_count - a.watchers_count;
    });
  }
};

jQuery.githubUser = function(user, callback) {
  jQuery.getJSON("https://api.github.com/users/"+user, callback);
}

jQuery.githubMembers = function(organization, callback) {
  jQuery.getJSON("https://api.github.com/orgs/"+organization+"/public_members", callback);
}

jQuery.fn.loadMembers = function(organization) {
  var target = this;

  this.html("<span>Querying GitHub for " + organization +"'s public members...</span>");

  $.githubMembers(organization, function(data) {
    var members = data;
    var list = $('<dl/>');

    target.empty().append(list);
    
    $(members).each(function() {
      $.githubUser(this.login, function(data) {
        var user = data;
        
        list.append('<dt><a href="'+ user.html_url +'">' + user.name + '</a></dt>');
        list.append('<dd>' + user.bio + '</dd>');
      });
    });
  });
};
