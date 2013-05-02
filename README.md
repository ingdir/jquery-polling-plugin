jquery-polling-plugin
=====================

This jQuery plugin adds support for the **update** event to track changes on DOM nodes (e.g. form element updates) utilizing the power of jQuery Event API.

When it works with form elements (which is the default behavior), it is similar to a modern 'input' event,
but fires for _all_ changes, even those made programmatically, and plays nicely with any kind of copy/paste events.

You can change both the elements to be tracked and the way values are determined and compared.
Therefore, case-insensitive comparisons or ignoring whitespace is no longer a problem.
Actually, you can poll pretty much anything (position change, css property change, you name it).

The solution is based on periodical polling; however, you can use the **update** event with event delegation!
The plugin takes care of tracking the descendant elements, even when the DOM tree is updated later,
and also performs periodical garbage collection on the polling queue.

Compatibility: jQuery 1.4+

### Basic usage:

```javascript
$('input').update(function(e) {
    console.log(e.target.getAttribute('name') + ' has changed its value...');
});

$('form').on('update', function(e) {
    console.log(e.target.getAttribute('name') + ' has changed its value...');
});

```

### Configuration API:

`$.fn.update.config()` (without arguments) returns the current configuration;

`$.fn.update.config(cfg)` accepts a configuration object `cfg` with the following fields (all are optional):

```javascript
var cfg = {
    // polling interval
    delay: 100,  // msec

    // how often the cache should be updated
    cacheTimeout: 2000,

    // how many elements may be queried in a polling round
    aggregateNum: 5,

    // jQuery selector to choose the elements to be polled
    elementSelector: 'input,textarea,select',

    // function to determine the value of an element;
    // accepts DOM element as a parameter
    valFn: function(el) { return $(el).val() },

    // function to determine whether two values are equal or not
    eqFn: function(oldVal, newVal) {
        return oldVal === newVal;
    }

};

$.fn.update.config(cfg);

```

`$.fn.update.reset()` resets the configuration to its default values

