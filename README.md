# async-named-mutex

Named [mutex](https://en.wikipedia.org/wiki/Lock_(computer_science)) locks for async functions.

## Usage

<b>TypeScript:</b>
```typescript
import {MutexRealm} from "async-named-mutex";

const mutexRealm = new MutexRealm<string>();

async function processResource (resourceId: string) {
   const mutex = mutexRealm.createMutex(resourceId);
   try {
      await mutex.acquire();
      // ... process resource ...
   } finally {
      mutex.release();
   }
}

```

<b>JavaScript:</b>
```javascript
import {MutexRealm} from "async-named-mutex";

const mutexRealm = new MutexRealm();

async function processResource (resourceId) {
   const mutex = mutexRealm.createMutex(resourceId);
   try {
      await mutex.acquire();
      // ... process resource ...
   } finally {
      mutex.release();
   }
}

```

Any value which is a valid [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) index
(`string`, `number`, `object`, ...) can be used as a name (aka key) for a mutex.

NPM package: [async-named-mutex](https://www.npmjs.com/package/async-named-mutex)
