# DynamicFormComponent

## Selector: app-dynamic-form

##

#### Usage

```HTML
<app-dynamic-form [jsonFormData]="formData" #form1></app-dynamic-form>
```

#### Supported form fields

- Text(type="text")
- Number(type="number")
- Password(type="password")
- Email(type="email")
- Search(type="search")
- Telephone(type="tel")
- Url(type="url")
- Chip(type="chip")

#### Inputs and outputs

- @Input() jsonFormData
- @ViewChild('form1') form1: DynamicFormComponent;(Use in Parent)
- - To Submit form : this.form1.submit() 
- - To Reset form :  this.form1.reset()

@Input() jsonFormData

```json
{
  "controls": [
    {
      "name": "firstName",
      "label": "First name:",
      "value": "",
      "class": "ion-margin",
      "type": "text",
      "position": "floating",
      "validators": {
        "required": true,
        "minLength": 10
      }
    },
    {
      "name": "lastName",
      "label": "Last name:",
      "class": "ion-margin",
      "value": "",
      "type": "text",
      "position": "floating",
      "validators": {}
    },
    {
      "name": "roles",
      "label": "Select your role",
      "class": "ion-margin",
      "value": "",
      "type": "chip",
      "position": "",
      "disabled": false,
      "showSelectAll": true,
      "validators": {
        "required": true
      },
      "options": [
        {
          "value": "deo",
          "label": "District education officer"
        },
        {
          "value": "beo",
          "label": "Block education officer"
        },
        {
          "value": "hm",
          "label": "Head Master"
        }
      ]
    },
    {
      "name": "date",
      "label": "Date of birth:",
      "class": "ion-margin",
      "value": "",
      "displayFormat": "DD/MM/YY",
      "type": "date",
      "position": "floating",
      "validators": {
        "required": true
      }
    },
    {
      "name": "comments",
      "label": "Comments",
      "class": "ion-margin",
      "value": "",
      "type": "textarea",
      "position": "floating",
      "validators": {}
    },
    {
      "name": "agreeTerms",
      "label": "This is a checkbox?",
      "class": "ion-margin",
      "value": "false",
      "type": "checkbox",
      "validators": {
        "required": true
      }
    },
    {
      "name": "size",
      "label": "",
      "class": "ion-margin",
      "value": "",
      "type": "range",
      "options": {
        "min": "0",
        "max": "100",
        "step": "1",
        "icon": "sunny"
      },
      "validators": {}
    },
    {
      "name": "lightDark",
      "label": "Do you like toggles?",
      "class": "ion-margin",
      "value": "false",
      "type": "toggle",
      "validators": {}
    },
    {
      "name": "assessmentType",
      "label": "Select assessment type",
      "class": "ion-margin",
      "value": "",
      "type": "select",
      "multiple": true,
      "validators": {},
      "options": [
        {
          "label": "Observation",
          "value": "observation"
        },
        {
          "label": "Survey",
          "value": "survey"
        }
      ]
    }
  ]
}
```

@Output() formSubmitEvent

```javascript
{
  agreeTerms: true;
  assessmentType: ['survey'];
  comments: "I want to be a mentor";
  date: "1992-11-20T10:59:03.967+05:30"
  firstName: "foo";
  lastName: "bar";
  lightDark: false;
  roles: (2) ['deo', 'beo']
  size: 66;
}
```

#### Validators

| Type          | Job                                                                                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| min           | Validator that requires the control's value to be greater than or equal to the provided number.                                                                                                                     |
| max           | Validator that requires the control's value to be less than or equal to the provided number.                                                                                                                        |
| required      | Validator that requires the control have a non-empty value.                                                                                                                                                         |
| requiredTrue  | Validator that requires the control's value be true. This validator is commonly used for required checkboxes.                                                                                                       |
| email         | Validator that requires the control's value pass an email validation test.                                                                                                                                          |
| minLength     | Validator that requires the length of the control's value to be greater than or equal to the provided minimum length. It is intended to be used only for types that have a numeric length property, such as strings |
| maxLength     | Validator that requires the length of the control's value to be less than or equal to the provided maximum length. It is intended to be used only for types that have a numeric length property, such as strings    |
| pattern       | Validator that requires the control's value to match a regex pattern.                                                                                                                                               |
| nullValidator | Validator that performs no operation.                                                                                                                                                                               |
