// ==UserScript==
// @name         GitHub Utils
// @description  Something will go here...
// @version      0.0.2
// @updateURL    https://github.com/dracco1993/GitHubUtils/raw/master/githubutils.user.js
// @downloadURL  https://github.com/dracco1993/GitHubUtils/raw/master/githubutils.user.js
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
    init();
})();

function init(){
    username = getUsername();
    console.log(username);
    $('.Box-body-row').each(function(k,v){
        //console.log(v);
        var temp = $(v).find('.Box-row-link')[0];

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
    return $('.dropdown-header .css-truncate-target').text();
}

function getComments(source){
    //console.log(source);
    var content = source.find('.js-comment-container');
    var prNumber = source.find('.gh-header-number').first().text().slice(1);
    var prDescription = content.slice(0,1);
    var newComment = content.slice(-1,1);
    var comments = content.slice(1, content.length-1);
    var location = $('#issue_'+prNumber)[0];

    setStyle(location, {'background-color': '#FFEC94'});

    if(comments.length > 0){
        var lastComment = getLastComment(comments);
        var lastUserComment = getLastComment(comments, username);
        //var src = $(lastComment).find('.timeline-comment-avatar')[0].src;
        //addIcon(location, src, lastComment, prNumber);

        if(typeof(lastUserComment) !== 'undefined'){
            setStyle(location, {'background-color': '#B0E57C'});
        }
    } else {
        setStyle(location, {'background-color': '#FFAEAE'});
    }
}

function addIcon(location, source, content, prNumber){
    var temp = $(location).find('.lh-condensed')[0];
    var href = $(content).find("a[href^='#issuecomment']")[0];
    href = $(href).attr('href');
    var url = window.location.href.replace(/(pulls.*)/g, '');
    var link = $('<a>',{href: url+'pull/'+prNumber+href});
    var image = link.append($('<img>',{src: source, width: 44}));
    //console.log(url);
    $(temp).append(image);
}

function getLastComment(comments, tempuser){
    if(typeof(tempuser) !== 'undefined'){
        // Username passed
        var lastComment;
        $.each(comments, function(i, comment){
            if ($(comment).find('img')[0].alt.slice(1) === tempuser) {
                lastComment = comment;
            }
        });

        return lastComment;
    } else {
        // No username passed
        return comments[comments.length-1];
    }
}

function setStyle(location, style){
    $(location).css(style);
}

function getNumLineComments(){

}
