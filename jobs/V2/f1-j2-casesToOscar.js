// Primero cases --> OSCaR
// User Story 1: Generating government referrals, creating referrals in Oscar
fn(state => {
  const { oscarDecisions, oscarRefs, oscarCases } = state;
  const cases = {
    decisions: oscarDecisions,
    referrals: oscarRefs,
    nonReferrals: oscarCases,
  };

  console.log(`Cases with DECISIONS for Oscar: ${JSON.stringify(cases.decisions, null, 2)}`);
  console.log(`Cases with REFERRALS for Oscar: ${JSON.stringify(cases.referrals, null, 2)}`);

  // console.log(
  //   `Cases with referrals OR decisions for Oscar: ${JSON.stringify(cases.referrals, null, 2)}`
  // );

  console.log(
    `NONreferrals to sync external_id only: ${JSON.stringify(cases.nonReferrals, null, 2)}`
  );

  const oscarStrings = value => {
    // NOTE: OSCaR API has unique behavior that requires us to send empty strings for null values.
    if (value) {
      return value;
    } else {
      console.log('Converting key to an empty string for OSCAR.');
      return '';
    }
  };

  //NOTE FOR AK: To test? And update considering multiple agencies now sending referrals?
  const setOrganization = c => {
    // NOTE: This assumes the first referral will tell us which is the referring organization.
    // The "business" stipulates that all "oscar_referring_organization"
    // values will be the SAME for an array including any "referral_from_oscar"
    // items, and requires that we merely select the first item that matches.
    const fromOrg = c.services_section.find(s => s.service_response_type === 'referral_from_oscar');
    const toOrg = c.services_section.find(s => s.service_response_type === 'referral_to_oscar');

    if (fromOrg) {
      console.log(
        'Response type "referral_from_oscar" detected, The "oscar_referring_organization" values for these services are',
        c.services_section.map(s => s.oscar_referring_organization)
      );
      return fromOrg.oscar_referring_organization.substring(7);
    } else if (toOrg) {
      console.log(
        'Response type "referral_to_oscar" detected, The "service_implementing_agency" values for these services are',
        c.services_section.map(s => s.service_implementing_agency)
      );
      return toOrg.service_implementing_agency.substring(7);
    } else {
      console.log(
        'Referral to or from oscar not detected, the "owned_by_agency" is',
        c.owned_by_agency
      );
      console.log('line 72', state.cases.referrals);
      return c.owned_by_agency.substring(7);
    }
  };

  return { ...state, cases, oscarStrings, setOrganization };
});
// =========================================== //

fn(state => {
  console.log('nonReferrals length:', state.cases.nonReferrals.length);
  console.log('referrals length:', state.cases.referrals.length);
  console.log('decisions length:', state.cases.decisions.length);
  return state;
});

post(
  // Oscar authentication, once per run
  '/api/v1/admin_auth/sign_in',
  {
    keepCookie: true,
    body: {
      email: state.configuration.username,
      password: state.configuration.password,
    },
  },
  state => {
    console.log('Authenticated with OSCaR...');
    return {
      ...state,
      oscarHeaders: {
        'Content-Type': 'application/json',
        uid: state.configuration.username,
        client: state.data.__headers.client,
        'access-token': state.data.__headers['access-token'],
      },
    };
  }
);

