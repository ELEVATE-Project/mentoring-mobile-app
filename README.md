# Customizing the PWA

Contents
---------------------

 * Dependencies
 * Command-line setup
 * Project setup
 * Build Mentor
 * Debug Mentor
 * HashiCorp Vault setup
 * Jenkins Pipeline
 * Ansible Deployment Script
 * Environment files, Server.js, and pm2.config.json


Dependencies
------------

| Requirement         | Description    |
|--------------|-----------|
| Ionic CLI|Version 7.1.1 (/usr/local/lib/node_modules/@ionic/cli)|
| Ionic Framework | <ul><li>@ionic/angular 6.7.5</li> <li>@angular-devkit/build-angular : 13.2.6 </li><li> @angular-devkit/schematics : 13.2.6 </li><li>@angular/cli : 13.2.6 </li><li> @ionic/angular-toolkit : 6.1.0 </li></ul>|
| Capacitor | <ul><li>Capacitor CLI : 5.5.1 </li><li>@capacitor/android : 5.5.1 </li><li>@capacitor/core : 5.5.1 </li><li>@capacitor/ios : 5.5.1 </li></ul>|
| Cordova | <ul><li>Cordova CLI : 11.0.0</li><li>Cordova Platforms : none</li><li>Cordova Plugins : no whitelisted plugins (0 plugins total)</li></ul>|
| Utility | <ul><li>cordova-res : 0.15.4</li><li>native-run : 1.7.4 </li></ul>
| System | <ul><li>Android SDK Tools : 26.1.1</li><li><a href="https://nodejs.org/">Node.js®</a>: v18.18.2</li><li>npm: 10.2.0</li><li>OS : Linux 5.13</li></ul>|

CLI Setup
---------

1. Install the Ionic framework.

    ```
    npm install -g ionic
    ```

2. Install the Ionic client.

    ```
    npm install -g @ionic/cli
    ```

3. Install the Capacitor Core.

    ```
    npm install @capacitor/core
    ```

4. Install the Capacitor runtime Client.

    ```
    npm install @capacitor/cli --save-dev 
    ```

Project Setup
-------------

