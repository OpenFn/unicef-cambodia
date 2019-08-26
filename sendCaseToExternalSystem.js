//Sample job to send data from CPIMIS+ to external system (proGres)
alterState((state) => {
  //Example of reformatting data from "Male"/ "Female" value --> "M" / "F"
  state.sexReformatted = (state.data.beneficiary.sex==='Male' ? 'M' : 'F');
  //Example of re-categorizing service types
  state.progresServiceName = (
      if(state.data.referral_service_requested === "Basic psychosocial support"){
        return 'Psychosocial Support Services';
      }else if(state.data.referral_service_requested === "Cash assistance"){
        return 'Cash Transfer';
      }else if(state.data.referral_service_requested === "Food"){
        return 'Food Assistance';
      }else{
        const serviceDescription = 'UNICEF Service Request: ${state.data.beneficiary.referral_service_requested}';
        return serviceDescription;
      });
  return state;
});

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
      dob: , state.data.beneficiary.date_of_birth,
      sex: state.sexReformatted, //sex data value reformatted before posting to external system
      referral_reason: state.data.beneficiary.reason_for_referral,
      protectionNotes: state.data.beneficiary.protection_concerns,
      referral_service_requested: state.progresServiceName //service re-classified under external system's service categories
    };
    return postBody;
  }
});
