// GET new Primero cases
// User Story 1: Generating government referrals
getCases(
  {
    remote: true,
    scope: {
      transitions_created_at: `date_range||${
        state.lastFetch || '01-01-2020' // a default starting date
      }.01-01-4000`, // effectively no end date (year 4000!)
      service_response_types: 'list||referral_to_oscar',
    },
  },
  state => {
    // TODO: Is transitions enough, or do we need to use an updated_at field on the case?
    // Get latest transition from all cases.
    const dateArr = state.data
      .map(x => {
        // Get latest transition from a single case
        return x.transitions.map(t => t.created_at).sort((a, b) => b - a)[0];
      })
      .sort((a, b) => b - a)[0]
      .split('/');

    state.lastFetch = `${dateArr[2]}-${dateArr[1]}-${dateArr[0]}`;

    console.log('The last fetched transition date is: ' + state.lastFetch);
    return state;
  }
);
