// ==UserScript==
// @name         GitHub Utils
// @description  Something will go here...
// @version      0.4.0
// @updateURL    https://github.com/dracco1993/GitHubUtils/raw/master/githubutils.user.js
// @downloadURL  https://github.com/dracco1993/GitHubUtils/raw/master/githubutils.user.js
// @author       @dracco1993
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js
// @require      http://userscripts-mirror.org/scripts/source/107941.user.js
// @match        http://*.github.com/*
// @match        https://*.github.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

// global variables
var username;
var settings = {
  "hideHound": false
};
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
  //defaultSettings();
  //addSettingsButton();
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

function deleteHoundComments() {
  $(".outdated-comment:contains('houndci-bot') form.js-comment-delete").each(function(){
    var url = $(this).attr('action');
    var data = $(this).serialize();
    //console.log(url,data);
    $.ajax({
      url: url,
      type: 'post',
      data: data
    });
  });
}

function defaultSettings(){
    for (var key in settings){
        console.log(key, settings[key]);
    }
    //GM_setValue("test", false);
    //console.log(GM_getValue("test"));
}

function addSettingsButton() {
  var $div;

  // Add main gear
  $div = $("<div>", {id: "plugin-settings", "class": "plugin-circle"});
  $div.click(function(){
    alert("test1");
  });
  $div.html('<svg aria-hidden="true" class="plugin-gear octicon octicon-gear" height="30" version="1.1" viewBox="0 0 14 16" width="30"><path fill-rule="evenodd" d="M14 8.77v-1.6l-1.94-.64-.45-1.09.88-1.84-1.13-1.13-1.81.91-1.09-.45-.69-1.92h-1.6l-.63 1.94-1.11.45-1.84-.88-1.13 1.13.91 1.81-.45 1.09L0 7.23v1.59l1.94.64.45 1.09-.88 1.84 1.13 1.13 1.81-.91 1.09.45.69 1.92h1.59l.63-1.94 1.11-.45 1.84.88 1.13-1.13-.92-1.81.47-1.09L14 8.75v.02zM7 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"></path></svg>');
  $("body").append($div);

  // Add hound delete
  $div = $("<div>", {id: "hound-delete", "class": "plugin-circle"});
  $div.click(function(){
    alert("test2");
  });
  $div.html('<img src="https://github.com/houndci-bot.png?size=30" style="position: absolute;"><div id="crossbar"></div>');
  $("body").append($div);

  var settingStyles = `
    #plugin-settings {
      background-color: #24292e;
      padding: 10px;
    }

    #hound-delete {
      background-color: white;
      //background-color: #A873D1;
      border: 5px solid red;
      bottom: 70px;
      padding: 6px;
    }

    #crossbar {
      margin: -3px;
      width: 35px;
      height: 35px;
      background: linear-gradient(135deg, transparent 46%, red 46%, red 54%, transparent 54%);
    }

    .plugin-circle {
      width: 50px;
      height: 50px;
      position: fixed;
      bottom: 15px;
      right: 15px;
      border-radius: 100px;
    }

    .plugin-gear {
      fill: rgba(255,255,255,0.75)
    }
  `;
  addGlobalStyle(settingStyles);
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
