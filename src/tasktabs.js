var root = new Tree("root", undefined);
var currentTab;
var previousTab;

chrome.tabs.onActivated.addListener(onActivated);
chrome.tabs.onCreated.addListener(registerCreatedTask);
chrome.tabs.onRemoved.addListener(onRemoved);
chrome.commands.onCommand.addListener(execute_command);

function onActivated() {
    refresh();
    setCurrentTab();
}

function onRemoved(tabId, removeInfo) {
    var removedTree = search({id: tabId});
    if (removedTree && removedTree.equals(new Tree("tab", currentTab))) {
        laterTree(removedTree);
    }
    refresh();
}

/**
 * 新規で新しくタスクを生成する
 */
function newTask() {
    chrome.tabs.create({
        active: true
    }, function(tab) {
        registerTabAsNewTask(tab);
    });
}

/**
 * 現在のタブを新しいタスクとして root に登録する
 */
function startTask() {
    registerTabAsNewTask(currentTab);
}

/**
 * 新しく生成されたタブをタスクとしてツリーに登録
 */
function registerCreatedTask(newTab) {
    search_and_add(searchParentTab(newTab), newTab);
}

/**
 * 指定したタブをあらなたなタスク（親のないタスク）として登録
 */
function registerTabAsNewTask(tab) {
    var tree = search(tab);
    if (tree) {
        tree.destroy();
    }
    search_and_add(null, tab);
}

/**
 * 状態を正しく保つ
 * 任意のタイミングで呼べる
 */
function refresh() {
    destroy_closed_trees();
}

/**
 * root から親となるタブを探しだして、その子として追加
 * 親がなければ root にツリールートとして追加
 */
function search_and_add(parent, child) {
    if (child) {
        var parentTree = search(parent);
        if (!parentTree) {
            parentTree = getWindowTree(child.windowId);
        }
        parentTree.addChild(new Tree("tab", child));
    }
}

/**
 * root から既に閉じられたタブをもつ木を削除
 */
function destroy_closed_trees() {
    chrome.tabs.query({}, function(tabs) {
        // root に記録されている Tree オブジェクトを全列挙
        var flatten = root.flatten();
        // tabs から検索し、なければ削除
        for (var j = 0; j < flatten.length; ++j) {
            var tree = flatten[j];
            if (tree.type === "tab") {
                var found = false;
                for (var k = 0; k < tabs.length; ++k) {
                    if (tree.equals(new Tree("tab", tabs[k]))) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    tree.destroy();
                }
            }
        }
    });
}

/**
 * toot からタブを指定して検索
 * @return 見つかれば Tree, 見つからなければ null
 */
function search(tab) {
    if (tab) {
        return root.has("tab", tab);
    }
    return null;
}

/**
 * root 直下の window ツリーを発見するか、なければ生成
 */
function getWindowTree(id) {
    var t = root.has("window", id);
    if (!t) {
        t = new Tree("window", id);
        root.addChild(t);
    }
    return t;
}

/**
 * 現在のタブを後回しにする
 */
function later() {
    laterTree(search(currentTab));
}

/**
 * 指定したタブを後回しにする
 */
function laterTree(tree) {
    if (tree) {
        // タブが木なら子要素へ、葉なら弟、または親へタブのアクティブを移動
        var target;
        if (tree.isLeaf()) {
            if (tree.brother) {
                target = tree.brother;
            } else {
                target = tree.parent;
            }
        } else {
            target = tree.getChildren()[0];
        }
        if (target.type !== "tab") {
            target = getWindowTree(tree.node.windowId);
        }
        chrome.tabs.update(target.node.id, {active: true});
    }
}

/**
 * 生成元となった親タブを取得する
 */
function searchParentTab(tab) {
    if (!currentTab || tab.id === currentTab.id) {
        return previousTab;
    } else {
        return currentTab;
    }
}

/**
 * 現在のタブを設定する
 */
function setCurrentTab() {
    chrome.tabs.query({
        windowId: chrome.windows.WINDOW_ID_CURRENT,
        active: true
    }, function(tabs) {
        previousTab = currentTab;
        currentTab = tabs[0];
        if (!search(currentTab)) {
            registerTabAsNewTask(currentTab);
        }
    });
}

/**
 * コマンドを実行する
 */
function execute_command(command) {
    switch (command) {
        case "newTask":
            newTask();
            break;
        case "startTask":
            startTask();
            break;
        case "later":
            later();
            break;
    }
}
