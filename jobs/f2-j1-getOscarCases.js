get('/api/v1/organizations/clients?since_date', {
  query: {
    since_date: state.lastQueryDate,
  },
});