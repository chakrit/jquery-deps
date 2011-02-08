
$(function() {

  window.registerDep = function(dep) {
    console.log(dep);
    $("#statuses").append($("<li></li>").text(dep));
  };
  
  $.deps.init(
    { 'dep5.css': []
    , 'dep5.js': ['dep5.css']
    , 'dep4.js': ['dep5.js']
    , 'dep3.js': ['dep4.js']
    , 'dep2.js': ['dep3.js']
    , 'dep1.js': ['dep2.js']
    })
  .load(['dep1.js'], function() {
    alert("All done!");
  });
  
});