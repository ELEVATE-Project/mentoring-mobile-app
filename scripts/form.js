// Script will update the options fields inside each form.

{
  /*to run from node env execute below command inside ./script folder terminal
// node -e 'require("./form.js")()'*/
}

{
  /* 
to skip the script during build remove below hook from config.xml
<hook type="before_emulate" src="scripts/form.js" />   */
}

{
  // requirements
  // 1. all forms to update should have controls key which hold all fields.
  // 2. only those fields which have options key will get updated.
  // 3. options are fetched from entity api where type == control.name. i.e control name and entity type should exists
}

var deferral;
const axios = require("axios");
const _ = require("../node_modules/lodash/");
const readline = require("readline");

// add all form config to update on build
const availableForms = {
  EDIT_PROFILE_FORM: {
    type: "profile",
    subType: "createProfile",
    action: "formFields",
    ver: "1.0",
    templateName: "defaultTemplate",
  },
};

//env
let env = {
  dev: "https://dev.elevate-apis.shikshalokam.org",
  selected: null, // to set selected env from terminal
};
// apis
const LOGIN_API = "/user/v1/account/login";
const FORM_READ_API = "/mentoring/v1/form/read";
const FORM_UPDATE_API = "/mentoring/v1/form/update";
const ENTITY_READ_API = "/mentoring/v1/entity/read?";
let token;

// login and get token
// need to get only one credential with update permission, not all credential should able to update
const login = (userName, password) => {
  axios
    .post(env[env.selected] + LOGIN_API, {
      email: userName,
      password: password,
    })
    .then(async (res) => {
      token = _.get(res, "data.result.access_token");
      // console.log(token);
      console.log("user-authenticated");
      fetchAllForms(); // initial fn to trigger form-update
    })
    .catch((err) => {
      console.log("❌ un-authenticated-user");
      console.log(JSON.stringify(err));
    });
};

const fetchOptions = async (control) => {
  try {
    let availableOptions = await axios.get(
      env[env.selected] +
        ENTITY_READ_API +
        `type=${control.name}&deleted=false&status=ACTIVE`,
      {
        headers: {
          "X-auth-token": "bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );
    return _.get(availableOptions, "data.result");
  } catch (error) {
    console.log(error);
  }
};

const fetchAllForms = async () => {
  const availableFormsKey = Object.keys(availableForms); // array of availableForms key
  for (let i = 0; i < availableFormsKey.length; i++) {
    let currentFormConfig = availableForms[availableFormsKey[i]];
    //read one form
    let res = await axios.post(
      env[env.selected] + FORM_READ_API,
      currentFormConfig,
      {
        headers: {
          "X-auth-token": "bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );
    let currentForm = _.get(res, "data.result");
    let controls = _.get(currentForm, "data.fields.controls");
    for (const control of controls) {
      // loop all controls of the current form
      if (control.options) {
        // run only for control with options key present
        // fetch option for the control
        let availableOptions = await fetchOptions(control);
        control.options = availableOptions; // assign new options
      }
    }
    const body = _.omit(currentForm, ["_id", "updatedAt", "createdAt", "__v"]); // omit keys before update

    try {
      let res = await axios.post(env[env.selected] + FORM_UPDATE_API, body, {
        headers: {
          "X-auth-token": "bearer " + token,
          "Content-Type": "application/json",
        },
      });
      console.log(res.data);
    } catch (error) {
      console.log(error.response.data);
      if (!error.response.data.message.includes("Form already exists")) {
        // if previous form == current form
        deferral.reject("❌ Form update failed"); // process exits if one form update fails
      }
    }
  }
  deferral.resolve(); // resolve after all availableForms are looped and updated
};

module.exports = function (ctx) {
  deferral = require("q").defer();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("📢 form update started");

  rl.question("📧 Usernamae :", function (userName) {
    rl.question("🕵️‍♀️ Password :", function (password) {
      rl.question("🌍 Environment :", function (e) {
        rl.close();
        env.selected = e;
        if (!env[env.selected]) {
          console.log("❌ Environment not found");
          return;
        }
        login(userName, password);
      });
    });
  });
  return deferral.promise;
};
