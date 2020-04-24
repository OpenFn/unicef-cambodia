// Primero cases --> OSCaR
// User Story 1: Generating government referrals, creating referrals in Oscar

alterState(state => {
  var results = [];

  while (state.data.length) {
    results.push(state.data.splice(0, 100)); //sending cases in batches of 100
  }

  state.caseChunks = results;
  console.log(state);
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
        return state.references[0].map(c => {
          //Mappings for posting cases to Oscar
          return {
            //oscar_field, primero_field,
            external_id: c.case_id,
            external_id_display: c.case_id_display,
            global_id: c.oscar_number,
            mosvy_number: c.mosvy_number,
            given_name: c.name_first,
            family_name: c.name_last,
            gender: c.sex,
            date_of_birth: c.date_of_birth,
            location_current_village_code: c.location_current,
            reason_for_referral: c.protection_status,
            external_case_worker_name: c.owned_by,
            external_case_worker_id: c.owned_by_id,
            external_case_worker_mobile_phone: c.owned_by_phone,
            organization_name: c.owned_by_agency,
            organization_id: c.owned_by_agency_id,
            services: [
              {
                id: c.services_section.unique_id,
                name: c.services_section.service_type,
              },
            ],
            transaction_id: c.transition_id,
          };
        });
      },
    })
  )
);
