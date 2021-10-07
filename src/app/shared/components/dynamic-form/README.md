# DynamicFormComponent
## Selector: app-dynamic-form
##
#### Usage
```HTML
<app-dynamic-form [jsonFormData]="formData" (formSubmitEvent)="submitForm($event)"></app-dynamic-form>
```
#### Supported form fields

- Text(type="text")
- Number(type="number")
- Password(type="password")
- Email(type="email")
- Search(type="search")
- Telephone(type="tel")
- Url(type="url")

#### Inputs and outputs

- @Input() jsonFormData 
- @Output() formSubmitEvent


@Input() jsonFormData 
```json
{
  "controls": [
    {
      "name": "firstName",
      "label": "First name:",
      "value": "",
      "type": "text",
      "validators": {
        "required": true,
        "minLength": 10
      }
    },
    {
      "name": "lastName",
      "label": "Last name:",
      "value": "",
      "type": "text",
      "validators": {}
    },
    {
      "name": "comments",
      "label": "Comments",
      "value": "",
      "type": "textarea",
      "validators": {}
    },
    {
      "name": "agreeTerms",
      "label": "This is a checkbox?",
      "value": "false",
      "type": "checkbox",
      "validators": {}
    },
    {
      "name": "size",
      "label": "",
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
      "value": "false",
      "type": "toggle",
      "validators": {}
    }
  ]
}

```

@Output() formSubmitEvent
```javascript
{
    agreeTerms: true
    comments: "I want to be a mentor"
    firstName: "foo"
    lastName: "bar"
    lightDark: false
    size: 66
}
```
#### Validators
| Type | Job |
| ------ | ------ |
| min | Validator that requires the control's value to be greater than or equal to the provided number.|
| max |Validator that requires the control's value to be less than or equal to the provided number.|
| required | Validator that requires the control have a non-empty value.|
| requiredTrue | Validator that requires the control's value be true. This validator is commonly used for required checkboxes. |
| email | Validator that requires the control's value pass an email validation test.|
| minLength | Validator that requires the length of the control's value to be greater than or equal to the provided minimum length. It is intended to be used only for types that have a numeric length property, such as strings |
| maxLength | Validator that requires the length of the control's value to be less than or equal to the provided maximum length. It is intended to be used only for types that have a numeric length property, such as strings  |
| pattern |Validator that requires the control's value to match a regex pattern. |
| nullValidator | Validator that performs no operation.|



