/// <reference path="vsdoc/jquery.js" />

// jquery-deps.js - jQuery dependency manager
(function() {
    // TODO: Detect dependency loops

    var $ = jQuery;

    // Add support for multiple/nested deps resolving context
    // so it's possible to use this without calling init
    var basePath = "/",
        depGraph = {},
        loadedDeps = {},
        loadQueue = [];


    // OPTIMIZE: Find out the number of concurrent requests we can pull at once
    //           which probably depends on the browser
    var loadCounter = 6,
        shouldSpinLoad = false,
        spinId = null;


    // util function (TODO: Is this safe?)
    Array.prototype.remove = function(from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };


    // actual script loader
    function spinLoad() {
        function innerSpinLoad() {

            shouldSpinLoad = false;
            clearTimeout(spinId);
            spinId = null;

            if (loadQueue.length == 0) return;


            var item = loadQueue[0];

            // if we have a function, it means all of its dependencies have been loaded
            // so we can now execute the function
            if (typeof item == 'function') {
                loadQueue.shift()(); // item == loadQueue[0]
                shouldSpinLoad = true;
            }

            // item is not a function, its a dependency string
            // if we have loading slots available, add it to the loadQueue.
            for (var i = 0; i < loadQueue.length && loadCounter > 0; i++) {
                item = loadQueue[i];

                if (item in loadedDeps || typeof item == 'function') {
                    continue;
                }

                // occupy a load slot and spin a loading (pseudo-)thread
                loadCounter -= 1;
                loadedDeps[item] = false; // this makes (item in loadedDeps) === true
                shouldSpinLoad = true;

                $.getScript(basePath + item + ".js", (function(item) {
                    return function() {
                        loadCounter += 1;
                        loadedDeps[item] = true;

                        loadQueue.remove($.inArray(item, loadQueue));
                        spinLoad();
                    };
                })(item));
            }


            if (shouldSpinLoad) spinLoad();
        }

        spinId = spinId || setTimeout(innerSpinLoad, 0);
    }


    // initialize the depedency graph
    function initDeps(basePath_, deps) {
        if (typeof basePath_ == 'object' && deps == null) {
            deps = basePath_;
            basePath_ = null;
        }

        if (basePath_) basePath = basePath_;
        depGraph = deps;
    }

    // recursive function to ensure all dependencies are loaded
    function ensureDeps(dep) {
        if (dep in depGraph) {
            // ensure all required deps are queued first
            var requiredDeps = depGraph[dep];
            for (var i = 0; i < requiredDeps.length; i++)
                ensureDeps(requiredDeps[i]);
        }

        // if it's already loaded, skip it
        if (loadedDeps.hasOwnProperty(dep) || $.inArray(dep, loadQueue) != -1)
            return;

        // else push it to the load queue
        loadQueue.push(dep);
    }

    // function to request loading of certain dependencies
    function loadDeps(deps, callback) {
        if (!(deps instanceof Array)) deps = [deps];

        for (var i = 0; i < deps.length; i++)
            ensureDeps(deps[i]);

        if (callback && typeof callback == 'function') {
            loadQueue.push(callback);
        }

        spinLoad();
    }


    // wire up to jQuery
    $.deps = {
        init: initDeps,
        load: loadDeps
    };

})();