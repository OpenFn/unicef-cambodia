// GET new Primero cases
// User Story 1: Generating government referrals
getCases(
  {
    remote: true,
    scope: {
      transitions_created_at: `date_range||${state.lastFetch}.30-Mar-3020`, //>>Q: What should this date filter be?
      service_response_types: 'list||referral_to_oscar',
    },
  },
  state => {
    // TODO: Is transitions enough, or do we need to use an updated_at field on the case? 
    // Get latest transition from all cases.
    state.lastFetch = state.data.map(x => {
      // Get latest transition from a single case
      return x.transitions.map(t => t.created_at).sort((a, b) => b - a)[0];
    }).sort((a, b) => b - a)[0];

    console.log(state.lastFetch);
    // TODO: The API returns dates in a very different format that it accepts dates.
    // We will need to do some date conversion in here.
    return state;
  }
);
