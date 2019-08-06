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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvcGFnaW5hdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsQ0FBQyxVQUFVLE1BQVYsRUFBa0IsUUFBbEIsRUFBNEI7QUFDM0IsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsZ0JBQXZCLENBQXBCO0FBQ0EsTUFBSSxDQUFDLFdBQUwsRUFBa0I7QUFFbEIsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixhQUF2QixDQUF6QjtBQUNBLE1BQUksQ0FBQyxnQkFBTCxFQUF1QjtBQUV2QixNQUFJLE9BQU8sR0FBRyxLQUFkLENBUDJCLENBUzNCOztBQUNBLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLGVBQXZCLENBQXZCO0FBQ0EsRUFBQSxjQUFjLENBQUMsU0FBZixDQUF5QixNQUF6QixDQUFnQyxRQUFoQzs7QUFFQSxXQUFTLFVBQVQsR0FBdUI7QUFDckIsUUFBSSxLQUFLLE1BQUwsS0FBZ0IsR0FBcEIsRUFBeUI7QUFDdkIsTUFBQSxjQUFjLENBQUMsTUFBZjtBQUVBO0FBQ0QsS0FMb0IsQ0FPckI7OztBQUNBLFFBQU0sWUFBWSxHQUFHLEtBQUssUUFBTCxDQUFjLGFBQWQsQ0FBNEIscUJBQTVCLENBQXJCO0FBQ0EsSUFBQSxnQkFBZ0IsQ0FBQyxXQUFqQixDQUE2QixZQUE3QixFQVRxQixDQVdyQjs7QUFDQSxRQUFNLGNBQWMsR0FBRyxLQUFLLFFBQUwsQ0FBYyxhQUFkLENBQTRCLGdCQUE1QixDQUF2Qjs7QUFDQSxRQUFJLGNBQUosRUFBb0I7QUFDbEIsTUFBQSxXQUFXLENBQUMsSUFBWixHQUFtQixjQUFjLENBQUMsSUFBbEM7QUFDRCxLQUZELE1BRU87QUFDTCxNQUFBLGNBQWMsQ0FBQyxNQUFmO0FBQ0QsS0FqQm9CLENBbUJyQjs7O0FBQ0EsSUFBQSxPQUFPLEdBQUcsS0FBVjtBQUNEOztBQUVELFdBQVMsUUFBVCxHQUFxQjtBQUNuQixRQUFNLEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxjQUFYLEVBQVo7QUFDQSxJQUFBLEdBQUcsQ0FBQyxZQUFKLEdBQW1CLFVBQW5CO0FBRUEsSUFBQSxHQUFHLENBQUMsZ0JBQUosQ0FBcUIsTUFBckIsRUFBNkIsVUFBN0I7QUFFQSxJQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsS0FBVCxFQUFnQixXQUFXLENBQUMsSUFBNUI7QUFDQSxJQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsSUFBVDtBQUNEOztBQUVELFdBQVMsV0FBVCxDQUFzQixDQUF0QixFQUF5QjtBQUN2QixJQUFBLENBQUMsQ0FBQyxjQUFGO0FBRUEsSUFBQSxPQUFPLElBQUksTUFBTSxDQUFDLHFCQUFQLENBQTZCLFFBQTdCLENBQVg7QUFDQSxJQUFBLE9BQU8sR0FBRyxJQUFWO0FBQ0QsR0FuRDBCLENBcUQzQjs7O0FBQ0EsRUFBQSxjQUFjLENBQUMsZ0JBQWYsQ0FBZ0MsT0FBaEMsRUFBeUMsV0FBekM7QUFDRCxDQXZERCxFQXVERyxNQXZESCxFQXVEVyxRQXZEWCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIihmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCkge1xuICBjb25zdCBuZXh0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbcmVsPW5leHRdJylcbiAgaWYgKCFuZXh0RWxlbWVudCkgcmV0dXJuXG5cbiAgY29uc3Qgc3RvcnlGZWVkQ29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zdG9yeS1mZWVkJylcbiAgaWYgKCFzdG9yeUZlZWRDb250ZW50KSByZXR1cm5cblxuICBsZXQgdGlja2luZyA9IGZhbHNlXG5cbiAgLy8gQnV0dG9uIExvYWQgTW9yZVxuICBjb25zdCBsb2FkTW9yZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1sb2FkLW1vcmUnKVxuICBsb2FkTW9yZUJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCd1LWhpZGUnKVxuXG4gIGZ1bmN0aW9uIG9uUGFnZUxvYWQgKCkge1xuICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICBsb2FkTW9yZUJ1dHRvbi5yZW1vdmUoKVxuXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBhcHBlbmQgQ29udGVudHNcbiAgICBjb25zdCBwb3N0RWxlbWVudHMgPSB0aGlzLnJlc3BvbnNlLnF1ZXJ5U2VsZWN0b3IoJy5zdG9yeS1mZWVkLWNvbnRlbnQnKVxuICAgIHN0b3J5RmVlZENvbnRlbnQuYXBwZW5kQ2hpbGQocG9zdEVsZW1lbnRzKVxuXG4gICAgLy8gc2V0IG5leHQgbGlua1xuICAgIGNvbnN0IHJlc05leHRFbGVtZW50ID0gdGhpcy5yZXNwb25zZS5xdWVyeVNlbGVjdG9yKCdsaW5rW3JlbD1uZXh0XScpXG4gICAgaWYgKHJlc05leHRFbGVtZW50KSB7XG4gICAgICBuZXh0RWxlbWVudC5ocmVmID0gcmVzTmV4dEVsZW1lbnQuaHJlZlxuICAgIH0gZWxzZSB7XG4gICAgICBsb2FkTW9yZUJ1dHRvbi5yZW1vdmUoKVxuICAgIH1cblxuICAgIC8vIFN5bmMgc3RhdHVzXG4gICAgdGlja2luZyA9IGZhbHNlXG4gIH1cblxuICBmdW5jdGlvbiBvblVwZGF0ZSAoKSB7XG4gICAgY29uc3QgeGhyID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpXG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdkb2N1bWVudCdcblxuICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25QYWdlTG9hZClcblxuICAgIHhoci5vcGVuKCdHRVQnLCBuZXh0RWxlbWVudC5ocmVmKVxuICAgIHhoci5zZW5kKG51bGwpXG4gIH1cblxuICBmdW5jdGlvbiByZXF1ZXN0VGljayAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgdGlja2luZyB8fCB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG9uVXBkYXRlKVxuICAgIHRpY2tpbmcgPSB0cnVlXG4gIH1cblxuICAvLyBjbGljayBidXR0b24gbG9hZCBtb3JlXG4gIGxvYWRNb3JlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcmVxdWVzdFRpY2spXG59KSh3aW5kb3csIGRvY3VtZW50KVxuIl19

//# sourceMappingURL=map/pagination.js.map
