// If the job was executed from a message in the inbox with a specific cursor,
// use that. If not, use the cursor from the previous final state.
alterState(state => {
  if (state.data && state.data.initialState) {
    const { lastQueryDate } = state.data.initialState;
    return { ...state, lastQueryDate };
  }
  return state;
});

// Clear data from previous runs.
alterState(state => {
  const { lastQueryDate, thisQueryDate } = state;
  state.data = {};
  state.references = [];
  console.log(`lastQueryDate (from the previous run): ${lastQueryDate}`);

  const now = new Date().toISOString().replace('T', ' ').slice(0, 10);
  state.thisQueryDate = `${now} 00:00:00`;
  console.log(
    `Current datetime, rounded to 00:00:00, to be used to update lastQueryDate after this query: ${thisQueryDate}`
  );

  const initialState = { lastQueryDate, thisQueryDate };

  return { ...state, initialState };
});

// GET new OSCaR cases
// User Story 2: 'View Oscar cases in Primero' AND User Story 4: 'Sending referrals to Primero'
post(
  //Oscar authentication  --> To update?
  '/api/v1/admin_auth/sign_in',
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
        // NOTE: since_date must be rounded to 00:00:00 to work with Oscar API.
        since_date: state.lastQueryDate || '2021-10-01 00:00:00',
        //referred_external: true, //old query parameter - to remove to pull ALL cases, not just referrals
      },
    },
    state => {
      console.log('data', state.data);
      console.log(
        `Oscar API responded with cases with global_ids: ${JSON.stringify(
          state.data.data ? state.data.data.map(c => c.global_id) : ''
        )}`
      );
      state.lastQueryDate = state.thisQueryDate;
      console.log(`Updated state.lastQueryDate to: ${state.lastQueryDate}`);
      return state;
    }
  )
);
