// Clear data from previous runs.
alterState(state => {
  state.data = {};
  state.references = [];
  console.log(`lastQueryDate (from the previous run): ${state.lastQueryDate}`);
  state.thisQueryDate = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(
    `Current time, to be used to update lastQueryDate after this query: ${state.thisQueryDate}`
  );
  return state;
});

// GET new OSCaR cases
// User Story 2: 'View Oscar cases in Primero' AND User Story 4: 'Sending referrals to Primero'
post(
  //Oscar authentication  --> To update?
  '/api/v1/auth/sign_in',
  {
    keepCookie: true,
    body: {
      email: state.configuration.username,
      password: state.configuration.password,
    },
  },
  get(
    '/api/v1/organizations/clients',
    {
      keepCookie: true,
      headers: state => ({
        // Oscar authentication
        'access-token': state.data.__headers['access-token'],
        'Content-Type': 'application/json',
        client: state.data.__headers.client,
        uid: state.configuration.username,
      }),
      query: {
        since_date: state.lastQueryDate || '2020-07-05 00:00:00', //harcoded option for testing '2020-06-15 00:00:00',
        referred_external: true,
      },
    },
    state => ({ ...state, lastQueryDate: '2020-07-05 22:05:02' })
  )
);
