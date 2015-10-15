import util from 'util';

const nativeTypes = [String, Boolean, Date, Number, RegExp, Object, Array, Function];


function scalarTypeMap(value) {
  switch (value) {
    case String:
      return 'string';
    case Boolean:
      return 'boolean';
    case Number:
      return 'number';
    default:
      return null;
  }
}

// This is here until the guy running the es6-error package merges the pull request fixing this
class ExtendableError extends Error {
  constructor(message = '') {
    super(message);

    // extending Error is weird and does not propagate `message`
    Object.defineProperty(this, 'message', {
      enumerable: false,
      value: message
    });

    Object.defineProperty(this, 'name', {
      enumerable: false,
      value: this.constructor.name,
    });

    if (Error.hasOwnProperty('captureStackTrace')) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      Object.defineProperty(this, 'stack', {
        enumerable: false,
        value: (new Error(message)).stack,
      });
    }
  }
}

export class MatchError extends ExtendableError {
  constructor(message) {
    super(util.format.apply(util, arguments));
  }
}

/**
 * Ensure match only if value is neither undefined nor null
 * @param  {mixed} pattern The pattern to match
 * @return {mixed}         Either `true` if OK or a MatchFailure if not
 */
export function optional(pattern) {
  return function(value) {
    if (value === undefined || value === null) {
      return true;
    }
    return checkType(value, pattern);
  }
}

/**
 * Ensure value matches one of the provided arguments (arguments can be anything that can be used as a matcher, like
 * String or an object with matcher properties)
 * @return {mixed} Either `true` if OK or a MatchFailure if not
 */
export function oneOf() {
  let args = Array.prototype.slice.call(arguments);
  return function(value) {
    for (let i = 0; i < args.length; i++) {
      try {
        checkType(value, args[i]);
        return true;
      } catch (err) {}
    }
    throw new MatchError('Expected %s to be one of %s', JSON.stringify(value), JSON.stringify(args));
  };
}

/**
 * Run the main check function but throw an exception if it fails
 *
 * @see  arguments for check
 */
export function ensure(value, pattern, strict = true) {
  checkType(value, pattern, strict);
  return true;
}

/**
 * Check if a value matches a pattern
 * @param  {mixed}  value   The value to check
 * @param  {mixed}  pattern The pattern (see tests for examples)
 * @param  {Boolean} strict  Will get passed down to all calls of checkObject (see that function description)
 * @return {Boolean}          True if OK, false if not
 */
export function matches(value, pattern, strict = true) {
  try {
    ensure(value, pattern, strict);
    return true;
  } catch (err) {
    return false;
  }
}


function checkType(value, pattern, strict = true) {
  let valid = true;
  let typeMap = scalarTypeMap(pattern);
  if (typeMap) {
    if (typeof value !== typeMap) {
      throw new MatchError('Expected %s to be a %s', JSON.stringify(value), typeMap);
    }
  } else if (pattern instanceof Function && nativeTypes.indexOf(pattern) < 0) {
    valid = pattern(value);
  } else if (pattern instanceof Array && nativeTypes.indexOf(pattern) < 0) {
    valid = checkArray(value, pattern[0]);
  } else if (pattern instanceof RegExp && nativeTypes.indexOf(pattern) < 0) {
    if (!pattern.test(value)) {
      throw new MatchError('Expected %s to match pattern %s', JSON.stringify(value), pattern);
    }
  } else if (pattern instanceof Object && nativeTypes.indexOf(pattern) < 0) {
    valid = checkObject(value, pattern, strict);
  } else {
    // Could be a oneOf with exact values
    if (value === pattern) {
      return true;
    } else if (!(value instanceof pattern)) {
      throw new MatchError('Expected %s to be an instance of %s', JSON.stringify(value), JSON.stringify(pattern));
    }
  }
  if (!valid) {
    throw new MatchError('Invalid match (%s expected to be %s)', JSON.stringify(value), JSON.stringify(pattern));
  }
  return valid;
}

function checkArray(arr, pattern, strict = true) {
  if (!arr instanceof Array) {
    throw new MatchError('Expected %s to be an array', JSON.stringify(arr));
  }

  arr.forEach((elem) => {
    checkType(elem, pattern, strict);
  });

  return true;
}

function checkObject(value, pattern, strict = true) {
  if (typeof value !== 'object') {
    throw new MatchError('Expected %s to be an object', JSON.stringify(value));
  }
  for (let k in pattern) {
    try {
      checkType(value[k], pattern[k]);
    } catch (err) {
      err.message = '(Key ' + k + ' in ' + JSON.stringify(value) + ') - ' + err.message;
      throw err;
    }
  }

  if (strict) {
    for (let k in value) {
      if (!pattern[k]) {
        throw new MatchError('Unknown key %s in %s', k, JSON.stringify(value));
      }
    }
  }
  return true;
}
