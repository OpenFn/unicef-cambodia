//Sample job to send case data from CPIMS+ to MRMIS+ modules
alterState(state => {
  // Pluck out the part we want.
  state.data = state.data.Envelope.Body.notifications.Notification.sObject;
  return state;
});

// Sample job to send case data; create 'Contact' record in destination DB
create('Contact', fields(
  field('Case_Type__c', 'UNICEF MRMIS+ Case'), //Hard-coded tag
  field('Description', 'This case was referred automatically from UNICEF.'), //Hard-coded message
  field('Case_ID__c', dataValue('Case_ID__c')), // Mapping field('Destination_field', dataValue('Source_field'))
  field('Date_of_Referral__c', dataValue('Date_of_Referral__c')),
  field('Type_of_Referral__c', dataValue('Type_of_Referral__c')),
  field('Referral_Response_Priority__c', dataValue('Referral_Response_Priority__c')),
  field('Referred_By_Agency__c', dataValue('Referred_By_Agency__c')),
  field('FirstName', dataValue('FirstName')),
  field('LastName', dataValue('LastName')),
  field('Birthdate', dataValue('Birthdate')),
  field('Sex__c', dataValue('Sex__c')),
  field('Reason_For_Referral__c', dataValue('Reason_For_Referral__c')),
  field('Referral_Service_Requested__c', dataValue('Referral_Service_Requested__c')),
  field('Protection_Concerns__c', dataValue('Protection_Concerns__c'))
));
