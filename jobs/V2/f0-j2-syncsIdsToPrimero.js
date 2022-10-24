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

  const finalized = originalCases.map(buildCaseRecord).map(c => {
    return c;
  });

  console.log('Prepared cases to sync back to Primero:', JSON.stringify(finalized, null, 2));

  return { ...state, cases: finalized };
});
// for EACH Oscar case, we upsert the primero case record to sync the IDs back to Primero
each(
  '$.cases[*]',
  upsertCase({
    externalIds: ['case_id'],
    data: state => {
      const individualCase = state.data;
      console.log('Syncing decision... ::', individualCase);
      return individualCase;
    },
  })
);
