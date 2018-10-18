// ==UserScript==
// @name         GitHub Utils
// @description  Something will go here...
// @version      0.6.0
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
var isLoadingPages = false;
var nextPageUrl;

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
  setupNeverEndingGithub();
  setUsername();
  colorizeMeCaptain();
}

function setUsername() {
  username = $('.user-profile-link .css-truncate-target').text();
}

function colorizeMeCaptain() {
  $('.Box-row:not(.ghu-styled)').each(function (k, v) {
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

function setupNeverEndingGithub() {
  addNeverEndingStyles();
  setNextPageURL($(document));

  $(window).scroll(function() {
    if($(window).scrollTop() + $(window).height() == $(document).height()) {
      if(!isLoadingPages && nextPageUrl){
        loadNextPage();
      }
    }
  });
}

function loadNextPage() {
  isLoadingPages = true;

  $.ajax({
    url: nextPageUrl,
    success: function (result) {
      var temp = $('<div/>').html(result).contents();
      displayNextPage(temp);
    },
    always: function() {
      isLoadingPages = false;
    }
  });
}

function displayNextPage(source) {
  // Actually add the new loaded content into the current container
  $(".issues-listing ul.js-navigation-container").append(source.find("[id^=issue_]"));
  colorizeMeCaptain();

  setNextPageURL(source);
  isLoadingPages = false;
}

function setNextPageURL(source) {
  var nextPageButton = source.find(".pagination .next_page");
  if(nextPageButton.length > 0) {
    nextPageUrl = nextPageButton[0].href;
  }
}

function getComments(source) {
  var content = source.find('.js-comment-container');
  var prNumber = source.find('.gh-header-number').first().text().slice(1);
  var prDescription = content.slice(0, 1);
  var newComment = content.slice(-1, 1);
  var comments = content.slice(1, content.length - 1);
  var location = $('#issue_' + prNumber)[0];
  var timelineComments = source.find('.js-discussion .timeline-comment-wrapper');

  $(location).addClass("ghu-styled");

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
  if (typeof (tempuser) !== 'undefined') {
    // Username passed
    var lastComment;
    $.each(comments, function (i, comment) {
      var image = $(comment).find('img');
      if (image.length > 0 && $(comment).find('img')[0].alt.slice(1) === tempuser) {
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
  // Called with something like:
  //  setStyle(location, {
  //    'background-color': '#FFEC94'
  //  });
  $(location).css(style);
}

function redify(location) {
  clearColors(location);
  $(location).addClass("ghu-red");
}

function yellowify(location) {
  clearColors(location);
  $(location).addClass("ghu-yellow");
}

function greenify(location) {
  clearColors(location);
  $(location).addClass("ghu-green");
}

function clearColors(location) {
  $(location).removeClass("ghu-red ghu-yellow ghu-green");
}

function addNeverEndingStyles() {
  /*jshint esversion: 6 */
  var neverEndingStyles = `
    .ghu-styled {
    }

    .ghu-red {
      background-color: #FFEC94 !important;
    }

    .ghu-yellow {
      background-color: #FFAEAE !important;
    }

    .ghu-green {
      background-color: #B0E57C !important;
    }
  `;
  addGlobalStyle(neverEndingStyles);
}

function addGlobalStyle(css) {
  var head = document.getElementsByTagName('head')[0];
  if (!head) { return; }
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = css;
  head.appendChild(style);
}

function hideUserDeletedCommentDivs() {
  $('.discussion-item-comment_deleted').hide();
}
