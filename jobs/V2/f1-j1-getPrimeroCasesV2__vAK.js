// Either use a manual cursor, or take the cursor from the last run.
fn(state => {
  console.log('Last sync end date:', state.lastRunDateTime);
  const manualCursor = '2022-04-08T00:44:07.288Z';
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
    return { ...state, oscarRefs: state.data, data: {}, references: [] };
  }
);

// for each oscarRef we get referrals and push the serviceRecordIds for each referral into the referralId array.
each(
  '$.oscarRefs[*]',
  getReferrals({ externalId: 'record_id', id: dataValue('id') }, state => {
    console.log('Searching for related referrals..');
    //referrals = [{ referralId: blah, serviceRecordId: 1 }];
    state.data
      ? state.data
          .filter(r => new Date(r.created_at) >= new Date(state.cursor))
          .map(r => {
            state.referralIds.push(r.service_record_id);
          })
      : {};
    return state;
  })
);

// we filter the services_section in each oscarRef to return only the services that have been sent to Oscar
fn(state => {
  const { oscarRefs, referralIds } = state;
  console.log('oscarRefs:', JSON.stringify(oscarRefs));
  console.log('referralIds:', JSON.stringify(referralIds));

  const sentOscarRefs = oscarRefs
    ? oscarRefs.map(c => ({
        ...c,
        services_section: c.services_section.filter(service =>
          referralIds.includes(service.unique_id)
        ),
      }))
    : {};
  console.log('Now get cases with Oscar Number and NO Referrals to OSCaR...');
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
    //Do not include any cases that have a referral_to_oscar, we get those in the step above
    let casesWithReferral = state.data.filter(c =>
      c.services_section.some(s => s.service_response_type === 'referral_to_oscar')
    );
    state.data = state.data.filter(c => !casesWithReferral.includes(c));
    state.otherIds = state.data.length > 0 ? state.data.map(x => x.id) : {};

    //Return list of other cases with No "Referral to Oscar"
    console.log(
      `Cases with NO referrals extracted with record ids: ${JSON.stringify(
        state.otherIds,
        null,
        2
      )}`
    );
    //console.log(`Other cases with NO referrals: ${JSON.stringify(state.data, null, 2)}`);

    // #3 - Combine cases =====
    state.data = state.oscarRefs.length > 0 ? state.data.concat(state.oscarRefs) : state.data;
    delete state.oscarRefs;
    //console.log(`Final state: ${JSON.stringify(state.data)}`);

    return state;
  }
// );

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
