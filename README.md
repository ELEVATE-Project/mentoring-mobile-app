CONTENTS OF THIS FILE
---------------------

 * Dependencies
 * Ionic-Android build Setup
 * Cli setup
 * Project setup
 * Build apk
 * Debug apk


DEPENDENCIES
---------------------
* Ionic:

   Ionic CLI                     : 6.19.1 (/usr/local/lib/node_modules/@ionic/cli)
   Ionic Framework               : @ionic/angular 6.1.7
   @angular-devkit/build-angular : 13.2.6
   @angular-devkit/schematics    : 13.2.6
   @angular/cli                  : 13.2.6
   @ionic/angular-toolkit        : 6.1.0

* Capacitor:

   Capacitor CLI      : 3.5.1
   @capacitor/android : 3.5.0
   @capacitor/core    : 3.5.1
   @capacitor/ios     : 3.5.0

* Cordova:

   Cordova CLI       : 11.0.0
   Cordova Platforms : none
   Cordova Plugins   : no whitelisted plugins (0 plugins total)

* Utility:

   cordova-res : 0.15.4
   native-run  : 1.6.0

* System:

   Android SDK Tools : 26.1.1 (/home/afnan/Android/Sdk)
   NodeJS            : v14.19.0 (/usr/local/bin/node)
   npm               : 6.14.16
   OS                : Linux 5.13


IONIC-ANDROID BUILD SETUP
---------------------

- [Install java] (https://www.oracle.com/java/technologies/downloads/#java8)
- [Install Gradle] (https://gradle.org/install/)
- [Install Android Studio] (https://developer.android.com/studio)

- After Android studio installation, install SDK
- Open Android studio and goto settings/appearance and behavior/system settings/Android SDK
- Install appropriate Android sdk platform package.
- Add environment variables in ~/.bashrc or ~/.bash_profile as follows
        export ANDROID_SDK_ROOT=path_to_sdk
        export PATH=$PATH:$ANDROID_SDK_ROOT/tools/bin
        export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools
- Reference: https://ionicframework.com/docs/installation/android


CLI SETUP
---------------------

- `npm install -g ionic`   
- `npm install @capacitor/core`   
- `npm install @capacitor/cli --save-dev` 
- `npx cap init` 


PROJECT SETUP
---------------------

- git clone the repo (https://github.com/ELEVATE-Prjoect/mentoring-mobile-app.git)
- Add environment files inside src/environments
- Go to project folder and run npm i

BUILD APK
---------------------

- To check attached devices do adb devices
- Run ionic build (Make sure you have attached device)
- Run ionic cap sync
- Run ionic capacitor run android --prod
- Apk location project_folder/platforms/android/app/build/outputs/apk/debug/apk_name.apk


DEBUG APK
---------------------

- Open chrome and enter chrome://inspect
- Select app