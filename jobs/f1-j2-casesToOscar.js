alterState((state) => {
  var results = [];

  while (state.data.length) {
    results.push(state.data.splice(0, 100));
  }
  
  state.caseChunks = results;
  return state;
});

each(
  '$.caseChunks[*]',
  post('/api/v1/organizations/clients/create_many/', {
    body: (state) => state.data,
  })
);
