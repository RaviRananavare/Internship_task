class Cache {
  constructor() {
    this.store = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  _key(k) {
    if (typeof k !== "string" || !k) {
      throw new TypeError("Cache key must be a non-empty string");
    }
  }

  _remove(k) {
    const e = this.store.get(k);

    if (!e) {
      return false;
    }

    if (e.timer) {
      clearTimeout(e.timer);
    }

    return this.store.delete(k);
  }

  _expired(k, e) {
    if (e.expiresAt !== null && Date.now() >= e.expiresAt) {
      this._remove(k);
      return true;
    }

    return false;
  }

  set(k, v, ttl) {
    this._key(k);

    if (
      ttl !== undefined &&
      (!Number.isFinite(ttl) || ttl <= 0)
    ) {
      throw new TypeError(
        "TTL must be a positive number of seconds"
      );
    }

    this._remove(k);

    const ex =
      ttl === undefined
        ? null
        : Date.now() + ttl * 1000;

    const timer =
      ex === null
        ? null
        : setTimeout(
            () => this._remove(k),
            ttl * 1000
          );

    this.store.set(k, {
      value: v,
      expiresAt: ex,
      timer
    });

    return this;
  }

  get(k) {
    this._key(k);

    const e = this.store.get(k);

    if (!e || this._expired(k, e)) {
      this.misses++;
      return undefined;
    }

    this.hits++;
    return e.value;
  }

  del(k) {
    this._key(k);
    return this._remove(k);
  }

  clear() {
    for (const e of this.store.values()) {
      if (e.timer) {
        clearTimeout(e.timer);
      }
    }

    this.store.clear();

    return this;
  }

  has(k) {
    this._key(k);

    const e = this.store.get(k);

    return !!e && !this._expired(k, e);
  }

  ttl(k, ttl) {
    this._key(k);

    if (!Number.isFinite(ttl) || ttl <= 0) {
      throw new TypeError(
        "TTL must be a positive number of seconds"
      );
    }

    const e = this.store.get(k);

    if (!e || this._expired(k, e)) {
      return false;
    }

    if (e.timer) {
      clearTimeout(e.timer);
    }

    e.expiresAt = Date.now() + ttl * 1000;

    e.timer = setTimeout(
      () => this._remove(k),
      ttl * 1000
    );

    return true;
  }

  stats() {
    for (const [k, e] of this.store) {
      this._expired(k, e);
    }

    const n = this.hits + this.misses;

    return {
      totalEntries: this.store.size,
      totalHits: this.hits,
      totalMisses: this.misses,
      hitRate: n ? this.hits / n : 0
    };
  }
}

module.exports = Cache;
module.exports.Cache = Cache;