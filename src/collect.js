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
     * @param func
     * @return {Function}
     */
    function memoize(func) {
        var cache = (func.memoize = func.memoize || {});
        return function (arg) {
            return (arg in cache) ? cache[arg] : cache[arg] = func.call(this, arg);
        };
    }

    /**
     * reaplces the first undefined parameter with val
     * @param val
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
     * creates a function to which bound arguments may curry further arguments
     * @param fn
     * @returns {Function}
     */
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
    /**
     * depth-first approach to property access
     * @type {Function}
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
     * @param path
     */
    getSegments = memoize(function (path) {
        return path ? path.split ? path.split(".") : path : [];
    }),
    api = {
        /**
         * @param from
         * @param where
         * @param limit
         * @param transform
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
        /**
         * @param fn
         * @returns {Function}
         */
        partial: function (fn) {
            return function (pos) {
                return function (arg) {
                    var args = [];
                    args[pos] = arg;
                    return partialApply(fn)(args);
                };
            };
        },
        /**
         * @param quantity
         * @returns {Function}
         */
        limitTo: function (quantity) {
            return function (item, results) {
                return results.length === quantity;
            };
        },
        /**
         * @param path
         * @returns {Function}
         */
        having: function (path) {
            return function (obj) {
                return !!(obj && get(path, obj));
            }
        },
        /**
         * @param path
         * @returns {Function}
         */
        eq: function (path) {
            return function (val) {
                return function (obj) {
                    return !!(obj && get(path, obj) === val);
                };
            };
        },
        /**
         * @param getVal
         * @returns {Function}
         */
        orderBy: function (getVal) {
            return function (arr) {
                return arr.sort(function (a, b) {
                    var aVal = getVal(a);
                    var bVal = getVal(b);
                    return aVal === bVal ? 0 : bVal > aVal ? 1 : -1;
                });
            };
        },
        /**
         * @param path
         * @param obj
         * @returns {*}
         */
        get: function (path, obj) {
            var params = getSegments(path);
            return getDepth(params.length).apply(obj || this, params);
        },
        /**
         * takes an object then returns a function which takes a string
         * @returns {Function}
         */
        from: function () {
            return partialApply(function (obj, path) {
                var val = get(path, obj);
                return Array.isArray(val) ? val.slice(0) : [val];
            })(arguments);
        }
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