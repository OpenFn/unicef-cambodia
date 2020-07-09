# UNICEF Cambodia

Repository to manage OpenFn jobs to integrate the open-source UNICEF [**Primero**](https://www.primero.org/) and [**OSCaR**](https://oscarhq.com/) systems for secure data and referrals exchange.

### Note! Commits to master will deploy automatically to OpenFn.org. 

## About the integration
Two integration flows have been implemented to facilitate a bi-directional sync between the Primero and OSCaR systems to share relevant case and referral data between systems. This is to support the following functional requirements.

_**Flow 1: Primero cases --> OSCaR**_
* User Story 1: Generating Government Referrals 

_**Flow 2: OSCaR cases --> Primero**_
* User Story 2: View OSCaR cases in Primero 
* User Story 4: Sending referrals to Primero

## About the OpenFn jobs
To achieve the bi-direction sync, 4 OpenFn jobs have been implemented. On a timer-basis, these jobs will execute to ensure regular data syncs, but this flows may also be executed on-demand at any time by a designated OpenFn admin user.

_**Flow 1: Primero cases --> OSCaR**_
1. [f1-j1-getPrimeroCases.js](https://github.com/OpenFn/unicef-cambodia/blob/master/jobs/f1-j1-getPrimeroCases.js)
2. [f1-j2-casesToOscar.js](https://github.com/OpenFn/unicef-cambodia/blob/master/jobs/f1-j2-casesToOscar.js)

_**Flow 2: OSCaR cases --> Primero**_
1. [f2-j1-getOscarCases.js](https://github.com/OpenFn/unicef-cambodia/blob/master/jobs/f2-j1-getOscarCases.js)
2. [f2-j2-upsertCasesToPrimero.js](https://github.com/OpenFn/unicef-cambodia/blob/master/jobs/f2-j2-upsertCasesToPrimero.js)

These jobs were designed using [Primero API documentation v1.1](https://docs.google.com/document/d/1jpaT2_UBBnc3PxPYlLMBEzNUkyfuxRZiksywG5MKM0Q/edit?usp=sharing) and [OSCaR API documentation 1.0.0](https://app.swaggerhub.com/apis/Ro51/OSCaRInterop/1.0.0#/info). 

| Syntax | Description | Notes |
| --- | ----------- | ----------- |
| Header | Title | Title |
| Paragraph | Text | Title |

### Questions about this implementation? 
Contact aleksa@openfn.org. 


