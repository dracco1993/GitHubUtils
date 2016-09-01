// ==UserScript==
// @name         GitHub Utils
// @description  Something will go here...
// @version      0.0.1
// @author       @dracco1993
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js
// @match        http://*.github.com/*/pulls
// @match        http://*.github.com/*/pulls/*
// @match        https://*.github.com/*/pulls
// @match        https://*.github.com/*/pulls/*
// @grant        none
// ==/UserScript==

// global variables
var username;

(function() {
    'use strict';

    console.log("Doing things...");
    init();
})();

function init(){
    username = getUsername();
    console.log(username);
    $(".Box-body-row").each(function(k,v){
        console.log(v);
        var temp = $(v).find(".Box-row-link")[0];

        $.ajax({
            url: temp.href,
            success: function(result){
                var temp = $('<div/>').html(result).contents();
                getComments(temp);
            }
        });
    });
}

function getUsername(){
    return $(".css-truncate-target").text();
}

function getComments(source){
    //console.log(source);
    var content = source.find(".js-comment-container");
    var prNumber = source.find(".gh-header-number").first().text().slice(1);
    var prDescription = content.slice(0,1);
    var newComment = content.slice(-1,1);
    var comments = content.slice(1, content.length-1);
    
    if(comments.length > 0){
        var lastComment = getLastComment(comments);
        var location = $("#issue_"+prNumber)[0];
        var src = $(lastComment).find(".timeline-comment-avatar")[0].src;
        addIcon(location, src, lastComment, prNumber);
    }
    //getLastComment(comments, username);
}

function addIcon(location, source, content, prNumber){
    var temp = $(location).find(".lh-condensed")[0];
    var href = $(content).find("a[href^='#issuecomment']")[0];
    href = $(href).attr('href');
    var url = window.location.href.replace(/(pulls.*)/g, "");
    var link = $('<a>',{href: url+"pull/"+prNumber+href});
    var image = link.append($('<img>',{src: source, width: 44}));
    //console.log(url);
    $(temp).append(image);
}

function getLastComment(comments, username){
    if(typeof(username) !== "undefined"){
        // Username passed
    } else {
        // No username passed
        return comments[comments.length-1];
    }
}

function getNumLineComments(){
    
}
