// Primero cases --> OSCaR
// User Story 1: Generating government referrals, creating referrals in Oscar

alterState(state => {
  var results = [];

  while (state.data.length) {
    results.push(state.data.splice(0, 100)); //sending cases in batches of 100
  }

  state.caseChunks = results;
  return state;
});

each(
  '$.caseChunks[*]',
  post(
    //Oscar authentication
    '/api/v1/auth/sign_in',
    {
      keepCookie: true,
      body: {
        email: state.configuration.username,
        password: state.configuration.password,
      },
    },
    //User Story 1.8b: Create referrals in Oscar
    post('/api/v1/organizations/clients/upsert/', {
      //This will upsert cases
      headers: state => {
        //Oscar authentication
        return {
          'access-token': state.data.__headers['access-token'],
          'Content-Type': 'application/json',
          client: state.data.__headers.client,
          uid: state.configuration.username,
        };
      },
      body: state => {
        return state.references[0].map(x => {
          //Mappings for posting cases to Oscar
          return {
            //oscar_field, primero_field,
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
            services: [
              {
                id: x.services_section.unique_id,
                name: x.services_section.service_type,
              },
            ],
            transaction_id: x.transition_id,
          };
        });
      },
    })
  )
);
