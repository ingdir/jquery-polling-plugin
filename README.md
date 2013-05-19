jQuery DOM Polling Plugin
=====================

This jQuery plugin adds support for the **update** event to track changes on DOM nodes (e.g. form element updates) utilizing the power of jQuery Event API.

When it works with form elements (which is the default behavior), it is similar to a modern 'input' event,
but fires for _all_ changes, even those made programmatically, and plays nicely with any kind of copy/paste events.

You can change both the elements to be tracked and the way values are computed and compared.
Therefore, case-insensitive comparisons or ignoring whitespace is no longer a problem.
Actually, you can poll pretty much anything (position change, css property change, contenteditable changes, almost anything).

The solution is based on periodical polling; however, you can use the **update** event with event delegation!
The plugin takes care of tracking descendant elements, even when the DOM tree is updated later,
and also performs periodical garbage collection on the polling queue.

Compatibility: jQuery 1.4+

### Basic usage:

```javascript
$('input').update(function(e, data) {
    console.log('Element', e.target,
                'has changed its value from', data.oldValue,
                'to', data.newValue);
});

$('form').on('update', function(e) {
    console.log(e.target.getAttribute('name') + ' has changed its value...');
});
```

### Extra event parameters

Both old and new value are being passed as additional event data to the handler function:

```javascript
$('input').on('update', function(e, data) {
    console.log('Old value:', data.oldValue);
    console.log('New value:', data.newValue);
});
```

This is generally a useful feature, but note that if you trigger the 'update' event manually,
like $('.selector').update(), both those fields will be empty.

### Configuration API:

`$.fn.update.config()` (without arguments) returns the current configuration;

`$.fn.update.config(cfg)` accepts a configuration object `cfg` with the following fields (all are optional):

```javascript
var cfg = {
    // polling interval
    delay: 100,  // msec

    // how often the cache should be updated
    // (set to -1 to disable cache updates;
    // only do that if you're absolutely sure your DOM won't be updated)
    cacheTimeout: 2000,  // msec

    // how many elements may be queried in a polling round
    aggregateNum: 5,

    // jQuery selector to choose the elements to be polled
    elementSelector: 'input,textarea,select',

    // function to determine the value of an element;
    // accepts DOM element as a parameter
    valFn: function(el) { return $(el).val() },  // shouldn't throw exceptions :)

    // function to determine whether two values are equal or not
    eqFn: function(oldVal, newVal, el) {  // shouldn't throw exceptions, too :)
        // third element holds a reference to a DOM element
        // if you need different comparisons for different element types

        return oldVal === newVal;
    }

};

$.fn.update.config(cfg);
```

You can configure plugin dynamically, i.e. several times and with some handlers already running.
This is supported but may cause some side effects you should be aware of.
First, you are re-configuring the behavior of all 'update' event on this page, for all handlers that exist already.
Second, if you specify some weird parameters during successive configurations, you may end up having some extra elements
in your polling pool that will stay there, or break querying timeouts for some time. Since this is considered an extremely
rare case, I only make sure that nothing major breaks.

`$.fn.update.reset()` resets the configuration to its default values.

