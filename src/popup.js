window.addEventListener('load', function() {

var bg = chrome.extension.getBackgroundPage();

document.getElementById("new_task").addEventListener('click', bg.add_task, false);
document.getElementById("later").addEventListener('click', bg.later, false);

}, false);
