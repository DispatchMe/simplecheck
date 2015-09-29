simplecheck
==========

This is a simple variable type-checking library inspired by the `check` and `Match` functions and behaviors in MeteorJS.

Note that this is written with ES6. You can use it for projects deployed to ES5 environments but you need to transpile it using Babel in your build process.

## Why?
I love Meteor's `check` function but you can't use it outside of Meteor due to the way it is written, and I want to use it in my pure node projects.

## Usage
### Import the library

```js
import check, {oneOf, optional, ensure} from 'simplecheck';
```

### Check a variable's type

```js
var valid = check('foo', String);
console.log(valid); // true
```

### Use `oneOf`
```js
var valid = check('foo', oneOf(String, Number));
console.log(valid); // true

valid = check('foo', oneOf(Number, Boolean));
console.log(valid); // false
```

### Check an object's schema
```js
var valid = check({
  foo:'bar',
  baz:10
}, {
  foo:String,
  baz:Number
});
console.log(valid); // true
```

### Use the `optional` function for optional keys 
(if they exist, they must match, but they aren't required)

```js
var valid = check({
  foo:'bar',
  baz:10
}, {
  foo:String,
  baz:optional(Number)
});
console.log(valid); // true

valid = check({
  foo:'bar'
}, {
  foo:String,
  baz:optional(Number)
});
console.log(valid); // true

valid = check({
  foo:'bar',
  baz:'baz'
}, {
  foo:String,
  baz:optional(Number)
});
console.log(valid); // false ("baz" is not a number)
```

### Check for array of type

Note that this library doesn't support type-checking of elements at specific indices in the array (yet)

```js
var valid = check(['foo'], [String]);
console.log(valid); // true

valid = check(['foo', 10], [String]);
console.log(valid); // false

valid = check(['foo', 10], [oneOf(String, Number)]);
console.log(valid); // true
```

### Throw an error instead of returning a boolean?
Use `ensure`:

```js
ensure(check('foo', Number));

// "MatchError: Expected 'foo' to be a number"
```

## Find a bug?
Please add a test in `check_test.js` and we will try to fix.




