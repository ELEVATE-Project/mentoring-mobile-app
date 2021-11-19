const axios = require("axios");
const _ = require("../node_modules/lodash/");
const availableForms = {
  EDIT_PROFILE_FORM: {
    type: "profile",
    subType: "createProfile",
    action: "formFields",
    ver: "1.0",
    templateName: "defaultTemplate",
  },
};
let env = {
  dev: "https://dev.elevate-apis.shikshalokam.org",
  selected: null,
};
const LOGIN_API = "/user/v1/account/login";
const FORM_READ_API = "/mentoring/v1/form/read";
const FORM_UPDATE_API = "/mentoring/v1/form/update";
const ENTITY_READ_API = "/mentoring/v1/entity/read?"
let token;

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Usernamae :", function (userName) {
  rl.question("Password :", function (password) {
    rl.question("Enter Environment :", function (e) {
      rl.close();
      env.selected = e;
      if (!env[env.selected]) {
        console.log("Env not found");
        return;
      }
      login(userName, password);
    });
  });
});

const login = (userName, password) => {
  axios
    .post(env[env.selected] + LOGIN_API, {
      email: userName,
      password: password,
    })
    .then(async (res) => {
      token = _.get(res, "data.result.access_token");
      console.log(token);
      console.log("user-authenticated");
      fetchAllForms();
    })
    .catch((err) => {
      console.log("un-authenticated-user");
      console.log(JSON.stringify(err));
    });
};

const fetchOptions = async (c) => {
  // console.log(c.name)
  try {
    let availableOptions = await axios.get(
      env[env.selected] + ENTITY_READ_API +
        `type=${c.name}&deleted=false&status=ACTIVE`,
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
  const availableFormsKey = Object.keys(availableForms);
  for (let i = 0; i < availableFormsKey.length; i++) {
    let currentFormConfig = availableForms[availableFormsKey[i]];
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
      if (control.options) {
        let availableOptions = await fetchOptions(control);
        control.options = availableOptions;
      }
    }
    const body = _.omit(currentForm, ["_id", "updatedAt", "createdAt", "__v"]);

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
    }
  }
};
