# UNICEF Cambodia

Repository to manage OpenFn jobs to integrate the open-source UNICEF [**Primero**](https://www.primero.org/) and [**OSCaR**](https://oscarhq.com/) systems for secure data and referrals exchange.

### Note that commits to master will deploy directly to OpenFn.org

## About the OpenFn integration
2 OpenFn jobs have been implemented to facilitate a bi-directional sync between the Primero and OSCaR systems. On a timer-basis, these jobs will execute to share relevant case and referral data between systems. This is to support the following functional requirements: 
* User Story 1: Generating Government Referrals (Primero cases --> OSCaR)
* User Story 2: View OSCaR cases in Primero (OSCaR cases --> Primero)
* User Story 4: Sending referrals to Primero (OSCaR cases --> Primero)
