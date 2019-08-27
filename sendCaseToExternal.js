// Prepping the source data...
alterState(state => {
  // Example of reformatting data from "Male"/ "Female" value --> "M" / "F"
  state.data = state.data.Envelope.Body.notifications.Notification.sObject;

  state.sexReformatted = (state.data.Sex__c == 'Male' ? 'M' : 'F');

  // Example of whether or not to return share assessment data depending if 'Consent to Share BIA Data' = true
  state.BIAdata = (state.data.Consent_To_Share_BIA__c == 'true' ? state.data.BIA_Results__c : 'No BIA data shared');

  // Example of re-categorizing service types
  state.assignService = function assignService(serviceType) {
    switch (serviceType) {
      case 'Basic psychosocial support':
        return 'Psychosocial Services';        
        break;
      
        case 'Cash assistance':
        return 'UN Cash Transfer';
        break;
      
        case 'Food':
        return 'UN Food Assistance';
        break;

      default:
        return '';
    }
  };

  return state;
});

// Sample job to send data from CPIMIS+ to external system (proGres)
create('Contact', fields(
  field('Case_Type__c', 'UNICEF Referral'), // Hard-coded tag
  field('Description', 'This case was referred automatically from UNICEF CPIMS+.'), //Hard-coded message
  field('Sync_with_Primero__c', 'true'),// Hard-coded set to TRUE as default value
  field('Primero_ID__c', dataValue('Case_ID__c')),
  field('Date_of_Referral__c', dataValue('Date_of_Referral__c')),
  field('Type_of_Referral__c', dataValue('Type_of_Referral__c')),
  field('Referral_Response_Priority__c', dataValue('Referral_Response_Priority__c')),
  field('Referred_By_Agency__c', dataValue('Referred_By_Agency__c')),
  field('Referred_To_Agency__c', dataValue('Referred_To_Agency__c')),
  field('FirstName', dataValue('FirstName')),
  field('LastName', dataValue('LastName')),
  field('Birthdate', dataValue('Birthdate')),
  field('Sex__c', state.sexReformatted), // function to reformat data value from "Male" --> "M"
  field('Reason_For_Referral__c', dataValue('Reason_For_Referral__c')),
  field('Referral_Service_Requested__c', state => {
    // function to re-classify service under external system's service categories
    return state.assignService(state.data.Referral_Service_Requested__c);
  }),
  field('Protection_Concerns__c', dataValue('Protection_Concerns__c')),
  field('BIA_Results__c', state.BIAdata) // function to return BIA data if consent is given
));
