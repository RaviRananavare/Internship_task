const { ORM, model } = require("./orm");

describe("Simple ORM-like Layer", () => {
    let orm, User;

    beforeEach(() => {
        orm = new ORM();

        User = orm.model("User", {
            id: {
                type: "number",
                primary: true
            },
            name: {
                type: "string",
                required: true
            },
            email: {
                type: "string",
                unique: true
            }
        });
    });

    test("defines model", () => {
        expect(User.name).toBe("User");
    });

    test("create", async () => {
        await expect(
            User.create({
                name: "John",
                email: "john@example.com"
            })
        ).resolves.toEqual({
            id: 1,
            name: "John",
            email: "john@example.com"
        });
    });

    test("auto ids", async () => {
        const a = await User.create({
            name: "A",
            email: "a"
        });

        const b = await User.create({
            name: "B",
            email: "b"
        });

        expect([a.id, b.id]).toEqual([1, 2]);
    });

    test("find criteria", async () => {
        await User.create({
            name: "John",
            email: "j"
        });

        await User.create({
            name: "Jane",
            email: "n"
        });

        await expect(
            User.find({ name: "John" })
        ).resolves.toEqual([
            {
                id: 1,
                name: "John",
                email: "j"
            }
        ]);
    });

    test("find all", async () => {
        await User.create({
            name: "A",
            email: "a"
        });

        await User.create({
            name: "B",
            email: "b"
        });

        expect(await User.find()).toHaveLength(2);
    });

    test("findById", async () => {
        await User.create({
            name: "John",
            email: "j"
        });

        await expect(
            User.findById(1)
        ).resolves.toEqual({
            id: 1,
            name: "John",
            email: "j"
        });
    });

    test("missing id", async () => {
        await expect(
            User.findById(99)
        ).resolves.toBeNull();
    });

    test("update", async () => {
        await User.create({
            name: "John",
            email: "j"
        });

        await expect(
            User.update(1, { name: "Jane" })
        ).resolves.toEqual({
            id: 1,
            name: "Jane",
            email: "j"
        });
    });

    test("preserves id", async () => {
        await User.create({
            name: "John",
            email: "j"
        });

        expect(
            (await User.update(1, { id: 9 })).id
        ).toBe(1);
    });

    test("delete", async () => {
        await User.create({
            name: "John",
            email: "j"
        });

        await expect(
            User.delete(1)
        ).resolves.toBe(true);

        await expect(
            User.findById(1)
        ).resolves.toBeNull();
    });

    test("missing delete", async () => {
        await expect(
            User.delete(99)
        ).resolves.toBe(false);
    });

    test("count", async () => {
        await User.create({
            name: "A",
            email: "a"
        });

        await User.create({
            name: "B",
            email: "b"
        });

        expect(await User.count()).toBe(2);
        expect(await User.count({ name: "A" })).toBe(1);
    });

    test("required", async () => {
        await expect(
            User.create({ email: "j" })
        ).rejects.toThrow("name is required");
    });

    test("type validation", async () => {
        await expect(
            User.create({
                name: 123,
                email: "j"
            })
        ).rejects.toThrow("name must be a string");
    });

    test("unique", async () => {
        await User.create({
            name: "A",
            email: "a"
        });

        await expect(
            User.create({
                name: "B",
                email: "a"
            })
        ).rejects.toThrow("email must be unique");
    });

    test("factory", async () => {
        const P = model("Product", {
            id: {
                type: "number",
                primary: true
            },
            name: {
                type: "string",
                required: true
            }
        });

        await expect(
            P.create({ name: "Laptop" })
        ).resolves.toEqual({
            id: 1,
            name: "Laptop"
        });
    });

    test("duplicate model name", () => {
        expect(() =>
            orm.model("User", {
                id: {
                    type: "number",
                    primary: true
                }
            })
        ).toThrow("Model already exists");
    });
});