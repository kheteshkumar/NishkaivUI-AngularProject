import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/api/common.service';
import { PractitionerValidation } from 'src/app/common/validation/validation';

export class ClaimsFormConfig {

    addValidationConstant = ValidationConstant.claims.add;

    constructor(private commonService?: CommonService) { }

    config = {

        'PatientId': {
            required: { name: this.addValidationConstant.patientId.name },
            pattern: { name: this.addValidationConstant.patientId.name }
        },
        'PatientInsuranceId': {
            required: { name: this.addValidationConstant.patientInsuranceId.name },
            pattern: { name: this.addValidationConstant.patientInsuranceId.name }
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
        'ServiceDate': {
            required: { name: this.addValidationConstant.serviceDate.name }
        },
    };

    addClaimsForm = {

        'PatientName': ['', []],
        'PatientId': ['', [Validators.required]],
        'PatientInsuranceId': ['', [Validators.required]],
        'Frequency': ['0', [Validators.required]],
        'StartDate': [null, [Validators.required]],
        'NoOfTimes': [{ value: '1', disabled: true }, [
            Validators.required,
            Validators.pattern(ValidationConstant.numberOfPayments_regexForInstallmentNew)
        ]],
        'ServiceDate': [null, [Validators.required]],
        'DoctorId': ['', [Validators.required]],
        'CheckClaimNow': [false, []],
    };

    get Config() {
        return this.config;
    }

    get claimsForm() {
        return this.addClaimsForm;
    }

}
