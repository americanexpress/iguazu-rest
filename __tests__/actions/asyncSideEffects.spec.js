import {
  handleQueryPromiseRejection,
  waitAndDispatchFinished,
} from '../../src/actions/asyncSideEffects';

describe('async side effectsQuery', () => {
  describe('handleQueryPromiseRejection', () => {
    it('should catch the passed promise', async () => {
      expect.assertions(1);
      await expect(handleQueryPromiseRejection(Promise.reject())).resolves.toBeUndefined();
    });
  });

  describe('waitAndDispatchFinished', () => {
    const dispatch = jest.fn();

    it('should dispatch the passed action along with data that was successfully loaded', async () => {
      expect.assertions(1);
      const action = { type: 'SOME_ACTION' };
      const promise = Promise.resolve('async data');
      const thunk = waitAndDispatchFinished(promise, action);
      await thunk(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: 'SOME_ACTION', data: 'async data' });
    });

    it('should dispatch the passed action along with the error when the load failed', async () => {
      expect.assertions(1);
      const action = { type: 'SOME_ACTION' };
      const promise = Promise.reject('async error');
      const thunk = waitAndDispatchFinished(promise, action);
      await thunk(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: 'SOME_ACTION', data: 'async error' });
    });
  });
});
