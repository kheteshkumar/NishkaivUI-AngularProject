import {
  Directive,
  Input,
  TemplateRef,
  ElementRef,
  ViewContainerRef,
  HostListener,
  Renderer2,
  ViewChild,
  EventEmitter,
  Output
} from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  CdkOverlayOrigin,
  OverlayRef,
  Overlay,
  OverlayConfig,
  ConnectionPositionPair
} from '@angular/cdk/overlay';
import {
  map,
  distinctUntilChanged,
  debounceTime,
  mergeMap,
  filter,
  toArray
} from 'rxjs/operators';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Subject, from, pipe } from 'rxjs';

@Directive({
  selector: '[appAutoComplete][autofocus]'
})
export class AutoCompleteDirective {
  @Input('template') content: TemplateRef<any>;
  @Input() appAutoComplete: any[];
  @Input() autoCompleteWaitMs = 0;
  @Input() autoCompleteMinLength = 1;
  @Output() emitNewItem: EventEmitter<string> = new EventEmitter<string>();
  @Output() emitFilterValues: EventEmitter<any[]> = new EventEmitter<any[]>();
  private _portal: TemplatePortal<any>;
  public _overlayRef: OverlayRef;
  inputEventSubscription: Subject<any> = new Subject<any>();
  listenFunc: Function;
  matches: any[];
  private host: HTMLElement;
  private focused: Element;
  private autoFocus = true;
  isOpened = undefined;
  @Input() set autofocus(value) {
    this.autoFocus = coerceBooleanProperty(value);
  }

  constructor(
    private _orgin: ElementRef,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef,
    private _r2: Renderer2
  ) {
    this.host = _orgin.nativeElement;
    this.listenFunc = _r2.listen('document', 'click', (event: MouseEvent) => {
      if (this._orgin.nativeElement.contains(event.target)) {
        return;
      }
      this.OutsideClick();
    });
  }

  ngOnInit() {
    this.asyncAction();
    if (this.autoFocus && this.host && this.host !== this.focused) {
      setTimeout(() => this.host.focus());
    }
  }

  @HostListener('click')
  @HostListener('focus')
  focus = () => {
    this.toggle();
    if (this.autoCompleteMinLength === 0) {
      this.inputEventSubscription.next(this._orgin.nativeElement.value || '');
    }
  }

  @HostListener('input', ['$event'])
  oninput = (e) => {
    const _api = e.target;
    const _value: string = _api.value !== undefined ? _api.value : _api.textContent !== undefined ? _api.textContent : _api.innerText;
    if (_value.length >= this.autoCompleteMinLength) {
      this.emitInputValue(_value);
    } else {
     }
  }


  @HostListener('keyup', ['$event'])
  onchange = e => {
    const txtVal = this._orgin.nativeElement.value;

    // ESC KEY
    if (e.keyCode === 27) {
      this.OutsideClick();
    }

    // ENTER KEY
    if (e.keyCode === 13) {
      if (txtVal !== '') {
        this.emitNewItem.next(txtVal);
        this.hide();
      }
    }

    if (e.keyCode == 8) {
      if (txtVal.length < 1) {
        this.matches = this.appAutoComplete;
        this.emitFilterValues.next(this.matches);
      }
      if (txtVal.length === 0 && !this._overlayRef.hasAttached()) {
        this._overlayRef.attach(this._portal);
      }
    }
  }

  private emitInputValue = (param: any): void => { this.inputEventSubscription.next(param); };

  private asyncAction = (param?: any): void => {
    this.inputEventSubscription
      .pipe(debounceTime(this.autoCompleteWaitMs), distinctUntilChanged()
        , mergeMap((e) => {
          return from(this.appAutoComplete)
            .pipe(filter((f) => this.filterText(e, f)), toArray());
        })).subscribe((result) => this.finalSearchOperation(result));
  }


  private filterText = (e: string, f: any): any => {
    return f.name.toLowerCase().indexOf(e.toLowerCase()) >= 0;
  }

  private finalSearchOperation = (param: any): void => {
    this.matches = param;
    if (this.hasMatches()) {
      this.emitFilterValues.next(this.matches);
      if (!this._overlayRef.hasAttached()) {
        this._overlayRef.attach(this._portal);
      }
    } else {
      this.emitFilterValues.next([]);
      if (this.matches.length === 0) {
        this.hide();
      }
    }
  }

  private hasMatches = (param?: any): boolean => {
    return this.matches.length > 0;
  }

  get overlayRef(): OverlayRef {
    return this._overlayRef;
  }

  toggle = (param?: any): void => {
    if (this._overlayRef == null || !this._overlayRef.hasAttached()) {
      this.attchOverlay();
    }
  }

  private attchOverlay = (param?: any): void => {
    if (!this._overlayRef) {
      this.createOverlay();
      this.isOpened = true;
    }
    if (this._overlayRef.hasAttached() != undefined) {
      this._overlayRef.attach(this._portal);
      this.isOpened = true;
    }
  }

  private createOverlay = (param?: any): void => {
    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(this._orgin)
      .withPositions(this.getPositions())
      .withFlexibleDimensions(false)
      .withPush(false);

    const overlayRefConfig = new OverlayConfig({
      width: '100%',
      hasBackdrop: false,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      positionStrategy: positionStrategy
    });
    this._overlayRef = this._overlay.create(overlayRefConfig);
    this._portal = new TemplatePortal(this.content, this._viewContainerRef);
  }

  private getPositions(): ConnectionPositionPair[] {
    return [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
      }
    ];
  }

  public hide = (param?: any): void => {
    if (this._overlayRef) {
      this.overlayRef.detach();
      this.isOpened = false;
    }
  }

  private OutsideClick = () => {
    if (this._overlayRef) {
      this.hide();
      this.isOpened = false;
    }
  }
}