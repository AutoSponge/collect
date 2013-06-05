collect
=======

Library for creating data query DSLs using partial application

For example:
`first(tweet)(withId(12345));` is easier to read

## Difference between lazy and partial
Lazy functions take their arguments as they are provided and execute
as soon as they have enough to execute consistently.  This works best
with functions whose arity is known or can be set.

Partial functions also take their arguments as they are provided however,
if the function is invoked with no arguments it will execute.  This works
best with functions that have optional parameters.  Any variadic function
is a good example.  In some cases, such as data access, it may be important
to bind all arguments ahead of time but not execute the query until
needed--to return the most acurate version of the data.


TODO
==
Lots.  Still a work in progress.
* documentation
* examples