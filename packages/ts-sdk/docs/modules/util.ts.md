---
title: util.ts
nav_order: 2
parent: Modules
---

## util overview

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [UrlFromString](#urlfromstring)
  - [UrlFromStringC (type alias)](#urlfromstringc-type-alias)
  - [UrlT (type alias)](#urlt-type-alias)

---

# utils

## UrlFromString

URL from String parser

based on example there:
https://github.com/gcanti/io-ts-types/blob/master/src/BooleanFromString.ts

**Signature**

```ts
export declare const UrlFromString: UrlFromStringC
```

Added in v0.1.0

## UrlFromStringC (type alias)

**Signature**

```ts
export type UrlFromStringC = t.Type<URL, string, unknown>
```

Added in v0.1.0

## UrlT (type alias)

Should be the same as a URL.

**Signature**

```ts
export type UrlT = t.TypeOf<typeof UrlFromString>
```

Added in v0.1.0