1. Clone the [repository](https://github.com/ELEVATE-Project/mentoring-mobile-app.git).
2. Change to the latest GitHub branch (**release-2.5.0**).
3. Add environment files into the src/environments folder.
4. Go to the project folder and run `npm i`.


Build Mentor
--------------

1. To add the Capacitor plugin, run the following command:

    ```
    npx cap sync  

    ```

2. To run a development build, run the following command:

    ```
    ionic build

    ```

3. To perform an Ionic build and update any Capacitor plugins or dependencies, run the capacitor sync command.  

    ```
    ionic cap sync

    ```

4. Run the project on your local system using the following command:

    ```
    ionic serve

    ```

Debug Mentor
--------------

1. Open the running app in the browser.
2. Start inspecting using Chrome dev tools or any alternatives.

HashiCorp Vault Setup
---------------------


Jenkins Pipeline
----------------

For automating your app deployment, you can use Jenkins. You can create a Jenkins job and run that job each time you want a deployment.
For that you can create a Jenkins job and add a pipeline script for the job inside the job’s ‘Configure’ section. For example, see below.

   pipeline { agent any
      options {
         disableConcurrentBuilds()
            }
      stages {
         stage("git"){
               steps{
                  
                  git branch: '<branch-name>', url: '<github-repo-url>'
               }
               
         }
         stage("ansible run"){
               steps{
                  
                     ansiblePlaybook becomeUser: 'jenkins', 
                     credentialsId:’your-cred-id’, 
                     extras: "-e vaultAddress=<your-hashicorp-vault-address> -e gitBranch=<git-branch>", 
                     installation: 'ansible', 
                     inventory: '<path-to-your-inventory>', 
                     playbook: '<path-to-your-ansible-script>'
               }
               
         }
   }
   }

This pipeline will help to fetch the latest code from the given branch in repo and run the ansible script which we are about to create for building and deploying our application.

Ansible Deployment Script
-------------------------

Add an ansible script inside the ‘deployment’ folder in the root folder of your project. And add that path in your jenkins pipeline. When you run the job in jenkins, this script will get executed step by step till the end. Please update all the necessary details in the following example:

   - hosts: “<your-host>”
   vars:
   project_path: <path-to-the-project-in-server>
   root_path: <path-to-the-parent-folder-of-project>
   //Add variables here if needed. (Remove this line in your code)
   tasks:
   - name: Get the token for Hashicorp vault
      slurp:
      src: "<path-to-hashicorp-vault-token>"
      register: slurpfile
   - name: Run vault credentials and get the environment related secrets stored in hashicorp vault
      shell: "curl --location --request GET '{{ vaultAddress }}<environment-files-folder-name>' --header 'X-Vault-Token: {{ slurpfile['content'] | b64decode }}' | jq '.data' > '{{root_path}}/data2.json'"
      register: vaultCurl
   - name: Change directory
      shell: cd {{project_path}}
   - name: Fetch the latest code
      git:
      repo: git-url
      dest: "{{project_path}}"
      version: "{{gitBranch}}"
      force: yes
   - name: Update npm
      shell: cd {{project_path}} && npm i --force
   - name: Set permission
      shell: chmod 744 {{ project_path }}/src/scripts/json2env.sh
   - name: Generate .env and store it in environment folder
      shell: cat {{root_path}}/data2.json | jq '.data' > {{ project_path }}/src/environments/environment.ts && sed -i '1s/^/export const environment = \n/' {{ project_path }}/src/environments/environment.ts
      register: envConfig
   - debug: msg=" cred {{ envConfig }} "
   - name: Change directory
      shell: chdir {{project_path}}
   - name: Fetch pm2 config file from Hashicorp vault
      shell: "curl --location --request GET '{{ vaultAddress }}<pm2-config-file-folder>' --header 'X-Vault-Token: {{ slurpfile['content'] | b64decode }}' | jq '.data.data' > '{{ project_path }}/pm2.config.json'"
      register: pm2
   - name: Change directory
      shell: cd {{project_path}}
   - name: Remove www folder
      shell: rm -rf www
   - name: Build pwa app to deploy
      shell: cd {{project_path}} && ionic build --prod
   - name: Start pm2 with pm2 config file and finish deployment
      shell: cd {{project_path}} && pm2 start pm2.config.json


Please remove all the unwanted lines.

You also have to add a script inside /src/scripts/json2env.sh


   #!/bin/sh

   tr -d '\n' |
   grep -o '"[A-Za-z\_][A-Za-z_0-9]\+"\s*:\s*\("[^"]\+"\|[0-9\.]\+\|true\|false\|null\)' |
   sed 's/"\(._\)"\s_:\s\*"\?\([^"]\+\)"\?/\1= "\2"/'

This script will convert the fetched data from hashicorp to env files.



Structure of Environment file, Server.js, and pm2.config.json
-------------------------------------------------------------

For deploying your application, you need an Environment file, Server.js, and a pm2.config.json file.

### Structure of environment.ts File

 ```jsx
   export const environment = {
      production: true / false,
      name: "<name>",
      staging: true / false,
      dev: true / false,
      baseUrl: "<base-url>",
      sqliteDBName: "<db-name> (if you have)",
      deepLinkUrl: "<deeplink-url>",
      privacyPolicyUrl: "<privacy-policy-url>",
      termsOfServiceUrl: "<term-of-service-url>",
   };
```

### Structure of pm2.config.json File

```json
   {
   "apps": [
      {
      "name": "<APP_NAME>",
      "script": "server.js",
      "args": [],
      "instances": "1",
      "exec_mode": "cluster",
      "watch": false,
      "merge_logs": true,
      "env": {
         "NODE_ENV": "production",
         "PORT": <PORT_NO>
      }
      }
   ]
   }
```

### Structure of Server.js File

```jsx
   const express = require('express');
   const path = require('path');
   const app = express();
   const port = process.env.PORT || 7601;


   app.use(express.static(path.join(__dirname, 'www')));


   app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'www', 'index.html'));
   });


   app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
   });
```


PROJECT SETUP WITH DOCKER
---------------------
Please follow the steps below to run the application using Docker:
* Clone the repository from GitHub using the following command: 
    ```bash
    git clone https://github.com/ELEVATE-Prjoect/mentoring-mobile-app.git
    ```
* Checkout to the latest branch, which is currently release-2.5.0.
* Navigate back from the mentoring-mobile-app folder and create an environment.ts file. Copy and paste the environment variables provided below into this file:
    ```bash
    // This file can be replaced during build by using the `fileReplacements` array.
    // `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
    // The list of file replacements can be found in `angular.json`.
    
    export const environment = {
      production: true,
      name: 'debug environment',
      staging: false,
      dev: false,
      baseUrl: 'http://localhost:3569', //backend node application url
      sqliteDBName: 'mentoring.db',
      deepLinkUrl: 'https://mentored.shikshalokam.org',
      privacyPolicyUrl:'https://shikshalokam.org/mentoring/privacy-policy',
      termsOfServiceUrl:'https://shikshalokam.org/mentoring/term-of-use'
    };
    
    
    /*
     * For easier debugging in development mode, you can import the following file
     * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
     *
     * This import should be commented out in production mode because it will have a negative impact
     * on performance if an error is thrown.
     */
    // import 'zone.js/dist/zone-error';  // Included with Angular CLI.
    ```
 * Navigate to the mentoring-mobile-app directory, Open the docker-compose.yml file and within the docker-compose.yml file, locate the volumes section.
 * In the docker-compose.yml file, replace <exact-path> with the exact file path of the environment.ts file in your system under the volumes section
     ```bash
     volumes:
      - <exact-path>/environment.ts:/app/src/environments/environment.ts
     ```
 * Run Docker using the following command:
    ```bash
    cd mentoring-mobile-app
    docker-compose -f docker-compose.yml up
    ```
 * To stop Docker, use the following command:
    ```bash
    docker-compose -f docker-compose.yml down
    ```