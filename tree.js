function Tree(node) {
    this.node = node;
    this.children = [];
}

Tree.prototype.addChild = function(child) {
    this.children.push(child);
};

Tree.prototype.has = function(node) {
    if (this.node.id === node.id) {
        return this;
    } else {
        for (var i = 0; i < this.children.length; ++i) {
            var child = this.children[i];
            var t = child.has(node);
            if (t) { return t; }
        }
        return null;
    }
};
