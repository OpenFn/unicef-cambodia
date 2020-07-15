// Oscar cases ---> Primero
// User Story 2: 'View Oscar cases in Primero' AND User Story 4: 'Sending referrals to Primero'
alterState(state => {
  const serviceMap = {
    'Generalist social work / case work': {
      subtype: 'social_work_case_work_generalist',
      type: 'social_work_case_work',
    },
    'Community social work': {
      subtype: 'social_work_case_work_community',
      type: 'family_based_care',
    },
    'Emergency foster care': {
      subtype: 'family_based_care_emergency_foster',
      type: 'family_based_care',
    },
    'Long term foster care': {
      subtype: 'family_based_care_longterm_foster',
      type: 'family_based_care',
    },
    'Kinship care': {
      subtype: 'family_based_care_kinship',
      type: 'family_based_care',
    },
    'Domestic adoption support': {
      subtype: 'family_based_care_domestic_adoption',
      type: 'family_based_care',
    },
    'Family preservation': {
      subtype: 'family_based_care_family_preservation',
      type: 'family_based_care',
    },
    'Family reunification': {
      subtype: 'family_based_care_family_reunification',
      type: 'family_based_care',
    },
    'Independent Living': {
      subtype: 'family_based_care_independent_living',
      type: 'family_based_care',
    },
    'Drug and Alcohol Counselling': {
      subtype: 'drug_alcohol_counselling',
      type: 'drug_alcohol',
    },
    'Detox / rehabilitation services': {
      subtype: 'drug_alcohol_detox_rehabilitation',
      type: 'drug_alcohol',
    },
    'Detox support': {
      subtype: 'drug_alcohol_detox_support',
      type: 'drug_alcohol',
    },
    'Generalist counselling': {
      subtype: 'counselling_generalist',
      type: 'counselling',
    },
    'Counselling for abuse survivors': {
      subtype: 'counselling_abuse_survivors',
      type: 'counselling',
    },
    'Trauma counselling': {
      subtype: 'counselling_trauma',
      type: 'counselling',
    },
    'Family counselling / mediation': {
      subtype: 'counselling_family',
      type: 'counselling',
    },
    'Direct material assistance': {
      subtype: 'financial_development_material_assistance',
      type: 'financial_development',
    },
    'Direct financial assistance': {
      subtype: 'financial_development_financial_assistance',
      type: 'financial_development',
    },
    'Income generation services': {
      subtype: 'financial_development_income_generation',
      type: 'financial_development',
    },
    'Day care services': {
      subtype: 'financial_development_day_care',
      type: 'financial_development',
    },
    'Therapeutic interventions': {
      subtype: 'disability_support_therapeutic_interventions',
      type: 'disability_support',
    },
    'Disability respite care': {
      subtype: 'disability_support_respite-care',
      type: 'disability_support',
    },
    'Therapeutic training': {
      subtype: 'disability_support_therapeutic_training',
      type: 'disability_support',
    },
    'Disability-aid provision': {
      subtype: 'disability_support_aid_provision',
      type: 'disability_support',
    },
    'Peripheral supports': {
      subtype: 'disability_support_peripheral',
      type: 'disability_support',
    },
    'Support groups': {
      subtype: 'disability_support_groups',
      type: 'disability_support',
    },
    'Support to access care': {
      subtype: 'medical_support_access_care',
      type: 'medical_support',
    },
    'Provision of medical care': {
      subtype: 'medical_support_provision_medical_case',
      type: 'medical_support',
    },
    'Medical training services': {
      subtype: 'medical_support_medical_training',
      type: 'medical_support',
    },
    'Health education': {
      subtype: 'medical_support_healt_education',
      type: 'medical_support',
    },
    'Support to access legal services': {
      subtype: 'legal_support_access_legal_services',
      type: 'legal_support',
    },
    'Legal advocacy services': {
      subtype: 'legal_support_advocacy_services',
      type: 'legal_support',
    },
    'Legal representation': {
      subtype: 'legal_support_representation',
      type: 'legal_support',
    },
    'Prison visitation support': {
      subtype: 'legal_support_prision_visitation',
      type: 'legal_support',
    },
    'Therapeutic interventions': {
      subtype: 'mental_health_support_therapeutic_interventions',
      type: 'mental_health_support',
    },
    'Therapeutic training': {
      subtype: 'mental_health_support_therapeutic_training',
      type: 'mental_health_support',
    },
    'Direct medical support': {
      subtype: 'mental_health_support_direct_medical_support',
      type: 'mental_health_support',
    },
    'School support': {
      subtype: 'training_education_school_support',
      type: 'training_education',
    },
    'Supplementary school education': {
      subtype: 'training_education_supplementary',
      type: 'training_education',
    },
    'Vocational education and training': {
      subtype: 'training_education_vocational',
      type: 'training_education',
    },
    'Material support for education (uniforms, etc)': {
      subtype: 'training_education_material_support',
      type: 'training_education',
    },
    'Scholarships or financial support': {
      subtype: 'training_education_scholarships',
      type: 'training_education',
    },
    'Life skills': {
      subtype: 'training_education_life_skills',
      type: 'training_education',
    },
    'Family support': {
      subtype: 'family_support_family_support',
      type: 'family_support',
    },
    'Rescue Services': {
      subtype: 'anti_trafficking_rescue',
      type: 'anti_trafficking',
    },
    'Transitional Accommodation': {
      subtype: 'anti_trafficking_transitional_accomodation',
      type: 'anti_trafficking',
    },
    'Post-Trafficking Counseling': {
      subtype: 'anti_trafficking_post_trafficking',
      type: 'anti_trafficking',
    },
    'Community Reintegration Support': {
      subtype: 'anti_trafficking_community_reintegration',
      type: 'anti_trafficking',
    },
    'Residential Care Institution': {
      subtype: 'residential_care_gov_only_other',
      type: 'other',
    },
    'Other Service': { subtype: 'other_other_service', type: 'other' },
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
  /* NOTE: TO REMOVE ... confirm no longer using?
  const protectionMap = {
    'Living and working on street': 'unaccompanied',
    'Unaccompanied child': 'separated',
    'Migrant child': 'migrant_child_13820',
    'Trafficked child': 'trafficked_child_47822',
    'Sexually exploited child': 'sexually_exploited_child_71438',
    'Abandoned child': 'abandoned_child_98628',
    'Orphan child': 'orphan_child_99287',
    'HIV/AIDS': 'hiv_aids_88169',
    'Physical impairment': 'physical_impairment_03566',
    'Mental impairment': 'mental_impairment_27429',
    'Domestic violated child': 'domestic_violated_child_28014',
    'Vulnerable child affected by alcohol': 'vulnerable_child_affected_by_alcohol_01558',
    'OSCaR referral': 'oscar_referral',
  }; */

  state.cases = state.data.data.map(c => {
    function convert(arr) {
      const obj = arr
        .map(s => {
          return {
            unique_id: s.uuid,
            service_subtype: (serviceMap[s.name] && serviceMap[s.name].subtype) || 'Other',
            service_type: (serviceMap[s.name] && serviceMap[s.name].type) || 'Other',
            service_type_text: (serviceMap[s.name] && serviceMap[s.name].type) || 'Other',
            service_type_details_text: serviceMap[s.name] ? 'n/a' : s.name,
          };
        })
        .reduce((result, currentValue) => {
          (result[currentValue['service_type']] = result[currentValue['service_type']] || []).push(
            currentValue
          );
          return result;
        }, {});

      const newArr = Object.keys(obj).map(key => {
        return {
          unique_id: obj[key][0].unique_id,
          service_subtype: obj[key].map(st => st.service_subtype),
          service_type: key,
          service_type_text: key,
          service_type_details_text: obj[key][0].service_type_details_text,
          service_response_type: 'referral_from_oscar',
          oscar_case_worker_name: c.case_worker_name,
          oscar_referring_organization: `agency-${c.organization_name}`,
          oscar_case_worker_telephone: c.case_worker_mobile,
        };
      });

      return newArr;
    }

    const now = new Date();

    // NOTE: These logs are extremely VERBOSE but more secure, given that we don't know
    // exactly what will be provided by the API.
    console.log(
      `Data provided by Oscar (ON: ${c.global_id} / extId: ${c.external_id}) : ${JSON.stringify(
        {
          oscar_short_id: c.slug,
          address_current_village_code: c.address_current_village_code,
          external_case_worker_id: c.external_case_worker_id,
          external_case_worker_name: c.external_case_worker_name,
          external_id: c.external_id,
          external_id_display: c.external_id_display,
          global_id: c.global_id,
          is_referred: c.is_referred,
          location_current_village_code: c.location_current_village_code,
          mosvy_number: c.mosvy_number,
          organization_id: c.organization_id,
          organization_name: c.organization_name,
          services: c.services.map(s => ({ uuid: s.uuid })),
          status: c.status,
        },
        null,
        2
      )}`
    );

    // Mappings for upserting cases in Primero (update if existing, insert if new)
    const primeroCase = {
      remote: true,
      oscar_number: c.global_id,
      case_id: c.external_id !== '' ? c.external_id : null,
      child: {
        // primero_field: oscar_field,
        case_id: c.external_id, // externalId for upsert (will fail if multiple found)
        oscar_number: c.global_id,
        oscar_short_id: c.slug,
        mosvy_number: c.mosvy_number,
        name_first: c.given_name,
        name_last: c.family_name,
        sex: c.gender,
        date_of_birth: c.date_of_birth,
        location_current:
          c.location_current_village_code !== ''
            ? parseInt(c.location_current_village_code, 10).toString()
            : null,
        address_current: c.address_current_village_code,
        oscar_status: c.status,
        protection_status: 'oscar_referral',
        protection_status_oscar: c.reason_for_referral,
        // Q: do we need to handle this differently for referrals? Add an agency-unicef-user?
        owned_by:
          agencyMap[`agency-${c.organization_name}`] || `agency-${c.organization_name}-user`,
        oscar_reason_for_exiting: c.reason_for_exiting,
        has_referral: c.is_referred,
        consent_for_services: true,
        disclosure_other_orgs: true,
        interview_subject: 'other',
        content_source_other: 'OSCaR',
        module_id: 'primeromodule-cp',
        registration_date: now.toISOString().split('T')[0].replace(/-/g, '/'),
        services_section: convert(c.services),
        transitions: convert(c.services).map(t => {
          return {
            service_section_unique_id: t.unique_id,
            service: t.service_type,
            created_at: now.toISOString().split('T')[0].replace(/-/g, '/'),
            type: 'referral',
          };
        }),
      },
    };

    // Note: Sometimes OSCAR sends `null`, sometimes they send `''` (empty
    // strings). Primero wants to discard both of these before making upserts.
    const removeEmpty = obj => {
      Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object') removeEmpty(obj[key]);
        else if (obj[key] == null || obj[key] == '') delete obj[key];
      });
    };

    removeEmpty(primeroCase);
    return primeroCase;
  });

  return state;
});

