// Primero cases --> OSCaR
// User Story 1: Generating government referrals, creating referrals in Oscar
each(
  '$.data[*]',
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
        const c = state.references[1];
        //Mappings for posting cases to Oscar
        const json = {
          organization: {
            //oscar_field, primero_field,
            external_id: c.case_id,
            external_id_display: c.case_id_display,
            global_id: c.oscar_number,
            mosvy_number: c.mosvy_number,
            given_name: c.name_first,
            family_name: c.name_last,
            gender: c.sex,
            date_of_birth: c.date_of_birth.replace(/\//g, '-'),
            location_current_village_code: c.location_current,
            address_current_village_code: c.address_current,
            reason_for_referral: c.protection_status,
            external_case_worker_name: c.owned_by,
            external_case_worker_id: c.owned_by_id,
            external_case_worker_mobile_phone: c.owned_by_phone,
            organization_name: 'cif', //hardcoding to one of the orgs in Oscar staging system for testing
            //organization_name: c.owned_by_agency.substring(7),
            organization_id: c.owned_by_agency_id,
            services: c.services_section.map(s => {
              return {
                uuid: s.unique_id,
                name: s.service_type,
              };
            }),
            transaction_id: c.transition_id,
          },
        };

        // NOTE: Comment this out (or disable console) in production to protect
        // against exposure of sensitive data.
        console.log(
          'Case data to be posted to Oscar: ',
          JSON.stringify(json, null, 2)
        );
        return json;
      },
    })
  )
);
