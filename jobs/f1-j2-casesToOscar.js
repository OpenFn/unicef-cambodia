// Primero cases --> OSCaR
// User Story 1: Generating government referrals, creating referrals in Oscar
post(
  //Oscar authentication, once per run
  '/api/v1/auth/sign_in',
  {
    keepCookie: true,
    body: {
      email: state.configuration.username,
      password: state.configuration.password,
    },
  },
  //User Story 1.8b: Create referrals in Oscar
  each(
    merge(
      '$.references[0][*]',
      // Bring down the authentication info for use in each case post.
      fields(
        field('__token', dataValue("__headers['access-token']")),
        field('__client', dataValue('__headers.client'))
      )
    ),
    post('/api/v1/organizations/clients/upsert/', {
      //This will upsert cases
      headers: state => {
        //Use Oscar authentication from previous step
        return {
          'Content-Type': 'application/json',
          uid: state.configuration.username,
          client: state.data.__client,
          'access-token': state.data.__token,
        };
      },
      body: state => {
        // TODO: This is very strange behaviour for an API. Let's confirm with
        // Kiry that it's not indicative of bigger problems under the hood.
        function oscarStrings(data) {
          if (data) {
            return data;
          } else {
            console.log('Converting key to an empty string for OSCAR.');
            return '';
          }
        }

        const serviceMap = {
          social_work_case_work_generalist:
            'Generalist social work / case work',
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
          financial_development_material_assistance:
            'Direct material assistance',
          financial_development_financial_assistance:
            'Direct financial assistance',
          financial_development_income_generation: 'Income generation services',
          financial_development_day_care: 'Day care services',
          disability_support_therapeutic_interventions:
            'Therapeutic interventions',
          'disability_support_respite-care': 'Disability respite care',
          disability_support_therapeutic_training: 'Therapeutic training',
          disability_support_aid_provision: 'Disability-aid provision',
          disability_support_peripheral: 'Peripheral supports',
          disability_support_groups: 'Support groups',
          medical_support_access_care: 'Support to access care',
          medical_support_provision_medical_case: 'Provision of medical care',
          medical_support_medical_training: 'Medical training services',
          medical_support_healt_education: 'Health education',
          legal_support_access_legal_services:
            'Support to access legal services',
          legal_support_advocacy_services: 'Legal advocacy services',
          legal_support_representation: 'Legal representation',
          legal_support_prision_visitation: 'Prison visitation support',
          mental_health_support_therapeutic_interventions:
            'Therapeutic interventions',
          mental_health_support_therapeutic_training: 'Therapeutic training',
          mental_health_support_direct_medical_support:
            'Direct medical support',
          training_education_school_support: 'School support',
          training_education_supplementary: 'Supplementary school education',
          training_education_vocational: 'Vocational education and training',
          training_education_material_support:
            'Material support for education (uniforms, etc)',
          training_education_scholarships: 'Scholarships or financial support',
          training_education_life_skills: 'Life skills',
          family_support_family_support: 'Family support',
          anti_trafficking_rescue: 'Rescue Services',
          anti_trafficking_transitional_accomodation:
            'Transitional Accommodation',
          anti_trafficking_post_trafficking: 'Post-Trafficking Counseling',
          anti_trafficking_community_reintegration:
            'Community Reintegration Support',
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
          vulnerable_child_affected_by_alcohol_01558:
            'Vulnerable child affected by alcohol',
          oscar_referral: 'OSCaR referral',
        };

        const c = state.data;

        // Mappings for posting cases to Oscar
        const json = {
          organization: {
            // oscar_field, primero_field,
            external_id: oscarStrings(c.case_id),
            external_id_display: oscarStrings(c.case_id_display),
            global_id: oscarStrings(c.oscar_number), // commenting out during tesing, because Primero test data has fake oscar numbers
            mosvy_number: oscarStrings(c.mosvy_number),
            given_name: oscarStrings(c.name_first),
            family_name: oscarStrings(c.name_last),
            gender: oscarStrings(c.sex),
            date_of_birth: oscarStrings(
              c.date_of_birth && c.date_of_birth.replace(/\//g, '-')
            ),
            location_current_village_code: oscarStrings(c.location_current),
            address_current_village_code: oscarStrings(c.address_current),
            reason_for_referral: oscarStrings(
              protectionMap[c.protection_status] || c.protection_status
            ),
            external_case_worker_name: oscarStrings(c.owned_by),
            external_case_worker_id: oscarStrings(c.owned_by_id),
            external_case_worker_mobile: c.owned_by_phone || '000000000',
            organization_name: 'cif', // hardcoding to one of the orgs in Oscar staging system for testing
            //organization_name: oscarStrings(c.owned_by_agency.substring(7)), //add back in before go-live
            organization_id: oscarStrings(c.owned_by_agency_id),
            services: [].concat.apply(
              [],
              c.services_section
                .filter(s => s.service_subtype)
                .map(s => {
                  return s.service_subtype.map(st => {
                    return {
                      uuid: oscarStrings(s.unique_id),
                      name: serviceMap[st] || 'Other',
                    };
                  });
                })
            ),
            transaction_id: c.transition_id,
            //transaction_id: oscarStrings(c.transition_id),
          },
        };

        // NOTE: Comment this out (or disable console) in production to protect
        // against exposure of sensitive data.
        console.log(
          'Case data to be posted to Oscar: ',
          JSON.stringify(json, null, 2)
        );

        return json;
      },
    })
  )
);
