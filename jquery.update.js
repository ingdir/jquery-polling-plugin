/**
 *
 * @author Max Shirshin
 * @description DOM polling plugin to track any type of change on any element, by creating native jQuery events
 * @version 3.0.1
 *
 */

(function ($, undefined) {
    $.definePollingEvent = function(eventName, newCfg) {
        if (eventName === undefined) {
            throw new Error('DOM Polling plugin: event name is required');
        }
        // throw exception if an event with the same name was defined already
        if ($.event.special.hasOwnProperty(eventName)) {
            throw new Error('DOM Polling plugin: custom event ' + eventName + ' is already defined');
        }

        // key for .data() to store the cached value
        var valueCache = eventName + ':prev',

            // id's for timeouts
            timeoutId,
            cacheTimeoutId,

            // jQuery object to store the polled elements
            $pool = $(),

            // jQuery object to store the original elements the handlers are attached to
            $source = $(),

            // initialize the polling counter
            counter = -1,

            // how many elements were polled in a polling round
            aggregated = 0,

            // default options
            cfg = {
                // polling interval
                delay: 100,  // msec
                // how often the cache should be updated, -1 for "never"
                cacheTimeout: 2000,  // msec
                // how many elements may be queried in a polling round
                aggregateNum: 5,
                // jQuery selector to choose the elements to be polled
                elementSelector: 'input,textarea,select',
                // function to determine the value of an element;
                // accepts DOM element as a parameter
                valFn: function(el) { return $(el).val() },
                // function to determine whether two values are equal or not
                eqFn: function(oldVal, newVal, el) {
                    return oldVal === newVal;
                }
            };

        // define configuration
        $.extend(cfg, newCfg || {});

        // polling function
        function poll() {
            // one round of aggregated polling
            //
            // aggregateNum may still be more than the actual number of elements to poll,
            // thus an extra check
            while (++aggregated <= Math.min($pool.length, cfg.aggregateNum)) {
                var el = $pool.get(++counter) || $pool.get(counter = 0);
                if (el) {
                    processEvent(el);
                }
            }

            aggregated = 0;
            timeoutId = setTimeout(poll, cfg.delay);
        }

        // check whether the actual value has changed
        function processEvent(el) {
            var cachedVal = $.data(el, valueCache),
                val = cfg.valFn(el),
                isEqual = cfg.eqFn(cachedVal, val, el);

            if (cachedVal === undefined || isEqual) {
                // cache value
                $.data(el, valueCache, val);
            } else if (! isEqual) {
                $(el)
                    .data(valueCache, val)
                    .trigger(eventName, {
                        oldValue: cachedVal,
                        newValue: val
                    });
            }
        }

        function refreshCache() {
            // empty the polling pool
            $pool = $();
            // filter out dead elements
            $source = $source
                .filter(function() {
                    // elements removed from DOM shouldn't be polled anymore
                    return $.contains(document.documentElement, this);
                })
                .each(function() {
                    addToPolling(this);
                });

            // schedule next run, unless user explicitly stated
            // that periodical updates aren't required
            cacheTimeoutId = (cfg.cacheTimeout !== -1) ?
                setTimeout(refreshCache, cfg.cacheTimeout) :
                undefined;

            if ($pool.length === 0 && $source.length === 0) {
                clearTimeout(timeoutId);
                clearTimeout(cacheTimeoutId);
                timeoutId = cacheTimeoutId = undefined;
            }
        }

        function addToPolling(el) {
            // add elements to the polling list, jQuery cares for the uniqueness
            $pool = $pool.add($getPolled(el));
        }

        // see which elements are being polled for this element.
        // it can either be the element itself or its descendants (if event delegation was used)
        function $getPolled(el) {
            var $el = $(el);

            return $el
                .find(cfg.elementSelector)
                .add( $el.filter(cfg.elementSelector) );
        }

        function refreshCacheASAP() {
            // schedule cache refresh with a minimal timeout;
            // this way we avoid successive incovations
            // when event handlers are added in a cycle

            clearTimeout(cacheTimeoutId);
            cacheTimeoutId = setTimeout(refreshCache, 0);
        }

        // provide a wrapper function similar to other events
        $.fn[eventName] = function(fn) {
            return fn ? this.bind(eventName, fn) : this.trigger(eventName);
        };

        // define debugging API
        $.extend($.fn[eventName], {
            debug: function() {
                return [$pool, $source];
            }
        });

        $.event.special[eventName] = {
            setup: function() {
                $source = $source.add(this);
                addToPolling(this);
                // start polling
                timeoutId || poll();
                // schedule cache refresh to a minimal timeout
                refreshCacheASAP();
            },

            teardown: function() {
                $source = $source.not(this);
                refreshCacheASAP();
                // this is the last event handler for this element, so we remove .data() properties
                $(this).removeData(valueCache);
            }
        };
    };
})(jQuery);
