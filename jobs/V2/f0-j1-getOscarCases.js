// Either use a manual cursor, or take the cursor from the last run.
fn(state => {
  console.log('Last sync end date:', state.lastQueryDate || 'undefined; using manual cursor...');
  const manualCursor = '2022-10-31T23:56:07.539Z'; //'2022-09-07T08:57:24.777Z';
  const currentAttempt = new Date().toISOString();
  console.log('Current attempt time:', currentAttempt);

  const currentCursor = state.lastQueryDate || manualCursor;
  console.log('Current cursor:', currentCursor);
  return { ...state, currentCursor, currentAttempt };
});

// // If the job was executed from a message in the inbox with a specific cursor,
// // use that. If not, use the cursor from the previous final state.
// alterState(state => {
//   if (state.data && state.data.initialState) {
//     const lastQueryDate = state.cursor || state.data.initialState.lastQueryDate;
//     console.log('Setting cursor...');
//     return { ...state, lastQueryDate };
//   }
//   state.lastQueryDate = state.cursor;
//   return state;
// });

// Clear data from previous runs.
alterState(state => {
  const { lastQueryDate, thisQueryDate, currentCursor } = state;
  state.data = {};
  state.references = [];
  console.log(`Cursor for this query:: ${currentCursor}`);
  //console.log(`lastQueryDate (from the previous run): ${lastQueryDate}`);

  const now = new Date().toISOString().replace('T', ' ').slice(0, 10);
  console.log(`now :: ${now}`);

  state.oscarCursor = currentCursor.replace('T', ' ').slice(0, 10);
  console.log(`Cursor formatted for Oscar :: ${state.oscarCursor}`);

  state.thisQueryDate = `${now} 00:00:00`;

  console.log(
    `Current datetime, rounded to 00:00:00, to be used to update lastQueryDate after this query:: ${state.thisQueryDate}`
  );

  const initialState = { lastQueryDate, thisQueryDate, currentCursor };

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
        //since_date: state.lastQueryDate || '2022-10-21 00:00:00',
        since_date: state.oscarCursor || '2022-10-21 00:00:00',
      },
    },
    state => {
      console.log(`Oscar API responded with cases: ${JSON.stringify(state.data.data, null, 2)}`);
      console.log(`Original cursor :: ${state.currentCursor}`);
      console.log(`Cursor formatted for Oscar :: ${state.oscarCursor}`);
      /*console.log(
          `Oscar API responded with cases with global_ids: ${JSON.stringify(
            state.data.data ? state.data.data.map(c => c.global_id) : ''
          )}`
        );*/
      state.lastQueryDate = state.thisQueryDate;
      console.log(`Updated state.lastQueryDate to: ${state.lastQueryDate}`);
      return state;
    }
  )
);
