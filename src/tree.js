function Tree(type, node) {
    this.type = type;
    this.node = node;
}

Tree.prototype.equals = function(obj) {
    if (obj && obj.type === this.type) {
        switch (this.type) {
            case "root":
            case "window":
                return obj.node === this.node;
            case "tab":
                if (obj.node === undefined && this.node === undefined) {
                    return true;
                } else if (obj.node === undefined || this.node === undefined) {
                    return false;
                } else {
                    return obj.node.id === this.node.id;
                }
        }
    }
    return false;
};

Tree.prototype.toString = function() {
    var str = "";

    switch (this.type) {
        case "root":
            str += "==========";
            break;
        case "window":
            str += "----------";
            break;
        case "tab":
            if (this.node) {
                str += " " + this.node.title;
            } else {
                str += " Blank";
            }
            break;
    }

    var children = this.getChildren();
    for (var i = 0; i < children.length; ++i) {
        var child = children[i];
        var childStr = child.toString();
        if (i != children.length-1) {
            childStr = childStr.replace(/^/mg, "│");
            childStr = childStr.replace(/^│/, "├");
        } else {
            childStr = childStr.replace(/^/mg, "　");
            childStr = childStr.replace(/^　/, "└");
        }
        str += "\n" + childStr;
    }
    return str;
};

Tree.prototype.destroy = function() {
    if (this.parent) {
        var children = this.getChildren();

        // 自身の子どもたちの親は、自身から自身の親になる
        for (var i = 0; i < children.length; ++i) {
            children[i].parent = this.parent;
        }

        if (this.equals(this.parent.child)) {
            if (this.child) {
                // 自身の親の長男は、自身から自身の長男になる
                this.parent.child = this.child;
            } else {
                // 自身の親の長男は、自身の弟になる
                this.parent.child = this.brother;
            }
        } else {
            // 自身の兄の弟は、自身から自身の弟になる
            var bigBrother = this.parent.child;
            while (this.equals(bigBrother.brother)) {
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

Tree.prototype.update = function() {
    if (this.type === "tab" && this.node) {
        var _this = this;
        chrome.tabs.get(this.node.id, function(tab) {
            _this.node = tab;
        });
    }
    var children = this.getChildren();
    for (var i = 0; i < children.length; ++i) {
        children[i].update();
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
Tree.prototype.has = function(type, node) {
    if (this.equals(new Tree(type, node))) {
        return this;
    } else {
        var children = this.getChildren();
        for (var i = 0; i < children.length; ++i) {
            var child = children[i];
            var t = child.has(type, node);
            if (t) { return t; }
        }
        return null;
    }
};

/**
 * 子要素を持たないか
 */
Tree.prototype.isLeaf = function() {
    return !this.child;
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
