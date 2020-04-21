// Oscar cases ---> Primero
// User Story 2: View Oscar cases in Primero
// User Story 4: Sending referrals to Primero
alterState(state => {
  state.cases = state.data.map(x => {
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
        case_status_reopened: true, // >>Q: This is inferred how?
        protection_status: x.reason_for_referral,
        owned_by: `agency-${x.organization_name}-user`,
        oscar_reason_for_exiting: x.reason_for_exiting,
        has_referral: 'true',
        consent_for_services: 'true',
        disclosure_other_orgs: 'true',
        /*                      >>Q: Do we want to add these mappings?
        "module_id": "primeromodule-cp",
        "record_state": true,
        "registration_date": "2020/03/20",  >>Q: Set to today's date?
        "child_status": "Open", */
      },
      services_section: [
        {
          service_type_text: x.services.name,
          // 'services_section[][service_type_details_text]': TO UPDATE >>See 'Services Mapping' sheet in specs for how to map,
          oscar_case_worker_name: x.case_worker_name,
          oscar_referring_organization: x.organization_name,
          oscar_case_worker_telephone: x.case_worker_mobile,
        },
      ],
      transitions: [
        {
          // >>Q: Confirming we're not creating transitions?
        },
      ],
    };
  });

  return state;
});

each(
  '$.cases[*]',
  upsertCase({
    externalIds: ['oscar_number', 'case_id'],
    data: state => state.data,
  })
);
