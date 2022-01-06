import { Pipe, PipeTransform } from '@angular/core';
import { urlConstants } from '../core/constants/urlConstants';

@Pipe({
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {

  constructor() {}

  transform(value) {
    let htmlString = value.replace(
        "Terms of Use", 
        `<span style="color:blue;"><a style="color:blue;" href='${urlConstants.API_URLS.TERMS_OF_USE}'>Terms of Use</a></span>`
    );
    htmlString = htmlString.replace(
      "Privacy Policy", 
      `<span style="color:blue;"><a style="color:blue;" href='${urlConstants.API_URLS.PRIVACY_POLICY}'>Privacy Policy</a></span>`
    );
    return htmlString;
  }

}
