alterState(state => {
  state.cases = state.data.map(x => {
    return {
      remote: true,
      child: {
        oscar_number: x.global_id,
        mosvy_number: x.mosvy_number,
        name_first: x.given_name,
        name_last: x.family_name,
        sex: x.gender,
        date_of_birth: x.date_of_birth,
        location_current: x.location_current_village_code,
        address_current: x.address_current_village_code,
        oscar_status: x.status,
        case_status_reopened: true, // this is inferred how?
        protection_status: x.reason_for_referral,
        owned_by: 'government_user_location_one',
        oscar_reason_for_exiting: x.reason_for_exiting,
        has_referral: 'true',
        consent_for_services: 'true',
        disclosure_other_orgs: 'true',
      },
      services_section: [
        {
          service_type_text: x.services.name,
          // 'services_section[][service_type_details_text]': do not map?,
          oscar_case_worker_name: x.case_worker_name,
          oscar_referring_organization: x.organization_name,
          oscar_case_worker_telephone: x.case_worker_mobile,
        },
      ],
      transitions: [{}],
    };
  });
  return state;
});

each(
  '$.cases[*]',
  upsertCase({
    externalId: 'oscar_number',
    data: state => state.data,
  })
);

// TODO: post ID back to Oscar from Primero