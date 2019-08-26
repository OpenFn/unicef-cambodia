post("https://api.primero/mrmims_endpoint", {
  headers: {
    "Content-Type": "application/json",
  },
  body: (state) => {
    const postBody = {
      comment: 'This case was referred automatically from CPIMS+.',
      case_id: state.data.case_id,
      case_type: 'Referral',
      date_of_referral: state.data.date_of_referral,
      type_of_referral: state.data.type_of_referral,
      referral_response_priority: state.data.referral_response_priority,
      referred_by_name: state.data.referred_by_name,
      referred_by_agency: state.data.referred_by_agency,
      referred_by_position: state.data.referred_by_position,
      referred_by_phone: state.data.referred_by_phone,
      referred_by_email: state.data.referred_by_email,
      referred_to: state.data.referred_to,
      referred_to_name: state.data.referred_to_name,
      referred_to_agency: state.data.referred_to_agency,
      referred_to_position: state.data.referred_to_position,
      referred_to_phone: state.data.referred_to_phone,
      referred_to_email: state.data.referred_to_email,
      name_first: state.data.beneficiary.name_first,
      name_last: state.data.beneficiary.name_last,
      date_of_birth: state.data.beneficiary.date_of_birth,
      sex: state.data.beneficiary.sex,
      reason_for_referral: state.data.beneficiary.reason_for_referral,
      protection_concerns: state.data.beneficiary.protection_concerns,
      protection_concerns_other: state.data.beneficiary.protection_concerns_other,
      referral_service_requested: state.data.beneficiary.referral_service_requested,
      referral_service_requested_other: state.data.beneficiary.referral_service_requested_other
    };
    return postBody;
  }
});
