// Primero cases --> OSCaR
// User Story 1: Generating government referrals, creating referrals in Oscar
alterState(state => {
  // ===========================================================================
  // NOTE: As of September 25, 2020, Primero has changed the structure of this
  // payload for a subset of cases, depending on whether or not data exists in
  // the services array. Below, we create an empty array (if it's been removed
  // to ensure that all payloads adhere to the integration contract.
  state.data = state.data.map(c => ({
    ...c,
    services_section: c.services_section || [],
    transitions: c.transitions || [],
  }));
  // ===========================================================================
  return state;
});

post(
  // Oscar authentication, once per run
  '/api/v1/auth/sign_in',
  {
    keepCookie: true,
    body: {
      email: state.configuration.username,
      password: state.configuration.password,
    },
  },
  // User Story 1.8b: Create referrals in Oscar
  each(
    merge(
      '$.references[1][*]',
      // Bring down the authentication info for use in each case post.
      fields(
        field('__token', dataValue("__headers['access-token']")),
        field('__client', dataValue('__headers.client'))
      )
    ),
    post('/api/v1/organizations/clients/upsert/', {
      // This will upsert cases
      headers: state => {
        // Use Oscar authentication from previous step
        return {
          'Content-Type': 'application/json',
          uid: state.configuration.username,
          client: state.data.__client,
          'access-token': state.data.__token,
        };
      },
      body: state => {
        // NOTE: OSCaR API has unique behavior that requires us to send empty strings for null values.
        function oscarStrings(data) {
          if (data) {
            return data;
          } else {
            console.log('Converting key to an empty string for OSCAR.');
            return '';
          }
        }

        function checkValue(data) {
          if (data !== 'NaN' && data) {
            return data.length === 7 ? '0' + data : data; //change to; only if 7 characters add leading 0
            //return '0'.repeat(8 - data.length) + data; //REMOVE once tested
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
        };

        const protectionMap = {
          unaccompanied: 'Living and working on street',
          separated: 'Unaccompanied child',
          migrant_child_13820: 'Migrant child',
          trafficked_child_47822: 'Trafficked child',
          sexually_exploited_child_71438: 'Sexually exploited child',
          abandoned_child_98628: 'Abandoned child',
          orphan_child_99287: 'Orphan child',
          hiv_aids_88169: 'HIV/AIDS',
          physical_impairment_03566: 'Physical impairment',
          mental_impairment_27429: 'Mental impairment',
          domestic_violated_child_28014: 'Domestic violated child',
          vulnerable_child_affected_by_alcohol_01558: 'Vulnerable child affected by alcohol',
          oscar_referral: 'OSCaR referral',
        };

        const c = state.data;
        const lastTransitionNote =
          c.transitions.length > 0 &&
          c.transitions.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0].notes;

        console.log(
          `Data provided by Primero: ${JSON.stringify(
            {
              _id: c._id,
              case_id: c.case_id,
              case_id_display: c.case_id_display,
              created_at: c.created_at,
              location_current: c.location_current,
              module_id: c.module_id,
              owned_by: c.owned_by,
              owned_by_agency: c.owned_by_agency,
              owned_by_phone: c.owned_by_phone,
              services_section: c.services_section.map(s => ({
                oscar_case_worker_telephone: s.oscar_case_worker_telephone,
                oscar_referring_organization: s.oscar_referring_organization,
                service_implementing_agency: s.service_implementing_agency,
                service_implementing_agency_individual: s.service_implementing_agency_individual,
                service_status_referred: s.service_status_referred,
                unique_id: s.unique_id,
              })),
              transitions: c.services_section.map(t => ({
                created_at: t.created_at,
                id: t.id,
                service_section_unique_id: t.service_section_unique_id,
                to_user_local: t.to_user_local,
                to_user_local_status: t.to_user_local_status,
                transitioned_by: t.transitioned_by,
                type_of_export: t.type_of_export,
                unique_id: t.unique_id,
              })),
            },
            null,
            2
          )}`
        );

        // Mappings for posting cases to Oscar
        const oscar = {
          // oscar_field, primero_field,
          external_id: oscarStrings(c.case_id),
          external_id_display: oscarStrings(c.case_id_display),
          global_id: oscarStrings(c.oscar_number),
          mosvy_number: oscarStrings(c.mosvy_number),
          given_name: oscarStrings(c.name_first),
          family_name: oscarStrings(c.name_last),
          gender: oscarStrings(c.sex),
          date_of_birth: oscarStrings(c.date_of_birth && c.date_of_birth.replace(/\//g, '-')),
          location_current_village_code: checkValue(c.location_current),
          address_current_village_code: oscarStrings(c.address_current),
          // reason_for_referral: oscarStrings(
          //   protectionMap[c.protection_status] || c.protection_status
          // ),
          reason_for_referral: oscarStrings(lastTransitionNote),
          external_case_worker_name: oscarStrings(c.owned_by),
          external_case_worker_id: oscarStrings(c.owned_by_id),
          external_case_worker_mobile: c.owned_by_phone || '000000000',
          organization_name: 'demo', // hardcoding to one of the orgs in Oscar staging system for testing
          //organization_name: oscarStrings(c.owned_by_agency.substring(7)), // add back in before go-live
          organization_id: oscarStrings(c.owned_by_agency_id),
          is_referred: c.services_section
            .map(s => s.service_response_type)
            .includes('referral_to_oscar'),
          services: c.services_section
            .filter(s => s.service_subtype)
            .map(s => {
              return s.service_subtype.map(st => {
                return {
                  uuid: oscarStrings(s.unique_id),
                  name: serviceMap[st] || 'Other',
                };
              });
            })
            .flat(),
          transaction_id: c.transition_id,
          // transaction_id: oscarStrings(c.transition_id),
        };

        // NOTE: Logs for enhanced audit trail.
        console.log(
          'Case data to be posted to Oscar: ',
          JSON.stringify(
            {
              organization: {
                external_id: oscar.external_id,
                external_id_display: oscar.external_id_display,
                global_id: oscar.global_id,
                mosvy_number: oscar.mosvy_number,
                location_current_village_code: oscar.location_current_village_code,
                address_current_village_code: oscar.address_current_village_code,
                external_case_worker_name: oscar.external_case_worker_name,
                external_case_worker_id: oscar.external_case_worker_id,
                external_case_worker_mobile: oscar.external_case_worker_mobile,
                organization_name: oscar.organization_name,
                organization_id: oscar.organization_id,
                is_referred: oscar.is_referred,
                services: oscar.services && oscar.services.map(s => ({ uuid: s.uuid })),
              },
            },
            null,
            2
          )
        );

        return { organization: oscar };
      },
    })
  )
);
