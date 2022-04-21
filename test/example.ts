import {MutexRealm} from "../dist/mutex.js";

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

await processResource("abc");