each(
  '$.cases[*]',
  upsertCase({
    // Upsert Primero cases based on matching 'oscar_number' OR 'case_id'
    externalIds: ['oscar_number', 'case_id'],
    data: state => {
      const c = state.data;
      // NOTE: This is extremely VERBOSE but more secure, given that we don't
      // know exactly what will be provided by the API.
      console.log(
        'Data provided to Primero `upsertCase`: ',
        JSON.stringify(
          {
            remote: true,
            oscar_number: c.oscar_number,
            case_id: c.case_id,
            child: {
              case_id: c.child.case_id,
              oscar_number: c.child.oscar_number,
              mosvy_number: c.child.mosvy_number,
              oscar_short_id: c.child.oscar_short_id,
              location_current: c.child.location_current,
              address_current: c.child.address_current,
              oscar_status: c.child.oscar_status,
              owned_by: c.child.owned_by,
              has_referral: c.child.has_referral,
              consent_for_services: c.child.consent_for_services,
              disclosure_other_orgs: c.child.consent_for_services,
              interview_subject: c.child.interview_subject,
              content_source_other: c.child.content_source_other,
              module_id: c.child.module_id,
              registration_date: c.child.registration_date,
              services_section: c.child.services_section.map(s => ({
                unique_id: s.unique_id,
                oscar_case_worker_name: s.oscar_case_worker_name,
                oscar_referring_organization: s.oscar_referring_organization,
                oscar_case_worker_telephone: s.oscar_case_worker_telephone,
              })),
              transitions: c.child.services_section.map(t => ({
                service_section_unique_id: t.unique_id,
                created_at: t.created_at,
                type: t.type,
              })),
            },
          },
          null,
          2
        )
      );
      return state.data;
    },
  })
);
