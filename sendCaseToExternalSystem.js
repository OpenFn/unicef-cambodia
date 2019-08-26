//Sample job to send data from CPIMIS+ to external system (proGres)
post("https://api.primero/mrmims_endpoint", {
  headers: {
    "Content-Type": "application/json",
  },
  body: (state) => {
    const postBody = {
      comment: 'This case was referred automatically from UNICEF CPIMS+.',
      consent_to_share_with_unicef: true,
      caseId: state.data.case_id,
      caseType: 'UNICEF Referral',
      referral_date: state.data.date_of_referral,
      referral_type: state.data.type_of_referral,
      referral_response_priority: state.data.referral_response_priority,
      referred_by_name: state.data.referred_by_name,
      referred_by_agency: state.data.referred_by_agency,
      referred_by_position: state.data.referred_by_position,
      referred_by_phone: state.data.referred_by_phone,
      referred_by_email: state.data.referred_by_email,
      referred_to: state.data.referred_to,
      firstName: state.data.beneficiary.name_first,
      surname: state.data.beneficiary.name_last,
      dob: , // reformat date of state.data.beneficiary.date_of_birth
      sex: state.data.beneficiary.sex,
      // If sex = Male/Female, return "M" / "F"
      referral_reason: state.data.beneficiary.reason_for_referral,
      protectionNotes: ,// If not null, concatenate 'state.data.beneficiary.protection_concerns' AND 'state.data.beneficiary.protection_concerns_other'
      referral_service_requested: state.data.beneficiary.referral_service_requested
    };
    return postBody;
  }
});
