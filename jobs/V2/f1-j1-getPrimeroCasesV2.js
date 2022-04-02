// Either use a manual cursor, or take the cursor from the last run.
fn(state => {
  console.log('Last sync end date:', state.lastRunDateTime);
  const manualCursor = '2021-12-08T00:00:00.000Z';
  const cursor = state.lastRunDateTime || manualCursor;
  return { ...state, referralIds: [], cursor };
});

// Clear data from previous runs.
fn(state => ({ ...state, data: {}, references: [] }));

// GET Primero cases with oscar referrals
// User Story 1: Generating government referrals
// #1 - Request oscar referrals only ===========================================
getCases(
  {
    remote: true,
    last_updated_at: state => `${state.cursor}..`,
    service_response_types: 'list||referral_to_oscar', //testing
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
    last_updated_at: state => `${state.cursor}..`,
    oscar_number: 'range||*.*', //testing
  },
  state => {
    console.log(`Other cases: ${JSON.stringify(state.data.map(x => x.case_id_display))}`);

    // #3 - Combine cases =====
    state.data = state.data.concat(state.oscarRefs);
    delete state.oscarRefs;

    return state;
  }
);

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
