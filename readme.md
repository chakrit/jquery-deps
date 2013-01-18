Initialize your dependency graph like this:

    $.deps.init('/base/script/url/', {
        'site.js': [],
        'deps/dep1.js': ['site.js'],
        'deps/dep2.js': ['site.js', 'deps/dep2.css'],

        'my_component.js': ['deps/dep1.js', 'deps/dep2.js']
    });

 Load a component like this:

     $.deps.load('my_component.js', function() {
         /* something to do after componentXYZ is loaded */
         alert("all deps are loaded and executed!");
     });

The script will lookup in the deps graph you specified using `$.deps.init()` and then make sure they are all loaded *AND* executed (or link-ed in the head) before executing your callback function.

Dependencies and execution order are guaranteed.

### Supported file types:

* **JS** - processed using `$.globalEval`
* **CSS** - processed by adding a new `<style />` element to the page
* **HTML**, **HTM**, **HAML** - processed by adding a new `<script />` element to the page with `type="text/html"` and `id=the_filename-template`, where `the_filename` is replaced with the filename without extension (e.g. `mywidget.html`, once loaded, can be accessed via `$("#mywidget-template").html()`).

