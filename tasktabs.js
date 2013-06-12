var trees = [];

/**
 * 現在のタスクから新しくタスクを生成する
 */
function add_task() {
    getCurrentTab(function(current) {
        chrome.tabs.create({
            active: false
        }, function(newTab) {
            search_and_add(current, newTab);
        });
    });
}

/**
 * trees から親となるタブを探しだして、その子として追加
 * 親がなければ trees にツリールートとして追加
 */
function search_and_add(parent, child) {
    // alert("" + parent.title + "," + child.title);
    var t = search(parent);
    if (t) {
        t.addChild(new Tree(child));
        // alert("add:" + parent.title + "->" + child.title);
    } else {
        trees.push(new Tree(child));
        // alert("add root");
    }
}

/**
 * trees からタブを指定して検索
 * @return 見つかれば Tree, 見つからなければ null
 */
function search(tab) {
    for (var i = 0; i < trees.length; ++i) {
        var tree = trees[i];
        var t = tree.has(tab);
        if (t) { return t; }
    }
    return null;
}

/**
 * 現在のタブを後回しにする
 */
function later() {
    getCurrentTab(function(tab) {
        var tree = search(tab);
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
                target = tree.children[0];
            }
            chrome.tabs.update(target.node.id, {active: true});

            // 今までのタブを末っ子にする
            if (tree.parent && tree.isLeaf()) {
                tree.parent.removeChild(tree);
                tree.parent.addChild(new Tree(tab));
            }
        }
    });
}

/**
 * 現在のタブを取得する
 */
function getCurrentTab(func) {
    chrome.tabs.query({
        windowId: chrome.windows.WINDOW_ID_CURRENT,
        active: true
    }, function(tabs) {
        func(tabs[0]);
    });
}
