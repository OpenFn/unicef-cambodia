// Oscar cases ---> Primero
// User Story 2: View Oscar cases in Primero
// User Story 4: Sending referrals to Primero
alterState(state => {
  state.agencies = {
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
        owned_by: state.agencies[`agency-${x.organization_name}`],
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
  upsertCase(
    { externalId: 'oscar_number', data: state => state.data }, //>>Q: Upsert Primero cases based on matching oscar_number, mosvy_number, AND/OR case_id?
    alterState(state => {
      return post(
        //Return case links to Oscar
        //PUT to /api/v1/organizations/clients/update_links/
        //send back to OpenFn inbox instead of Oscar for testing
        `https://www.openfn.org/inbox/${state.configuration.inboxUuid}`,
        {
          body: {
            external_id: state.data.case_id,
            global_id: state.data.oscar_number,
            external_id_display: state.data.case_id_display,
          },
        }
      )(state);
    })
  )
);
