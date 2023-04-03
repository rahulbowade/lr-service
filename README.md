# Architecture overview
![UP-HRH-Auth](https://user-images.githubusercontent.com/30565750/210239617-c51801e5-73d4-49b9-a473-2426bd2b5d82.jpg)

### This service is the `BFF` service from the Architecture Diagram

[Postman Collection](https://api.postman.com/collections/17248210-81d16297-21ec-4100-96c2-a8375d30230f?access_key=PMAT-01GR22Q4K663YDVJ19N84NY2QA)

Steps to run the application

1. `npm i`
2. `npm i -g pm2`
3. `cp sample.env .env`
4. Edit the `.env` file according to your configuration of keycloak and other vars accordingly.
```
This will run the service in background on the server. Allow ports accordingly if you want it to be accessible on internet.
```
3. `pm2 start npm --name "lr-service" -- start`

Service will start on PORT 5000

Notes
------

Student and teacher have not username and password associated with it, so they both have `/register` endpoints and institutes only have `/login` endpoints. Please go through the postman collection shared above. 


Reference for Architecture
-----------------------------

`Auth Backend Wrapper` - [casa-user-data-service](https://github.com/UPHRH-platform/casa-user-data-service.git)

`Keycloak in CASA upgarded` - [casa-keycloak](https://github.com/UPHRH-platform/casa-keycloak.git)

`Login and Registration Service - BFF` - [lr-service](https://github.com/UPHRH-platform/lr-service.git)

`Registry Sunbird-RC` - [upsmf-registry](https://github.com/UPHRH-platform/upsmf-registry.git)

NOTE: Hasura - CRUD and Regsitry compliant is not needed

### Details on .env file

```bash
# CASA KEYCLOAK ENV VARS 
# Set CASA Keyclaok using https://github.com/UPHRH-platform/casa-keycloak
# Change http://localhost:8080 to your deployment instance
ACCESS_TOKEN_URI_CASA=http://localhost:8080/realms/master/protocol/openid-connect/token

# Create an application in CASA keycloak and provide creds in base64 format 
ENCODED_CLIENTID_CLIENTSECRETS_CASA=bHItc2VydmljZTpIVmx6NFprR2hCeGgzemtuZmc0SlVyZmQ4TW04cUhveA==
INFO_URI_CASA=http://localhost:8080/realms/master/protocol/openid-connect/userinfo

# Deploy Sunbird RC - https://docs.sunbirdrc.dev/use/setup-the-backend and edit BASE URL of following vars accordingly
BASE_URI_RC=http://64.227.184.175:8081/api/v1/

# RC's keycloak URI
ACCESS_TOKEN_URI_RC=http://localhost:34199/auth/realms/sunbird-rc/protocol/openid-connect/token

# Default client ID
RC_CLIENTID=cmVnaXN0cnktZnJvbnRlbmQ=
ADMIN_ACCESS_TOKEN_URL=http://localhost:34199/auth/realms/master/protocol/openid-connect/token
RC_RESET_PASSWORD_BASE_URL=http://localhost:34199/auth/admin/realms/sunbird-rc/users/
ADMIN_USERNAME=admin
ADMIN_PASS=admin
ADMIN_USER_INFO_URL=http://localhost:34199/auth/admin/realms/sunbird-rc/users


# PRIVATE casa-user-data-service URI --> https://github.com/UPHRH-platform/casa-user-data-service PORT 3000
TUTOR_DATA_CASA_BASE_URI=http://localhost:3000/tutor/
STUDENT_DATA_CASA_BASE_URI=http://localhost:3000/student/
```
