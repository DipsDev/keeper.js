
# Keeper.js

A great solution to introduce api keys into your express app


## Installation

```javascript
npm install keeper.js
```

## Usage

Import the library:
```javascript
import { Keeper } from "keeper.js";
```
Use it:
```javascript
const app = express(); // Express app as usual

const keeper = Keeper({
    // Config
});
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `adapter`      | `Adapter` | **Required**. The database/storage adapter you'll use, see `adapters` for more info |
| `overrideKeyGeneration` | `function/undefined` | Override the key generation function to use your own | 


### API
The library exposes a couple of utility routes for your express app.

You are able to use any path you'd like

#### Generate Key
The validator function gets `Request` object and the userId provided in `body`
```javascript
app.post('/create', keeper.routes.create(async (req, userId) => {

    // This function is a validator whether the user can create a key or not.
    // You may check your database or return any boolean you'd like

    const isLoggedIn = await isUserLogged(req)
    return isLoggedIn;
}))
```
You should now be able to create keys by going into `localhost:3000/create`

#### Revoke Key
The validator function gets the `Request` object and the key the user provided in the `Authorization` header
```javascript
app.delete('/revoke', keeper.routes.revoke(async (req, key) => {

    // This function is a validator whether the user can create a key or not.
    // You may check your database or return any boolean you'd like

    const userId = await keeper.adapter.findByKey(key)
    return userId === req.body.userId;
}))
```

#### Protect Route By Key
```javascript
app.get('/protected', keeper.routes.protect(), (req, res) => {
  return res.status(200).json({ message: "Hi, there is my secret message", secret: "s3cret" })
})
```











## Adapters

The library provides some database solutions out of the box, just import the wanted adapter and use it.

Import all adapters from the `adapters` folder.

By default, every adapter exposes the following functions:
```javascript
// All are async functions
keeper.adapter.findByKey(key: string) => Promise<string | undefined>
keeper.adapter.createKey(key: string, userId: string) => Promise<string>
keeper.adapter.revokeKey(key: string) => Promise<any>;
keeper.adapter.checkKey(key: string) => Promise<boolean>;
```

#### Memory Adapter
Uses no database, meaning the data will be lost after restart.

```javascript
  const keeper = Keeper({
      adapter: MemoryAdapter()
  })
```


#### JSON Adapter
Uses .json as database, requires path.

```javascript
  const keeper = Keeper({
      adapter: JsonAdapter({
          path: "C:\your-path",
          absolutePath: true,
      })
  })
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `path`      | `string` | **Required**. The path to the json file |
| `absolutePath` | `boolean/undefined` | Set whether the given path is absolute or relative | 


