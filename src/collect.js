(function (global) {
    if(!Array.isArray) {
        Array.isArray = function (vArg) {
            return Object.prototype.toString.call(vArg) === "[object Array]";
        };
    }

    /**
     * memoizes a single primitive argument
     * @param func
     * @return {Function}
     */
    function memoize(func) {
        var cache = (func.memoize = func.memoize || {});
        return function (arg) {
            return (arg in cache) ? cache[arg] : cache[arg] = func.call(this, arg);
        };
    }

    function fill(val) {
        return function (arr) {
            var copy = Array.prototype.slice.call(arr, 0);
            for (var i = 0, len = copy.length + 1; i < len; i += 1) {
                if (!copy[i] && typeof copy[i] === "undefined") {
                    copy[i] = val;
                    return copy;
                }
            }
        };
    }

    function partialApply(fn) {
        return function apply(args) {
            return function curry(arg) {
                if (arguments.length === 0) {
                    return fn.apply(this, args);
                }
                return apply(fill(arg)(args));
            };
        };
    }

    var getDepth = memoize(function (depth) {
        var params = "";
        var vars = "  var _0 = this";
        var body = false;
        var h, i;
        for (i = 0; i < depth; i += 1) {
            params += i ? (", $" + i) : "$" + i;
            vars += i ? (", _" + i) : "";
        }
        vars += ";\n";
        for (h = i - 1; i > 0; i -= 1, h -= 1) {
            if (!body) {
                body = "_" + h + " === Object(_" + h + ") && ($" + h + " in _" + h + ") ? _" + h + "[$" + h + "]";
            } else {
                body = "(_" + i + " = _" + h + "[$" + h + "], _" + i + ") && " + body;
            }
        }
        body = "  return " + (!body ? "_0;" : body + " : void(0);");
        return Function(params, vars + body);
    }),
    getPath = memoize(function (path) {
        return path ? path.split ? path.split(".") : path : [];
    }),
    api = {
        collect: function (from, where, limit, transform) {
            var item;
            var results = [];
            var head = [];
            if (!(from instanceof Function)) {
                return results;
            }
            var tail = transform ? transform(from()) : from();
            while (tail && tail.length) {
                item = tail.shift();
                head.push(item);
                if (!where || where(item)) {
                    results.push(item);
                }
                if (limit && limit(item, results, head, tail)) {
                    return results;
                }
            }
            return results;
        },
        partial: function (fn) {
            return function (pos) {
                return function (arg) {
                    var args = [];
                    args[pos] = arg;
                    return partialApply(fn)(args);
                };
            };
        },
        limitTo: function (quantity) {
            return function (item, results) {
                return results.length === quantity;
            };
        },
        has: function (prop) {
            return function (obj) {
                return prop in obj;
            }
        },
        eq: function (prop) {
            return function (val) {
                return function (obj) {
                    return obj[prop] === val;
                };
            };
        },
        orderBy: function (getVal) {
            return function (arr) {
                return arr.sort(function (a, b) {
                    var aVal = getVal(a);
                    var bVal = getVal(b);
                    return aVal === bVal ? 0 : bVal > aVal ? 1 : -1;
                });
            };
        },
        get: function (path, obj) {
            var params = getPath(path);
            return getDepth(params.length).apply(obj || this, params);
        },
        from: function () {
            return partialApply(function (obj, path) {
                var val = get(path, obj);
                return Array.isArray(val) ? val.slice(0) : [val];
            })(arguments);
        },
        makeNumber: function (prop) {
            return function (obj) {
                return Number(obj[prop]) || 0;
            };
        }
    };
    global.collect = {
        install: function (obj) {
            var target = obj || global, key;
            for (key in api) {
                if (api.hasOwnProperty(key)) {
                    target[key] = api[key];
                }
            }
        }
    };
}(this));