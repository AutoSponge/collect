var data = {
    a: "test",
    b: [1,2,3]
};

collect.install();
module("collect");
test("from returns an array", function () {
    ok(Array.isArray(from(data)("a")()));
});
test("from returns a copy of an array", function () {
    ok(Array.isArray(from(data)("b")()));
    ok(from(data)("b")() !== data.b);
});
test("collect filters results (no DSL)", function () {
    var results = collect(from(twitter_data)("results"), eq("id")(122078461840982016), limitTo(1));
    ok(results.length === 1);
    ok(results[0].id === 122078461840982016);
});
test("collect filters results (DSL1)", function () {
    var one = limitTo(1);
    var limit = partial(collect)(2);
    var tweet = from(twitter_data)("results");
    var withId = eq("id");
    var query = limit(one)(tweet)(withId(122078461840982016));
    ok(query().length === 1);
    ok(query()[0].id === 122078461840982016);
});
test("collect filters results (DSL2)", function () {
    var one = limitTo(1);
    var limit = partial(collect)(2);
    var tweet = from(twitter_data)("results");
    var withId = eq("id");
    var first = limit(one);
    var query = first(tweet)(withId(122078461840982016));
    ok(query().length === 1);
    ok(query()[0].id === 122078461840982016);
});