var data = {
    a: "test",
    b: [1,2,3],
    c: [{prop: "a"}, {}, {prop: "c"}]
};

collect.install();
module("collect");
test("collect returns an empty array if from is not a function", function () {
    var results = collect();
    ok(Array.isArray(results));
    ok(results.length === 0);
});
test("col works like collect but with partial application", function () {
    ok(col(from(twitter_data)("results"))(having("entities.urls"))().length === 3);
});
test("from returns an array", function () {
    ok(Array.isArray(from(data)("a")()));
});
test("from returns a copy of an array", function () {
    ok(Array.isArray(from(data)("b")()));
    ok(from(data)("b")() !== data.b);
});

test("take will limit the number of results", function () {
    equal(collect(from(twitter_data)("results")).length, 8);
    equal(collect(from(twitter_data)("results"), null, take(4)).length, 4);
});
test("skip", function () {
    var getTweets = col(from(twitter_data)("results"));
    ok(getTweets().length === 8);
    ok(getTweets(skip(3))().length === 5);
});
test("last", function () {
    var getTweets = col(from(twitter_data)("results"));
    ok(getTweets()[7] === getTweets(last)()[0]);
});
test("collect filters results (no DSL)", function () {
    var results = collect(from(twitter_data)("results"), eq("id")(122078461840982016), take(1));
    ok(results.length === 1);
    ok(results[0].id === 122078461840982016);
});
test("collect filters results (DSL1)", function () {
    var one = take(1);
    var limit = papply(collect)(2);
    var tweet = from(twitter_data)("results");
    var withId = eq("id");
    var query = limit(one)(tweet)(withId(122078461840982016));
    ok(query().length === 1);
    ok(query()[0].id === 122078461840982016);
});
test("collect filters results (DSL2)", function () {
    var one = take(1);
    var limit = papply(collect)(2);
    var tweet = from(twitter_data)("results");
    var withId = eq("id");
    var first = limit(one);
    var query = first(tweet)(withId(122078461840982016));
    ok(query().length === 1);
    ok(query()[0].id === 122078461840982016);
});
test("deep eq", function () {
    ok(collect(from(twitter_data)("results"), eq("metadata.result_type")("popular")).length === 3);
});
test("having tests existence", function () {
    var results = collect(from(data)("c"), having("prop"));
    ok(results.length === 2);
});
test("orderby creates a function used to derive values to sort by", function () {
    var sortByDate = papply(collect)(3)(orderBy(function (item) {
        return new Date(item.created_at);
    }));
    var results = sortByDate(from(twitter_data)("results"))();
    ok(results[0].id === 122078461840982016);
});
test("deep having collect", function () {
    ok(collect(from(twitter_data)("results"), having("entities.urls")).length === 3);
});
test("comparison operators as filter functions", function () {
    var getTweets = col(from(twitter_data)("results"));
    var withId = eq("id");
    var afterId = gt("id");
    var withOrafterId = gte("id");
    var beforeId = lt("id");
    var withOrbeforeId = lte("id");
    var id = 122078309004742656;
    ok(getTweets(withId(id))().length === 1);
    ok(getTweets(afterId(id))().length === 2);
    ok(getTweets(withOrafterId(id))().length === 3);
    ok(getTweets(beforeId(id))().length === 5);
    ok(getTweets(withOrbeforeId(id))().length === 6);
    ok(getTweets(or(afterId(id), beforeId(id))())().length === 7);
    ok(getTweets(and(beforeId(id), eq("metadata.result_type", "recent"))())().length === 2);
});