alterState(state => {
  // state.cases = state.data.map(x => {
  //   // here we build the payload for Primero
  //   return {
  //     remote: true,
  //     child: {
  //       oscar_number: x.global_id,
  //       mosvy_number: x.mosvy_number,
  //       name_first: x.given_name,
  //       name_last: x.family_name,
  //       sex: x.gender,
  //       date_of_birth: x.date_of_birth,
  //       location_current: x.location_current_village_code,
  //       address_current: x.address_current_village_code,
  //       oscar_status: x.status,
  //       case_status_reopened: true, // this is inferred how?
  //       protection_status: x.reason_for_referral,
  //       owned_by: 'government_user_location_one',
  //       oscar_reason_for_exiting: x.reason_for_exiting,
  //       has_referral: 'true',
  //       consent_for_services: 'true',
  //       disclosure_other_orgs: 'true',
  //     },
  //     services_section: [
  //       {
  //         service_type_text: x.services.name,
  //         // 'services_section[][service_type_details_text]': do not map?,
  //         oscar_case_worker_name: x.case_worker_name,
  //         oscar_referring_organization: x.organization_name,
  //         oscar_case_worker_telephone: x.case_worker_mobile,
  //       },
  //     ],
  //     transitions: [{}],
  //   };
  // });
  state.cases = [
    {
      remote: true,
      child: {
        case_id: '51f2adb5-dcdb-4310-9b69-c4e28c063aeb',
        short_id: 'c063aeb',
        owned_by: 'primero',
        created_by: 'primero',
        owned_by_agency: 'agency_name',
        created_at: '2020/02/18 00:00:00 +0000',
        case_id_display: 'c063aeb',
        name_first: 'third',
        name_last: 'case',
        sex: 'female',
        date_of_birth: '2005/06/13',
        oscar_number: '88986571w',
        mosvy_number: '30588986571',
        location_current: '12110417',
        protection_status: 'migrant_child_13820',
        module_id: 'primeromodule-cp',
        record_state: true,
        registration_date: '2016/06/17',
        child_status: 'Open',
        consent_for_services: true,
        disclosure_other_orgs: true,
        has_referral: true,
        services_section: [
          {
            unique_id: '81544ee2-f17e-4970-9b8f-3ad20618cd7c',
            service_response_type: 'referral_from_oscar',
            service_type: 'counselling',
            service_type_text: 'Counselling',
            service_type_details_text: 'Family counselling / mediation',
            oscar_case_worker_name: 'Name OSCaR case worker',
            oscar_referring_organization: 'OSCaR Organization',
            oscar_case_worker_telephone: '0123456789',
          },
        ],
        transitions: [
          {
            unique_id: 'b92bbac8-aecc-4a83-9c2a-ed0f65699958',
            type: 'referral',
            notes: 'this is a new referal 22',
            transitioned_by: 'primero',
            service: 'counselling',
            created_at: '2020/02/18',
            service_section_unique_id: '81544ee2-f17e-4970-9b8f-3ad20618cd7c',
          },
        ],
      },
    },
  ];
  return state;
});

each(
  '$.cases[*]',
  upsertCase(
    { externalId: 'oscar_number', data: state => state.data },
    post('https://www.openfn.org/inbox/uuid', {
      json: {
        external_id: state.data.externalId,
        global_id: state.data.oscar_id,
        external_id_display: state.data.extDisplay,
      },
    })
  )
);
