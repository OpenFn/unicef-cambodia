console.log('Sending cases to Oscar failed.')
console.log(
  'Posting initial cursor back to inbox ',
  state.configuration.inboxId,
  ' to initiate another Primero fetch.'
)

post(
  `https://openfn.org/inbox/${state.configuration.inboxId}`, // inbox uuid
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