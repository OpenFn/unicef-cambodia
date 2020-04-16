//User Story 4: List new OSCaR case referrals
//Send GET request to Oscar to fetch new cases

// >>Q: couldn't this be collapsed into job f2-j1?
get('/api/v1/organizations/clients', {
  query: {
    referred_external: true,
    since_date: state.lastQueryDate,

  },
});
