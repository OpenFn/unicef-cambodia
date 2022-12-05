// If the job was executed from a message in the inbox with a specific cursor,
// use that. If not, use the cursor from the previous final state.
alterState(state => {
  if (state.data && state.data.initialState) {
    const lastQueryDate = state.cursor || state.data.initialState.lastQueryDate;
    console.log('Setting cursor...', lastQueryDate);
    return { ...state, lastQueryDate };
  }
  state.lastQueryDate = state.cursor;
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
    `Current datetime, rounded to 00:00:00, to be used to update lastQueryDate after this query: ${state.thisQueryDate}`
  );

  const initialState = { lastQueryDate, thisQueryDate };

  return { ...state, initialState };
});

// GET OSCaR cases to check if oscar_number was assigned to newly accepted cases so that we can sync that externalId back to Primero
post(
  //Oscar authentication step
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
        // Oscar authentication parameters
        'access-token': state.data.__headers['access-token'],
        'Content-Type': 'application/json',
        client: state.data.__headers.client,
        uid: state.configuration.username,
      }),
      query: {
        // NOTE: since_date must be rounded to 00:00:00 to work with Oscar API.
        since_date: state.lastQueryDate || '2022-12-05 00:00:00',
      },
    },
    state => {
      //console.log(`Oscar API responded with cases: ${JSON.stringify(state.data.data, null, 2)}`);
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