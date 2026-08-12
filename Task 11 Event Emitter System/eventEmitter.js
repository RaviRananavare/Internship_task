class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, handler) {
    this._validate(event, handler);
    this._add(event, handler, false);
    return this;
  }

  once(event, handler) {
    this._validate(event, handler);
    this._add(event, handler, true);
    return this;
  }

  off(event, handler) {
    this._validate(event, handler);

    const a = this.events.get(event);

    if (!a) {
      return this;
    }

    const r = a.filter((x) => x.original !== handler);

    if (r.length) {
      this.events.set(event, r);
    } else {
      this.events.delete(event);
    }

    return this;
  }

  async emit(event, data) {
    if (typeof event !== "string" || !event) {
      throw new TypeError("Event name must be a non-empty string");
    }

    const matches = [];

    for (const [p, a] of this.events) {
      if (this._matches(p, event)) {
        for (const l of a) {
          matches.push([p, l]);
        }
      }
    }

    const out = [];

    for (const [p, l] of matches) {
      const a = this.events.get(p);

      if (!a || !a.includes(l)) {
        continue;
      }

      if (l.once) {
        this._remove(p, l);
      }

      try {
        out.push(await l.handler(data));
      } catch (e) {
        const errors = this.events.get("error") || [];

        if (event !== "error" && errors.length) {
          await this.emit("error", e);
        } else {
          throw e;
        }
      }
    }

    return out;
  }

  listeners(event) {
    if (typeof event !== "string" || !event) {
      throw new TypeError("Event name must be a non-empty string");
    }

    const r = [];

    for (const [p, a] of this.events) {
      if (this._matches(p, event)) {
        r.push(...a.map((x) => x.original));
      }
    }

    return r;
  }

  removeAllListeners(event) {
    if (event === undefined) {
      this.events.clear();
    } else {
      if (typeof event !== "string" || !event) {
        throw new TypeError("Event name must be a non-empty string");
      }

      this.events.delete(event);
    }

    return this;
  }

  _add(e, h, once) {
    if (!this.events.has(e)) {
      this.events.set(e, []);
    }

    this.events.get(e).push({
      handler: h,
      original: h,
      once
    });
  }

  _remove(e, l) {
    const a = this.events.get(e);

    if (!a) {
      return;
    }

    const r = a.filter((x) => x !== l);

    if (r.length) {
      this.events.set(e, r);
    } else {
      this.events.delete(e);
    }
  }

  _matches(p, e) {
    if (p === e) {
      return true;
    }

    if (!p.includes("*")) {
      return false;
    }

    const a = p.split(".");
    const b = e.split(".");

    return (
      a.length === b.length &&
      a.every((x, i) => x === "*" || x === b[i])
    );
  }

  _validate(e, h) {
    if (typeof e !== "string" || !e) {
      throw new TypeError("Event name must be a non-empty string");
    }

    if (typeof h !== "function") {
      throw new TypeError("Handler must be a function");
    }
  }
}

module.exports = EventEmitter;
module.exports.EventEmitter = EventEmitter;