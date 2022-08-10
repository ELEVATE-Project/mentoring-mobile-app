rm -rf node_modules
rm -rf www

rm package-lock.json && npm install


#!/bin/bash

rm android/app/build/outputs/apk/debug

ionic capacitor build android --release  --prod

cd android

./gradlew bundle

cd ..

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore mentoring-key.keystore android/app/build/outputs/bundle/release/app-release.aab mentoring-key