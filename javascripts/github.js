//
// The MIT License (MIT)
//
// Copyright (c) 2015 Snakepit Software
// Author: Rodney C Forbes    <5n4k3@snakepitsoftware.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//

/*
 * We want the lists to be ordered. These do the sorting.
 */

function sortByNumberOfWatchers(repos) {
  repos.sort(function(a,b) {
    return b.watchers_count - a.watchers_count;
  });
}

function sortByNumberOfContributions(contributors) {
  contributors.sort(function(a,b) {
    return b.contributions - a.contributions;
  });
}

/*
 * These comply with v3 of the GitHub API
 */

jQuery.githubRepos = function(user, type, callback) {
  switch(type) {
    // type 1 : repos of a user
    case 1:
      jQuery.getJSON("https://api.github.com/user/"+user+"/repos", callback);
      break;
    // type 2 : repos of an organization
    case 2:
      jQuery.getJSON("https://api.github.com/orgs/"+user+"/repos", callback);
      break;
  }
}

jQuery.githubUser = function(user, callback) {
  jQuery.getJSON("https://api.github.com/users/"+user, callback);
}

jQuery.githubMembers = function(organization, callback) {
  jQuery.getJSON("https://api.github.com/orgs/"+organization+"/public_members", callback);
}

jQuery.githubContributors = function(user, repo, callback) {
  jQuery.getJSON("https://api.github.com/repos/"+user+"/"+repo+"/contributors", callback);
}

jQuery.githubCollaborators = function(user, repo, callback) {
  jQuery.getJSON("https://api.github.com/repos/"+user+"/"+repo+"/collaborators", callback);
}

jQuery.githubBranches = function(user, repo, callback) {
  jQuery.getJSON("https://api.github.com/repos/"+user+"/"+repo+"/branches", callback);
}

/*
 * These do the bulk of the work.
 */

jQuery.fn.loadRepositories = function(user, type, filter) {
  var target = this;

  target.html("<span>Querying GitHub for " + user +"'s repositories ...</span>");

  $.githubRepos(user, type, function(data) {
    var repos = data;
    var list = $('<ul class="repos" />');

    target.empty().append(list);

    $(repos).each(function() {
      var repo = this;
      var item = $('<li id="' + repo.name + '" class="repo" />');
      var sublist = $('<ul id="' + repo.name + '" class="repo_properties" />');

      list.append(item);

      item.append('<b>' + repo.name + '</b> - ' + repo.description);
      item.append(sublist);

      sublist.append('<li id="' + repo.name + '" class="repository"><a href="' + repo.html_url +'">Repository</a></li>');
      if (repo.has_wiki) {
        sublist.append('<li id="' + repo.name + '" class="wiki"><a href="https://github.com/' + user + '/' + repo.name + '/wiki">Wiki</a></li>');
      }

      if (repo.has_issues) {
        sublist.append('<li id="' + repo.name + '" class="tracker"><a href="https://github.com/' + user + '/' + repo.name + '/issues">Issue Tracker</a></li>');
      }

      if (repo.has_pages && repo.name !== user + '.github.io') {
        sublist.append('<li id="' + repo.name + '" class="documentation"><a href="https://' + user + '.github.io/' + repo.name + '/doc/html">Documentation</a></li>');
      }

      if (repo.has_downloads) {
        sublist.append('<li id="' + repo.name + '" class="download"><a href="https://github.com/' + user + '/' + repo.name + '/archive/master.zip">Download Zip</a></li>');
      }
    });
  });
};

jQuery.fn.loadMembers = function(organization) {
  var target = this;

  target.html("<span>Querying GitHub for " + organization +"'s public members ...</span>");

  $.githubMembers(organization, function(data) {
    var members = data;
    var list = $('<ul class="members" />');

    target.empty().append(list);

    $(members).each(function() {
      var member = this;

      $.githubUser(member.login, function(data) {
        var user = data;
        var item = $('<li style="clear:both" id="' + user.name + '" class="member" />');

        list.append(item);

        item.append('<img style="float: left; margin: 0px 15px 15px 0px;" src="' + user.avatar_url + '" alt="" height="42" width="42">');
        item.append('<a href="' + user.html_url + '">' + user.name + '</a>');
        if (null != user.company) {
          item.append(' (' + user.company + ')');
        }
        if (null != user.blog) {
          item.append(' - <a href="' + user.blog + '">blog</a>');
        }
      });
    });
  });
};

jQuery.fn.loadContributors = function(user, type) {
  var target = this;

  target.html("<span>Querying GitHub for contributors ...</span>");

  $.githubRepos(user, type, function(data) {
    var repos = data;
    var list = $('<ul class="contributors" />');

    target.empty().append(list);

    $(repos).each(function() {
      var repo = this;

      $.githubContributors(user, repo.name, function(data) {
        var contributors = data;

        $(contributors).each(function() {
          var contributor = this;

          $.githubUser(contributor.login, function(data) {
            var user = data;
            var item = $('<li style="clear:both" id="' + user.name + '" class="contributor" />');

            if ($('ul#' + user.name + '.repos').length > 0) {
              $('ul#' + user.name + '.repos').append('<li class="repo"><a href="' + repo.html_url + '">' + repo.name + '</a> [' + contributor.contributions + ']</li>');
            } else {
              list.append(item);

              item.append('<img style="float: left; margin: 0px 15px 15px 0px;" src="' + user.avatar_url + '" alt="" height="42" width="42">');
              item.append('<a href="' + user.html_url + '">' + user.name + '</a>');
              if (null != user.company) {
                item.append(' (' + user.company + ')');
              }
              if (null != user.blog) {
                item.append(' - <a href="' + user.blog + '">blog</a>');
              }
              var sublist = $('<ul id="' + user.name + '" class="repos" />');
              item.append(sublist);
              sublist.append('<li id="' + user.name + '" class="repo"><a href="' + repo.html_url + '">' + repo.name + '</a> [' + contributor.contributions + ']</li>');
            }
          });
        });
      });
    });
  });
};

jQuery.fn.loadCollaborators = function(user, type) {
  var target = this;

  target.html("<span>Querying GitHub for collaborators ...</span>");

  $.githubRepos(user, type, function(data) {
    var repos = data;
    var list = $('<ul class="collaborators" />');

    target.empty().append(list);

    $(repos).each(function() {
      var repo = this;

      $.githubCollaborators(user, repo.name, function(data) {
        var collaborators = data;

        $(collaborators).each(function() {
          var collaborator = this;

          $.githubUser(collaborator.login, function(data) {
            var user = data;
            var item = $('<li style="clear:both" id="' + user.name + '" class="collaborator" />');

            if ($('ul#' + user.name + '.collaborator').length > 0) {
              $('ul#' + user.name + '.collaborator').append('<li class="collaborator"><a href="' + repo.html_url + '">' + repo.name + '</a></li>');
            } else {
              list.append(item);

              item.append('<img style="float: left; margin: 0px 15px 15px 0px;" src="' + user.avatar_url + '" alt="" height="42" width="42">');
              item.append('<a href="' + user.html_url + '">' + user.name + '</a>');
              if (null != user.company) {
                item.append(' (' + user.company + ')');
              }
              if (null != user.blog) {
                item.append(' - <a href="' + user.blog + '">blog</a>');
              }
              var sublist = $('<ul id="' + user.name + '" class="collaborator" />');
              item.append(sublist);
              sublist.append('<li id="' + user.name + '" class="collaborator repo"><a href="' + repo.html_url + '">' + repo.name + '</a> [' + contributor.contributions + ']</li>');
            }
          });
        });
      });
    });
  });
};
