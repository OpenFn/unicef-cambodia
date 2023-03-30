// In case a Primero referral to OSCaR has been accepted in OSCaR (and therefore assigned an oscar_number) since the last sync,
// we want to sync that OSCaR ID back to Primero before we check Primero for new referrals
// Otherwise Oscar will throw errors if we send a 2nd referral and do not include the Oscar ID in that referral request
fn(state => {
  console.log('Preparing cases and decisions for upload to Primero...');
  state.originalCases = state.data.data;

  function buildCaseRecord(c) {
    const isUpdate = c.external_id;

    return {
      oscar_number: c.global_id,
      case_id: c.external_id === '' ? undefined : c.external_id,
      case_id_display: c.external_id_display === '' ? undefined : c.external_id_display,
      oscar_short_id: c.slug,
      mosvy_number: c.mosvy_number,
    };
  }

  return {
    ...state,
    buildCaseRecord,
  };
});

// we build cases for primero
fn(state => {
  const { originalCases, buildCaseRecord } = state;

  const finalized = originalCases.map(buildCaseRecord).filter(c => c.external_id!==undefined).map(c => {
    return c;
  });
  console.log('Preparing OSCaR external IDs to sync back to Primero...');
  console.log('Primero case updates :: ', JSON.stringify(finalized, null, 2));

  return { ...state, cases: finalized };
});
// for EACH Oscar case, we upsert the primero case record to sync the IDs back to Primero
each(
  '$.cases[*]',
  upsertCase({
    externalIds: state => (!!state.data.case_id ? ['case_id'] : ['oscar_number']),
    data: state => {
      const individualCase = state.data;
      console.log(
        'Syncing Oscar external IDs to Primero case with case_id ::',
        individualCase.case_id
      );
      console.log('oscar_number ::', individualCase.oscar_number);
      console.log('oscar_short_id ::', individualCase.oscar_short_id);
      return individualCase;
    },
  })
);
