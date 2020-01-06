(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

(function (window, document) {
  var nextElement = document.querySelector('link[rel=next]');
  if (!nextElement) return;
  var storyFeedContent = document.querySelector('.story-feed');
  if (!storyFeedContent) return;
  var ticking = false; // Button Load More

  var loadMoreButton = document.querySelector('.js-load-more');
  loadMoreButton.classList.remove('u-hide');

  function onPageLoad() {
    if (this.status === 404) {
      loadMoreButton.remove();
      return;
    } // append Contents


    var postElements = this.response.querySelector('.story-feed-content');
    storyFeedContent.appendChild(postElements); // set next link

    var resNextElement = this.response.querySelector('link[rel=next]');

    if (resNextElement) {
      nextElement.href = resNextElement.href;
    } else {
      loadMoreButton.remove();
    } // Sync status


    ticking = false;
  }

  function onUpdate() {
    var xhr = new window.XMLHttpRequest();
    xhr.responseType = 'document';
    xhr.addEventListener('load', onPageLoad);
    xhr.open('GET', nextElement.href);
    xhr.send(null);
  }

  function requestTick(e) {
    e.preventDefault();
    ticking || window.requestAnimationFrame(onUpdate);
    ticking = true;
  } // click button load more


  loadMoreButton.addEventListener('click', requestTick);
})(window, document);

},{}]},{},[1])

//# sourceMappingURL=map/pagination.js.map
