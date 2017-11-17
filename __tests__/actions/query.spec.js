import { queryResource, queryCollection } from '../../src/actions/query';

const mockLoadPromise = Promise.resolve('data');
jest.mock('../../src/actions/crud', () => ({
  loadResource: jest.fn(() => mockLoadPromise),
  loadCollection: jest.fn(() => mockLoadPromise),
}));

jest.mock('../../src/selectors', () => ({
  getResource: jest.fn(() => () => 'resource'),
  getCollection: jest.fn(() => () => 'collection'),
  resourceIsLoaded: jest.fn(),
  collectionIsLoaded: jest.fn(),
}));

jest.mock('../../src/actions/asyncSideEffects', () => ({
  handleQueryPromiseRejection: jest.fn(promise => promise.catch(() => { /* swallow */ })),
}));

const dispatch = jest.fn(input => input);
const getState = () => 'state';
const resource = 'users';
const id = '123';
const opts = 'opts';

describe('iguazu query actions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('queryResource', () => {
    it('should return a loading response if the resource is loading', () => {
      require('../../src/selectors').resourceIsLoaded.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
      const thunk = queryResource({ resource, id, opts });
      const loadResponse = thunk(dispatch, getState);
      expect(loadResponse.data).toEqual('resource');
      expect(loadResponse.status).toEqual('loading');
      expect(loadResponse.promise).toEqual(mockLoadPromise);
    });

    it('should return a loaded response if the resource is loaded', () => {
      require('../../src/selectors').resourceIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      const thunk = queryResource({ resource, id, opts });
      const loadResponse = thunk(dispatch, getState);
      expect(loadResponse.data).toEqual('resource');
      expect(loadResponse.status).toEqual('complete');
      expect(loadResponse.promise).toEqual(mockLoadPromise);
    });

    it('should return a loading response if the resource is loaded, but forceFetch is specified', () => {
      require('../../src/selectors').resourceIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      const thunk = queryResource({ resource, id, opts, forceFetch: true });
      const loadResponse = thunk(dispatch, getState);
      expect(loadResponse.data).toEqual('resource');
      expect(loadResponse.status).toEqual('loading');
      expect(loadResponse.promise).toEqual(mockLoadPromise);
    });

    it('should catch the promise if it rejects, but leave the uncaught promise for ssr', async () => {
      expect.assertions(2);
      const handleQueryPromiseRejection = require('../../src/actions/asyncSideEffects').handleQueryPromiseRejection; // eslint-disable-line global-require
      let promise;
      try {
        require('../../src/selectors').resourceIsLoaded.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
        require('../../src/actions/crud').loadResource.mockImplementationOnce(() => Promise.reject('async error')); // eslint-disable-line global-require
        const thunk = queryResource({ resource, id, opts });
        const loadResponse = thunk(dispatch, getState);
        promise = loadResponse.promise;
        await promise;
      } catch (e) {
        expect(handleQueryPromiseRejection).toHaveBeenCalledWith(promise);
        expect(e).toBe('async error');
      }
    });
  });

  describe('queryCollection', () => {
    it('should return a loading response if the collection is loading', () => {
      require('../../src/selectors').collectionIsLoaded.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
      const thunk = queryCollection({ resource, id, opts });
      const loadResponse = thunk(dispatch, getState);
      expect(loadResponse.data).toEqual('collection');
      expect(loadResponse.status).toEqual('loading');
      expect(loadResponse.promise).toEqual(mockLoadPromise);
    });

    it('should return a loaded response if the collection is loaded', () => {
      require('../../src/selectors').collectionIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      const thunk = queryCollection({ resource, id, opts });
      const loadResponse = thunk(dispatch, getState);
      expect(loadResponse.data).toEqual('collection');
      expect(loadResponse.status).toEqual('complete');
      expect(loadResponse.promise).toEqual(mockLoadPromise);
    });

    it('should return a loading response if the collection is loaded, but forceFetch is specified', () => {
      require('../../src/selectors').collectionIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      const thunk = queryCollection({ resource, id, opts, forceFetch: true });
      const loadResponse = thunk(dispatch, getState);
      expect(loadResponse.data).toEqual('collection');
      expect(loadResponse.status).toEqual('loading');
      expect(loadResponse.promise).toEqual(mockLoadPromise);
    });

    it('should catch the promise if it rejects, but leave the uncaught promise for ssr', async () => {
      expect.assertions(2);
      const handleQueryPromiseRejection = require('../../src/actions/asyncSideEffects').handleQueryPromiseRejection; // eslint-disable-line global-require
      let promise;
      try {
        require('../../src/selectors').collectionIsLoaded.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
        require('../../src/actions/crud').loadCollection.mockImplementationOnce(() => Promise.reject('async error')); // eslint-disable-line global-require
        const thunk = queryCollection({ resource, id, opts });
        const loadResponse = thunk(dispatch, getState);
        promise = loadResponse.promise;
        await promise;
      } catch (e) {
        expect(handleQueryPromiseRejection).toHaveBeenCalledWith(promise);
        expect(e).toBe('async error');
      }
    });
  });
});
