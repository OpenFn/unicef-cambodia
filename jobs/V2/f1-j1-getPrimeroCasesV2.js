// Either use a manual cursor, or take the cursor from the last run.
fn(state => {
  console.log('Last sync end date:', state.lastRunDateTime);
  const manualCursor = '2021-12-08T00:00:00.000Z';
  const cursor = state.lastRunDateTime || manualCursor;
  return { ...state, cursor };
});

// Clear data from previous runs and add a referralIds array.
fn(state => ({ ...state, data: {}, references: [], referralIds: [] }));

// GET Primero cases with oscar referrals
// User Story 1: Generating government referrals
// #1 - Request oscar referrals only ===========================================
getCases(
  {
    remote: true,
    last_updated_at: state => `${state.cursor}..`,
    // These cases have a service that might be sent to Oscar, but haven't
    // necessarily ALREADY BEEN sent to Oscar:
    service_response_types: 'list||referral_to_oscar',
  },
  state => {
    console.log('Oscar referral cases:', JSON.stringify(state.data.map(x => x.case_id_display)));

    return { ...state, oscarRefs: state.data, data: {}, references: [] };
  }
);

// for each oscarRef we get referrals and push the serviceRecordIds for each referral into the referralId array.
each(
  '$.oscarRefs[*]',
  getReferrals({ externalId: 'record_id', id: dataValue('id') }, state => {
    // referrals = [ { referralId: blah, serviceRecordId: 1 } ]

    state.data
      .filter(r => new Date(r.created_at) >= new Date(state.cursor))
      .map(r => {
        state.referralIds.push(r.service_record_id);
      });
    return state;
  })
);

// we filter the services_section in each oscarRef to return only the services that have been sent to Oscar
fn(state => {
  const { oscarRefs, referralIds } = state;

  const sentOscarRefs = oscarRefs.map(c => ({
    ...c,
    services_section: c.services_section.filter(service => referralIds.includes(service.unique_id)),
  }));

  return { ...state, oscarRefs: sentOscarRefs };
});

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
