console.log('Sending cases to Primero failed.')
console.log(
  'Posting initial cursor back to inbox ',
  state.configuration.inboxId,
  ' to initiate another Oscar fetch.'
)

post(
  state.configuration.inboxId, // inbox uuid
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