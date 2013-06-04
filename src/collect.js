(function (global) {
    /**
     * shim isArray
     */
    if(!Array.isArray) {
        Array.isArray = function (vArg) {
            return Object.prototype.toString.call(vArg) === "[object Array]";
        };
    }
    /**
     * memoizes a single primitive argument
     * @param fn {Function}
     * @return {Function}
     */
    function memoize(fn) {
        var cache = (fn.memoize = fn.memoize || {});
        return function (arg) {
            return (arg in cache) ? cache[arg] : cache[arg] = fn.call(this, arg);
        };
    }

    /**
     * reaplces the first undefined parameter with val
     * @param val {*}
     * @returns {Function}
     */
    function fill(val) {
        return function (arr) {
            var copy = Array.prototype.slice.call(arr, 0);
            for (var i = 0, len = copy.length + 1; i < len; i += 1) {
                if (typeof copy[i] === "undefined") {
                    copy[i] = val;
                    return copy;
                }
            }
        };
    }

    /**
     * @param n {number}
     * @returns {Function}
     */
    function part(n) {
        return function (fn) {
            return function apply(args) {
                if (args.length >= n ) {
                    return fn.apply(this, args);
                }
                return function curry(arg) {
                    if (args.length >= n - 1) {
                        return fn.apply(this, fill(arg)(args));
                    }
                    return apply(fill(arg)(args));
                };
            };
        };
    }
    /**
     * creates a function to which bound arguments may curry further arguments
     * @param fn {Function}
     * @returns {Function}
     */
    function lpartial(fn) {
        return function apply(args) {
            return function curry(arg) {
                if (arguments.length === 0) {
                    return fn.apply(this, args);
                }
                return apply(fill(arg)(args));
            };
        };
    }
    /**
     * depth-first approach to property access
     * @param depth {number}
     */
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
    /**
     * splits string representations of paths into segments
     * @param path {string}
     */
    getSegments = memoize(function (path) {
        return path ? path.split ? path.split(".") : path : [];
    }),
    get = function () {
        return part(2)(function (path, obj) {
            var params = getSegments(path);
            return getDepth(params.length).apply(obj || this, params);
        })(arguments);
    },
    /**
     * identify fn for arrays
     * @param obj
     * @returns {Function}
     */
    all = function (obj) {
        return function () {
            return Array.isArray(obj) ? obj.slice(0) : [obj];
        };
    },
    api = {
        /**
         * @param from {Function}
         * @param where {Function}
         * @param limit {Function}
         * @param transform {Function}
         * @returns {Array}
         */
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
        partial: function () {
            return part(3)(function (fn, pos, arg) {
                var args = [];
                args[pos] = arg;
                return lpartial(fn)(args);
            })(arguments);
        },
        take: function (quantity) {
            return function (item, results) {
                return results.length === quantity;
            };
        },
        having: function () {
            return part(2)(function (path, obj) {
                return !!(obj && get(path, obj));
            })(arguments);
        },
        eq: function () {
            return part(3)(function (path, val, obj) {
                return !!(obj && get(path, obj) === val);
            })(arguments);
        },
        gt: function () {
            return part(3)(function (path, val, obj) {
                return !!(obj && get(path, obj) > val);
            })(arguments);
        },
        gte: function () {
            return part(3)(function (path, val, obj) {
                return !!(obj && get(path, obj) >= val);
            })(arguments);
        },
        lt: function () {
            return part(3)(function (path, val, obj) {
                return !!(obj && get(path, obj) < val);
            })(arguments);
        },
        lte: function () {
            return part(3)(function (path, val, obj) {
                return !!(obj && get(path, obj) <= val);
            })(arguments);
        },
        orderBy: function () {
            return part(2)(function (getVal, arr) {
                return arr.sort(function (a, b) {
                    var aVal = getVal(a);
                    var bVal = getVal(b);
                    return aVal === bVal ? 0 : bVal > aVal ? 1 : -1;
                });
            })(arguments);
        },
        from: function () {
            return lpartial(function (obj, path) {
                return all(get(path, obj))();
            })(arguments);
        },
        col: function () {
            return lpartial(collect)(arguments);
        },
        get: get,
        all: all
    };
    global.collect = {
        /**
         * installs the collect api to an object or global
         * @param obj
         */
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