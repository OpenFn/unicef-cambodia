// Oscar cases ---> Primero
// User Story 2: 'View Oscar cases in Primero' AND User Story 4: 'Sending referrals to Primero'
alterState(state => {
  const serviceMap = {
    'Social Work / Case Work': 'Social Work / Case Work',
    'Family Based Care': 'Family Based Care',
    'Drug/Alcohol': 'Drug / Alcohol',
    Counselling: 'Counselling',
    'Financial Development': 'Financial Development',
    'Disability Support': 'Disability Support',
    'Medical Support': 'Medical Support',
    'Legal Support': 'Legal Support',
    'Mental Health Support': 'Mental Health Support',
    'Training and Education': 'Training and Education',
    'Family Support': 'Family Support',
    'Anti-Trafficking': 'Anti-Trafficking',
  };

  const agencyMap = {
    'agency-agh': 'agency-agh-user',
    'agency-ahc': 'agency-ahc-user',
    'agency-ajl': 'agency-ajl-user',
    'agency-auscam': 'agency-auscam-user',
    'agency-brc': 'agency-brc-user',
    'agency-cccu': 'agency-cccu-user',
    'agency-cct': 'agency-cct-user',
    'agency-cfi': 'agency-cfi-user',
    'agency-cif': 'agency-cif-user',
    'agency-css': 'agency-css-user',
    'agency-cvcd': 'agency-cvcd-user',
    'agency-cwd': 'agency-cwd-user',
    'agency-demo': 'agency-demo-user',
    'agency-fco': 'agency-fco-user',
    'agency-fit': 'agency-fit-user',
    'agency-fsc': 'agency-fsc-user',
    'agency-fsi': 'agency-fsi-user',
    'agency-fts': 'agency-fts-user',
    'agency-gca': 'agency-gca-user',
    'agency-gct': 'agency-gct-user',
    'agency-hfj': 'agency-hfj-user',
    'agency-hol': 'agency-hol-user',
    'agency-holt': 'agency-holt-user',
    'agency-icf': 'agency-icf-user',
    'agency-isf': 'agency-isf-user',
    'agency-kmo': 'agency-kmo-user',
    'agency-kmr': 'agency-kmr-user',
    'agency-lwb': 'agency-lwb-user',
    'agency-mande': 'agency-mande-user',
    'agency-mho': 'agency-mho-user',
    'agency-mrs': 'agency-mrs-user',
    'agency-msl': 'agency-msl-user',
    'agency-mtp': 'agency-mtp-user',
    'agency-my': 'agency-my-user',
    'agency-myan': 'agency-myan-user',
    'agency-newsmile': 'agency-newsmile-user',
    'agency-pepy': 'agency-pepy-user',
    'agency-rok': 'agency-rok-user',
    'agency-scc': 'agency-scc-user',
    'agency-shk': 'agency-shk-user',
    'agency-spo': 'agency-spo-user',
    'agency-ssc': 'agency-ssc-user',
    'agency-tlc': 'agency-tlc-user',
    'agency-tmw': 'agency-tmw-user',
    'agency-tutorials': 'agency-tutorials-user',
    'agency-voice': 'agency-voice-user',
    'agency-wmo': 'agency-wmo-user',
  };

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
        owned_by: agencyMap[`agency-${c.organization_name}`] || `agency-${c.organization_name}-user`,
        oscar_reason_for_exiting: c.reason_for_exiting,
        has_referral: 'true',
        consent_for_services: 'true',
        disclosure_other_orgs: 'true',
        module_id: 'primeromodule-cp',
        registration_date: c.referral_date,
        oscar_case_worker_name: c.case_worker_name,
        oscar_referring_organization: c.organization_name,
        oscar_case_worker_telephone: c.case_worker_mobile,
      },
      services_section: c.services.map(s => {
        return {
          unique_id: s.uuid,
          service_type: serviceMap[s.name] || 'Other', //Add service mapping table. If s.name not in table, list as "Other"
          service_type_text: serviceMap[s.name] || 'Other', //Same logic as above
          service_type_details_text: serviceMap[s.name] ? 'n/a' : s.name, //If type is "Other", map to services[][name][][subservices][name]
        };
      }),
      transitions: c.services.map(t => {
        return {
          service_section_unique_id: t.uuid,
          service: serviceMap[t.name] || 'Other', //This is see above logic for service name mapping, array
          // created_at: t.referral_date, //Q: Should this be today's date?
          type: 'referral',
        };
      }),
    };
  });

  return state;
});

each(
  '$.cases[*]',
  upsertCase({
    //Upsert Primero cases based on matching 'oscar_number' OR 'case_id'
    externalIds: ['oscar_number', 'case_id'],
    data: state => state.data,
  })
);
