// Clear data from previous runs.
alterState(state => {
  state.data = {};
  state.references = [];
  return state;
});

// GET new OSCaR cases
// User Story 2: 'View Oscar cases in Primero' AND User Story 4: 'Sending referrals to Primero'
post(
  //Oscar authentication  --> To update?
  '/api/v1/auth/sign_in',
  {
    keepCookie: true,
    body: {
      email: state.configuration.username,
      password: state.configuration.password,
    },
  },
  get(
    '/api/v1/organizations/clients',
    {
      keepCookie: true,
      headers: state => {
        //Oscar authentication
        return {
          'access-token': state.data.__headers['access-token'],
          'Content-Type': 'application/json',
          client: state.data.__headers.client,
          uid: state.configuration.username,
        };
      },
      query: {
        since_date: state.lastQueryDate || '2020-01-01 00:00:00', //harcoded option for testing '2020-06-15 00:00:00',
        referred_external: true,
      },
    },
    state => {
      state.data.data.forEach(x => {
        function assertExists(prop) {
          x.hasOwnProperty(prop) || error(prop);
        }

        function error(prop) {
          throw `Oscar API violated contract on the '${prop}' property.
          Please contact _____@oscar.org'`;
        }

        assertExists('global_id');
        assertExists('external_id');
        assertExists('external_id_display');
        assertExists('mosvy_number');
        assertExists('given_name');
        assertExists('family_name');
        assertExists('gender');
        assertExists('date_of_birth');
        assertExists('location_current_village_code');
        assertExists('address_current_village_code');
        assertExists('reason_for_referral');
        assertExists('organization_id');
        assertExists('organization_name');
        assertExists('external_case_worker_name');
        assertExists('external_case_worker_id');
        assertExists('protection_status');
        assertExists('services');
        assertExists('status');
        assertExists('case_worker_name');
        assertExists('case_worker_mobile');
        assertExists('is_referred');
        assertExists('referral_consent_form');

        Array.isArray(x.services) || error('referral_consent_form');

        x.services.forEach(s => {
          s.hasOwnProperty('uuid') || error('services.uuid');
          s.hasOwnProperty('name') || error('services.name');
        });

        Array.isArray(x.referral_consent_form) ||
          error('referral_consent_form');
      });

      const date = new Date(Date.parse(state.data.__headers.date));
      const YYYY = date.getUTCFullYear();
      const MM = date.getUTCMonth();
      const DD = date.getUTCDate();

      const hh = date.getUTCHours();
      const mm = date.getUTCMinutes();
      const ss = date.getUTCSeconds();

      state.lastQueryDate = `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
      return state;
    }
  )
);
