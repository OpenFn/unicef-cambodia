// NOTE: couldn't this be collapsed into f2-j1?
get('/api/v1/organizations/clients', {
  query: {
    referred_external: true,
    since_date: state.lastQueryDate,
  },
});