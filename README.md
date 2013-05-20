jQuery DOM Polling Plugin
=====================

This jQuery plugin allows you create multiple custom events to track changes on DOM nodes (e.g. form element updates) utilizing the power of jQuery Event API.
The resulting events can be used with `.on()` or `.bind()` methods, including event delegation, as if they were built-in events.

In fact, this is a custom event factory.
Each event you create must get a unique name and (optionally) a number of configuration parameters.

Without configuration (by default) it is set to monitor form elements (inputs, selects, textareas) for all kinds of value changes,
including programmatical changes and copy/paste events.

You can configure both the elements to be tracked and the way element values are computed and compared.
Thus, you can monitor pretty much anything (CSS property change, contenteditable changes etc.)

Internally, the plugin is based on periodical polling which also takes care of tracking descendant elements for proper
event delegation, even when the DOM tree is updated dynamically, and also performs periodical garbage collection on the polling queue.

Compatibility: jQuery 1.4.2+

### Basic Usage

Public API is `$.definePollingEvent`, which accepts new event name (required) and configuration object (optional, but recommended; see below).

Let's define a new **update** event with default parameters:
```javascript
$.definePollingEvent('update');
```

From now on, this can be used as a "normal" event:
```javascript
$('form').on('update', function(e) {
    console.log('Element', e.target, 'has changed!');
});
```

Event is fired once for every change detected. You can (obviuosly!) add as many handlers as you need.
Both old and new value are passed as additional event data to the handler function:
```javascript
$('input').on('update', function(e, data) {
    console.log('Old value:', data.oldValue);
    console.log('New value:', data.newValue);
});
```

### Configuring Your Events

You can define multiple events with different names and options.
In this case, we provide a custom comparison function to support case-insensitive comparisons.
```javascript
$.definePollingEvent('updateNoCase', {
    eqFn: function(oldVal, newVal, el) {
        return oldVal.toLowerCase() === newVal.toLowerCase();
    }
});
```

Let's add one more (the previous one, **updateNoCase**, it still there and uses its own options).
This one will monitor element's visibility, but only for elements that match the provided jQuery selector.
```javascript
$.definePollingEvent('visibilityChange', {
    elementSelector: 'div.container',
    valFn: function(el) {
        return $(el).is(':visible');
    }
});
```

Now both events are ready to be used.
We don't have to attach handlers directly to elements we're interested in, as event delegation is supported.
So, it's not **form** and **body** that will be monitored, but their descendants matching the default
"form element selector" **input,select,textarea** for the first event, and **div.container** selector for the second one.
```javascript
$('form').on('updateNoCase', function() {
    // all changes are monitored case-insensitively
});

$('body').on('visibilityChange', function() {
    // do something good
});
```

Each event you define with `$.definePollingEvent` must have a unique name; otherwise, an exception is thrown.
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

### Debugging And Testing
There is a test page in the **test** folder that allows for interactive manual testing.

For each **eventName**, there is a corresponding $.fn.**eventName**.debug() method available, which returns
an array of 2 internal caches, for debugging purposes only.

### TODO
  - build some autotests
  - try if Mutation Events API is better to check for DOM updates
  - provide "automated timing" mode to determine polling delays dynamically according to actual browser workload
