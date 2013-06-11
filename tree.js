function Tree(node) {
    this.node = node;
    this.children = [];
}

Tree.prototype.addChild = function(child) {
    this.children.push(child);
};
