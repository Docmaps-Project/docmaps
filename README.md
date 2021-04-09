# DocMaps

A community-endorsed framework for representing research object-level (e.g. journal article, preprint, or dataset) review/editorial processes in a machine-readable, discoverable, and extensible format.

More info: https://docmaps.knowledgefutures.org

## About This Repo

This repo defines a basic initial schema using JSON schema, a validation tool, and two example schemas for a review and author response based on https://sciety.org/articles/activity/10.1101/2020.12.15.422694

The schema includes annotation and definition. Also included are two annotated schemas (invalid JSON, but quite helpful), which provide more details about the thinking of specific fields in DocMaps.

## Usage

`npm run validate -- --docmap ./path-to-file.json`

Try it out with:

`npm run validate -- --docmap ./review.json`

## Create a DocMap!

Eventually we'll implement our own playground. For now, you can use this one to generate your own DocMaps using a form input, **[https://rjsf-team.github.io/react-jsonschema-form/#eyJmb3JtRGF0YSI6eyJjb250ZW50VHlwZSI6IiIsImNvbnRlbnQiOiIiLCJwZXJtYWxpbmsiOiIiLCJwb2xpY3kiOiIiLCJwcm92aWRlciI6IiIsImFzc2VydGVyIjoiIiwiYXNzZXJ0ZWRPbiI6IiIsImNyZWF0ZWRPbiI6IiIsImNvbXBsZXRlZE9uIjoiIiwiZG9pIjoiIiwiaXNSZXZpZXdPZiI6W10sImNvbnRyaWJ1dG9ycyI6W10sInJldmlld3MiOltdLCJmaXJzdE5hbWUiOiJDaHVjayIsImxhc3ROYW1lIjoiTm9ycmlzIiwiYWdlIjo3NSwiYmlvIjoiUm91bmRob3VzZSBraWNraW5nIGFzc2VzIHNpbmNlIDE5NDAiLCJwYXNzd29yZCI6Im5vbmVlZCJ9LCJzY2hlbWEiOnsiJHNjaGVtYSI6Imh0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDcvc2NoZW1hIiwiJGlkIjoiaHR0cDovL2V4YW1wbGUuY29tL2V4YW1wbGUuanNvbiIsInR5cGUiOiJvYmplY3QiLCJ0aXRsZSI6IlRoZSByb290IERvY01hcCBzY2hlbWEiLCJkZXNjcmlwdGlvbiI6IlRoZSByb290IHNjaGVtYSBjb21wcmlzZXMgdGhlIGVudGlyZSBkb2NtYXAuIiwiZGVmYXVsdCI6e30sInJlcXVpcmVkIjpbImNvbnRlbnRUeXBlIiwiY29udGVudCJdLCJkZWZpbml0aW9ucyI6eyJjb250cmlidXRvciI6eyJ0eXBlIjoib2JqZWN0IiwidGl0bGUiOiJUaGUgY29udHJpYnV0b3Igc2NoZW1hIiwiZGVzY3JpcHRpb24iOiJBIGNvbnRyaWJ1dG9yLiIsImRlZmF1bHQiOnt9LCJyZXF1aXJlZCI6WyJyb2xlIl0sInByb3BlcnRpZXMiOnsibmFtZSI6eyIkaWQiOiIjL2RlZmluaXRpb25zL2NvbnRyaWJ1dG9yL25hbWUiLCJ0eXBlIjoic3RyaW5nIiwidGl0bGUiOiJUaGUgbmFtZSBzY2hlbWEiLCJkZXNjcmlwdGlvbiI6IlRoZSBuYW1lIG9mIHRoZSBjb250cmlidXRvci4iLCJkZWZhdWx0IjoiIiwiZXhhbXBsZXMiOlsiIl19LCJhZmZpbGlhdGlvbnMiOnsiJGlkIjoiIy9kZWZpbml0aW9ucy9jb250cmlidXRvci9hZmZpbGlhdGlvbnMiLCJ0eXBlIjoiYXJyYXkiLCJ0aXRsZSI6IlRoZSBhZmZpbGlhdGlvbnMgc2NoZW1hIiwiZGVzY3JpcHRpb24iOiJBbiBleHBsYW5hdGlvbiBhYm91dCB0aGUgcHVycG9zZSBvZiB0aGlzIGluc3RhbmNlLiIsImRlZmF1bHQiOltdLCJleGFtcGxlcyI6W1tdXX0sImlkIjp7IiRpZCI6IiMvZGVmaW5pdGlvbnMvY29udHJpYnV0b3IvaWQiLCJ0eXBlIjoic3RyaW5nIiwidGl0bGUiOiJUaGUgaWQgc2NoZW1hIiwiZGVzY3JpcHRpb24iOiJBbiBpbnRlcm5hbCBJRCBmb3IgdGhlIGNvbnRyaWJ1dG9yLCB1c2VmdWwgaWYgdGhlIGNvbnRyaWJ1dG9yIGlzIGFub255bW91cy4iLCJkZWZhdWx0IjoiIiwiZXhhbXBsZXMiOlsiIl19LCJvcmNpZCI6eyIkaWQiOiIjL2RlZmluaXRpb25zL2NvbnRyaWJ1dG9yL29yY2lkIiwidHlwZSI6InN0cmluZyIsInRpdGxlIjoiVGhlIG9yY2lkIHNjaGVtYSIsImRlc2NyaXB0aW9uIjoiVGhlIE9SQ0lEIG9mIHRoZSBjb250cmlidXRvci4iLCJkZWZhdWx0IjoiIiwiZXhhbXBsZXMiOlsiIl19LCJyb2xlIjp7IiRpZCI6IiMvZGVmaW5pdGlvbnMvY29udHJpYnV0b3Ivcm9sZSIsInR5cGUiOiJzdHJpbmciLCJlbnVtIjpbImF1dGhvciIsInJldmlld2VyIiwiZWRpdG9yIl0sInRpdGxlIjoiVGhlIHJvbGUgc2NoZW1hIiwiZGVzY3JpcHRpb24iOiJUaGUgcm9sZSBvZiB0aGUgY29udHJpYnV0b3IuIiwiZGVmYXVsdCI6IiIsImV4YW1wbGVzIjpbImVkaXRvciJdfX19fSwicHJvcGVydGllcyI6eyJjb250ZW50VHlwZSI6eyIkaWQiOiIjL3Byb3BlcnRpZXMvY29udGVudFR5cGUiLCJ0eXBlIjoic3RyaW5nIiwiZW51bSI6WyJyZXZpZXciLCJhdXRob3JfcmVzcG9uc2UiLCJhcnRpY2xlIl0sInRpdGxlIjoiVGhlIGNvbnRlbnRUeXBlIHNjaGVtYSIsImRlc2NyaXB0aW9uIjoiRGVzY3JpYmVzIHRoZSB0eXBlIG9mIGNvbnRlbnQuIiwiZGVmYXVsdCI6IiIsImV4YW1wbGVzIjpbInJldmlldyJdfSwiY29udGVudCI6eyIkaWQiOiIjL3Byb3BlcnRpZXMvY29udGVudCIsInR5cGUiOiJzdHJpbmciLCJ0aXRsZSI6IlRoZSBjb250ZW50IHNjaGVtYSIsImRlc2NyaXB0aW9uIjoiQSB1cmkgcG9pbnRpbmcgdG8gdGhlIG1vc3QgY2Fub25pY2FsIHZlcnNpb24gb2YgdGhlIGNvbnRlbnQuIiwiZGVmYXVsdCI6IiIsImV4YW1wbGVzIjpbImh0dHBzOi8vaHlwLmlzL0g3aFR4bDhtRWV1Snp0ZkE5R3hKOUEvd3d3LmJpb3J4aXYub3JnL2NvbnRlbnQvMTAuMTEwMS8yMDIwLjEyLjE1LjQyMjY5NHYxIl19LCJwZXJtYWxpbmsiOnsiJGlkIjoiIy9wcm9wZXJ0aWVzL3Blcm1hbGluayIsInR5cGUiOiJzdHJpbmciLCJ0aXRsZSI6IlRoZSBwZXJtYWxpbmsgc2NoZW1hIiwiZGVzY3JpcHRpb24iOiJBIHVyaSBwb2ludGluZyB0byBhIGRlc2NyaXB0aW9uIG9mIHRoZSBwb2xpY3kvcHJvY2VzcyB1c2VkLiIsImRlZmF1bHQiOiIiLCJleGFtcGxlcyI6WyJodHRwczovL3NjaWV0eS5vcmcvZ3JvdXBzL2I1NjAxODdlLWYyZmItNGZmOS1hODYxLWEyMDRmM2ZjMGZiMCJdfSwicG9saWN5Ijp7IiRpZCI6IiMvcHJvcGVydGllcy9wb2xpY3kiLCJ0eXBlIjoic3RyaW5nIiwidGl0bGUiOiJUaGUgcG9saWN5IHNjaGVtYSIsImRlc2NyaXB0aW9uIjoiQW4gZXhwbGFuYXRpb24gYWJvdXQgdGhlIHB1cnBvc2Ugb2YgdGhpcyBpbnN0YW5jZS4iLCJkZWZhdWx0IjoiIiwiZXhhbXBsZXMiOlsiaHR0cHM6Ly9zY2lldHkub3JnL2dyb3Vwcy9iNTYwMTg3ZS1mMmZiLTRmZjktYTg2MS1hMjA0ZjNmYzBmYjAiXX0sInByb3ZpZGVyIjp7IiRpZCI6IiMvcHJvcGVydGllcy9wcm92aWRlciIsInR5cGUiOiJzdHJpbmciLCJ0aXRsZSI6IlRoZSBwcm92aWRlciBzY2hlbWEiLCJkZXNjcmlwdGlvbiI6IlRoZSByb290IGRvbWFpbiBvZiB0aGUgcHJvdmlkZXIgb2YgdGhlIGRvY21hcCIsImRlZmF1bHQiOiIiLCJleGFtcGxlcyI6WyJodHRwczovL3NjaWV0eS5vcmciXX0sImFzc2VydGVyIjp7IiRpZCI6IiMvcHJvcGVydGllcy9hc3NlcnRlciIsInR5cGUiOiJzdHJpbmciLCJ0aXRsZSI6IlRoZSBhc3NlcnRlciBzY2hlbWEiLCJkZXNjcmlwdGlvbiI6IlRoZSByb290IGRvbWFpbiBvZiB0aGUgYXNzZXJ0ZXIgb2YgdGhlIGRvY21hcC4iLCJkZWZhdWx0IjoiIiwiZXhhbXBsZXMiOlsiaHR0cHM6Ly9lbGlmZS5vcmciXX0sImFzc2VydGVkT24iOnsiJGlkIjoiIy9wcm9wZXJ0aWVzL2Fzc2VydGVkT24iLCJ0eXBlIjoic3RyaW5nIiwidGl0bGUiOiJUaGUgYXNzZXJ0ZWRPbiBzY2hlbWEiLCJkZXNjcmlwdGlvbiI6IlRoZSB0aW1lc3RhbXAgd2hlbiB0aGUgYXNzZXJ0aW9uIGl0c2VsZiB3YXMgbWFkZS4iLCJkZWZhdWx0IjoiIiwiZXhhbXBsZXMiOlsiMDEtMjUtMjAyMVQxMDo1ODowMFoiXX0sImNyZWF0ZWRPbiI6eyIkaWQiOiIjL3Byb3BlcnRpZXMvY3JlYXRlZE9uIiwidHlwZSI6InN0cmluZyIsInRpdGxlIjoiVGhlIGNyZWF0ZWRPbiBzY2hlbWEiLCJkZXNjcmlwdGlvbiI6IlRoZSB0aW1lc3RhbXAgd2hlbiB0aGUgb2JqZWN0IHdhcyBjcmVhdGVkLCBlLmcuLCB3aGVuIGEgcmV2aWV3IHByb2Nlc3MgYmVnYW4uIiwiZGVmYXVsdCI6IiIsImV4YW1wbGVzIjpbIjAxLTI1LTIwMjFUMTA6NTg6MDBaIl19LCJjb21wbGV0ZWRPbiI6eyIkaWQiOiIjL3Byb3BlcnRpZXMvY29tcGxldGVkT24iLCJ0eXBlIjoic3RyaW5nIiwidGl0bGUiOiJUaGUgY29tcGxldGVkT24gc2NoZW1hIiwiZGVzY3JpcHRpb24iOiJUaGUgdGltZXN0YW1wIHdoZW4gdGhlIG9iamVjdCB3YXMgY29tcGxldGVkL3B1Ymxpc2hlZCwgZS5nLiwgd2hlbiBhIHBhcGVyIHdhcyBwdWJsaXNoZWQsIHdoZW4gYSByZXZpZXcgd2FzIGFjY2VwdGVkLiIsImRlZmF1bHQiOiIiLCJleGFtcGxlcyI6WyIwMS0yNS0yMDIxVDEwOjU4OjAwWiJdfSwiZG9pIjp7IiRpZCI6IiMvcHJvcGVydGllcy9kb2kiLCJ0eXBlIjoic3RyaW5nIiwicGF0dGVybiI6Il4xMC5cXGR7NCw5fS9bLS5fOygpLzpBLVowLTldKyQiLCJ0aXRsZSI6IlRoZSBkb2kgc2NoZW1hIiwiZGVzY3JpcHRpb24iOiJUaGUgZG9pIG9mIHRoZSBvYmplY3QuIiwiZGVmYXVsdCI6IiIsImV4YW1wbGVzIjpbIjEwLjExMDEvMjAyMC4xMi4xNS40MjI2OTQiXX0sImlzUmV2aWV3T2YiOnsiJGlkIjoiIy9wcm9wZXJ0aWVzL2lzUmV2aWV3T2YiLCJ0eXBlIjoiYXJyYXkiLCJ0aXRsZSI6IlRoZSBpc1Jldmlld09mIHNjaGVtYSIsImRlc2NyaXB0aW9uIjoiQSBsaXN0IG9mIERvY01hcHMgb3IgcmVmZXJlbmNlcyB0byBEb2NNYXBzIHRoYXQgdGhpcyBEb2NNYXAgaXMgcmV2aWV3aW5nLiIsImRlZmF1bHQiOltdLCJpdGVtcyI6eyIkcmVmIjoiIyJ9fSwiY29udHJpYnV0b3JzIjp7IiRpZCI6IiMvcHJvcGVydGllcy9jb250cmlidXRvcnMiLCJ0eXBlIjoiYXJyYXkiLCJ0aXRsZSI6IlRoZSBjb250cmlidXRvcnMgc2NoZW1hIiwiZGVzY3JpcHRpb24iOiJBIGxpc3Qgb2YgY29udHJpYnV0b3JzIHRvIHRoaXMgRG9jTWFwLiIsImRlZmF1bHQiOltdLCJpdGVtcyI6eyIkcmVmIjoiIy9kZWZpbml0aW9ucy9jb250cmlidXRvciJ9fSwicmV2aWV3cyI6eyIkaWQiOiIjL3Byb3BlcnRpZXMvcmV2aWV3cyIsInR5cGUiOiJhcnJheSIsInRpdGxlIjoiVGhlIHJldmlld3Mgc2NoZW1hIiwiZGVzY3JpcHRpb24iOiJBIGxpc3Qgb2YgRG9jTWFwcy4iLCJkZWZhdWx0IjpbXSwiaXRlbXMiOnsiJHJlZiI6IiMifX19fSwidWlTY2hlbWEiOnsiZmlyc3ROYW1lIjp7InVpOmF1dG9mb2N1cyI6dHJ1ZSwidWk6ZW1wdHlWYWx1ZSI6IiIsInVpOmF1dG9jb21wbGV0ZSI6ImZhbWlseS1uYW1lIn0sImxhc3ROYW1lIjp7InVpOmVtcHR5VmFsdWUiOiIiLCJ1aTphdXRvY29tcGxldGUiOiJnaXZlbi1uYW1lIn0sImFnZSI6eyJ1aTp3aWRnZXQiOiJ1cGRvd24iLCJ1aTp0aXRsZSI6IkFnZSBvZiBwZXJzb24iLCJ1aTpkZXNjcmlwdGlvbiI6IihlYXJ0aGlhbiB5ZWFyKSJ9LCJiaW8iOnsidWk6d2lkZ2V0IjoidGV4dGFyZWEifSwicGFzc3dvcmQiOnsidWk6d2lkZ2V0IjoicGFzc3dvcmQiLCJ1aTpoZWxwIjoiSGludDogTWFrZSBpdCBzdHJvbmchIn0sImRhdGUiOnsidWk6d2lkZ2V0IjoiYWx0LWRhdGV0aW1lIn0sInRlbGVwaG9uZSI6eyJ1aTpvcHRpb25zIjp7ImlucHV0VHlwZSI6InRlbCJ9fX0sInRoZW1lIjoiZGVmYXVsdCIsImxpdmVTZXR0aW5ncyI6eyJ2YWxpZGF0ZSI6ZmFsc2UsImRpc2FibGUiOmZhbHNlLCJvbWl0RXh0cmFEYXRhIjpmYWxzZSwibGl2ZU9taXQiOmZhbHNlfX0=](here)**.

## To Do

- Fix schema to include anyOf "#", "docmap" in required
- Add isAuthorResponseTo property
- Break the schema out into its own file
- Expand the schema to accomadate more examples
- Better validation of domains for providers (right now using URI validation)
