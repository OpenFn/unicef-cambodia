console.log('Sending cases to Primero failed.')
console.log(
  'Posting initial cursor back to inbox ',
  state.configuration.inboxId,
  ' to initiate another Oscar fetch.'
)

post(
  `https://openfn.org/inbox/${state.configuration.inboxId}?failure=f2-j2-upsert-to-Primero"`, // inbox uuid
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