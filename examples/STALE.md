# Notes regarding stale examples in the wild

This directory contains examples of docmaps that we expect to work with the published
tools and libraries and protocol semantics. Sometimes, when we deprecate certain
semantics, the old examples may become stale. When that happens, I will mark them
with a `STALE_` prefix and note them here.


`STALE_docmaps-example-embo-01`:
this became stale with the disallowing of the arbitrary key `author-response` as a
`type` of an `output`. Note that an equivalent docmap with the correct `reply` key
is included alongside the deprecating changes.
