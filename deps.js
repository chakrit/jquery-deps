/// <reference path="vsdoc/jquery.js" />
/// <reference path="jquery-deps.js" />

// deps.js - Define dependencies for the site as a JSON object
$.deps.init(/* baseScriptUrl = */'/js/', {

    'site': [],

    'component1': ['site'],
    'component2': ['site'],

    'component3': ['component1'],
    'component4': ['component3', 'component2']

});

// always load the base site file
$.deps.load(['site']);