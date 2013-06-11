var trees = [];

/**
 * 現在のタスクから新しくタスクを生成する
 */
function add_task() {
    chrome.tabs.getCurrent(function(current) {
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
    alert("" + parent.title + "," + child.title);
    var t = search(parent);
    if (t) {
        t.addChild(child);
        alert("add:" + parent + "->" + child);
    } else {
        trees.push(new Tree(child));
        alert("add root");
    }
}

/**
 * trees からタブを指定して検索
 * @return 見つかれば Tree, 見つからなければ null
 */
function search(node) {
    for (var i = 0; i < trees.length; ++i) {
        var tree = trees[i];
        var t = tree.has(node);
        if (t) { return t; }
    }
    return null;
}
