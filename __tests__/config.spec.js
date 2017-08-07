import config, {
  configureIguazuREST,
} from '../src/config';

describe('config', () => {
  describe('default config', () => {
    it('should be initialized with some defaults', () => {
      expect(config.baseFetch).toBe(fetch);
      const state = { resources: 'resources state' };
      expect(config.getToState(state)).toBe('resources state');
    });
  });

  describe('configureIguazuREST', () => {
    it('should allow you to add to the config', () => {
      configureIguazuREST({ someKey: 'someValue' });
      expect(config.someKey).toBe('someValue');
    });
  });
});
