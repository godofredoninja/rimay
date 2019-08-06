(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],2:[function(require,module,exports){
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
},{}],3:[function(require,module,exports){
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;
},{}],4:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],5:[function(require,module,exports){
function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
},{}],6:[function(require,module,exports){
(function (setImmediate){
/*
WHAT: SublimeText-like Fuzzy Search

USAGE:
  fuzzysort.single('fs', 'Fuzzy Search') // {score: -16}
  fuzzysort.single('test', 'test') // {score: 0}
  fuzzysort.single('doesnt exist', 'target') // null

  fuzzysort.go('mr', ['Monitor.cpp', 'MeshRenderer.cpp'])
  // [{score: -18, target: "MeshRenderer.cpp"}, {score: -6009, target: "Monitor.cpp"}]

  fuzzysort.highlight(fuzzysort.single('fs', 'Fuzzy Search'), '<b>', '</b>')
  // <b>F</b>uzzy <b>S</b>earch
*/

// UMD (Universal Module Definition) for fuzzysort
;(function(root, UMD) {
  if(typeof define === 'function' && define.amd) define([], UMD)
  else if(typeof module === 'object' && module.exports) module.exports = UMD()
  else root.fuzzysort = UMD()
})(this, function UMD() { function fuzzysortNew(instanceOptions) {

  var fuzzysort = {

    single: function(search, target, options) {
      if(!search) return null
      if(!isObj(search)) search = fuzzysort.getPreparedSearch(search)

      if(!target) return null
      if(!isObj(target)) target = fuzzysort.getPrepared(target)

      var allowTypo = options && options.allowTypo!==undefined ? options.allowTypo
        : instanceOptions && instanceOptions.allowTypo!==undefined ? instanceOptions.allowTypo
        : true
      var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo
      return algorithm(search, target, search[0])
      // var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991
      // var result = algorithm(search, target, search[0])
      // if(result === null) return null
      // if(result.score < threshold) return null
      // return result
    },

    go: function(search, targets, options) {
      if(!search) return noResults
      search = fuzzysort.prepareSearch(search)
      var searchLowerCode = search[0]

      var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991
      var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991
      var allowTypo = options && options.allowTypo!==undefined ? options.allowTypo
        : instanceOptions && instanceOptions.allowTypo!==undefined ? instanceOptions.allowTypo
        : true
      var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo
      var resultsLen = 0; var limitedCount = 0
      var targetsLen = targets.length

      // This code is copy/pasted 3 times for performance reasons [options.keys, options.key, no keys]

      // options.keys
      if(options && options.keys) {
        var scoreFn = options.scoreFn || defaultScoreFn
        var keys = options.keys
        var keysLen = keys.length
        for(var i = targetsLen - 1; i >= 0; --i) { var obj = targets[i]
          var objResults = new Array(keysLen)
          for (var keyI = keysLen - 1; keyI >= 0; --keyI) {
            var key = keys[keyI]
            var target = getValue(obj, key)
            if(!target) { objResults[keyI] = null; continue }
            if(!isObj(target)) target = fuzzysort.getPrepared(target)

            objResults[keyI] = algorithm(search, target, searchLowerCode)
          }
          objResults.obj = obj // before scoreFn so scoreFn can use it
          var score = scoreFn(objResults)
          if(score === null) continue
          if(score < threshold) continue
          objResults.score = score
          if(resultsLen < limit) { q.add(objResults); ++resultsLen }
          else {
            ++limitedCount
            if(score > q.peek().score) q.replaceTop(objResults)
          }
        }

      // options.key
      } else if(options && options.key) {
        var key = options.key
        for(var i = targetsLen - 1; i >= 0; --i) { var obj = targets[i]
          var target = getValue(obj, key)
          if(!target) continue
          if(!isObj(target)) target = fuzzysort.getPrepared(target)

          var result = algorithm(search, target, searchLowerCode)
          if(result === null) continue
          if(result.score < threshold) continue

          // have to clone result so duplicate targets from different obj can each reference the correct obj
          result = {target:result.target, _targetLowerCodes:null, _nextBeginningIndexes:null, score:result.score, indexes:result.indexes, obj:obj} // hidden

          if(resultsLen < limit) { q.add(result); ++resultsLen }
          else {
            ++limitedCount
            if(result.score > q.peek().score) q.replaceTop(result)
          }
        }

      // no keys
      } else {
        for(var i = targetsLen - 1; i >= 0; --i) { var target = targets[i]
          if(!target) continue
          if(!isObj(target)) target = fuzzysort.getPrepared(target)

          var result = algorithm(search, target, searchLowerCode)
          if(result === null) continue
          if(result.score < threshold) continue
          if(resultsLen < limit) { q.add(result); ++resultsLen }
          else {
            ++limitedCount
            if(result.score > q.peek().score) q.replaceTop(result)
          }
        }
      }

      if(resultsLen === 0) return noResults
      var results = new Array(resultsLen)
      for(var i = resultsLen - 1; i >= 0; --i) results[i] = q.poll()
      results.total = resultsLen + limitedCount
      return results
    },

    goAsync: function(search, targets, options) {
      var canceled = false
      var p = new Promise(function(resolve, reject) {
        if(!search) return resolve(noResults)
        search = fuzzysort.prepareSearch(search)
        var searchLowerCode = search[0]

        var q = fastpriorityqueue()
        var iCurrent = targets.length - 1
        var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991
        var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991
        var allowTypo = options && options.allowTypo!==undefined ? options.allowTypo
          : instanceOptions && instanceOptions.allowTypo!==undefined ? instanceOptions.allowTypo
          : true
        var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo
        var resultsLen = 0; var limitedCount = 0
        function step() {
          if(canceled) return reject('canceled')

          var startMs = Date.now()

          // This code is copy/pasted 3 times for performance reasons [options.keys, options.key, no keys]

          // options.keys
          if(options && options.keys) {
            var scoreFn = options.scoreFn || defaultScoreFn
            var keys = options.keys
            var keysLen = keys.length
            for(; iCurrent >= 0; --iCurrent) { var obj = targets[iCurrent]
              var objResults = new Array(keysLen)
              for (var keyI = keysLen - 1; keyI >= 0; --keyI) {
                var key = keys[keyI]
                var target = getValue(obj, key)
                if(!target) { objResults[keyI] = null; continue }
                if(!isObj(target)) target = fuzzysort.getPrepared(target)

                objResults[keyI] = algorithm(search, target, searchLowerCode)
              }
              objResults.obj = obj // before scoreFn so scoreFn can use it
              var score = scoreFn(objResults)
              if(score === null) continue
              if(score < threshold) continue
              objResults.score = score
              if(resultsLen < limit) { q.add(objResults); ++resultsLen }
              else {
                ++limitedCount
                if(score > q.peek().score) q.replaceTop(objResults)
              }

              if(iCurrent%1000/*itemsPerCheck*/ === 0) {
                if(Date.now() - startMs >= 10/*asyncInterval*/) {
                  isNode?setImmediate(step):setTimeout(step)
                  return
                }
              }
            }

          // options.key
          } else if(options && options.key) {
            var key = options.key
            for(; iCurrent >= 0; --iCurrent) { var obj = targets[iCurrent]
              var target = getValue(obj, key)
              if(!target) continue
              if(!isObj(target)) target = fuzzysort.getPrepared(target)

              var result = algorithm(search, target, searchLowerCode)
              if(result === null) continue
              if(result.score < threshold) continue

              // have to clone result so duplicate targets from different obj can each reference the correct obj
              result = {target:result.target, _targetLowerCodes:null, _nextBeginningIndexes:null, score:result.score, indexes:result.indexes, obj:obj} // hidden

              if(resultsLen < limit) { q.add(result); ++resultsLen }
              else {
                ++limitedCount
                if(result.score > q.peek().score) q.replaceTop(result)
              }

              if(iCurrent%1000/*itemsPerCheck*/ === 0) {
                if(Date.now() - startMs >= 10/*asyncInterval*/) {
                  isNode?setImmediate(step):setTimeout(step)
                  return
                }
              }
            }

          // no keys
          } else {
            for(; iCurrent >= 0; --iCurrent) { var target = targets[iCurrent]
              if(!target) continue
              if(!isObj(target)) target = fuzzysort.getPrepared(target)

              var result = algorithm(search, target, searchLowerCode)
              if(result === null) continue
              if(result.score < threshold) continue
              if(resultsLen < limit) { q.add(result); ++resultsLen }
              else {
                ++limitedCount
                if(result.score > q.peek().score) q.replaceTop(result)
              }

              if(iCurrent%1000/*itemsPerCheck*/ === 0) {
                if(Date.now() - startMs >= 10/*asyncInterval*/) {
                  isNode?setImmediate(step):setTimeout(step)
                  return
                }
              }
            }
          }

          if(resultsLen === 0) return resolve(noResults)
          var results = new Array(resultsLen)
          for(var i = resultsLen - 1; i >= 0; --i) results[i] = q.poll()
          results.total = resultsLen + limitedCount
          resolve(results)
        }

        isNode?setImmediate(step):step()
      })
      p.cancel = function() { canceled = true }
      return p
    },

    highlight: function(result, hOpen, hClose) {
      if(result === null) return null
      if(hOpen === undefined) hOpen = '<b>'
      if(hClose === undefined) hClose = '</b>'
      var highlighted = ''
      var matchesIndex = 0
      var opened = false
      var target = result.target
      var targetLen = target.length
      var matchesBest = result.indexes
      for(var i = 0; i < targetLen; ++i) { var char = target[i]
        if(matchesBest[matchesIndex] === i) {
          ++matchesIndex
          if(!opened) { opened = true
            highlighted += hOpen
          }

          if(matchesIndex === matchesBest.length) {
            highlighted += char + hClose + target.substr(i+1)
            break
          }
        } else {
          if(opened) { opened = false
            highlighted += hClose
          }
        }
        highlighted += char
      }

      return highlighted
    },

    prepare: function(target) {
      if(!target) return
      return {target:target, _targetLowerCodes:fuzzysort.prepareLowerCodes(target), _nextBeginningIndexes:null, score:null, indexes:null, obj:null} // hidden
    },
    prepareSlow: function(target) {
      if(!target) return
      return {target:target, _targetLowerCodes:fuzzysort.prepareLowerCodes(target), _nextBeginningIndexes:fuzzysort.prepareNextBeginningIndexes(target), score:null, indexes:null, obj:null} // hidden
    },
    prepareSearch: function(search) {
      if(!search) return
      return fuzzysort.prepareLowerCodes(search)
    },



    // Below this point is only internal code
    // Below this point is only internal code
    // Below this point is only internal code
    // Below this point is only internal code



    getPrepared: function(target) {
      if(target.length > 999) return fuzzysort.prepare(target) // don't cache huge targets
      var targetPrepared = preparedCache.get(target)
      if(targetPrepared !== undefined) return targetPrepared
      targetPrepared = fuzzysort.prepare(target)
      preparedCache.set(target, targetPrepared)
      return targetPrepared
    },
    getPreparedSearch: function(search) {
      if(search.length > 999) return fuzzysort.prepareSearch(search) // don't cache huge searches
      var searchPrepared = preparedSearchCache.get(search)
      if(searchPrepared !== undefined) return searchPrepared
      searchPrepared = fuzzysort.prepareSearch(search)
      preparedSearchCache.set(search, searchPrepared)
      return searchPrepared
    },

    algorithm: function(searchLowerCodes, prepared, searchLowerCode) {
      var targetLowerCodes = prepared._targetLowerCodes
      var searchLen = searchLowerCodes.length
      var targetLen = targetLowerCodes.length
      var searchI = 0 // where we at
      var targetI = 0 // where you at
      var typoSimpleI = 0
      var matchesSimpleLen = 0

      // very basic fuzzy match; to remove non-matching targets ASAP!
      // walk through target. find sequential matches.
      // if all chars aren't found then exit
      for(;;) {
        var isMatch = searchLowerCode === targetLowerCodes[targetI]
        if(isMatch) {
          matchesSimple[matchesSimpleLen++] = targetI
          ++searchI; if(searchI === searchLen) break
          searchLowerCode = searchLowerCodes[typoSimpleI===0?searchI : (typoSimpleI===searchI?searchI+1 : (typoSimpleI===searchI-1?searchI-1 : searchI))]
        }

        ++targetI; if(targetI >= targetLen) { // Failed to find searchI
          // Check for typo or exit
          // we go as far as possible before trying to transpose
          // then we transpose backwards until we reach the beginning
          for(;;) {
            if(searchI <= 1) return null // not allowed to transpose first char
            if(typoSimpleI === 0) { // we haven't tried to transpose yet
              --searchI
              var searchLowerCodeNew = searchLowerCodes[searchI]
              if(searchLowerCode === searchLowerCodeNew) continue // doesn't make sense to transpose a repeat char
              typoSimpleI = searchI
            } else {
              if(typoSimpleI === 1) return null // reached the end of the line for transposing
              --typoSimpleI
              searchI = typoSimpleI
              searchLowerCode = searchLowerCodes[searchI + 1]
              var searchLowerCodeNew = searchLowerCodes[searchI]
              if(searchLowerCode === searchLowerCodeNew) continue // doesn't make sense to transpose a repeat char
            }
            matchesSimpleLen = searchI
            targetI = matchesSimple[matchesSimpleLen - 1] + 1
            break
          }
        }
      }

      var searchI = 0
      var typoStrictI = 0
      var successStrict = false
      var matchesStrictLen = 0

      var nextBeginningIndexes = prepared._nextBeginningIndexes
      if(nextBeginningIndexes === null) nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort.prepareNextBeginningIndexes(prepared.target)
      var firstPossibleI = targetI = matchesSimple[0]===0 ? 0 : nextBeginningIndexes[matchesSimple[0]-1]

      // Our target string successfully matched all characters in sequence!
      // Let's try a more advanced and strict test to improve the score
      // only count it as a match if it's consecutive or a beginning character!
      if(targetI !== targetLen) for(;;) {
        if(targetI >= targetLen) {
          // We failed to find a good spot for this search char, go back to the previous search char and force it forward
          if(searchI <= 0) { // We failed to push chars forward for a better match
            // transpose, starting from the beginning
            ++typoStrictI; if(typoStrictI > searchLen-2) break
            if(searchLowerCodes[typoStrictI] === searchLowerCodes[typoStrictI+1]) continue // doesn't make sense to transpose a repeat char
            targetI = firstPossibleI
            continue
          }

          --searchI
          var lastMatch = matchesStrict[--matchesStrictLen]
          targetI = nextBeginningIndexes[lastMatch]

        } else {
          var isMatch = searchLowerCodes[typoStrictI===0?searchI : (typoStrictI===searchI?searchI+1 : (typoStrictI===searchI-1?searchI-1 : searchI))] === targetLowerCodes[targetI]
          if(isMatch) {
            matchesStrict[matchesStrictLen++] = targetI
            ++searchI; if(searchI === searchLen) { successStrict = true; break }
            ++targetI
          } else {
            targetI = nextBeginningIndexes[targetI]
          }
        }
      }

      { // tally up the score & keep track of matches for highlighting later
        if(successStrict) { var matchesBest = matchesStrict; var matchesBestLen = matchesStrictLen }
        else { var matchesBest = matchesSimple; var matchesBestLen = matchesSimpleLen }
        var score = 0
        var lastTargetI = -1
        for(var i = 0; i < searchLen; ++i) { var targetI = matchesBest[i]
          // score only goes down if they're not consecutive
          if(lastTargetI !== targetI - 1) score -= targetI
          lastTargetI = targetI
        }
        if(!successStrict) {
          score *= 1000
          if(typoSimpleI !== 0) score += -20/*typoPenalty*/
        } else {
          if(typoStrictI !== 0) score += -20/*typoPenalty*/
        }
        score -= targetLen - searchLen
        prepared.score = score
        prepared.indexes = new Array(matchesBestLen); for(var i = matchesBestLen - 1; i >= 0; --i) prepared.indexes[i] = matchesBest[i]

        return prepared
      }
    },

    algorithmNoTypo: function(searchLowerCodes, prepared, searchLowerCode) {
      var targetLowerCodes = prepared._targetLowerCodes
      var searchLen = searchLowerCodes.length
      var targetLen = targetLowerCodes.length
      var searchI = 0 // where we at
      var targetI = 0 // where you at
      var matchesSimpleLen = 0

      // very basic fuzzy match; to remove non-matching targets ASAP!
      // walk through target. find sequential matches.
      // if all chars aren't found then exit
      for(;;) {
        var isMatch = searchLowerCode === targetLowerCodes[targetI]
        if(isMatch) {
          matchesSimple[matchesSimpleLen++] = targetI
          ++searchI; if(searchI === searchLen) break
          searchLowerCode = searchLowerCodes[searchI]
        }
        ++targetI; if(targetI >= targetLen) return null // Failed to find searchI
      }

      var searchI = 0
      var successStrict = false
      var matchesStrictLen = 0

      var nextBeginningIndexes = prepared._nextBeginningIndexes
      if(nextBeginningIndexes === null) nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort.prepareNextBeginningIndexes(prepared.target)
      var firstPossibleI = targetI = matchesSimple[0]===0 ? 0 : nextBeginningIndexes[matchesSimple[0]-1]

      // Our target string successfully matched all characters in sequence!
      // Let's try a more advanced and strict test to improve the score
      // only count it as a match if it's consecutive or a beginning character!
      if(targetI !== targetLen) for(;;) {
        if(targetI >= targetLen) {
          // We failed to find a good spot for this search char, go back to the previous search char and force it forward
          if(searchI <= 0) break // We failed to push chars forward for a better match

          --searchI
          var lastMatch = matchesStrict[--matchesStrictLen]
          targetI = nextBeginningIndexes[lastMatch]

        } else {
          var isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI]
          if(isMatch) {
            matchesStrict[matchesStrictLen++] = targetI
            ++searchI; if(searchI === searchLen) { successStrict = true; break }
            ++targetI
          } else {
            targetI = nextBeginningIndexes[targetI]
          }
        }
      }

      { // tally up the score & keep track of matches for highlighting later
        if(successStrict) { var matchesBest = matchesStrict; var matchesBestLen = matchesStrictLen }
        else { var matchesBest = matchesSimple; var matchesBestLen = matchesSimpleLen }
        var score = 0
        var lastTargetI = -1
        for(var i = 0; i < searchLen; ++i) { var targetI = matchesBest[i]
          // score only goes down if they're not consecutive
          if(lastTargetI !== targetI - 1) score -= targetI
          lastTargetI = targetI
        }
        if(!successStrict) score *= 1000
        score -= targetLen - searchLen
        prepared.score = score
        prepared.indexes = new Array(matchesBestLen); for(var i = matchesBestLen - 1; i >= 0; --i) prepared.indexes[i] = matchesBest[i]

        return prepared
      }
    },

    prepareLowerCodes: function(str) {
      var strLen = str.length
      var lowerCodes = [] // new Array(strLen)    sparse array is too slow
      var lower = str.toLowerCase()
      for(var i = 0; i < strLen; ++i) lowerCodes[i] = lower.charCodeAt(i)
      return lowerCodes
    },
    prepareBeginningIndexes: function(target) {
      var targetLen = target.length
      var beginningIndexes = []; var beginningIndexesLen = 0
      var wasUpper = false
      var wasAlphanum = false
      for(var i = 0; i < targetLen; ++i) {
        var targetCode = target.charCodeAt(i)
        var isUpper = targetCode>=65&&targetCode<=90
        var isAlphanum = isUpper || targetCode>=97&&targetCode<=122 || targetCode>=48&&targetCode<=57
        var isBeginning = isUpper && !wasUpper || !wasAlphanum || !isAlphanum
        wasUpper = isUpper
        wasAlphanum = isAlphanum
        if(isBeginning) beginningIndexes[beginningIndexesLen++] = i
      }
      return beginningIndexes
    },
    prepareNextBeginningIndexes: function(target) {
      var targetLen = target.length
      var beginningIndexes = fuzzysort.prepareBeginningIndexes(target)
      var nextBeginningIndexes = [] // new Array(targetLen)     sparse array is too slow
      var lastIsBeginning = beginningIndexes[0]
      var lastIsBeginningI = 0
      for(var i = 0; i < targetLen; ++i) {
        if(lastIsBeginning > i) {
          nextBeginningIndexes[i] = lastIsBeginning
        } else {
          lastIsBeginning = beginningIndexes[++lastIsBeginningI]
          nextBeginningIndexes[i] = lastIsBeginning===undefined ? targetLen : lastIsBeginning
        }
      }
      return nextBeginningIndexes
    },

    cleanup: cleanup,
    new: fuzzysortNew,
  }
  return fuzzysort
} // fuzzysortNew

// This stuff is outside fuzzysortNew, because it's shared with instances of fuzzysort.new()
var isNode = typeof require !== 'undefined' && typeof window === 'undefined'
// var MAX_INT = Number.MAX_SAFE_INTEGER
// var MIN_INT = Number.MIN_VALUE
var preparedCache = new Map()
var preparedSearchCache = new Map()
var noResults = []; noResults.total = 0
var matchesSimple = []; var matchesStrict = []
function cleanup() { preparedCache.clear(); preparedSearchCache.clear(); matchesSimple = []; matchesStrict = [] }
function defaultScoreFn(a) {
  var max = -9007199254740991
  for (var i = a.length - 1; i >= 0; --i) {
    var result = a[i]; if(result === null) continue
    var score = result.score
    if(score > max) max = score
  }
  if(max === -9007199254740991) return null
  return max
}

// prop = 'key'              2.5ms optimized for this case, seems to be about as fast as direct obj[prop]
// prop = 'key1.key2'        10ms
// prop = ['key1', 'key2']   27ms
function getValue(obj, prop) {
  var tmp = obj[prop]; if(tmp !== undefined) return tmp
  var segs = prop
  if(!Array.isArray(prop)) segs = prop.split('.')
  var len = segs.length
  var i = -1
  while (obj && (++i < len)) obj = obj[segs[i]]
  return obj
}

function isObj(x) { return typeof x === 'object' } // faster as a function

// Hacked version of https://github.com/lemire/FastPriorityQueue.js
var fastpriorityqueue=function(){var r=[],o=0,e={};function n(){for(var e=0,n=r[e],c=1;c<o;){var f=c+1;e=c,f<o&&r[f].score<r[c].score&&(e=f),r[e-1>>1]=r[e],c=1+(e<<1)}for(var a=e-1>>1;e>0&&n.score<r[a].score;a=(e=a)-1>>1)r[e]=r[a];r[e]=n}return e.add=function(e){var n=o;r[o++]=e;for(var c=n-1>>1;n>0&&e.score<r[c].score;c=(n=c)-1>>1)r[n]=r[c];r[n]=e},e.poll=function(){if(0!==o){var e=r[0];return r[0]=r[--o],n(),e}},e.peek=function(e){if(0!==o)return r[0]},e.replaceTop=function(o){r[0]=o,n()},e};
var q = fastpriorityqueue() // reuse this, except for async, it needs to make its own

return fuzzysortNew()
}) // UMD

// TODO: (performance) wasm version!?

// TODO: (performance) layout memory in an optimal way to go fast by avoiding cache misses

// TODO: (performance) preparedCache is a memory leak

// TODO: (like sublime) backslash === forwardslash

// TODO: (performance) i have no idea how well optizmied the allowing typos algorithm is

}).call(this,require("timers").setImmediate)

},{"timers":8}],7:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],8:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":7,"timers":8}],9:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

