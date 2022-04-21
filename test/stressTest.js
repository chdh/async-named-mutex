import {MutexRealm} from "../dist/mutex.js";

const mutexRealm = new MutexRealm();

function delay (ms) {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

async function threadGroup (groupName) {
   let counter = 0;

   for (let i = 0; i < 10; i++) {
      thread(i);
   }

   async function thread (threadNo) {
      console.log(`Thread ${groupName}${threadNo} started.`);
      const mutex = mutexRealm.createMutex(groupName);
      for (let i = 0; i < 100; i++) {
         await testMutex(mutex);
      }
      console.log(`Thread ${groupName}${threadNo} completed. Counter=${counter}`);

      // Provoke error:
      //    await delay(1);
      //    counter++;
   }

   async function testMutex (mutex) {
      await mutex.acquire();
      counter++;
      const oldCounterValue = counter;
      await delay(Math.random() * 3);
      if (counter != oldCounterValue) {
         throw new Error("Mutex did not work.");
      }
      mutex.release();
   }

}

threadGroup("a");
threadGroup("b");
