# Task 9 – Simple Cache Layer

In-memory cache with TTL, automatic expiration, multiple data types, deletion, clearing, TTL updates, and statistics.

```js
const Cache=require("./cache");
const cache=new Cache();
cache.set("key","value",300);
cache.get("key");
cache.del("key");
cache.clear();
cache.has("key");
cache.ttl("key",600);
console.log(cache.stats());
```

`stats()` returns total entries, hits, misses, and hit rate. Run `npm test` or `npm run test:coverage`.