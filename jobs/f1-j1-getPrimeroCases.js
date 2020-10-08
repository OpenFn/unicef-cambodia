// Clear data from previous runs.
alterState(state => {
  console.log('The last case creation before this run is: ' + state.lastCaseCreated);
  console.log('The last transition update before this run is: ' + state.lastUpdated);
  console.log('The last transition creation before this run is: ' + state.lastCreated);

  return { ...state, data: {}, references: [] };
});

// GET Primero cases with oscar referrals
// User Story 1: Generating government referrals
// #1 - Request oscar referrals only ===========================================
getCases(
  {
    remote: true,
    scope: {
      or: {
        // Two case date fields we must check for updates
        transitions_created_at: `or_op||date_range||${
          state.lastCreated || '25-09-2020' // TEST CURSOR
        }.01-01-4020`,
        transitions_changed_at: `or_op||date_range||${
          state.lastUpdated || '25-09-2020 00:00' // TEST CURSOR
        }.01-01-4020 00:00`,
      },
      service_response_types: 'list||referral_to_oscar', // only cases with referral services
    },
    per: 1000,
  },
  state => {
    console.log(`Oscar referral cases: ${JSON.stringify(state.data.map(x => x.case_id_display))}`);

    state.oscarRefs = state.data;
    return { ...state, data: {}, references: [] };
  }
);

// GET new Primero cases with oscar_number
// User Story 2: View all Oscar cases in Primero
// #2 - Request all oscar cases ================================================
getCases(
  {
    remote: true,
    scope: {
      or: {
        // Two case date fields we must check for updates
        created_at: `or_op||date_range||${
          state.lastCaseCreated || '25-09-2020' // TEST CURSOR
        }.01-01-4020`,
        transitions_changed_at: `or_op||date_range||${
          state.lastUpdated || '25-09-2020 00:00' // TEST CURSOR
        }.01-01-4020 00:00`,
      },
      oscar_number: 'range||*.*', // all oscar cases that might not have referrals
    },
    per: 1000,
  },
  state => {
    console.log(`Other cases: ${JSON.stringify(state.data.map(x => x.case_id_display))}`);

    // #3 - Combine cases, then identify last timestamps and reformat them =====
    state.data = state.data.concat(state.oscarRefs);
    delete state.oscarRefs;

    function parseDates(str) {
      const [y, m, dtz] = str.split('/');
      const [d, t, z] = dtz.split(' ');
      return { y, m, d, t, z };
    }

    // Get latest case creation from all cases. ================================
    const lastCaseCreation = state.data.map(c => c.created_at).sort((a, b) => b - a)[0];

    if (lastCaseCreation) {
      console.log(
        `Found new cases w/o transitions, updating 'last case creation' date using ${lastCaseCreation}.`
      );
      var { y, m, d } = parseDates(lastCaseCreation);
      state.lastCaseCreated = `${d}-${m}-${y}`;
    }
    // =========================================================================

    // Get latest transition from all cases. ===================================
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
    // =========================================================================

    console.log('The last case creation is now: ' + state.lastCaseCreated);
    console.log('The last transition update is now: ' + state.lastUpdated);
    console.log('The last transition creation is now: ' + state.lastCreated);
    return state;
  }
);
