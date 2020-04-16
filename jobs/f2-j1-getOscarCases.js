// GET new OSCaR cases
// User Story 2: View Oscar cases in Primero
// User Story 4: Sending referrals to Primero  >>Q: Can we collapse w/ job f4-j1?
get('/api/v1/organizations/clients?since_date', {
  query: {
    since_date: state.lastQueryDate,
  },
});
