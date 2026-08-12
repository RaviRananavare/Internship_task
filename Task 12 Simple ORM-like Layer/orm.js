class Model {
    constructor(name, schema) {
        if (typeof name !== "string" || !name.trim()) {
            throw new TypeError("Model name must be a non-empty string");
        }

        if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
            throw new TypeError("Schema must be an object");
        }

        this.name = name;
        this.schema = schema;
        this.rows = [];
        this.nextId = 1;
    }

    async create(data) {
        this._validate(data, false);

        const row = { ...data };
        const id = this._pk();

        if (id && row[id] === undefined) {
            row[id] = this.nextId++;
        } else if (id && typeof row[id] === "number") {
            this.nextId = Math.max(this.nextId, row[id] + 1);
        }

        this._unique(row);
        this.rows.push(row);

        return { ...row };
    }

    async find(criteria = {}) {
        if (
            !criteria ||
            typeof criteria !== "object" ||
            Array.isArray(criteria)
        ) {
            throw new TypeError("Query criteria must be an object");
        }

        return this.rows
            .filter((r) =>
                Object.entries(criteria).every(([k, v]) => r[k] === v)
            )
            .map((r) => ({ ...r }));
    }

    async findById(id) {;;;
        const k = this._pk();
        const r = this.rows.find((x) => x[k] === id);

        return r ? { ...r } : null;
    }

    async update(id, changes) {
        if (
            !changes ||
            typeof changes !== "object" ||
            Array.isArray(changes)
        ) {
            throw new TypeError("Update data must be an object");
        }

        const k = this._pk();
        const i = this.rows.findIndex((r) => r[k] === id);

        if (i < 0) {
            return null;
        }

        const row = {
            ...this.rows[i],
            ...changes,
            [k]: this.rows[i][k],
        };

        this._validate(row, true);
        this._unique(row, id);

        this.rows[i] = row;

        return { ...row };
    }

    async delete(id) {
        const k = this._pk();
        const i = this.rows.findIndex((r) => r[k] === id);

        if (i < 0) {
            return false;
        }

        this.rows.splice(i, 1);
        return true;
    }

    async count(c = {}) {
        return (await this.find(c)).length;
    }

    _pk() {
        const x = Object.entries(this.schema).find(
            ([, r]) => r && r.primary
        );

        return x ? x[0] : null;
    }

    _validate(d, partial) {
        for (const [k, r] of Object.entries(this.schema)) {
            const ok = d[k] !== undefined && d[k] !== null;

            if (!partial && r.required && !ok) {
                throw new Error(`${k} is required`);
            }

            if (!ok) {
                continue;
            }

            if (r.type && typeof d[k] !== r.type) {
                throw new Error(`${k} must be a ${r.type}`);
            }
        }
    }

    _unique(d, ignore) {
        const pk = this._pk();

        for (const [k, r] of Object.entries(this.schema)) {
            if (
                r.unique &&
                d[k] !== undefined &&
                this.rows.some(
                    (x) =>
                        x[k] === d[k] &&
                        (ignore === undefined || x[pk] !== ignore)
                )
            ) {
                throw new Error(`${k} must be unique`);
            }
        }
    }
}

class ORM {
    constructor() {
        this.models = new Map();
    }

    model(name, schema) {
        if (this.models.has(name)) {
            throw new Error(`Model already exists: ${name}`);
        }

        const m = new Model(name, schema);
        this.models.set(name, m);

        return m;
    }
}

function model(name, schema) {
    return new ORM().model(name, schema);
}

module.exports = {
    Model,
    ORM,
    model,
};