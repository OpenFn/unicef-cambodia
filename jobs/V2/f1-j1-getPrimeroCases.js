// If the job was executed from a message in the inbox with a specific cursor,
// use that. If not, use the cursor from the previous final state.
fn(state => {
  if (state.data && state.data.initialState) {
    const { lastCaseCreated, lastUpdated, lastCreated } = state.data.initialState;
    return { ...state, lastCaseCreated, lastUpdated, lastCreated };
  }
  return state;
});

fn(state => {
  console.log('Last sync end date:', state.lastRunDateTime);
  const manualCursor = '2021-11-21T15:10:00.587Z';
  const cursor = state.lastRunDateTime || manualCursor;
  return { ...state, referralIds: [], cursor };
});

// Clear data from previous runs.
fn(state => {
  const { lastCaseCreated, lastUpdated, lastCreated } = state;
  console.log('The last case creation before this run is:', lastCaseCreated);
  console.log('The last transition update before this run is:', lastUpdated);
  console.log('The last transition creation before this run is:', lastCreated);

  const initialState = { lastCaseCreated, lastUpdated, lastCreated };

  return { ...state, data: {}, references: [], initialState };
});

// GET Primero cases with oscar referrals
// User Story 1: Generating government referrals
// #1 - Request oscar referrals only ===========================================
fn(state => {
  return getCases(
    {
      remote: true,
      last_updated_at: `${state.cursor}..`,
    },
    state => {
      console.log(
        `Oscar referral cases: ${JSON.stringify(state.data.map(x => x.case_id_display))}`
      );

      state.oscarRefs = state.data;
      return { ...state, data: {}, references: [] };
    }
  )(state);
});

// GET new Primero cases with oscar_number
// User Story 2: View all Oscar cases in Primero
// #2 - Request all oscar cases ================================================
fn(state => {
  return getCases(
    {
      remote: true,
      last_updated_at: `${state.cursor}..`,
    },
    state => {
      console.log(`Other cases: ${JSON.stringify(state.data.map(x => x.case_id_display))}`);

      // #3 - Combine cases, then identify last timestamps and reformat them =====
      state.data = state.data.concat(state.oscarRefs);
      delete state.oscarRefs;

      function parseDates(str) {
        const date = str.split('T')[0];
        const time = str.split('T')[1];
        const [y, m, d] = date.split('-');
        const [hr, min, sec] = time.split(':');
        return { y, m, d, hr, min, sec };
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
        console.log(
          `Found cases w/ updates, updating 'last updated case' date using ${lastUpdate}.`
        );
        var { y, m, d, hr, min } = parseDates(lastUpdate);
        state.lastUpdated = `${d}-${m}-${y} ${hr}:${min}`;
      }
      // =========================================================================

      console.log('The last case creation is now: ' + state.lastCaseCreated);
      console.log('The last transition update is now: ' + state.lastUpdated);
      console.log('The last transition creation is now: ' + state.lastCreated);
      return state;
    }
  )(state);
});

// After job completes successfully, update cursor
fn(state => {
  let lastRunDateTime = state.data
    .map(c => c.last_updated_at)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  lastRunDateTime =
    new Date(lastRunDateTime) > new Date() ? lastRunDateTime : new Date().toISOString();

  console.log('Next sync start date:', lastRunDateTime);
  return { ...state, references: [], lastRunDateTime };
});
