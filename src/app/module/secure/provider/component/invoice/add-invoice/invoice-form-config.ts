import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/api/common.service';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';

export class InvoiceFormConfig {

    addValidationConstant = ValidationConstant.invoice.add;

    constructor(private commonService?: CommonService) { }

    config = {
        'PatientName': {
            required: { name: this.addValidationConstant.patientName.name },
            pattern: { name: this.addValidationConstant.patientName.name }
        },
        'ToEmail': {
            required: { name: this.addValidationConstant.toEmail.name },
            pattern: { name: this.addValidationConstant.toEmail.name }
        },
        'CCEmail': {
            required: { name: this.addValidationConstant.ccEmail.name },
            pattern: { name: this.addValidationConstant.ccEmail.name }
        },
        'Phone': {
            required: { name: this.addValidationConstant.phone.name },
            maxlength: {
                name: this.addValidationConstant.phone.name,
                max: this.addValidationConstant.phone.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.phone.name,
                min: this.addValidationConstant.phone.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.phone.name }
        },
        'Product_ServiceName': {
            required: { name: this.addValidationConstant.product_ServiceName.name },
            pattern: { name: this.addValidationConstant.product_ServiceName.name }
        },
        'SubTotal': {
            required: { name: this.addValidationConstant.subTotal.name },
            pattern: { name: this.addValidationConstant.subTotal.name }
        },
        'DiscountType': {
            required: { name: this.addValidationConstant.discountType.name },
            pattern: { name: this.addValidationConstant.discountType.name }
        },
        'DiscountPercentage': {
            required: { name: this.addValidationConstant.discountPercentage.name },
            pattern: { name: this.addValidationConstant.discountPercentage.name }
        },
        'DiscountAmount': {
            required: { name: this.addValidationConstant.discountAmount.name },
            pattern: { name: this.addValidationConstant.discountAmount.name }
        },
        'TaxPercentage': {
            required: { name: this.addValidationConstant.taxPercentage.name },
            maxlength: {
                name: this.addValidationConstant.taxPercentage.name,
                max: this.addValidationConstant.taxPercentage.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.taxPercentage.name,
                min: this.addValidationConstant.taxPercentage.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.taxPercentage.name }
        },
        'TaxAmount': {
            required: { name: this.addValidationConstant.taxAmount.name },
            pattern: { name: this.addValidationConstant.taxAmount.name }
        },
        'TotalAmount': {
            required: { name: this.addValidationConstant.totalAmount.name },
            pattern: { name: this.addValidationConstant.totalAmount.name }
        },
        'Note': {
            required: { name: this.addValidationConstant.note.name },
            pattern: { name: this.addValidationConstant.note.name }
        },
        'InvoiceDate': {
            required: { name: this.addValidationConstant.invoiceDate.name }
        },
        'DueDate': {
            required: { name: this.addValidationConstant.dueDate.name }
        },
        'VisitDate': {
            required: { name: this.addValidationConstant.visitDate.name }
        },
        'ServiceDate': {
            required: { name: this.addValidationConstant.serviceDate.name }
        },
        'DueInDays': {
            required: { name: this.addValidationConstant.dueInDays.name }
        },
        'InvoiceNo': {
            required: { name: this.addValidationConstant.invoiceNo.name }
        },
        'PONo': {
            required: { name: this.addValidationConstant.poNo.name },
            maxlength: {
                name: this.addValidationConstant.poNo.name,
                max: this.addValidationConstant.poNo.maxLength.toString()
            },
        },
        'DoctorId': {
            required: { name: this.addValidationConstant.doctorId.name },
            isActiveDoctor: { name: this.addValidationConstant.isActiveDoctor.name },
        },
        'NoOfTimes': {
            required: { name: this.addValidationConstant.noOfTimes.name },
            pattern: { name: this.addValidationConstant.noOfTimes.name },
            numberLimitPattern: { name: this.addValidationConstant.noOfTimes.name }
        },
        'Frequency': {
            required: { name: this.addValidationConstant.frequency.name }
        },
        'StartDate': {
            required: { name: this.addValidationConstant.startDate.name }
        },
        'PatientInsuranceId': {
            required: { name: this.addValidationConstant.patientInsuranceId.name },
            pattern: { name: this.addValidationConstant.patientInsuranceId.name }
        },
        'AutoClaim': {
            required: { name: this.addValidationConstant.startDate.name }
        },


    };

    addInvoiceForm = {
        'PatientName': ['', [Validators.required]],
        'ToEmail': ['', [Validators.pattern(ValidationConstant.email_regex)]],
        'CCEmail': ['', [
            Validators.required, Validators.pattern(ValidationConstant.email_regex)]
        ],
        'InvoiceDate': ['', []],
        'DueDate': ['', []],
        'VisitDate': ['', []],
        'ServiceDate': ['', []],
        'DueInDays': [AppSetting.defaultDueInDaysForInvoice, []],
        'InvoiceNo': ['', []],
        'Note': [MessageSetting.invoice.memo, []],
        'DoctorId': ['', [Validators.required]],
        'AutoClaim': [false, [Validators.required]],
        'Frequency': ['0', []],
        'StartDate': [null, []],
        'NoOfTimes': [{ value: '1', disabled: true }, [Validators.pattern(ValidationConstant.numberOfPayments_regexForInstallmentNew)]],
        'PatientInsuranceId': ['', []],
        'SubTotal': [0, [Validators.required]],
        'DiscountType': [1, [Validators.required]],
        'DiscountPercentage': [0, [Validators.pattern(ValidationConstant.percentage_regex)]],
        'DiscountAmount': [0, [Validators.pattern(ValidationConstant.amount_regex)]],
        'TaxPercentage': [0, [Validators.pattern(ValidationConstant.percentage_regex)]],
        'TaxAmount': [0, [Validators.pattern(ValidationConstant.amount_regex)]],
        'TotalAmount': [0, [Validators.required]],
        'Product_ServiceName': ['', []]
    };

    get Config() {
        return this.config;
    }

    get invoiceForm() {
        return this.addInvoiceForm;
    }

}
