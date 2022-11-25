![cambodia-IO](./cambodia-IO.png)
# IO Solution between Primero and OSCaR Systems
Automated information exchange between the Primero and OSCaR systems has been implemented on OpenFn to enable interoperability between MoSVY (Primero users) and NGO case workers (OSCaR users) in Cambodia. This OpenFn solution was implemented in partnership with UNICEF Cambodia. 


## (1) Interoperability Solution Overview
See [this project background](https://docs.google.com/document/d/1zNyWXHhbJ0u_v5oeFSRGGoam2KdwHEYgSuSJ33qFai8/edit#heading=h.rmgmdzhp7hd5) for an overview of the Primero & OSCaR interoperability project and requirements. **See the user guides** for step-by-step instructions for MoSVY and NGO case workers. 
- [English user guide](https://docs.google.com/document/d/1c2irTpsZaOIEGzQaP1_O6XaREobJPdxV914hoDPJ9Dg/edit?usp=sharing) 
- [Khmer user guide](https://drive.google.com/file/d/1k3H5ZHgFOQDsA5yQVWSf_5rflH-5lEx5/view?usp=sharing)

Three interoperability workflows have been implemented to facilitate a bi-directional sync between the Primero and OSCaR systems to share relevant case and referral data between systems. This is to support the following functional requirements.


_**Workflow 1: Sending case referrals to NGOs (Primero -> OSCaR)**_
* Sending MoSVY government referrals to NGO case workers
* Syncing referral decisions from Oscar to Primero: When NGO case workers accept/reject a referral the decision is sent to the MoSVY case worker.
![workflow1-diagram](./primero_oscar_workflow1.png)


_**Workflow 2: Sending case referrals to MoSVY (OSCaR --> Primero**_
* Sending NGO referrals to MoSVY case workers
* Syncing referral decisions from Primero to Oscar: When MoSVY case workers accept/reject a referral the decision is sent to the NGO case worker.
* Syncing _all_ NGO cases to Primero for MoSVY case workers to view (to prevent duplicate work)
![workflow2-diagram](./oscar_primero_workflow2.png)


### Videos
[See this video playlist](https://www.youtube.com/playlist?list=PLSnTMDfTYBLj0cLKYgYBAtLU0lyrSG7Zb) for the solution overview & demo of the interoperability workflows. 

## (2) Integration with System APIs
To automate the IO workflows, a bi-directional integration has been configured on the [OpenFn](openfn.org) platform to connect the Primero and OSCaR APIs. 

**APIs*** implemented:
* Primero: [API v2](https://github.com/primeroIMS/primero/tree/development_v2/app/controllers/api) 
* OSCaR: [API v1.0.0](https://app.swaggerhub.com/apis/Ro51/OSCaRInterop/1.0.0#/info)

_*Note that these APIs are newly implemented and were developed at the start of this integration implementation._

**OpenFn Adaptors** (API wrappers) implemented: 
* [primero](https://github.com/OpenFn/adaptors/tree/main/packages/primero)

## (3) Interoperability Workflows
To achieve a bi-directional systems sync, multiple OpenFn jobs have been implemented to automate the different workflow steps. 

_**Flow 0: Oscar ids --> Primero**_ 
1. [f0-j1-getOscarCases.js](https://github.com/OpenFn/unicef-cambodia/blob/master/jobs/V2/f0-j1-getOscarCases.js) will fetch new Oscar cases to check for newly accepted OSCaR cases where an "oscar_number" has been assigned; we then want to sync this external ID back to Primero
2. [f0-j2-syncsIdsToPrimero.js](https://github.com/OpenFn/unicef-cambodia/blob/master/jobs/V2/f0-j2-syncsIdsToPrimero.js) will update Primero cases with Oscar External Ids

_**Flow 1: Primero cases --> OSCaR**_ ([Data flow diagram](https://lucid.app/lucidchart/invitations/accept/f6751d0f-2e48-4978-a635-13b8a45d6b3e))
1. [f1-j1-getPrimeroCases.js](https://github.com/OpenFn/unicef-cambodia/blob/master/jobs/V2/f1-j1-getPrimeroCasesV2.js) will fetch Primero case updates & referrals
2. [f1-j2-casesToOscar.js](https://github.com/OpenFn/unicef-cambodia/blob/master/jobs/V2/f1-j2-casesToOscar.js) will upload Primero data to OScaR

_**Flow 2: OSCaR cases --> Primero**_ ([Data flow diagram](https://lucid.app/lucidchart/invitations/accept/43b99cf0-7801-4ecc-882d-d404c0369a12))
1. [f2-j1-getOscarCases.js](https://github.com/OpenFn/unicef-cambodia/blob/master/jobs/V2/f2-j1-getOscarCases.js) will fetch OSCaR case updates & referrals
2. [f2-j2-upsertCasesToPrimero.js](https://github.com/OpenFn/unicef-cambodia/blob/master/jobs/V2/f2-j2-upsertCasesToPrimero.js) will upload OSCaR data to Primero
3. [f2-j3-updateReferralPending.js](https://github.com/OpenFn/unicef-cambodia/blob/master/jobs/V2/f2-j3-updateReferralPending.js) will set default 'Pending' service status for new referrals in Primero
 


## (4) Automation Triggers
### Trigger Type: Cron Timer

Every hour at `00` minutes (cron: `00 * * * *`) OpenFn will run the workflows to sync case data between the Primero and OSCaR systems. The flows may also be executed on-demand at any time by a designated OpenFn admin user by clicking the "Run" button on a job in OpenFn.org. 
![Run Job](./run_job_now.png)


_**Flow 0: OSCaR ids --> Primero**_

`f0-j1-getOscarCases.js` sends a GET request to OSCaR to list cases where: 
<!--`GET ... ` -->
1. New cases have been created 

Example Request:
```
 GET /api/v1/organizations/clients?since_date='2020-07-01 01:00:00'
```

_**Flow 1: Primero cases --> OSCaR**_

<!--`GET ... ` -->
`f1-j1-getPrimeroCases.js` sends a GET request to Primero to list cases where: 
1. New referrals have been created (indicated by Primero _date_ field `transitions_created_at`).
2. Case updates made since the last OpenFn request, indicated by Primero _date/time_field `transitions_changed_at`. (Note: This happens if the case owner, case owner’s phone, case owner’s Agency, or the Service Implemented On fields are changed.) 

The OpenFn Primero adaptor is being used for this request. See the [adaptor docs](https://github.com/OpenFn/adaptors/tree/main/packages/primero) for helper functions and sample requests. 

### Trigger Type: Flow

Flow 2 is triggered by Flow 1 success. Once `f1-j2-casesToOscar.js` successfully runs, `f2-j1-getOscarCases.js` is automatically triggered to run. 

_**Flow 2: OSCaR cases --> Primero**_

`f2-j1-getOscarCases.js` sends a GET request to OSCaR to list cases where: 
<!--`GET ... ` -->
1. New external referrals have been created (indicated by OSCaR field `referred_external`). 
2. Case updates made since the last OpenFn request(indicated by OSCaR _date/time_ field `since_date`). 

Example Request:
```
 GET /api/v1/organizations/clients?since_date='2020-07-01 01:00:00'&referred_external=true
```
## (5) Data Sharing Protocols & Mappings
### Data Sharing Agreements
[See this folder](https://drive.google.com/drive/folders/1Wb_h0Dazt8socWRW7buR2IBNqW4Pft7_?usp=sharing) for copies of the data sharing agreements between the MoSVY and Cambodia (OSCaR user) agencies. 

[See this mapping specification](https://docs.google.com/spreadsheets/d/1Zg9KGkHbh0ptjpj4YX9qFkojz9ydJ9aVT_UtkvE7Wu8/edit#gid=744794061) for the data element mappings implemented in the interoperability solution. This includes detailed integration mappings for **Services** and **Primero Users/Case Owners**. 

### Data Entry Protocols
In order for data to be successfully exchanged as expected, users should follow the data entry protocols defined in the training sessions. For an overview of the data entry steps in both the OSCaR and Primero systems (see the below videos). If these data entry steps are _not_ followed and consent is _not_ provided in the Primero system, then these cases may not be eligible for case sharing and referrals between systems. **See the videos (above) for guidance**. 

## (6) Solution Assumptions 
#### 1. Unique Identifiers
OpenFn will perform `upsert()` (update if record exists, create if new) operations in both the Primero and OSCaR systems when syncing data. To ensure no duplicate cases are entered, OpenFn will use the below identifiers to check for existing cases. _We assume that these identifiers are unique_. 
   - OSCaR unique id: `global_id` (represented as `oscar_number` in Primero system)
   - Primero unique id: `case_id` (represented as `external_id` in OSCaR system)

#### 2. Referral Services 
- Service types are mapped between systems as defined in the [Service Map](https://docs.google.com/spreadsheets/d/1Zg9KGkHbh0ptjpj4YX9qFkojz9ydJ9aVT_UtkvE7Wu8/edit#gid=1841308930). _If any services change, this map and OpenFn jobs must be updated._
- For every 1 service created in the source system, 1 referral will be sent to the destination system
- When a service subtype is not selected in Primero, OpenFn will sync a default "not specified" service type to Oscar. Oscar requires the "service type" field so these services will always be rejected. See [training slides](https://docs.google.com/presentation/d/1FSCfgd9RUfjmZO_NZ2bsosbYBTn8--KHoR4cefVsmpw/edit#slide=id.g170fdd89002_0_123) for details. 
- Oscar case decision is automatically reflected on the first referral form. See [training slides](https://docs.google.com/presentation/d/1FSCfgd9RUfjmZO_NZ2bsosbYBTn8--KHoR4cefVsmpw/edit#slide=id.g128201f9a7d_0_117) for details. 

#### 3. Primero Case Owner Assignment
When cases are synced with Primero, they will be automatically assigned to a Province user case owner by OpenFn (see `owned_by` field in mappings). The Province will be determined by the location code of the child provided by OSCaR. See [Province User Map](https://docs.google.com/spreadsheets/d/1Zg9KGkHbh0ptjpj4YX9qFkojz9ydJ9aVT_UtkvE7Wu8/edit#gid=1502348153) for the list of generic Primero Province users. 

#### 4. Organization/ Agency names
Agency IDs and Names are mapped between systems assuming specific naming conventions (see below). Any new organizations/agencies should be registered following the same naming conventions, otherwise the OpenFn jobs may need to be updated.  
    - Oscar Organization Name: `'{organization_name}'` (e.g., `cif`)
    - Primero Agency ID: `'agency-{organization_name}'` (e.g., `agency-cif`)

## (7) Change Management (Considerations for Admins)
System administrators are responsible for identifying if changes may impact the OpenFn integration. 
1. Make use of change management [best practices](https://docs.google.com/presentation/d/1FSCfgd9RUfjmZO_NZ2bsosbYBTn8--KHoR4cefVsmpw/edit#slide=id.g16f7e3f7f71_0_42).
3. If login credentials are changed for either system, the relevant **Credential** must be updated in OpenFn.org. 
4. If system changes are made to any of the **fields** referenced in the [field mappings](https://docs.google.com/spreadsheets/d/1Zg9KGkHbh0ptjpj4YX9qFkojz9ydJ9aVT_UtkvE7Wu8/edit#gid=744794061), the OpenFn jobs should be reviewed and tested to confirm no impact on the integration. 
5. If the list of available **Agencies** or **Services** in either system changes, then the Administrator should review the [mapping document](https://docs.google.com/spreadsheets/d/1Zg9KGkHbh0ptjpj4YX9qFkojz9ydJ9aVT_UtkvE7Wu8/edit#gid=2080615206) to confirm no updates are required in the OpenFn Interoperability automation. 
6. If **new Agencies/ Organizations are created** in either system, OSCaR and Primero teams will coordinate to manually register the new agencies in each system (this is _not_ an automated process). Primero administrators will need to (1) add the new agency to the list of `Implementing Agencies` and create a new generic agency user (e.g., `agency-cif-user`). 
_Agency/Organization Ids should follow the below naming conventions, otherwise the OpenFn mappings may need to be updated_: 
    - Oscar Organization Name: `'{organization_name}'` (e.g., `cif`)
    - Primero Agency ID: `'agency-{organization_name}'` (e.g., `agency-cif`)

## (8) 2022 Primero V2 Upgrade 
This interoperability solution was originally implemented in 2020 to work with Primero V1. In 2022, it was updated by OpenFn team in partnership with UNICEF Cambodia and OSCaR/Children in Families core team, in order to ensure compatibility with the Primero V2 upgrade and new features available in this version. 

New jobs were written for V2 and the changes listed below were added to the solution. The original V1 OpenFn jobs were deprecated with this upgrade. 
- **Syncing of 2nd referrals** to enable caseworkers to send multiple referrals over time for 1 child
- **Syncing referral decisions** to “accept”/”reject” referrals and notify source systems
- **New field mappings:** `risk level` & `date of referral`
- Primero Service `Referral Status` field now has a default `Pending` value when creating services for outbound referrals
- Implemented change to not group Services in Primero by `service_type` and ensure 1 Primero Service record will exist for every new OSCaR service referred 

See links to the updated documentation below: 

- [V2 mapping specifications](https://docs.google.com/spreadsheets/d/1Zg9KGkHbh0ptjpj4YX9qFkojz9ydJ9aVT_UtkvE7Wu8/edit#gid=744794061)
- [V2 data flow diagrams](https://drive.google.com/file/d/14_Nk0xML9k_0mmtI__fNGASm-brXfn-7/view?usp=sharing)
- [V2 testing slides](https://docs.google.com/presentation/d/17X8NSJsPgQ4d6H74v2ecZAe9-23H6FrUyuIEgFyn6so/edit#slide=id.g1510cfdce24_0_0)
- [V2 training deck](https://docs.google.com/presentation/d/1FSCfgd9RUfjmZO_NZ2bsosbYBTn8--KHoR4cefVsmpw/edit#slide=id.g8c9d2ded25_0_193)


## (9) Administration
### Provisioning, Hosting, & Maintenance
This integration is hosted on [OpenFn.org](https://openfn.org/projects) with Primero SaaS. OpenFn will provide ongoing maintenance support to the MoSVY administrators managing OpenFn and Primero.  

### Support 
Contact **support@openfn.org** with any questions or troubleshooting support. 

**MoSVY Primero system administrators will be the primary contacts** responsible for ongoing integration monitoring and management:   
nheldarath8@gmail.com
sideth@childreninfamilies.org

#### Other Support Contacts
**UNICEF:**  
mkeng@unicef.org 		  
pkhauv@unicef.org   

**OSCaR:**  
sokly@childreninfamilies.org  
meas.kiry@childreninfamilies.org

### Training Materials

### V2 Training Materials 
- See the November 2022 [training presentation](https://docs.google.com/presentation/d/1FSCfgd9RUfjmZO_NZ2bsosbYBTn8--KHoR4cefVsmpw/edit#slide=id.g8c9d2ded25_0_193). 
- See the November 2022 [training video recording](https://drive.google.com/drive/folders/1bgAaSsER69etUdIUiT3aH5LBXWrOcn1d?usp=sharingM). 

### V1 Training Materials 
- Administrators: [See the video recording](https://youtu.be/-5-Y9ZrK-aQ) and [presentation](https://docs.google.com/presentation/d/1aUprT1CwnEWtIax_PGxsPspXdR3mPy78rj6qt92dxeI/edit?usp=sharing) from the December 2020 System Administrators training. This includes an overview of integration monitoring, error codes, and troubleshooting. 
- Case Workers: [See the training recording](https://youtu.be/9kSiY3Ld2bE) and the [IO User Guide](https://docs.google.com/document/d/1c2irTpsZaOIEGzQaP1_O6XaREobJPdxV914hoDPJ9Dg/edit?usp=sharing). 



