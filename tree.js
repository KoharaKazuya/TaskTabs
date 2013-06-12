function Tree(tab) {
    this.node = tab;
    this.children = [];
}

Tree.prototype.addChild = function(child) {
    child.parent = this;
    var childNum = this.children.length;
    if (childNum > 0) {
        this.children[childNum-1].brother = child;
    }
    this.children.push(child);
};

Tree.prototype.removeChild = function(child) {
    var targetIndex;
    for (var i = 0; i < this.children.length; ++i) {
        if (child.node.id === this.children[i].node.id) {
            targetIndex = i;
        }
    }
    if (targetIndex > 0) {
        this.children[targetIndex-1].brother = child.brother;
    }
    this.children.splice(targetIndex, 1);
};

/**
 * このノードまたは子孫に要素を持つか
 * 持つ場合はその Tree オブジェクトを返す
 */
Tree.prototype.has = function(tab) {
    if (this.node.id === tab.id) {
        return this;
    } else {
        for (var i = 0; i < this.children.length; ++i) {
            var child = this.children[i];
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
    return this.children.length === 0;
};
