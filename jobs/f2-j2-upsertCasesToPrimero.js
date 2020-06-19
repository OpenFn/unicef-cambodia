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
    'Vulnerable child affected by alcohol':
      'vulnerable_child_affected_by_alcohol_01558',
    'OSCaR referral': 'oscar_referral',
  };

  state.cases = state.data.data.map(c => {
    function convert(arr) {
      const obj = arr
        .map(s => {
          return {
            unique_id: s.uuid,
            service_subtype:
              (serviceMap[s.name] && serviceMap[s.name].subtype) || 'Other',
            service_type:
              (serviceMap[s.name] && serviceMap[s.name].type) || 'Other',
            service_type_text:
              (serviceMap[s.name] && serviceMap[s.name].type) || 'Other',
            service_type_details_text: serviceMap[s.name] ? 'n/a' : s.name,
          };
        })
        .reduce((result, currentValue) => {
          (result[currentValue['service_type']] =
            result[currentValue['service_type']] || []).push(currentValue);
          return result;
        }, {});

      const newArr = Object.keys(obj).map(key => {
        return {
          unique_id: obj[key][0].unique_id,
          service_subtype: obj[key].map(st => st.service_subtype),
          service_type: key,
          service_type_text: key,
          service_type_details_text: obj[key][0].service_type_details_text,
        };
      });

      return newArr;
    }

    const now = new Date();

    console.log(`Data provided by Oscar: ${JSON.stringify(c, null, 2)}`);

    //Mappings for upserting cases in Primero (update if existing, insert if new)
    return {
      remote: true,
      oscar_number: c.global_id,
      case_id: c.external_id,
      child: {
        // primero_field: oscar_field,
        case_id: c.external_id, // externalId for upsert (will fail if multiple found)
        oscar_number: c.global_id,
        mosvy_number: c.mosvy_number,
        name_first: c.given_name,
        name_last: c.family_name,
        sex: c.gender,
        date_of_birth: c.date_of_birth,
        location_current:
          '0'.repeat(8 - c.location_current_village_code.length) +
          c.location_current_village_code,
        address_current:
          '0'.repeat(8 - c.address_current_village_code.length) +
          c.address_current_village_code,
        oscar_status: c.status,
        protection_status: 'oscar_referral', //protectionMap[c.reason_for_referral] || 'other',
        protection_status_oscar: c.reason_for_referral,
        owned_by:
          agencyMap[`agency-${c.organization_name}`] ||
          `agency-${c.organization_name}-user`,
        oscar_reason_for_exiting: c.reason_for_exiting,
        has_referral: 'true',
        consent_for_services: 'true',
        disclosure_other_orgs: 'true',
        module_id: 'primeromodule-cp',
        registration_date: now.toISOString().split('T')[0].replace(/-/g, '/'),
        oscar_case_worker_name: c.case_worker_name,
        oscar_referring_organization: c.organization_name,
        oscar_case_worker_telephone: c.case_worker_mobile,
        oscar_referral_consent_form:
          c.referral_consent_form.length > 0
            ? c.referral_consent_form.join(',')
            : null,
      },
      services_section: convert(c.services),
      transitions: convert(c.services).map(t => {
        return {
          service_section_unique_id: t.unique_id,
          service: t.service_type,
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
    data: state => {
      // NOTE: Comment this out (or disable console) in production to protect
      // against exposure of sensitive data.
      console.log(
        'Data provided to Primero `upsertCase`: ',
        JSON.stringify(state.data, null, 2)
      );
      return state.data;
    },
  })
);
