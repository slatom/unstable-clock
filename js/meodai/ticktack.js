'use strict';

(function (root, factory) {
  // optional AMD https://github.com/umdjs/umd/blob/master/amdWeb.js
  if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define(['requestAnimationFrame'], factory);
  } else {
      // Browser globals
      root.ticktack = factory();
  }
}(this, function () {
  var callbacks, registeredCallbacks, tick, getTimeObject, runCallbacks,
      timeObject, runCallback, initLoop, setTimeObject, capitalize,

  // constants
      units;

  // Initializing callback objects
  callbacks = {};
  registeredCallbacks = [];


  /**
   * capitalize the fist letter of a string
   * @param   {string} string
   * @returns {string}        capitalized string
   */
  capitalize = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  /**
   * runCallbacks : loops callbacks and calls them
   * @param   {Object} obj object produced by getTimeObject, will be passed to the callback
   * @returns {void}
   */
  runCallbacks = function() {
    var i, j, name;
    for (i in registeredCallbacks) {
      name = registeredCallbacks[i];
      if ((timeObject[name] && timeObject[name].hasChanged ) || name === 'tick') {
        for (j in callbacks[name]) {
          runCallback(callbacks[name][j], name);
        }
      }
    }
  };

  /**
   * runCallback: execute callback with the correct timeobject arguments
   * @param   {Function} callback   callback function
   * @param   {string}   eventName  name of the event
   * @returns {void}
   */
  runCallback = function (callback, eventName) {
    callback.call(timeObject, timeObject);
  };

  /**
   * [units description]
   * @type {Array}  contains methods and properties used to
   * create the digits
   */
  units = [
    {
      property: 'year',
      progressFunction: function yearProgress(value, now) {
        var daysInYear, jan1;
        daysInYear = now.getFullYear() % 4 === 0 ? 366 : 365;
        jan1 = new Date(now.getFullYear(), 0, 1);
        return Math.ceil((now - jan1) / 86400000) / daysInYear;
      },
      dateMethod: 'getFullYear'
    }, {
      property: 'month',
      progressFunction: function monthProgress(value, now) {
        return now.getDate() / new Date(now.getFullYear(), value, 0).getDate();
      },
      dateMethod: 'getMonth'
    }, {
      property: 'day',
      progressFunction: function dayProgress(value, now) {
        return now.getHours() / 24;
      },
      dateMethod: 'getDay'
    }, {
      property: 'hour',
      progressFunction: function hourProgress(value, now, timeInMilliseconds) {
        return (timeInMilliseconds / 1000 / 60 / 60) % 24 - value;
      },
      dateMethod: 'getHours'
    }, {
      property: 'minute',
      progressFunction: function minuteProgress(value, now, timeInMilliseconds) {
        return (timeInMilliseconds / 1000 / 60) % 60 - value;
      },
      dateMethod: 'getMinutes'
    }, {
      property: 'second',
      progressFunction: function secondProgress(value, now, timeInMilliseconds) {
        return (timeInMilliseconds / 1000) % 60 - value;
      },
      dateMethod: 'getSeconds'
    }, {
      property: 'millisecond',
      dateMethod: 'getMilliseconds',
      progressFunction: function () {
        return 0;
      }
    }
  ];

  /**
   * getTimeObject: produces an object containing all values and relative values for every digit in Date()
   * @param   {Object} previousDigits object previously obtained by getTimeObject to know what values did change
   * @returns {Object}                value and progress for every digit in Date()
   */
  getTimeObject = function (previousDigits) {
    var now, timeInMilliseconds;
    now = new Date();
    timeInMilliseconds = now.getTime() - now.getTimezoneOffset() * 60000;
    previousDigits = previousDigits || {};

    return (function () {
      var digits, cache, getDate;

      cache = {};
      digits = {};

      units.forEach(function (propertyDefinition) {
        var property, functionName, value, hasChanged;
        property = propertyDefinition.property;
        functionName = 'get' + capitalize(property);

        digits[functionName] = function () {
          if (cache[property]) {
            return cache[property]
          }

          value = now[propertyDefinition.dateMethod]();

          hasChanged = !previousDigits[property] || previousDigits[property].value !== value;

          return cache[property] = {
            value: value,
            progress: propertyDefinition.progressFunction(
              value,
              now,
              timeInMilliseconds
            ),
            hasChanged: hasChanged
          }
        };

        digits['getDate'] = function () {
          return now;
        };

        // will be removed in some future release,
        // only purpose is to provide legacy support
        Object.defineProperty(digits, property, {
            get: function () {
              // console.log('calling `digit.' + property + '` is depricated, use `digit.' + functionName + '()` instead.');
              return this[functionName]();
            }
        });
      })

      return digits;
    })();

  };

  setTimeObject = function() {
    // get new data structure
    timeObject = getTimeObject(timeObject);
  };

  /**
   * tick : loop used for RAF also applies the callbacks
   * @returns {void}
   */
  tick = function () {
    window.requestAnimationFrame(tick);
    setTimeObject();
    runCallbacks();
  };

  /**
   * initLoop: initialize the RAF Loop
   * @returns {void}
   */
  initLoop = function () {
    setTimeObject();
    window.requestAnimationFrame(tick);
    // makes sure initLoop is called only once
    initLoop = function () {};
  };

  // public methods
  return {
    /**
     * on : registers a callback on a names-pace
     * @param   {String}   eventName the name matching the digits returned by getTimeObject
     * @param   {Function} callback  callback function
     * @returns {void}
     */
    on: function (eventName, callback) {
      if (typeof callbacks[eventName] === 'undefined') {
        registeredCallbacks.push(eventName);
        callbacks[eventName] = [];
      }

      callbacks[eventName].push(callback);

      window.requestAnimationFrame(function () {
        // Makes sure an hour event is called instantly, in just in 54 minutes
        runCallback(callback, eventName);
      });

      initLoop();
    }
  };
}));