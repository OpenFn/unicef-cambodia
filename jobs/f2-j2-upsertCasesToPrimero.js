// Oscar cases ---> Primero
// User Story 2: 'View Oscar cases in Primero' AND User Story 4: 'Sending referrals to Primero'
alterState(state => {
  state.cases = state.data.data.map(x => {
    //Mappings for upserting cases in Primero (update if existing, insert if new)
    return {
      remote: true,
      oscar_number: x.global_id,
      child: {
        // primero_field: oscar_field,
        oscar_number: x.global_id,
        mosvy_number: x.mosvy_number,
        name_first: x.given_name,
        name_last: x.family_name,
        sex: x.gender,
        date_of_birth: x.date_of_birth,
        location_current: x.location_current_village_code,
        address_current: x.address_current_village_code,
        oscar_status: x.status,
        protection_status: x.reason_for_referral,
        owned_by: `agency-${x.organization_name}-user`, //Q: Confirm naming convention 'agency-org-user'
        oscar_reason_for_exiting: x.reason_for_exiting,
        has_referral: 'true',
        consent_for_services: 'true',
        disclosure_other_orgs: 'true',
        module_id: "primeromodule-cp",
        registration_date: x.referral_date
      },
      services_section: [
        {
          //unique_id: x.??,  //Q: Is this a UUID from OSCaR or one that OpenFn generates? 
          //service_type: x.services.name,  
          //service_type_text: x.services.name, //Q: Same mapping as above? 
          //service_type_details_text: x.services.name, //Q: Same mapping as above? 
          oscar_case_worker_name: x.case_worker_name,
          oscar_referring_organization: x.organization_name,
          oscar_case_worker_telephone: x.case_worker_mobile,
        },
      ],
      transitions: [
        {
          //service_section_unique_id: x.??, //Q: How should we generate this UUID?
          //service: x.services.name,
          created_at: x.referral_date, //Q: Confirm this should be referral not created date? 
          type: 'referral'
        },
      ],
    };
  });

  return state;
});

each(
  '$.cases[*]',
  upsertCase({
    externalIds: ['oscar_number', 'case_id'], //Upsert Primero cases based on matching 'oscar_number' OR 'case_id'
    data: state => state.data,
  })
);
