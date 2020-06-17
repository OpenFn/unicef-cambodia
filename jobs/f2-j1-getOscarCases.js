// Clear data from previous runs.
alterState(state => {
  state.data = {};
  state.references = [];
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
      headers: state => {
        //Oscar authentication
        return {
          'access-token': state.data.__headers['access-token'],
          'Content-Type': 'application/json',
          client: state.data.__headers.client,
          uid: state.configuration.username,
        };
      },
      query: {
        since_date: '2020-06-15 00:00:00', //state.lastQueryDate || '2020-01-01 00:00:00',
        referred_external: true,
      },
    },
    state => {
      const date = new Date(Date.parse(state.data.__headers.date));
      const YYYY = date.getUTCFullYear();
      const MM = date.getUTCMonth()
      const DD = date.getUTCDate()

      const hh = date.getUTCHours();
      const mm = date.getUTCMinutes();
      const ss = date.getUTCSeconds();
      
      state.lastQueryDate = `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
      return state;
    }
  )
);
