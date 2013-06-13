window.addEventListener('load', function() {

var bg = chrome.extension.getBackgroundPage();

document.getElementById("newTask").addEventListener('click', bg.newTask, false);
document.getElementById("startTask").addEventListener('click', bg.startTask, false);
document.getElementById("later").addEventListener('click', bg.later, false);

}, false);
