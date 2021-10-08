import { ValidationConstant } from 'src/app/services/validation/validation.constant';

export class ValidationConfig {

  config = {
    // Find Patient
    ProviderName: {
      required: { name: ValidationConstant.transaction.add.addTransaction.providerName.name }
    },
    SelectedCard: {
      required: { name: ValidationConstant.transaction.add.addTransaction.selectedCard.name }
    },
    PatientName: {
      required: { name: ValidationConstant.transaction.add.findPatient.patientName.name },
      maxlength: {
        name: ValidationConstant.transaction.add.findPatient.patientName.name,
        max: ValidationConstant.transaction.add.findPatient.patientName.maxLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.findPatient.patientName.name }
    },
    PatientEmail: {
      required: { name: ValidationConstant.transaction.add.findPatient.email.name },
      email: { name: ValidationConstant.transaction.add.findPatient.email.name },
      pattern: { name: ValidationConstant.transaction.add.findPatient.email.name },
      maxlength: {
        name: ValidationConstant.transaction.add.findPatient.email.name,
        max: ValidationConstant.transaction.add.findPatient.email.maxLength.toString()
      },
    },
    PatientCompanyName: {
      required: { name: ValidationConstant.transaction.add.findPatient.companyName.name },
      pattern: { name: ValidationConstant.transaction.add.findPatient.companyName.name },
      maxlength: {
        name: ValidationConstant.transaction.add.findPatient.companyName.name,
        max: ValidationConstant.transaction.add.findPatient.companyName.maxLength.toString()
      },
    },

    // Add Transaction
    TransactionType: {
      required: { name: ValidationConstant.transaction.add.addTransaction.transactionType.name }
    },
    CardHolderName: {
      required: { name: ValidationConstant.transaction.add.addTransaction.cardHolderName.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.cardHolderName.name,
        max: ValidationConstant.transaction.add.addTransaction.cardHolderName.maxLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.cardHolderName.name }
    },
    cardNumber: {
      required: { name: ValidationConstant.transaction.add.addTransaction.cardNumber.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.cardNumber.name,
        max: ValidationConstant.transaction.add.addTransaction.cardNumber.maxLength.toString()
      },
      cardNumber: { name: 'Card Number' },
    },
    CardType: {
      required: { name: ValidationConstant.transaction.add.addTransaction.cardType.name }
    },
    cardExpiry: {
      required: { name: ValidationConstant.transaction.add.addTransaction.cardExpiry.name },
      minlength: {
        name: ValidationConstant.transaction.add.addTransaction.cardExpiry.name,
        min: ValidationConstant.transaction.add.addTransaction.cardExpiry.minLength.toString()
      },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.cardExpiry.name,
        max: ValidationConstant.transaction.add.addTransaction.cardExpiry.maxLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.cardExpiry.name },
      expiryDate: { name: 'Expiry Date' },
    },
    CVV: {
      required: { name: ValidationConstant.transaction.add.addTransaction.cvv.name },
      minlength: {
        name: ValidationConstant.transaction.add.addTransaction.cvv.name,
        min: ValidationConstant.transaction.add.addTransaction.cvv.minLength.toString()
      },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.cvv.name,
        max: ValidationConstant.transaction.add.addTransaction.cvv.maxLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.cvv.name }
    },
    'TransactionDate': {
      required: { name: ValidationConstant.transaction.add.addTransaction.transactionDate.name },
      transactionDate: { name: 'Date' },
    },
    Amount: {
      required: { name: ValidationConstant.transaction.add.addTransaction.amount.name },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.amount.name }
      // amount: { name: ValidationConstant.transaction.add.addTransaction.amount.name},
      // amountpattern: { name: ValidationConstant.transaction.add.addTransaction.amount.name }
    },
    patientName: {
      required: { name: ValidationConstant.transaction.add.addTransaction.patientName.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.patientName.name,
        max: ValidationConstant.transaction.add.addTransaction.patientName.maxLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.patientName.name }
    },
    PayToTheOrderOf: {
      required: { name: ValidationConstant.transaction.add.addTransaction.payToTheOrderOf.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.payToTheOrderOf.name,
        max: ValidationConstant.transaction.add.addTransaction.payToTheOrderOf.maxLength.toString()
      }
    },
    routingNumber: {
      required: { name: ValidationConstant.transaction.add.addTransaction.routingNumber.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.routingNumber.name,
        max: ValidationConstant.transaction.add.addTransaction.routingNumber.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.transaction.add.addTransaction.routingNumber.name,
        min: ValidationConstant.transaction.add.addTransaction.routingNumber.minLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.routingNumber.name }
    },
    checkNumber: {
      required: { name: ValidationConstant.transaction.add.addTransaction.checkNumber.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.checkNumber.name,
        max: ValidationConstant.transaction.add.addTransaction.checkNumber.maxLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.checkNumber.name }
    },
    accountNumber: {
      required: { name: ValidationConstant.transaction.add.addTransaction.accountNumber.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.accountNumber.name,
        max: ValidationConstant.transaction.add.addTransaction.accountNumber.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.transaction.add.addTransaction.accountNumber.name,
        min: ValidationConstant.transaction.add.addTransaction.accountNumber.minLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.accountNumber.name }
    },
    institutionName: {
      required: { name: ValidationConstant.transaction.add.addTransaction.institutionName.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.institutionName.name,
        max: ValidationConstant.transaction.add.addTransaction.institutionName.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.transaction.add.addTransaction.institutionName.name,
        min: ValidationConstant.transaction.add.addTransaction.institutionName.minLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.institutionName.name }
    },
    AccountType: {
      required: { name: ValidationConstant.transaction.add.addTransaction.accountType.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.accountType.name,
        max: ValidationConstant.transaction.add.addTransaction.accountType.maxLength.toString()
      }
    },
    checkType: {
      required: { name: ValidationConstant.transaction.add.addTransaction.checkType.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.checkType.name,
        max: ValidationConstant.transaction.add.addTransaction.checkType.maxLength.toString()
      }
    },
    ConvenienceAmount: {
      required: { name: ValidationConstant.transaction.add.addTransaction.convenienceAmount.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.convenienceAmount.name,
        max: ValidationConstant.transaction.add.addTransaction.convenienceAmount.maxLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.convenienceAmount.name }
      // amount: { name: ValidationConstant.transaction.add.addTransaction.convenienceAmount.name },
      // amountpattern: { name: ValidationConstant.transaction.add.addTransaction.convenienceAmount.name }
    },
    TipAmount: {
      required: { name: ValidationConstant.transaction.add.addTransaction.tipAmount.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.tipAmount.name,
        max: ValidationConstant.transaction.add.addTransaction.tipAmount.maxLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.tipAmount.name }
      // amount: { name: ValidationConstant.transaction.add.addTransaction.tipAmount.name },
      // amountpattern: { name: ValidationConstant.transaction.add.addTransaction.tipAmount.name }
    },
    TaxPercent: {
      required: { name: ValidationConstant.transaction.add.addTransaction.taxPercent.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.taxPercent.name,
        max: ValidationConstant.transaction.add.addTransaction.taxPercent.maxLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.taxPercent.name }
      // amount: { name: ValidationConstant.transaction.add.addTransaction.taxAmount.name },
      // amountpattern: { name: ValidationConstant.transaction.add.addTransaction.taxAmount.name }
    },
    TaxAmount: {
      required: { name: ValidationConstant.transaction.add.addTransaction.taxAmount.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.taxAmount.name,
        max: ValidationConstant.transaction.add.addTransaction.taxAmount.maxLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.taxAmount.name }
      // amount: { name: ValidationConstant.transaction.add.addTransaction.taxAmount.name },
      // amountpattern: { name: ValidationConstant.transaction.add.addTransaction.taxAmount.name }
    },
    TotalAmount: {
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.amount.name,
        max: ValidationConstant.transaction.add.addTransaction.taxAmount.maxLength.toString()
      }
    },
    InvoiceNo: {
      required: { name: ValidationConstant.transaction.add.addTransaction.invoiceno.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.invoiceno.name,
        max: ValidationConstant.transaction.add.addTransaction.invoiceno.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.transaction.add.addTransaction.invoiceno.name,
        min: ValidationConstant.transaction.add.addTransaction.invoiceno.minLength.toString()
      },
      pattern: { name: 'Reference No' }
    },
    TransactionEmail: {
      required: { name: ValidationConstant.transaction.add.addTransaction.email.name },
      email: { name: ValidationConstant.transaction.add.addTransaction.email.name },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.email.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.email.name,
        max: ValidationConstant.transaction.add.addTransaction.email.maxLength.toString()
      },
    },
    SecCode: {
      required: { name: ValidationConstant.transaction.add.addTransaction.secCode.name },
    },

    // Address Details
    AddressLine1: {
      required: { name: ValidationConstant.transaction.add.addressDetails.addressLine1.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addressDetails.addressLine1.name,
        max: ValidationConstant.transaction.add.addressDetails.addressLine1.maxLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addressDetails.addressLine1.name }
    },
    AddressLine2: {
      maxlength: {
        name: ValidationConstant.transaction.add.addressDetails.addressLine2.name,
        max: ValidationConstant.transaction.add.addressDetails.addressLine2.maxLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addressDetails.addressLine2.name }
    },
    City: {
      required: { name: ValidationConstant.transaction.add.addressDetails.city.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addressDetails.city.name,
        max: ValidationConstant.transaction.add.addressDetails.city.maxLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addressDetails.city.name }
    },
    State: {
      required: { name: ValidationConstant.transaction.add.addressDetails.state.name }
    },
    Country: {
      required: { name: ValidationConstant.transaction.add.addressDetails.country.name },
    },
    PostalCode: {
      required: { name: ValidationConstant.patientAccount.add.postalCode.name },
      maxlength: {
        name: ValidationConstant.patientAccount.add.postalCode.name,
        max: ValidationConstant.patientAccount.add.postalCode.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.patientAccount.add.postalCode.name,
        min: ValidationConstant.patientAccount.add.postalCode.minLength.toString()
      },
      pattern: { name: ValidationConstant.patientAccount.add.postalCode.name }
    },
    Description: {
      required: { name: ValidationConstant.transaction.operation.description.name },
      maxlength: {
        name: ValidationConstant.transaction.operation.description.name,
        max: ValidationConstant.transaction.operation.description.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.transaction.operation.description.name,
        min: ValidationConstant.transaction.operation.description.minLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.operation.description.name }
    },
    Memo: {
      required: { name: ValidationConstant.transaction.add.addTransaction.memo.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.memo.name,
        max: ValidationConstant.transaction.add.addTransaction.memo.maxLength.toString()
      }
    },
    DiscountList: {
    },
    Discount: {
      required: { name: ValidationConstant.recurring.add.recurringPayment.discount.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.discount.name },
      Discount: { name: 'Discount' },
    },
    DiscountAmount: {
      required: { name: ValidationConstant.recurring.add.recurringPayment.discountAmount.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.discountAmount.name },
      DiscountAmount: { name: 'Discount Amount' },
    },
    RefundType: {
      required: { name: ValidationConstant.recurring.add.recurringPayment.refundType.name },
    },

    BankName: {
      required: { name: ValidationConstant.transaction.add.addTransaction.bankName.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.bankName.name,
        max: ValidationConstant.transaction.add.addTransaction.bankName.maxLength.toString(),
      },
    },
    NameOnAccount: {
      required: { name: ValidationConstant.transaction.add.addTransaction.nameOnAccount.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.nameOnAccount.name,
        max: ValidationConstant.transaction.add.addTransaction.nameOnAccount.maxLength.toString(),
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.nameOnAccount.name },
    },
    RoutingNo: {
      required: { name: ValidationConstant.transaction.add.addTransaction.routingNumber.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.routingNumber.name,
        max: ValidationConstant.transaction.add.addTransaction.routingNumber.maxLength.toString(),
      },
      minlength: {
        name: ValidationConstant.transaction.add.addTransaction.routingNumber.name,
        min: ValidationConstant.transaction.add.addTransaction.routingNumber.minLength.toString(),
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.routingNumber.name },
    },
    AccountNo: {
      required: { name: ValidationConstant.transaction.add.addTransaction.accountNumber.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.accountNumber.name,
        max: ValidationConstant.transaction.add.addTransaction.accountNumber.maxLength.toString(),
      },
      minlength: {
        name: ValidationConstant.transaction.add.addTransaction.accountNumber.name,
        min: ValidationConstant.transaction.add.addTransaction.accountNumber.minLength.toString(),
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.accountNumber.name },
    },
  };

  get Config() {
    return this.config;
  }

  constructor() {

  }
}
