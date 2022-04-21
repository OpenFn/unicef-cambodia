// Either use a manual cursor, or take the cursor from the last run.
fn(state => {
  console.log('Last sync end date:', state.lastRunDateTime);
  const manualCursor = '2022-04-20T16:30:07.288Z';
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
    workflow: 'referral_to_oscar',
    // These cases have a service that might be sent to Oscar, but haven't
    // necessarily ALREADY BEEN sent to Oscar:
    //service_response_types: 'list||referral_to_oscar', //NOTE: This services filter does not work
  },
  { withReferrals: true },
  state => {
    const oscarRefs = state.data;
    //console.log(`oscarRefs: ${JSON.stringify(oscarRefs, null, 2)}`);
    const referralIds = oscarRefs
      .map(c =>
        c.referrals
          // TO-DO Aleksa & Aicha - Aicha commented this line out because if a sync fails the caseworker would need to recreate the referral
          .filter(r => r.status === 'in progress') //NOTE: Only send referrals where status 'in progress'
          .map(r => r.service_record_id)
      )
      .flat();

    console.log('Detected referral Ids:', referralIds);

    // we filter the services_section in each oscarRef to return only the services that have been sent to Oscar
    const sentOscarRefs = oscarRefs
      .filter(c => c.services_section)
      .map(c => ({
        ...c,
        services_section: c.services_section.filter(service => {
          if (referralIds.includes(service.unique_id)) {
            console.log('Detected service to refer to oscar', service.unique_id);
            return true;
          }
          console.log('N/A, service not recently referred to oscar', service.unique_id);
          return false;
        }),
      }));

    const pendingRefsToSend = sentOscarRefs.filter(
      c => c.services_section && c.services_section.length > 0
    );

    console.log(
      `New 'Pending' referrals to send to Oscar: ${JSON.stringify(pendingRefsToSend, null, 2)}`
    );

    return { ...state, oscarRefs: pendingRefsToSend, referralIds, data: {}, references: [] };
  }
);
// NEW: Get decisions to send back to OSCAR ================================================//
getCases(
  {
    remote: true,
    last_updated_at: state => `${state.cursor}..`,
    workflow: 'referral_from_oscar',
    // These cases have a service that might have a decision to send back to Oscar
    //service_response_types: 'list||referral_from_oscar', //NOTE: This services filter does not work
  },
  { withReferrals: true },
  state => {
    const refsFromOscar = state.data;
    //console.log(JSON.stringify(refsFromOscar, null, 2));

    // TODO: filter the services_section in each refsFromOscar to return only the services that have decisions
    // if service is accepted/rejected, then we know there is a decision
    const oscarDecisions = refsFromOscar.filter(c =>
      c.services_section.filter(service => {
        service.referral_status_edf41f2 === 'accepted_340953' ||
          service.referral_status_edf41f2 === 'rejected_936484';
      })
    );

    console.log(`Decisions to send to Oscar: ${JSON.stringify(refsFromOscar, null, 2)}`);

    return { ...state, oscarDecisions: oscarDecisions, data: {}, references: [] };
  }
);

// GET new Primero cases with oscar_number
// User Story 2: View all Oscar cases in Primero
// #2 - Request all oscar cases ================================================
getCases(
  {
    remote: true,
    last_updated_at: state => `${state.cursor}..`,
    //oscar_number: 'range||*.*', //NOTE: This does NOT work; checking with Quoin
  },
  {},
  state => {
    console.log();
    // Do not include any cases that have a 'referral_to_oscar' service, bc we handle those in the steps above
    console.log(
      `Oscar cases before filter: ${JSON.stringify(state.data.map(x => x.case_id_display))}`
    );
    //TODO: @Taylor - Make sure this filter works!
    state.data.filter(
      // only allow if services_section does NOT! have some with service_response_type === 'referral_to_oscar'
      c =>
        c.oscar_number !== null &&
        !c.services_section.some(s => s.service_response_type === 'referral_to_oscar')
    );

    console.log(
      `Oscar cases AFTER filter: ${JSON.stringify(state.data.map(x => x.case_id_display))}`
    );
    //console.log(`Other cases AFTER filter: ${JSON.stringify(state.data, null, 2)}`);

    // #3 - Combine cases =====
    state.data = state.data.concat(state.oscarRefs, state.oscarDecisions);
    delete state.oscarRefs;
    delete state.oscarDecisions;

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
