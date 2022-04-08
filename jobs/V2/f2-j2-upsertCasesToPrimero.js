// we create dataClips and functions for later use
fn(state => {
  // Saving original cases, creating Case:Service ID map =======================
  state.originalCases = state.data.data;
  state.serviceRecordIds = {};
  // ===========================================================================

  // AK TODO: Discuss with @Aicha, I think format should be YYYY-MM-DD
  const convertToPrimeroDate = dateString => {
    if (!dateString) return null;
    const dateArray = dateString.split('-');
    return `${dateArray[0]}/${dateArray[1]}/${dateArray[2]}`;
  };

  const calculateAge = dateOfBirth => {
    if (!dateOfBirth) return null;
    const currentYear = new Date().toISOString().split('T')[0].split('-')[0];
    const yearOfBirth = dateOfBirth.split('-')[0];
    return +currentYear - +yearOfBirth;
  };

  const setGender = gender => {
    gender = gender && gender.toLowerCase();
    const genderMap = {
      male: 'male',
      female: 'female',
    };
    return genderMap[gender] || 'other';
  };

  const setLocationCode = location => {
    if (!location) return;
    return parseInt(location).toString();
  };

  function createName(given, local) {
    if (local && given) {
      return `${local} (${given})`; //Format: khmer name (english name)
    }
    if (given && !local) {
      return given;
    }
    if (!given && local) {
      return local;
    } else {
      return null;
    }
  }

  function setUser(c) {
    if (c.is_referred) return setProvinceUser(c);

    return setAgencyUser(c);
  }

  function setProvinceUser(c) {
    const { location_current_village_code, organization_address_code } = c;
    const source = location_current_village_code || organization_address_code;

    if (source) {
      const subCode = source.slice(0, 2);
      user = provinceUserMap[subCode];
      if (user) {
        return user;
      } else {
        throw 'Province user not found for this case. Check the case location and list of available province users.';
      }
    } else {
      return null;
    }
  }

  function setAgencyUser(c) {
    if (c.organization_name) {
      return agencyUserMap[`agency-${c.organization_name}`];
    } else {
      throw (
        `No agency user found for the organization ${c.organization_name}. ` +
        'Please create an agency user for this organization and update the job accordingly.'
      );
    }
  }

  function setServiceResponseType(c, s) {
    if (s.enrollment_date) return 'service_being_provided_by_oscar_partner_47618';

    if (s.enrollment_date === null && c.resource === 'primero') {
      return 'referral_to_oscar';
    }

    return 'referral_from_oscar';
  }

  const provinceUserMap = {
    12: 'mgrpnh',
    '08': 'mgrkdl',
    17: 'mgrsrp',
    '02': 'mgrbtb',
    18: 'mgrshv',
    22: 'mgrstg',
    16: 'mgrrtk',
    11: 'mgrmdk',
    10: 'mgrkrt',
    25: 'mgrtkm',
    '03': 'mgrkcm',
    22: 'mgromc',
    13: 'mgrpvh',
    '06': 'mgrktm',
    '01': 'mgrbmc',
    24: 'mgrpln',
    15: 'mgrpst',
    23: 'mgrkep',
    21: 'mgrtakeo',
    '09': 'mgrkkg',
    '07': 'mgrkpt',
    '05': 'mgrksp',
    20: 'mgrsvg',
    14: 'mgrpvg',
    '04': 'mgrkch',
  };

  const agencyUserMap = {
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

  const serviceMap = {
    'Generalist social work / case work': {
      subtype: 'social_work_case_work_generalist',
      type: 'social_work_case_work',
    },
    'Community social work': {
      subtype: 'social_work_case_work_community',
      type: 'social_work_case_work',
    },
    'Emergency foster care': {
      subtype: 'family_based_care_emergency_foster',
      type: 'family_based_care',
    },
    'Long term foster care': {
      subtype: 'family_based_care_longterm_foster',
      type: 'family_based_care',
    },
    'Kinship care': { subtype: 'family_based_care_kinship', type: 'family_based_care' },
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
    'Drug and Alcohol Counselling': { subtype: 'drug_alcohol_counselling', type: 'drug_alcohol' },
    'Detox / rehabilitation services': {
      subtype: 'drug_alcohol_detox_rehabilitation',
      type: 'drug_alcohol',
    },
    'Detox support': { subtype: 'drug_alcohol_detox_support', type: 'drug_alcohol' },
    'Generalist counselling': { subtype: 'counselling_generalist', type: 'counselling' },
    'Counselling for abuse survivors': {
      subtype: 'counselling_abuse_survivors',
      type: 'counselling',
    },
    'Trauma counselling': { subtype: 'counselling_trauma', type: 'counselling' },
    'Family counselling / mediation': { subtype: 'counselling_family', type: 'counselling' },
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
    'Peripheral supports': { subtype: 'disability_support_peripheral', type: 'disability_support' },
    'Support groups': { subtype: 'disability_support_groups', type: 'disability_support' },
    'Support to access care': { subtype: 'medical_support_access_care', type: 'medical_support' },
    'Provision of medical care': {
      subtype: 'medical_support_provision_medical_case',
      type: 'medical_support',
    },
    'Medical training services': {
      subtype: 'medical_support_medical_training',
      type: 'medical_support',
    },
    'Health education': { subtype: 'medical_support_healt_education', type: 'medical_support' },
    'Support to access legal services': {
      subtype: 'legal_support_access_legal_services',
      type: 'legal_support',
    },
    'Legal advocacy services': {
      subtype: 'legal_support_advocacy_services',
      type: 'legal_support',
    },
    'Legal representation': { subtype: 'legal_support_representation', type: 'legal_support' },
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
    'School support': { subtype: 'training_education_school_support', type: 'training_education' },
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
    'Life skills': { subtype: 'training_education_life_skills', type: 'training_education' },
    'Family support': { subtype: 'family_support_family_support', type: 'family_support' },
    'Rescue Services': { subtype: 'anti_trafficking_rescue', type: 'anti_trafficking' },
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
    'Residential Care Institution': { subtype: 'residential_care_gov_only_other', type: 'other' },
    'Other Service': { subtype: 'other_other_service', type: 'other' },
  };

  const servicesStatusMap = {
    Accepted: 'accepted_850187',
    Active: 'accepted_850187',
    Rejected: 'rejected_74769',
    Exited: 'rejected_74769',
  };

  const referralsStatusMap = {
    Accepted: 'accepted',
    Active: 'accepted',
    Exited: 'rejected',
  };

  function buildCaseRecord(c) {
    const currentLocation = setLocationCode(
      c.location_current_village_code || c.address_current_village_code
    );

    const locationCode = c.location_current_village_code
      ? parseInt(currentLocation, 10).toString()
      : null;

    const isUpdate = c.external_id;

    return {
      __original_oscar_record: c,
      oscar_number: c.global_id,
      case_id: c.external_id,
      case_id_display: c.external_id_display,
      oscar_short_id: c.slug,
      mosvy_number: c.mosvy_number,
      name_first: isUpdate ? null : createName(c.given_name, c.local_given_name),
      name_last: isUpdate ? null : createName(c.family_name, c.local_family_name),
      sex: isUpdate ? null : setGender(c.gender),
      age: isUpdate ? null : calculateAge(c.age),
      date_of_birth: isUpdate ? null : c.date_of_birth,
      // date_of_birth: convertToPrimeroDate(c.date_of_birth), // TODO: @Aicha confirm formatting incorrect?
      address_current: isUpdate ? null : c.address_current_village_code,
      location_current: isUpdate ? null : locationCode,
      oscar_status: isUpdate ? null : c.status,
      protection_status: !isUpdate && c.is_referred == true ? 'oscar_referral' : null,
      owned_by: isUpdate ? null : setUser(c), // TODO: @Aicha to update user mapping with Mohan's list
      oscar_reason_for_exiting: c.reason_for_exiting,
      consent_for_services: true,
      disclosure_other_orgs: true,
      interview_subject: isUpdate || c.is_referred !== true ? null : 'other',
      module_id: 'primeromodule-cp',
      risk_level: c.is_referred === true ? c.level_of_risk : null,
      referral_notes_oscar: c.reason_for_referral,
      services_section: c.services.map(s => ({
        unique_id: s.uuid,
        service_referral_notes: s.reason_for_referral,
        service_type: (serviceMap[s.name] && serviceMap[s.name].type) || 'Other',
        service_subtype: [(serviceMap[s.name] && serviceMap[s.name].subtype) || 'Other'],
        service_type_text: (serviceMap[s.name] && serviceMap[s.name].type) || 'Other',
        service_type_details_text: serviceMap[s.name] ? 'n/a' : s.name,
        service_response_day_time: s.enrollment_date
          ? `${s.enrollment_date}T00:00:00.000Z`
          : undefined,
        service_response_type: setServiceResponseType(c, s),
        oscar_case_worker_name: c.case_worker_name,
        oscar_referring_organization: `agency-${c.organization_name}`,
        oscar_case_worker_telephone: c.case_worker_mobile,
        service_implementing_agency: `agency-${c.organization_name}`, //TODO: @Aicha should these be the same?
      })),
    };
  }

  return {
    ...state,
    servicesStatusMap,
    referralsStatusMap,
    convertToPrimeroDate,
    calculateAge,
    setGender,
    setLocationCode,
    createName,
    setUser,
    serviceMap,
    setServiceResponseType,
    buildCaseRecord,
  };
});

// we separate cases from decisions
fn(state => {
  const { originalCases } = state;

  const isDecision = x => x.resource == 'primero' && x.status !== 'Referred';

  const cases = originalCases.filter(c => !isDecision(c));
  const decisions = originalCases.filter(c => isDecision(c));

  console.log('Cases:', cases.length);
  console.log('Decisions:', decisions.length);

  return { ...state, cases, decisions };
});

// we build cases for primero
fn(state => {
  const { cases, buildCaseRecord } = state;

  const finalized = cases
    .map(buildCaseRecord)
    .map(c => {
      delete c.__original_oscar_record;
      return c;
    })
    // TODO: @Aicha to confirm: if "owned_by" is FALSY, then don't send this record to Primero.
    .filter(c => c.owned_by);

  return { ...state, cases: finalized };
});

// we log cases before sending to primero
fn(state => {
  console.log('Prepared cases:', JSON.stringify(state.cases, null, 2));
  return state;
});

// we upsert Primero cases based on matching 'oscar_number' OR 'case_id'
each(
  '$.cases[*]',
  upsertCase({
    externalIds: state => (!!state.data.external_id ? ['case_id'] : ['oscar_number']),
    data: state => state.data,
  })
);

// we build decisions for primero, add array for referrals to update
fn(state => {
  const { decisions, buildCaseRecord, servicesStatusMap } = state;

  const finalized = decisions
    .map(buildCaseRecord)
    // add status to each service in the service section
    .map(d => ({
      ...d,
      services_section: d.services_section.map(s => ({
        ...s,
        referral_status_edf41f2: servicesStatusMap[d.__original_oscar_record.status],
      })),
    }));

  return { ...state, decisions: finalized, referrals: [] };
});

// we log decisions before sending to primero
fn(state => {
  console.log('Prepared decisions:', JSON.stringify(state.decisions, null, 2));
  return state;
});

// for EACH decision, we get its referrals and then we update a single referral
each(
  '$.decisions[*]',
  // TODO: WE NEED TO ADD THE FOLLLOWING... See L234 in the "OLD" job
  // 1. Get Primero Cases
  // 2. Filter Primero Services to find only those that have NOT been accepted/rejected
  // 3. Find 1 Service that matches OSCaR service, matching on service subtype
  // 4. AND THEN... getReferrals where id.service_record_id = matchingPrimeroService.unique_id

  getReferrals(
    {
      externalId: 'case_id',
      id: state => state.data.case_id,
    },
    nextState => {
      const decision = nextState.references[nextState.references.length - 1];
      console.log('decision', decision);

      const referrals = nextState.data;
      console.log('referrals', referrals);

      // TODO: MATCH where r.service_record_id == matchingPrimeroService[0].unique_id
      const matchingReferral = referrals.find(
        r => r.service_record_id == decision.services_section[0].unique_id
      );

      console.log('match:', matchingReferral);

      if (matchingReferral)
        nextState.referrals.push({
          ...matchingReferral,
          status: nextState.referralStatusMap[decision.__original_oscar_record.status],
          case_id: decision.case_id,
        });

      return nextState;
    }
  )
);

// log matching referrals
fn(state => {
  console.log('Referrals to update:', state.referrals);
  return state;
});

// for each referral, we update its service status
each(
  '$.referrals[*]',
  updateReferral({
    externalId: 'case_id',
    id: dataValue('case_id'),
    referral_id: dataValue('id'),
    data: {
      status: dataValue('status'),
      id: dataValue('id'),
      type: 'Referral',
      record_id: dataValue('record_id'),
      record_type: dataValue('case'),
    },
  })
);

// for EACH decision, we upsert the primero case record
each(
  '$.decisions[*]',
  upsertCase({
    externalIds: ['case_id'],
    data: state => {
      delete state.data.__original_oscar_record;
      return state.data;
    },
  })
);
