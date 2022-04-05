// create dataClips and functions for later use
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

  // function setUser(c) {
  //   if (c.is_referred) {
  //     return setProvinceUser(c);
  //   }
  //   return setAgencyUser(c);
  // }

  function determineStatus(service, caseId) {
    if (
      state.serviceRecordIds[caseId] && // IF... there is a serviceRecordId for this case
      c.resource === 'primero' && // and the Oscar case source is 'primero'
      service.enrollment_date === null // and the Oscar service enrollment date is null
    ) {
      return servicesStatusMap[c.status]; // THEN... return the mapped referral status
    } else {
      return undefined; // ELSE ... return undefined (this isn't a decision.)
    }
  }

  const provinceMap = {
    12: 'mgrpnh',
    8: 'mgrkdl',
    17: 'mgrsrp',
    2: 'mgrbtb',
    18: 'mgrshv',
    22: 'mgrstg',
    16: 'mgrrtk',
    11: 'mgrmdk',
    10: 'mgrkrt',
    25: 'mgrtkm',
    3: 'mgrkcm',
    22: 'mgromc',
    13: 'mgrpvh',
    6: 'mgrktm',
    1: 'mgrbmc',
    24: 'mgrpln',
    15: 'mgrpst',
    23: 'mgrkep',
    21: 'mgrtakeo',
    9: 'mgrkkg',
    7: 'mgrkpt',
    5: 'mgrksp',
    20: 'mgrsvg',
    14: 'mgrpvg',
    4: 'mgrkch',
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

  return {
    ...state,
    serviceMap,
    servicesStatusMap,
    referralsStatusMap,
    provinceMap,
    convertToPrimeroDate,
    calculateAge,
    setGender,
    setLocationCode,
    createName,
    // setUser,
    determineStatus,
  };
});

// separate cases from decisions
fn(state => {
  const { originalCases } = state;

  const isDecision = c => {
    const test = x => x.resource == 'primero' && x.status !== 'Referred';
    // console.log(`${c.given_name}: resource "${c.resource}" + status "${c.status}" => ${test(c)}`);
    return test(c);
  };

  const cases = originalCases.filter(c => !isDecision(c));
  const decisions = originalCases.filter(c => isDecision(c));

  console.log('Cases:', cases.length);
  console.log('Decisions:', decisions.length);

  return { ...state, cases, decisions };
});

// set primero mapping
// fn(state => {
//   const {
//     distinguishedCases,
//     servicesStatusMap,
//     referralsStatusMap,
//     provinceMap,
//     serviceMap,
//     convertToPrimeroDate,
//     calculateAge,
//     setGender,
//     setLocationCode,
//   } = state;
//   //TODO: @Taylor - see data flow diagram, here we should only be upserting cases withOUT decisions
//   const primeroCasesToUpsert = distinguishedCases
//     .map(c => {
//       const { isDecision, upsertByCaseId } = c;
//       const currentLocation = setLocationCode(
//         c.location_current_village_code || c.address_current_village_code
//       );
//       const locationCode = c.location_current_village_code
//         ? parseInt(currentLocation, 10).toString()
//         : null;
//       const isUpdate = c.external_id;
//       let primeroRecord = {
//         oscar_number: c.global_id,
//         case_id: c.external_id,
//         case_id_display: c.external_id_display,
//         oscar_short_id: c.slug,
//         mosvy_number: c.mosvy_number,
//         name_first: isUpdate ? null : createName(c.given_name, c.local_given_name),
//         name_last: isUpdate ? null : createName(c.family_name, c.local_family_name),
//         sex: isUpdate ? null : setGender(c.gender),
//         age: isUpdate ? null : calculateAge(c.age),
//         date_of_birth: isUpdate ? null : c.date_of_birth,
//         // date_of_birth: convertToPrimeroDate(c.date_of_birth), TODO: @Aicha confirm formatting incorrect?
//         address_current: isUpdate ? null : c.address_current_village_code,
//         location_current: isUpdate ? null : locationCode,
//         oscar_status: isUpdate ? null : c.status,
//         protection_status: !isUpdate && c.is_referred == true ? 'oscar_referral' : null,
//         owned_by: isUpdate && c.is_referred !== true ? null : setUser(c), //TODO: @Aicha to update user mapping with Mohan's list
//         oscar_reason_for_exiting: c.reason_for_exiting,
//         consent_for_services: isUpdate || c.is_referred !== true ? null : true,
//         disclosure_other_orgs: isUpdate || c.is_referred !== true ? null : true,
//         interview_subject: isUpdate || c.is_referred !== true ? null : 'other',
//         module_id: 'primeromodule-cp',
//         risk_level: c.is_referred === true ? c.level_of_risk : null,
//         referral_notes_oscar: c.reason_for_referral,
//         services_section: c.services.map(s => ({
//           unique_id: s.uuid,
//           service_referral_notes: s.reason_for_referral,
//           service_subtype: (serviceMap[s.name] && serviceMap[s.name].subtype) || 'Other',
//           service_type: (serviceMap[s.name] && serviceMap[s.name].type) || 'Other',
//           service_type_text: (serviceMap[s.name] && serviceMap[s.name].type) || 'Other',
//           service_type_details_text: serviceMap[s.name] ? 'n/a' : s.name,
//           service_response_day_time: s.enrollment_date
//             ? `${s.enrollment_date}T00:00:00.000Z`
//             : undefined,
//           service_response_type: s.enrollment_date
//             ? 'service_being_provided_by_oscar_partner_47618'
//             : s.enrollment_date === null && c.resource === 'primero'
//             ? 'referral_to_oscar'
//             : 'referral_from_oscar',
//           oscar_case_worker_name: c.case_worker_name,
//           oscar_case_worker_telephone: c.case_worker_mobile,
//           oscar_referring_organization: `agency-${c.organization_name}`,
//           service_implementing_agency: `agency-${c.organization_name}`, //TODO: @Aicha should these be the same?
//           referral_status_ed6f91f: determineStatus(s, c.external_id),
//           isReferral: s.enrollment_date ? true : false,
//         })),
//         //non-primero properties
//         upsertByCaseId,
//         isDecision,
//       };
//       if (!primeroRecord.owned_by) {
//         // TODO: Ask @Aicha to clarify if this is check should be done on 'owned_by' or 'location_current'
//         // primeroRecord = null;
//       }
//       return primeroRecord;
//     })
//     .filter(Boolean); // remove nulls

