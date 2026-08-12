# Task 12 – Simple ORM-like Layer

Lightweight in-memory ORM-like interface with model definition, schema validation, CRUD operations, querying, primary keys and unique fields.

```js
const {ORM}=require('./orm');
const orm=new ORM();
const User=orm.model('User',{id:{type:'number',primary:true},name:{type:'string',required:true},email:{type:'string',unique:true}});
await User.create({name:'John',email:'john@example.com'});
await User.find({name:'John'});
await User.findById(1);
await User.update(1,{name:'Jane'});
await User.delete(1);
```

Run `npm test` or `npm run test:coverage`.
