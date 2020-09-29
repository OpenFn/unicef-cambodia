// Clear data from previous runs.
alterState(state => {
  console.log('The last transition update before this run is: ' + state.lastUpdated);
  console.log('The last transition creation before this run is: ' + state.lastCreated);

  return { ...state, data: {}, references: [] };
});

// GET new Primero cases
// User Story 1: Generating government referrals
getCases(
  {
    remote: true,
    scope: {
      or: {
        //Two case date fields we must check for updates
        transitions_created_at: `or_op||date_range||${
          state.lastCreated || '10-09-2020'
        }.01-01-4020`,
        transitions_changed_at: `or_op||date_range||${
          state.lastUpdated || '10-09-2020 00:00'
        }.01-01-4020 00:00`,
      },
      oscar_number: 'range||*.*', //new filter to fetch ALL oscar cases
      //service_response_types: 'list||referral_to_oscar', //old filter -only pulls cases w/ referrals
    },
    per: 1000,
  },
  state => {
    console.log(
      `Primero API responded with cases: ${JSON.stringify(state.data.map(x => x.case_id_display))}`
    );

    // Get latest transition from all cases.
    const creationDates = state.data
      .map(c => {
        if (c.transitions && c.transitions.length > 0) {
          // Get latest transition from a single case
          return c.transitions.map(t => t.created_at).sort((a, b) => b - a)[0];
        }
        return c.transitions_changed_at;
      })
      .sort((a, b) => b - a);

    const lastCreationParts = creationDates[0] && creationDates[0].split('/');

    if (lastCreationParts) {
      console.log("Found new cases, updating 'last created case' date.");
      state.lastCreated = `${lastCreationParts[2]}-${lastCreationParts[1]}-${lastCreationParts[0]}`;
    }

    const updateDates = state.data
      .filter(x => x.transitions_changed_at)
      .map(x => x.transitions_changed_at)
      .sort((a, b) => b - a);

    const lastUpdateParts = updateDates[0] && updateDates[0].split('/');

    if (lastUpdateParts) {
      console.log(`Found cases w/ updates, updating 'last updated case' date.`);
      const lastUpdateDay = lastUpdateParts[2].split(' ')[0];
      const lastUpdateTimes = lastUpdateParts[2].split(' ')[1].split(':');
      state.lastUpdated = `${lastUpdateDay}-${lastUpdateParts[1]}-${lastUpdateParts[0]} ${lastUpdateTimes[0]}:${lastUpdateTimes[1]}`;
    }

    console.log('The last transition update is now: ' + state.lastUpdated);
    console.log('The last transition creation is now: ' + state.lastCreated);
    return state;
  }
);
