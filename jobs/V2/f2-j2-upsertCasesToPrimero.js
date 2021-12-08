// Oscar cases ---> Primero
// User Story 2: 'View Oscar cases in Primero' AND User Story 4: 'Sending referrals to Primero'
fn(state => {
  // ===========================================================================
  // NOTE: As of September 25, 2020, Oscar has changed the structure of this
  // payload for a subset of cases, depending on whether or not data exists in
  // the services array. Below, we create an empty array (if it's been removed
  // to ensure that all payloads adhere to the integration contract.
  state.data.data = state.data.data
    .map(c => {
      const normalizedServicesArray = c.services || [];
      return { ...c, services: normalizedServicesArray };
    })
    .filter(c => {
      // remove 'demo' cases
      if (c.organization_name == 'demo') {
        console.log(`Dropping demo case: ${c.global_id}`);
        return false;
      }
      return true;
    });
  // ===========================================================================

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

  state.cases = state.data.data.map(c => {
    function convertDate(str) {
      if (str) {
        const date = new Date(str);
        monthNames = [
          'jan',
          'feb',
          'mar',
          'apr',
          'may',
          'jun',
          'jul',
          'aug',
          'sep',
          'oct',
          'nov',
          'dec',
        ];
        var dd = date.getDate();
        var mmm = monthNames[date.getMonth()];
        var yyyy = date.getFullYear();
        return `${dd}-${mmm}-${yyyy} 00:00`;
      }
      return null;
    }

    function byServiceType(outputObject, currentValue) {
      // Group the array of services by service type, returning an object
      // with a key for each service type, and an array of services for that
      // type.
      (outputObject[currentValue['service_type']] =
        outputObject[currentValue['service_type']] || []).push(currentValue);
      return outputObject;
    }

    function mapKeysToServices(object) {
      return Object.keys(object).map(key => {
        // Map across all of the keys (or service types) in the servicesObject
        // to return an array of services, where each service is built from the
        // first service of that type for each type.

        const oscarService = object[key][0];
        return {
          unique_id: oscarService.uuid,
          service_subtype: object[key].map(st => st.service_subtype),
          service_type: key,
          service_type_text: key,
          service_type_details_text: serviceMap[oscarService.name] ? 'n/a' : oscarService.name,
          service_response_day_time: oscarService.enrollment_date
            ? `${oscarService.enrollment_date}T00:00:00.000Z`
            : oscarService.enrollment_date,
          oscar_case_worker_name: c.case_worker_name,
          oscar_referring_organization: `agency-${c.organization_name}`,
          oscar_case_worker_telephone: c.case_worker_mobile,
          service_response_type: oscarService.enrollment_date
            ? 'service_being_provided_by_oscar_partner_47618'
            : 'referral_from_oscar',
        };
      });
    }

    function classifyServices(arr) {
      return arr.map(service => {
        return {
          ...service,
          isReferral: service.enrollment_date ? true : false,
          service_type: (serviceMap[service.name] && serviceMap[service.name].type) || 'Other',
          service_subtype:
            (serviceMap[service.name] && serviceMap[service.name].subtype) || 'Other',
        };
      });
    }

    function reduceOscarServices(oscarServicesArray) {
      const primeroServicesArray = mapKeysToServices(
        classifyServices(oscarServicesArray)
          .filter(x => !x.isReferral)
          .reduce((obj, elem) => byServiceType(obj, elem), {})
      );

      const primeroReferralsArray = mapKeysToServices(
        classifyServices(oscarServicesArray)
          .filter(x => x.isReferral)
          .reduce((obj, elem) => byServiceType(obj, elem), {})
      );

      // Finally, return this new SMALLER array of primeroServices where Oscar's
      // initially services have been aggregated/reduced down by service_type.
      return primeroServicesArray.concat(primeroReferralsArray);
    }

    const now = new Date();

    // NOTE: These logs are extremely VERBOSE but more secure, given that we don't know
    // exactly what will be provided by the API.
    // console.log(
    //   `Data provided by Oscar (ON: ${c.global_id} / extId: ${c.external_id}) : ${JSON.stringify(
    //     {
    //       oscar_short_id: c.slug,
    //       //address_current_village_code: c.address_current_village_code,
    //       external_case_worker_id: c.external_case_worker_id,
    //       external_id: c.external_id,
    //       external_id_display: c.external_id_display,
    //       global_id: c.global_id,
    //       is_referred: c.is_referred,
    //       location_current_village_code: c.location_current_village_code,
    //       organization_id: c.organization_id,
    //       organization_name: c.organization_name,
    //       services: c.services.map(service => ({
    //         uuid: service.uuid,
    //         enrollment_date: service.enrollment_date,
    //       })),
    //       status: c.status,
    //     },
    //     null,
    //     2
    //   )}`
    // );
    console.log(
      `Data provided by Oscar (ON: ${c.global_id} / extId: ${c.external_id}) : ${JSON.stringify(
        c,
        null,
        4
      )}`
    );

    function genderTransform(str) {
      switch (str) {
        case 'male':
        case 'female':
          return str;

        case undefined:
        case null:
        case '':
          return null;

        default:
          return 'other';
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

    function primeroId(c) {
      return c.external_id ? c.external_id : null;
    }

    function setUser(c) {
      if (c.is_referred) {
        return setProvinceUser(c);
      }
      return setAgencyUser(c);
    }

    function setProvinceUser(c) {
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

    function createName(given, local) {
      if (local && given) {
        return `${local} (${given})`; //Format: khmer name (engligh name)
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

    function setAgencyUser(c) {
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

      if (c.organization_name) {
        return agencyMap[`agency-${c.organization_name}`];
      } else {
        throw `No agency user found for the organization ${c.organization_name}. Please create an agency user for this organization and update the job accordingly.`;
      }
    }

    //const isUpdate = c.external_id && c.is_referred!==true; //cannot contain is_referred, oscar will repeatedly send
    const isUpdate = c.external_id;

    const locationCode = c.location_current_village_code
      ? parseInt(c.location_current_village_code, 10).toString()
      : null;
    
    // Mappings for upserting cases in Primero (update if existing, insert if new)
    const primeroCase = {
      //remote: true,
      oscar_number: c.global_id,
      // NOTE ==================================================================
      // `unique_identifier` below duplicates `case_id` but has been requested
      // by Primero as a workaround for certain uuid/external_id duplicate
      // issues in v1 of their public API. This will likely change soon.
      case_id: primeroId(c),
      //unique_identifier: primeroId(c),
      // =======================================================================
      // FIELDS PREVIOUSLY IN CHILD{}
      // primero_field: oscar_field,
      case_id: c.external_id, // externalId for upsert (will fail if multiple found)
      // oscar_number: c.global_id,
      oscar_short_id: c.slug,
      mosvy_number: c.mosvy_number,
      name_first: isUpdate ? null : createName(c.given_name, c.local_given_name),
      name_last: isUpdate ? null : createName(c.family_name, c.local_family_name),
      sex: isUpdate ? null : genderTransform(c.gender),
      date_of_birth: isUpdate ? null : c.date_of_birth,
      age: isUpdate ? null : calcAge(c.date_of_birth),
      location_current: isUpdate ? null : locationCode,
      //address_current: isUpdate ? null : c.address_current_village_code,
      oscar_status: isUpdate ? null : c.status,
      protection_status: !isUpdate && c.is_referred == true ? 'oscar_referral' : null,
      //service_implementing_agency: `agency-${c.organization_name}`,
      owned_by: isUpdate && c.is_referred !== true ? null : setUser(c),
      //owned_by_text:
      //  isUpdate && c.is_referred !== true ? null : `${c.case_worker_name} ${c.case_worker_mobile}`,
      oscar_reason_for_exiting: c.reason_for_exiting,
      //has_referral: c.is_referred,
      risk_level: c.is_referred == true ? c.level_of_risk : null,
      //consent_for_services: isUpdate || c.is_referred !== true ? null : true,
      //disclosure_other_orgs: isUpdate || c.is_referred !== true ? null : true,
      interview_subject: isUpdate || c.is_referred !== true ? null : 'other',
      //content_source_other: isUpdate ? null : 'OSCaR',
      module_id: 'primeromodule-cp',
      //registration_date: isUpdate ? null : now.toISOString().split('T')[0].replace(/-/g, '/'),
      referral_notes_oscar: c.reason_for_referral, //new services referral notes field
      services_section: reduceOscarServices(c.services),
      // -----------------------------------------------------------------------
      // transitions:
      //   isUpdate || c.is_referred !== true
      //     ? null
      //     : reduceOscarServices(c.services).map(t => ({
      //         service_section_unique_id: t.unique_id,
      //         service: t.service_type,
      //         created_at: now.toISOString().split('T')[0].replace(/-/g, '/'),
      //         type: 'referral',
      //       })),
      //END FIELDS PREVIOUSLY IN CHILD{}
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

  // This removes all cases set to `false`;
  return { ...state, cases: state.cases.filter(c => c) };
});

each(
  '$.cases[*]',
  upsertCase({
    // Upsert Primero cases based on matching 'oscar_number' OR 'case_id'
    externalIds: state => (state.data.case_id ? ['case_id'] : ['oscar_number']),
    // externalIds: ['oscar_number', 'case_id'],
    data: state => {
      const c = state.data;
      // NOTE: This is extremely VERBOSE but more secure, given that we don't
      // know exactly what will be provided by the API.
      // console.log(
      //   'Data provided to Primero for upload `upsertCase`: ',
      //   JSON.stringify(
      //     {
      //       remote: c.remote,
      //       oscar_number: c.oscar_number,
      //       case_id: c.case_id,
      //       unique_identifier: c.unique_identifier,
      //       // FIELDS PREVIOUSLY IN CHILD{}
      //       case_id: c.case_id,
      //       oscar_number: c.oscar_number,
      //       oscar_short_id: c.oscar_short_id,
      //       mosvy_number: c.mosvy_number,
      //       name_first: c.name_first,
      //       name_last: c.name_last,
      //       sex: c.sex,
      //       date_of_birth: c.date_of_birth,
      //       age: c.age,
      //       location_current: c.location_current,
      //       //address_current: c.address_current,
      //       oscar_status: c.oscar_status,
      //       protection_status: c.protection_status,
      //       service_implementing_agency: c.service_implementing_agency,
      //       owned_by: c.owned_by,
      //       owned_by_text: c.owned_by_text,
      //       oscar_reason_for_exiting: c.oscar_reason_for_exiting,
      //       has_referral: c.has_referral,
      //       risk_level: c.risk_level,
      //       consent_for_services: c.consent_for_services,
      //       disclosure_other_orgs: c.consent_for_services,
      //       interview_subject: c.interview_subject,
      //       content_source_other: c.content_source_other,
      //       module_id: c.module_id,
      //       registration_date: c.registration_date,
      //       referral_notes_oscar: c.referral_notes_oscar,
      //       services_section: c.services_section,
      //       //END FIELDS PREVIOUSLY IN CHILD{}
      //     },
      //     null,
      //     2
      //   )
      // );
      console.log('Data provided to Primero for upload `upsertCase`: ', JSON.stringify(c, null, 4));
      return state.data;
    },
  })
);
