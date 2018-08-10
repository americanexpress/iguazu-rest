/*
 * Copyright 2018 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import * as types from '../types';

/**
 * Some actions which are asynchronous need to act on a promise, but also return the original
 * promise to achieve desired behavior. Moving these asynchronous side effects to their own
 * functions in a different file makes it easier to mock them and make sure they were called
 * with the correct inputs in one test script and test their behavior in another test script.
 */

/**
 * The promise in queryResource and queryCollection is exclusively used to wait on asynchronous
 * data before server-side rendering. The promise should reject if the load failed, so that iguazu
 * doesn't continue to load data that it does not need when it will just render an error state. On
 * the client, nothing waits on the promise via `.then` or `await`. Instead, a redux action is fired
 * when the async task is finished, which updates the store, which then triggers loadDataAsProps to
 * run. Whether the async task finished successfully or not will be made apparent by what is stored
 * in state. So it seems like the promise rejection is not being handled, but ultimately it is. This
 * is a simple catch to assure the browser that the promise has indeed been dealt with so it will
 * not emit a `unhandledrejection` event.
 */
export function handleQueryPromiseRejection(promise) {
  return promise.then(null, () => { /* Swallow */ });
}

/**
  * The promise from executeFetch will be caught by the handleQueryPromiseRejection function above.
  * Its job is to catch if the network job failed, because nothing is broken if it did. It should
  * not catch any errors that happen as a result of the network call failing which is what happens
  * if the promise chain returned from executeFetch dispatches redux actions inside of it. The redux
  * actions  can cause a rerender and a render error would be swallowed making it hard to debug what
  * went wrong.
  */
export function waitAndDispatchFinished(promise, action) {
  return async (dispatch) => {
    let data;
    try {
      data = await promise;
      dispatch(Object.assign({}, action, { type: types[`${action.type}_FINISHED`], data }));
    } catch (e) {
      data = e;
      dispatch(Object.assign({}, action, { type: types[`${action.type}_ERROR`], data }));
    }
  };
}
