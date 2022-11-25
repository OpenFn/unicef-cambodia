console.log('Sending cases to Primero failed.');
console.log(
  'Posting initial cursor back to inbox ',
  state.configuration.inboxId,
  ' to initiate another Oscar fetch.'
);
//If sync to Primero fails, log the time range and send to OpenFn so that admin can re-trigger sync for this period
post(
  `https://openfn.org/inbox/${state.configuration.inboxId}?failure=f2-j2-upsert-to-Primero"`,
  {
    body: state => state.initialState,
  },
  state => {
    console.log(
      'Sent request to inbox to fetch Oscar cases with cursor:',
      JSON.stringify(state.initialState, null, 2)
    );
    return state;
  }
);
