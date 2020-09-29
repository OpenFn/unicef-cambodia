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
          state.lastCreated || '25-09-2020' // TEST CURSOR
        }.01-01-4020`,
        transitions_changed_at: `or_op||date_range||${
          state.lastUpdated || '25-09-2020 00:00' // TEST CURSOR
        }.01-01-4020 00:00`,
        oscar_number: 'range||*.*', //new filter to fetch ALL oscar cases
        service_response_types: 'list||referral_to_oscar', //old filter -only pulls referrals
      },
      
    },
    per: 1000,
  },
  state => {
    console.log(
      `Primero API responded with cases: ${JSON.stringify(state.data.map(x => x.case_id_display))}`
    );

    function parseDates(str) {
      const [y, m, dtz] = str.split('/');
      const [d, t, z] = dtz.split(' ');
      return { y, m, d, t, z };
    }

    // Get latest transition from all cases.
    const lastCreation = state.data
      .map(c => {
        if (c.transitions && c.transitions.length > 0) {
          // Get latest transition from a single case
          return c.transitions.map(t => t.created_at).sort((a, b) => b - a)[0];
        }
        return c.transitions_changed_at;
      })
      .sort((a, b) => b - a)[0];

    if (lastCreation) {
      console.log(`Found new cases, updating 'last created case' date using ${lastCreation}.`);
      var { y, m, d } = parseDates(lastCreation);
      state.lastCreated = `${d}-${m}-${y}`;
    }

    const lastUpdate = state.data
      .filter(x => x.transitions_changed_at)
      .map(x => x.transitions_changed_at)
      .sort((a, b) => b - a)[0];

    if (lastUpdate) {
      console.log(`Found cases w/ updates, updating 'last updated case' date using ${lastUpdate}.`);
      var { y, m, d, t } = parseDates(lastUpdate);
      var [hr, min, sec] = t.split(':');
      state.lastUpdated = `${d}-${m}-${y} ${hr}:${min}`;
    }

    console.log('The last transition update is now: ' + state.lastUpdated);
    console.log('The last transition creation is now: ' + state.lastCreated);
    return state;
  }
);
