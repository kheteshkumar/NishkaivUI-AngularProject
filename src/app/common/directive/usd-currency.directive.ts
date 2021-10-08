import { Directive, OnInit, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CommonService } from 'src/app/services/api/common.service';

@Directive({
  selector: '[usd-currency]'
})
export class UsdCurrencyDirective implements OnInit {
  inputCountry;
  symbolFormat;

  constructor(
    public el: ElementRef,
    public renderer: Renderer2,
    private currencyPipe: CurrencyPipe,
    private commonService: CommonService) { }

  ngOnInit() {
    this.getCountry();
  }

  getCountry() {
    const loggedInUserData = this.commonService.getLoggedInData();
    switch (loggedInUserData.contact.address.country) {
      case 1:
        this.inputCountry = 'USD';
        this.symbolFormat = /[$]/g;
        break;
      case 2:
        // this.inputCountry = 'CAD';
        // this.symbolFormat = /[CA$]/g;
        this.inputCountry = '';
        this.symbolFormat = /[$]/g;
        break;
      default:
        this.inputCountry = 'USD';
        this.symbolFormat = /[$]/g;
        break;
    }
    this.format(this.el.nativeElement.value, this.inputCountry);
  }

  @HostListener('keypress', ['$event']) keypress(event) {
    const regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
    const specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-'];
    if (specialKeys.indexOf(event.key) !== -1) { return; }
    const next: string = event.target.value.concat(event.key);
    if (next && !String(next).match(regex)) {
      event.preventDefault();
    }
  }

  @HostListener('blur', ['$event.target.value']) onInput(e: string) {
    this.format(e, this.inputCountry);
  }

  @HostListener('focus', ['$event.target.value']) onFocus(e: string) {
    if (e) {
      const split_val = e.split('.');
      const original_val = split_val[0].replace(/,/g, '').replace(this.symbolFormat, '');
      let appendValue;
      if (split_val.length > 1) {
        appendValue = (split_val[1] !== '00') ? original_val + '.' + split_val[1] : original_val;
      } else {
        appendValue = original_val;
      }
      this.renderer.setProperty(this.el.nativeElement, 'value', appendValue);
    }
  }

  format(val: string, inputCountry) {
    const formatVal = this.currencyPipe.transform(val, inputCountry);
    this.renderer.setProperty(this.el.nativeElement, 'value', formatVal);
  }
}
