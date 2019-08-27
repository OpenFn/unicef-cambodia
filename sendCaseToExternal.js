/* Sample job to send data from CPIMIS+ to external system (proGres) */
alterState((state) => {
  //Example of reformatting data from "Male"/ "Female" value --> "M" / "F"
  const primero = state.data.Envelope.Body.notifications.Notification.sObject;
  state.sexReformatted = (primero.Sex__c=='Male' ? 'M' : 'F');

  //Example of whether or not to return share assessment data depending if 'Consent to Share BIA Data' = true
  state.BIAdata = (primero.Consent_To_Share_BIA__c=='true' ? primero.BIA_Results__c : 'No BIA data shared');
  //Example of re-categorizing service types
  state.assignService = function assignService(state, serviceType){
    var service= '';
    if(serviceType =='Basic psychosocial support'){
      return service = 'Psychosocial Services';
    }else if(serviceType=='Cash assistance'){
      return 'UN Cash Transfer';
    }else if(serviceType=='Food'){
      return service = 'UN Food Assistance';
    }else{
      return service = serviceType;
    }
  };
  return state
});

create('Contact', fields(
  field('Case_Type__c', 'UNICEF Referral'), //Hard-coded tag
  field('Description', 'This case was referred automatically from UNICEF CPIMS+.'), //Hard-coded message
  field('Sync_with_Primero__c', 'true'),//Hard-coded set to TRUE as default value
  field('Primero_ID__c', dataValue('Envelope.Body.notifications.Notification.sObject.Case_ID__c')),
  field('Date_of_Referral__c', dataValue('Envelope.Body.notifications.Notification.sObject.Date_of_Referral__c')),
  field('Type_of_Referral__c', dataValue('Envelope.Body.notifications.Notification.sObject.Type_of_Referral__c')),
  field('Referral_Response_Priority__c', dataValue('Envelope.Body.notifications.Notification.sObject.Referral_Response_Priority__c')),
  field('Referred_By_Agency__c', dataValue('Envelope.Body.notifications.Notification.sObject.Referred_By_Agency__c')),
  field('Referred_To_Agency__c', dataValue('Envelope.Body.notifications.Notification.sObject.Referred_To_Agency__c')),
  field('FirstName', dataValue('Envelope.Body.notifications.Notification.sObject.FirstName')),
  field('LastName', dataValue('Envelope.Body.notifications.Notification.sObject.LastName')),
  field('Birthdate', dataValue('Envelope.Body.notifications.Notification.sObject.Birthdate')),
  field('Sex__c', (state) =>{ return state.sexReformatted }), //function to reformat data value from "Male" --> "M"
  field('Reason_For_Referral__c', dataValue('Envelope.Body.notifications.Notification.sObject.Reason_For_Referral__c')),
  field('Referral_Service_Requested__c', (state) => { //function to re-classify service under external system's service categories
    const primero = state.data.Envelope.Body.notifications.Notification.sObject;
    return state.assignService(state, primero.Referral_Service_Requested__c);
  }),
  field('Protection_Concerns__c', dataValue('Envelope.Body.notifications.Notification.sObject.Protection_Concerns__c')),
  field('BIA_Results__c', (state) => { return state.BIAdata }) //function to return BIA data if consent is given
))
