var currentTab;
var trees = [];

// タブを切り替えるたびに現在のタブを切り替える
chrome.tabs.onActivated.addListener(function(info) {
    chrome.tabs.get(info.tabId, function(tab) {
        currentTab = tab;
    });
});

// タブが生成されるたびに木に適切に追加していく
chrome.tabs.onCreated.addListener(function(tab) {
    alert("prev tab:" + currentTab.title + ", new tab:" + tab.title);
    search_and_add(currentTab, tab);
});

/**
 * trees から親となるタブを探しだして、その子として追加
 */
function search_and_add(parent, child) {

}
