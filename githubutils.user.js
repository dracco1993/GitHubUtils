// ==UserScript==
// @name         GitHub Utils
// @description  Something will go here...
// @version      0.11.0
// @updateURL    https://github.com/dracco1993/GitHubUtils/raw/master/githubutils.user.js
// @downloadURL  https://github.com/dracco1993/GitHubUtils/raw/master/githubutils.user.js
// @author       @dracco1993
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js
// @match        http://*.github.com/*
// @match        https://*.github.com/*
// @grant        none
// ==/UserScript==

/* jshint esversion: 6 */
/* eslint-env jquery   */

// global variables
var username;
var urlMatcher = /\/pulls/;
var isLoadingPages = false;
var nextPageUrl;
var isDarkMode;

(function() {
  "use strict";
  if (Array.isArray(window.location.pathname.match(urlMatcher))) {
    init();
  }

  document.addEventListener("pjax:end", function() {
    if (Array.isArray(window.location.pathname.match(urlMatcher))) {
      init();
    }
  });
})();

function init() {
  setTheme();
  setupNeverEndingGithub();
  setUsername();
  colorizeMeCaptain();
}

function setUsername() {
  username = $(".user-profile-link .css-truncate-target").text();
}

function setTheme() {
  var colorMode = $("html").data().colorMode;
  var systemIsDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  isDarkMode = (colorMode === "dark") || (colorMode === "auto" && systemIsDarkTheme === true);
}

function colorizeMeCaptain() {
  $(".Box-row:not(.ghu-styled)").each(function(k, v) {
    var links = $(v).find("div.flex-auto > a");
    var temp, repo;
    if (links[0].href.match(/\/pull/)) {
      temp = links[0];
    } else {
      temp = links[1];
      repo = links[0].text
        .replace(/\r?\n|\r/g, "")
        .trim()
        .split("/")
        .join("_");
    }
    $.ajax({
      url: temp.href,
      success: function(result) {
        var temp = $("<div/>")
          .html(result)
          .contents();
        getComments(temp, repo);
      }
    });
  });
}

function setupNeverEndingGithub() {
  addNeverEndingStyles();
  setNextPageURL($(document));

  $(window).scroll(function() {
    if ($(window).scrollTop() + $(window).height() === $(document).height()) {
      if (!isLoadingPages && nextPageUrl) {
        loadNextPage();
      }
    }
  });
}

function loadNextPage() {
  isLoadingPages = true;

  $.ajax({
    url: nextPageUrl,
    success: function(result) {
      var temp = $("<div/>")
        .html(result)
        .contents();
      displayNextPage(temp);
    },
    always: function() {
      isLoadingPages = false;
    }
  });
}

function displayNextPage(source) {
  // Actually add the new loaded content into the current container
  $("div.js-navigation-container").append(
    source.find("[id^=issue_]:not([id$=_link])")
  );
  colorizeMeCaptain();
  setNextPageURL(source);
  isLoadingPages = false;
}

function setNextPageURL(source) {
  var nextPageButton = source.find(".pagination .next_page");
  if (nextPageButton.length > 0) {
    nextPageUrl = nextPageButton[0].href;
  }
}

function getComments(source, repo) {
  var content = source.find(".js-comment-container");
  var prNumber = source
    .find(".gh-header-number")
    .first()
    .text()
    .slice(1);
  var prDescription = content.slice(0, 1);
  var newComment = content.slice(-1, 1);
  var comments = content.slice(1, content.length - 1);
  var timelineComments = source.find(
    ".js-discussion .timeline-comment-wrapper"
  );
  var location = $("#issue_" + prNumber)[0];
  if (location === undefined) {
    location = $("#issue_" + prNumber + "_" + repo);
  }

  $(location).addClass("ghu-styled");
  redify(location);

  if (comments.length > 0) {
    var lastComment = getLastComment(comments);
    var lastUserComment = getLastComment(comments, username);
    //var src = $(lastComment).find('.timeline-comment-avatar')[0].src;
    //addIcon(location, src, lastComment, prNumber);
    if (typeof lastUserComment !== "undefined") {
      greenify(location);
    }
  } else {
    yellowify(location);
  }

  if (timelineComments.length > 0) {
    var lastUserCodeComment = getLastComment(timelineComments, username);
    if (typeof lastUserCodeComment !== "undefined") {
      greenify(location);
    }
  }

  // Set the theme
  themify(location);
}

function addIcon(location, source, content, prNumber) {
  var temp = $(location).find(".lh-condensed")[0];
  var href = $(content).find("a[href^='#issuecomment']")[0];
  href = $(href).attr("href");
  var url = window.location.href.replace(/(pulls.*)/g, "");
  var link = $("<a>", {
    href: url + "pull/" + prNumber + href
  });
  var image = link.append(
    $("<img>", {
      src: source,
      width: 44
    })
  );
  $(temp).append(image);
}

function getLastComment(comments, tempuser) {
  if (typeof tempuser !== "undefined") {
    // Username passed
    var lastComment;
    $.each(comments, function(i, comment) {
      var image = $(comment).find("img");
      if (
        image.length > 0 &&
        $(comment)
          .find("img")[0]
          .alt.slice(1) === tempuser
      ) {
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

function themify(location) {
  clearTheme(location);

  if (isDarkMode) {
    $(location).addClass("ghu-dark");
  } else {
    $(location).addClass("ghu-light");
  }
}

function clearColors(location) {
  $(location).removeClass("ghu-red ghu-yellow ghu-green");
}

function clearTheme(location) {
  $(location).removeClass("ghu-light ghu-dark");
}

function addNeverEndingStyles() {
  var neverEndingStyles = `
    .ghu-styled {
    }

    .ghu-red.ghu-light {
      background-color: #FFEC94 !important;
    }

    .ghu-yellow.ghu-light {
      background-color: #FFAEAE !important;
    }a

    .ghu-green.ghu-light {
      background-color: #B0E57C !important;
    }

    .ghu-red.ghu-dark {
      background-color: #570000 !important;
    }

    .ghu-yellow.ghu-dark {
      background-color: #804a00 !important;
    }

    .ghu-green.ghu-dark {
      background-color: #002900 !important;
    }
  `;
  addGlobalStyle(neverEndingStyles);
}

function addGlobalStyle(css) {
  var head = document.getElementsByTagName("head")[0];
  if (!head) {
    return;
  }
  var style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = css;
  head.appendChild(style);
}

function hideUserDeletedCommentDivs() {
  $(".discussion-item-comment_deleted").hide();
}
