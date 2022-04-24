// Mutex state.
export const enum MutexState {released, waiting, acquired}

// Mutex reference.
export interface Mutex {
   acquire() : Promise<void>;
   release() : void;
   getState() : MutexState;
}

// Mutex realm.
export class MutexRealm<K> {

   private map:              Map<K,MutexImpl<K>[]>;
      // When a map entry exists for a key, the mutex key is acquired.
      // The map entry is the wait list for the mutex key.

   public constructor() {
      this.map = new Map();
   }

   // Returns a mutex reference object for the specified key.
   // `key` is the "name" of the mutex, but it can be any value that can be used as a map index.
   public createMutex (key: K) : Mutex {
      return new MutexImpl<K>(key, this.map);
   }

}

// Implementation of the Mutex reference.
class MutexImpl<K> implements Mutex {

   private map:              Map<K,MutexImpl<K>[]>;
   private state:            MutexState;
   private key:              K;
   private promiseResolve:   Function;
   private promiseReject:    Function;

   public constructor (key: K, map: Map<K,MutexImpl<K>[]>) {
      this.map = map;
      this.state = MutexState.released;
      this.key = key;
   }

   public getState() : MutexState {
      return this.state;
   }

   public async acquire() : Promise<void> {
      assert(this.state == MutexState.released);
      const waitList = this.map.get(this.key);
      if (waitList) {                                      // another mutex object with this key is already acquired
         this.state = MutexState.waiting;
         waitList.push(this);                              // add this mutex object to the wait list
         return new Promise((resolve: Function, reject: Function) => {
            this.promiseResolve = resolve;
            this.promiseReject = reject;
         });
      } else {                                             // the mutex can be acquired immediatelly
         this.state = MutexState.acquired;
         this.map.set(this.key, []);
      }
   }

   public release() {
      switch (this.state) {
         case MutexState.waiting:  this.releaseWaitingMutex();  break;
         case MutexState.acquired: this.releaseAcquiredMutex(); break;
         default: break;
      }
   }

   private releaseWaitingMutex() {
      this.state = MutexState.released;
      const waitList = this.map.get(this.key);
      assert(!!waitList);
      const i = waitList.indexOf(this);
      assert(i >= 0);
      waitList.splice(i, 1);
      this.promiseReject(new Error("Mutex.release() called when mutex was in waiting state."));
   }

   private releaseAcquiredMutex() {
      this.state = MutexState.released;
      const waitList = this.map.get(this.key);
      assert(!!waitList);
      if (waitList.length == 0) {                          // no other mutex object is waiting
         this.map.delete(this.key);
      } else {                                             // pass the lock to the next waiting mutex
         const nextMutex = waitList.shift()!;
         assert(nextMutex.state == MutexState.waiting);
         nextMutex.state = MutexState.acquired;
         nextMutex.promiseResolve();
      }
   }

}

function assert (cond: boolean) : asserts cond {
   if (!cond) {
      throw new Error("Assertion failed.");
   }
}
