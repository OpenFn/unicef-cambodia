// Oscar cases ---> Primero
// User Story 2: 'View Oscar cases in Primero' AND User Story 4: 'Sending referrals to Primero'
alterState(state => {
  state.cases = state.data.data.map(c => {
    //Mappings for upserting cases in Primero (update if existing, insert if new)
    return {
      remote: true,
      oscar_number: c.global_id,
      child: {
        // primero_field: oscar_field,
        oscar_number: c.global_id,
        mosvy_number: c.mosvy_number,
        name_first: c.given_name,
        name_last: c.family_name,
        sex: c.gender,
        date_of_birth: c.date_of_birth,
        location_current: c.location_current_village_code,
        address_current: c.address_current_village_code,
        oscar_status: c.status,
        protection_status: c.reason_for_referral,
        owned_by: `agency-${c.organization_name}-user`, //Q: Confirm naming convention 'agency-org-user'
        oscar_reason_for_exiting: c.reason_for_exiting,
        has_referral: 'true',
        consent_for_services: 'true',
        disclosure_other_orgs: 'true',
        module_id: "primeromodule-cp",
        registration_date: c.referral_date,
        oscar_case_worker_name: c.case_worker_name,
        oscar_referring_organization: c.organization_name,
        oscar_case_worker_telephone: c.case_worker_mobile
      },
      services_section: c.services.map(s => {
        return {
          unique_id: s.uuid,
          service_type: s.name,  //Add service mapping table. If s.name not in table, list as "Other"
          service_type_text: s.name, //Same logic as above
          service_type_details_text: s.name //If type is "Other", map to services[][name][][subservices][name]
        },
      ),
      transitions: [
        {
          service_section_unique_id: s.uuid,
          service: s.services.name, //This is see above logic for service name mapping, array
          created_at: s.referral_date, //Q: Should this be today's date?
          type: 'referral'
        },
      ],
    };
  });

  return state;
});

each(
  '$.cases[*]',
  upsertCase({ //Upsert Primero cases based on matching 'oscar_number' OR 'case_id'
    externalIds: ['oscar_number', 'case_id'],
    data: state => state.data,
  })
);
