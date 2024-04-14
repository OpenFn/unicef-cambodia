// If the job was executed from a message in the inbox with a specific cursor,
// use that. If not, use the cursor from the previous final state.
alterState(state => {
  if (state.data && state.data.initialState) {
    const lastQueryDate = state.cursor || state.data.initialState.lastQueryDate;
    console.log('Setting cursor...');
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

// GET new OSCaR cases
// User Story 2: 'View Oscar cases in Primero' AND User Story 4: 'Sending referrals to Primero'
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
  state => {
    delete state.configuration.password;
    return state;
  }
);

//Here we get ALL cases from OSCaR that have sharing with Primero granted. This includes referrals & cases for duplicate prevention.
get(
  '/api/v1/organizations/clients',
  {
    keepCookie: true,
    headers: state => ({
      'access-token': state.data.__headers['access-token'],
      'Content-Type': 'application/json',
      client: state.data.__headers.client,
      uid: state.configuration.username,
    }),
    query: {
      // NOTE: since_date must be rounded to 00:00:00 to work with Oscar API. API does not support other timestamps.
      //since_date: '2023-08-24 00:00:00', //for troubleshooting
      since_date:  state.lastQueryDate || '2024-04-09 00:00:00',
    },
  },
  state => {
    console.log(
      `# cases in Oscar API response :: ${JSON.stringify(
        state.data.data ? state.data.data.length : ''
      )}`
    );
    console.log(
      `Oscar global_ids in reponse :: ${JSON.stringify(
        state.data.data ? state.data.data.map(c => c.global_id) : ''
      )}`
    );
    state.lastQueryDate = state.thisQueryDate;
    console.log(`Updated state.lastQueryDate to: ${state.lastQueryDate}`);
    return state;
  }
);
