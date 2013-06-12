window.addEventListener('load', function() {

document.getElementById("new_task").addEventListener('click', new_task, false);

function new_task() {
    chrome.extension.getBackgroundPage().add_task();
}

}, false);
