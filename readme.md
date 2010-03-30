Initialize with:

    $.deps.init('/base/script/url/', {
		
		'site': [],
		
		'dependencies1': ['site'],
		'dependencies2': ['site'],
		
        'componentXYZ': ['dependencies1', 'dependencies2']
    });
    
 Load a component with:
 
     $.deps.load('componentXYZ', function() {
         /* something to do after componentXYZ is loaded */
     });
     
The script will lookup in the deps graph you specified and then make sure '/base/script/url/dependencies1.js' and '/base/script/url/dependencies2.js' and also 'componentXYZ.js' is loaded before executing the callback.

Load order and dependencies are guaranteed. Callbacks are guaranteed to run *after* all dependencies have been loaded, but dependencies execution order itself is not guaranteed to be in order (yet)