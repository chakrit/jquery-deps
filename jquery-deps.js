/* This file is Copyright (c) 2010, Chakrit Wichian
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
* - Redistributions of source code must retain the above copyright
*   notice, this list of conditions and the following disclaimer.
* - Redistributions in binary form must reproduce the above copyright
*   notice, this list of conditions and the following disclaimer in the
*   documentation and/or other materials provided with the distribution.
* - Neither the name of copyright holder nor the
*   names of its contributors may be used to endorse or promote products
*   derived from this software without specific prior written permission.
* 
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
* DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/// <reference path="vsdoc/jquery.js" />

// jquery-deps.js - jQuery dependency manager
(function() {
    // TODO: Detect dependency loops
    // TODO: Pre-load image dependencies

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


    // util function
    function processItem(name, content) {

        var tag = null;

        function stringEndsWith(str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }

        // WARN: Potential evil, tread lightly.
        // TODO: Should we just eval()?
        if (stringEndsWith(name, ".js")) {
            tag = "script";

        } else if (stringEndsWith(name, ".css")) {
            tag = "style";
        }

        tag = $(document.createElement(tag)).html(content);
        $("head").append(tag);

    }


    // actual script loader
    function spinLoad() {
        function innerSpinLoad() {

            shouldSpinLoad = false;
            clearTimeout(spinId);
            spinId = null;

            if (loadQueue.length == 0) return;


            var item = loadQueue[0];

            // if we have a function, it means all of the function's dependencies
            // (which should be on the queue preceding the function) have been loaded
            // so we can now execute the function
            if (typeof item == 'function') {
                loadQueue.shift()(); // item == loadQueue[0]
                shouldSpinLoad = true;
            }

            // item is not a function, its a dependency string
            // if we have loading slots available, add it to the loadQueue.
            for (var i = 0; i < loadQueue.length && loadCounter > 0; i++) {
                item = loadQueue[i];

                // skip any functions that are waiting to be executed but doesn't need loading
                // or if the dependency has been and is pending.
                if (item in loadedDeps || typeof item == 'function') {
                    continue;
                }

                // occupy a load slot and spin a loading (pseudo-)thread
                loadCounter -= 1;
                loadedDeps[item] = false; // this makes (item in loadedDeps) === true
                shouldSpinLoad = true;


                $.get(basePath + item, {}, (function(item) {
                    return function(content) {

                        // replace the dep as a function so it gets executed once
                        // it's at the front of the queue -- this effectively defer
                        // script execution and preserve the depedency execution order
                        var idx = $.inArray(item, loadQueue);
                        loadQueue[idx] = function() {

                            // mark as loaded and ready for use (executed)
                            loadedDeps[item] = true;
                            processItem(item, content);
                        };

                        loadCounter += 1;
                        spinLoad();
                    }
                })(item), 'text');
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

        if (basePath_ !== null) basePath = basePath_;
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
        load: loadDeps,

        // for debugging purpose
        getGraph: function() { return depGraph; }
    };

})();