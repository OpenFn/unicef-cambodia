// Either use a manual cursor, or take the cursor from the last run.
fn(state => {
  console.log('Last sync end date:', state.lastRunDateTime || 'undefined; using manual cursor...');
  const manualCursor = '2022-12-27T11:00:09.797Z';
  const currentAttempt = new Date().toISOString();
  console.log('Current attempt time:', currentAttempt);

  const cursor = state.lastRunDateTime || manualCursor;
  console.log('Cursor:', cursor);
  return { ...state, cursor, currentAttempt };
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
    workflow: 'referral_to_oscar',
  },
  { withReferrals: true },
  state => {
    const oscarRefs = state.data;
    const referralIds = oscarRefs
      .map(c =>
        c.referrals
          .map(x => {
            console.log('referral:', 'id:', x.id, x.status, x.created_at, x.service_record_id);
            return x;
          })
          .filter(r => new Date(r.created_at) >= new Date(state.cursor)) //Only send referrals created after the last sync
          .filter(r => r.status === 'in_progress') // And only send referrals where status 'in progress'
          .map(r => r.service_record_id)
      )
      .flat();

    console.log('Detected referral Ids:', referralIds);

    // we filter the services_section in each oscarRef to return only the services that have/have not been sent to Oscar
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
  },
  { withReferrals: true },
  state => {
    const refsFromOscar = state.data;
    // Here we filter the services_section in each refsFromOscar to return only the services that have decisions
    // if service is accepted/rejected, then we know there is a decision made in Primero that should be sent to Oscar
    const oscarDecisions = refsFromOscar.filter(c =>
      c.services_section.filter(service => {
        service.referral_status_edf41f2 === 'accepted_340953' ||
          service.referral_status_edf41f2 === 'rejected_936484';
      })
    );

    console.log(
      `Decisions to send to Oscar: ${JSON.stringify(
        refsFromOscar ? refsFromOscar.map(c => c.case_id) : '',
        null,
        2
      )}`
    );

    return { ...state, oscarDecisions, data: {}, references: [] };
  }
);

// GET new Primero cases with oscar_number
// User Story 2: View all Oscar cases in Primero
// #2 - Request all oscar cases ================================================
getCases(
  {
    remote: true,
    last_updated_at: state => `${state.cursor}..`,
  },
  { withReferrals: true },
  state => {
    // Do not include any cases that have a 'referral_to_oscar' service, bc we handle those in the steps above
    // console.log(
    //   `Referrals before filter: ${JSON.stringify(state.data.map(x => x.case_id_display))}`
    // );
    const oscarCases = state.data
      .filter(c => c.oscar_number) //Only return Oscar cases
      .filter(c => {
        if (c.services_section) {
          // if it has a services section, ensure no services include "referral_to_oscar"
          return !c.services_section.some(s => s.service_response_type === 'referral_to_oscar');
        }
        return true;
      })
      .map(x => {
        return x;
      });

    console.log(
      `OSCaR cases that have been registered in Primero & assigned a Case Id: ${JSON.stringify(
        oscarCases ? oscarCases.map(x => x.case_id_display) : ''
      )}`
    );

    return { ...state, oscarCases, data: {}, references: [] };
  }
);

// After job completes successfully, update cursor
fn(state => {
  const { lastRunDateTime, currentAttempt, cursor } = state;
  console.log('cursor', cursor);
  console.log('Current attempt time:', currentAttempt);
  console.log(`Updating lastRunDateTime from ${lastRunDateTime} to ${currentAttempt}.`);
  return { ...state, lastRunDateTime: currentAttempt };
});
