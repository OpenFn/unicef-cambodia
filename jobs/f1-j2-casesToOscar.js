alterState(state => {
  var results = [];

  while (state.data.length) {
    results.push(state.data.splice(0, 100));
  }

  state.caseChunks = results;
  return state;
});

each(
  '$.caseChunks[*]',
  post('/api/v1/organizations/clients/create_many/', {
    body: state => {
      return state.data.map(x => {
        return {
          external_id: x.case_id,
          external_id_display: x.case_id_display,
          global_id: x.oscar_number,
          mosvy_number: x.mosvy_number,
          given_name: x.name_first,
          family_name: x.name_last,
          gender: x.sex,
          date_of_birth: x.date_of_birth,
          location_current_village_code: x.location_current,
          reason_for_referral: x.protection_status,
          external_case_worker_name: x.owned_by,
          external_case_worker_id: x.owned_by_id,
          organization_name: x.owned_by_agency,
          organization_id: x.owned_by_agency_id,
          'services[][name]': x['services_section[][service_type]'],
        };
      });
    },
  })
);
