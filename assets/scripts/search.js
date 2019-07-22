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
    e = e || 'up'; // if (window.innerWidth < 768) return

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
    var resultActive = searchResults.querySelectorAll('.search-result--active')[0];

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
      searchInput.focus();
      document.body.classList.add('has-search');
      document.addEventListener('keyup', mySearchKey);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVjay5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2NyZWF0ZUNsYXNzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2YuanMiLCJub2RlX21vZHVsZXMvZnV6enlzb3J0L2Z1enp5c29ydC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdGltZXJzLWJyb3dzZXJpZnkvbWFpbi5qcyIsInNyYy9qcy9hcHAvYXBwLnNlYXJjaC5qcyIsInNyYy9qcy9zZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QixFQUFtQyxXQUFuQztBQUNELEtBTHNDLENBQUo7QUFBQSxHQUFuQyxFQXhKcUIsQ0ErSnJCO0FBQ0E7O0FBQ0EsRUFBQSxHQUFHLENBQUMsa0JBQUQsQ0FBSCxDQUF3QixPQUF4QixDQUFnQyxVQUFBLElBQUk7QUFBQSxXQUFJLElBQUksQ0FBQyxnQkFBTCxDQUFzQixPQUF0QixFQUErQixVQUFBLENBQUMsRUFBSTtBQUMxRSxNQUFBLENBQUMsQ0FBQyxjQUFGO0FBQ0EsTUFBQSxRQUFRLENBQUMsSUFBVCxDQUFjLFNBQWQsQ0FBd0IsTUFBeEIsQ0FBK0IsWUFBL0I7QUFDQSxNQUFBLFFBQVEsQ0FBQyxtQkFBVCxDQUE2QixPQUE3QixFQUFzQyxXQUF0QztBQUNELEtBSnVDLENBQUo7QUFBQSxHQUFwQyxFQWpLcUIsQ0F1S3JCO0FBQ0E7O0FBQ0E7O0FBQ0EsTUFBSSxZQUFKLENBQWdCLGdCQUFoQjtBQUNELENBM0tELEVBMktHLE1BM0tILEVBMktXLFFBM0tYIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfY2xhc3NDYWxsQ2hlY2s7IiwiZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gIGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgcmV0dXJuIENvbnN0cnVjdG9yO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9jcmVhdGVDbGFzczsiLCJmdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7XG4gIGlmIChrZXkgaW4gb2JqKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmpba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfZGVmaW5lUHJvcGVydHk7IiwiZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBcImRlZmF1bHRcIjogb2JqXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdDsiLCJmdW5jdGlvbiBfdHlwZW9mMihvYmopIHsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7IF90eXBlb2YyID0gZnVuY3Rpb24gX3R5cGVvZjIob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mMiA9IGZ1bmN0aW9uIF90eXBlb2YyKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTsgfSByZXR1cm4gX3R5cGVvZjIob2JqKTsgfVxuXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIF90eXBlb2YyKFN5bWJvbC5pdGVyYXRvcikgPT09IFwic3ltYm9sXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIF90eXBlb2YyKG9iaik7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IF90eXBlb2YyKG9iaik7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBfdHlwZW9mKG9iaik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3R5cGVvZjsiLCIvKlxyXG5XSEFUOiBTdWJsaW1lVGV4dC1saWtlIEZ1enp5IFNlYXJjaFxyXG5cclxuVVNBR0U6XHJcbiAgZnV6enlzb3J0LnNpbmdsZSgnZnMnLCAnRnV6enkgU2VhcmNoJykgLy8ge3Njb3JlOiAtMTZ9XHJcbiAgZnV6enlzb3J0LnNpbmdsZSgndGVzdCcsICd0ZXN0JykgLy8ge3Njb3JlOiAwfVxyXG4gIGZ1enp5c29ydC5zaW5nbGUoJ2RvZXNudCBleGlzdCcsICd0YXJnZXQnKSAvLyBudWxsXHJcblxyXG4gIGZ1enp5c29ydC5nbygnbXInLCBbJ01vbml0b3IuY3BwJywgJ01lc2hSZW5kZXJlci5jcHAnXSlcclxuICAvLyBbe3Njb3JlOiAtMTgsIHRhcmdldDogXCJNZXNoUmVuZGVyZXIuY3BwXCJ9LCB7c2NvcmU6IC02MDA5LCB0YXJnZXQ6IFwiTW9uaXRvci5jcHBcIn1dXHJcblxyXG4gIGZ1enp5c29ydC5oaWdobGlnaHQoZnV6enlzb3J0LnNpbmdsZSgnZnMnLCAnRnV6enkgU2VhcmNoJyksICc8Yj4nLCAnPC9iPicpXHJcbiAgLy8gPGI+RjwvYj51enp5IDxiPlM8L2I+ZWFyY2hcclxuKi9cclxuXHJcbi8vIFVNRCAoVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uKSBmb3IgZnV6enlzb3J0XHJcbjsoZnVuY3Rpb24ocm9vdCwgVU1EKSB7XHJcbiAgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoW10sIFVNRClcclxuICBlbHNlIGlmKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IFVNRCgpXHJcbiAgZWxzZSByb290LmZ1enp5c29ydCA9IFVNRCgpXHJcbn0pKHRoaXMsIGZ1bmN0aW9uIFVNRCgpIHsgZnVuY3Rpb24gZnV6enlzb3J0TmV3KGluc3RhbmNlT3B0aW9ucykge1xyXG5cclxuICB2YXIgZnV6enlzb3J0ID0ge1xyXG5cclxuICAgIHNpbmdsZTogZnVuY3Rpb24oc2VhcmNoLCB0YXJnZXQsIG9wdGlvbnMpIHtcclxuICAgICAgaWYoIXNlYXJjaCkgcmV0dXJuIG51bGxcclxuICAgICAgaWYoIWlzT2JqKHNlYXJjaCkpIHNlYXJjaCA9IGZ1enp5c29ydC5nZXRQcmVwYXJlZFNlYXJjaChzZWFyY2gpXHJcblxyXG4gICAgICBpZighdGFyZ2V0KSByZXR1cm4gbnVsbFxyXG4gICAgICBpZighaXNPYmoodGFyZ2V0KSkgdGFyZ2V0ID0gZnV6enlzb3J0LmdldFByZXBhcmVkKHRhcmdldClcclxuXHJcbiAgICAgIHZhciBhbGxvd1R5cG8gPSBvcHRpb25zICYmIG9wdGlvbnMuYWxsb3dUeXBvIT09dW5kZWZpbmVkID8gb3B0aW9ucy5hbGxvd1R5cG9cclxuICAgICAgICA6IGluc3RhbmNlT3B0aW9ucyAmJiBpbnN0YW5jZU9wdGlvbnMuYWxsb3dUeXBvIT09dW5kZWZpbmVkID8gaW5zdGFuY2VPcHRpb25zLmFsbG93VHlwb1xyXG4gICAgICAgIDogdHJ1ZVxyXG4gICAgICB2YXIgYWxnb3JpdGhtID0gYWxsb3dUeXBvID8gZnV6enlzb3J0LmFsZ29yaXRobSA6IGZ1enp5c29ydC5hbGdvcml0aG1Ob1R5cG9cclxuICAgICAgcmV0dXJuIGFsZ29yaXRobShzZWFyY2gsIHRhcmdldCwgc2VhcmNoWzBdKVxyXG4gICAgICAvLyB2YXIgdGhyZXNob2xkID0gb3B0aW9ucyAmJiBvcHRpb25zLnRocmVzaG9sZCB8fCBpbnN0YW5jZU9wdGlvbnMgJiYgaW5zdGFuY2VPcHRpb25zLnRocmVzaG9sZCB8fCAtOTAwNzE5OTI1NDc0MDk5MVxyXG4gICAgICAvLyB2YXIgcmVzdWx0ID0gYWxnb3JpdGhtKHNlYXJjaCwgdGFyZ2V0LCBzZWFyY2hbMF0pXHJcbiAgICAgIC8vIGlmKHJlc3VsdCA9PT0gbnVsbCkgcmV0dXJuIG51bGxcclxuICAgICAgLy8gaWYocmVzdWx0LnNjb3JlIDwgdGhyZXNob2xkKSByZXR1cm4gbnVsbFxyXG4gICAgICAvLyByZXR1cm4gcmVzdWx0XHJcbiAgICB9LFxyXG5cclxuICAgIGdvOiBmdW5jdGlvbihzZWFyY2gsIHRhcmdldHMsIG9wdGlvbnMpIHtcclxuICAgICAgaWYoIXNlYXJjaCkgcmV0dXJuIG5vUmVzdWx0c1xyXG4gICAgICBzZWFyY2ggPSBmdXp6eXNvcnQucHJlcGFyZVNlYXJjaChzZWFyY2gpXHJcbiAgICAgIHZhciBzZWFyY2hMb3dlckNvZGUgPSBzZWFyY2hbMF1cclxuXHJcbiAgICAgIHZhciB0aHJlc2hvbGQgPSBvcHRpb25zICYmIG9wdGlvbnMudGhyZXNob2xkIHx8IGluc3RhbmNlT3B0aW9ucyAmJiBpbnN0YW5jZU9wdGlvbnMudGhyZXNob2xkIHx8IC05MDA3MTk5MjU0NzQwOTkxXHJcbiAgICAgIHZhciBsaW1pdCA9IG9wdGlvbnMgJiYgb3B0aW9ucy5saW1pdCB8fCBpbnN0YW5jZU9wdGlvbnMgJiYgaW5zdGFuY2VPcHRpb25zLmxpbWl0IHx8IDkwMDcxOTkyNTQ3NDA5OTFcclxuICAgICAgdmFyIGFsbG93VHlwbyA9IG9wdGlvbnMgJiYgb3B0aW9ucy5hbGxvd1R5cG8hPT11bmRlZmluZWQgPyBvcHRpb25zLmFsbG93VHlwb1xyXG4gICAgICAgIDogaW5zdGFuY2VPcHRpb25zICYmIGluc3RhbmNlT3B0aW9ucy5hbGxvd1R5cG8hPT11bmRlZmluZWQgPyBpbnN0YW5jZU9wdGlvbnMuYWxsb3dUeXBvXHJcbiAgICAgICAgOiB0cnVlXHJcbiAgICAgIHZhciBhbGdvcml0aG0gPSBhbGxvd1R5cG8gPyBmdXp6eXNvcnQuYWxnb3JpdGhtIDogZnV6enlzb3J0LmFsZ29yaXRobU5vVHlwb1xyXG4gICAgICB2YXIgcmVzdWx0c0xlbiA9IDA7IHZhciBsaW1pdGVkQ291bnQgPSAwXHJcbiAgICAgIHZhciB0YXJnZXRzTGVuID0gdGFyZ2V0cy5sZW5ndGhcclxuXHJcbiAgICAgIC8vIFRoaXMgY29kZSBpcyBjb3B5L3Bhc3RlZCAzIHRpbWVzIGZvciBwZXJmb3JtYW5jZSByZWFzb25zIFtvcHRpb25zLmtleXMsIG9wdGlvbnMua2V5LCBubyBrZXlzXVxyXG5cclxuICAgICAgLy8gb3B0aW9ucy5rZXlzXHJcbiAgICAgIGlmKG9wdGlvbnMgJiYgb3B0aW9ucy5rZXlzKSB7XHJcbiAgICAgICAgdmFyIHNjb3JlRm4gPSBvcHRpb25zLnNjb3JlRm4gfHwgZGVmYXVsdFNjb3JlRm5cclxuICAgICAgICB2YXIga2V5cyA9IG9wdGlvbnMua2V5c1xyXG4gICAgICAgIHZhciBrZXlzTGVuID0ga2V5cy5sZW5ndGhcclxuICAgICAgICBmb3IodmFyIGkgPSB0YXJnZXRzTGVuIC0gMTsgaSA+PSAwOyAtLWkpIHsgdmFyIG9iaiA9IHRhcmdldHNbaV1cclxuICAgICAgICAgIHZhciBvYmpSZXN1bHRzID0gbmV3IEFycmF5KGtleXNMZW4pXHJcbiAgICAgICAgICBmb3IgKHZhciBrZXlJID0ga2V5c0xlbiAtIDE7IGtleUkgPj0gMDsgLS1rZXlJKSB7XHJcbiAgICAgICAgICAgIHZhciBrZXkgPSBrZXlzW2tleUldXHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBnZXRWYWx1ZShvYmosIGtleSlcclxuICAgICAgICAgICAgaWYoIXRhcmdldCkgeyBvYmpSZXN1bHRzW2tleUldID0gbnVsbDsgY29udGludWUgfVxyXG4gICAgICAgICAgICBpZighaXNPYmoodGFyZ2V0KSkgdGFyZ2V0ID0gZnV6enlzb3J0LmdldFByZXBhcmVkKHRhcmdldClcclxuXHJcbiAgICAgICAgICAgIG9ialJlc3VsdHNba2V5SV0gPSBhbGdvcml0aG0oc2VhcmNoLCB0YXJnZXQsIHNlYXJjaExvd2VyQ29kZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG9ialJlc3VsdHMub2JqID0gb2JqIC8vIGJlZm9yZSBzY29yZUZuIHNvIHNjb3JlRm4gY2FuIHVzZSBpdFxyXG4gICAgICAgICAgdmFyIHNjb3JlID0gc2NvcmVGbihvYmpSZXN1bHRzKVxyXG4gICAgICAgICAgaWYoc2NvcmUgPT09IG51bGwpIGNvbnRpbnVlXHJcbiAgICAgICAgICBpZihzY29yZSA8IHRocmVzaG9sZCkgY29udGludWVcclxuICAgICAgICAgIG9ialJlc3VsdHMuc2NvcmUgPSBzY29yZVxyXG4gICAgICAgICAgaWYocmVzdWx0c0xlbiA8IGxpbWl0KSB7IHEuYWRkKG9ialJlc3VsdHMpOyArK3Jlc3VsdHNMZW4gfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICsrbGltaXRlZENvdW50XHJcbiAgICAgICAgICAgIGlmKHNjb3JlID4gcS5wZWVrKCkuc2NvcmUpIHEucmVwbGFjZVRvcChvYmpSZXN1bHRzKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIC8vIG9wdGlvbnMua2V5XHJcbiAgICAgIH0gZWxzZSBpZihvcHRpb25zICYmIG9wdGlvbnMua2V5KSB7XHJcbiAgICAgICAgdmFyIGtleSA9IG9wdGlvbnMua2V5XHJcbiAgICAgICAgZm9yKHZhciBpID0gdGFyZ2V0c0xlbiAtIDE7IGkgPj0gMDsgLS1pKSB7IHZhciBvYmogPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgICB2YXIgdGFyZ2V0ID0gZ2V0VmFsdWUob2JqLCBrZXkpXHJcbiAgICAgICAgICBpZighdGFyZ2V0KSBjb250aW51ZVxyXG4gICAgICAgICAgaWYoIWlzT2JqKHRhcmdldCkpIHRhcmdldCA9IGZ1enp5c29ydC5nZXRQcmVwYXJlZCh0YXJnZXQpXHJcblxyXG4gICAgICAgICAgdmFyIHJlc3VsdCA9IGFsZ29yaXRobShzZWFyY2gsIHRhcmdldCwgc2VhcmNoTG93ZXJDb2RlKVxyXG4gICAgICAgICAgaWYocmVzdWx0ID09PSBudWxsKSBjb250aW51ZVxyXG4gICAgICAgICAgaWYocmVzdWx0LnNjb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZVxyXG5cclxuICAgICAgICAgIC8vIGhhdmUgdG8gY2xvbmUgcmVzdWx0IHNvIGR1cGxpY2F0ZSB0YXJnZXRzIGZyb20gZGlmZmVyZW50IG9iaiBjYW4gZWFjaCByZWZlcmVuY2UgdGhlIGNvcnJlY3Qgb2JqXHJcbiAgICAgICAgICByZXN1bHQgPSB7dGFyZ2V0OnJlc3VsdC50YXJnZXQsIF90YXJnZXRMb3dlckNvZGVzOm51bGwsIF9uZXh0QmVnaW5uaW5nSW5kZXhlczpudWxsLCBzY29yZTpyZXN1bHQuc2NvcmUsIGluZGV4ZXM6cmVzdWx0LmluZGV4ZXMsIG9iajpvYmp9IC8vIGhpZGRlblxyXG5cclxuICAgICAgICAgIGlmKHJlc3VsdHNMZW4gPCBsaW1pdCkgeyBxLmFkZChyZXN1bHQpOyArK3Jlc3VsdHNMZW4gfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICsrbGltaXRlZENvdW50XHJcbiAgICAgICAgICAgIGlmKHJlc3VsdC5zY29yZSA+IHEucGVlaygpLnNjb3JlKSBxLnJlcGxhY2VUb3AocmVzdWx0KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIC8vIG5vIGtleXNcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmb3IodmFyIGkgPSB0YXJnZXRzTGVuIC0gMTsgaSA+PSAwOyAtLWkpIHsgdmFyIHRhcmdldCA9IHRhcmdldHNbaV1cclxuICAgICAgICAgIGlmKCF0YXJnZXQpIGNvbnRpbnVlXHJcbiAgICAgICAgICBpZighaXNPYmoodGFyZ2V0KSkgdGFyZ2V0ID0gZnV6enlzb3J0LmdldFByZXBhcmVkKHRhcmdldClcclxuXHJcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gYWxnb3JpdGhtKHNlYXJjaCwgdGFyZ2V0LCBzZWFyY2hMb3dlckNvZGUpXHJcbiAgICAgICAgICBpZihyZXN1bHQgPT09IG51bGwpIGNvbnRpbnVlXHJcbiAgICAgICAgICBpZihyZXN1bHQuc2NvcmUgPCB0aHJlc2hvbGQpIGNvbnRpbnVlXHJcbiAgICAgICAgICBpZihyZXN1bHRzTGVuIDwgbGltaXQpIHsgcS5hZGQocmVzdWx0KTsgKytyZXN1bHRzTGVuIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICArK2xpbWl0ZWRDb3VudFxyXG4gICAgICAgICAgICBpZihyZXN1bHQuc2NvcmUgPiBxLnBlZWsoKS5zY29yZSkgcS5yZXBsYWNlVG9wKHJlc3VsdClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKHJlc3VsdHNMZW4gPT09IDApIHJldHVybiBub1Jlc3VsdHNcclxuICAgICAgdmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkocmVzdWx0c0xlbilcclxuICAgICAgZm9yKHZhciBpID0gcmVzdWx0c0xlbiAtIDE7IGkgPj0gMDsgLS1pKSByZXN1bHRzW2ldID0gcS5wb2xsKClcclxuICAgICAgcmVzdWx0cy50b3RhbCA9IHJlc3VsdHNMZW4gKyBsaW1pdGVkQ291bnRcclxuICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgIH0sXHJcblxyXG4gICAgZ29Bc3luYzogZnVuY3Rpb24oc2VhcmNoLCB0YXJnZXRzLCBvcHRpb25zKSB7XHJcbiAgICAgIHZhciBjYW5jZWxlZCA9IGZhbHNlXHJcbiAgICAgIHZhciBwID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgaWYoIXNlYXJjaCkgcmV0dXJuIHJlc29sdmUobm9SZXN1bHRzKVxyXG4gICAgICAgIHNlYXJjaCA9IGZ1enp5c29ydC5wcmVwYXJlU2VhcmNoKHNlYXJjaClcclxuICAgICAgICB2YXIgc2VhcmNoTG93ZXJDb2RlID0gc2VhcmNoWzBdXHJcblxyXG4gICAgICAgIHZhciBxID0gZmFzdHByaW9yaXR5cXVldWUoKVxyXG4gICAgICAgIHZhciBpQ3VycmVudCA9IHRhcmdldHMubGVuZ3RoIC0gMVxyXG4gICAgICAgIHZhciB0aHJlc2hvbGQgPSBvcHRpb25zICYmIG9wdGlvbnMudGhyZXNob2xkIHx8IGluc3RhbmNlT3B0aW9ucyAmJiBpbnN0YW5jZU9wdGlvbnMudGhyZXNob2xkIHx8IC05MDA3MTk5MjU0NzQwOTkxXHJcbiAgICAgICAgdmFyIGxpbWl0ID0gb3B0aW9ucyAmJiBvcHRpb25zLmxpbWl0IHx8IGluc3RhbmNlT3B0aW9ucyAmJiBpbnN0YW5jZU9wdGlvbnMubGltaXQgfHwgOTAwNzE5OTI1NDc0MDk5MVxyXG4gICAgICAgIHZhciBhbGxvd1R5cG8gPSBvcHRpb25zICYmIG9wdGlvbnMuYWxsb3dUeXBvIT09dW5kZWZpbmVkID8gb3B0aW9ucy5hbGxvd1R5cG9cclxuICAgICAgICAgIDogaW5zdGFuY2VPcHRpb25zICYmIGluc3RhbmNlT3B0aW9ucy5hbGxvd1R5cG8hPT11bmRlZmluZWQgPyBpbnN0YW5jZU9wdGlvbnMuYWxsb3dUeXBvXHJcbiAgICAgICAgICA6IHRydWVcclxuICAgICAgICB2YXIgYWxnb3JpdGhtID0gYWxsb3dUeXBvID8gZnV6enlzb3J0LmFsZ29yaXRobSA6IGZ1enp5c29ydC5hbGdvcml0aG1Ob1R5cG9cclxuICAgICAgICB2YXIgcmVzdWx0c0xlbiA9IDA7IHZhciBsaW1pdGVkQ291bnQgPSAwXHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcCgpIHtcclxuICAgICAgICAgIGlmKGNhbmNlbGVkKSByZXR1cm4gcmVqZWN0KCdjYW5jZWxlZCcpXHJcblxyXG4gICAgICAgICAgdmFyIHN0YXJ0TXMgPSBEYXRlLm5vdygpXHJcblxyXG4gICAgICAgICAgLy8gVGhpcyBjb2RlIGlzIGNvcHkvcGFzdGVkIDMgdGltZXMgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgW29wdGlvbnMua2V5cywgb3B0aW9ucy5rZXksIG5vIGtleXNdXHJcblxyXG4gICAgICAgICAgLy8gb3B0aW9ucy5rZXlzXHJcbiAgICAgICAgICBpZihvcHRpb25zICYmIG9wdGlvbnMua2V5cykge1xyXG4gICAgICAgICAgICB2YXIgc2NvcmVGbiA9IG9wdGlvbnMuc2NvcmVGbiB8fCBkZWZhdWx0U2NvcmVGblxyXG4gICAgICAgICAgICB2YXIga2V5cyA9IG9wdGlvbnMua2V5c1xyXG4gICAgICAgICAgICB2YXIga2V5c0xlbiA9IGtleXMubGVuZ3RoXHJcbiAgICAgICAgICAgIGZvcig7IGlDdXJyZW50ID49IDA7IC0taUN1cnJlbnQpIHsgdmFyIG9iaiA9IHRhcmdldHNbaUN1cnJlbnRdXHJcbiAgICAgICAgICAgICAgdmFyIG9ialJlc3VsdHMgPSBuZXcgQXJyYXkoa2V5c0xlbilcclxuICAgICAgICAgICAgICBmb3IgKHZhciBrZXlJID0ga2V5c0xlbiAtIDE7IGtleUkgPj0gMDsgLS1rZXlJKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0ga2V5c1trZXlJXVxyXG4gICAgICAgICAgICAgICAgdmFyIHRhcmdldCA9IGdldFZhbHVlKG9iaiwga2V5KVxyXG4gICAgICAgICAgICAgICAgaWYoIXRhcmdldCkgeyBvYmpSZXN1bHRzW2tleUldID0gbnVsbDsgY29udGludWUgfVxyXG4gICAgICAgICAgICAgICAgaWYoIWlzT2JqKHRhcmdldCkpIHRhcmdldCA9IGZ1enp5c29ydC5nZXRQcmVwYXJlZCh0YXJnZXQpXHJcblxyXG4gICAgICAgICAgICAgICAgb2JqUmVzdWx0c1trZXlJXSA9IGFsZ29yaXRobShzZWFyY2gsIHRhcmdldCwgc2VhcmNoTG93ZXJDb2RlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBvYmpSZXN1bHRzLm9iaiA9IG9iaiAvLyBiZWZvcmUgc2NvcmVGbiBzbyBzY29yZUZuIGNhbiB1c2UgaXRcclxuICAgICAgICAgICAgICB2YXIgc2NvcmUgPSBzY29yZUZuKG9ialJlc3VsdHMpXHJcbiAgICAgICAgICAgICAgaWYoc2NvcmUgPT09IG51bGwpIGNvbnRpbnVlXHJcbiAgICAgICAgICAgICAgaWYoc2NvcmUgPCB0aHJlc2hvbGQpIGNvbnRpbnVlXHJcbiAgICAgICAgICAgICAgb2JqUmVzdWx0cy5zY29yZSA9IHNjb3JlXHJcbiAgICAgICAgICAgICAgaWYocmVzdWx0c0xlbiA8IGxpbWl0KSB7IHEuYWRkKG9ialJlc3VsdHMpOyArK3Jlc3VsdHNMZW4gfVxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgKytsaW1pdGVkQ291bnRcclxuICAgICAgICAgICAgICAgIGlmKHNjb3JlID4gcS5wZWVrKCkuc2NvcmUpIHEucmVwbGFjZVRvcChvYmpSZXN1bHRzKVxyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgaWYoaUN1cnJlbnQlMTAwMC8qaXRlbXNQZXJDaGVjayovID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZihEYXRlLm5vdygpIC0gc3RhcnRNcyA+PSAxMC8qYXN5bmNJbnRlcnZhbCovKSB7XHJcbiAgICAgICAgICAgICAgICAgIGlzTm9kZT9zZXRJbW1lZGlhdGUoc3RlcCk6c2V0VGltZW91dChzdGVwKVxyXG4gICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBvcHRpb25zLmtleVxyXG4gICAgICAgICAgfSBlbHNlIGlmKG9wdGlvbnMgJiYgb3B0aW9ucy5rZXkpIHtcclxuICAgICAgICAgICAgdmFyIGtleSA9IG9wdGlvbnMua2V5XHJcbiAgICAgICAgICAgIGZvcig7IGlDdXJyZW50ID49IDA7IC0taUN1cnJlbnQpIHsgdmFyIG9iaiA9IHRhcmdldHNbaUN1cnJlbnRdXHJcbiAgICAgICAgICAgICAgdmFyIHRhcmdldCA9IGdldFZhbHVlKG9iaiwga2V5KVxyXG4gICAgICAgICAgICAgIGlmKCF0YXJnZXQpIGNvbnRpbnVlXHJcbiAgICAgICAgICAgICAgaWYoIWlzT2JqKHRhcmdldCkpIHRhcmdldCA9IGZ1enp5c29ydC5nZXRQcmVwYXJlZCh0YXJnZXQpXHJcblxyXG4gICAgICAgICAgICAgIHZhciByZXN1bHQgPSBhbGdvcml0aG0oc2VhcmNoLCB0YXJnZXQsIHNlYXJjaExvd2VyQ29kZSlcclxuICAgICAgICAgICAgICBpZihyZXN1bHQgPT09IG51bGwpIGNvbnRpbnVlXHJcbiAgICAgICAgICAgICAgaWYocmVzdWx0LnNjb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZVxyXG5cclxuICAgICAgICAgICAgICAvLyBoYXZlIHRvIGNsb25lIHJlc3VsdCBzbyBkdXBsaWNhdGUgdGFyZ2V0cyBmcm9tIGRpZmZlcmVudCBvYmogY2FuIGVhY2ggcmVmZXJlbmNlIHRoZSBjb3JyZWN0IG9ialxyXG4gICAgICAgICAgICAgIHJlc3VsdCA9IHt0YXJnZXQ6cmVzdWx0LnRhcmdldCwgX3RhcmdldExvd2VyQ29kZXM6bnVsbCwgX25leHRCZWdpbm5pbmdJbmRleGVzOm51bGwsIHNjb3JlOnJlc3VsdC5zY29yZSwgaW5kZXhlczpyZXN1bHQuaW5kZXhlcywgb2JqOm9ian0gLy8gaGlkZGVuXHJcblxyXG4gICAgICAgICAgICAgIGlmKHJlc3VsdHNMZW4gPCBsaW1pdCkgeyBxLmFkZChyZXN1bHQpOyArK3Jlc3VsdHNMZW4gfVxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgKytsaW1pdGVkQ291bnRcclxuICAgICAgICAgICAgICAgIGlmKHJlc3VsdC5zY29yZSA+IHEucGVlaygpLnNjb3JlKSBxLnJlcGxhY2VUb3AocmVzdWx0KVxyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgaWYoaUN1cnJlbnQlMTAwMC8qaXRlbXNQZXJDaGVjayovID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZihEYXRlLm5vdygpIC0gc3RhcnRNcyA+PSAxMC8qYXN5bmNJbnRlcnZhbCovKSB7XHJcbiAgICAgICAgICAgICAgICAgIGlzTm9kZT9zZXRJbW1lZGlhdGUoc3RlcCk6c2V0VGltZW91dChzdGVwKVxyXG4gICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBubyBrZXlzXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IoOyBpQ3VycmVudCA+PSAwOyAtLWlDdXJyZW50KSB7IHZhciB0YXJnZXQgPSB0YXJnZXRzW2lDdXJyZW50XVxyXG4gICAgICAgICAgICAgIGlmKCF0YXJnZXQpIGNvbnRpbnVlXHJcbiAgICAgICAgICAgICAgaWYoIWlzT2JqKHRhcmdldCkpIHRhcmdldCA9IGZ1enp5c29ydC5nZXRQcmVwYXJlZCh0YXJnZXQpXHJcblxyXG4gICAgICAgICAgICAgIHZhciByZXN1bHQgPSBhbGdvcml0aG0oc2VhcmNoLCB0YXJnZXQsIHNlYXJjaExvd2VyQ29kZSlcclxuICAgICAgICAgICAgICBpZihyZXN1bHQgPT09IG51bGwpIGNvbnRpbnVlXHJcbiAgICAgICAgICAgICAgaWYocmVzdWx0LnNjb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZVxyXG4gICAgICAgICAgICAgIGlmKHJlc3VsdHNMZW4gPCBsaW1pdCkgeyBxLmFkZChyZXN1bHQpOyArK3Jlc3VsdHNMZW4gfVxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgKytsaW1pdGVkQ291bnRcclxuICAgICAgICAgICAgICAgIGlmKHJlc3VsdC5zY29yZSA+IHEucGVlaygpLnNjb3JlKSBxLnJlcGxhY2VUb3AocmVzdWx0KVxyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgaWYoaUN1cnJlbnQlMTAwMC8qaXRlbXNQZXJDaGVjayovID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZihEYXRlLm5vdygpIC0gc3RhcnRNcyA+PSAxMC8qYXN5bmNJbnRlcnZhbCovKSB7XHJcbiAgICAgICAgICAgICAgICAgIGlzTm9kZT9zZXRJbW1lZGlhdGUoc3RlcCk6c2V0VGltZW91dChzdGVwKVxyXG4gICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZihyZXN1bHRzTGVuID09PSAwKSByZXR1cm4gcmVzb2x2ZShub1Jlc3VsdHMpXHJcbiAgICAgICAgICB2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShyZXN1bHRzTGVuKVxyXG4gICAgICAgICAgZm9yKHZhciBpID0gcmVzdWx0c0xlbiAtIDE7IGkgPj0gMDsgLS1pKSByZXN1bHRzW2ldID0gcS5wb2xsKClcclxuICAgICAgICAgIHJlc3VsdHMudG90YWwgPSByZXN1bHRzTGVuICsgbGltaXRlZENvdW50XHJcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdHMpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpc05vZGU/c2V0SW1tZWRpYXRlKHN0ZXApOnN0ZXAoKVxyXG4gICAgICB9KVxyXG4gICAgICBwLmNhbmNlbCA9IGZ1bmN0aW9uKCkgeyBjYW5jZWxlZCA9IHRydWUgfVxyXG4gICAgICByZXR1cm4gcFxyXG4gICAgfSxcclxuXHJcbiAgICBoaWdobGlnaHQ6IGZ1bmN0aW9uKHJlc3VsdCwgaE9wZW4sIGhDbG9zZSkge1xyXG4gICAgICBpZihyZXN1bHQgPT09IG51bGwpIHJldHVybiBudWxsXHJcbiAgICAgIGlmKGhPcGVuID09PSB1bmRlZmluZWQpIGhPcGVuID0gJzxiPidcclxuICAgICAgaWYoaENsb3NlID09PSB1bmRlZmluZWQpIGhDbG9zZSA9ICc8L2I+J1xyXG4gICAgICB2YXIgaGlnaGxpZ2h0ZWQgPSAnJ1xyXG4gICAgICB2YXIgbWF0Y2hlc0luZGV4ID0gMFxyXG4gICAgICB2YXIgb3BlbmVkID0gZmFsc2VcclxuICAgICAgdmFyIHRhcmdldCA9IHJlc3VsdC50YXJnZXRcclxuICAgICAgdmFyIHRhcmdldExlbiA9IHRhcmdldC5sZW5ndGhcclxuICAgICAgdmFyIG1hdGNoZXNCZXN0ID0gcmVzdWx0LmluZGV4ZXNcclxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldExlbjsgKytpKSB7IHZhciBjaGFyID0gdGFyZ2V0W2ldXHJcbiAgICAgICAgaWYobWF0Y2hlc0Jlc3RbbWF0Y2hlc0luZGV4XSA9PT0gaSkge1xyXG4gICAgICAgICAgKyttYXRjaGVzSW5kZXhcclxuICAgICAgICAgIGlmKCFvcGVuZWQpIHsgb3BlbmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICBoaWdobGlnaHRlZCArPSBoT3BlblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmKG1hdGNoZXNJbmRleCA9PT0gbWF0Y2hlc0Jlc3QubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkICs9IGNoYXIgKyBoQ2xvc2UgKyB0YXJnZXQuc3Vic3RyKGkrMSlcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYob3BlbmVkKSB7IG9wZW5lZCA9IGZhbHNlXHJcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkICs9IGhDbG9zZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBoaWdobGlnaHRlZCArPSBjaGFyXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBoaWdobGlnaHRlZFxyXG4gICAgfSxcclxuXHJcbiAgICBwcmVwYXJlOiBmdW5jdGlvbih0YXJnZXQpIHtcclxuICAgICAgaWYoIXRhcmdldCkgcmV0dXJuXHJcbiAgICAgIHJldHVybiB7dGFyZ2V0OnRhcmdldCwgX3RhcmdldExvd2VyQ29kZXM6ZnV6enlzb3J0LnByZXBhcmVMb3dlckNvZGVzKHRhcmdldCksIF9uZXh0QmVnaW5uaW5nSW5kZXhlczpudWxsLCBzY29yZTpudWxsLCBpbmRleGVzOm51bGwsIG9iajpudWxsfSAvLyBoaWRkZW5cclxuICAgIH0sXHJcbiAgICBwcmVwYXJlU2xvdzogZnVuY3Rpb24odGFyZ2V0KSB7XHJcbiAgICAgIGlmKCF0YXJnZXQpIHJldHVyblxyXG4gICAgICByZXR1cm4ge3RhcmdldDp0YXJnZXQsIF90YXJnZXRMb3dlckNvZGVzOmZ1enp5c29ydC5wcmVwYXJlTG93ZXJDb2Rlcyh0YXJnZXQpLCBfbmV4dEJlZ2lubmluZ0luZGV4ZXM6ZnV6enlzb3J0LnByZXBhcmVOZXh0QmVnaW5uaW5nSW5kZXhlcyh0YXJnZXQpLCBzY29yZTpudWxsLCBpbmRleGVzOm51bGwsIG9iajpudWxsfSAvLyBoaWRkZW5cclxuICAgIH0sXHJcbiAgICBwcmVwYXJlU2VhcmNoOiBmdW5jdGlvbihzZWFyY2gpIHtcclxuICAgICAgaWYoIXNlYXJjaCkgcmV0dXJuXHJcbiAgICAgIHJldHVybiBmdXp6eXNvcnQucHJlcGFyZUxvd2VyQ29kZXMoc2VhcmNoKVxyXG4gICAgfSxcclxuXHJcblxyXG5cclxuICAgIC8vIEJlbG93IHRoaXMgcG9pbnQgaXMgb25seSBpbnRlcm5hbCBjb2RlXHJcbiAgICAvLyBCZWxvdyB0aGlzIHBvaW50IGlzIG9ubHkgaW50ZXJuYWwgY29kZVxyXG4gICAgLy8gQmVsb3cgdGhpcyBwb2ludCBpcyBvbmx5IGludGVybmFsIGNvZGVcclxuICAgIC8vIEJlbG93IHRoaXMgcG9pbnQgaXMgb25seSBpbnRlcm5hbCBjb2RlXHJcblxyXG5cclxuXHJcbiAgICBnZXRQcmVwYXJlZDogZnVuY3Rpb24odGFyZ2V0KSB7XHJcbiAgICAgIGlmKHRhcmdldC5sZW5ndGggPiA5OTkpIHJldHVybiBmdXp6eXNvcnQucHJlcGFyZSh0YXJnZXQpIC8vIGRvbid0IGNhY2hlIGh1Z2UgdGFyZ2V0c1xyXG4gICAgICB2YXIgdGFyZ2V0UHJlcGFyZWQgPSBwcmVwYXJlZENhY2hlLmdldCh0YXJnZXQpXHJcbiAgICAgIGlmKHRhcmdldFByZXBhcmVkICE9PSB1bmRlZmluZWQpIHJldHVybiB0YXJnZXRQcmVwYXJlZFxyXG4gICAgICB0YXJnZXRQcmVwYXJlZCA9IGZ1enp5c29ydC5wcmVwYXJlKHRhcmdldClcclxuICAgICAgcHJlcGFyZWRDYWNoZS5zZXQodGFyZ2V0LCB0YXJnZXRQcmVwYXJlZClcclxuICAgICAgcmV0dXJuIHRhcmdldFByZXBhcmVkXHJcbiAgICB9LFxyXG4gICAgZ2V0UHJlcGFyZWRTZWFyY2g6IGZ1bmN0aW9uKHNlYXJjaCkge1xyXG4gICAgICBpZihzZWFyY2gubGVuZ3RoID4gOTk5KSByZXR1cm4gZnV6enlzb3J0LnByZXBhcmVTZWFyY2goc2VhcmNoKSAvLyBkb24ndCBjYWNoZSBodWdlIHNlYXJjaGVzXHJcbiAgICAgIHZhciBzZWFyY2hQcmVwYXJlZCA9IHByZXBhcmVkU2VhcmNoQ2FjaGUuZ2V0KHNlYXJjaClcclxuICAgICAgaWYoc2VhcmNoUHJlcGFyZWQgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHNlYXJjaFByZXBhcmVkXHJcbiAgICAgIHNlYXJjaFByZXBhcmVkID0gZnV6enlzb3J0LnByZXBhcmVTZWFyY2goc2VhcmNoKVxyXG4gICAgICBwcmVwYXJlZFNlYXJjaENhY2hlLnNldChzZWFyY2gsIHNlYXJjaFByZXBhcmVkKVxyXG4gICAgICByZXR1cm4gc2VhcmNoUHJlcGFyZWRcclxuICAgIH0sXHJcblxyXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbihzZWFyY2hMb3dlckNvZGVzLCBwcmVwYXJlZCwgc2VhcmNoTG93ZXJDb2RlKSB7XHJcbiAgICAgIHZhciB0YXJnZXRMb3dlckNvZGVzID0gcHJlcGFyZWQuX3RhcmdldExvd2VyQ29kZXNcclxuICAgICAgdmFyIHNlYXJjaExlbiA9IHNlYXJjaExvd2VyQ29kZXMubGVuZ3RoXHJcbiAgICAgIHZhciB0YXJnZXRMZW4gPSB0YXJnZXRMb3dlckNvZGVzLmxlbmd0aFxyXG4gICAgICB2YXIgc2VhcmNoSSA9IDAgLy8gd2hlcmUgd2UgYXRcclxuICAgICAgdmFyIHRhcmdldEkgPSAwIC8vIHdoZXJlIHlvdSBhdFxyXG4gICAgICB2YXIgdHlwb1NpbXBsZUkgPSAwXHJcbiAgICAgIHZhciBtYXRjaGVzU2ltcGxlTGVuID0gMFxyXG5cclxuICAgICAgLy8gdmVyeSBiYXNpYyBmdXp6eSBtYXRjaDsgdG8gcmVtb3ZlIG5vbi1tYXRjaGluZyB0YXJnZXRzIEFTQVAhXHJcbiAgICAgIC8vIHdhbGsgdGhyb3VnaCB0YXJnZXQuIGZpbmQgc2VxdWVudGlhbCBtYXRjaGVzLlxyXG4gICAgICAvLyBpZiBhbGwgY2hhcnMgYXJlbid0IGZvdW5kIHRoZW4gZXhpdFxyXG4gICAgICBmb3IoOzspIHtcclxuICAgICAgICB2YXIgaXNNYXRjaCA9IHNlYXJjaExvd2VyQ29kZSA9PT0gdGFyZ2V0TG93ZXJDb2Rlc1t0YXJnZXRJXVxyXG4gICAgICAgIGlmKGlzTWF0Y2gpIHtcclxuICAgICAgICAgIG1hdGNoZXNTaW1wbGVbbWF0Y2hlc1NpbXBsZUxlbisrXSA9IHRhcmdldElcclxuICAgICAgICAgICsrc2VhcmNoSTsgaWYoc2VhcmNoSSA9PT0gc2VhcmNoTGVuKSBicmVha1xyXG4gICAgICAgICAgc2VhcmNoTG93ZXJDb2RlID0gc2VhcmNoTG93ZXJDb2Rlc1t0eXBvU2ltcGxlST09PTA/c2VhcmNoSSA6ICh0eXBvU2ltcGxlST09PXNlYXJjaEk/c2VhcmNoSSsxIDogKHR5cG9TaW1wbGVJPT09c2VhcmNoSS0xP3NlYXJjaEktMSA6IHNlYXJjaEkpKV1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICsrdGFyZ2V0STsgaWYodGFyZ2V0SSA+PSB0YXJnZXRMZW4pIHsgLy8gRmFpbGVkIHRvIGZpbmQgc2VhcmNoSVxyXG4gICAgICAgICAgLy8gQ2hlY2sgZm9yIHR5cG8gb3IgZXhpdFxyXG4gICAgICAgICAgLy8gd2UgZ28gYXMgZmFyIGFzIHBvc3NpYmxlIGJlZm9yZSB0cnlpbmcgdG8gdHJhbnNwb3NlXHJcbiAgICAgICAgICAvLyB0aGVuIHdlIHRyYW5zcG9zZSBiYWNrd2FyZHMgdW50aWwgd2UgcmVhY2ggdGhlIGJlZ2lubmluZ1xyXG4gICAgICAgICAgZm9yKDs7KSB7XHJcbiAgICAgICAgICAgIGlmKHNlYXJjaEkgPD0gMSkgcmV0dXJuIG51bGwgLy8gbm90IGFsbG93ZWQgdG8gdHJhbnNwb3NlIGZpcnN0IGNoYXJcclxuICAgICAgICAgICAgaWYodHlwb1NpbXBsZUkgPT09IDApIHsgLy8gd2UgaGF2ZW4ndCB0cmllZCB0byB0cmFuc3Bvc2UgeWV0XHJcbiAgICAgICAgICAgICAgLS1zZWFyY2hJXHJcbiAgICAgICAgICAgICAgdmFyIHNlYXJjaExvd2VyQ29kZU5ldyA9IHNlYXJjaExvd2VyQ29kZXNbc2VhcmNoSV1cclxuICAgICAgICAgICAgICBpZihzZWFyY2hMb3dlckNvZGUgPT09IHNlYXJjaExvd2VyQ29kZU5ldykgY29udGludWUgLy8gZG9lc24ndCBtYWtlIHNlbnNlIHRvIHRyYW5zcG9zZSBhIHJlcGVhdCBjaGFyXHJcbiAgICAgICAgICAgICAgdHlwb1NpbXBsZUkgPSBzZWFyY2hJXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaWYodHlwb1NpbXBsZUkgPT09IDEpIHJldHVybiBudWxsIC8vIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGUgbGluZSBmb3IgdHJhbnNwb3NpbmdcclxuICAgICAgICAgICAgICAtLXR5cG9TaW1wbGVJXHJcbiAgICAgICAgICAgICAgc2VhcmNoSSA9IHR5cG9TaW1wbGVJXHJcbiAgICAgICAgICAgICAgc2VhcmNoTG93ZXJDb2RlID0gc2VhcmNoTG93ZXJDb2Rlc1tzZWFyY2hJICsgMV1cclxuICAgICAgICAgICAgICB2YXIgc2VhcmNoTG93ZXJDb2RlTmV3ID0gc2VhcmNoTG93ZXJDb2Rlc1tzZWFyY2hJXVxyXG4gICAgICAgICAgICAgIGlmKHNlYXJjaExvd2VyQ29kZSA9PT0gc2VhcmNoTG93ZXJDb2RlTmV3KSBjb250aW51ZSAvLyBkb2Vzbid0IG1ha2Ugc2Vuc2UgdG8gdHJhbnNwb3NlIGEgcmVwZWF0IGNoYXJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtYXRjaGVzU2ltcGxlTGVuID0gc2VhcmNoSVxyXG4gICAgICAgICAgICB0YXJnZXRJID0gbWF0Y2hlc1NpbXBsZVttYXRjaGVzU2ltcGxlTGVuIC0gMV0gKyAxXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgc2VhcmNoSSA9IDBcclxuICAgICAgdmFyIHR5cG9TdHJpY3RJID0gMFxyXG4gICAgICB2YXIgc3VjY2Vzc1N0cmljdCA9IGZhbHNlXHJcbiAgICAgIHZhciBtYXRjaGVzU3RyaWN0TGVuID0gMFxyXG5cclxuICAgICAgdmFyIG5leHRCZWdpbm5pbmdJbmRleGVzID0gcHJlcGFyZWQuX25leHRCZWdpbm5pbmdJbmRleGVzXHJcbiAgICAgIGlmKG5leHRCZWdpbm5pbmdJbmRleGVzID09PSBudWxsKSBuZXh0QmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVkLl9uZXh0QmVnaW5uaW5nSW5kZXhlcyA9IGZ1enp5c29ydC5wcmVwYXJlTmV4dEJlZ2lubmluZ0luZGV4ZXMocHJlcGFyZWQudGFyZ2V0KVxyXG4gICAgICB2YXIgZmlyc3RQb3NzaWJsZUkgPSB0YXJnZXRJID0gbWF0Y2hlc1NpbXBsZVswXT09PTAgPyAwIDogbmV4dEJlZ2lubmluZ0luZGV4ZXNbbWF0Y2hlc1NpbXBsZVswXS0xXVxyXG5cclxuICAgICAgLy8gT3VyIHRhcmdldCBzdHJpbmcgc3VjY2Vzc2Z1bGx5IG1hdGNoZWQgYWxsIGNoYXJhY3RlcnMgaW4gc2VxdWVuY2UhXHJcbiAgICAgIC8vIExldCdzIHRyeSBhIG1vcmUgYWR2YW5jZWQgYW5kIHN0cmljdCB0ZXN0IHRvIGltcHJvdmUgdGhlIHNjb3JlXHJcbiAgICAgIC8vIG9ubHkgY291bnQgaXQgYXMgYSBtYXRjaCBpZiBpdCdzIGNvbnNlY3V0aXZlIG9yIGEgYmVnaW5uaW5nIGNoYXJhY3RlciFcclxuICAgICAgaWYodGFyZ2V0SSAhPT0gdGFyZ2V0TGVuKSBmb3IoOzspIHtcclxuICAgICAgICBpZih0YXJnZXRJID49IHRhcmdldExlbikge1xyXG4gICAgICAgICAgLy8gV2UgZmFpbGVkIHRvIGZpbmQgYSBnb29kIHNwb3QgZm9yIHRoaXMgc2VhcmNoIGNoYXIsIGdvIGJhY2sgdG8gdGhlIHByZXZpb3VzIHNlYXJjaCBjaGFyIGFuZCBmb3JjZSBpdCBmb3J3YXJkXHJcbiAgICAgICAgICBpZihzZWFyY2hJIDw9IDApIHsgLy8gV2UgZmFpbGVkIHRvIHB1c2ggY2hhcnMgZm9yd2FyZCBmb3IgYSBiZXR0ZXIgbWF0Y2hcclxuICAgICAgICAgICAgLy8gdHJhbnNwb3NlLCBzdGFydGluZyBmcm9tIHRoZSBiZWdpbm5pbmdcclxuICAgICAgICAgICAgKyt0eXBvU3RyaWN0STsgaWYodHlwb1N0cmljdEkgPiBzZWFyY2hMZW4tMikgYnJlYWtcclxuICAgICAgICAgICAgaWYoc2VhcmNoTG93ZXJDb2Rlc1t0eXBvU3RyaWN0SV0gPT09IHNlYXJjaExvd2VyQ29kZXNbdHlwb1N0cmljdEkrMV0pIGNvbnRpbnVlIC8vIGRvZXNuJ3QgbWFrZSBzZW5zZSB0byB0cmFuc3Bvc2UgYSByZXBlYXQgY2hhclxyXG4gICAgICAgICAgICB0YXJnZXRJID0gZmlyc3RQb3NzaWJsZUlcclxuICAgICAgICAgICAgY29udGludWVcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAtLXNlYXJjaElcclxuICAgICAgICAgIHZhciBsYXN0TWF0Y2ggPSBtYXRjaGVzU3RyaWN0Wy0tbWF0Y2hlc1N0cmljdExlbl1cclxuICAgICAgICAgIHRhcmdldEkgPSBuZXh0QmVnaW5uaW5nSW5kZXhlc1tsYXN0TWF0Y2hdXHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2YXIgaXNNYXRjaCA9IHNlYXJjaExvd2VyQ29kZXNbdHlwb1N0cmljdEk9PT0wP3NlYXJjaEkgOiAodHlwb1N0cmljdEk9PT1zZWFyY2hJP3NlYXJjaEkrMSA6ICh0eXBvU3RyaWN0ST09PXNlYXJjaEktMT9zZWFyY2hJLTEgOiBzZWFyY2hJKSldID09PSB0YXJnZXRMb3dlckNvZGVzW3RhcmdldEldXHJcbiAgICAgICAgICBpZihpc01hdGNoKSB7XHJcbiAgICAgICAgICAgIG1hdGNoZXNTdHJpY3RbbWF0Y2hlc1N0cmljdExlbisrXSA9IHRhcmdldElcclxuICAgICAgICAgICAgKytzZWFyY2hJOyBpZihzZWFyY2hJID09PSBzZWFyY2hMZW4pIHsgc3VjY2Vzc1N0cmljdCA9IHRydWU7IGJyZWFrIH1cclxuICAgICAgICAgICAgKyt0YXJnZXRJXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0YXJnZXRJID0gbmV4dEJlZ2lubmluZ0luZGV4ZXNbdGFyZ2V0SV1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHsgLy8gdGFsbHkgdXAgdGhlIHNjb3JlICYga2VlcCB0cmFjayBvZiBtYXRjaGVzIGZvciBoaWdobGlnaHRpbmcgbGF0ZXJcclxuICAgICAgICBpZihzdWNjZXNzU3RyaWN0KSB7IHZhciBtYXRjaGVzQmVzdCA9IG1hdGNoZXNTdHJpY3Q7IHZhciBtYXRjaGVzQmVzdExlbiA9IG1hdGNoZXNTdHJpY3RMZW4gfVxyXG4gICAgICAgIGVsc2UgeyB2YXIgbWF0Y2hlc0Jlc3QgPSBtYXRjaGVzU2ltcGxlOyB2YXIgbWF0Y2hlc0Jlc3RMZW4gPSBtYXRjaGVzU2ltcGxlTGVuIH1cclxuICAgICAgICB2YXIgc2NvcmUgPSAwXHJcbiAgICAgICAgdmFyIGxhc3RUYXJnZXRJID0gLTFcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgc2VhcmNoTGVuOyArK2kpIHsgdmFyIHRhcmdldEkgPSBtYXRjaGVzQmVzdFtpXVxyXG4gICAgICAgICAgLy8gc2NvcmUgb25seSBnb2VzIGRvd24gaWYgdGhleSdyZSBub3QgY29uc2VjdXRpdmVcclxuICAgICAgICAgIGlmKGxhc3RUYXJnZXRJICE9PSB0YXJnZXRJIC0gMSkgc2NvcmUgLT0gdGFyZ2V0SVxyXG4gICAgICAgICAgbGFzdFRhcmdldEkgPSB0YXJnZXRJXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCFzdWNjZXNzU3RyaWN0KSB7XHJcbiAgICAgICAgICBzY29yZSAqPSAxMDAwXHJcbiAgICAgICAgICBpZih0eXBvU2ltcGxlSSAhPT0gMCkgc2NvcmUgKz0gLTIwLyp0eXBvUGVuYWx0eSovXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmKHR5cG9TdHJpY3RJICE9PSAwKSBzY29yZSArPSAtMjAvKnR5cG9QZW5hbHR5Ki9cclxuICAgICAgICB9XHJcbiAgICAgICAgc2NvcmUgLT0gdGFyZ2V0TGVuIC0gc2VhcmNoTGVuXHJcbiAgICAgICAgcHJlcGFyZWQuc2NvcmUgPSBzY29yZVxyXG4gICAgICAgIHByZXBhcmVkLmluZGV4ZXMgPSBuZXcgQXJyYXkobWF0Y2hlc0Jlc3RMZW4pOyBmb3IodmFyIGkgPSBtYXRjaGVzQmVzdExlbiAtIDE7IGkgPj0gMDsgLS1pKSBwcmVwYXJlZC5pbmRleGVzW2ldID0gbWF0Y2hlc0Jlc3RbaV1cclxuXHJcbiAgICAgICAgcmV0dXJuIHByZXBhcmVkXHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgYWxnb3JpdGhtTm9UeXBvOiBmdW5jdGlvbihzZWFyY2hMb3dlckNvZGVzLCBwcmVwYXJlZCwgc2VhcmNoTG93ZXJDb2RlKSB7XHJcbiAgICAgIHZhciB0YXJnZXRMb3dlckNvZGVzID0gcHJlcGFyZWQuX3RhcmdldExvd2VyQ29kZXNcclxuICAgICAgdmFyIHNlYXJjaExlbiA9IHNlYXJjaExvd2VyQ29kZXMubGVuZ3RoXHJcbiAgICAgIHZhciB0YXJnZXRMZW4gPSB0YXJnZXRMb3dlckNvZGVzLmxlbmd0aFxyXG4gICAgICB2YXIgc2VhcmNoSSA9IDAgLy8gd2hlcmUgd2UgYXRcclxuICAgICAgdmFyIHRhcmdldEkgPSAwIC8vIHdoZXJlIHlvdSBhdFxyXG4gICAgICB2YXIgbWF0Y2hlc1NpbXBsZUxlbiA9IDBcclxuXHJcbiAgICAgIC8vIHZlcnkgYmFzaWMgZnV6enkgbWF0Y2g7IHRvIHJlbW92ZSBub24tbWF0Y2hpbmcgdGFyZ2V0cyBBU0FQIVxyXG4gICAgICAvLyB3YWxrIHRocm91Z2ggdGFyZ2V0LiBmaW5kIHNlcXVlbnRpYWwgbWF0Y2hlcy5cclxuICAgICAgLy8gaWYgYWxsIGNoYXJzIGFyZW4ndCBmb3VuZCB0aGVuIGV4aXRcclxuICAgICAgZm9yKDs7KSB7XHJcbiAgICAgICAgdmFyIGlzTWF0Y2ggPSBzZWFyY2hMb3dlckNvZGUgPT09IHRhcmdldExvd2VyQ29kZXNbdGFyZ2V0SV1cclxuICAgICAgICBpZihpc01hdGNoKSB7XHJcbiAgICAgICAgICBtYXRjaGVzU2ltcGxlW21hdGNoZXNTaW1wbGVMZW4rK10gPSB0YXJnZXRJXHJcbiAgICAgICAgICArK3NlYXJjaEk7IGlmKHNlYXJjaEkgPT09IHNlYXJjaExlbikgYnJlYWtcclxuICAgICAgICAgIHNlYXJjaExvd2VyQ29kZSA9IHNlYXJjaExvd2VyQ29kZXNbc2VhcmNoSV1cclxuICAgICAgICB9XHJcbiAgICAgICAgKyt0YXJnZXRJOyBpZih0YXJnZXRJID49IHRhcmdldExlbikgcmV0dXJuIG51bGwgLy8gRmFpbGVkIHRvIGZpbmQgc2VhcmNoSVxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgc2VhcmNoSSA9IDBcclxuICAgICAgdmFyIHN1Y2Nlc3NTdHJpY3QgPSBmYWxzZVxyXG4gICAgICB2YXIgbWF0Y2hlc1N0cmljdExlbiA9IDBcclxuXHJcbiAgICAgIHZhciBuZXh0QmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVkLl9uZXh0QmVnaW5uaW5nSW5kZXhlc1xyXG4gICAgICBpZihuZXh0QmVnaW5uaW5nSW5kZXhlcyA9PT0gbnVsbCkgbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBwcmVwYXJlZC5fbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBmdXp6eXNvcnQucHJlcGFyZU5leHRCZWdpbm5pbmdJbmRleGVzKHByZXBhcmVkLnRhcmdldClcclxuICAgICAgdmFyIGZpcnN0UG9zc2libGVJID0gdGFyZ2V0SSA9IG1hdGNoZXNTaW1wbGVbMF09PT0wID8gMCA6IG5leHRCZWdpbm5pbmdJbmRleGVzW21hdGNoZXNTaW1wbGVbMF0tMV1cclxuXHJcbiAgICAgIC8vIE91ciB0YXJnZXQgc3RyaW5nIHN1Y2Nlc3NmdWxseSBtYXRjaGVkIGFsbCBjaGFyYWN0ZXJzIGluIHNlcXVlbmNlIVxyXG4gICAgICAvLyBMZXQncyB0cnkgYSBtb3JlIGFkdmFuY2VkIGFuZCBzdHJpY3QgdGVzdCB0byBpbXByb3ZlIHRoZSBzY29yZVxyXG4gICAgICAvLyBvbmx5IGNvdW50IGl0IGFzIGEgbWF0Y2ggaWYgaXQncyBjb25zZWN1dGl2ZSBvciBhIGJlZ2lubmluZyBjaGFyYWN0ZXIhXHJcbiAgICAgIGlmKHRhcmdldEkgIT09IHRhcmdldExlbikgZm9yKDs7KSB7XHJcbiAgICAgICAgaWYodGFyZ2V0SSA+PSB0YXJnZXRMZW4pIHtcclxuICAgICAgICAgIC8vIFdlIGZhaWxlZCB0byBmaW5kIGEgZ29vZCBzcG90IGZvciB0aGlzIHNlYXJjaCBjaGFyLCBnbyBiYWNrIHRvIHRoZSBwcmV2aW91cyBzZWFyY2ggY2hhciBhbmQgZm9yY2UgaXQgZm9yd2FyZFxyXG4gICAgICAgICAgaWYoc2VhcmNoSSA8PSAwKSBicmVhayAvLyBXZSBmYWlsZWQgdG8gcHVzaCBjaGFycyBmb3J3YXJkIGZvciBhIGJldHRlciBtYXRjaFxyXG5cclxuICAgICAgICAgIC0tc2VhcmNoSVxyXG4gICAgICAgICAgdmFyIGxhc3RNYXRjaCA9IG1hdGNoZXNTdHJpY3RbLS1tYXRjaGVzU3RyaWN0TGVuXVxyXG4gICAgICAgICAgdGFyZ2V0SSA9IG5leHRCZWdpbm5pbmdJbmRleGVzW2xhc3RNYXRjaF1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHZhciBpc01hdGNoID0gc2VhcmNoTG93ZXJDb2Rlc1tzZWFyY2hJXSA9PT0gdGFyZ2V0TG93ZXJDb2Rlc1t0YXJnZXRJXVxyXG4gICAgICAgICAgaWYoaXNNYXRjaCkge1xyXG4gICAgICAgICAgICBtYXRjaGVzU3RyaWN0W21hdGNoZXNTdHJpY3RMZW4rK10gPSB0YXJnZXRJXHJcbiAgICAgICAgICAgICsrc2VhcmNoSTsgaWYoc2VhcmNoSSA9PT0gc2VhcmNoTGVuKSB7IHN1Y2Nlc3NTdHJpY3QgPSB0cnVlOyBicmVhayB9XHJcbiAgICAgICAgICAgICsrdGFyZ2V0SVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGFyZ2V0SSA9IG5leHRCZWdpbm5pbmdJbmRleGVzW3RhcmdldEldXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB7IC8vIHRhbGx5IHVwIHRoZSBzY29yZSAmIGtlZXAgdHJhY2sgb2YgbWF0Y2hlcyBmb3IgaGlnaGxpZ2h0aW5nIGxhdGVyXHJcbiAgICAgICAgaWYoc3VjY2Vzc1N0cmljdCkgeyB2YXIgbWF0Y2hlc0Jlc3QgPSBtYXRjaGVzU3RyaWN0OyB2YXIgbWF0Y2hlc0Jlc3RMZW4gPSBtYXRjaGVzU3RyaWN0TGVuIH1cclxuICAgICAgICBlbHNlIHsgdmFyIG1hdGNoZXNCZXN0ID0gbWF0Y2hlc1NpbXBsZTsgdmFyIG1hdGNoZXNCZXN0TGVuID0gbWF0Y2hlc1NpbXBsZUxlbiB9XHJcbiAgICAgICAgdmFyIHNjb3JlID0gMFxyXG4gICAgICAgIHZhciBsYXN0VGFyZ2V0SSA9IC0xXHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHNlYXJjaExlbjsgKytpKSB7IHZhciB0YXJnZXRJID0gbWF0Y2hlc0Jlc3RbaV1cclxuICAgICAgICAgIC8vIHNjb3JlIG9ubHkgZ29lcyBkb3duIGlmIHRoZXkncmUgbm90IGNvbnNlY3V0aXZlXHJcbiAgICAgICAgICBpZihsYXN0VGFyZ2V0SSAhPT0gdGFyZ2V0SSAtIDEpIHNjb3JlIC09IHRhcmdldElcclxuICAgICAgICAgIGxhc3RUYXJnZXRJID0gdGFyZ2V0SVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZighc3VjY2Vzc1N0cmljdCkgc2NvcmUgKj0gMTAwMFxyXG4gICAgICAgIHNjb3JlIC09IHRhcmdldExlbiAtIHNlYXJjaExlblxyXG4gICAgICAgIHByZXBhcmVkLnNjb3JlID0gc2NvcmVcclxuICAgICAgICBwcmVwYXJlZC5pbmRleGVzID0gbmV3IEFycmF5KG1hdGNoZXNCZXN0TGVuKTsgZm9yKHZhciBpID0gbWF0Y2hlc0Jlc3RMZW4gLSAxOyBpID49IDA7IC0taSkgcHJlcGFyZWQuaW5kZXhlc1tpXSA9IG1hdGNoZXNCZXN0W2ldXHJcblxyXG4gICAgICAgIHJldHVybiBwcmVwYXJlZFxyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHByZXBhcmVMb3dlckNvZGVzOiBmdW5jdGlvbihzdHIpIHtcclxuICAgICAgdmFyIHN0ckxlbiA9IHN0ci5sZW5ndGhcclxuICAgICAgdmFyIGxvd2VyQ29kZXMgPSBbXSAvLyBuZXcgQXJyYXkoc3RyTGVuKSAgICBzcGFyc2UgYXJyYXkgaXMgdG9vIHNsb3dcclxuICAgICAgdmFyIGxvd2VyID0gc3RyLnRvTG93ZXJDYXNlKClcclxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHN0ckxlbjsgKytpKSBsb3dlckNvZGVzW2ldID0gbG93ZXIuY2hhckNvZGVBdChpKVxyXG4gICAgICByZXR1cm4gbG93ZXJDb2Rlc1xyXG4gICAgfSxcclxuICAgIHByZXBhcmVCZWdpbm5pbmdJbmRleGVzOiBmdW5jdGlvbih0YXJnZXQpIHtcclxuICAgICAgdmFyIHRhcmdldExlbiA9IHRhcmdldC5sZW5ndGhcclxuICAgICAgdmFyIGJlZ2lubmluZ0luZGV4ZXMgPSBbXTsgdmFyIGJlZ2lubmluZ0luZGV4ZXNMZW4gPSAwXHJcbiAgICAgIHZhciB3YXNVcHBlciA9IGZhbHNlXHJcbiAgICAgIHZhciB3YXNBbHBoYW51bSA9IGZhbHNlXHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRMZW47ICsraSkge1xyXG4gICAgICAgIHZhciB0YXJnZXRDb2RlID0gdGFyZ2V0LmNoYXJDb2RlQXQoaSlcclxuICAgICAgICB2YXIgaXNVcHBlciA9IHRhcmdldENvZGU+PTY1JiZ0YXJnZXRDb2RlPD05MFxyXG4gICAgICAgIHZhciBpc0FscGhhbnVtID0gaXNVcHBlciB8fCB0YXJnZXRDb2RlPj05NyYmdGFyZ2V0Q29kZTw9MTIyIHx8IHRhcmdldENvZGU+PTQ4JiZ0YXJnZXRDb2RlPD01N1xyXG4gICAgICAgIHZhciBpc0JlZ2lubmluZyA9IGlzVXBwZXIgJiYgIXdhc1VwcGVyIHx8ICF3YXNBbHBoYW51bSB8fCAhaXNBbHBoYW51bVxyXG4gICAgICAgIHdhc1VwcGVyID0gaXNVcHBlclxyXG4gICAgICAgIHdhc0FscGhhbnVtID0gaXNBbHBoYW51bVxyXG4gICAgICAgIGlmKGlzQmVnaW5uaW5nKSBiZWdpbm5pbmdJbmRleGVzW2JlZ2lubmluZ0luZGV4ZXNMZW4rK10gPSBpXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGJlZ2lubmluZ0luZGV4ZXNcclxuICAgIH0sXHJcbiAgICBwcmVwYXJlTmV4dEJlZ2lubmluZ0luZGV4ZXM6IGZ1bmN0aW9uKHRhcmdldCkge1xyXG4gICAgICB2YXIgdGFyZ2V0TGVuID0gdGFyZ2V0Lmxlbmd0aFxyXG4gICAgICB2YXIgYmVnaW5uaW5nSW5kZXhlcyA9IGZ1enp5c29ydC5wcmVwYXJlQmVnaW5uaW5nSW5kZXhlcyh0YXJnZXQpXHJcbiAgICAgIHZhciBuZXh0QmVnaW5uaW5nSW5kZXhlcyA9IFtdIC8vIG5ldyBBcnJheSh0YXJnZXRMZW4pICAgICBzcGFyc2UgYXJyYXkgaXMgdG9vIHNsb3dcclxuICAgICAgdmFyIGxhc3RJc0JlZ2lubmluZyA9IGJlZ2lubmluZ0luZGV4ZXNbMF1cclxuICAgICAgdmFyIGxhc3RJc0JlZ2lubmluZ0kgPSAwXHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRMZW47ICsraSkge1xyXG4gICAgICAgIGlmKGxhc3RJc0JlZ2lubmluZyA+IGkpIHtcclxuICAgICAgICAgIG5leHRCZWdpbm5pbmdJbmRleGVzW2ldID0gbGFzdElzQmVnaW5uaW5nXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxhc3RJc0JlZ2lubmluZyA9IGJlZ2lubmluZ0luZGV4ZXNbKytsYXN0SXNCZWdpbm5pbmdJXVxyXG4gICAgICAgICAgbmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0gPSBsYXN0SXNCZWdpbm5pbmc9PT11bmRlZmluZWQgPyB0YXJnZXRMZW4gOiBsYXN0SXNCZWdpbm5pbmdcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5leHRCZWdpbm5pbmdJbmRleGVzXHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFudXA6IGNsZWFudXAsXHJcbiAgICBuZXc6IGZ1enp5c29ydE5ldyxcclxuICB9XHJcbiAgcmV0dXJuIGZ1enp5c29ydFxyXG59IC8vIGZ1enp5c29ydE5ld1xyXG5cclxuLy8gVGhpcyBzdHVmZiBpcyBvdXRzaWRlIGZ1enp5c29ydE5ldywgYmVjYXVzZSBpdCdzIHNoYXJlZCB3aXRoIGluc3RhbmNlcyBvZiBmdXp6eXNvcnQubmV3KClcclxudmFyIGlzTm9kZSA9IHR5cGVvZiByZXF1aXJlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJ1xyXG4vLyB2YXIgTUFYX0lOVCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSXHJcbi8vIHZhciBNSU5fSU5UID0gTnVtYmVyLk1JTl9WQUxVRVxyXG52YXIgcHJlcGFyZWRDYWNoZSA9IG5ldyBNYXAoKVxyXG52YXIgcHJlcGFyZWRTZWFyY2hDYWNoZSA9IG5ldyBNYXAoKVxyXG52YXIgbm9SZXN1bHRzID0gW107IG5vUmVzdWx0cy50b3RhbCA9IDBcclxudmFyIG1hdGNoZXNTaW1wbGUgPSBbXTsgdmFyIG1hdGNoZXNTdHJpY3QgPSBbXVxyXG5mdW5jdGlvbiBjbGVhbnVwKCkgeyBwcmVwYXJlZENhY2hlLmNsZWFyKCk7IHByZXBhcmVkU2VhcmNoQ2FjaGUuY2xlYXIoKTsgbWF0Y2hlc1NpbXBsZSA9IFtdOyBtYXRjaGVzU3RyaWN0ID0gW10gfVxyXG5mdW5jdGlvbiBkZWZhdWx0U2NvcmVGbihhKSB7XHJcbiAgdmFyIG1heCA9IC05MDA3MTk5MjU0NzQwOTkxXHJcbiAgZm9yICh2YXIgaSA9IGEubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcclxuICAgIHZhciByZXN1bHQgPSBhW2ldOyBpZihyZXN1bHQgPT09IG51bGwpIGNvbnRpbnVlXHJcbiAgICB2YXIgc2NvcmUgPSByZXN1bHQuc2NvcmVcclxuICAgIGlmKHNjb3JlID4gbWF4KSBtYXggPSBzY29yZVxyXG4gIH1cclxuICBpZihtYXggPT09IC05MDA3MTk5MjU0NzQwOTkxKSByZXR1cm4gbnVsbFxyXG4gIHJldHVybiBtYXhcclxufVxyXG5cclxuLy8gcHJvcCA9ICdrZXknICAgICAgICAgICAgICAyLjVtcyBvcHRpbWl6ZWQgZm9yIHRoaXMgY2FzZSwgc2VlbXMgdG8gYmUgYWJvdXQgYXMgZmFzdCBhcyBkaXJlY3Qgb2JqW3Byb3BdXHJcbi8vIHByb3AgPSAna2V5MS5rZXkyJyAgICAgICAgMTBtc1xyXG4vLyBwcm9wID0gWydrZXkxJywgJ2tleTInXSAgIDI3bXNcclxuZnVuY3Rpb24gZ2V0VmFsdWUob2JqLCBwcm9wKSB7XHJcbiAgdmFyIHRtcCA9IG9ialtwcm9wXTsgaWYodG1wICE9PSB1bmRlZmluZWQpIHJldHVybiB0bXBcclxuICB2YXIgc2VncyA9IHByb3BcclxuICBpZighQXJyYXkuaXNBcnJheShwcm9wKSkgc2VncyA9IHByb3Auc3BsaXQoJy4nKVxyXG4gIHZhciBsZW4gPSBzZWdzLmxlbmd0aFxyXG4gIHZhciBpID0gLTFcclxuICB3aGlsZSAob2JqICYmICgrK2kgPCBsZW4pKSBvYmogPSBvYmpbc2Vnc1tpXV1cclxuICByZXR1cm4gb2JqXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzT2JqKHgpIHsgcmV0dXJuIHR5cGVvZiB4ID09PSAnb2JqZWN0JyB9IC8vIGZhc3RlciBhcyBhIGZ1bmN0aW9uXHJcblxyXG4vLyBIYWNrZWQgdmVyc2lvbiBvZiBodHRwczovL2dpdGh1Yi5jb20vbGVtaXJlL0Zhc3RQcmlvcml0eVF1ZXVlLmpzXHJcbnZhciBmYXN0cHJpb3JpdHlxdWV1ZT1mdW5jdGlvbigpe3ZhciByPVtdLG89MCxlPXt9O2Z1bmN0aW9uIG4oKXtmb3IodmFyIGU9MCxuPXJbZV0sYz0xO2M8bzspe3ZhciBmPWMrMTtlPWMsZjxvJiZyW2ZdLnNjb3JlPHJbY10uc2NvcmUmJihlPWYpLHJbZS0xPj4xXT1yW2VdLGM9MSsoZTw8MSl9Zm9yKHZhciBhPWUtMT4+MTtlPjAmJm4uc2NvcmU8clthXS5zY29yZTthPShlPWEpLTE+PjEpcltlXT1yW2FdO3JbZV09bn1yZXR1cm4gZS5hZGQ9ZnVuY3Rpb24oZSl7dmFyIG49bztyW28rK109ZTtmb3IodmFyIGM9bi0xPj4xO24+MCYmZS5zY29yZTxyW2NdLnNjb3JlO2M9KG49YyktMT4+MSlyW25dPXJbY107cltuXT1lfSxlLnBvbGw9ZnVuY3Rpb24oKXtpZigwIT09byl7dmFyIGU9clswXTtyZXR1cm4gclswXT1yWy0tb10sbigpLGV9fSxlLnBlZWs9ZnVuY3Rpb24oZSl7aWYoMCE9PW8pcmV0dXJuIHJbMF19LGUucmVwbGFjZVRvcD1mdW5jdGlvbihvKXtyWzBdPW8sbigpfSxlfTtcclxudmFyIHEgPSBmYXN0cHJpb3JpdHlxdWV1ZSgpIC8vIHJldXNlIHRoaXMsIGV4Y2VwdCBmb3IgYXN5bmMsIGl0IG5lZWRzIHRvIG1ha2UgaXRzIG93blxyXG5cclxucmV0dXJuIGZ1enp5c29ydE5ldygpXHJcbn0pIC8vIFVNRFxyXG5cclxuLy8gVE9ETzogKHBlcmZvcm1hbmNlKSB3YXNtIHZlcnNpb24hP1xyXG5cclxuLy8gVE9ETzogKHBlcmZvcm1hbmNlKSBsYXlvdXQgbWVtb3J5IGluIGFuIG9wdGltYWwgd2F5IHRvIGdvIGZhc3QgYnkgYXZvaWRpbmcgY2FjaGUgbWlzc2VzXHJcblxyXG4vLyBUT0RPOiAocGVyZm9ybWFuY2UpIHByZXBhcmVkQ2FjaGUgaXMgYSBtZW1vcnkgbGVha1xyXG5cclxuLy8gVE9ETzogKGxpa2Ugc3VibGltZSkgYmFja3NsYXNoID09PSBmb3J3YXJkc2xhc2hcclxuXHJcbi8vIFRPRE86IChwZXJmb3JtYW5jZSkgaSBoYXZlIG5vIGlkZWEgaG93IHdlbGwgb3B0aXptaWVkIHRoZSBhbGxvd2luZyB0eXBvcyBhbGdvcml0aG0gaXNcclxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsInZhciBuZXh0VGljayA9IHJlcXVpcmUoJ3Byb2Nlc3MvYnJvd3Nlci5qcycpLm5leHRUaWNrO1xudmFyIGFwcGx5ID0gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5O1xudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGltbWVkaWF0ZUlkcyA9IHt9O1xudmFyIG5leHRJbW1lZGlhdGVJZCA9IDA7XG5cbi8vIERPTSBBUElzLCBmb3IgY29tcGxldGVuZXNzXG5cbmV4cG9ydHMuc2V0VGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRUaW1lb3V0LCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFyVGltZW91dCk7XG59O1xuZXhwb3J0cy5zZXRJbnRlcnZhbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRJbnRlcnZhbCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhckludGVydmFsKTtcbn07XG5leHBvcnRzLmNsZWFyVGltZW91dCA9XG5leHBvcnRzLmNsZWFySW50ZXJ2YWwgPSBmdW5jdGlvbih0aW1lb3V0KSB7IHRpbWVvdXQuY2xvc2UoKTsgfTtcblxuZnVuY3Rpb24gVGltZW91dChpZCwgY2xlYXJGbikge1xuICB0aGlzLl9pZCA9IGlkO1xuICB0aGlzLl9jbGVhckZuID0gY2xlYXJGbjtcbn1cblRpbWVvdXQucHJvdG90eXBlLnVucmVmID0gVGltZW91dC5wcm90b3R5cGUucmVmID0gZnVuY3Rpb24oKSB7fTtcblRpbWVvdXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2NsZWFyRm4uY2FsbCh3aW5kb3csIHRoaXMuX2lkKTtcbn07XG5cbi8vIERvZXMgbm90IHN0YXJ0IHRoZSB0aW1lLCBqdXN0IHNldHMgdXAgdGhlIG1lbWJlcnMgbmVlZGVkLlxuZXhwb3J0cy5lbnJvbGwgPSBmdW5jdGlvbihpdGVtLCBtc2Vjcykge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gbXNlY3M7XG59O1xuXG5leHBvcnRzLnVuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gLTE7XG59O1xuXG5leHBvcnRzLl91bnJlZkFjdGl2ZSA9IGV4cG9ydHMuYWN0aXZlID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG5cbiAgdmFyIG1zZWNzID0gaXRlbS5faWRsZVRpbWVvdXQ7XG4gIGlmIChtc2VjcyA+PSAwKSB7XG4gICAgaXRlbS5faWRsZVRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gb25UaW1lb3V0KCkge1xuICAgICAgaWYgKGl0ZW0uX29uVGltZW91dClcbiAgICAgICAgaXRlbS5fb25UaW1lb3V0KCk7XG4gICAgfSwgbXNlY3MpO1xuICB9XG59O1xuXG4vLyBUaGF0J3Mgbm90IGhvdyBub2RlLmpzIGltcGxlbWVudHMgaXQgYnV0IHRoZSBleHBvc2VkIGFwaSBpcyB0aGUgc2FtZS5cbmV4cG9ydHMuc2V0SW1tZWRpYXRlID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gc2V0SW1tZWRpYXRlIDogZnVuY3Rpb24oZm4pIHtcbiAgdmFyIGlkID0gbmV4dEltbWVkaWF0ZUlkKys7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aCA8IDIgPyBmYWxzZSA6IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICBpbW1lZGlhdGVJZHNbaWRdID0gdHJ1ZTtcblxuICBuZXh0VGljayhmdW5jdGlvbiBvbk5leHRUaWNrKCkge1xuICAgIGlmIChpbW1lZGlhdGVJZHNbaWRdKSB7XG4gICAgICAvLyBmbi5jYWxsKCkgaXMgZmFzdGVyIHNvIHdlIG9wdGltaXplIGZvciB0aGUgY29tbW9uIHVzZS1jYXNlXG4gICAgICAvLyBAc2VlIGh0dHA6Ly9qc3BlcmYuY29tL2NhbGwtYXBwbHktc2VndVxuICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbi5jYWxsKG51bGwpO1xuICAgICAgfVxuICAgICAgLy8gUHJldmVudCBpZHMgZnJvbSBsZWFraW5nXG4gICAgICBleHBvcnRzLmNsZWFySW1tZWRpYXRlKGlkKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBpZDtcbn07XG5cbmV4cG9ydHMuY2xlYXJJbW1lZGlhdGUgPSB0eXBlb2YgY2xlYXJJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IGNsZWFySW1tZWRpYXRlIDogZnVuY3Rpb24oaWQpIHtcbiAgZGVsZXRlIGltbWVkaWF0ZUlkc1tpZF07XG59OyIsIi8qIGdsb2JhbCBHaG9zdENvbnRlbnRBUEkgbG9jYXRpb24gKi9cblxuLyoqXG4gKiBUaGFua3MgPT4gaHR0cHM6Ly9naXRodWIuY29tL0hhdW50ZWRUaGVtZXMvZ2hvc3Qtc2VhcmNoXG4gKi9cblxuLy8gaW1wb3J0IGZ1enp5c29ydCBmcm9tICdmdXp6eXNvcnQnXG5jb25zdCBmdXp6eXNvcnQgPSByZXF1aXJlKCdmdXp6eXNvcnQnKVxuXG5jbGFzcyBHaG9zdFNlYXJjaCB7XG4gIGNvbnN0cnVjdG9yIChhcmdzKSB7XG4gICAgdGhpcy5jaGVjayA9IGZhbHNlXG5cbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcbiAgICAgIHVybDogJycsXG4gICAgICBrZXk6ICcnLFxuICAgICAgdmVyc2lvbjogJ3YyJyxcbiAgICAgIGlucHV0OiAnI2dob3N0LXNlYXJjaC1maWVsZCcsXG4gICAgICByZXN1bHRzOiAnI2dob3N0LXNlYXJjaC1yZXN1bHRzJyxcbiAgICAgIGJ1dHRvbjogJycsXG4gICAgICBkZWZhdWx0VmFsdWU6ICcnLFxuICAgICAgdGVtcGxhdGU6IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgbGV0IHNpdGV1cmwgPSBbbG9jYXRpb24ucHJvdG9jb2wsICcvLycsIGxvY2F0aW9uLmhvc3RdLmpvaW4oJycpXG4gICAgICAgIC8vIHJldHVybiAnPGEgaHJlZj1cIicgKyBzaXRldXJsICsgJy8nICsgcmVzdWx0LnNsdWcgKyAnL1wiPicgKyByZXN1bHQudGl0bGUgKyAnPC9hPidcbiAgICAgICAgcmV0dXJuIGA8YSBocmVmPVwiJHtzaXRldXJsfS8ke3Jlc3VsdC5zbHVnfS9cIj4ke3Jlc3VsdC50aXRsZX08L2E+YFxuICAgICAgfSxcbiAgICAgIHRyaWdnZXI6ICdmb2N1cycsXG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIGtleXM6IFtcbiAgICAgICAgICAndGl0bGUnXG4gICAgICAgIF0sXG4gICAgICAgIGxpbWl0OiAxMCxcbiAgICAgICAgdGhyZXNob2xkOiAtMzUwMCxcbiAgICAgICAgYWxsb3dUeXBvOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIGFwaToge1xuICAgICAgICByZXNvdXJjZTogJ3Bvc3RzJyxcbiAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgIGxpbWl0OiAnYWxsJyxcbiAgICAgICAgICBmaWVsZHM6IFsndGl0bGUnLCAnc2x1ZyddLFxuICAgICAgICAgIGZpbHRlcjogJycsXG4gICAgICAgICAgaW5jbHVkZTogJycsXG4gICAgICAgICAgb3JkZXI6ICcnLFxuICAgICAgICAgIGZvcm1hdHM6ICcnLFxuICAgICAgICAgIHBhZ2U6ICcnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbjoge1xuICAgICAgICBiZWZvcmVEaXNwbGF5OiBmdW5jdGlvbiAoKSB7IH0sXG4gICAgICAgIGFmdGVyRGlzcGxheTogZnVuY3Rpb24gKHJlc3VsdHMpIHsgfSwgLy9lc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIGJlZm9yZUZldGNoOiBmdW5jdGlvbiAoKSB7IH0sXG4gICAgICAgIGFmdGVyRmV0Y2g6IGZ1bmN0aW9uIChyZXN1bHRzKSB7IH0sIC8vZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IG1lcmdlZCA9IHRoaXMubWVyZ2VEZWVwKGRlZmF1bHRzLCBhcmdzKVxuICAgIE9iamVjdC5hc3NpZ24odGhpcywgbWVyZ2VkKVxuICAgIHRoaXMuaW5pdCgpXG4gIH1cblxuICBtZXJnZURlZXAgKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKCh0YXJnZXQgJiYgdHlwZW9mIHRhcmdldCA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodGFyZ2V0KSAmJiB0YXJnZXQgIT09IG51bGwpICYmIChzb3VyY2UgJiYgdHlwZW9mIHNvdXJjZSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoc291cmNlKSAmJiBzb3VyY2UgIT09IG51bGwpKSB7XG4gICAgICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgaWYgKHNvdXJjZVtrZXldICYmIHR5cGVvZiBzb3VyY2Vba2V5XSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoc291cmNlW2tleV0pICYmIHNvdXJjZVtrZXldICE9PSBudWxsKSB7XG4gICAgICAgICAgaWYgKCF0YXJnZXRba2V5XSkgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHsgW2tleV06IHt9IH0pXG4gICAgICAgICAgdGhpcy5tZXJnZURlZXAodGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24odGFyZ2V0LCB7IFtrZXldOiBzb3VyY2Vba2V5XSB9KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0XG4gIH1cblxuICBmZXRjaCAoKSB7XG4gICAgdGhpcy5vbi5iZWZvcmVGZXRjaCgpXG5cbiAgICBsZXQgZ2hvc3RBUEkgPSBuZXcgR2hvc3RDb250ZW50QVBJKHtcbiAgICAgIHVybDogdGhpcy51cmwsXG4gICAgICBrZXk6IHRoaXMua2V5LFxuICAgICAgdmVyc2lvbjogdGhpcy52ZXJzaW9uXG4gICAgfSlcblxuICAgIGxldCBicm93c2UgPSB7fVxuICAgIGxldCBwYXJhbWV0ZXJzID0gdGhpcy5hcGkucGFyYW1ldGVyc1xuXG4gICAgZm9yICh2YXIga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICAgIGlmIChwYXJhbWV0ZXJzW2tleV0gIT09ICcnKSB7XG4gICAgICAgIGJyb3dzZVtrZXldID0gcGFyYW1ldGVyc1trZXldXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYnJvd3NlLmxpbWl0ID0gJ2FsbCdcblxuICAgIGdob3N0QVBJW3RoaXMuYXBpLnJlc291cmNlXVxuICAgICAgLmJyb3dzZShicm93c2UpXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICB0aGlzLnNlYXJjaChkYXRhKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxuICAgICAgfSlcbiAgfVxuXG4gIGNyZWF0ZUVsZW1lbnRGcm9tSFRNTCAoaHRtbFN0cmluZykge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRpdi5pbm5lckhUTUwgPSBodG1sU3RyaW5nLnRyaW0oKVxuICAgIHJldHVybiBkaXYuZmlyc3RDaGlsZFxuICB9XG5cbiAgZGlzcGxheVJlc3VsdHMgKGRhdGEpIHtcbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnJlc3VsdHMpWzBdLmZpcnN0Q2hpbGQgIT09IG51bGwgJiYgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnJlc3VsdHMpWzBdLmZpcnN0Q2hpbGQgIT09ICcnKSB7XG4gICAgICB3aGlsZSAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnJlc3VsdHMpWzBdLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnJlc3VsdHMpWzBdLnJlbW92ZUNoaWxkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5yZXN1bHRzKVswXS5maXJzdENoaWxkKVxuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBpbnB1dFZhbHVlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLmlucHV0KVswXS52YWx1ZVxuICAgIGlmICh0aGlzLmRlZmF1bHRWYWx1ZSAhPT0gJycpIHtcbiAgICAgIGlucHV0VmFsdWUgPSB0aGlzLmRlZmF1bHRWYWx1ZVxuICAgIH1cbiAgICBjb25zdCByZXN1bHRzID0gZnV6enlzb3J0LmdvKGlucHV0VmFsdWUsIGRhdGEsIHtcbiAgICAgIGtleXM6IHRoaXMub3B0aW9ucy5rZXlzLFxuICAgICAgbGltaXQ6IHRoaXMub3B0aW9ucy5saW1pdCxcbiAgICAgIGFsbG93VHlwbzogdGhpcy5vcHRpb25zLmFsbG93VHlwbyxcbiAgICAgIHRocmVzaG9sZDogdGhpcy5vcHRpb25zLnRocmVzaG9sZFxuICAgIH0pXG4gICAgZm9yIChsZXQga2V5IGluIHJlc3VsdHMpIHtcbiAgICAgIGlmIChrZXkgPCByZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMucmVzdWx0cylbMF0uYXBwZW5kQ2hpbGQodGhpcy5jcmVhdGVFbGVtZW50RnJvbUhUTUwodGhpcy50ZW1wbGF0ZShyZXN1bHRzW2tleV0ub2JqKSkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vbi5hZnRlckRpc3BsYXkocmVzdWx0cylcbiAgICB0aGlzLmRlZmF1bHRWYWx1ZSA9ICcnXG4gIH1cblxuICBzZWFyY2ggKGRhdGEpIHtcbiAgICB0aGlzLm9uLmFmdGVyRmV0Y2goZGF0YSlcbiAgICB0aGlzLmNoZWNrID0gdHJ1ZVxuXG4gICAgaWYgKHRoaXMuZGVmYXVsdFZhbHVlICE9PSAnJykge1xuICAgICAgdGhpcy5vbi5iZWZvcmVEaXNwbGF5KClcbiAgICAgIHRoaXMuZGlzcGxheVJlc3VsdHMoZGF0YSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5idXR0b24gIT09ICcnKSB7XG4gICAgICBsZXQgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLmJ1dHRvbilbMF1cbiAgICAgIGlmIChidXR0b24udGFnTmFtZSA9PT0gJ0lOUFVUJyAmJiBidXR0b24udHlwZSA9PT0gJ3N1Ym1pdCcpIHtcbiAgICAgICAgYnV0dG9uLmNsb3Nlc3QoJ2Zvcm0nKS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBlID0+IHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgdGhpcy5vbi5iZWZvcmVEaXNwbGF5KClcbiAgICAgICAgdGhpcy5kaXNwbGF5UmVzdWx0cyhkYXRhKVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLmlucHV0KVswXS5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsICgpID0+IHtcbiAgICAgICAgdGhpcy5vbi5iZWZvcmVEaXNwbGF5KClcbiAgICAgICAgdGhpcy5kaXNwbGF5UmVzdWx0cyhkYXRhKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBjaGVja0FyZ3MgKCkge1xuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLmlucHV0KS5sZW5ndGgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdJbnB1dCBub3QgZm91bmQuJylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5yZXN1bHRzKS5sZW5ndGgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdSZXN1bHRzIG5vdCBmb3VuZC4nKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGlmICh0aGlzLmJ1dHRvbiAhPT0gJycpIHtcbiAgICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLmJ1dHRvbikubGVuZ3RoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdCdXR0b24gbm90IGZvdW5kLicpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy51cmwgPT09ICcnKSB7XG4gICAgICBjb25zb2xlLmxvZygnQ29udGVudCBBUEkgQ2xpZW50IExpYnJhcnkgdXJsIG1pc3NpbmcuIFBsZWFzZSBzZXQgdGhlIHVybC4gTXVzdCBub3QgZW5kIGluIGEgdHJhaWxpbmcgc2xhc2guJylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAodGhpcy5rZXkgPT09ICcnKSB7XG4gICAgICBjb25zb2xlLmxvZygnQ29udGVudCBBUEkgQ2xpZW50IExpYnJhcnkga2V5IG1pc3NpbmcuIFBsZWFzZSBzZXQgdGhlIGtleS4gSGV4IHN0cmluZyBjb3BpZWQgZnJvbSB0aGUgXCJJbnRlZ3JhdGlvbnNcIiBzY3JlZW4gaW4gR2hvc3QgQWRtaW4uJylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgdmFsaWRhdGUgKCkge1xuICAgIGlmICghdGhpcy5jaGVja0FyZ3MoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGluaXQgKCkge1xuICAgIGlmICghdGhpcy52YWxpZGF0ZSgpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodGhpcy5kZWZhdWx0VmFsdWUgIT09ICcnKSB7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuaW5wdXQpWzBdLnZhbHVlID0gdGhpcy5kZWZhdWx0VmFsdWVcbiAgICAgIHdpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5jaGVjaykge1xuICAgICAgICAgIHRoaXMuZmV0Y2goKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudHJpZ2dlciA9PT0gJ2ZvY3VzJykge1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLmlucHV0KVswXS5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmNoZWNrKSB7XG4gICAgICAgICAgdGhpcy5mZXRjaCgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSBlbHNlIGlmICh0aGlzLnRyaWdnZXIgPT09ICdsb2FkJykge1xuICAgICAgd2luZG93Lm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmNoZWNrKSB7XG4gICAgICAgICAgdGhpcy5mZXRjaCgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyogRXhwb3J0IENsYXNzICovXG5tb2R1bGUuZXhwb3J0cyA9IEdob3N0U2VhcmNoXG4iLCIvKiBnbG9iYWwgc2VhcmNoS2V5ICovXG5pbXBvcnQgR2hvc3RTZWFyY2ggZnJvbSAnLi9hcHAvYXBwLnNlYXJjaCdcbi8vIGltcG9ydCB7IGxvYWRTY3JpcHQgfSBmcm9tICcuL2FwcC9hcHAubG9hZC1zdHlsZS1zY3JpcHQnXG5cbigod2luZG93LCBkb2N1bWVudCkgPT4ge1xuICAvLyBBcGlLZXkgU2VhcmNoXG4gIC8vIGlmICh0eXBlb2Ygc2VhcmNoS2V5ID09PSAndW5kZWZpbmVkJyB8fCBzZWFyY2hLZXkgPT09ICcnKSByZXR1cm5cblxuICBjb25zdCBxcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IuYmluZChkb2N1bWVudClcbiAgY29uc3QgcXNhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbC5iaW5kKGRvY3VtZW50KVxuXG4gIGNvbnN0IHNlYXJjaElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaC1maWVsZCcpXG4gIGNvbnN0IHNlYXJjaFJlc3VsdHMgPSBxcygnI3NlYXJjaFJlc3VsdHMnKVxuICBjb25zdCBzZWFyY2hNZXNzYWdlID0gcXMoJy5qcy1zZWFyY2gtbWVzc2FnZScpXG5cbiAgbGV0IHNlYXJjaFJlc3VsdHNIZWlnaHQgPSB7XG4gICAgb3V0ZXI6IDAsXG4gICAgc2Nyb2xsOiAwXG4gIH1cblxuICAvLyBMb2FkIEdob3N0IEFwaVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBsb2FkU2NyaXB0KCdodHRwczovL3VucGtnLmNvbS9AdHJ5Z2hvc3QvY29udGVudC1hcGlAMS4yLjUvdW1kL2NvbnRlbnQtYXBpLm1pbi5qcycpXG5cbiAgLy8gVmFyaWFibGUgZm9yIHNlYXJjaFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdCBteVNlYXJjaFNldHRpbmdzID0ge1xuICAgIHVybDogd2luZG93LmxvY2F0aW9uLm9yaWdpbixcbiAgICAvLyB1cmw6ICdodHRwOi8vbG9jYWxob3N0OjIzNjgnLFxuICAgIGtleTogc2VhcmNoS2V5LFxuICAgIGlucHV0OiAnI3NlYXJjaC1maWVsZCcsXG4gICAgcmVzdWx0czogJyNzZWFyY2hSZXN1bHRzJyxcbiAgICBvbjoge1xuICAgICAgYWZ0ZXJEaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgIHNlYXJjaFJlc3VsdEFjdGl2ZSgpXG4gICAgICAgIHNlYXJjaFJlc3VsdHNIZWlnaHQgPSB7XG4gICAgICAgICAgb3V0ZXI6IHNlYXJjaFJlc3VsdHMub2Zmc2V0SGVpZ2h0LFxuICAgICAgICAgIHNjcm9sbDogc2VhcmNoUmVzdWx0cy5zY3JvbGxIZWlnaHRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHdoZW4gdGhlIEVudGVyIGtleSBpcyBwcmVzc2VkXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGZ1bmN0aW9uIGVudGVyS2V5ICgpIHtcbiAgICBjb25zdCBsaW5rID0gc2VhcmNoUmVzdWx0cy5xdWVyeVNlbGVjdG9yKCdhLnNlYXJjaC1yZXN1bHQtLWFjdGl2ZScpXG4gICAgbGluayAmJiBsaW5rLmNsaWNrKClcbiAgfVxuXG4gIC8vIEF0dGVuZGluZyB0aGUgYWN0aXZlIGNsYXNzIHRvIHRoZSBzZWFyY2ggbGlua1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBmdW5jdGlvbiBzZWFyY2hSZXN1bHRBY3RpdmUgKHQsIGUpIHtcbiAgICB0ID0gdCB8fCAwXG4gICAgZSA9IGUgfHwgJ3VwJ1xuXG4gICAgLy8gaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4KSByZXR1cm5cblxuICAgIGNvbnN0IHNlYXJjaExJbmsgPSBzZWFyY2hSZXN1bHRzLnF1ZXJ5U2VsZWN0b3JBbGwoJ2EnKVxuXG4gICAgaWYgKCFzZWFyY2hMSW5rLmxlbmd0aCkge1xuICAgICAgc2VhcmNoSW5wdXQudmFsdWUubGVuZ3RoICYmIHNlYXJjaE1lc3NhZ2UuY2xhc3NMaXN0LnJlbW92ZSgndS1oaWRlJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHNlYXJjaE1lc3NhZ2UuY2xhc3NMaXN0LmFkZCgndS1oaWRlJylcblxuICAgIGNvbnN0IHNlYXJjaExpbmtBY3RpdmUgPSBzZWFyY2hSZXN1bHRzLnF1ZXJ5U2VsZWN0b3IoJ2Euc2VhcmNoLXJlc3VsdC0tYWN0aXZlJylcbiAgICBzZWFyY2hMaW5rQWN0aXZlICYmIHNlYXJjaExpbmtBY3RpdmUuY2xhc3NMaXN0LnJlbW92ZSgnc2VhcmNoLXJlc3VsdC0tYWN0aXZlJylcblxuICAgIHNlYXJjaExJbmtbdF0uY2xhc3NMaXN0LmFkZCgnc2VhcmNoLXJlc3VsdC0tYWN0aXZlJylcblxuICAgIGxldCBuID0gc2VhcmNoTElua1t0XS5vZmZzZXRUb3BcbiAgICBsZXQgbyA9IDBcblxuICAgIGUgPT09ICdkb3duJyAmJiBuID4gc2VhcmNoUmVzdWx0c0hlaWdodC5vdXRlciAvIDIgPyBvID0gbiAtIHNlYXJjaFJlc3VsdHNIZWlnaHQub3V0ZXIgLyAyIDogZSA9PT0gJ3VwJyAmJiAobyA9IG4gPCBzZWFyY2hSZXN1bHRzSGVpZ2h0LnNjcm9sbCAtIHNlYXJjaFJlc3VsdHNIZWlnaHQub3V0ZXIgLyAyID8gbiAtIHNlYXJjaFJlc3VsdHNIZWlnaHQub3V0ZXIgLyAyIDogc2VhcmNoUmVzdWx0c0hlaWdodC5zY3JvbGwpXG5cbiAgICBzZWFyY2hSZXN1bHRzLnNjcm9sbFRvKDAsIG8pXG4gIH1cblxuICAvLyBDbGVhciBJbnB1dCBmb3Igd3JpdGUgbmV3IGxldHRlcnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZnVuY3Rpb24gY2xlYXJJbnB1dCAoKSB7XG4gICAgc2VhcmNoSW5wdXQuZm9jdXMoKVxuICAgIHNlYXJjaElucHV0LnNldFNlbGVjdGlvblJhbmdlKDAsIHNlYXJjaElucHV0LnZhbHVlLmxlbmd0aClcbiAgfVxuXG4gIC8vIFNlYXJjaCBjbG9zZSB3aXRoIEtleVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBmdW5jdGlvbiBzZWFyY2hDbG9zZSAoKSB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtc2VhcmNoJylcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIG15U2VhcmNoS2V5KVxuICB9XG5cbiAgLy8gUmVhY3RlZCB0byB0aGUgdXAgb3IgZG93biBrZXlzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGZ1bmN0aW9uIGFycm93S2V5VXBEb3duIChrZXlOdW1iZXIpIHtcbiAgICBsZXQgZVxuICAgIGxldCBpbmRleFRoZUxpbmsgPSAwXG5cbiAgICBjb25zdCByZXN1bHRBY3RpdmUgPSBzZWFyY2hSZXN1bHRzLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZWFyY2gtcmVzdWx0LS1hY3RpdmUnKVswXVxuICAgIGlmIChyZXN1bHRBY3RpdmUpIHtcbiAgICAgIGluZGV4VGhlTGluayA9IFtdLnNsaWNlLmNhbGwocmVzdWx0QWN0aXZlLnBhcmVudE5vZGUuY2hpbGRyZW4pLmluZGV4T2YocmVzdWx0QWN0aXZlKVxuICAgIH1cblxuICAgIHNlYXJjaElucHV0LmJsdXIoKVxuXG4gICAgaWYgKGtleU51bWJlciA9PT0gMzgpIHtcbiAgICAgIGUgPSAndXAnXG4gICAgICBpZiAoaW5kZXhUaGVMaW5rIDw9IDApIHtcbiAgICAgICAgc2VhcmNoSW5wdXQuZm9jdXMoKVxuICAgICAgICBpbmRleFRoZUxpbmsgPSAwXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleFRoZUxpbmsgLT0gMVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlID0gJ2Rvd24nXG4gICAgICBpZiAoaW5kZXhUaGVMaW5rID49IHNlYXJjaFJlc3VsdHMucXVlcnlTZWxlY3RvckFsbCgnYScpLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgaW5kZXhUaGVMaW5rID0gc2VhcmNoUmVzdWx0cy5xdWVyeVNlbGVjdG9yQWxsKCdhJykubGVuZ3RoIC0gMVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5kZXhUaGVMaW5rID0gaW5kZXhUaGVMaW5rICsgMVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlYXJjaFJlc3VsdEFjdGl2ZShpbmRleFRoZUxpbmssIGUpXG4gIH1cblxuICAvLyBBZGRpbmcgZnVuY3Rpb25zIHRvIHRoZSBrZXlzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGZ1bmN0aW9uIG15U2VhcmNoS2V5IChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICBsZXQga2V5TnVtYmVyID0gZS5rZXlDb2RlXG5cbiAgICAvKipcbiAgICAgICogMzggPT4gVG9wIC8gQXJyaWJhXG4gICAgICAqIDQwID0+IGRvd24gLyBhYmFqb1xuICAgICAgKiAyNyA9PiBlc2NhcGVcbiAgICAgICogMTMgPT4gZW50ZXJcbiAgICAgICogMTkxID0+IC9cbiAgICAgICoqL1xuXG4gICAgaWYgKGtleU51bWJlciA9PT0gMjcpIHtcbiAgICAgIHNlYXJjaENsb3NlKClcbiAgICB9IGVsc2UgaWYgKGtleU51bWJlciA9PT0gMTMpIHtcbiAgICAgIHNlYXJjaElucHV0LmJsdXIoKVxuICAgICAgZW50ZXJLZXkoKVxuICAgIH0gZWxzZSBpZiAoa2V5TnVtYmVyID09PSAzOCB8fCBrZXlOdW1iZXIgPT09IDQwKSB7XG4gICAgICBhcnJvd0tleVVwRG93bihrZXlOdW1iZXIpXG4gICAgfSBlbHNlIGlmIChrZXlOdW1iZXIgPT09IDE5MSkge1xuICAgICAgY2xlYXJJbnB1dCgpXG4gICAgfVxuICB9XG5cbiAgLy8gT3BlbiBTZWFyY2hcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcXNhKCcuanMtb3Blbi1zZWFyY2gnKS5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIHNlYXJjaElucHV0LmZvY3VzKClcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2hhcy1zZWFyY2gnKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgbXlTZWFyY2hLZXkpXG4gIH0pKVxuXG4gIC8vIENsb3NlIFNlYXJjaFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBxc2EoJy5qcy1jbG9zZS1zZWFyY2gnKS5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnaGFzLXNlYXJjaCcpXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBteVNlYXJjaEtleSlcbiAgfSkpXG5cbiAgLy8gU2VhcmNoXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLW5ldyAqL1xuICBuZXcgR2hvc3RTZWFyY2gobXlTZWFyY2hTZXR0aW5ncylcbn0pKHdpbmRvdywgZG9jdW1lbnQpXG4iXX0=

//# sourceMappingURL=map/search.js.map
