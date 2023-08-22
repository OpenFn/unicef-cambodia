// Custom transformation logic: we create dataClips and functions for later use
fn(state => {
  console.log('Preparing cases and decisions for upload to Primero...');
  // Saving original cases, creating Case:Service ID map =======================
  state.originalCases = state.data.data;
  state.serviceRecordIds = {};
  // ===========================================================================

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
      return `${local} (${given})`; //Output format: khmer name (english name)
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
    const { location_current_village_code, organization_address_code, external_id, global_id } = c;
    const source = location_current_village_code || organization_address_code;
    console.log('Finding province user for this case from Oscar... id: ', global_id);
    console.log('Primero case id (if case already synced) :: ', external_id);
    console.log('Location code sent by Oscar :: ', source);
    if (source) {
      //If Village (admin level 4 location) not specified in OSCaR, then we expect a shorter location code and sometimes it has leading 0s (e.g., '0004')
      //This logic therefore tells us how to extract the province code from the full location code
      //Depending on the length of the location code and if leading 0s, we may need to look in a different spot for the province code
      const subCode = source.slice(0, 2) === '00' ? source.slice(2, 4) : source.slice(0, 2);
      //console.log('Matching province code:: ', subCode);
      console.log('Matching Primero province code:: ', subCode);
      const user = provinceUserMap[subCode];
      console.log('Primero province username located:: ', user);
      //console.log('Province username located:: ', user);
      if (user) {
        return user;
      } else {
        throw `Province user not found for this case ${global_id} with Oscar location code ${source}. Verify the case location and mapping to Primero province users.`;
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
    'agency-gpc': 'agency-gpc-user',
    'agency-tpo': 'agency-tpo-user',
    'agency-eao': 'agency-eao-user',
    'agency-goh': 'agency-goh-user',
    'agency-sk': 'agency-sk-user',
    'agency-colt': 'agency-colt-user',
    'agency-kt': 'agency-kt-user',
    'agency-ea': 'agency-ea-user',
    'agency-fsi': 'agency-fsi-user',
    'agency-oec': 'agency-oec-user',
    'agency-cct': 'agency-cct-user',
    'agency-cfi': 'agency-cfi-user',
    'agency-cif': 'agency-cif-user',
    'agency-css': 'agency-css-user',
    'agency-cwd': 'agency-cwd-user',
    'agency-holt': 'agency-holt-user',
    'agency-isf': 'agency-isf-user',
    'agency-kmr': 'agency-kmr-user',
    'agency-mho': 'agency-mho-user',
    'agency-msl': 'agency-msl-user',
    'agency-mtp': 'agency-mtp-user',
    'agency-tlc': 'agency-tlc-user',
    'agency-tmw': 'agency-tmw-user',
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

    const currentAddress = setLocationCode(
      c.address_current_village_code || c.location_current_village_code
    );

    const locationCode =
      c.location_current_village_code || c.address_current_village_code
        ? parseInt(currentLocation, 10).toString()
        : null;

    const addressCode =
      c.location_current_village_code || c.address_current_village_code
        ? parseInt(currentAddress, 10).toString()
        : null;

    const isUpdate = c.external_id;
    const oscarNumber = c.global_id;

    const riskLevel = c.risk_level === 'no action' ? 'no_action' : c.risk_level || 'no_action';

    const referralReason = c.reason_for_referral;

    //cleaning rule for date_of_birth when Oscar sometimes sends bad date value e.g., 22012-01-01
    const dob = c.date_of_birth;
    const cleanedDob = dob && dob.length === 11 ? dob.substring(1, 11) : dob;

    return {
      __original_oscar_record: c,
      oscar_number: c.global_id,
      case_id: c.external_id === '' ? undefined : c.external_id,
      case_id_display: c.external_id_display === '' ? undefined : c.external_id_display,
      oscar_short_id: c.slug,
      mosvy_number: c.mosvy_number,
      name_first: createName(c.given_name, c.local_given_name), //don't check if exists first
      name_last: createName(c.family_name, c.local_family_name), //don't check if exists first
      sex: setGender(c.gender), //don't check if exists first
      age: calcAge(cleanedDob), //don't check if exists first
      date_of_birth: cleanedDob, //don't check if exists first
      location_current: locationCode, //don't check if exists first
      // name_first: isUpdate ? undefined : createName(c.given_name, c.local_given_name),
      // name_last: isUpdate ? undefined : createName(c.family_name, c.local_family_name),
      // sex: isUpdate ? undefined : setGender(c.gender),
      // age: isUpdate ? undefined : calcAge(cleanedDob),
      // date_of_birth: isUpdate ? undefined : cleanedDob,
      // location_current: isUpdate ? undefined : locationCode,
      oscar_status: c.status,
      protection_status: !isUpdate && c.is_referred == true ? 'oscar_referral' : undefined,
      owned_by:
        !isUpdate || //if NOT an update to a case already synced...
        c.resource !== 'primero' //or if case didn't originate in Primero...
          ? setUser(c) //set 'owned_by' user
          : undefined, //otherwise do not overwrite user that is already set in Primero
      oscar_reason_for_exiting: c.reason_for_exiting,
      consent_for_services: true,
      disclosure_other_orgs: true,
      risk_level: c.is_referred === true ? riskLevel : undefined,
      interview_subject: isUpdate || c.is_referred !== true ? undefined : 'other',
      module_id: 'primeromodule-cp',
      services_section: c.services.map(s => ({
        unique_id: s.uuid !== null && s.uuid !== '' ? s.uuid : undefined,
        referral_notes_from_oscar_2e787b8: referralReason,
        service_referral_notes: s.reason_for_referral,
        service_type: (serviceMap[s.name] && serviceMap[s.name].type) || 'Other',
        service_subtype: [serviceMap[s.name] && serviceMap[s.name].subtype],
        service_type_text: serviceMap[s.name] && serviceMap[s.name].type,
        service_type_details_text: serviceMap[s.name] ? 'n/a' : s.name,
        service_response_day_time: s.enrollment_date
          ? `${s.enrollment_date}T00:00:00.000Z`
          : undefined,
        service_response_type: setServiceResponseType(c, s),
        oscar_case_worker_name: c.case_worker_name,
        oscar_case_worker_telephone: c.case_worker_mobile,
        oscar_referring_organization: `agency-${c.organization_name}`,
        service_implementing_agency: `agency-${c.organization_name}`,
        oscar_referral_id_a4ac8a5: s.referral_id ? s.referral_id.toString() : undefined,
        referral_status_edf41f2: serviceStatusMap[s.referral_status] || undefined,
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
  const { originalCases } = state;

  const isDecision = c =>
    c.resource == 'primero' && c.services.filter(s => s.referral_status !== 'Referred');

  const cases = originalCases.filter(c => !isDecision(c));
  const decisions = originalCases.filter(c => isDecision(c));

  console.log('# standard Cases:', cases.length);
  console.log('# cases with Decisions:', decisions.length);

  return { ...state, cases, decisions };
});

// we build cases for primero
fn(state => {
  const { cases, buildCaseRecord } = state;

  const finalized = cases.map(buildCaseRecord).map(c => {
    delete c.__original_oscar_record;
    return c;
  });

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
    JSON.stringify(
      finalizedNoRefsFromPrimero ? finalizedNoRefsFromPrimero.map(x => x.case_id) : '',
      null,
      2
    )
  );

  return { ...state, cases: finalizedNoRefsFromPrimero };
});

// we build decisions for primero, add array for referrals to update
fn(state => {
  const { decisions, buildCaseRecord } = state;

  const finalized = decisions.map(buildCaseRecord);

  return { ...state, decisions: finalized, referrals: [] };
});

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
    //== Here we match services based on Oscar referral_id, not service uuid ==//
    const oscarReferredReferralIds = newDecisions.map(d => d.referral_id);

    console.log('oscar referral_ids ::', oscarReferredReferralIds);

    const parentServices = parentCase ? parentCase.services_section : undefined;

    if (parentServices) {
      const updatedDecisions = decisions.map(d => {
        // find the right case...
        if (d.case_id === decision.case_id) {
          return {
            ...d,
            services_section: d.services_section.map(s => {
              console.log('Oscar decision to map to Primero service ::', s.unique_id);

              // and find the right service, matching by subtype..
              decisionServiceType = s.service_subtype[0];
              referralId = s.oscar_referral_id_a4ac8a5;
              matchingService = parentServices.find(
                s =>
                  s.oscar_referral_id_a4ac8a5 === referralId ||
                  (s.service_subtype[0] === decisionServiceType &&
                    s.referral_status_edf41f2 === 'pending_310366' &&
                    s.service_response_type === 'referral_to_oscar') ||
                  //Criteria for rejected 'Not Specified' referrals where subtype originally not specified
                  (s.service_subtype[0] === '' &&
                    s.referral_status_edf41f2 === 'pending_310366' &&
                    s.service_response_type === 'referral_to_oscar')
              );
              console.log('matchingService', matchingService ? matchingService.unique_id : '');
              matchingServiceId = matchingService ? matchingService.unique_id : undefined;
              decisionStatus = PrimeroServiceToReferralStatusMap[s.referral_status_edf41f2];

              // console.log('Oscar decisionServiceSubType to match on::', decisionServiceType);
              // console.log('matchingServiceId in Primero found::', matchingServiceId);
              // console.log('decisionStatus for Referral found::', decisionStatus);

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
      const referralServiceUuids = updatedDecisions
        .map(d => {
          return d.services_section.map(s => {
            return s.unique_id;
          });
        })
        .flat();

      const matchingReferrals = parentCase.referrals.filter(
        r =>
          // Update referral with matching service where status is in_progress...
          r.status === 'in_progress' && referralServiceUuids.includes(r.service_record_id)
      );

      if (matchingReferrals) console.log('Matching referrals found...');

      const mappedReferrals = matchingReferrals.map(r => {
        const serviceId = r.service_record_id;
        const matchingCase = updatedDecisions.filter(d => d.case_id === decision.case_id);

        const matchingService = matchingCase
          ? matchingCase[0].services_section.find(s => s.unique_id === serviceId)
          : undefined;

        return {
          ...r,
          status: PrimeroServiceToReferralStatusMap[matchingService.referral_status_edf41f2],
          case_id: decision.case_id,
        };
      });

      console.log('Building referrals array...');
      console.log('# of mappedReferrals ::', mappedReferrals.length);

      if (mappedReferrals) nextState.referrals.push(mappedReferrals.flat());

      return { ...nextState, decisions: updatedDecisions };
    }

    return { ...nextState };
  })
);

// log matching referrals
fn(state => {
  state.referrals = state.referrals.flat();

  console.log('Preparing referrals to sync...');
  console.log(
    'mappedReferrals to update for these cases ::',
    JSON.stringify(state.referrals ? state.referrals.map(x => x.case_id) : '', null, 2)
  );
  return state;
});

// Now that we've found the matching referral, we update its status
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

// After we've updated the Referrals, let's go update the "Referral Status" on the related Service record
fn(state => {
  console.log('Preparing decisions to sync...');
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
  return { ...state, decisions: cleanedDecisions };
});

// for EACH decision from OSCaR, we update the matching Primero case to update the Services Subform with the decision
each(
  '$.decisions[*]',
  upsertCase({
    externalIds: ['case_id'],
    data: state => {
      const decision = state.data;
      const decisionCaseId = state.data.case_id;
      console.log('Syncing decision ::', decisionCaseId);
      return decision;
    },
  })
);

// Remove everything but `cases` and `cursor` from state.
fn(state => ({ cases: state.cases, cursor: state.cursor }));
