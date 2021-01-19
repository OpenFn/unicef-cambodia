// Job 2 failed
// Posting initial cursor back to inbox for reprocessing.
post(
  'blah', // inbox uuid
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
