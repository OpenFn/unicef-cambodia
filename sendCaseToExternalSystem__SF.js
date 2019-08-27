//Sample job to send data from CPIMIS+ to external system (proGres)
alterState((state) => {
  //Example of reformatting data from "Male"/ "Female" value --> "M" / "F"
  const primero = state.data.Envelope.Body.notifications.Notification.sObject;
  state.sexReformatted = (primero.Sex__c=='Male' ? 'M' : 'F');
  //Example of re-categorizing service types
  state.progresServiceName = (
      if(primero.Referral_Service_Requested__c=='Basic psychosocial support'){
        return 'Psychosocial Support Services';
      }else if(primero.Referral_Service_Requested__c=='Cash assistance'){
        return 'Cash Transfer';
      }else if(primero.Referral_Service_Requested__c=='Food'){
        return 'Food Assistance';
      }else{
        const serviceDescription = 'UNICEF Service Request: ${primero.Referral_Service_Requested__c}';
        return serviceDescription;
      });
  //Example of whether or not to return share assessment data depending if 'Consent to Share BIA Data' = true
  state.BIA_data = (primero.Content_To_Share_BIA__c)==true ? primero.BIA_Results__c : 'No BIA data shared');

  return state
});

create("Contact", fields(
  "Description": 'This case was referred automatically from UNICEF CPIMS+.', //Hard-coded message
  "Consent_To_Share__c": true, //Hard-coded set to TRUE as default value
  "Case_ID__c": primero.Case_ID__c,
  "Date_of_Referral__c": primero.Date_of_Referral__c,
  "Type_of_Referral__c": primero.Type_of_Referral__c,
  "Referral_Response_Priority__c": primero.Referral_Response_Priority__c,
  "Referred_By_Name__c": primero.Referred_By_Name__c,
  "Referred_By_Agency__c": primero.Referred_By_Agency__c,
  "Referred_By_Position__c": primero.Referred_By_Position__c,
  "Referred_By_Phone__c": primero.Referred_By_Phone__c,
  "Referred_To_Name__c": primero.Referred_To_Name__c,
  "FirstName": primero.FirstName,
  "LastName": primero.LastName,
  "Birthdate": primero.Birthdate,
  "Sex__c": state.sexReformatted, //sex data value reformatted before posting to external system
  "Reason_For_Referral__c": primero.Reason_For_Referral__c,
  "Protection_Concerns__c": primero.Protection_Concerns__c,
  "Referral_Service_Requested__c": state.progresServiceName, //service re-classified under external system's service categories
  "BIA_Results__c": state.BIA_data //will return BIA results if consent given
  )
)
