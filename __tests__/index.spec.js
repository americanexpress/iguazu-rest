import publicAPI from '../src/index';

describe('index', () => {
  it('should expose the expected publicAPI', () => {
    expect(publicAPI.loadResource).toBeDefined();
    expect(publicAPI.loadCollection).toBeDefined();
    expect(publicAPI.createResource).toBeDefined();
    expect(publicAPI.updateResource).toBeDefined();
    expect(publicAPI.destroyResource).toBeDefined();
    expect(publicAPI.queryResource).toBeDefined();
    expect(publicAPI.queryCollection).toBeDefined();
    expect(publicAPI.getResource).toBeDefined();
    expect(publicAPI.getCollection).toBeDefined();
    expect(publicAPI.resourcesReducer).toBeDefined();
    expect(publicAPI.config).toBeDefined();
  });
});
