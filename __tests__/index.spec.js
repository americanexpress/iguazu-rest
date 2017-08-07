import {
  loadResource,
  loadCollection,
  createResource,
  updateResource,
  destroyResource,
  queryResource,
  queryCollection,
  getResource,
  getCollection,
  resourcesReducer,
  config,
} from '../src/index';

describe('index', () => {
  it('should expose the expected publicAPI', () => {
    expect(loadResource).toBeDefined();
    expect(loadCollection).toBeDefined();
    expect(createResource).toBeDefined();
    expect(updateResource).toBeDefined();
    expect(destroyResource).toBeDefined();
    expect(queryResource).toBeDefined();
    expect(queryCollection).toBeDefined();
    expect(getResource).toBeDefined();
    expect(getCollection).toBeDefined();
    expect(resourcesReducer).toBeDefined();
    expect(config).toBeDefined();
  });
});
