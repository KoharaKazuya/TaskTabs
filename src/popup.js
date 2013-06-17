window.addEventListener('load', function() {

var bg = chrome.extension.getBackgroundPage();

document.getElementById("newTask").addEventListener('click', bg.newTask, false);
document.getElementById("startTask").addEventListener('click', bg.startTask, false);
document.getElementById("later").addEventListener('click', bg.later, false);

bg.root.update();
setTimeout(function() {
    document.getElementById("treeView").innerHTML = bg.root.toString().replace(/\n/g, "<br>");
}, 100);

}, false);
