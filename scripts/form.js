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
const FORM_API =
  "https://dev.elevate-apis.shikshalokam.org/mentoring/v1/form/read";
let token;

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Usernamae :", function (userName) {
  rl.question("Password :", function (password) {
    rl.close();
    login(userName, password);
  });
});

const login = (userName, password) => {
  axios
    .post("https://dev.elevate-apis.shikshalokam.org/user/v1/account/login", {
      email: userName,
      password: password,
    })
    .then(async (res) => {
      token = _.get(res, "data.result.access_token");
      console.log(token)
      console.log('user-authenticated');
      await fetchAllForms();
    })
    .catch((err) => {
      console.log('un-authenticated-user')
      console.log(err);
    });
};

const fetchOptions = async (c) => {
  // console.log(c.name)
  try {
    let availableOptions = await axios.get(
      `https://dev.elevate-apis.shikshalokam.org/mentoring/v1/entity/read?type=${c.name}&deleted=false&status=ACTIVE`,
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

  // console.log(options);
};

const fetchAllForms = async () => {
  const availableFormsKey = Object.keys(availableForms);
  for (let i = 0; i < availableFormsKey.length; i++) {
    let currentFormConfig = availableForms[availableFormsKey[i]];
    let res = await axios.post(
      "https://dev.elevate-apis.shikshalokam.org/mentoring/v1/form/read",
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
      let res = await axios.post(
        "https://dev.elevate-apis.shikshalokam.org/mentoring/v1/form/update",
        body,
        {
          headers: {
            "X-auth-token": "bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(res.data);
    } catch (error) {
      console.log(error.response.data);
    }
  }
};
