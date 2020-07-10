# UNICEF Cambodia

Repository to manage OpenFn jobs to integrate the open-source UNICEF [**Primero**](https://www.primero.org/) and [**OSCaR**](https://oscarhq.com/) systems for secure data and referrals exchange. 

### Note! Commits to master will deploy automatically to OpenFn.org. 

## (1) Functional Requirements
Two integration flows have been implemented to facilitate a bi-directional sync between the Primero and OSCaR systems to share relevant case and referral data between systems. This is to support the following functional requirements.

_**Flow 1: Primero cases --> OSCaR**_
* User Story 1: Generating government referrals 

_**Flow 2: OSCaR cases --> Primero**_
* User Story 2: View OSCaR cases in Primero 
* User Story 4: Sending OSCaR referrals to Primero


## (2) System APIs
**APIs** implemented:
* Primero: [API v1.1](https://docs.google.com/document/d/1jpaT2_UBBnc3PxPYlLMBEzNUkyfuxRZiksywG5MKM0Q/edit?usp=sharing)
* OSCaR: [API v1.0.0](https://app.swaggerhub.com/apis/Ro51/OSCaRInterop/1.0.0#/info). 

**OpenFn language-packages** (API adaptors) implemented: 
* [language-primero](https://github.com/OpenFn/language-primero)

## (3) Flows
To achieve a bi-directional systems sync, 4 OpenFn jobs have been implemented to sync case and referral data between systems.

_**Flow 1: Primero cases --> OSCaR**_
1. [f1-j1-getPrimeroCases.js](https://github.com/OpenFn/unicef-cambodia/blob/master/jobs/f1-j1-getPrimeroCases.js) will fetch Primero case updates & referrals
2. [f1-j2-casesToOscar.js](https://github.com/OpenFn/unicef-cambodia/blob/master/jobs/f1-j2-casesToOscar.js) will upload Primero data to OScaR

_**Flow 2: OSCaR cases --> Primero**_
1. [f2-j1-getOscarCases.js](https://github.com/OpenFn/unicef-cambodia/blob/master/jobs/f2-j1-getOscarCases.js) will fetch OSCaR case updates & referrals
2. [f2-j2-upsertCasesToPrimero.js](https://github.com/OpenFn/unicef-cambodia/blob/master/jobs/f2-j2-upsertCasesToPrimero.js) will upload OSCaR data to Primero


## (4) Flow Triggers
### Trigger Type: Timer

_Every hour_ OpenFn will run the 4 jobs to fetch new case information from the Primero and OSCaR systems. The flows may also be executed on-demand at any time by a designated OpenFn admin user by clicking the "Run" button on a job in OpenFn.org. 
![Run Job](/demo/run_job_now.png)

_**Flow 1: Primero cases --> OSCaR**_

<!--`GET ... ` -->
`f1-j1-getPrimeroCases.js` sends a GET request to Primero to list cases where: 
1. New referrals have been created (indicated by Primero _date_ field `transitions_created_at`).
2. Case updates made since the last OpenFn request, indicated by Primero _date/time_field `transitions_changed_at`. (Note: This happens if the case owner, case owner’s phone, case owner’s Agency, or the Service Implemented On fields are changed.) 

Example Request:
``` 
GET /api/cases?remote=true&scope[or][transitions_created_at]=or_op||date_range||07-05-2020.01-01-4020&scope[or][transitions_changed_at]=or_op||date_range||07-05-2020 00:40.01-01-4020 03:00&scope[service_response_types]=list||referral_to_oscar 
```

_**Flow 2: OSCaR cases --> Primero**_

`f2-j1-getOscarCases.js` sends a GET request to OSCaR to list cases where: 
<!--`GET ... ` -->
1. New external referrals have been created (indicated by OSCaR field `referred_external`). 
2. Case updates made since the last OpenFn request(indicated by OSCaR _date/time_ field `since_date`). 

Example Request:
```
 GET /api/v1/organizations/clients?since_date='2020-07-01 01:00:00'&referred_external=true
```
### Assumptions 
1. **Data Entry** - In order for data to be successfully exchanged as expected, users should follow the data entry protocols defined in the training sessions. **(See this vide)** for an overview of the data entry steps in both the OSCaR and Primero systems. 
2. **Services** are mapped between systems as defined in the [Service Map](https://docs.google.com/spreadsheets/d/1x-KUJgOhaZlZYzJ935q9QXhPM0yobjEEuN-IJgIvmwA/edit#gid=1841308930). If any services change, this map and OpenFn jobs must be updated.  
3. **Registering New Organizations/ Agencies** - Agency IDs and Users are mapped between systems as defined in [Agency User Map](https://docs.google.com/spreadsheets/d/1x-KUJgOhaZlZYzJ935q9QXhPM0yobjEEuN-IJgIvmwA/edit#gid=2080615206). If new Agencies are created, OSCaR and Primero teams will coordinate to manually register the new agencies in each system (this is _not_ an automated process). **Agency names and users should follow the below naming conventions, _otherwise the OpenFn jobs must be updated_**: 
    - Oscar Organization Name: `'{organization_name}'` (e.g., `cif`)
    - Primero Agency ID: `'agency-{organization_name}'` (e.g., `agency-cif`)
    - Primero Agency User: `'agency-{organization_name}-user'` (e.g., `agency-cif-user`)

    In the mappings, Oscar `organzation_name: 'cif'` maps to --> Primero `owned_by: 'agency-cif-user'`)

## (5) Flow Mappings & Transformations

[See this table](https://docs.google.com/spreadsheets/d/1x-KUJgOhaZlZYzJ935q9QXhPM0yobjEEuN-IJgIvmwA/edit?usp=sharing) for the field mappings & data transformation rules implemented in the OpenFn jobs. This includes detailed mappings for **Services** and **Agency Users**. 

## (6) Administration
### Provisioning, Hosting, & Maintenance
This integration is hosted on [OpenFn.org](https://openfn.org/projects). 

### Support 
- [ ] OpenFn Admin users & access levels confirmed? 
- [ ] Support POCs identified for each connected system? 
- [ ] OpenFn Admin training


