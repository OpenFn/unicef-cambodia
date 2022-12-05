//We update cases synced for duplicate prevention AND set the status of newly referred Services as 'Pending'
fn(state => {
  const caseIds = state.cases.map(c => ({
    case_id: c.case_id,
    oscar_number: c.oscar_number,
    address_current: c.address_current,
  }));
  console.log('External Ids for prepared cases:', JSON.stringify(caseIds, null, 2));
  console.log('f2j2 cursor:', state.cursor);
  console.log('lastQueryDate:', state.lastQueryDate);
  return state;
});

// We upsert Primero cases based on matching 'oscar_number' OR 'case_id'
each(
  '$.cases[*]', //using each() here returns state.data for each item in the prepared "cases" array
  upsertCase({
    externalIds: state => (!!state.data.case_id ? ['case_id'] : ['oscar_number']),
    data: state => {
      console.log('Syncing prepared case...', state.data);
      return state.data;
    },
  })
);
//We then get Primero cases to check which should have 'pending' status
getCases(
  {
    remote: true,
    //last_updated_at: state => `${state.cursor}..`,
    last_updated_at: '2022-11-25T00:57:24.777Z..', //TODO: dynamically set cursor
    workflow: 'referral_from_oscar',
  },
  { withReferrals: false },
  state => {
    const cases = state.data;
    console.log('preparedCases ::', JSON.stringify(state.cases, null, 2));
    console.log('referrals fromOscar', JSON.stringify(cases, null, 2));

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

    return { ...state, pendingCases: modifiedCases };
  }
);

each(
  '$.pendingCases[*]', //using each() here returns state.data for each item in the prepared "cases" array
  upsertCase({
    externalIds: ['id'],
    data: state => {
      console.log('Updating pending status for new referrals...', state.data);
      return state.data;
    },
  })
);
