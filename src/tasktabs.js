var root = new Tree("root", undefined);
var tabStack = [];

chrome.tabs.onActivated.addListener(onActivated);
chrome.tabs.onCreated.addListener(registerCreatedTask);
chrome.tabs.onRemoved.addListener(onRemoved);
chrome.windows.onFocusChanged.addListener(onActivated);
chrome.commands.onCommand.addListener(execute_command);

function onActivated() {
    refresh();
    setCurrentTab();
}

function onRemoved(tabId, removeInfo) {
    var removedTree = search({id: tabId});
    if (removedTree && removedTree.equals(new Tree("tab", getCurrentTab()))) {
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
    registerTabAsNewTask(getCurrentTab());
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
    register_opened_tabs();
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
 * 開かれているが、ツリーに登録されていない全てのタブを登録する
 */
function register_opened_tabs() {
    chrome.tabs.query({}, function(tabs) {
        for (var i = 0; i < tabs.length; ++i) {
            var tab = tabs[i];
            if (!search(tab)) {
                registerTabAsNewTask(tab);
            }
        }
    })
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
    laterTree(search(getCurrentTab()));
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
 * 以前に選んでいたタブに移動
 */
function activatePreviousTab() {
    if (tabStack.length > 1) {
        popTabStack();
        var tab = getCurrentTab();
        chrome.tabs.update(tab.id, {active: true});
    }
}

/**
 * 生成元となった親タブを取得する
 */
function searchParentTab(tab) {
    if (!getCurrentTab() || tab.id === getCurrentTab().id) {
        return getPreviousTab();
    } else {
        return getCurrentTab();
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
        pushTabStack(tabs[0]);
    });
}

function getCurrentTab() {
    if (tabStack.length > 0) {
        return tabStack[tabStack.length - 1];
    } else {
        return null;
    }
}

function getPreviousTab() {
    if (tabStack.length > 1) {
        return tabStack[tabStack.length - 2];
    } else {
        return null;
    }
}


function pushTabStack(tab) {
    /**
     * tabStack に既に tab が含まれていた場合は破棄する
     */
    function compact() {
        for (var i = 0; i < tabStack.length; ++i) {
            if (tabStack[i].id === tab.id) {
                tabStack.splice(i, 1);
                compact();
                break;
            }
        }
    }

    compact();
    tabStack.push(tab);
}

function popTabStack() {
    tabStack.pop();
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
        case "previousTab":
            activatePreviousTab();
            break;
    }
}
