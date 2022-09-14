// Now let's clean decision payload & only sync cases with decisions for services...
fn(state => {
  const cleanedDecisions = state.decisions
    .map(d => {
      delete d.__original_oscar_record;
      //only sync decisions with a matching Primero service_id and a decision update
      const filteredServices = d.services_section.filter(
        s => s.unique_id && s.referral_status_edf41f2
      );
      return { ...d, services_section: filteredServices };
    })
    .filter(d => d.services_section.length > 0);

  //console.log('cleanedDecisions to sync to Primero:', JSON.stringify(cleanedDecisions, null, 2));
  return { ...state, decisions: cleanedDecisions };
});

// for EACH decision, we upsert the primero case record
each(
  '$.decisions[*]',
  upsertCase({
    externalIds: ['case_id'],

    data: state => {
      const decision = state.data;
      console.log('Syncing decision... ::', decision);
      return decision;
    },
  })
);


getCases(
  {
    remote: true,
    //last_updated_at: state => `${state.cursor}..`,
    last_updated_at: '2022-09-08T00:57:24.777Z..', //TODO: dynamically set cursor
    workflow: 'referral_from_oscar',
  },
  { withReferrals: false },
  state => {
    const cases = state.data;
    //console.log('referrals fromOscar', JSON.stringify(cases, null, 2));

    function checkPending(s) {
      return (
        s.referral_status_edf41f2 === 'pending_310366' ||
        s.referral_status_edf41f2 === undefined ||
        s.referral_status_edf41f2 === null
      );
    }

    const casesWithPending = cases.map(c => {
      return {
        ...c,
        services_section: c.services_section.filter(checkPending),
      };
    });

    console.log('casesWithPending', JSON.stringify(casesWithPending, null, 2));

    ///return only cases with services
    function checkServices(c) {
      const length = c.services_section.length;
      return length > 0 ? true : false;
    }

    const casesToUpdate = casesWithPending.filter(checkServices);

    //console.log('casesToUpdate', JSON.stringify(casesToUpdate, null, 2));

    modifiedCases = casesToUpdate
      ? casesToUpdate.map(c => {
          return {
            id: c.id,
            case_id: c.case_id,
            module_id: 'primeromodule-cp',
            services_section: c.services_section.map(s => {
              return {
                ...s,
                referral_status_edf41f2: 'pending_310366',
              };
            }),
          };
        })
      : undefined;

    //console.log('modifiedCases', JSON.stringify(modifiedCases, null, 2));

    return { ...state, cases: modifiedCases };
  }
);

each(
  '$.cases[*]', //using each() here returns state.data for each item in the prepared "cases" array
  upsertCase({
    externalIds: ['id'],
    data: state => {
      console.log('Updating pending status for new referrals...', state.data);
      return state.data;
    },
  })
);