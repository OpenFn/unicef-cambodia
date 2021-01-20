console.log('Sending cases to Oscar failed.')
console.log('Posting initial cursor back to inbox to initiate another Primero fetch.')
post(
  state.configuration.inboxId, // inbox uuid
  {
    body: state => state.initialState,
  },
  state => {
    console.log(
      'Sent request to inbox to fetch Primero cases with cursor:',
      JSON.stringify(state.initialState, null, 2)
    );
    return state;
  }
);