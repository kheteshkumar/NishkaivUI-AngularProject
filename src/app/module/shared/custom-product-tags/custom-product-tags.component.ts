import { Component, OnInit, EventEmitter, Input, Output, ViewChild, SimpleChanges, HostListener, OnChanges } from "@angular/core";
import { AutoCompleteDirective } from 'src/app/common/directive/auto-complete.directive';
import { ProductService } from 'src/app/services/api/product.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';

@Component({
  selector: 'app-custom-product-tags',
  templateUrl: './custom-product-tags.component.html',
  styleUrls: ['./custom-product-tags.component.scss']
})
export class CustomProductTagsComponent implements OnInit, OnChanges {
  data: any[] = [];
  flag = true;
  showInput = false;
  chips = [];
  filterData = [];
  item;
  overlayModalFlag = false;
  duplicateTagError;
  duplicateTagErrorFlag = false;
  @Input() InputData;
  @Output() emitter: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild(AutoCompleteDirective) overlayEle: AutoCompleteDirective;
  @Output() OutputData = new EventEmitter;
  @Input() closeFlag;
  toastData: any;
  isLoader = false;
  checkOnEnterClickFlag = false;
  dropdownSelectFlag = false;

  constructor(private productService: ProductService,
    private toasterService: ToasterService) { }

  ngOnInit() {
    this.getAllTagList();
  }

  focusOutEvent(event) {
    if (event.relatedTarget === null || (event.relatedTarget && event.relatedTarget.nodeName !== 'BUTTON')) {
      setTimeout(() => {
        if (!this.checkOnEnterClickFlag && event.target.value && !this.dropdownSelectFlag) {
          this.addNewItem(event.target.value);
          this.showInput = false;
          this.flag = true;
          if (this.overlayEle !== undefined && this.overlayEle.isOpened !== undefined && this.overlayEle.isOpened) {
            this.overlayEle.hide();
          }
        }
      }, 100);
    }
  }

  inputFocusEvent(event) {
    this.dropdownSelectFlag = false;
  }

  @HostListener('click', ['$event'])
  outsideClickFun = (e) => {
    if (e.target.type !== 'text' && this.overlayEle !== undefined && this.overlayEle.isOpened !== undefined && this.overlayEle.isOpened) {
      this.overlayEle.hide();
      this.showInput = false;
      this.flag = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('closeFlag' in changes) {
      this.closeOverlay();
      this.showInput = false;
      this.flag = true;
    }
  }

  closeOverlay() {
    if (this.overlayEle) {
      this.overlayEle.hide();
      this.overlayModalFlag = false;
      this.OutputData.emit(this.overlayModalFlag);
    }
  }

  getAllTagList() {
    this.isLoader = true;
    this.productService.getAllLookupTags().subscribe((res: any) => {
      if (this.InputData.tagData !== undefined && this.InputData.tagData.tags !== undefined) {
        this.InputData.tagData.tags.forEach((ele) => {
          ele.name = ele.name;
          ele.id = ele.id;
        });
        const selTags = Object.assign([], this.InputData.tagData.tags);
        this.chips = selTags;
        this.data = this.getfiltertedTags(res, selTags);
        this.filterData = this.data;
        this.isLoader = false;
      } else {
        this.data = res;
        this.filterData = this.data;
        this.isLoader = false;
      }
    },
      error => {
        const toastMessage = Exception.exceptionMessage(error);
        this.toastData = this.toasterService.error(toastMessage.join(', '));
        this.isLoader = false;
      });
  }

  getfiltertedTags(arr1, arr2) {
    const uniques = arr1.filter(o => !arr2.find(o2 => o.id === o2.id));
    return uniques;
  }

  showAutocomplete() {
    this.showInput = true;
    this.flag = false;
    this.item = '';
    this.filterData = this.data;
    this.duplicateTagErrorFlag = false;
    this.overlayModalFlag = true;
    this.OutputData.emit(this.overlayModalFlag);
  }

  /* autocomplete search */
  selectedItem = (val) => {
    this.dropdownSelectFlag = true;
    this.chips.push(val);
    this.removeItems(this.data, val);
    this.showComp();
    this.filterData = this.data;
    this.item = '';
    this.duplicateTagErrorFlag = false;
  }

  addNewItem = (val) => {
    const allTagsList = this.data.concat(this.chips);
    const duplicateName = allTagsList.some((ele) => {
      return (ele.name).toLowerCase() === val.trim().toLowerCase();
    });
    this.duplicateTagErrorFlag = (duplicateName) ? true : false;
    if (!duplicateName) {
      const obj = { id: 0, name: val };
      this.chips.push(obj);
      this.emitter.emit(obj.name);
    } else {
      this.duplicateTagError = MessageSetting.product.duplicateTag;
      return false;
    }
  }

  filterItems = (items) => {
    this.filterData = items;
  }

  /* remove tag item */
  closeItem = (val) => {
    this.duplicateTagErrorFlag = false;
    if (val.id !== 0) {
      this.data.push(val);
    }
    this.removeItems(this.chips, val);
    this.showComp();
    this.filterData = this.data;
    if (this.overlayEle) {
      this.overlayEle.hide();
    }
  }

  removeItems(arr: string[], val: string) {
    const index = arr.indexOf(val);
    if (index > -1) {
      arr.splice(index, 1);
    }
  }

  checkOnenter(e) {
    if (e.keyCode === 13) {
      this.checkOnEnterClickFlag = true;
      if (e.target.value) {
        this.showComp();
        this.item = '';
        this.filterData = this.data;
      }
    } else {
      this.checkOnEnterClickFlag = false;
    }
  }

  showComp() {
    this.showInput = false;
    this.flag = true;
  }

  sendSelectedTagList() {
    this.dropdownSelectFlag = true;
    if (this.item) {
      this.addNewItem(this.item);
      this.showInput = false;
      this.flag = true;
    }
    return this.chips;
  }
}
