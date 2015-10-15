simplecheck
==========

This is a simple variable type-checking library inspired by the `check` and `Match` functions and behaviors in MeteorJS.


## Why?
I love Meteor's `check` function but you can't use it outside of Meteor due to the way it is written, and I want to use it in my pure node projects.

## Usage
### Import the library

```js
import {matches, oneOf, optional, ensure} from 'simplecheck';
```

### Check a variable's type

```js
matches('foo', String); // true
```

### Use `oneOf`
```js
matches('foo', oneOf(String, Number)); // true

matches('foo', oneOf(Number, Boolean)); // false

matches('foo', oneOf('foo', 'bar')); // true

```

### Check an object's schema
```js
matches({
  foo:'bar',
  baz:10
}, {
  foo:String,
  baz:Number
}); // true

```

### Use the `optional` function for optional keys
(if they exist, they must match, but they aren't required)

```js
matches({
  foo:'bar',
  baz:10
}, {
  foo:String,
  baz:optional(Number)
}); // true

matches({
  foo:'bar'
}, {
  foo:String,
  baz:optional(Number)
}); // true

matches({
  foo:'bar',
  baz:'baz'
}, {
  foo:String,
  baz:optional(Number)
}); // false ("baz" is not a number)
```

### Check for array of type

Note that this library doesn't support type-checking of elements at specific indices in the array (yet)

```js
matches(['foo'], [String]); // true

matches(['foo', 10], [String]); // false

matches(['foo', 10], [oneOf(String, Number)]); // true
```

### Check on a regular expression
```js
matches('foo', /^foo$/g); // true

matches('foo', oneOf('bar', /fo/g)); // true

matches('foo', /bar/g); // false

matches({
  foo:'bar'
}, {
  foo:/ba/g
}); // true
```

### Throw an error instead of returning a boolean?
Use `ensure`:

```js
ensure('foo', Number);

// "MatchError: Expected 'foo' to be a number"
```

## Find a bug?
Please add a test in `check_test.js` and we will try to fix.
