# UNICEF Cambodia

Repository to manage OpenFn jobs to integrate the open-source UNICEF [**Primero**](https://www.primero.org/) and [**OSCaR**](https://oscarhq.com/) systems for secure data and referrals exchange.

### Note! Commits to master will deploy automatically to OpenFn.org. 

## About the integration
Two integration flows have been implemented to facilitate a bi-directional sync between the Primero and OSCaR systems. On a timer-basis, these jobs will execute to share relevant case and referral data between systems. This is to support the following functional requirements.
_Flow 1: Primero cases --> OSCaR_
* User Story 1: Generating Government Referrals 
_Flow 2: OSCaR cases --> Primero_
* User Story 2: View OSCaR cases in Primero 
* User Story 4: Sending referrals to Primero

## About the OpenFn jobs
To achieve the 
