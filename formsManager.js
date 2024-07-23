const axios = require("axios");
const { error } = require("console");
const fs = require("fs");
const path = require("path");

const authToken = process.env.AUTH_TOKEN;
const apiUrl = process.env.API_URL;

const args = process.argv.slice(2);
const actionsApplicable = ["skip", "update","create"]

const formsFilePath = path.resolve(__dirname, "./forms.json");
let forms = require(formsFilePath);

const createForm = async (form) => {
  try {
    const response = await axios.post(
      `${apiUrl}/mentoring/v1/form/create`,
      form,
      { headers: { 'X-auth-token': `bearer ${authToken}` } }
    );
    if(response){
        console.log("Form created successfully:", response.data);
        form.action = "skip";
    }
  } catch (error) {
    console.error("Error creating form:", error);
  }
};

const updateForm = async (form) => {
  try {
    const response = await axios.put(
      `${apiUrl}/mentoring/v1/form/update`,
      form,
      { headers: { 'X-auth-token': `bearer ${authToken}` } }
    );
    if(response){
        console.log("Form updated successfully:", response.data);
        form.action = "skip";
    }
  } catch (error) {
    console.error("Error updating form:", error);
  }
};

const saveFormsToFile = () => {
  fs.writeFile(formsFilePath, JSON.stringify(forms, null, 2), (err) => {
    if (err) {
      console.error("Error saving forms to file:", err);
    } else {
      console.log("Forms saved to file successfully.");
    }
  });
};

const createOrUpdateForms = async () => {
  for (const form of forms) {
    if(!!args[0] && actionsApplicable.includes(args[0])){
      form.action = args[0];
    }else if(!!args[0] && !actionsApplicable.includes(args[0])){
      throw error("Invalid argument applied => ",args[0])
    }
    try {
      switch (form.action) {
        case "skip":
          console.log("Skipping form with type", form.type );
          break;
        case "update":
          await updateForm(form);
          break;
        case "create":
          await createForm(form);
          break;
        default:
          console.log("Unknown action for form with type", form.type);
      }
    } catch (error) {
      console.error("Error processing form with type", form.type, ":", error);
    }
  }
  saveFormsToFile();
};

createOrUpdateForms();