// Primero cases --> OSCaR
// User Story 1: Generating government referrals, creating referrals in Oscar
post(
  //Oscar authentication, once per run
  '/api/v1/auth/sign_in',
  {
    keepCookie: true,
    body: {
      email: state.configuration.username,
      password: state.configuration.password,
    },
  },
  //User Story 1.8b: Create referrals in Oscar
  each(
    merge(
      '$.references[0][*]',
      // Bring down the authentication info for use in each case post.
      fields(
        field('__token', dataValue("__headers['access-token']")),
        field('__client', dataValue('__headers.client'))
      )
    ),
    post('/api/v1/organizations/clients/upsert/', {
      //This will upsert cases
      headers: state => {
        //Use Oscar authentication from previous step
        return {
          'Content-Type': 'application/json',
          uid: state.configuration.username,
          client: state.data.__client,
          'access-token': state.data.__token,
        };
      },
      body: state => {
        // TODO: This is very strange behaviour for an API. Let's confirm with
        // Kiry that it's not indicative of bigger problems under the hood.
        function oscarStrings(data) {
          if (data) {
            return data;
          } else {
            console.log('Converting key to an empty string for OSCAR.');
            return '';
          }
        }

        const serviceMap = {
          social_work_case_work: 'Social Work / Case Work',
          family_based_care: 'Family Based Care',
          drug_alcohol: 'Drug / Alcohol',
          counselling: 'Counselling',
          financial_development: 'Financial Development',
          disability_support: 'Disability Support',
          medical_support: 'Medical Support',
          legal_support: 'Legal Support',
          mental_health_support: 'Mental Health Support',
          training_education: 'Training and Education',
          family_support: 'Family Support',
          anti_trafficking: 'Anti-Trafficking',
          other: 'Other',
        };

        const protectionMap = {
          unaccompanied: 'Living and working on street',
          separated: 'Unaccompanied child',
          migrant_child_13820: 'Migrant child',
          trafficked_child_47822: 'Trafficked child',
          sexually_exploited_child_71438: 'Sexually exploited child',
          abandoned_child_98628: 'Abandoned child',
          orphan_child_99287: 'Orphan child',
          hiv_aids_88169: 'HIV/AIDS',
          physical_impairment_03566: 'Physical impairment',
          mental_impairment_27429: 'Mental impairment',
          domestic_violated_child_28014: 'Domestic violated child',
          vulnerable_child_affected_by_alcohol_01558:
            'Vulnerable child affected by alcohol',
          oscar_referral: 'OSCaR referral',
        };

        const c = state.data;

        // Mappings for posting cases to Oscar
        const json = {
          organization: {
            // oscar_field, primero_field,
            external_id: oscarStrings(c.case_id),
            external_id_display: oscarStrings(c.case_id_display),
            global_id: oscarStrings(c.oscar_number), // commenting out during tesing, because Primero test data has fake oscar numbers
            mosvy_number: oscarStrings(c.mosvy_number),
            given_name: oscarStrings(c.name_first),
            family_name: oscarStrings(c.name_last),
            gender: oscarStrings(c.sex),
            date_of_birth: oscarStrings(
              c.date_of_birth && c.date_of_birth.replace(/\//g, '-')
            ),
            location_current_village_code: oscarStrings(c.location_current),
            address_current_village_code: oscarStrings(c.address_current),
            reason_for_referral: oscarStrings(
              protectionMap[c.protection_status] || c.protection_status
            ),
            external_case_worker_name: oscarStrings(c.owned_by),
            external_case_worker_id: oscarStrings(c.owned_by_id),
            external_case_worker_mobile: c.owned_by_phone || '000000000',
            // organization_name: 'cif', // hardcoding to one of the orgs in Oscar staging system for testing
            organization_name: oscarStrings(c.owned_by_agency.substring(7)),
            organization_id: oscarStrings(c.owned_by_agency_id),
            services: c.services_section.map(s => {
              return {
                uuid: oscarStrings(s.unique_id),
                name: serviceMap[s.service_type] || 'Other',
              };
            }),
            transaction_id: oscarStrings(c.transition_id),
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
