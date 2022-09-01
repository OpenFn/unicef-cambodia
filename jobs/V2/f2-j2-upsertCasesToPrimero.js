// we create dataClips and functions for later use
fn(state => {
  console.log('Preparing cases and decisions for upload to Primero...');
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

  function calcAge(str) {
    if (!str) return 0;
    var today = new Date();
    var birthDate = new Date(str);
    var age = today.getFullYear() - birthDate.getFullYear();

    if (age > 30 || age < 1) return 0;

    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
      console.log('Province code:: ', subCode);
      user = provinceUserMap[subCode];
      console.log('Province username located:: ', user);
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

  const serviceStatusMap = {
    Accepted: 'accepted_340953',
    Accetped: 'accepted_340953',
    Active: 'accepted_340953',
    Rejected: 'rejected_936484',
    Exited: 'rejected_936484',
    Referred: 'pending_310366',
  };

  const referralStatusMap = {
    Accepted: 'accepted',
    Accetped: 'accepted',
    Active: 'accepted',
    Exited: 'rejected',
  };

  const PrimeroServiceToReferralStatusMap = {
    accepted_340953: 'accepted',
    rejected_936484: 'rejected',
    pending_310366: 'in_progress',
  };

  function buildCaseRecord(c) {
    const currentLocation = setLocationCode(
      c.location_current_village_code || c.address_current_village_code
    );

    const locationCode =
      c.location_current_village_code || c.address_current_village_code
        ? parseInt(currentLocation, 10).toString()
        : null;

    const isUpdate = c.external_id;

    const referralReason = c.reason_for_referral;

    return {
      __original_oscar_record: c,
      oscar_number: c.global_id,
      case_id: c.external_id === '' ? undefined : c.external_id,
      case_id_display: c.external_id_display === '' ? undefined : c.external_id_display,
      oscar_short_id: c.slug,
      mosvy_number: c.mosvy_number,
      name_first: isUpdate ? undefined : createName(c.given_name, c.local_given_name),
      name_last: isUpdate ? undefined : createName(c.family_name, c.local_family_name),
      sex: isUpdate ? undefined : setGender(c.gender),
      age: isUpdate ? undefined : calcAge(c.date_of_birth),
      date_of_birth: isUpdate ? undefined : c.date_of_birth,
      // date_of_birth: convertToPrimeroDate(c.date_of_birth), // TODO: @Aicha confirm formatting incorrect?
      address_current: isUpdate ? undefined : c.address_current_village_code,
      location_current: isUpdate ? undefined : locationCode,
      oscar_status: isUpdate ? undefined : c.status,
      protection_status: !isUpdate && c.is_referred == true ? 'oscar_referral' : undefined,
      owned_by: setUser(c),
      //owned_by: isUpdate ? undefined : setUser(c),
      oscar_reason_for_exiting: c.reason_for_exiting,
      consent_for_services: true,
      disclosure_other_orgs: true,
      interview_subject: isUpdate || c.is_referred !== true ? undefined : 'other',
      module_id: 'primeromodule-cp',
      risk_level: c.is_referred === true ? c.level_of_risk : null,
      //referral_notes_oscar: c.reason_for_referral, //moved down to service-level; see referral_notes_from_oscar_2e787b8
      services_section: c.services.map(s => ({
        unique_id: s.uuid,
        referral_notes_from_oscar_2e787b8: referralReason,
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
        oscar_case_worker_telephone: c.case_worker_mobile,
        oscar_referring_organization: `agency-${c.organization_name}`,
        service_implementing_agency: `agency-${c.organization_name}`, //TODO: @Aicha should these be the same?
        oscar_referral_id_a4ac8a5: s.referral_id ? s.referral_id.toString() : undefined,
        referral_status_edf41f2: serviceStatusMap[s.referral_status],
      })),
    };
  }

  return {
    ...state,
    serviceStatusMap,
    referralStatusMap,
    convertToPrimeroDate,
    calculateAge,
    setGender,
    setLocationCode,
    createName,
    setUser,
    serviceMap,
    setServiceResponseType,
    buildCaseRecord,
    PrimeroServiceToReferralStatusMap,
  };
});

// we separate cases from decisions
fn(state => {
  const { originalCases, serviceMap } = state;

  //AUG 19 CHANGED to check for Oscar decisions on service-, not case-level ==============///
  //const isDecision = c => c.resource == 'primero' && c.status !== 'Referred';
  const isDecision = c =>
    c.resource == 'primero' &&
    //Added below to check service-level for decisions
    c.services.filter(s => s.referral_status !== 'Referred');
  //======================================================================================//

  const cases = originalCases.filter(c => !isDecision(c));
  const decisions = originalCases.filter(c => isDecision(c));

  console.log('Standard Cases:', cases.length);
  console.log('Cases with Decisions:', decisions.length);

  return { ...state, cases, decisions };
});

// we build cases for primero
fn(state => {
  const { cases, buildCaseRecord } = state;

  const finalized = cases.map(buildCaseRecord).map(c => {
    delete c.__original_oscar_record;
    return c;
  });
  console.log('finalized:', JSON.stringify(finalized, null, 2));

  const finalizedNoRefsFromPrimero = finalized.map(c => {
    return {
      ...c,
      services_section: c.services_section
        ? c.services_section.filter(s => s.service_response_type !== 'referral_to_oscar')
        : undefined,
    };
  });

  console.log(
    'Prepared cases to sync back to Primero:',
    JSON.stringify(finalizedNoRefsFromPrimero, null, 2)
  );
  // TODO: @Aleksa to confirm that we can add location-check validation in the job; for 2nd referrals, it's okay if `owned_by` is undefined
  //.filter(c => c.owned_by);

  return { ...state, cases: finalizedNoRefsFromPrimero };
});

// we log cases before sending to primero
fn(state => {
  //console.log('Prepared cases:', JSON.stringify(state.cases, null, 2));
  const caseIds = state.cases.map(c => ({ case_id: c.case_id }));
  console.log('External Ids for prepared cases:', JSON.stringify(caseIds, null, 2));
  return state;
});

// we upsert Primero cases based on matching 'oscar_number' OR 'case_id'
each(
  '$.cases[*]', //using each() here returns state.data for each item in the prepared "cases" array
  upsertCase({
    externalIds: state => (!!state.data.case_id ? ['case_id'] : ['oscar_number']), //changed from state.data.external_id
    data: state => {
      console.log('Syncing prepared case & checking if exists...', state.data);
      return state.data;
    },
  })
);

// we build decisions for primero, add array for referrals to update
fn(state => {
  const { decisions, buildCaseRecord, serviceMap } = state;

  const finalized = decisions.map(buildCaseRecord);
  //  AUG 19: Removed the below because now we map referral_status above =====//
  // .map(d => ({
  //   ...d,
  //   //Here we add status to each service in the service section
  //   //   services_section: d.services_section.map(s => ({
  //   //     ...s,
  //   //     referral_status_edf41f2: serviceStatusMap[d.__original_oscar_record.status],
  //   //   })),
  // }));

  return { ...state, decisions: finalized, referrals: [] };
});

// we log decisions before sending to primero
// fn(state => {
//   console.log('Prepared decisions:', JSON.stringify(state.decisions.data, null, 2));
//   return state;
// });

// for EACH decision, we get its referrals and then we update a single referral
each(
  '$.decisions[*]',
  getCases({ case_id: dataValue('case_id') }, { withReferrals: true }, nextState => {
    const { decisions, references, data, PrimeroServiceToReferralStatusMap } = nextState;
    const decision = references[references.length - 1];

    if (data.length > 1) throw new Error('Duplicate case_id on Primero');
    const parentCase = data[0];

    const newDecisions = decision.__original_oscar_record.services.filter(
      s => s.enrollment_date === null
    );

    console.log('The "newDecisions" are', newDecisions); // undefined

    if (!newDecisions) {
      console.log(
        'Skipping dropping this decision from the array; no services with enrollment_date === null'
      );
      return {
        ...nextState,
        decisions: decisions.filter(d => d.case_id !== decision.case_id),
      };
    }

    const oscarReferredServices = newDecisions;
    const oscarReferredReferralIds = newDecisions.map(d => d.referral_id);

    console.log('oscarReferredServices ::', oscarReferredServices);
    //=====================================================================//
    //== AUG 22 CHANGE: Match services based on Oscar referral_id, not service uuid ==//
    console.log('oscar referral_ids ::', oscarReferredReferralIds);

    // const oscarReferredService = decision.services_section.filter(
    //   //s => s.unique_id === oscarReferredServiceId
    //   s => s.oscar_referral_id_a4ac8a5 == oscarReferredReferralId
    // );

    // console.log('oscarReferredService ::', oscarReferredService);

    console.log('parentCase in Primero ::', parentCase);

    // There's a service on the parentCase with subtype[0] that
    // matches the oscarRefferedService subtype[0] (only one for each)
    //const matchingServices = parentCase.services_section
    // .find(s => {
    //   // //CHANGE TO CONSIDER - 19 Aug 2022. NOW we want to match referrals based on service subtype AND oscar_referral_id
    //   // console.log('parentCase service oscar_referral_id_a4ac8a5 ::', s.oscar_referral_id_a4ac8a5);
    //   // return (
    //   //   s.service_subtype[0] === oscarReferredService.service_subtype[0] &&
    //   //   s.oscar_referral_id_a4ac8a5 === oscarReferredService.oscar_referral_id_a4ac8a5
    //   // );

    //   // RN... we would match services based on subtype
    //   console.log('parentCase services subtype ::', s.service_subtype);
    //   return s.service_subtype[0] === oscarReferredService.service_subtype[0];
    //   //==============++============================================//
    // });

    //  console.log('matchingServices ::', matchingServices);

    // NOTE: Once we've found the matching service, overwrite its Oscar-generated
    // uuid with the Primero Unique ID so that we can update this service in
    // Primero.
    // TODO: Confirm that this is really the logic we want to apply.

    const parentServices = parentCase.services_section;

    //console.log('parentServices in Primero::', parentServices);

    if (parentServices) {
      const updatedDecisions = decisions.map(d => {
        // find the right case...
        //console.log('oscar decision payload ::', d);
        if (d.case_id === decision.case_id) {
          return {
            ...d,
            services_section: d.services_section.map(s => {
              console.log('Oscar decision to map to Primero service ::', s);

              // and find the right service, matching by subtype..
              decisionServiceType = s.service_subtype[0];
              referralId = s.oscar_referral_id_a4ac8a5;
              matchingService = parentServices.find(
                s =>
                  s.oscar_referral_id_a4ac8a5 === referralId ||
                  s.service_subtype[0] === decisionServiceType
                // (s.service_subtype[0] === decisionServiceType &&
                //   s.referral_status_edf41f2 === 'pending_310366') //TODO: FIX; throws errors when no pending service found
                //== ERROR: TypeError: Cannot read property 'pending_310366' of undefined =========//
                //looking for Primero services where decision is 'pending' & has not yet been updated...
              );
              matchingServiceId = matchingService ? matchingService.unique_id : undefined;
              decisionStatus = PrimeroServiceToReferralStatusMap[s.referral_status_edf41f2];

              console.log('Oscar decisionServiceType to match on::', decisionServiceType);
              console.log('matchingService in Primero found ::', matchingService);
              console.log('matchingServiceId in Primero found::', matchingServiceId);
              console.log('decisionStatus for Referral found::', decisionStatus);

              return {
                ...s,
                // Update the unique_id when we've got our needle in the haystack
                unique_id: matchingServiceId,
              };
            }),
          };
        }
        return d;
      });

      //Now let's find the service's parent referral to update
      const matchingReferral = parentCase.referrals.find(
        r =>
          // where status is in_progress...
          r.status === 'in_progress' && //TODO: TEST MATCHING REF
          r.service_record_id === matchingServiceId
      );

      if (matchingReferral) console.log('Matching referral found:', matchingReferral);

      if (matchingReferral)
        nextState.referrals.push({
          ...matchingReferral,
          status: decisionStatus,
          //status: nextState.referralStatusMap[decision.__original_oscar_record.status],
          case_id: decision.case_id,
        });

      return { ...nextState, decisions: updatedDecisions };
    }

    return { ...nextState };
  })
);

// log matching referrals
fn(state => {
  console.log('Referrals to update:', JSON.stringify(state.referrals, null, 2));
  return state;
});

// for each referral, we update its service status
each(
  '$.referrals[*]',
  updateReferral({
    caseExternalId: 'record_id',
    caseId: dataValue('record_id'),
    id: dataValue('id'),
    data: {
      status: dataValue('status'),
      id: dataValue('id'),
      type: 'Referral',
      record_id: dataValue('record_id'),
      record_type: dataValue('case'),
    },
  })
);

// Now let's clean decision payload & only sync cases with decisions for services...
fn(state => {
  const cleanedDecisions = state.decisions
    .map(d => {
      delete d.__original_oscar_record;
      //only sync decisions with a matching Primero service_id and a decision update
      const filteredServices = d.services_section.filter(
        s => s.unique_id && s.referral_status_edf41f2
      );
      return { ...d, services_section: filteredServices };
    })
    .filter(d => d.services_section.length > 0);

  console.log('cleanedDecisions to sync to Primero:', JSON.stringify(cleanedDecisions, null, 2));
  return { ...state, decisions: cleanedDecisions };
});

// for EACH decision, we upsert the primero case record
each(
  '$.decisions[*]',
  upsertCase({
    externalIds: ['case_id'],

    data: state => {
      const decision = state.data;
      console.log('Syncing decision... ::', decision);
      return decision;
    },
  })
);
