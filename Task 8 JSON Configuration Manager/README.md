# Task 8 – JSON Configuration Manager

Supports JSON loading, nested get/set, environment-variable interpolation, and schema validation.

```js
const ConfigManager=require("./configManager");
const config=new ConfigManager().load("./config.example.json");
config.get("database.host");
config.get("database.port",5432);
config.set("database.port",3306);
config.validate({database:{type:"object",properties:{host:{type:"string",required:true}}}});
```

Run `npm test` or `npm run test:coverage`.