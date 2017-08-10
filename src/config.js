const config = {
  baseFetch: fetch,
  getToState: state => state.resources,
};

export function configureIguazuREST(customConfig) {
  Object.assign(config, customConfig);
}

export default config;