//   console.log({ primeroCasesToUpsert });
//   return { ...state, primeroCasesToUpsert };
// });

// // do operations on each record
// each(
//   '$.primeroCasesToUpsert[*]',
//   fn(async state => {
//     const primeroCase = state.data;
//     // destruct from a copy so that upsertByCaseId can be unset from the current primero record
//     const { upsertByCaseId } = { ...primeroCase };

//     //unset non-primero properties
//     delete primeroCase.upsertByCaseId;
//     delete primeroCase.isDecision;

//     return upsertCase(
//       {
//         externalIds: upsertByCaseId ? ['case_id'] : ['oscar_number'],
//         data: primeroCase,
//       },
//       upsertCaseState => {
//         return getCases({ remote: true, case_id: primeroCase.case_id }, getCaseState => {
//           console.log('Getting casess');
//         })(upsertCaseState);
//       }
//     )(state);
//   })
// );

// // upsert cases
// each(
//   '$.cases[*]',
//   upsertCase({
//     // Upsert Primero cases based on matching 'oscar_number' OR 'case_id'
//     externalIds: state => (state.data.case_id ? ['case_id'] : ['oscar_number']),
//     // externalIds: ['oscar_number', 'case_id'],
//     data: state => {
//       const c = state.data;
//       // NOTE: This is extremely VERBOSE but more secure, given that we don't
//       // know exactly what will be provided by the API.
//       // console.log(
//       //   'Data provided to Primero for upload `upsertCase`: ',
//       //   JSON.stringify(
//       //     {
//       //       remote: c.remote,
//       //       oscar_number: c.oscar_number,
//       //       case_id: c.case_id,
//       //       unique_identifier: c.unique_identifier,
//       //       // FIELDS PREVIOUSLY IN CHILD{}
//       //       case_id: c.case_id,
//       //       oscar_number: c.oscar_number,
//       //       oscar_short_id: c.oscar_short_id,
//       //       mosvy_number: c.mosvy_number,
//       //       name_first: c.name_first,
//       //       name_last: c.name_last,
//       //       sex: c.sex,
//       //       date_of_birth: c.date_of_birth,
//       //       age: c.age,
//       //       location_current: c.location_current,
//       //       //address_current: c.address_current,
//       //       oscar_status: c.oscar_status,
//       //       protection_status: c.protection_status,
//       //       service_implementing_agency: c.service_implementing_agency,
//       //       owned_by: c.owned_by,
//       //       owned_by_text: c.owned_by_text,
//       //       oscar_reason_for_exiting: c.oscar_reason_for_exiting,
//       //       has_referral: c.has_referral,
//       //       risk_level: c.risk_level,
//       //       consent_for_services: c.consent_for_services,
//       //       disclosure_other_orgs: c.consent_for_services,
//       //       interview_subject: c.interview_subject,
//       //       content_source_other: c.content_source_other,
//       //       module_id: c.module_id,
//       //       registration_date: c.registration_date,
//       //       referral_notes_oscar: c.referral_notes_oscar,
//       //       services_section: c.services_section,
//       //       //END FIELDS PREVIOUSLY IN CHILD{}
//       //     },
//       //     null,
//       //     2
//       //   )
//       // );
//       console.log('Data provided to Primero for upload `upsertCase`: ', JSON.stringify(c, null, 4));
//       return state.data;
//     },
//   })
// );
