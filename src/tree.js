function Tree(tab) {
    this.node = tab;
    this.children = [];
    this.ghost = !tab;
}

Tree.prototype.destroy = function() {
    this.parent.removeChild(this);
};

Tree.prototype.addChild = function(child) {
    child.parent = this;
    var childNum = this.children.length;
    if (childNum > 0) {
        this.children[childNum-1].brother = child;
    }
    this.children.push(child);
};

Tree.prototype.removeChild = function(child) {
    if (child.children.length > 0) {
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
    } else {
        child.setGhost();
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

/**
 * ゴースト化
 * 子要素の関係性を保持したまま、閉じようとした時に
 */
Tree.prototype.setGhost = function() {
    this.ghost = true;
};

/**
 * ゴースト状態か？
 */
Tree.prototype.isGhost = function() {
    return this.ghost;
};

/**
 * 自身と子孫要素全てを配列に格納して返す
 */
Tree.prototype.flatten = function() {
    var f = [this];
    for (var i = 0; i < this.children.length; ++i) {
        f = f.concat(this.children[i].flatten());
    }
    return f;
};
