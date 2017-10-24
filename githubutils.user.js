// ==UserScript==
// @name         GitHub Utils
// @description  Something will go here...
// @version      0.4.0
// @updateURL    https://github.com/dracco1993/GitHubUtils/raw/master/githubutils.user.js
// @downloadURL  https://github.com/dracco1993/GitHubUtils/raw/master/githubutils.user.js
// @author       @dracco1993
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js
// @match        http://*.github.com/*
// @match        https://*.github.com/*
// @grant        none
// ==/UserScript==

// global variables
var username;
var urlMatcher = /(?:\/.+?){2}\/pulls/;

(function () {
  'use strict';
  if (Array.isArray(window.location.pathname.match(urlMatcher))) {
    init();
  }

  document.addEventListener('pjax:end', function () {
    if (Array.isArray(window.location.pathname.match(urlMatcher))) {
      init();
    }
  });
}());

function init() {
  username = getUsername();

  $('.Box-row').each(function (k, v) {
    var temp = $(v).find('div.table-fixed > div > a')[0];

    $.ajax({
      url: temp.href,
      success: function (result) {
        var temp = $('<div/>').html(result).contents();
        getComments(temp);
      }
    });
  });
}

function getUsername() {
  return $('.dropdown-header .css-truncate-target').text();
}

function getComments(source) {
    $('.discussion-item-comment_deleted').hide();
  var content = source.find('.js-comment-container');
  var prNumber = source.find('.gh-header-number').first().text().slice(1);
  var prDescription = content.slice(0, 1);
  var newComment = content.slice(-1, 1);
  var comments = content.slice(1, content.length - 1);
  var location = $('#issue_' + prNumber)[0];
  var timelineComments = source.find('.js-discussion .timeline-comment-wrapper');

  redify(location);

  if (comments.length > 0) {
    var lastComment = getLastComment(comments);
    var lastUserComment = getLastComment(comments, username);
    //var src = $(lastComment).find('.timeline-comment-avatar')[0].src;
    //addIcon(location, src, lastComment, prNumber);

    if (typeof (lastUserComment) !== 'undefined') {
      greenify(location);
    }
  } else {
    yellowify(location);
  }

  if (timelineComments.length > 0) {
    var lastUserCodeComment = getLastComment(timelineComments, username);
    if (typeof (lastUserCodeComment) !== 'undefined') {
      greenify(location);
    }
  }
}

function addIcon(location, source, content, prNumber) {
  var temp = $(location).find('.lh-condensed')[0];
  var href = $(content).find("a[href^='#issuecomment']")[0];
  href = $(href).attr('href');
  var url = window.location.href.replace(/(pulls.*)/g, '');
  var link = $('<a>', {
    href: url + 'pull/' + prNumber + href
  });
  var image = link.append($('<img>', {
    src: source,
    width: 44
  }));
  $(temp).append(image);
}

function getLastComment(comments, tempuser) {
    $('.discussion-item-comment_deleted').hide();
  if (typeof (tempuser) !== 'undefined') {
    // Username passed
    var lastComment;
    $.each(comments, function (i, comment) {
      if ($(comment).find('img')[0].alt.slice(1) === tempuser) {
        lastComment = comment;
      }
    });
    return lastComment;
  } else {
    // No username passed
    return comments[comments.length - 1];
  }
}

function setStyle(location, style) {
  $(location).css(style);
}

function redify(location) {
  setStyle(location, {
    'background-color': '#FFEC94'
  });
}

function yellowify(location) {
  setStyle(location, {
    'background-color': '#FFAEAE'
  });
}

function greenify(location) {
  setStyle(location, {
    'background-color': '#B0E57C'
  });
}
