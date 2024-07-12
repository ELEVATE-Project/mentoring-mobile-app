# Customizing the PWA

The Mentor PWA is developed using the Ionic framework. This document provides instructions on setting up the development environment.

Contents
---------------------

 * [Dependencies](#dependencies)
 * [Setting up the CLI](#setting-up-the-cli)
 * [Setting up the Project](#setting-up-the-project)
 * [Building the Application](#building-the-application)
 * [Debugging the Application](#debugging-the-application)
 * [Setting up the HashiCorp® Vault](#setting-up-the-hashicorp-vault)
 * [Creating a Jenkins® Job](#creating-a-jenkins-job)
 * [Deploying the Application Using an Ansible® Script](#deploying-the-application-using-an-ansible-script)
 * [Structure of Environment file, Server.js, and pm2.config.json](#structure-of-environment-file-serverjs-and-pm2configjson)

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

Setting up the CLI
------------------

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

Setting up the Project
----------------------

1. Clone the [repository](https://github.com/ELEVATE-Project/mentoring-mobile-app.git).
2. Change to the latest GitHub branch (**release-2.6.1**).
3. Add environment files into the src/environments folder.
4. Go to the project folder and run `npm i`.


Building the Application
------------------------

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

Debugging the Application
-------------------------

1. Open the running app in the browser.
2. Start inspecting using Chrome dev tools or any alternatives.

Setting up the HashiCorp Vault
------------------------------

After setting up the HashiCorp Vault, you must add the Vault address to the Jenkins Pipeline script and Ansible deployment script.

Creating a Jenkins Job
----------------------
To automate your app deployment using Jenkins, do as follows:

1. Create a Jenkins job each time you want a deployment. 

2. Add the pipeline script for the job inside the job’s **Configure** section. This pipeline will fetch the latest code from the given branch in the repository and run the [Ansible script](#deploying-the-application-using-an-ansible-script).

    ```
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
    ```

Deploying the Application Using an Ansible Script
-------------------------------------------------

To build and deploy the application using an Ansible script, do as follows:

1. Add an Ansible script to the **deployment** folder in the root folder of your project.

   >**Note**: Update the script with details (such as paths) that are specific to your project.  
    
    ```
    - hosts: <your-host>
       vars:
       project_path: <path-to-the-project-in-server>
       root_path: <path-to-the-parent-folder-of-project>
       //Add variables here if needed. (Remove this line in your code)
      tasks:
        - name: Slurp host file
          slurp:
            src: "<path-to-hashicorp-vault-token>"
          register: slurpfile
        - name: Run the HashiCorp Vault credentials
          shell: "curl --location --request GET '{{ vaultAddress }}mentored-portal' --header 'X-Vault-Token: {{ slurpfile['content'] | b64decode }}' | jq '.data' > '{{root_path}}/data2.json'"
          register: vaultCurl
        - name: Change directory
          shell: cd {{project_path}}
        - name: Fetch the latest code
          git:
            repo: https://github.com/ELEVATE-Project/mentoring-mobile-app
            dest: "{{project_path}}"
            version: "{{gitBranch}}"
            force: yes
        - name: Update npm
          shell: cd {{project_path}} && npm i --force
        - name: Set permission
          shell: chmod 744 {{ project_path }}/src/scripts/json2env.sh
        - name: Generate .env
          shell: cat {{root_path}}/data2.json | jq '.data' > {{ project_path }}/src/environments/environment.ts && sed -i '1s/^/export const environment = \n/' {{ project_path }}/src/environments/environment.ts
          register: envConfig
        - debug: msg=" cred {{ envConfig }} "
        - name: Change directory
          shell: chdir {{project_path}}
        - name: Fetch pm2 config file
          shell: "curl --location --request GET '{{ vaultAddress }}portalPm2Config' --header 'X-Vault-Token: {{ slurpfile['content'] | b64decode }}' | jq '.data.data' > '{{ project_path }}/pm2.config.json'"
          register: pm2
        - name: Change directory
          shell: cd {{project_path}}
        - name: Remove www folder
          shell: rm -rf www
        - name: Build pwa app
          shell: cd {{project_path}} && ionic build --prod
        - name: Start pm2
          shell: cd {{project_path}} && pm2 start pm2.config.json
    ```

3. Add the script's path to the [Jenkins Pipeline script](#creating-a-jenkins-job). When you run the Jenkins job, the script is executed.

4. To convert the JSON file that was fetched from the HashiCorp Vault to an env format, add the following script to ```/src/scripts/json2env.sh.```:

    ```
    #!/bin/sh

    tr -d '\n' |
    grep -o '"[A-Za-z\_][A-Za-z_0-9]\+"\s*:\s*\("[^"]\+"\|[0-9\.]\+\|true\|false\|null\)' |
    sed 's/"\(._\)"\s_:\s\*"\?\([^"]\+\)"\?/\1= "\2"/'
    ```

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
