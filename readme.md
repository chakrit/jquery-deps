Initialize your dependency graph like this:

    $.deps.init('/base/script/url/', {
        'site.js': [],
        'deps/dep1.js': ['site.js'],
        'deps/dep2.js': ['site.js'],
		
        'my_component.js': ['deps/dep1.js', 'deps/dep2.js']
    });
    
 Load a component like this:
 
     $.deps.load('my_component.js', function() {
         /* something to do after componentXYZ is loaded */
         alert("all deps are loaded and executed!");
     });
     
The script will lookup in the deps graph you specified using `$.deps.init()` and then make sure they are all loaded *AND* executed before executing your callback function.

Dependencies and execution order are guaranteed.