/* global GhostContentAPI location */

/**
 * Thanks => https://github.com/HauntedThemes/ghost-search
 */
// import fuzzysort from 'fuzzysort'
var fuzzysort = require('fuzzysort');

var GhostSearch =
/*#__PURE__*/
function () {
  function GhostSearch(args) {
    (0, _classCallCheck2.default)(this, GhostSearch);
    this.check = false;
    var defaults = {
      url: '',
      key: '',
      version: 'v2',
      input: '#ghost-search-field',
      results: '#ghost-search-results',
      button: '',
      defaultValue: '',
      template: function template(result) {
        var siteurl = [location.protocol, '//', location.host].join(''); // return '<a href="' + siteurl + '/' + result.slug + '/">' + result.title + '</a>'

        return "<a href=\"".concat(siteurl, "/").concat(result.slug, "/\">").concat(result.title, "</a>");
      },
      trigger: 'focus',
      options: {
        keys: ['title'],
        limit: 10,
        threshold: -3500,
        allowTypo: false
      },
      api: {
        resource: 'posts',
        parameters: {
          limit: 'all',
          fields: ['title', 'slug'],
          filter: '',
          include: '',
          order: '',
          formats: '',
          page: ''
        }
      },
      on: {
        beforeDisplay: function beforeDisplay() {},
        afterDisplay: function afterDisplay(results) {},
        //eslint-disable-line
        beforeFetch: function beforeFetch() {},
        afterFetch: function afterFetch(results) {} //eslint-disable-line

      }
    };
    var merged = this.mergeDeep(defaults, args);
    Object.assign(this, merged);
    this.init();
  }

  (0, _createClass2.default)(GhostSearch, [{
    key: "mergeDeep",
    value: function mergeDeep(target, source) {
      var _this = this;

      if (target && (0, _typeof2.default)(target) === 'object' && !Array.isArray(target) && target !== null && source && (0, _typeof2.default)(source) === 'object' && !Array.isArray(source) && source !== null) {
        Object.keys(source).forEach(function (key) {
          if (source[key] && (0, _typeof2.default)(source[key]) === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
            if (!target[key]) Object.assign(target, (0, _defineProperty2.default)({}, key, {}));

            _this.mergeDeep(target[key], source[key]);
          } else {
            Object.assign(target, (0, _defineProperty2.default)({}, key, source[key]));
          }
        });
      }

      return target;
    }
  }, {
    key: "fetch",
    value: function fetch() {
      var _this2 = this;

      this.on.beforeFetch();
      var ghostAPI = new GhostContentAPI({
        url: this.url,
        key: this.key,
        version: this.version
      });
      var browse = {};
      var parameters = this.api.parameters;

      for (var key in parameters) {
        if (parameters[key] !== '') {
          browse[key] = parameters[key];
        }
      } // browse.limit = 'all'


      ghostAPI[this.api.resource].browse(browse).then(function (data) {
        _this2.search(data);
      }).catch(function (err) {
        console.error(err);
      });
    }
  }, {
    key: "createElementFromHTML",
    value: function createElementFromHTML(htmlString) {
      var div = document.createElement('div');
      div.innerHTML = htmlString.trim();
      return div.firstChild;
    }
  }, {
    key: "displayResults",
    value: function displayResults(data) {
      if (document.querySelectorAll(this.results)[0].firstChild !== null && document.querySelectorAll(this.results)[0].firstChild !== '') {
        while (document.querySelectorAll(this.results)[0].firstChild) {
          document.querySelectorAll(this.results)[0].removeChild(document.querySelectorAll(this.results)[0].firstChild);
        }
      }

      var inputValue = document.querySelectorAll(this.input)[0].value;

      if (this.defaultValue !== '') {
        inputValue = this.defaultValue;
      }

      var results = fuzzysort.go(inputValue, data, {
        keys: this.options.keys,
        limit: this.options.limit,
        allowTypo: this.options.allowTypo,
        threshold: this.options.threshold
      });

      for (var key in results) {
        if (key < results.length) {
          document.querySelectorAll(this.results)[0].appendChild(this.createElementFromHTML(this.template(results[key].obj)));
        }
      }

      this.on.afterDisplay(results);
      this.defaultValue = '';
    }
  }, {
    key: "search",
    value: function search(data) {
      var _this3 = this;

      this.on.afterFetch(data);
      this.check = true;

      if (this.defaultValue !== '') {
        this.on.beforeDisplay();
        this.displayResults(data);
      }

      if (this.button !== '') {
        var button = document.querySelectorAll(this.button)[0];

        if (button.tagName === 'INPUT' && button.type === 'submit') {
          button.closest('form').addEventListener('submit', function (e) {
            e.preventDefault();
          });
        }

        button.addEventListener('click', function (e) {
          e.preventDefault();

          _this3.on.beforeDisplay();

          _this3.displayResults(data);
        });
      } else {
        document.querySelectorAll(this.input)[0].addEventListener('keyup', function () {
          _this3.on.beforeDisplay();

          _this3.displayResults(data);
        });
      }
    }
  }, {
    key: "checkArgs",
    value: function checkArgs() {
      if (!document.querySelectorAll(this.input).length) {
        console.log('Input not found.');
        return false;
      }

      if (!document.querySelectorAll(this.results).length) {
        console.log('Results not found.');
        return false;
      }

      if (this.button !== '') {
        if (!document.querySelectorAll(this.button).length) {
          console.log('Button not found.');
          return false;
        }
      }

      if (this.url === '') {
        console.log('Content API Client Library url missing. Please set the url. Must not end in a trailing slash.');
        return false;
      }

      if (this.key === '') {
        console.log('Content API Client Library key missing. Please set the key. Hex string copied from the "Integrations" screen in Ghost Admin.');
        return false;
      }

      return true;
    }
  }, {
    key: "validate",
    value: function validate() {
      if (!this.checkArgs()) {
        return false;
      }

      return true;
    }
  }, {
    key: "init",
    value: function init() {
      var _this4 = this;

      if (!this.validate()) {
        return;
      }

      if (this.defaultValue !== '') {
        document.querySelectorAll(this.input)[0].value = this.defaultValue;

        window.onload = function () {
          if (!_this4.check) {
            _this4.fetch();
          }
        };
      }

      if (this.trigger === 'focus') {
        document.querySelectorAll(this.input)[0].addEventListener('focus', function () {
          if (!_this4.check) {
            _this4.fetch();
          }
        });
      } else if (this.trigger === 'load') {
        window.onload = function () {
          if (!_this4.check) {
            _this4.fetch();
          }
        };
      }
    }
  }]);
  return GhostSearch;
}();
/* Export Class */


module.exports = GhostSearch;

},{"@babel/runtime/helpers/classCallCheck":1,"@babel/runtime/helpers/createClass":2,"@babel/runtime/helpers/defineProperty":3,"@babel/runtime/helpers/interopRequireDefault":4,"@babel/runtime/helpers/typeof":5,"fuzzysort":6}],10:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _app = _interopRequireDefault(require("./app/app.search"));

