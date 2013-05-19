jQuery DOM Polling Plugin
=====================

This jQuery plugin allows you create multiple custom events to track changes on DOM nodes (e.g. form element updates) utilizing the power of jQuery Event API.
The resulting events can be used with `.on()` or `.bind()` methods, including event delegation, as if they were built-in events.

Each event you create must get a unique name and (optionally) a number of configuration parameters.

Without configuration (by default) it is set to monitor form elements (inputs, selects, textareas) for all kinds of value changes,
including programmatical changes and copy/paste events.

You can configure both the elements to be tracked and the way element values are computed and compared.
Actually, you can poll pretty much anything (position change, css property change, contenteditable changes etc.)

The solution is based on periodical polling. The plugin takes care of tracking descendant elements,
even when the DOM tree is updated dynamically, and also performs periodical garbage collection on the polling queue.

Compatibility: jQuery 1.4.2+

### Basic event creation and usage:

Let's define a new 'update' event with default parameters:
```javascript
$.definePollingEvent('update');
```

Now, we have a new **update** event that can be used as a normal event:
```javascript
$('form').on('update', function(e) {
    console.log('Element', e.target, 'has changed!');
});
```

Event handlers are only fired for actual changes, of course.
Both old and new value are being passed as additional event data to the handler function:
```javascript
$('input').on('update', function(e, data) {
    console.log('Old value:', data.oldValue);
    console.log('New value:', data.newValue);
});
```

### Configuring your events

You can define multiple events with different names and options:
```javascript
$.definePollingEvent('updateNoCase', {
    eqFn: function(oldVal, newVal, el) {
        return oldVal.toLowerCase() === newVal.toLowerCase();
    }
});
```

Add one more (the previous one, **updateNoCase**, it still there and uses its own options):
```javascript
$.definePollingEvent('visibilityChange', {
    elementSelector: 'div.container',
    valFn: function(el) {
        return $(el).is(':visible');
    }
});
```

Now we can use both:
```javascript
$('form').on('updateNoCase', function() {
    // all changes are monitored case-insensitively
});

$('body').on('visibilityChange', function() {
    // do something good
});
```

Each event you create must have a unique name; otherwise, an exception is thrown.
Here is the full list of available options, with their default values:

```javascript
$.definePollingEvent('eventName', {
    // polling interval, a minimal delay before a next polling cycle
    delay: 100,  // msec

    // how often the plugin should check for changes
    // (element removal, adding/removing of elements when
    // event delegation is used)
    //
    // use -1 to disabled automatic updates
    // (do it only if your DOM doesn't change).
    // event delegation still works with this setup, though
    cacheTimeout: 2000,  // msec

    // how many elements may be queried in a polling cycle.
    // specifying big numbers and/or providing custom value calculating functions
    // (see below) may result in browser lagging
    aggregateNum: 5,

    // jQuery selector to choose the elements to be polled.
    // This selector is being run each cacheTimeout milliseconds
    elementSelector: 'input,textarea,select',

    // function to determine the value of an element;
    // accepts DOM element as a parameter
    valFn: function(el) {
        return $(el).val();
    },

    // function to determine whether two values are equal or not,
    // gets old value, new value, and DOM element reference as parameters
    eqFn: function(oldVal, newVal, el) {
        return oldVal === newVal;
    }
});
```

### Debugging and testing
There is a test page in the **test** folder that allows for interactive manual testing.

For each **eventName**, there is a corresponding $.fn.eventName.debug method available, it returns
an array of 2 internal caches, for debugging purposes only.

### TODO
  - build some autotests
  - try if Mutation Events API is better to check for DOM updates
  - provide "automated timing" mode to determine polling delays dynamically according to actual browser workload