fn(state => {
  const { oscarStrings, setOrganization, cases } = state;

  const statusMap = {
    accepted_340953: 'Accepted',
    rejected_936484: 'Exited',
    pending_310366: 'Referred',
  };

  function checkValue(data) {
    if (data !== 'NaN' && data) {
      return data.length === 1 || data.length === 7 || data.length === 3 || data.length === 5
        ? '0' + data
        : data; //if 1, 3, 5, or 7 char, add leading 0s
    } else {
      console.log('Converting location null values to OSCAR empty string.');
      return '';
    }
  }

  const serviceMap = {
    social_work_case_work_generalist: 'Generalist social work / case work',
    social_work_case_work_community: 'Community social work',
    family_based_care_emergency_foster: 'Emergency foster care',
    family_based_care_longterm_foster: 'Long term foster care',
    family_based_care_kinship: 'Kinship care',
    family_based_care_domestic_adoption: 'Domestic adoption support',
    family_based_care_family_preservation: 'Family preservation',
    family_based_care_family_reunification: 'Family reunification',
    family_based_care_independent_living: 'Independent Living',
    drug_alcohol_counselling: 'Drug and Alcohol Counselling',
    drug_alcohol_detox_rehabilitation: 'Detox / rehabilitation services',
    drug_alcohol_detox_support: 'Detox support',
    counselling_generalist: 'Generalist counselling',
    counselling_abuse_survivors: 'Counselling for abuse survivors',
    counselling_trauma: 'Trauma counselling',
    counselling_family: 'Family counselling / mediation',
    financial_development_material_assistance: 'Direct material assistance',
    financial_development_financial_assistance: 'Direct financial assistance',
    financial_development_income_generation: 'Income generation services',
    financial_development_day_care: 'Day care services',
    disability_support_therapeutic_interventions: 'Therapeutic interventions',
    'disability_support_respite-care': 'Disability respite care',
    disability_support_therapeutic_training: 'Therapeutic training',
    disability_support_aid_provision: 'Disability-aid provision',
    disability_support_peripheral: 'Peripheral supports',
    disability_support_groups: 'Support groups',
    medical_support_access_care: 'Support to access care',
    medical_support_provision_medical_case: 'Provision of medical care',
    medical_support_medical_training: 'Medical training services',
    medical_support_healt_education: 'Health education',
    legal_support_access_legal_services: 'Support to access legal services',
    legal_support_advocacy_services: 'Legal advocacy services',
    legal_support_representation: 'Legal representation',
    legal_support_prision_visitation: 'Prison visitation support',
    mental_health_support_therapeutic_interventions: 'Therapeutic interventions',
    mental_health_support_therapeutic_training: 'Therapeutic training',
    mental_health_support_direct_medical_support: 'Direct medical support',
    training_education_school_support: 'School support',
    training_education_supplementary: 'Supplementary school education',
    training_education_vocational: 'Vocational education and training',
    training_education_material_support: 'Material support for education (uniforms, etc)',
    training_education_scholarships: 'Scholarships or financial support',
    training_education_life_skills: 'Life skills',
    family_support_family_support: 'Family support',
    anti_trafficking_rescue: 'Rescue Services',
    anti_trafficking_transitional_accomodation: 'Transitional Accommodation',
    anti_trafficking_post_trafficking: 'Post-Trafficking Counseling',
    anti_trafficking_community_reintegration: 'Community Reintegration Support',
    residential_care_gov_only_other: 'Residential Care Institution',
    other_other_service: 'Other Service',
    other: 'Other Service',
  };

  //======================================================================================//
  //=== NOTE: This is the new mapping for Oscar decisions - added July 2022 ==============//
  console.log('decisions', JSON.stringify(cases.decisions, null, 2));
  const mappedDecisions = cases.decisions
    .map(c => {
      const external_id = oscarStrings(c.case_id);
      const external_id_display = oscarStrings(c.case_id_display);
      const client_global_id = oscarStrings(c.oscar_number);

      const referralMap = c.services_section
        .filter(s => s.service_response_type === 'referral_from_oscar')
        .map(s => {
          return {
            external_id,
            external_id_display,
            client_global_id,
            referral_status: statusMap[s.referral_status_edf41f2] || 'Referred',
            referral_id: parseInt(s.oscar_referral_id_a4ac8a5),
          };
        });

      //console.log('referralMap', JSON.stringify(referralMap, null, 2));
      return referralMap;
    })
    .flat(); //to de-nest array - e.g, convert [[data]] --> [data]

  console.log(
    'mappedDecisions - list of oscar_referrals that MIGHT have decisions',
    JSON.stringify(mappedDecisions, null, 2)
  );

  //Check if decision is accepted/rejected before sending...
  function checkDecision(d) {
    return d.referral_status !== 'Referred';
  }

  function checkNull(d) {
    return d.referral_id && d.referral_id !== null && d.referral_id !== undefined;
  }

  const confirmedDecisions = mappedDecisions.filter(checkDecision).filter(checkNull);

  console.log('Finding oscar_referrals with confirmed decisions...');

  console.log(
    'confirmedDecisions - list of oscar_referrals with decisions to sync',
    JSON.stringify(confirmedDecisions, null, 2)
  );
  //=================================================================================//

  const mappedReferrals = cases.referrals.map(c => {
    const lastTransitionNote =
      c.transitions &&
      c.transitions.length > 0 &&
      c.transitions.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0].notes;

    const referralReason = c.referrals.length > 0 ? c.referrals[0].notes : lastTransitionNote;

    // NOTE: This can be added back for more verbose logging.
    // console.log(
    //   `Data provided by Primero: ${JSON.stringify(
    //     {
    //       _id: c._id,
    //       case_id: c.case_id,
    //       case_id_display: c.case_id_display,
    //       created_at: c.created_at,
    //       location_current: c.location_current,
    //       module_id: c.module_id,
    //       owned_by: c.owned_by,
    //       owned_by_agency: c.owned_by_agency,
    //       owned_by_phone: c.owned_by_phone,
    //       services_section: c.services_section.map(s => ({
    //         oscar_referring_organization: s.oscar_referring_organization,
    //         service_implementing_agency: s.service_implementing_agency,
    //         service_status_referred: s.service_status_referred,
    //         unique_id: s.unique_id,
    //       })),
    //       transitions: c.services_section.map(t => ({
    //         created_at: t.created_at,
    //         id: t.id,
    //         service_section_unique_id: t.service_section_unique_id,
    //         transitioned_by: t.transitioned_by,
    //         type_of_export: t.type_of_export,
    //         unique_id: t.unique_id,
    //       })),
    //     },
    //     null,
    //     2
    //   )}`
    // );
    // console.log(`Data provided by Primero:${JSON.stringify(c, null, 4)}`);

    //AK NOTE: Changed below from services_section.find() to FILTER() bc we expect >1 service from Primero
    //Historically assumed would only send 1 service per case, but this is no longer true bc we want to sync decisions
    //This will return ALL Primero services marked as 'referrals'
    const primeroService = c.services_section.filter(
      s =>
        s.service_response_type === 'referral_to_oscar' ||
        s.service_response_type === 'referral_from_oscar' //TODO: @Aleksa - remove now that we have decisions above?
    );
    //console.log('primero filtered services: ', primeroService);

    //Here we want to find only the MOST RECENT service, taking the last item in the service_section array
    const primeroLastService = primeroService.length > 1 ? primeroService.length - 1 : 0;
    // console.log(
    //   'Most recent Primero service to sync to Oscar: ',
    //   primeroService[primeroLastService]
    // );

    //TODO: @Aleksa - Remove if we have a default mapping for referral_status?
    //Here we only map the referral status of the Most Recent service from Primero
    const referral_status = primeroService
      ? statusMap[oscarStrings(primeroService[primeroLastService].referral_status_edf41f2)] ||
        'Referred'
      : 'Referred';

    // Mappings for posting cases to Oscar
    const oscar = {
      // oscar_field, primero_field,
      external_id: oscarStrings(c.case_id),
      external_id_display: oscarStrings(c.case_id_display),
      global_id: c.oscar_number ? oscarStrings(c.oscar_number) : undefined,
      level_of_risk: c.risk_level==='no_action' ? 'no action' : c.risk_level,
      mosvy_number: oscarStrings(c.mosvy_number),
      given_name: oscarStrings(c.name_first),
      family_name: oscarStrings(c.name_last),
      gender: oscarStrings(c.sex),
      date_of_birth: oscarStrings(c.date_of_birth && c.date_of_birth.replace(/\//g, '-')),
      location_current_village_code: checkValue(c.location_current),
      address_current_village_code: checkValue(c.location_current), //oscarStrings(c.address_current),
      reason_for_referral: oscarStrings(referralReason),
      external_case_worker_name: oscarStrings(c.owned_by),
      external_case_worker_id: oscarStrings(c.owned_by_id),
      external_case_worker_mobile: c.owned_by_phone || '000000000',
      resource: c.workflow === 'referral_to_oscar' ? 'Primero' : undefined,
      is_referred: true,
      organization_name: 'cif', //TODO: Hardcoded for staging testing only; replaces lines below.
      organization_id: 'cif', //TODO: Hardcoded, replace with below
      //organization_name: setOrganization(c), //TODO: Add mappings back before go-live
      //organization_id: oscarStrings(c.owned_by_agency_id),
      //referral_status: 'Referred', //TODO: TO REMOVE! This overwrites decisions for ALL referrals, but API throws error is not here
      services: c.services_section
        .filter(s => s.service_type)
        .map(s => {
          // NEW logic to return only 1 serivce subtype if multiple are mistakenly selected by the user
          const service = {
            uuid: oscarStrings(s.unique_id),
            name:
              s.service_subtype.length > 0
                ? serviceMap[s.service_subtype[0]] || 'Not Specified'
                : 'Not Specified',
          };
          return s.service_subtype.length > 0
            ? service
            : { uuid: oscarStrings(s.unique_id), name: 'Not Specified' };
          // return s.service_subtype.length > 0
          //   ? s.service_subtype.map(st => {

          //       return {
          //         uuid: oscarStrings(s.unique_id),
          //         name: st ? serviceMap[st] || 'Not Specified' : 'Not Specified',
          //       };
          //     })
          //   : { uuid: oscarStrings(s.unique_id), name: 'Not Specified' };
        })
        .flat(),
      transaction_id:
        c.transitions && c.transitions.length > 0 ? c.transitions[0].transition_id : undefined,
      // transaction_id: oscarStrings(c.transition_id), //TODO: Confirm mapping; not sure this was ever working
      date_of_referral: oscarStrings(
        c.last_updated_at && c.last_updated_at.replace(/\//g, '-')
      ).substring(0, 10),
    };

    // NOTE: Logs for enhanced audit trail.
    // console.log(
    //   'Case data to be posted to Oscar: ',
    //   JSON.stringify(
    //     {
    //       organization: {
    //         external_id: oscar.external_id,
    //         external_id_display: oscar.external_id_display,
    //         oscar_id: oscar.oscar_short_id,
    //         global_id: oscar.global_id,
    //         mosvy_number: oscar.mosvy_number,
    //         location_current_village_code: oscar.location_current_village_code,
    //         address_current_village_code: oscar.address_current_village_code,
    //         external_case_worker_id: oscar.external_case_worker_id,
    //         external_case_worker_mobile: oscar.external_case_worker_mobile,
    //         organization_name:'cif',
    //         organization_id: 'cif',
    //         is_referred: oscar.is_referred,
    //         services: oscar.services && oscar.services.map(s => ({ uuid: s.uuid })),
    //       },
    //     },
    //     null,
    //     2
    //   )
    // );
    // console.log(
    //   'Case data to be posted to Oscar: ',
    //   JSON.stringify(
    //     {
    //       organization: {
    //         external_id: oscar.external_id,
    //         external_id_display: oscar.external_id_display,
    //         global_id: oscar.global_id,
    //         level_of_risk: c.risk_level,
    //         oscar_id: oscar.oscar_short_id,
    //         mosvy_number: oscar.mosvy_number,
    //         given_name: oscar.given_name,
    //         family_name: oscar.family_name,
    //         gender: oscar.gender,
    //         date_of_birth: oscar.date_of_birth,
    //         location_current_village_code: oscar.location_current_village_code,
    //         address_current_village_code: oscar.address_current_village_code,
    //         reason_for_referral: oscar.reason_for_referral,
    //         external_case_worker_name: oscar.external_case_worker_name,
    //         external_case_worker_id: oscar.external_case_worker_id,
    //         external_case_worker_mobile: oscar.external_case_worker_mobile,
    //         organization_name: 'cif',
    //         organization_id: 'cif',
    //         is_referred: oscar.is_referred,
    //         services: oscar.services && oscar.services.map(s => ({ uuid: s.uuid })),
    //         transaction_id: oscar.transaction_id,
    //       },
    //     },
    //     null,
    //     2
    //   )
    // );
    // console.log('Case data to be posted to Oscar: ', JSON.stringify(oscar, null, 4));

    return { organization: oscar };
  });

  console.log(
    'list of mapped referrals to send to Oscar',
    JSON.stringify(mappedReferrals, null, 2)
  );

  // NOTE: If Oscar referrals have 2+ services, here we split into separate JSON objects so that each
  // request sent to Oscar only contains 1 service each (e.g., { c1, services: [s1, s2]} -->
  // becomes 2 requests: {c1, services: [s1]} AND {c1, services: [s2]}
  const transformedCases = [];

  mappedReferrals.map(wrapper => {
    wrapper.organization.services.map(s => {
      transformedCases.push({
        ...wrapper,
        organization: { ...wrapper.organization, services: [s] },
      });
    });
  });

  console.log('Transformed Oscar referrals to sync...', JSON.stringify(transformedCases, null, 2));

  return {
    ...state,
    cases: { ...cases, referrals: transformedCases, decisions: confirmedDecisions },
  };
});

//NOW that data is transforemed, we start to map to Oscar...

//User Story 1.8b: Create referrals in Oscar
each(
  '$.cases.referrals[*]',
  post('/api/v1/organizations/clients/upsert/', {
    headers: state => state.oscarHeaders,
    body: state => state.data,
    transformResponse: [
      data => {
        console.log('Uploading referrals... Oscar says', JSON.stringify(data, null, 2));
        return data;
      },
    ],
  })
);

//LOGS FOR TESTING - TO REMOVE
// fn(state => {
//   console.log('state', JSON.stringify(state.cases.decisions, null, 2));
//   return state;
// });

//== NEW PUT request that sends all decisions in bulk to this new endpoint ==//
fn(state => {
  if (state.cases.decisions.length > 0)
    return put('/api/v1/organizations/referrals/update_statuses/', {
      headers: state => state.oscarHeaders,
      body: state => {
        const body = { data: state.cases.decisions };
        console.log('Decisions sent in final PUT request', JSON.stringify(body, null, 2));
        return body;
      },
      transformResponse: [
        data => {
          console.log('Uploading decisions...Oscar says', JSON.stringify(data, null, 2));
          return data;
        },
      ],
    })(state);
  console.log('No decisions to sync to Oscar.');
  return state;
});

fn(state => {
  // Here we update links in OSCaR for non-referrals
  // NOTE: We also sync these cases back to OSCaR to log the Primero external_id assigned

  if (state.cases.nonReferrals.length > 0)
    return post(
      '/api/v1/admin_auth/sign_in',
      {
        keepCookie: true,
        body: {
          email: state.configuration.username,
          password: state.configuration.password,
        },
      },
      put('/api/v1/organizations/clients/update_links/', {
        headers: state => ({
          'Content-Type': 'application/json',
          uid: state.configuration.username,
          client: state.data.__headers.client,
          'access-token': state.data.__headers['access-token'],
        }),
        body: state => {
          const payload = {
            data: state.cases.nonReferrals.map(c => ({
              external_id: state.oscarStrings(c.case_id),
              external_id_display: state.oscarStrings(c.case_id_display),
              global_id: state.oscarStrings(c.oscar_number),
              is_referred: false,
            })),
          };
          console.log(state.cases.nonReferrals);
          console.log(`'Update links' with non-referrals: ${JSON.stringify(payload, null, 4)}`);
          return payload;
        },
      })
    )(state);

  console.log('No non-referral cases to update.');
  console.log('cursor', state.cursor);
  return state;
});
