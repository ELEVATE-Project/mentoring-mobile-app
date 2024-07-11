import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'snakeCaseToUpperCase'
})
export class snakeCaseToUpperCasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    // Split the string by underscores
    const words = value.split('_');

    // Capitalize the first letter of each word
    const capitalizedWords = words.map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });

    // Join the words with a space
    return capitalizedWords.join(' ');
  }
}
