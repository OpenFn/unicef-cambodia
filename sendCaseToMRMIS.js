/* Sample job to send data from CPIMIS+ to MRMIS+ */ 
create('Contact', fields(
  field('Case_Type__c', 'MRMIS+'), //Hard-coded tag
  field('Description', 'This case was referred automatically from UNICEF CPIMS+.'), //Hard-coded message
  field('Consent_To_Share__c', 'true'),//Hard-coded set to TRUE as default value
  field('Case_ID__c', dataValue('Envelope.Body.notifications.Notification.sObject.Case_ID__c')),
  field('Date_of_Referral__c', dataValue('Envelope.Body.notifications.Notification.sObject.Date_of_Referral__c')),
  field('Type_of_Referral__c', dataValue('Envelope.Body.notifications.Notification.sObject.Type_of_Referral__c')),
  field('Referral_Response_Priority__c', dataValue('Envelope.Body.notifications.Notification.sObject.Referral_Response_Priority__c')),
  field('Referred_By_Name__c', dataValue('Envelope.Body.notifications.Notification.sObject.Referred_By_Name__c')),
  field('Referred_By_Agency__c', dataValue('Envelope.Body.notifications.Notification.sObject.Referred_By_Agency__c')),
  field('Referred_By_Position__c', dataValue('Envelope.Body.notifications.Notification.sObject.Referred_By_Position__c')),
  field('Referred_By_Phone__c', dataValue('Envelope.Body.notifications.Notification.sObject.Referred_By_Phone__c')),
  field('Referred_To_Name__c', dataValue('Envelope.Body.notifications.Notification.sObject.Referred_To_Name__c')),
  field('FirstName', dataValue('Envelope.Body.notifications.Notification.sObject.FirstName')),
  field('LastName', dataValue('Envelope.Body.notifications.Notification.sObject.LastName')),
  field('Birthdate', dataValue('Envelope.Body.notifications.Notification.sObject.Birthdate')),
  field('Sex__c',  dataValue('Sex__c')),
  field('Reason_For_Referral__c', dataValue('Envelope.Body.notifications.Notification.sObject.Reason_For_Referral__c')),
  field('Referral_Service_Requested__c', dataValue('Envelope.Body.notifications.Notification.sObject.Referral_Service_Requested__c')),
  field('Protection_Concerns__c', dataValue('Envelope.Body.notifications.Notification.sObject.Protection_Concerns__c')),
  field('BIA_Results__c', (state) => { //function to return BIA data if consent is given
    const primero = state.data.Envelope.Body.notifications.Notification.sObject;
    return (primero.Consent_To_Share_BIA__c=='true' ? primero.BIA_Results__c : 'No BIA data shared');
  })
))
