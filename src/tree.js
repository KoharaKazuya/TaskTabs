function Tree(tab) {
    this.node = tab;
}

Tree.prototype.destroy = function() {
    if (this.parent) {
        var children = this.getChildren();

        // 自身の子どもたちの親は、自身から自身の親になる
        for (var i = 0; i < children.length; ++i) {
            children[i].parent = this.parent;
        }

        if (this.parent.child.node.id === this.node.id) {
            // 自身の親の長男は、自身から自身の長男になる
            this.parent.child = this.child;
        } else {
            // 自身の兄の弟は、自身から自身の弟になる
            var bigBrother = this.parent.child;
            while (bigBrother.brother.node.id === this.node.id) {
                bigBrother = bigBrother.brother;
            }
            bigBrother.brother = this.brother;
        }

        // 自身の末の子供の弟は、自身の弟になる
        if (children.length > 0) {
            children[children.length-1].brother = this.brother;
        }
    }
};

Tree.prototype.getChildren = function() {
    var children = [];
    var child = this.child;
    while (child) {
        children.push(child);
        child = child.brother;
    }
    return children;
};

Tree.prototype.addChild = function(tree) {
    tree.parent = this;

    var children = this.getChildren();
    if (children.length > 0) {
        children[children.length-1].brother = tree;
    } else {
        this.child = tree;
    }
};

/**
 * このノードまたは子孫に要素を持つか
 * 持つ場合はその Tree オブジェクトを返す
 */
Tree.prototype.has = function(tab) {
    if (this.node.id === tab.id) {
        return this;
    } else {
        var children = this.getChildren()
        for (var i = 0; i < children.length; ++i) {
            var child = children[i];
            var t = child.has(tab);
            if (t) { return t; }
        }
        return null;
    }
};

/**
 * 子要素を持たないか
 */
Tree.prototype.isLeaf = function() {
    return this.getChildren().length === 0;
};

/**
 * 自身と子孫要素全てを配列に格納して返す
 */
Tree.prototype.flatten = function() {
    var f = [this];
    var children = this.getChildren();
    for (var i = 0; i < children.length; ++i) {
        f = f.concat(children[i].flatten());
    }
    return f;
};
