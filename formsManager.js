const axios = require("axios");

const authToken = process.env.AUTH_TOKEN;
const apiUrl = process.env.API_URL;

const forms = require("./forms.json");

const createForm = async (form) => {
  try {
    const response = await axios.post(
      `${apiUrl}/mentoring/v1/form/create`,
      form,
      { headers: { 'X-auth-token': `bearer ${authToken}` } }
    );
    if(response){
        console.log("Form created successfully:", response.data);
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
    }
  } catch (error) {
    console.error("Error updating form:", error);
  }
};

const createOrUpdateForms = async () => {
  for (const form of forms) {
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
};

createOrUpdateForms();