/* global searchKey */
// import { loadScript } from './app/app.load-style-script'
(function (window, document) {
  // ApiKey Search
  // if (typeof searchKey === 'undefined' || searchKey === '') return
  var qs = document.querySelector.bind(document);
  var qsa = document.querySelectorAll.bind(document);
  var searchInput = document.getElementById('search-field');
  var searchResults = qs('#searchResults');
  var searchMessage = qs('.js-search-message');
  var searchResultsHeight = {
    outer: 0,
    scroll: 0 // Load Ghost Api
    // -----------------------------------------------------------------------------
    // loadScript('https://unpkg.com/@tryghost/content-api@1.2.5/umd/content-api.min.js')
    // Variable for search
    // -----------------------------------------------------------------------------

  };
  var mySearchSettings = {
    url: window.location.origin,
    // url: 'http://localhost:2368',
    key: searchKey,
    input: '#search-field',
    results: '#searchResults',
    on: {
      afterDisplay: function afterDisplay() {
        searchResultActive();
        searchResultsHeight = {
          outer: searchResults.offsetHeight,
          scroll: searchResults.scrollHeight
        };
      }
    } // when the Enter key is pressed
    // -----------------------------------------------------------------------------

  };

  function enterKey() {
    var link = searchResults.querySelector('a.search-result--active');
    link && link.click();
  } // Attending the active class to the search link
  // -----------------------------------------------------------------------------


  function searchResultActive(t, e) {
    t = t || 0;
    e = e || 'up'; // Dont use key functions

    if (window.innerWidth < 768) return;
    var searchLInk = searchResults.querySelectorAll('a');

    if (!searchLInk.length) {
      searchInput.value.length && searchMessage.classList.remove('u-hide');
      return;
    }

    searchMessage.classList.add('u-hide');
    var searchLinkActive = searchResults.querySelector('a.search-result--active');
    searchLinkActive && searchLinkActive.classList.remove('search-result--active');
    searchLInk[t].classList.add('search-result--active');
    var n = searchLInk[t].offsetTop;
    var o = 0;
    e === 'down' && n > searchResultsHeight.outer / 2 ? o = n - searchResultsHeight.outer / 2 : e === 'up' && (o = n < searchResultsHeight.scroll - searchResultsHeight.outer / 2 ? n - searchResultsHeight.outer / 2 : searchResultsHeight.scroll);
    searchResults.scrollTo(0, o);
  } // Clear Input for write new letters
  // -----------------------------------------------------------------------------


  function clearInput() {
    searchInput.focus();
    searchInput.setSelectionRange(0, searchInput.value.length);
  } // Search close with Key
  // -----------------------------------------------------------------------------


  function searchClose() {
    document.body.classList.remove('has-search');
    document.removeEventListener('keyup', mySearchKey);
  } // Reacted to the up or down keys
  // -----------------------------------------------------------------------------


  function arrowKeyUpDown(keyNumber) {
    var e;
    var indexTheLink = 0;
    var resultActive = searchResults.querySelector('.search-result--active');

    if (resultActive) {
      indexTheLink = [].slice.call(resultActive.parentNode.children).indexOf(resultActive);
    }

    searchInput.blur();

    if (keyNumber === 38) {
      e = 'up';

      if (indexTheLink <= 0) {
        searchInput.focus();
        indexTheLink = 0;
      } else {
        indexTheLink -= 1;
      }
    } else {
      e = 'down';

      if (indexTheLink >= searchResults.querySelectorAll('a').length - 1) {
        indexTheLink = searchResults.querySelectorAll('a').length - 1;
      } else {
        indexTheLink = indexTheLink + 1;
      }
    }

    searchResultActive(indexTheLink, e);
  } // Adding functions to the keys
  // -----------------------------------------------------------------------------


  function mySearchKey(e) {
    e.preventDefault();
    var keyNumber = e.keyCode;
    /**
      * 38 => Top / Arriba
      * 40 => down / abajo
      * 27 => escape
      * 13 => enter
      * 191 => /
      **/

    if (keyNumber === 27) {
      searchClose();
    } else if (keyNumber === 13) {
      searchInput.blur();
      enterKey();
    } else if (keyNumber === 38 || keyNumber === 40) {
      arrowKeyUpDown(keyNumber);
    } else if (keyNumber === 191) {
      clearInput();
    }
  } // Open Search
  // -----------------------------------------------------------------------------


  qsa('.js-open-search').forEach(function (item) {
    return item.addEventListener('click', function (e) {
      e.preventDefault();
      document.body.classList.add('has-search');
      searchInput.focus();
      window.innerWidth > 768 && document.addEventListener('keyup', mySearchKey);
    });
  }); // Close Search
  // -----------------------------------------------------------------------------

  qsa('.js-close-search').forEach(function (item) {
    return item.addEventListener('click', function (e) {
      e.preventDefault();
      document.body.classList.remove('has-search');
      document.removeEventListener('keyup', mySearchKey);
    });
  }); // Search
  // -----------------------------------------------------------------------------

  /* eslint-disable no-new */

  new _app.default(mySearchSettings);
})(window, document);

},{"./app/app.search":9,"@babel/runtime/helpers/interopRequireDefault":4}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVjay5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2NyZWF0ZUNsYXNzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2YuanMiLCJub2RlX21vZHVsZXMvZnV6enlzb3J0L2Z1enp5c29ydC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdGltZXJzLWJyb3dzZXJpZnkvbWFpbi5qcyIsInNyYy9qcy9hcHAvYXBwLnNlYXJjaC5qcyIsInNyYy9qcy9zZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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TUFBQSxNQUFNLENBQUMsVUFBUCxHQUFvQixHQUFwQixJQUEyQixRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsT0FBMUIsRUFBbUMsV0FBbkMsQ0FBM0I7QUFDRCxLQUxzQyxDQUFKO0FBQUEsR0FBbkMsRUF6SnFCLENBZ0tyQjtBQUNBOztBQUNBLEVBQUEsR0FBRyxDQUFDLGtCQUFELENBQUgsQ0FBd0IsT0FBeEIsQ0FBZ0MsVUFBQSxJQUFJO0FBQUEsV0FBSSxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsT0FBdEIsRUFBK0IsVUFBQSxDQUFDLEVBQUk7QUFDMUUsTUFBQSxDQUFDLENBQUMsY0FBRjtBQUNBLE1BQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxTQUFkLENBQXdCLE1BQXhCLENBQStCLFlBQS9CO0FBQ0EsTUFBQSxRQUFRLENBQUMsbUJBQVQsQ0FBNkIsT0FBN0IsRUFBc0MsV0FBdEM7QUFDRCxLQUp1QyxDQUFKO0FBQUEsR0FBcEMsRUFsS3FCLENBd0tyQjtBQUNBOztBQUNBOztBQUNBLE1BQUksWUFBSixDQUFnQixnQkFBaEI7QUFDRCxDQTVLRCxFQTRLRyxNQTVLSCxFQTRLVyxRQTVLWCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NsYXNzQ2FsbENoZWNrOyIsImZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gIGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gIHJldHVybiBDb25zdHJ1Y3Rvcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfY3JlYXRlQ2xhc3M7IiwiZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5IGluIG9iaikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2RlZmluZVByb3BlcnR5OyIsImZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgXCJkZWZhdWx0XCI6IG9ialxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQ7IiwiZnVuY3Rpb24gX3R5cGVvZjIob2JqKSB7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikgeyBfdHlwZW9mMiA9IGZ1bmN0aW9uIF90eXBlb2YyKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfTsgfSBlbHNlIHsgX3R5cGVvZjIgPSBmdW5jdGlvbiBfdHlwZW9mMihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2YyKG9iaik7IH1cblxuZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBfdHlwZW9mMihTeW1ib2wuaXRlcmF0b3IpID09PSBcInN5bWJvbFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgICAgIHJldHVybiBfdHlwZW9mMihvYmopO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiBfdHlwZW9mMihvYmopO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gX3R5cGVvZihvYmopO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF90eXBlb2Y7IiwiLypcclxuV0hBVDogU3VibGltZVRleHQtbGlrZSBGdXp6eSBTZWFyY2hcclxuXHJcblVTQUdFOlxyXG4gIGZ1enp5c29ydC5zaW5nbGUoJ2ZzJywgJ0Z1enp5IFNlYXJjaCcpIC8vIHtzY29yZTogLTE2fVxyXG4gIGZ1enp5c29ydC5zaW5nbGUoJ3Rlc3QnLCAndGVzdCcpIC8vIHtzY29yZTogMH1cclxuICBmdXp6eXNvcnQuc2luZ2xlKCdkb2VzbnQgZXhpc3QnLCAndGFyZ2V0JykgLy8gbnVsbFxyXG5cclxuICBmdXp6eXNvcnQuZ28oJ21yJywgWydNb25pdG9yLmNwcCcsICdNZXNoUmVuZGVyZXIuY3BwJ10pXHJcbiAgLy8gW3tzY29yZTogLTE4LCB0YXJnZXQ6IFwiTWVzaFJlbmRlcmVyLmNwcFwifSwge3Njb3JlOiAtNjAwOSwgdGFyZ2V0OiBcIk1vbml0b3IuY3BwXCJ9XVxyXG5cclxuICBmdXp6eXNvcnQuaGlnaGxpZ2h0KGZ1enp5c29ydC5zaW5nbGUoJ2ZzJywgJ0Z1enp5IFNlYXJjaCcpLCAnPGI+JywgJzwvYj4nKVxyXG4gIC8vIDxiPkY8L2I+dXp6eSA8Yj5TPC9iPmVhcmNoXHJcbiovXHJcblxyXG4vLyBVTUQgKFVuaXZlcnNhbCBNb2R1bGUgRGVmaW5pdGlvbikgZm9yIGZ1enp5c29ydFxyXG47KGZ1bmN0aW9uKHJvb3QsIFVNRCkge1xyXG4gIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKFtdLCBVTUQpXHJcbiAgZWxzZSBpZih0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBVTUQoKVxyXG4gIGVsc2Ugcm9vdC5mdXp6eXNvcnQgPSBVTUQoKVxyXG59KSh0aGlzLCBmdW5jdGlvbiBVTUQoKSB7IGZ1bmN0aW9uIGZ1enp5c29ydE5ldyhpbnN0YW5jZU9wdGlvbnMpIHtcclxuXHJcbiAgdmFyIGZ1enp5c29ydCA9IHtcclxuXHJcbiAgICBzaW5nbGU6IGZ1bmN0aW9uKHNlYXJjaCwgdGFyZ2V0LCBvcHRpb25zKSB7XHJcbiAgICAgIGlmKCFzZWFyY2gpIHJldHVybiBudWxsXHJcbiAgICAgIGlmKCFpc09iaihzZWFyY2gpKSBzZWFyY2ggPSBmdXp6eXNvcnQuZ2V0UHJlcGFyZWRTZWFyY2goc2VhcmNoKVxyXG5cclxuICAgICAgaWYoIXRhcmdldCkgcmV0dXJuIG51bGxcclxuICAgICAgaWYoIWlzT2JqKHRhcmdldCkpIHRhcmdldCA9IGZ1enp5c29ydC5nZXRQcmVwYXJlZCh0YXJnZXQpXHJcblxyXG4gICAgICB2YXIgYWxsb3dUeXBvID0gb3B0aW9ucyAmJiBvcHRpb25zLmFsbG93VHlwbyE9PXVuZGVmaW5lZCA/IG9wdGlvbnMuYWxsb3dUeXBvXHJcbiAgICAgICAgOiBpbnN0YW5jZU9wdGlvbnMgJiYgaW5zdGFuY2VPcHRpb25zLmFsbG93VHlwbyE9PXVuZGVmaW5lZCA/IGluc3RhbmNlT3B0aW9ucy5hbGxvd1R5cG9cclxuICAgICAgICA6IHRydWVcclxuICAgICAgdmFyIGFsZ29yaXRobSA9IGFsbG93VHlwbyA/IGZ1enp5c29ydC5hbGdvcml0aG0gOiBmdXp6eXNvcnQuYWxnb3JpdGhtTm9UeXBvXHJcbiAgICAgIHJldHVybiBhbGdvcml0aG0oc2VhcmNoLCB0YXJnZXQsIHNlYXJjaFswXSlcclxuICAgICAgLy8gdmFyIHRocmVzaG9sZCA9IG9wdGlvbnMgJiYgb3B0aW9ucy50aHJlc2hvbGQgfHwgaW5zdGFuY2VPcHRpb25zICYmIGluc3RhbmNlT3B0aW9ucy50aHJlc2hvbGQgfHwgLTkwMDcxOTkyNTQ3NDA5OTFcclxuICAgICAgLy8gdmFyIHJlc3VsdCA9IGFsZ29yaXRobShzZWFyY2gsIHRhcmdldCwgc2VhcmNoWzBdKVxyXG4gICAgICAvLyBpZihyZXN1bHQgPT09IG51bGwpIHJldHVybiBudWxsXHJcbiAgICAgIC8vIGlmKHJlc3VsdC5zY29yZSA8IHRocmVzaG9sZCkgcmV0dXJuIG51bGxcclxuICAgICAgLy8gcmV0dXJuIHJlc3VsdFxyXG4gICAgfSxcclxuXHJcbiAgICBnbzogZnVuY3Rpb24oc2VhcmNoLCB0YXJnZXRzLCBvcHRpb25zKSB7XHJcbiAgICAgIGlmKCFzZWFyY2gpIHJldHVybiBub1Jlc3VsdHNcclxuICAgICAgc2VhcmNoID0gZnV6enlzb3J0LnByZXBhcmVTZWFyY2goc2VhcmNoKVxyXG4gICAgICB2YXIgc2VhcmNoTG93ZXJDb2RlID0gc2VhcmNoWzBdXHJcblxyXG4gICAgICB2YXIgdGhyZXNob2xkID0gb3B0aW9ucyAmJiBvcHRpb25zLnRocmVzaG9sZCB8fCBpbnN0YW5jZU9wdGlvbnMgJiYgaW5zdGFuY2VPcHRpb25zLnRocmVzaG9sZCB8fCAtOTAwNzE5OTI1NDc0MDk5MVxyXG4gICAgICB2YXIgbGltaXQgPSBvcHRpb25zICYmIG9wdGlvbnMubGltaXQgfHwgaW5zdGFuY2VPcHRpb25zICYmIGluc3RhbmNlT3B0aW9ucy5saW1pdCB8fCA5MDA3MTk5MjU0NzQwOTkxXHJcbiAgICAgIHZhciBhbGxvd1R5cG8gPSBvcHRpb25zICYmIG9wdGlvbnMuYWxsb3dUeXBvIT09dW5kZWZpbmVkID8gb3B0aW9ucy5hbGxvd1R5cG9cclxuICAgICAgICA6IGluc3RhbmNlT3B0aW9ucyAmJiBpbnN0YW5jZU9wdGlvbnMuYWxsb3dUeXBvIT09dW5kZWZpbmVkID8gaW5zdGFuY2VPcHRpb25zLmFsbG93VHlwb1xyXG4gICAgICAgIDogdHJ1ZVxyXG4gICAgICB2YXIgYWxnb3JpdGhtID0gYWxsb3dUeXBvID8gZnV6enlzb3J0LmFsZ29yaXRobSA6IGZ1enp5c29ydC5hbGdvcml0aG1Ob1R5cG9cclxuICAgICAgdmFyIHJlc3VsdHNMZW4gPSAwOyB2YXIgbGltaXRlZENvdW50ID0gMFxyXG4gICAgICB2YXIgdGFyZ2V0c0xlbiA9IHRhcmdldHMubGVuZ3RoXHJcblxyXG4gICAgICAvLyBUaGlzIGNvZGUgaXMgY29weS9wYXN0ZWQgMyB0aW1lcyBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucyBbb3B0aW9ucy5rZXlzLCBvcHRpb25zLmtleSwgbm8ga2V5c11cclxuXHJcbiAgICAgIC8vIG9wdGlvbnMua2V5c1xyXG4gICAgICBpZihvcHRpb25zICYmIG9wdGlvbnMua2V5cykge1xyXG4gICAgICAgIHZhciBzY29yZUZuID0gb3B0aW9ucy5zY29yZUZuIHx8IGRlZmF1bHRTY29yZUZuXHJcbiAgICAgICAgdmFyIGtleXMgPSBvcHRpb25zLmtleXNcclxuICAgICAgICB2YXIga2V5c0xlbiA9IGtleXMubGVuZ3RoXHJcbiAgICAgICAgZm9yKHZhciBpID0gdGFyZ2V0c0xlbiAtIDE7IGkgPj0gMDsgLS1pKSB7IHZhciBvYmogPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgICB2YXIgb2JqUmVzdWx0cyA9IG5ldyBBcnJheShrZXlzTGVuKVxyXG4gICAgICAgICAgZm9yICh2YXIga2V5SSA9IGtleXNMZW4gLSAxOyBrZXlJID49IDA7IC0ta2V5SSkge1xyXG4gICAgICAgICAgICB2YXIga2V5ID0ga2V5c1trZXlJXVxyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gZ2V0VmFsdWUob2JqLCBrZXkpXHJcbiAgICAgICAgICAgIGlmKCF0YXJnZXQpIHsgb2JqUmVzdWx0c1trZXlJXSA9IG51bGw7IGNvbnRpbnVlIH1cclxuICAgICAgICAgICAgaWYoIWlzT2JqKHRhcmdldCkpIHRhcmdldCA9IGZ1enp5c29ydC5nZXRQcmVwYXJlZCh0YXJnZXQpXHJcblxyXG4gICAgICAgICAgICBvYmpSZXN1bHRzW2tleUldID0gYWxnb3JpdGhtKHNlYXJjaCwgdGFyZ2V0LCBzZWFyY2hMb3dlckNvZGUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBvYmpSZXN1bHRzLm9iaiA9IG9iaiAvLyBiZWZvcmUgc2NvcmVGbiBzbyBzY29yZUZuIGNhbiB1c2UgaXRcclxuICAgICAgICAgIHZhciBzY29yZSA9IHNjb3JlRm4ob2JqUmVzdWx0cylcclxuICAgICAgICAgIGlmKHNjb3JlID09PSBudWxsKSBjb250aW51ZVxyXG4gICAgICAgICAgaWYoc2NvcmUgPCB0aHJlc2hvbGQpIGNvbnRpbnVlXHJcbiAgICAgICAgICBvYmpSZXN1bHRzLnNjb3JlID0gc2NvcmVcclxuICAgICAgICAgIGlmKHJlc3VsdHNMZW4gPCBsaW1pdCkgeyBxLmFkZChvYmpSZXN1bHRzKTsgKytyZXN1bHRzTGVuIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICArK2xpbWl0ZWRDb3VudFxyXG4gICAgICAgICAgICBpZihzY29yZSA+IHEucGVlaygpLnNjb3JlKSBxLnJlcGxhY2VUb3Aob2JqUmVzdWx0cylcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAvLyBvcHRpb25zLmtleVxyXG4gICAgICB9IGVsc2UgaWYob3B0aW9ucyAmJiBvcHRpb25zLmtleSkge1xyXG4gICAgICAgIHZhciBrZXkgPSBvcHRpb25zLmtleVxyXG4gICAgICAgIGZvcih2YXIgaSA9IHRhcmdldHNMZW4gLSAxOyBpID49IDA7IC0taSkgeyB2YXIgb2JqID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgICAgdmFyIHRhcmdldCA9IGdldFZhbHVlKG9iaiwga2V5KVxyXG4gICAgICAgICAgaWYoIXRhcmdldCkgY29udGludWVcclxuICAgICAgICAgIGlmKCFpc09iaih0YXJnZXQpKSB0YXJnZXQgPSBmdXp6eXNvcnQuZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG5cclxuICAgICAgICAgIHZhciByZXN1bHQgPSBhbGdvcml0aG0oc2VhcmNoLCB0YXJnZXQsIHNlYXJjaExvd2VyQ29kZSlcclxuICAgICAgICAgIGlmKHJlc3VsdCA9PT0gbnVsbCkgY29udGludWVcclxuICAgICAgICAgIGlmKHJlc3VsdC5zY29yZSA8IHRocmVzaG9sZCkgY29udGludWVcclxuXHJcbiAgICAgICAgICAvLyBoYXZlIHRvIGNsb25lIHJlc3VsdCBzbyBkdXBsaWNhdGUgdGFyZ2V0cyBmcm9tIGRpZmZlcmVudCBvYmogY2FuIGVhY2ggcmVmZXJlbmNlIHRoZSBjb3JyZWN0IG9ialxyXG4gICAgICAgICAgcmVzdWx0ID0ge3RhcmdldDpyZXN1bHQudGFyZ2V0LCBfdGFyZ2V0TG93ZXJDb2RlczpudWxsLCBfbmV4dEJlZ2lubmluZ0luZGV4ZXM6bnVsbCwgc2NvcmU6cmVzdWx0LnNjb3JlLCBpbmRleGVzOnJlc3VsdC5pbmRleGVzLCBvYmo6b2JqfSAvLyBoaWRkZW5cclxuXHJcbiAgICAgICAgICBpZihyZXN1bHRzTGVuIDwgbGltaXQpIHsgcS5hZGQocmVzdWx0KTsgKytyZXN1bHRzTGVuIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICArK2xpbWl0ZWRDb3VudFxyXG4gICAgICAgICAgICBpZihyZXN1bHQuc2NvcmUgPiBxLnBlZWsoKS5zY29yZSkgcS5yZXBsYWNlVG9wKHJlc3VsdClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAvLyBubyBrZXlzXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZm9yKHZhciBpID0gdGFyZ2V0c0xlbiAtIDE7IGkgPj0gMDsgLS1pKSB7IHZhciB0YXJnZXQgPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgICBpZighdGFyZ2V0KSBjb250aW51ZVxyXG4gICAgICAgICAgaWYoIWlzT2JqKHRhcmdldCkpIHRhcmdldCA9IGZ1enp5c29ydC5nZXRQcmVwYXJlZCh0YXJnZXQpXHJcblxyXG4gICAgICAgICAgdmFyIHJlc3VsdCA9IGFsZ29yaXRobShzZWFyY2gsIHRhcmdldCwgc2VhcmNoTG93ZXJDb2RlKVxyXG4gICAgICAgICAgaWYocmVzdWx0ID09PSBudWxsKSBjb250aW51ZVxyXG4gICAgICAgICAgaWYocmVzdWx0LnNjb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZVxyXG4gICAgICAgICAgaWYocmVzdWx0c0xlbiA8IGxpbWl0KSB7IHEuYWRkKHJlc3VsdCk7ICsrcmVzdWx0c0xlbiB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgKytsaW1pdGVkQ291bnRcclxuICAgICAgICAgICAgaWYocmVzdWx0LnNjb3JlID4gcS5wZWVrKCkuc2NvcmUpIHEucmVwbGFjZVRvcChyZXN1bHQpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZihyZXN1bHRzTGVuID09PSAwKSByZXR1cm4gbm9SZXN1bHRzXHJcbiAgICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KHJlc3VsdHNMZW4pXHJcbiAgICAgIGZvcih2YXIgaSA9IHJlc3VsdHNMZW4gLSAxOyBpID49IDA7IC0taSkgcmVzdWx0c1tpXSA9IHEucG9sbCgpXHJcbiAgICAgIHJlc3VsdHMudG90YWwgPSByZXN1bHRzTGVuICsgbGltaXRlZENvdW50XHJcbiAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9LFxyXG5cclxuICAgIGdvQXN5bmM6IGZ1bmN0aW9uKHNlYXJjaCwgdGFyZ2V0cywgb3B0aW9ucykge1xyXG4gICAgICB2YXIgY2FuY2VsZWQgPSBmYWxzZVxyXG4gICAgICB2YXIgcCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGlmKCFzZWFyY2gpIHJldHVybiByZXNvbHZlKG5vUmVzdWx0cylcclxuICAgICAgICBzZWFyY2ggPSBmdXp6eXNvcnQucHJlcGFyZVNlYXJjaChzZWFyY2gpXHJcbiAgICAgICAgdmFyIHNlYXJjaExvd2VyQ29kZSA9IHNlYXJjaFswXVxyXG5cclxuICAgICAgICB2YXIgcSA9IGZhc3Rwcmlvcml0eXF1ZXVlKClcclxuICAgICAgICB2YXIgaUN1cnJlbnQgPSB0YXJnZXRzLmxlbmd0aCAtIDFcclxuICAgICAgICB2YXIgdGhyZXNob2xkID0gb3B0aW9ucyAmJiBvcHRpb25zLnRocmVzaG9sZCB8fCBpbnN0YW5jZU9wdGlvbnMgJiYgaW5zdGFuY2VPcHRpb25zLnRocmVzaG9sZCB8fCAtOTAwNzE5OTI1NDc0MDk5MVxyXG4gICAgICAgIHZhciBsaW1pdCA9IG9wdGlvbnMgJiYgb3B0aW9ucy5saW1pdCB8fCBpbnN0YW5jZU9wdGlvbnMgJiYgaW5zdGFuY2VPcHRpb25zLmxpbWl0IHx8IDkwMDcxOTkyNTQ3NDA5OTFcclxuICAgICAgICB2YXIgYWxsb3dUeXBvID0gb3B0aW9ucyAmJiBvcHRpb25zLmFsbG93VHlwbyE9PXVuZGVmaW5lZCA/IG9wdGlvbnMuYWxsb3dUeXBvXHJcbiAgICAgICAgICA6IGluc3RhbmNlT3B0aW9ucyAmJiBpbnN0YW5jZU9wdGlvbnMuYWxsb3dUeXBvIT09dW5kZWZpbmVkID8gaW5zdGFuY2VPcHRpb25zLmFsbG93VHlwb1xyXG4gICAgICAgICAgOiB0cnVlXHJcbiAgICAgICAgdmFyIGFsZ29yaXRobSA9IGFsbG93VHlwbyA/IGZ1enp5c29ydC5hbGdvcml0aG0gOiBmdXp6eXNvcnQuYWxnb3JpdGhtTm9UeXBvXHJcbiAgICAgICAgdmFyIHJlc3VsdHNMZW4gPSAwOyB2YXIgbGltaXRlZENvdW50ID0gMFxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAoKSB7XHJcbiAgICAgICAgICBpZihjYW5jZWxlZCkgcmV0dXJuIHJlamVjdCgnY2FuY2VsZWQnKVxyXG5cclxuICAgICAgICAgIHZhciBzdGFydE1zID0gRGF0ZS5ub3coKVxyXG5cclxuICAgICAgICAgIC8vIFRoaXMgY29kZSBpcyBjb3B5L3Bhc3RlZCAzIHRpbWVzIGZvciBwZXJmb3JtYW5jZSByZWFzb25zIFtvcHRpb25zLmtleXMsIG9wdGlvbnMua2V5LCBubyBrZXlzXVxyXG5cclxuICAgICAgICAgIC8vIG9wdGlvbnMua2V5c1xyXG4gICAgICAgICAgaWYob3B0aW9ucyAmJiBvcHRpb25zLmtleXMpIHtcclxuICAgICAgICAgICAgdmFyIHNjb3JlRm4gPSBvcHRpb25zLnNjb3JlRm4gfHwgZGVmYXVsdFNjb3JlRm5cclxuICAgICAgICAgICAgdmFyIGtleXMgPSBvcHRpb25zLmtleXNcclxuICAgICAgICAgICAgdmFyIGtleXNMZW4gPSBrZXlzLmxlbmd0aFxyXG4gICAgICAgICAgICBmb3IoOyBpQ3VycmVudCA+PSAwOyAtLWlDdXJyZW50KSB7IHZhciBvYmogPSB0YXJnZXRzW2lDdXJyZW50XVxyXG4gICAgICAgICAgICAgIHZhciBvYmpSZXN1bHRzID0gbmV3IEFycmF5KGtleXNMZW4pXHJcbiAgICAgICAgICAgICAgZm9yICh2YXIga2V5SSA9IGtleXNMZW4gLSAxOyBrZXlJID49IDA7IC0ta2V5SSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IGtleXNba2V5SV1cclxuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSBnZXRWYWx1ZShvYmosIGtleSlcclxuICAgICAgICAgICAgICAgIGlmKCF0YXJnZXQpIHsgb2JqUmVzdWx0c1trZXlJXSA9IG51bGw7IGNvbnRpbnVlIH1cclxuICAgICAgICAgICAgICAgIGlmKCFpc09iaih0YXJnZXQpKSB0YXJnZXQgPSBmdXp6eXNvcnQuZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG5cclxuICAgICAgICAgICAgICAgIG9ialJlc3VsdHNba2V5SV0gPSBhbGdvcml0aG0oc2VhcmNoLCB0YXJnZXQsIHNlYXJjaExvd2VyQ29kZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgb2JqUmVzdWx0cy5vYmogPSBvYmogLy8gYmVmb3JlIHNjb3JlRm4gc28gc2NvcmVGbiBjYW4gdXNlIGl0XHJcbiAgICAgICAgICAgICAgdmFyIHNjb3JlID0gc2NvcmVGbihvYmpSZXN1bHRzKVxyXG4gICAgICAgICAgICAgIGlmKHNjb3JlID09PSBudWxsKSBjb250aW51ZVxyXG4gICAgICAgICAgICAgIGlmKHNjb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZVxyXG4gICAgICAgICAgICAgIG9ialJlc3VsdHMuc2NvcmUgPSBzY29yZVxyXG4gICAgICAgICAgICAgIGlmKHJlc3VsdHNMZW4gPCBsaW1pdCkgeyBxLmFkZChvYmpSZXN1bHRzKTsgKytyZXN1bHRzTGVuIH1cclxuICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICsrbGltaXRlZENvdW50XHJcbiAgICAgICAgICAgICAgICBpZihzY29yZSA+IHEucGVlaygpLnNjb3JlKSBxLnJlcGxhY2VUb3Aob2JqUmVzdWx0cylcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGlmKGlDdXJyZW50JTEwMDAvKml0ZW1zUGVyQ2hlY2sqLyA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYoRGF0ZS5ub3coKSAtIHN0YXJ0TXMgPj0gMTAvKmFzeW5jSW50ZXJ2YWwqLykge1xyXG4gICAgICAgICAgICAgICAgICBpc05vZGU/c2V0SW1tZWRpYXRlKHN0ZXApOnNldFRpbWVvdXQoc3RlcClcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gb3B0aW9ucy5rZXlcclxuICAgICAgICAgIH0gZWxzZSBpZihvcHRpb25zICYmIG9wdGlvbnMua2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBrZXkgPSBvcHRpb25zLmtleVxyXG4gICAgICAgICAgICBmb3IoOyBpQ3VycmVudCA+PSAwOyAtLWlDdXJyZW50KSB7IHZhciBvYmogPSB0YXJnZXRzW2lDdXJyZW50XVxyXG4gICAgICAgICAgICAgIHZhciB0YXJnZXQgPSBnZXRWYWx1ZShvYmosIGtleSlcclxuICAgICAgICAgICAgICBpZighdGFyZ2V0KSBjb250aW51ZVxyXG4gICAgICAgICAgICAgIGlmKCFpc09iaih0YXJnZXQpKSB0YXJnZXQgPSBmdXp6eXNvcnQuZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG5cclxuICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gYWxnb3JpdGhtKHNlYXJjaCwgdGFyZ2V0LCBzZWFyY2hMb3dlckNvZGUpXHJcbiAgICAgICAgICAgICAgaWYocmVzdWx0ID09PSBudWxsKSBjb250aW51ZVxyXG4gICAgICAgICAgICAgIGlmKHJlc3VsdC5zY29yZSA8IHRocmVzaG9sZCkgY29udGludWVcclxuXHJcbiAgICAgICAgICAgICAgLy8gaGF2ZSB0byBjbG9uZSByZXN1bHQgc28gZHVwbGljYXRlIHRhcmdldHMgZnJvbSBkaWZmZXJlbnQgb2JqIGNhbiBlYWNoIHJlZmVyZW5jZSB0aGUgY29ycmVjdCBvYmpcclxuICAgICAgICAgICAgICByZXN1bHQgPSB7dGFyZ2V0OnJlc3VsdC50YXJnZXQsIF90YXJnZXRMb3dlckNvZGVzOm51bGwsIF9uZXh0QmVnaW5uaW5nSW5kZXhlczpudWxsLCBzY29yZTpyZXN1bHQuc2NvcmUsIGluZGV4ZXM6cmVzdWx0LmluZGV4ZXMsIG9iajpvYmp9IC8vIGhpZGRlblxyXG5cclxuICAgICAgICAgICAgICBpZihyZXN1bHRzTGVuIDwgbGltaXQpIHsgcS5hZGQocmVzdWx0KTsgKytyZXN1bHRzTGVuIH1cclxuICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICsrbGltaXRlZENvdW50XHJcbiAgICAgICAgICAgICAgICBpZihyZXN1bHQuc2NvcmUgPiBxLnBlZWsoKS5zY29yZSkgcS5yZXBsYWNlVG9wKHJlc3VsdClcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGlmKGlDdXJyZW50JTEwMDAvKml0ZW1zUGVyQ2hlY2sqLyA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYoRGF0ZS5ub3coKSAtIHN0YXJ0TXMgPj0gMTAvKmFzeW5jSW50ZXJ2YWwqLykge1xyXG4gICAgICAgICAgICAgICAgICBpc05vZGU/c2V0SW1tZWRpYXRlKHN0ZXApOnNldFRpbWVvdXQoc3RlcClcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gbm8ga2V5c1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yKDsgaUN1cnJlbnQgPj0gMDsgLS1pQ3VycmVudCkgeyB2YXIgdGFyZ2V0ID0gdGFyZ2V0c1tpQ3VycmVudF1cclxuICAgICAgICAgICAgICBpZighdGFyZ2V0KSBjb250aW51ZVxyXG4gICAgICAgICAgICAgIGlmKCFpc09iaih0YXJnZXQpKSB0YXJnZXQgPSBmdXp6eXNvcnQuZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG5cclxuICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gYWxnb3JpdGhtKHNlYXJjaCwgdGFyZ2V0LCBzZWFyY2hMb3dlckNvZGUpXHJcbiAgICAgICAgICAgICAgaWYocmVzdWx0ID09PSBudWxsKSBjb250aW51ZVxyXG4gICAgICAgICAgICAgIGlmKHJlc3VsdC5zY29yZSA8IHRocmVzaG9sZCkgY29udGludWVcclxuICAgICAgICAgICAgICBpZihyZXN1bHRzTGVuIDwgbGltaXQpIHsgcS5hZGQocmVzdWx0KTsgKytyZXN1bHRzTGVuIH1cclxuICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICsrbGltaXRlZENvdW50XHJcbiAgICAgICAgICAgICAgICBpZihyZXN1bHQuc2NvcmUgPiBxLnBlZWsoKS5zY29yZSkgcS5yZXBsYWNlVG9wKHJlc3VsdClcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGlmKGlDdXJyZW50JTEwMDAvKml0ZW1zUGVyQ2hlY2sqLyA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYoRGF0ZS5ub3coKSAtIHN0YXJ0TXMgPj0gMTAvKmFzeW5jSW50ZXJ2YWwqLykge1xyXG4gICAgICAgICAgICAgICAgICBpc05vZGU/c2V0SW1tZWRpYXRlKHN0ZXApOnNldFRpbWVvdXQoc3RlcClcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYocmVzdWx0c0xlbiA9PT0gMCkgcmV0dXJuIHJlc29sdmUobm9SZXN1bHRzKVxyXG4gICAgICAgICAgdmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkocmVzdWx0c0xlbilcclxuICAgICAgICAgIGZvcih2YXIgaSA9IHJlc3VsdHNMZW4gLSAxOyBpID49IDA7IC0taSkgcmVzdWx0c1tpXSA9IHEucG9sbCgpXHJcbiAgICAgICAgICByZXN1bHRzLnRvdGFsID0gcmVzdWx0c0xlbiArIGxpbWl0ZWRDb3VudFxyXG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHRzKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaXNOb2RlP3NldEltbWVkaWF0ZShzdGVwKTpzdGVwKClcclxuICAgICAgfSlcclxuICAgICAgcC5jYW5jZWwgPSBmdW5jdGlvbigpIHsgY2FuY2VsZWQgPSB0cnVlIH1cclxuICAgICAgcmV0dXJuIHBcclxuICAgIH0sXHJcblxyXG4gICAgaGlnaGxpZ2h0OiBmdW5jdGlvbihyZXN1bHQsIGhPcGVuLCBoQ2xvc2UpIHtcclxuICAgICAgaWYocmVzdWx0ID09PSBudWxsKSByZXR1cm4gbnVsbFxyXG4gICAgICBpZihoT3BlbiA9PT0gdW5kZWZpbmVkKSBoT3BlbiA9ICc8Yj4nXHJcbiAgICAgIGlmKGhDbG9zZSA9PT0gdW5kZWZpbmVkKSBoQ2xvc2UgPSAnPC9iPidcclxuICAgICAgdmFyIGhpZ2hsaWdodGVkID0gJydcclxuICAgICAgdmFyIG1hdGNoZXNJbmRleCA9IDBcclxuICAgICAgdmFyIG9wZW5lZCA9IGZhbHNlXHJcbiAgICAgIHZhciB0YXJnZXQgPSByZXN1bHQudGFyZ2V0XHJcbiAgICAgIHZhciB0YXJnZXRMZW4gPSB0YXJnZXQubGVuZ3RoXHJcbiAgICAgIHZhciBtYXRjaGVzQmVzdCA9IHJlc3VsdC5pbmRleGVzXHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRMZW47ICsraSkgeyB2YXIgY2hhciA9IHRhcmdldFtpXVxyXG4gICAgICAgIGlmKG1hdGNoZXNCZXN0W21hdGNoZXNJbmRleF0gPT09IGkpIHtcclxuICAgICAgICAgICsrbWF0Y2hlc0luZGV4XHJcbiAgICAgICAgICBpZighb3BlbmVkKSB7IG9wZW5lZCA9IHRydWVcclxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgKz0gaE9wZW5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZihtYXRjaGVzSW5kZXggPT09IG1hdGNoZXNCZXN0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICBoaWdobGlnaHRlZCArPSBjaGFyICsgaENsb3NlICsgdGFyZ2V0LnN1YnN0cihpKzEpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmKG9wZW5lZCkgeyBvcGVuZWQgPSBmYWxzZVxyXG4gICAgICAgICAgICBoaWdobGlnaHRlZCArPSBoQ2xvc2VcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaGlnaGxpZ2h0ZWQgKz0gY2hhclxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gaGlnaGxpZ2h0ZWRcclxuICAgIH0sXHJcblxyXG4gICAgcHJlcGFyZTogZnVuY3Rpb24odGFyZ2V0KSB7XHJcbiAgICAgIGlmKCF0YXJnZXQpIHJldHVyblxyXG4gICAgICByZXR1cm4ge3RhcmdldDp0YXJnZXQsIF90YXJnZXRMb3dlckNvZGVzOmZ1enp5c29ydC5wcmVwYXJlTG93ZXJDb2Rlcyh0YXJnZXQpLCBfbmV4dEJlZ2lubmluZ0luZGV4ZXM6bnVsbCwgc2NvcmU6bnVsbCwgaW5kZXhlczpudWxsLCBvYmo6bnVsbH0gLy8gaGlkZGVuXHJcbiAgICB9LFxyXG4gICAgcHJlcGFyZVNsb3c6IGZ1bmN0aW9uKHRhcmdldCkge1xyXG4gICAgICBpZighdGFyZ2V0KSByZXR1cm5cclxuICAgICAgcmV0dXJuIHt0YXJnZXQ6dGFyZ2V0LCBfdGFyZ2V0TG93ZXJDb2RlczpmdXp6eXNvcnQucHJlcGFyZUxvd2VyQ29kZXModGFyZ2V0KSwgX25leHRCZWdpbm5pbmdJbmRleGVzOmZ1enp5c29ydC5wcmVwYXJlTmV4dEJlZ2lubmluZ0luZGV4ZXModGFyZ2V0KSwgc2NvcmU6bnVsbCwgaW5kZXhlczpudWxsLCBvYmo6bnVsbH0gLy8gaGlkZGVuXHJcbiAgICB9LFxyXG4gICAgcHJlcGFyZVNlYXJjaDogZnVuY3Rpb24oc2VhcmNoKSB7XHJcbiAgICAgIGlmKCFzZWFyY2gpIHJldHVyblxyXG4gICAgICByZXR1cm4gZnV6enlzb3J0LnByZXBhcmVMb3dlckNvZGVzKHNlYXJjaClcclxuICAgIH0sXHJcblxyXG5cclxuXHJcbiAgICAvLyBCZWxvdyB0aGlzIHBvaW50IGlzIG9ubHkgaW50ZXJuYWwgY29kZVxyXG4gICAgLy8gQmVsb3cgdGhpcyBwb2ludCBpcyBvbmx5IGludGVybmFsIGNvZGVcclxuICAgIC8vIEJlbG93IHRoaXMgcG9pbnQgaXMgb25seSBpbnRlcm5hbCBjb2RlXHJcbiAgICAvLyBCZWxvdyB0aGlzIHBvaW50IGlzIG9ubHkgaW50ZXJuYWwgY29kZVxyXG5cclxuXHJcblxyXG4gICAgZ2V0UHJlcGFyZWQ6IGZ1bmN0aW9uKHRhcmdldCkge1xyXG4gICAgICBpZih0YXJnZXQubGVuZ3RoID4gOTk5KSByZXR1cm4gZnV6enlzb3J0LnByZXBhcmUodGFyZ2V0KSAvLyBkb24ndCBjYWNoZSBodWdlIHRhcmdldHNcclxuICAgICAgdmFyIHRhcmdldFByZXBhcmVkID0gcHJlcGFyZWRDYWNoZS5nZXQodGFyZ2V0KVxyXG4gICAgICBpZih0YXJnZXRQcmVwYXJlZCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGFyZ2V0UHJlcGFyZWRcclxuICAgICAgdGFyZ2V0UHJlcGFyZWQgPSBmdXp6eXNvcnQucHJlcGFyZSh0YXJnZXQpXHJcbiAgICAgIHByZXBhcmVkQ2FjaGUuc2V0KHRhcmdldCwgdGFyZ2V0UHJlcGFyZWQpXHJcbiAgICAgIHJldHVybiB0YXJnZXRQcmVwYXJlZFxyXG4gICAgfSxcclxuICAgIGdldFByZXBhcmVkU2VhcmNoOiBmdW5jdGlvbihzZWFyY2gpIHtcclxuICAgICAgaWYoc2VhcmNoLmxlbmd0aCA+IDk5OSkgcmV0dXJuIGZ1enp5c29ydC5wcmVwYXJlU2VhcmNoKHNlYXJjaCkgLy8gZG9uJ3QgY2FjaGUgaHVnZSBzZWFyY2hlc1xyXG4gICAgICB2YXIgc2VhcmNoUHJlcGFyZWQgPSBwcmVwYXJlZFNlYXJjaENhY2hlLmdldChzZWFyY2gpXHJcbiAgICAgIGlmKHNlYXJjaFByZXBhcmVkICE9PSB1bmRlZmluZWQpIHJldHVybiBzZWFyY2hQcmVwYXJlZFxyXG4gICAgICBzZWFyY2hQcmVwYXJlZCA9IGZ1enp5c29ydC5wcmVwYXJlU2VhcmNoKHNlYXJjaClcclxuICAgICAgcHJlcGFyZWRTZWFyY2hDYWNoZS5zZXQoc2VhcmNoLCBzZWFyY2hQcmVwYXJlZClcclxuICAgICAgcmV0dXJuIHNlYXJjaFByZXBhcmVkXHJcbiAgICB9LFxyXG5cclxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oc2VhcmNoTG93ZXJDb2RlcywgcHJlcGFyZWQsIHNlYXJjaExvd2VyQ29kZSkge1xyXG4gICAgICB2YXIgdGFyZ2V0TG93ZXJDb2RlcyA9IHByZXBhcmVkLl90YXJnZXRMb3dlckNvZGVzXHJcbiAgICAgIHZhciBzZWFyY2hMZW4gPSBzZWFyY2hMb3dlckNvZGVzLmxlbmd0aFxyXG4gICAgICB2YXIgdGFyZ2V0TGVuID0gdGFyZ2V0TG93ZXJDb2Rlcy5sZW5ndGhcclxuICAgICAgdmFyIHNlYXJjaEkgPSAwIC8vIHdoZXJlIHdlIGF0XHJcbiAgICAgIHZhciB0YXJnZXRJID0gMCAvLyB3aGVyZSB5b3UgYXRcclxuICAgICAgdmFyIHR5cG9TaW1wbGVJID0gMFxyXG4gICAgICB2YXIgbWF0Y2hlc1NpbXBsZUxlbiA9IDBcclxuXHJcbiAgICAgIC8vIHZlcnkgYmFzaWMgZnV6enkgbWF0Y2g7IHRvIHJlbW92ZSBub24tbWF0Y2hpbmcgdGFyZ2V0cyBBU0FQIVxyXG4gICAgICAvLyB3YWxrIHRocm91Z2ggdGFyZ2V0LiBmaW5kIHNlcXVlbnRpYWwgbWF0Y2hlcy5cclxuICAgICAgLy8gaWYgYWxsIGNoYXJzIGFyZW4ndCBmb3VuZCB0aGVuIGV4aXRcclxuICAgICAgZm9yKDs7KSB7XHJcbiAgICAgICAgdmFyIGlzTWF0Y2ggPSBzZWFyY2hMb3dlckNvZGUgPT09IHRhcmdldExvd2VyQ29kZXNbdGFyZ2V0SV1cclxuICAgICAgICBpZihpc01hdGNoKSB7XHJcbiAgICAgICAgICBtYXRjaGVzU2ltcGxlW21hdGNoZXNTaW1wbGVMZW4rK10gPSB0YXJnZXRJXHJcbiAgICAgICAgICArK3NlYXJjaEk7IGlmKHNlYXJjaEkgPT09IHNlYXJjaExlbikgYnJlYWtcclxuICAgICAgICAgIHNlYXJjaExvd2VyQ29kZSA9IHNlYXJjaExvd2VyQ29kZXNbdHlwb1NpbXBsZUk9PT0wP3NlYXJjaEkgOiAodHlwb1NpbXBsZUk9PT1zZWFyY2hJP3NlYXJjaEkrMSA6ICh0eXBvU2ltcGxlST09PXNlYXJjaEktMT9zZWFyY2hJLTEgOiBzZWFyY2hJKSldXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICArK3RhcmdldEk7IGlmKHRhcmdldEkgPj0gdGFyZ2V0TGVuKSB7IC8vIEZhaWxlZCB0byBmaW5kIHNlYXJjaElcclxuICAgICAgICAgIC8vIENoZWNrIGZvciB0eXBvIG9yIGV4aXRcclxuICAgICAgICAgIC8vIHdlIGdvIGFzIGZhciBhcyBwb3NzaWJsZSBiZWZvcmUgdHJ5aW5nIHRvIHRyYW5zcG9zZVxyXG4gICAgICAgICAgLy8gdGhlbiB3ZSB0cmFuc3Bvc2UgYmFja3dhcmRzIHVudGlsIHdlIHJlYWNoIHRoZSBiZWdpbm5pbmdcclxuICAgICAgICAgIGZvcig7Oykge1xyXG4gICAgICAgICAgICBpZihzZWFyY2hJIDw9IDEpIHJldHVybiBudWxsIC8vIG5vdCBhbGxvd2VkIHRvIHRyYW5zcG9zZSBmaXJzdCBjaGFyXHJcbiAgICAgICAgICAgIGlmKHR5cG9TaW1wbGVJID09PSAwKSB7IC8vIHdlIGhhdmVuJ3QgdHJpZWQgdG8gdHJhbnNwb3NlIHlldFxyXG4gICAgICAgICAgICAgIC0tc2VhcmNoSVxyXG4gICAgICAgICAgICAgIHZhciBzZWFyY2hMb3dlckNvZGVOZXcgPSBzZWFyY2hMb3dlckNvZGVzW3NlYXJjaEldXHJcbiAgICAgICAgICAgICAgaWYoc2VhcmNoTG93ZXJDb2RlID09PSBzZWFyY2hMb3dlckNvZGVOZXcpIGNvbnRpbnVlIC8vIGRvZXNuJ3QgbWFrZSBzZW5zZSB0byB0cmFuc3Bvc2UgYSByZXBlYXQgY2hhclxyXG4gICAgICAgICAgICAgIHR5cG9TaW1wbGVJID0gc2VhcmNoSVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGlmKHR5cG9TaW1wbGVJID09PSAxKSByZXR1cm4gbnVsbCAvLyByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIGxpbmUgZm9yIHRyYW5zcG9zaW5nXHJcbiAgICAgICAgICAgICAgLS10eXBvU2ltcGxlSVxyXG4gICAgICAgICAgICAgIHNlYXJjaEkgPSB0eXBvU2ltcGxlSVxyXG4gICAgICAgICAgICAgIHNlYXJjaExvd2VyQ29kZSA9IHNlYXJjaExvd2VyQ29kZXNbc2VhcmNoSSArIDFdXHJcbiAgICAgICAgICAgICAgdmFyIHNlYXJjaExvd2VyQ29kZU5ldyA9IHNlYXJjaExvd2VyQ29kZXNbc2VhcmNoSV1cclxuICAgICAgICAgICAgICBpZihzZWFyY2hMb3dlckNvZGUgPT09IHNlYXJjaExvd2VyQ29kZU5ldykgY29udGludWUgLy8gZG9lc24ndCBtYWtlIHNlbnNlIHRvIHRyYW5zcG9zZSBhIHJlcGVhdCBjaGFyXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWF0Y2hlc1NpbXBsZUxlbiA9IHNlYXJjaElcclxuICAgICAgICAgICAgdGFyZ2V0SSA9IG1hdGNoZXNTaW1wbGVbbWF0Y2hlc1NpbXBsZUxlbiAtIDFdICsgMVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHNlYXJjaEkgPSAwXHJcbiAgICAgIHZhciB0eXBvU3RyaWN0SSA9IDBcclxuICAgICAgdmFyIHN1Y2Nlc3NTdHJpY3QgPSBmYWxzZVxyXG4gICAgICB2YXIgbWF0Y2hlc1N0cmljdExlbiA9IDBcclxuXHJcbiAgICAgIHZhciBuZXh0QmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVkLl9uZXh0QmVnaW5uaW5nSW5kZXhlc1xyXG4gICAgICBpZihuZXh0QmVnaW5uaW5nSW5kZXhlcyA9PT0gbnVsbCkgbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBwcmVwYXJlZC5fbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBmdXp6eXNvcnQucHJlcGFyZU5leHRCZWdpbm5pbmdJbmRleGVzKHByZXBhcmVkLnRhcmdldClcclxuICAgICAgdmFyIGZpcnN0UG9zc2libGVJID0gdGFyZ2V0SSA9IG1hdGNoZXNTaW1wbGVbMF09PT0wID8gMCA6IG5leHRCZWdpbm5pbmdJbmRleGVzW21hdGNoZXNTaW1wbGVbMF0tMV1cclxuXHJcbiAgICAgIC8vIE91ciB0YXJnZXQgc3RyaW5nIHN1Y2Nlc3NmdWxseSBtYXRjaGVkIGFsbCBjaGFyYWN0ZXJzIGluIHNlcXVlbmNlIVxyXG4gICAgICAvLyBMZXQncyB0cnkgYSBtb3JlIGFkdmFuY2VkIGFuZCBzdHJpY3QgdGVzdCB0byBpbXByb3ZlIHRoZSBzY29yZVxyXG4gICAgICAvLyBvbmx5IGNvdW50IGl0IGFzIGEgbWF0Y2ggaWYgaXQncyBjb25zZWN1dGl2ZSBvciBhIGJlZ2lubmluZyBjaGFyYWN0ZXIhXHJcbiAgICAgIGlmKHRhcmdldEkgIT09IHRhcmdldExlbikgZm9yKDs7KSB7XHJcbiAgICAgICAgaWYodGFyZ2V0SSA+PSB0YXJnZXRMZW4pIHtcclxuICAgICAgICAgIC8vIFdlIGZhaWxlZCB0byBmaW5kIGEgZ29vZCBzcG90IGZvciB0aGlzIHNlYXJjaCBjaGFyLCBnbyBiYWNrIHRvIHRoZSBwcmV2aW91cyBzZWFyY2ggY2hhciBhbmQgZm9yY2UgaXQgZm9yd2FyZFxyXG4gICAgICAgICAgaWYoc2VhcmNoSSA8PSAwKSB7IC8vIFdlIGZhaWxlZCB0byBwdXNoIGNoYXJzIGZvcndhcmQgZm9yIGEgYmV0dGVyIG1hdGNoXHJcbiAgICAgICAgICAgIC8vIHRyYW5zcG9zZSwgc3RhcnRpbmcgZnJvbSB0aGUgYmVnaW5uaW5nXHJcbiAgICAgICAgICAgICsrdHlwb1N0cmljdEk7IGlmKHR5cG9TdHJpY3RJID4gc2VhcmNoTGVuLTIpIGJyZWFrXHJcbiAgICAgICAgICAgIGlmKHNlYXJjaExvd2VyQ29kZXNbdHlwb1N0cmljdEldID09PSBzZWFyY2hMb3dlckNvZGVzW3R5cG9TdHJpY3RJKzFdKSBjb250aW51ZSAvLyBkb2Vzbid0IG1ha2Ugc2Vuc2UgdG8gdHJhbnNwb3NlIGEgcmVwZWF0IGNoYXJcclxuICAgICAgICAgICAgdGFyZ2V0SSA9IGZpcnN0UG9zc2libGVJXHJcbiAgICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLS1zZWFyY2hJXHJcbiAgICAgICAgICB2YXIgbGFzdE1hdGNoID0gbWF0Y2hlc1N0cmljdFstLW1hdGNoZXNTdHJpY3RMZW5dXHJcbiAgICAgICAgICB0YXJnZXRJID0gbmV4dEJlZ2lubmluZ0luZGV4ZXNbbGFzdE1hdGNoXVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdmFyIGlzTWF0Y2ggPSBzZWFyY2hMb3dlckNvZGVzW3R5cG9TdHJpY3RJPT09MD9zZWFyY2hJIDogKHR5cG9TdHJpY3RJPT09c2VhcmNoST9zZWFyY2hJKzEgOiAodHlwb1N0cmljdEk9PT1zZWFyY2hJLTE/c2VhcmNoSS0xIDogc2VhcmNoSSkpXSA9PT0gdGFyZ2V0TG93ZXJDb2Rlc1t0YXJnZXRJXVxyXG4gICAgICAgICAgaWYoaXNNYXRjaCkge1xyXG4gICAgICAgICAgICBtYXRjaGVzU3RyaWN0W21hdGNoZXNTdHJpY3RMZW4rK10gPSB0YXJnZXRJXHJcbiAgICAgICAgICAgICsrc2VhcmNoSTsgaWYoc2VhcmNoSSA9PT0gc2VhcmNoTGVuKSB7IHN1Y2Nlc3NTdHJpY3QgPSB0cnVlOyBicmVhayB9XHJcbiAgICAgICAgICAgICsrdGFyZ2V0SVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGFyZ2V0SSA9IG5leHRCZWdpbm5pbmdJbmRleGVzW3RhcmdldEldXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB7IC8vIHRhbGx5IHVwIHRoZSBzY29yZSAmIGtlZXAgdHJhY2sgb2YgbWF0Y2hlcyBmb3IgaGlnaGxpZ2h0aW5nIGxhdGVyXHJcbiAgICAgICAgaWYoc3VjY2Vzc1N0cmljdCkgeyB2YXIgbWF0Y2hlc0Jlc3QgPSBtYXRjaGVzU3RyaWN0OyB2YXIgbWF0Y2hlc0Jlc3RMZW4gPSBtYXRjaGVzU3RyaWN0TGVuIH1cclxuICAgICAgICBlbHNlIHsgdmFyIG1hdGNoZXNCZXN0ID0gbWF0Y2hlc1NpbXBsZTsgdmFyIG1hdGNoZXNCZXN0TGVuID0gbWF0Y2hlc1NpbXBsZUxlbiB9XHJcbiAgICAgICAgdmFyIHNjb3JlID0gMFxyXG4gICAgICAgIHZhciBsYXN0VGFyZ2V0SSA9IC0xXHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHNlYXJjaExlbjsgKytpKSB7IHZhciB0YXJnZXRJID0gbWF0Y2hlc0Jlc3RbaV1cclxuICAgICAgICAgIC8vIHNjb3JlIG9ubHkgZ29lcyBkb3duIGlmIHRoZXkncmUgbm90IGNvbnNlY3V0aXZlXHJcbiAgICAgICAgICBpZihsYXN0VGFyZ2V0SSAhPT0gdGFyZ2V0SSAtIDEpIHNjb3JlIC09IHRhcmdldElcclxuICAgICAgICAgIGxhc3RUYXJnZXRJID0gdGFyZ2V0SVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZighc3VjY2Vzc1N0cmljdCkge1xyXG4gICAgICAgICAgc2NvcmUgKj0gMTAwMFxyXG4gICAgICAgICAgaWYodHlwb1NpbXBsZUkgIT09IDApIHNjb3JlICs9IC0yMC8qdHlwb1BlbmFsdHkqL1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpZih0eXBvU3RyaWN0SSAhPT0gMCkgc2NvcmUgKz0gLTIwLyp0eXBvUGVuYWx0eSovXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNjb3JlIC09IHRhcmdldExlbiAtIHNlYXJjaExlblxyXG4gICAgICAgIHByZXBhcmVkLnNjb3JlID0gc2NvcmVcclxuICAgICAgICBwcmVwYXJlZC5pbmRleGVzID0gbmV3IEFycmF5KG1hdGNoZXNCZXN0TGVuKTsgZm9yKHZhciBpID0gbWF0Y2hlc0Jlc3RMZW4gLSAxOyBpID49IDA7IC0taSkgcHJlcGFyZWQuaW5kZXhlc1tpXSA9IG1hdGNoZXNCZXN0W2ldXHJcblxyXG4gICAgICAgIHJldHVybiBwcmVwYXJlZFxyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGFsZ29yaXRobU5vVHlwbzogZnVuY3Rpb24oc2VhcmNoTG93ZXJDb2RlcywgcHJlcGFyZWQsIHNlYXJjaExvd2VyQ29kZSkge1xyXG4gICAgICB2YXIgdGFyZ2V0TG93ZXJDb2RlcyA9IHByZXBhcmVkLl90YXJnZXRMb3dlckNvZGVzXHJcbiAgICAgIHZhciBzZWFyY2hMZW4gPSBzZWFyY2hMb3dlckNvZGVzLmxlbmd0aFxyXG4gICAgICB2YXIgdGFyZ2V0TGVuID0gdGFyZ2V0TG93ZXJDb2Rlcy5sZW5ndGhcclxuICAgICAgdmFyIHNlYXJjaEkgPSAwIC8vIHdoZXJlIHdlIGF0XHJcbiAgICAgIHZhciB0YXJnZXRJID0gMCAvLyB3aGVyZSB5b3UgYXRcclxuICAgICAgdmFyIG1hdGNoZXNTaW1wbGVMZW4gPSAwXHJcblxyXG4gICAgICAvLyB2ZXJ5IGJhc2ljIGZ1enp5IG1hdGNoOyB0byByZW1vdmUgbm9uLW1hdGNoaW5nIHRhcmdldHMgQVNBUCFcclxuICAgICAgLy8gd2FsayB0aHJvdWdoIHRhcmdldC4gZmluZCBzZXF1ZW50aWFsIG1hdGNoZXMuXHJcbiAgICAgIC8vIGlmIGFsbCBjaGFycyBhcmVuJ3QgZm91bmQgdGhlbiBleGl0XHJcbiAgICAgIGZvcig7Oykge1xyXG4gICAgICAgIHZhciBpc01hdGNoID0gc2VhcmNoTG93ZXJDb2RlID09PSB0YXJnZXRMb3dlckNvZGVzW3RhcmdldEldXHJcbiAgICAgICAgaWYoaXNNYXRjaCkge1xyXG4gICAgICAgICAgbWF0Y2hlc1NpbXBsZVttYXRjaGVzU2ltcGxlTGVuKytdID0gdGFyZ2V0SVxyXG4gICAgICAgICAgKytzZWFyY2hJOyBpZihzZWFyY2hJID09PSBzZWFyY2hMZW4pIGJyZWFrXHJcbiAgICAgICAgICBzZWFyY2hMb3dlckNvZGUgPSBzZWFyY2hMb3dlckNvZGVzW3NlYXJjaEldXHJcbiAgICAgICAgfVxyXG4gICAgICAgICsrdGFyZ2V0STsgaWYodGFyZ2V0SSA+PSB0YXJnZXRMZW4pIHJldHVybiBudWxsIC8vIEZhaWxlZCB0byBmaW5kIHNlYXJjaElcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHNlYXJjaEkgPSAwXHJcbiAgICAgIHZhciBzdWNjZXNzU3RyaWN0ID0gZmFsc2VcclxuICAgICAgdmFyIG1hdGNoZXNTdHJpY3RMZW4gPSAwXHJcblxyXG4gICAgICB2YXIgbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBwcmVwYXJlZC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNcclxuICAgICAgaWYobmV4dEJlZ2lubmluZ0luZGV4ZXMgPT09IG51bGwpIG5leHRCZWdpbm5pbmdJbmRleGVzID0gcHJlcGFyZWQuX25leHRCZWdpbm5pbmdJbmRleGVzID0gZnV6enlzb3J0LnByZXBhcmVOZXh0QmVnaW5uaW5nSW5kZXhlcyhwcmVwYXJlZC50YXJnZXQpXHJcbiAgICAgIHZhciBmaXJzdFBvc3NpYmxlSSA9IHRhcmdldEkgPSBtYXRjaGVzU2ltcGxlWzBdPT09MCA/IDAgOiBuZXh0QmVnaW5uaW5nSW5kZXhlc1ttYXRjaGVzU2ltcGxlWzBdLTFdXHJcblxyXG4gICAgICAvLyBPdXIgdGFyZ2V0IHN0cmluZyBzdWNjZXNzZnVsbHkgbWF0Y2hlZCBhbGwgY2hhcmFjdGVycyBpbiBzZXF1ZW5jZSFcclxuICAgICAgLy8gTGV0J3MgdHJ5IGEgbW9yZSBhZHZhbmNlZCBhbmQgc3RyaWN0IHRlc3QgdG8gaW1wcm92ZSB0aGUgc2NvcmVcclxuICAgICAgLy8gb25seSBjb3VudCBpdCBhcyBhIG1hdGNoIGlmIGl0J3MgY29uc2VjdXRpdmUgb3IgYSBiZWdpbm5pbmcgY2hhcmFjdGVyIVxyXG4gICAgICBpZih0YXJnZXRJICE9PSB0YXJnZXRMZW4pIGZvcig7Oykge1xyXG4gICAgICAgIGlmKHRhcmdldEkgPj0gdGFyZ2V0TGVuKSB7XHJcbiAgICAgICAgICAvLyBXZSBmYWlsZWQgdG8gZmluZCBhIGdvb2Qgc3BvdCBmb3IgdGhpcyBzZWFyY2ggY2hhciwgZ28gYmFjayB0byB0aGUgcHJldmlvdXMgc2VhcmNoIGNoYXIgYW5kIGZvcmNlIGl0IGZvcndhcmRcclxuICAgICAgICAgIGlmKHNlYXJjaEkgPD0gMCkgYnJlYWsgLy8gV2UgZmFpbGVkIHRvIHB1c2ggY2hhcnMgZm9yd2FyZCBmb3IgYSBiZXR0ZXIgbWF0Y2hcclxuXHJcbiAgICAgICAgICAtLXNlYXJjaElcclxuICAgICAgICAgIHZhciBsYXN0TWF0Y2ggPSBtYXRjaGVzU3RyaWN0Wy0tbWF0Y2hlc1N0cmljdExlbl1cclxuICAgICAgICAgIHRhcmdldEkgPSBuZXh0QmVnaW5uaW5nSW5kZXhlc1tsYXN0TWF0Y2hdXHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2YXIgaXNNYXRjaCA9IHNlYXJjaExvd2VyQ29kZXNbc2VhcmNoSV0gPT09IHRhcmdldExvd2VyQ29kZXNbdGFyZ2V0SV1cclxuICAgICAgICAgIGlmKGlzTWF0Y2gpIHtcclxuICAgICAgICAgICAgbWF0Y2hlc1N0cmljdFttYXRjaGVzU3RyaWN0TGVuKytdID0gdGFyZ2V0SVxyXG4gICAgICAgICAgICArK3NlYXJjaEk7IGlmKHNlYXJjaEkgPT09IHNlYXJjaExlbikgeyBzdWNjZXNzU3RyaWN0ID0gdHJ1ZTsgYnJlYWsgfVxyXG4gICAgICAgICAgICArK3RhcmdldElcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRhcmdldEkgPSBuZXh0QmVnaW5uaW5nSW5kZXhlc1t0YXJnZXRJXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgeyAvLyB0YWxseSB1cCB0aGUgc2NvcmUgJiBrZWVwIHRyYWNrIG9mIG1hdGNoZXMgZm9yIGhpZ2hsaWdodGluZyBsYXRlclxyXG4gICAgICAgIGlmKHN1Y2Nlc3NTdHJpY3QpIHsgdmFyIG1hdGNoZXNCZXN0ID0gbWF0Y2hlc1N0cmljdDsgdmFyIG1hdGNoZXNCZXN0TGVuID0gbWF0Y2hlc1N0cmljdExlbiB9XHJcbiAgICAgICAgZWxzZSB7IHZhciBtYXRjaGVzQmVzdCA9IG1hdGNoZXNTaW1wbGU7IHZhciBtYXRjaGVzQmVzdExlbiA9IG1hdGNoZXNTaW1wbGVMZW4gfVxyXG4gICAgICAgIHZhciBzY29yZSA9IDBcclxuICAgICAgICB2YXIgbGFzdFRhcmdldEkgPSAtMVxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzZWFyY2hMZW47ICsraSkgeyB2YXIgdGFyZ2V0SSA9IG1hdGNoZXNCZXN0W2ldXHJcbiAgICAgICAgICAvLyBzY29yZSBvbmx5IGdvZXMgZG93biBpZiB0aGV5J3JlIG5vdCBjb25zZWN1dGl2ZVxyXG4gICAgICAgICAgaWYobGFzdFRhcmdldEkgIT09IHRhcmdldEkgLSAxKSBzY29yZSAtPSB0YXJnZXRJXHJcbiAgICAgICAgICBsYXN0VGFyZ2V0SSA9IHRhcmdldElcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoIXN1Y2Nlc3NTdHJpY3QpIHNjb3JlICo9IDEwMDBcclxuICAgICAgICBzY29yZSAtPSB0YXJnZXRMZW4gLSBzZWFyY2hMZW5cclxuICAgICAgICBwcmVwYXJlZC5zY29yZSA9IHNjb3JlXHJcbiAgICAgICAgcHJlcGFyZWQuaW5kZXhlcyA9IG5ldyBBcnJheShtYXRjaGVzQmVzdExlbik7IGZvcih2YXIgaSA9IG1hdGNoZXNCZXN0TGVuIC0gMTsgaSA+PSAwOyAtLWkpIHByZXBhcmVkLmluZGV4ZXNbaV0gPSBtYXRjaGVzQmVzdFtpXVxyXG5cclxuICAgICAgICByZXR1cm4gcHJlcGFyZWRcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBwcmVwYXJlTG93ZXJDb2RlczogZnVuY3Rpb24oc3RyKSB7XHJcbiAgICAgIHZhciBzdHJMZW4gPSBzdHIubGVuZ3RoXHJcbiAgICAgIHZhciBsb3dlckNvZGVzID0gW10gLy8gbmV3IEFycmF5KHN0ckxlbikgICAgc3BhcnNlIGFycmF5IGlzIHRvbyBzbG93XHJcbiAgICAgIHZhciBsb3dlciA9IHN0ci50b0xvd2VyQ2FzZSgpXHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzdHJMZW47ICsraSkgbG93ZXJDb2Rlc1tpXSA9IGxvd2VyLmNoYXJDb2RlQXQoaSlcclxuICAgICAgcmV0dXJuIGxvd2VyQ29kZXNcclxuICAgIH0sXHJcbiAgICBwcmVwYXJlQmVnaW5uaW5nSW5kZXhlczogZnVuY3Rpb24odGFyZ2V0KSB7XHJcbiAgICAgIHZhciB0YXJnZXRMZW4gPSB0YXJnZXQubGVuZ3RoXHJcbiAgICAgIHZhciBiZWdpbm5pbmdJbmRleGVzID0gW107IHZhciBiZWdpbm5pbmdJbmRleGVzTGVuID0gMFxyXG4gICAgICB2YXIgd2FzVXBwZXIgPSBmYWxzZVxyXG4gICAgICB2YXIgd2FzQWxwaGFudW0gPSBmYWxzZVxyXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGFyZ2V0TGVuOyArK2kpIHtcclxuICAgICAgICB2YXIgdGFyZ2V0Q29kZSA9IHRhcmdldC5jaGFyQ29kZUF0KGkpXHJcbiAgICAgICAgdmFyIGlzVXBwZXIgPSB0YXJnZXRDb2RlPj02NSYmdGFyZ2V0Q29kZTw9OTBcclxuICAgICAgICB2YXIgaXNBbHBoYW51bSA9IGlzVXBwZXIgfHwgdGFyZ2V0Q29kZT49OTcmJnRhcmdldENvZGU8PTEyMiB8fCB0YXJnZXRDb2RlPj00OCYmdGFyZ2V0Q29kZTw9NTdcclxuICAgICAgICB2YXIgaXNCZWdpbm5pbmcgPSBpc1VwcGVyICYmICF3YXNVcHBlciB8fCAhd2FzQWxwaGFudW0gfHwgIWlzQWxwaGFudW1cclxuICAgICAgICB3YXNVcHBlciA9IGlzVXBwZXJcclxuICAgICAgICB3YXNBbHBoYW51bSA9IGlzQWxwaGFudW1cclxuICAgICAgICBpZihpc0JlZ2lubmluZykgYmVnaW5uaW5nSW5kZXhlc1tiZWdpbm5pbmdJbmRleGVzTGVuKytdID0gaVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBiZWdpbm5pbmdJbmRleGVzXHJcbiAgICB9LFxyXG4gICAgcHJlcGFyZU5leHRCZWdpbm5pbmdJbmRleGVzOiBmdW5jdGlvbih0YXJnZXQpIHtcclxuICAgICAgdmFyIHRhcmdldExlbiA9IHRhcmdldC5sZW5ndGhcclxuICAgICAgdmFyIGJlZ2lubmluZ0luZGV4ZXMgPSBmdXp6eXNvcnQucHJlcGFyZUJlZ2lubmluZ0luZGV4ZXModGFyZ2V0KVxyXG4gICAgICB2YXIgbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBbXSAvLyBuZXcgQXJyYXkodGFyZ2V0TGVuKSAgICAgc3BhcnNlIGFycmF5IGlzIHRvbyBzbG93XHJcbiAgICAgIHZhciBsYXN0SXNCZWdpbm5pbmcgPSBiZWdpbm5pbmdJbmRleGVzWzBdXHJcbiAgICAgIHZhciBsYXN0SXNCZWdpbm5pbmdJID0gMFxyXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGFyZ2V0TGVuOyArK2kpIHtcclxuICAgICAgICBpZihsYXN0SXNCZWdpbm5pbmcgPiBpKSB7XHJcbiAgICAgICAgICBuZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSA9IGxhc3RJc0JlZ2lubmluZ1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsYXN0SXNCZWdpbm5pbmcgPSBiZWdpbm5pbmdJbmRleGVzWysrbGFzdElzQmVnaW5uaW5nSV1cclxuICAgICAgICAgIG5leHRCZWdpbm5pbmdJbmRleGVzW2ldID0gbGFzdElzQmVnaW5uaW5nPT09dW5kZWZpbmVkID8gdGFyZ2V0TGVuIDogbGFzdElzQmVnaW5uaW5nXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBuZXh0QmVnaW5uaW5nSW5kZXhlc1xyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhbnVwOiBjbGVhbnVwLFxyXG4gICAgbmV3OiBmdXp6eXNvcnROZXcsXHJcbiAgfVxyXG4gIHJldHVybiBmdXp6eXNvcnRcclxufSAvLyBmdXp6eXNvcnROZXdcclxuXHJcbi8vIFRoaXMgc3R1ZmYgaXMgb3V0c2lkZSBmdXp6eXNvcnROZXcsIGJlY2F1c2UgaXQncyBzaGFyZWQgd2l0aCBpbnN0YW5jZXMgb2YgZnV6enlzb3J0Lm5ldygpXHJcbnZhciBpc05vZGUgPSB0eXBlb2YgcmVxdWlyZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCdcclxuLy8gdmFyIE1BWF9JTlQgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUlxyXG4vLyB2YXIgTUlOX0lOVCA9IE51bWJlci5NSU5fVkFMVUVcclxudmFyIHByZXBhcmVkQ2FjaGUgPSBuZXcgTWFwKClcclxudmFyIHByZXBhcmVkU2VhcmNoQ2FjaGUgPSBuZXcgTWFwKClcclxudmFyIG5vUmVzdWx0cyA9IFtdOyBub1Jlc3VsdHMudG90YWwgPSAwXHJcbnZhciBtYXRjaGVzU2ltcGxlID0gW107IHZhciBtYXRjaGVzU3RyaWN0ID0gW11cclxuZnVuY3Rpb24gY2xlYW51cCgpIHsgcHJlcGFyZWRDYWNoZS5jbGVhcigpOyBwcmVwYXJlZFNlYXJjaENhY2hlLmNsZWFyKCk7IG1hdGNoZXNTaW1wbGUgPSBbXTsgbWF0Y2hlc1N0cmljdCA9IFtdIH1cclxuZnVuY3Rpb24gZGVmYXVsdFNjb3JlRm4oYSkge1xyXG4gIHZhciBtYXggPSAtOTAwNzE5OTI1NDc0MDk5MVxyXG4gIGZvciAodmFyIGkgPSBhLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gYVtpXTsgaWYocmVzdWx0ID09PSBudWxsKSBjb250aW51ZVxyXG4gICAgdmFyIHNjb3JlID0gcmVzdWx0LnNjb3JlXHJcbiAgICBpZihzY29yZSA+IG1heCkgbWF4ID0gc2NvcmVcclxuICB9XHJcbiAgaWYobWF4ID09PSAtOTAwNzE5OTI1NDc0MDk5MSkgcmV0dXJuIG51bGxcclxuICByZXR1cm4gbWF4XHJcbn1cclxuXHJcbi8vIHByb3AgPSAna2V5JyAgICAgICAgICAgICAgMi41bXMgb3B0aW1pemVkIGZvciB0aGlzIGNhc2UsIHNlZW1zIHRvIGJlIGFib3V0IGFzIGZhc3QgYXMgZGlyZWN0IG9ialtwcm9wXVxyXG4vLyBwcm9wID0gJ2tleTEua2V5MicgICAgICAgIDEwbXNcclxuLy8gcHJvcCA9IFsna2V5MScsICdrZXkyJ10gICAyN21zXHJcbmZ1bmN0aW9uIGdldFZhbHVlKG9iaiwgcHJvcCkge1xyXG4gIHZhciB0bXAgPSBvYmpbcHJvcF07IGlmKHRtcCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdG1wXHJcbiAgdmFyIHNlZ3MgPSBwcm9wXHJcbiAgaWYoIUFycmF5LmlzQXJyYXkocHJvcCkpIHNlZ3MgPSBwcm9wLnNwbGl0KCcuJylcclxuICB2YXIgbGVuID0gc2Vncy5sZW5ndGhcclxuICB2YXIgaSA9IC0xXHJcbiAgd2hpbGUgKG9iaiAmJiAoKytpIDwgbGVuKSkgb2JqID0gb2JqW3NlZ3NbaV1dXHJcbiAgcmV0dXJuIG9ialxyXG59XHJcblxyXG5mdW5jdGlvbiBpc09iaih4KSB7IHJldHVybiB0eXBlb2YgeCA9PT0gJ29iamVjdCcgfSAvLyBmYXN0ZXIgYXMgYSBmdW5jdGlvblxyXG5cclxuLy8gSGFja2VkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2xlbWlyZS9GYXN0UHJpb3JpdHlRdWV1ZS5qc1xyXG52YXIgZmFzdHByaW9yaXR5cXVldWU9ZnVuY3Rpb24oKXt2YXIgcj1bXSxvPTAsZT17fTtmdW5jdGlvbiBuKCl7Zm9yKHZhciBlPTAsbj1yW2VdLGM9MTtjPG87KXt2YXIgZj1jKzE7ZT1jLGY8byYmcltmXS5zY29yZTxyW2NdLnNjb3JlJiYoZT1mKSxyW2UtMT4+MV09cltlXSxjPTErKGU8PDEpfWZvcih2YXIgYT1lLTE+PjE7ZT4wJiZuLnNjb3JlPHJbYV0uc2NvcmU7YT0oZT1hKS0xPj4xKXJbZV09clthXTtyW2VdPW59cmV0dXJuIGUuYWRkPWZ1bmN0aW9uKGUpe3ZhciBuPW87cltvKytdPWU7Zm9yKHZhciBjPW4tMT4+MTtuPjAmJmUuc2NvcmU8cltjXS5zY29yZTtjPShuPWMpLTE+PjEpcltuXT1yW2NdO3Jbbl09ZX0sZS5wb2xsPWZ1bmN0aW9uKCl7aWYoMCE9PW8pe3ZhciBlPXJbMF07cmV0dXJuIHJbMF09clstLW9dLG4oKSxlfX0sZS5wZWVrPWZ1bmN0aW9uKGUpe2lmKDAhPT1vKXJldHVybiByWzBdfSxlLnJlcGxhY2VUb3A9ZnVuY3Rpb24obyl7clswXT1vLG4oKX0sZX07XHJcbnZhciBxID0gZmFzdHByaW9yaXR5cXVldWUoKSAvLyByZXVzZSB0aGlzLCBleGNlcHQgZm9yIGFzeW5jLCBpdCBuZWVkcyB0byBtYWtlIGl0cyBvd25cclxuXHJcbnJldHVybiBmdXp6eXNvcnROZXcoKVxyXG59KSAvLyBVTURcclxuXHJcbi8vIFRPRE86IChwZXJmb3JtYW5jZSkgd2FzbSB2ZXJzaW9uIT9cclxuXHJcbi8vIFRPRE86IChwZXJmb3JtYW5jZSkgbGF5b3V0IG1lbW9yeSBpbiBhbiBvcHRpbWFsIHdheSB0byBnbyBmYXN0IGJ5IGF2b2lkaW5nIGNhY2hlIG1pc3Nlc1xyXG5cclxuLy8gVE9ETzogKHBlcmZvcm1hbmNlKSBwcmVwYXJlZENhY2hlIGlzIGEgbWVtb3J5IGxlYWtcclxuXHJcbi8vIFRPRE86IChsaWtlIHN1YmxpbWUpIGJhY2tzbGFzaCA9PT0gZm9yd2FyZHNsYXNoXHJcblxyXG4vLyBUT0RPOiAocGVyZm9ybWFuY2UpIGkgaGF2ZSBubyBpZGVhIGhvdyB3ZWxsIG9wdGl6bWllZCB0aGUgYWxsb3dpbmcgdHlwb3MgYWxnb3JpdGhtIGlzXHJcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJ2YXIgbmV4dFRpY2sgPSByZXF1aXJlKCdwcm9jZXNzL2Jyb3dzZXIuanMnKS5uZXh0VGljaztcbnZhciBhcHBseSA9IEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseTtcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBpbW1lZGlhdGVJZHMgPSB7fTtcbnZhciBuZXh0SW1tZWRpYXRlSWQgPSAwO1xuXG4vLyBET00gQVBJcywgZm9yIGNvbXBsZXRlbmVzc1xuXG5leHBvcnRzLnNldFRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0VGltZW91dCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhclRpbWVvdXQpO1xufTtcbmV4cG9ydHMuc2V0SW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0SW50ZXJ2YWwsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJJbnRlcnZhbCk7XG59O1xuZXhwb3J0cy5jbGVhclRpbWVvdXQgPVxuZXhwb3J0cy5jbGVhckludGVydmFsID0gZnVuY3Rpb24odGltZW91dCkgeyB0aW1lb3V0LmNsb3NlKCk7IH07XG5cbmZ1bmN0aW9uIFRpbWVvdXQoaWQsIGNsZWFyRm4pIHtcbiAgdGhpcy5faWQgPSBpZDtcbiAgdGhpcy5fY2xlYXJGbiA9IGNsZWFyRm47XG59XG5UaW1lb3V0LnByb3RvdHlwZS51bnJlZiA9IFRpbWVvdXQucHJvdG90eXBlLnJlZiA9IGZ1bmN0aW9uKCkge307XG5UaW1lb3V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9jbGVhckZuLmNhbGwod2luZG93LCB0aGlzLl9pZCk7XG59O1xuXG4vLyBEb2VzIG5vdCBzdGFydCB0aGUgdGltZSwganVzdCBzZXRzIHVwIHRoZSBtZW1iZXJzIG5lZWRlZC5cbmV4cG9ydHMuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSwgbXNlY3MpIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IG1zZWNzO1xufTtcblxuZXhwb3J0cy51bmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IC0xO1xufTtcblxuZXhwb3J0cy5fdW5yZWZBY3RpdmUgPSBleHBvcnRzLmFjdGl2ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuXG4gIHZhciBtc2VjcyA9IGl0ZW0uX2lkbGVUaW1lb3V0O1xuICBpZiAobXNlY3MgPj0gMCkge1xuICAgIGl0ZW0uX2lkbGVUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uIG9uVGltZW91dCgpIHtcbiAgICAgIGlmIChpdGVtLl9vblRpbWVvdXQpXG4gICAgICAgIGl0ZW0uX29uVGltZW91dCgpO1xuICAgIH0sIG1zZWNzKTtcbiAgfVxufTtcblxuLy8gVGhhdCdzIG5vdCBob3cgbm9kZS5qcyBpbXBsZW1lbnRzIGl0IGJ1dCB0aGUgZXhwb3NlZCBhcGkgaXMgdGhlIHNhbWUuXG5leHBvcnRzLnNldEltbWVkaWF0ZSA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHNldEltbWVkaWF0ZSA6IGZ1bmN0aW9uKGZuKSB7XG4gIHZhciBpZCA9IG5leHRJbW1lZGlhdGVJZCsrO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cy5sZW5ndGggPCAyID8gZmFsc2UgOiBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgaW1tZWRpYXRlSWRzW2lkXSA9IHRydWU7XG5cbiAgbmV4dFRpY2soZnVuY3Rpb24gb25OZXh0VGljaygpIHtcbiAgICBpZiAoaW1tZWRpYXRlSWRzW2lkXSkge1xuICAgICAgLy8gZm4uY2FsbCgpIGlzIGZhc3RlciBzbyB3ZSBvcHRpbWl6ZSBmb3IgdGhlIGNvbW1vbiB1c2UtY2FzZVxuICAgICAgLy8gQHNlZSBodHRwOi8vanNwZXJmLmNvbS9jYWxsLWFwcGx5LXNlZ3VcbiAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm4uY2FsbChudWxsKTtcbiAgICAgIH1cbiAgICAgIC8vIFByZXZlbnQgaWRzIGZyb20gbGVha2luZ1xuICAgICAgZXhwb3J0cy5jbGVhckltbWVkaWF0ZShpZCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gaWQ7XG59O1xuXG5leHBvcnRzLmNsZWFySW1tZWRpYXRlID0gdHlwZW9mIGNsZWFySW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBjbGVhckltbWVkaWF0ZSA6IGZ1bmN0aW9uKGlkKSB7XG4gIGRlbGV0ZSBpbW1lZGlhdGVJZHNbaWRdO1xufTsiLCIvKiBnbG9iYWwgR2hvc3RDb250ZW50QVBJIGxvY2F0aW9uICovXG5cbi8qKlxuICogVGhhbmtzID0+IGh0dHBzOi8vZ2l0aHViLmNvbS9IYXVudGVkVGhlbWVzL2dob3N0LXNlYXJjaFxuICovXG5cbi8vIGltcG9ydCBmdXp6eXNvcnQgZnJvbSAnZnV6enlzb3J0J1xuY29uc3QgZnV6enlzb3J0ID0gcmVxdWlyZSgnZnV6enlzb3J0JylcblxuY2xhc3MgR2hvc3RTZWFyY2gge1xuICBjb25zdHJ1Y3RvciAoYXJncykge1xuICAgIHRoaXMuY2hlY2sgPSBmYWxzZVxuXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICB1cmw6ICcnLFxuICAgICAga2V5OiAnJyxcbiAgICAgIHZlcnNpb246ICd2MicsXG4gICAgICBpbnB1dDogJyNnaG9zdC1zZWFyY2gtZmllbGQnLFxuICAgICAgcmVzdWx0czogJyNnaG9zdC1zZWFyY2gtcmVzdWx0cycsXG4gICAgICBidXR0b246ICcnLFxuICAgICAgZGVmYXVsdFZhbHVlOiAnJyxcbiAgICAgIHRlbXBsYXRlOiBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgIGxldCBzaXRldXJsID0gW2xvY2F0aW9uLnByb3RvY29sLCAnLy8nLCBsb2NhdGlvbi5ob3N0XS5qb2luKCcnKVxuICAgICAgICAvLyByZXR1cm4gJzxhIGhyZWY9XCInICsgc2l0ZXVybCArICcvJyArIHJlc3VsdC5zbHVnICsgJy9cIj4nICsgcmVzdWx0LnRpdGxlICsgJzwvYT4nXG4gICAgICAgIHJldHVybiBgPGEgaHJlZj1cIiR7c2l0ZXVybH0vJHtyZXN1bHQuc2x1Z30vXCI+JHtyZXN1bHQudGl0bGV9PC9hPmBcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyOiAnZm9jdXMnLFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICBrZXlzOiBbXG4gICAgICAgICAgJ3RpdGxlJ1xuICAgICAgICBdLFxuICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgIHRocmVzaG9sZDogLTM1MDAsXG4gICAgICAgIGFsbG93VHlwbzogZmFsc2VcbiAgICAgIH0sXG4gICAgICBhcGk6IHtcbiAgICAgICAgcmVzb3VyY2U6ICdwb3N0cycsXG4gICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICBsaW1pdDogJ2FsbCcsXG4gICAgICAgICAgZmllbGRzOiBbJ3RpdGxlJywgJ3NsdWcnXSxcbiAgICAgICAgICBmaWx0ZXI6ICcnLFxuICAgICAgICAgIGluY2x1ZGU6ICcnLFxuICAgICAgICAgIG9yZGVyOiAnJyxcbiAgICAgICAgICBmb3JtYXRzOiAnJyxcbiAgICAgICAgICBwYWdlOiAnJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb246IHtcbiAgICAgICAgYmVmb3JlRGlzcGxheTogZnVuY3Rpb24gKCkgeyB9LFxuICAgICAgICBhZnRlckRpc3BsYXk6IGZ1bmN0aW9uIChyZXN1bHRzKSB7IH0sIC8vZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICBiZWZvcmVGZXRjaDogZnVuY3Rpb24gKCkgeyB9LFxuICAgICAgICBhZnRlckZldGNoOiBmdW5jdGlvbiAocmVzdWx0cykgeyB9LCAvL2VzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBtZXJnZWQgPSB0aGlzLm1lcmdlRGVlcChkZWZhdWx0cywgYXJncylcbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIG1lcmdlZClcbiAgICB0aGlzLmluaXQoKVxuICB9XG5cbiAgbWVyZ2VEZWVwICh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICgodGFyZ2V0ICYmIHR5cGVvZiB0YXJnZXQgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHRhcmdldCkgJiYgdGFyZ2V0ICE9PSBudWxsKSAmJiAoc291cmNlICYmIHR5cGVvZiBzb3VyY2UgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHNvdXJjZSkgJiYgc291cmNlICE9PSBudWxsKSkge1xuICAgICAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGlmIChzb3VyY2Vba2V5XSAmJiB0eXBlb2Ygc291cmNlW2tleV0gPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHNvdXJjZVtrZXldKSAmJiBzb3VyY2Vba2V5XSAhPT0gbnVsbCkge1xuICAgICAgICAgIGlmICghdGFyZ2V0W2tleV0pIE9iamVjdC5hc3NpZ24odGFyZ2V0LCB7IFtrZXldOiB7fSB9KVxuICAgICAgICAgIHRoaXMubWVyZ2VEZWVwKHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHRhcmdldCwgeyBba2V5XTogc291cmNlW2tleV0gfSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldFxuICB9XG5cbiAgZmV0Y2ggKCkge1xuICAgIHRoaXMub24uYmVmb3JlRmV0Y2goKVxuXG4gICAgbGV0IGdob3N0QVBJID0gbmV3IEdob3N0Q29udGVudEFQSSh7XG4gICAgICB1cmw6IHRoaXMudXJsLFxuICAgICAga2V5OiB0aGlzLmtleSxcbiAgICAgIHZlcnNpb246IHRoaXMudmVyc2lvblxuICAgIH0pXG5cbiAgICBsZXQgYnJvd3NlID0ge31cbiAgICBsZXQgcGFyYW1ldGVycyA9IHRoaXMuYXBpLnBhcmFtZXRlcnNcblxuICAgIGZvciAodmFyIGtleSBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICBpZiAocGFyYW1ldGVyc1trZXldICE9PSAnJykge1xuICAgICAgICBicm93c2Vba2V5XSA9IHBhcmFtZXRlcnNba2V5XVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGJyb3dzZS5saW1pdCA9ICdhbGwnXG5cbiAgICBnaG9zdEFQSVt0aGlzLmFwaS5yZXNvdXJjZV1cbiAgICAgIC5icm93c2UoYnJvd3NlKVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgdGhpcy5zZWFyY2goZGF0YSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycilcbiAgICAgIH0pXG4gIH1cblxuICBjcmVhdGVFbGVtZW50RnJvbUhUTUwgKGh0bWxTdHJpbmcpIHtcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBkaXYuaW5uZXJIVE1MID0gaHRtbFN0cmluZy50cmltKClcbiAgICByZXR1cm4gZGl2LmZpcnN0Q2hpbGRcbiAgfVxuXG4gIGRpc3BsYXlSZXN1bHRzIChkYXRhKSB7XG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5yZXN1bHRzKVswXS5maXJzdENoaWxkICE9PSBudWxsICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5yZXN1bHRzKVswXS5maXJzdENoaWxkICE9PSAnJykge1xuICAgICAgd2hpbGUgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5yZXN1bHRzKVswXS5maXJzdENoaWxkKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5yZXN1bHRzKVswXS5yZW1vdmVDaGlsZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMucmVzdWx0cylbMF0uZmlyc3RDaGlsZClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgaW5wdXRWYWx1ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5pbnB1dClbMF0udmFsdWVcbiAgICBpZiAodGhpcy5kZWZhdWx0VmFsdWUgIT09ICcnKSB7XG4gICAgICBpbnB1dFZhbHVlID0gdGhpcy5kZWZhdWx0VmFsdWVcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0cyA9IGZ1enp5c29ydC5nbyhpbnB1dFZhbHVlLCBkYXRhLCB7XG4gICAgICBrZXlzOiB0aGlzLm9wdGlvbnMua2V5cyxcbiAgICAgIGxpbWl0OiB0aGlzLm9wdGlvbnMubGltaXQsXG4gICAgICBhbGxvd1R5cG86IHRoaXMub3B0aW9ucy5hbGxvd1R5cG8sXG4gICAgICB0aHJlc2hvbGQ6IHRoaXMub3B0aW9ucy50aHJlc2hvbGRcbiAgICB9KVxuICAgIGZvciAobGV0IGtleSBpbiByZXN1bHRzKSB7XG4gICAgICBpZiAoa2V5IDwgcmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnJlc3VsdHMpWzBdLmFwcGVuZENoaWxkKHRoaXMuY3JlYXRlRWxlbWVudEZyb21IVE1MKHRoaXMudGVtcGxhdGUocmVzdWx0c1trZXldLm9iaikpKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMub24uYWZ0ZXJEaXNwbGF5KHJlc3VsdHMpXG4gICAgdGhpcy5kZWZhdWx0VmFsdWUgPSAnJ1xuICB9XG5cbiAgc2VhcmNoIChkYXRhKSB7XG4gICAgdGhpcy5vbi5hZnRlckZldGNoKGRhdGEpXG4gICAgdGhpcy5jaGVjayA9IHRydWVcblxuICAgIGlmICh0aGlzLmRlZmF1bHRWYWx1ZSAhPT0gJycpIHtcbiAgICAgIHRoaXMub24uYmVmb3JlRGlzcGxheSgpXG4gICAgICB0aGlzLmRpc3BsYXlSZXN1bHRzKGRhdGEpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYnV0dG9uICE9PSAnJykge1xuICAgICAgbGV0IGJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5idXR0b24pWzBdXG4gICAgICBpZiAoYnV0dG9uLnRhZ05hbWUgPT09ICdJTlBVVCcgJiYgYnV0dG9uLnR5cGUgPT09ICdzdWJtaXQnKSB7XG4gICAgICAgIGJ1dHRvbi5jbG9zZXN0KCdmb3JtJykuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZSA9PiB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHRoaXMub24uYmVmb3JlRGlzcGxheSgpXG4gICAgICAgIHRoaXMuZGlzcGxheVJlc3VsdHMoZGF0YSlcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5pbnB1dClbMF0uYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMub24uYmVmb3JlRGlzcGxheSgpXG4gICAgICAgIHRoaXMuZGlzcGxheVJlc3VsdHMoZGF0YSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgY2hlY2tBcmdzICgpIHtcbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5pbnB1dCkubGVuZ3RoKSB7XG4gICAgICBjb25zb2xlLmxvZygnSW5wdXQgbm90IGZvdW5kLicpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMucmVzdWx0cykubGVuZ3RoKSB7XG4gICAgICBjb25zb2xlLmxvZygnUmVzdWx0cyBub3QgZm91bmQuJylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAodGhpcy5idXR0b24gIT09ICcnKSB7XG4gICAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5idXR0b24pLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZygnQnV0dG9uIG5vdCBmb3VuZC4nKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMudXJsID09PSAnJykge1xuICAgICAgY29uc29sZS5sb2coJ0NvbnRlbnQgQVBJIENsaWVudCBMaWJyYXJ5IHVybCBtaXNzaW5nLiBQbGVhc2Ugc2V0IHRoZSB1cmwuIE11c3Qgbm90IGVuZCBpbiBhIHRyYWlsaW5nIHNsYXNoLicpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgaWYgKHRoaXMua2V5ID09PSAnJykge1xuICAgICAgY29uc29sZS5sb2coJ0NvbnRlbnQgQVBJIENsaWVudCBMaWJyYXJ5IGtleSBtaXNzaW5nLiBQbGVhc2Ugc2V0IHRoZSBrZXkuIEhleCBzdHJpbmcgY29waWVkIGZyb20gdGhlIFwiSW50ZWdyYXRpb25zXCIgc2NyZWVuIGluIEdob3N0IEFkbWluLicpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHZhbGlkYXRlICgpIHtcbiAgICBpZiAoIXRoaXMuY2hlY2tBcmdzKCkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBpbml0ICgpIHtcbiAgICBpZiAoIXRoaXMudmFsaWRhdGUoKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZGVmYXVsdFZhbHVlICE9PSAnJykge1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLmlucHV0KVswXS52YWx1ZSA9IHRoaXMuZGVmYXVsdFZhbHVlXG4gICAgICB3aW5kb3cub25sb2FkID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuY2hlY2spIHtcbiAgICAgICAgICB0aGlzLmZldGNoKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnRyaWdnZXIgPT09ICdmb2N1cycpIHtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5pbnB1dClbMF0uYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5jaGVjaykge1xuICAgICAgICAgIHRoaXMuZmV0Y2goKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0gZWxzZSBpZiAodGhpcy50cmlnZ2VyID09PSAnbG9hZCcpIHtcbiAgICAgIHdpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5jaGVjaykge1xuICAgICAgICAgIHRoaXMuZmV0Y2goKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qIEV4cG9ydCBDbGFzcyAqL1xubW9kdWxlLmV4cG9ydHMgPSBHaG9zdFNlYXJjaFxuIiwiLyogZ2xvYmFsIHNlYXJjaEtleSAqL1xuaW1wb3J0IEdob3N0U2VhcmNoIGZyb20gJy4vYXBwL2FwcC5zZWFyY2gnXG4vLyBpbXBvcnQgeyBsb2FkU2NyaXB0IH0gZnJvbSAnLi9hcHAvYXBwLmxvYWQtc3R5bGUtc2NyaXB0J1xuXG4oKHdpbmRvdywgZG9jdW1lbnQpID0+IHtcbiAgLy8gQXBpS2V5IFNlYXJjaFxuICAvLyBpZiAodHlwZW9mIHNlYXJjaEtleSA9PT0gJ3VuZGVmaW5lZCcgfHwgc2VhcmNoS2V5ID09PSAnJykgcmV0dXJuXG5cbiAgY29uc3QgcXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yLmJpbmQoZG9jdW1lbnQpXG4gIGNvbnN0IHFzYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwuYmluZChkb2N1bWVudClcblxuICBjb25zdCBzZWFyY2hJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2gtZmllbGQnKVxuICBjb25zdCBzZWFyY2hSZXN1bHRzID0gcXMoJyNzZWFyY2hSZXN1bHRzJylcbiAgY29uc3Qgc2VhcmNoTWVzc2FnZSA9IHFzKCcuanMtc2VhcmNoLW1lc3NhZ2UnKVxuXG4gIGxldCBzZWFyY2hSZXN1bHRzSGVpZ2h0ID0ge1xuICAgIG91dGVyOiAwLFxuICAgIHNjcm9sbDogMFxuICB9XG5cbiAgLy8gTG9hZCBHaG9zdCBBcGlcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gbG9hZFNjcmlwdCgnaHR0cHM6Ly91bnBrZy5jb20vQHRyeWdob3N0L2NvbnRlbnQtYXBpQDEuMi41L3VtZC9jb250ZW50LWFwaS5taW4uanMnKVxuXG4gIC8vIFZhcmlhYmxlIGZvciBzZWFyY2hcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3QgbXlTZWFyY2hTZXR0aW5ncyA9IHtcbiAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4sXG4gICAgLy8gdXJsOiAnaHR0cDovL2xvY2FsaG9zdDoyMzY4JyxcbiAgICBrZXk6IHNlYXJjaEtleSxcbiAgICBpbnB1dDogJyNzZWFyY2gtZmllbGQnLFxuICAgIHJlc3VsdHM6ICcjc2VhcmNoUmVzdWx0cycsXG4gICAgb246IHtcbiAgICAgIGFmdGVyRGlzcGxheTogKCkgPT4ge1xuICAgICAgICBzZWFyY2hSZXN1bHRBY3RpdmUoKVxuICAgICAgICBzZWFyY2hSZXN1bHRzSGVpZ2h0ID0ge1xuICAgICAgICAgIG91dGVyOiBzZWFyY2hSZXN1bHRzLm9mZnNldEhlaWdodCxcbiAgICAgICAgICBzY3JvbGw6IHNlYXJjaFJlc3VsdHMuc2Nyb2xsSGVpZ2h0XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyB3aGVuIHRoZSBFbnRlciBrZXkgaXMgcHJlc3NlZFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBmdW5jdGlvbiBlbnRlcktleSAoKSB7XG4gICAgY29uc3QgbGluayA9IHNlYXJjaFJlc3VsdHMucXVlcnlTZWxlY3RvcignYS5zZWFyY2gtcmVzdWx0LS1hY3RpdmUnKVxuICAgIGxpbmsgJiYgbGluay5jbGljaygpXG4gIH1cblxuICAvLyBBdHRlbmRpbmcgdGhlIGFjdGl2ZSBjbGFzcyB0byB0aGUgc2VhcmNoIGxpbmtcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZnVuY3Rpb24gc2VhcmNoUmVzdWx0QWN0aXZlICh0LCBlKSB7XG4gICAgdCA9IHQgfHwgMFxuICAgIGUgPSBlIHx8ICd1cCdcblxuICAgIC8vIERvbnQgdXNlIGtleSBmdW5jdGlvbnNcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCA3NjgpIHJldHVyblxuXG4gICAgY29uc3Qgc2VhcmNoTEluayA9IHNlYXJjaFJlc3VsdHMucXVlcnlTZWxlY3RvckFsbCgnYScpXG5cbiAgICBpZiAoIXNlYXJjaExJbmsubGVuZ3RoKSB7XG4gICAgICBzZWFyY2hJbnB1dC52YWx1ZS5sZW5ndGggJiYgc2VhcmNoTWVzc2FnZS5jbGFzc0xpc3QucmVtb3ZlKCd1LWhpZGUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgc2VhcmNoTWVzc2FnZS5jbGFzc0xpc3QuYWRkKCd1LWhpZGUnKVxuXG4gICAgY29uc3Qgc2VhcmNoTGlua0FjdGl2ZSA9IHNlYXJjaFJlc3VsdHMucXVlcnlTZWxlY3RvcignYS5zZWFyY2gtcmVzdWx0LS1hY3RpdmUnKVxuICAgIHNlYXJjaExpbmtBY3RpdmUgJiYgc2VhcmNoTGlua0FjdGl2ZS5jbGFzc0xpc3QucmVtb3ZlKCdzZWFyY2gtcmVzdWx0LS1hY3RpdmUnKVxuXG4gICAgc2VhcmNoTElua1t0XS5jbGFzc0xpc3QuYWRkKCdzZWFyY2gtcmVzdWx0LS1hY3RpdmUnKVxuXG4gICAgbGV0IG4gPSBzZWFyY2hMSW5rW3RdLm9mZnNldFRvcFxuICAgIGxldCBvID0gMFxuXG4gICAgZSA9PT0gJ2Rvd24nICYmIG4gPiBzZWFyY2hSZXN1bHRzSGVpZ2h0Lm91dGVyIC8gMiA/IG8gPSBuIC0gc2VhcmNoUmVzdWx0c0hlaWdodC5vdXRlciAvIDIgOiBlID09PSAndXAnICYmIChvID0gbiA8IHNlYXJjaFJlc3VsdHNIZWlnaHQuc2Nyb2xsIC0gc2VhcmNoUmVzdWx0c0hlaWdodC5vdXRlciAvIDIgPyBuIC0gc2VhcmNoUmVzdWx0c0hlaWdodC5vdXRlciAvIDIgOiBzZWFyY2hSZXN1bHRzSGVpZ2h0LnNjcm9sbClcblxuICAgIHNlYXJjaFJlc3VsdHMuc2Nyb2xsVG8oMCwgbylcbiAgfVxuXG4gIC8vIENsZWFyIElucHV0IGZvciB3cml0ZSBuZXcgbGV0dGVyc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBmdW5jdGlvbiBjbGVhcklucHV0ICgpIHtcbiAgICBzZWFyY2hJbnB1dC5mb2N1cygpXG4gICAgc2VhcmNoSW5wdXQuc2V0U2VsZWN0aW9uUmFuZ2UoMCwgc2VhcmNoSW5wdXQudmFsdWUubGVuZ3RoKVxuICB9XG5cbiAgLy8gU2VhcmNoIGNsb3NlIHdpdGggS2V5XG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGZ1bmN0aW9uIHNlYXJjaENsb3NlICgpIHtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1zZWFyY2gnKVxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgbXlTZWFyY2hLZXkpXG4gIH1cblxuICAvLyBSZWFjdGVkIHRvIHRoZSB1cCBvciBkb3duIGtleXNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZnVuY3Rpb24gYXJyb3dLZXlVcERvd24gKGtleU51bWJlcikge1xuICAgIGxldCBlXG4gICAgbGV0IGluZGV4VGhlTGluayA9IDBcblxuICAgIGNvbnN0IHJlc3VsdEFjdGl2ZSA9IHNlYXJjaFJlc3VsdHMucXVlcnlTZWxlY3RvcignLnNlYXJjaC1yZXN1bHQtLWFjdGl2ZScpXG4gICAgaWYgKHJlc3VsdEFjdGl2ZSkge1xuICAgICAgaW5kZXhUaGVMaW5rID0gW10uc2xpY2UuY2FsbChyZXN1bHRBY3RpdmUucGFyZW50Tm9kZS5jaGlsZHJlbikuaW5kZXhPZihyZXN1bHRBY3RpdmUpXG4gICAgfVxuXG4gICAgc2VhcmNoSW5wdXQuYmx1cigpXG5cbiAgICBpZiAoa2V5TnVtYmVyID09PSAzOCkge1xuICAgICAgZSA9ICd1cCdcbiAgICAgIGlmIChpbmRleFRoZUxpbmsgPD0gMCkge1xuICAgICAgICBzZWFyY2hJbnB1dC5mb2N1cygpXG4gICAgICAgIGluZGV4VGhlTGluayA9IDBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGV4VGhlTGluayAtPSAxXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGUgPSAnZG93bidcbiAgICAgIGlmIChpbmRleFRoZUxpbmsgPj0gc2VhcmNoUmVzdWx0cy5xdWVyeVNlbGVjdG9yQWxsKCdhJykubGVuZ3RoIC0gMSkge1xuICAgICAgICBpbmRleFRoZUxpbmsgPSBzZWFyY2hSZXN1bHRzLnF1ZXJ5U2VsZWN0b3JBbGwoJ2EnKS5sZW5ndGggLSAxXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleFRoZUxpbmsgPSBpbmRleFRoZUxpbmsgKyAxXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VhcmNoUmVzdWx0QWN0aXZlKGluZGV4VGhlTGluaywgZSlcbiAgfVxuXG4gIC8vIEFkZGluZyBmdW5jdGlvbnMgdG8gdGhlIGtleXNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZnVuY3Rpb24gbXlTZWFyY2hLZXkgKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgIGxldCBrZXlOdW1iZXIgPSBlLmtleUNvZGVcblxuICAgIC8qKlxuICAgICAgKiAzOCA9PiBUb3AgLyBBcnJpYmFcbiAgICAgICogNDAgPT4gZG93biAvIGFiYWpvXG4gICAgICAqIDI3ID0+IGVzY2FwZVxuICAgICAgKiAxMyA9PiBlbnRlclxuICAgICAgKiAxOTEgPT4gL1xuICAgICAgKiovXG5cbiAgICBpZiAoa2V5TnVtYmVyID09PSAyNykge1xuICAgICAgc2VhcmNoQ2xvc2UoKVxuICAgIH0gZWxzZSBpZiAoa2V5TnVtYmVyID09PSAxMykge1xuICAgICAgc2VhcmNoSW5wdXQuYmx1cigpXG4gICAgICBlbnRlcktleSgpXG4gICAgfSBlbHNlIGlmIChrZXlOdW1iZXIgPT09IDM4IHx8IGtleU51bWJlciA9PT0gNDApIHtcbiAgICAgIGFycm93S2V5VXBEb3duKGtleU51bWJlcilcbiAgICB9IGVsc2UgaWYgKGtleU51bWJlciA9PT0gMTkxKSB7XG4gICAgICBjbGVhcklucHV0KClcbiAgICB9XG4gIH1cblxuICAvLyBPcGVuIFNlYXJjaFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBxc2EoJy5qcy1vcGVuLXNlYXJjaCcpLmZvckVhY2goaXRlbSA9PiBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdoYXMtc2VhcmNoJylcbiAgICBzZWFyY2hJbnB1dC5mb2N1cygpXG4gICAgd2luZG93LmlubmVyV2lkdGggPiA3NjggJiYgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBteVNlYXJjaEtleSlcbiAgfSkpXG5cbiAgLy8gQ2xvc2UgU2VhcmNoXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHFzYSgnLmpzLWNsb3NlLXNlYXJjaCcpLmZvckVhY2goaXRlbSA9PiBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtc2VhcmNoJylcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIG15U2VhcmNoS2V5KVxuICB9KSlcblxuICAvLyBTZWFyY2hcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLyogZXNsaW50LWRpc2FibGUgbm8tbmV3ICovXG4gIG5ldyBHaG9zdFNlYXJjaChteVNlYXJjaFNldHRpbmdzKVxufSkod2luZG93LCBkb2N1bWVudClcbiJdfQ==

//# sourceMappingURL=map/search.js.map
