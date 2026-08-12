# Task 11 – Event Emitter System

Supports publish/subscribe listeners, once listeners, off/remove operations, wildcard events, async handlers and error handling.

```js
const EventEmitter=require('./eventEmitter');
const emitter=new EventEmitter();
emitter.on('user.created', user => console.log(user));
emitter.once('user.created', () => console.log('once'));
emitter.on('user.*', data => console.log(data));
await emitter.emit('user.created',{id:1});
```

Run `npm test` or `npm run test:coverage`.
