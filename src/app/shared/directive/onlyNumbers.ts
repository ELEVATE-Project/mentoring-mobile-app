import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
    selector: '[numberOnly]'
})
export class NumberOnlyDirective {
    private value: string;
    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2
    ) {
    }

    @HostListener('input', ['$event.target.value'])
    onInputChange(value: string) {
        const filteredValue: string = filterValue(value);
        this.updateTextInput(filteredValue, this.value !== filteredValue);
    }

    private updateTextInput(value: string, propagateChange: boolean) {
        this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);
        this.value = value;
    }
}

function filterValue(value): string {
    return value.replace(/[^0-9]*/g, '');
}
