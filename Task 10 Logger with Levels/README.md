# Task 10 – Logger with Levels

Supports DEBUG, INFO, WARN, ERROR, minimum levels, timestamps, metadata, pretty/JSON formats, console/file transports, and optional size-based rotation.

```js
const Logger=require("./logger");
const logger=new Logger({level:"INFO",format:"pretty",transports:["console"]});
logger.info("User logged in",{userId:123});
logger.error("Database error",{error:"DB01"});
logger.debug("Query",{sql:"SELECT *"});
```

File transport: `new Logger({transports:["file"],file:"./logs/app.log"})`. Run `npm test` or `npm run test:coverage`.