export class ValidationConstant {

  static email_regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  static url_regex = '(http(s)?://|)(www\\.)([^\\.]+)\\.(\\w{2}|(com|net|org|edu|int|mil|gov|arpa|biz|aero|name|coop|info|pro|museum|co))$';
  static emailWithCommaSeperation = /^((?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]),?)+$/;
  static charactersOnlyWithSpace_regex = '^[a-zA-Z]+([a-zA-Z ]+)*$';
  static alphanumeric_regex = '^[a-zA-Z0-9]*$';
  static alphanumericWithSpace_regex = '^[a-zA-Z0-9]+([a-zA-Z0-9 ]+)*$';
  static charactersOnlyWithoutSpace = '^[a-zA-Z]+$';
  static numbersOnly_regex = '^[0-9]*$';
  //static duration_regex = '(1[5-9]|[2-9][0-9]|[1-3][0-9]{2}|4[0-7][0-9]|480)'; //15min -480
  static duration_newregex = '^([1-9]|[1-8][0-9]|9[0-9]|[1-3][0-9]{2}|4[0-7][0-9]|480)$' //1-480
  // Need to check alternative regex for "allow everything except space"
  static spaceNotAccepted_regex =
    '^[a-zA-Z0-9~!@#$%^&*()_+{}|:"<>?`\\-=\\[\\]\\\\;\',./]+([a-zA-Z0-9~!@#$%^&*()_+{}|:"<>?`\\-=\\[\\]\\\\;\',./ \r\n|\r|\n]+)*$';
  //static postalcode_regex = /^(?!00000)(?<zip>(?<zip5>\d{5})(?:[ -](?=\d))?(?<zip4>\d{4})?)$/;
  static postalcode_regex = /(^\d{5}$)|(^\d{5}\d{4}$)/;
  static expiration_regex = /(^((0[1-9])|(1[0-2]))[\/\.\-]*((19)|(2[0-9]))$)/;
  static numberOfPayments_regexForSubscription = "^(?:[1-9][0-9]{3}|[1-9][0-9]{2}|[1-9][0-9]|[1-9])$";

  static numberOfPayments_regexForInstallment = '^(36[0]|3[0-5][0-9]|[12][0-9][0-9]|[1-9]?[0-9])?$';
  static numberOfPayments_regexForInstallmentNew = '^(0?[1-9]|[1-9][0-9])$';
  // First Name, Last Name, Patient Name, Name on Card, Card Holder Name, Pay To The Order Of
  static firstNameLastName_regex = '^[a-zA-Z]+([a-zA-Z ,.\'-]+)*$';
  static ssn_regex = '^([0-9*]{9})*$'
  static AppCount_regex = '^[1-9][0-9]?$|^100$';
  static amount_regex = '^([0-9]{1,5})(\\.[0-9]{1,2})?$';
  // static amount_regex = '^\\d{0,9}(\\.\\d{1,2})?$';
  static dob_regex = '^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$';
  static invoiceNo_regex = /^[^&?=]+$/;
  static percentage_regex = '(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)';
  static numberOfPayments_regex = '^([0-5]?[0-9]|60)$';
  static amount_regex_amountGreaterThanZero = new RegExp(/^(?=.*[1-9])\d{0,9}(?:\.\d{0,2})?$/);
  static subTotal_regex_amountGreaterThanZero = new RegExp(/^(?=.*[1-9])\d{0,5}(?:\.\d{0,2})?$/); //accept till 5 digit
  static password_regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[&?#$_!@^%])[A-Za-z\d@$!%*#?&]{8,}$/;
  static common = {
    title: { name: 'Title', minLength: 5, maxLength: 50 },
    firstName: { name: 'First Name', minLength: 5, maxLength: 50 },
    middleName: { name: 'Middle Name', minLength: 5, maxLength: 50 },
    lastName: { name: 'Last Name', minLength: 5, maxLength: 50 },
    companyName: { name: 'Company Name', maxLength: 50, minLength: 5 },
    department: { name: 'Department', maxLength: 50, minLength: 5 },
    fax: { name: 'Fax', maxLength: 20, minLength: 10 },
    countryCode: { name: 'Country Code', maxLength: 10, minLength: 2 },
    phone: { name: 'Phone', maxLength: 12, minLength: 10, mask_minLength: 10, mask_maxLength: 10 },
    alternatePhone: { name: 'Alternate Phone', maxLength: 10, minLength: 5 },
    mobile: { name: 'Mobile', maxLength: 50, minLength: 5 },
    email: { name: 'Email', maxLength: 256, minLength: 5 },
    url: { name: 'URL', maxLength: 50, minLength: 5 },
    addressLine1: { name: 'Address Line 1', maxLength: 50, minLength: 5 },
    addressLine2: { name: 'Address Line 2', maxLength: 50, minLength: 5 },
    city: { name: 'City', maxLength: 50, minLength: 5 },
    state: { name: 'State', maxLength: 50 },
    country: { name: 'Country', maxLength: 50 },
    postalCode: { name: 'Postal (Zip) Code', maxLength: 10, minLength: 5 },

    invoiceNo: { name: 'Invoice No', minLength: 1, maxLength: 16 },
    date: { name: 'Date' },
    startDate: { name: 'Start Date' },
    endDate: { name: 'End Date' },
    amount: { name: 'Amount' },
    customerName: { name: 'Customer Name', minLength: 1, maxLength: 50 },
    status: { name: 'Status' },
    paymentFor: { name: 'Payment For', minLength: 1, maxLength: 50 },
    description: { name: 'Description', minLength: 5, maxLength: 1000 },
  };

  static login = {
    username: { name: 'Username', maxLength: 50, minLength: 7 },
    password: { name: 'Password', maxLength: 50, minLength: 8 },
    authcode: { name: 'Auth Code', maxLength: 8, minLength: 8 }
  };

  static forgotPassword = {
    username: { name: 'Username', maxLength: 50, minLength: 7 }
  };
  static forgotUsername = {
    email: { name: 'Email', maxLength: 256, minLength: 5 }
  };

  static resetPassword = {
    oldPassword: { name: 'Old Password', maxLength: 50, minLength: 8 },
    newPassword: { name: 'New Password', maxLength: 50, minLength: 8 },
    confirmPassword: { name: 'Confirm Password', maxLength: 50, minLength: 8 },
    termsOfUse: { name: 'Website Terms of Use' },
    privacyPolicy: { name: 'Privacy Policy' },
    acceptUsePolicy: { name: 'Acceptable Use Policy' },
    hipaaAuthorization: { name: 'HIPAA Authorization' }

  };

  static changePassword = {
    oldPassword: { name: 'Old Password', maxLength: 50, minLength: 8 },
    newPassword: { name: 'New Password', maxLength: 50, minLength: 8 },
    confirmPassword: { name: 'Confirm Password', maxLength: 50, minLength: 8 }
  };

  static forms = {
    add: {
      title: { name: 'Title', maxLength: 50, minLength: 5 },
      isEditable: { name: 'Provider Edit Access' },
    },
  }

  static facility = {
    add: {
      facilityName: { name: 'Facility Name', maxLength: 50, minLength: 5 },
      title: { name: 'Title', maxLength: 50, minLength: 5 },
      branchName: { name: 'Branch Name', maxLength: 50, minLength: 5 },
      phone: { name: 'Phone', maxLength: 10, minLength: 10 },
      email: { name: 'Email', maxLength: 256, minLength: 5 },
      url: { name: 'URL', maxLength: 50, minLength: 5 },
      addressLine1: { name: 'Address Line 1', maxLength: 30, minLength: 5 },
      addressLine2: { name: 'Address Line 2', maxLength: 50, minLength: 5 },
      city: { name: 'City', maxLength: 50, minLength: 5 },
      state: { name: 'State', maxLength: 50 },
      country: { name: 'Country', maxLength: 50 },
      postalCode: { name: 'Postal (Zip) Code', maxLength: 10, minLength: 5 },
      timeZone: { name: 'Time Zone', maxLength: 50 },
    },
    find: {
      facilityName: { name: 'Facility Name', maxLength: 50, minLength: 5 },
      branchName: { name: 'Branch Name', maxLength: 50, minLength: 5 },
      phone: { name: 'Phone', maxLength: 10, minLength: 10 },
      email: { name: 'Email', maxLength: 256 },
      status: { name: 'Status' },

    }
  };
  static provider = {
    add: {
      providerCompany: { name: 'Provider Company', maxLength: 50, minLength: 5 },
      NpiNumber: { name: 'NPI Number', minLength: 10, maxLength: 10 },
      providerAdminUserName: { name: 'Admin Username', maxLength: 50, minLength: 7 },
      title: { name: 'Title', maxLength: 50, minLength: 5 },
      firstName: { name: 'First Name', maxLength: 50, minLength: 5 },
      middleName: { name: 'Middle Name', maxLength: 50 },
      lastName: { name: 'Last Name', maxLength: 50, minLength: 5 },
      companyName: { name: 'Company Name', maxLength: 50, minLength: 5 },
      phone: { name: 'Phone', maxLength: 10, minLength: 10 },
      email: { name: 'Email', maxLength: 256, minLength: 5 },
      url: { name: 'URL', maxLength: 50, minLength: 5 },
      addressLine1: { name: 'Address Line 1', maxLength: 30, minLength: 5 },
      addressLine2: { name: 'Address Line 2', maxLength: 50, minLength: 5 },
      city: { name: 'City', maxLength: 50, minLength: 5 },
      state: { name: 'State', maxLength: 50 },
      timezone: { name: 'TimeZone' },
      country: { name: 'Country', maxLength: 50 },
      facilityName: { name: 'Facility Name', maxLength: 50 },
      postalCode: { name: 'Postal (Zip) Code', maxLength: 10, minLength: 5 },
      timeZone: { name: 'Time Zone', maxLength: 50 },
      providerName: { name: 'Provider Name', maxLength: 50, minLength: 5 },
      merchantKey: { name: 'Provider Access Key', maxLength: 50, minLength: 8 },
      taxId: { name: 'Tax Id', minLength: 0, maxLength: 50 },
    },
    find: {
      firstName: { name: 'First Name', maxLength: 50, minLength: 5 },
      lastName: { name: 'Last Name', maxLength: 50, minLength: 5 },
      companyName: { name: 'Company Name', maxLength: 50, minLength: 5 },
      phone: { name: 'Phone', maxLength: 10, minLength: 10 },
      email: { name: 'Email', maxLength: 256 },
      city: { name: 'City', maxLength: 50 },
      postalCode: { name: 'Postal (Zip) Code', maxLength: 10 },
      providerName: { name: 'Provider Name', maxLength: 50, minLength: 5 },
      channelType: { name: 'Channel Type', maxLength: 50, minLength: 5 },
      paymentType: { name: 'Payment Type', maxLength: 50, minLength: 5 },
      transactionVolumeType: { name: 'Transaction Volume Type', maxLength: 50, minLength: 5 },
      month: { name: 'Month', maxLength: 50, minLength: 5 },
    }
  };
  static user = {
    add: {
      providerCompany: { name: 'Provider Company', maxLength: 50, minLength: 5 },
      userAdminUserName: { name: 'Admin Username', maxLength: 50, minLength: 7 },
      title: { name: 'Title', maxLength: 50, minLength: 5 },
      firstName: { name: 'First Name', maxLength: 50, minLength: 5 },
      middleName: { name: 'Middle Name', maxLength: 50 },
      lastName: { name: 'Last Name', maxLength: 50, minLength: 5 },
      companyName: { name: 'Company Name', maxLength: 50, minLength: 5 },
      phone: { name: 'Phone', maxLength: 10, minLength: 10 },
      email: { name: 'Email', maxLength: 256, minLength: 5 },
      url: { name: 'URL', maxLength: 50, minLength: 5 },
      addressLine1: { name: 'Address Line 1', maxLength: 30, minLength: 5 },
      addressLine2: { name: 'Address Line 2', maxLength: 50, minLength: 5 },
      city: { name: 'City', maxLength: 50, minLength: 5 },
      state: { name: 'State', maxLength: 50 },
      country: { name: 'Country', maxLength: 50 },
      facilityName: { name: 'Facility Name', maxLength: 50 },
      postalCode: { name: 'Postal (Zip) Code', maxLength: 10, minLength: 5 },
      timeZone: { name: 'Time Zone', maxLength: 50 },
      userName: { name: 'Username', maxLength: 50, minLength: 5 },
      merchantKey: { name: 'Provider Access Key', maxLength: 50, minLength: 8 },
      role: { name: 'User Role', maxLength: 50, minLength: 8 }
    },
    find: {
      firstName: { name: 'First Name', maxLength: 50, minLength: 5 },
      lastName: { name: 'Last Name', maxLength: 50, minLength: 5 },
      companyName: { name: 'Company Name', maxLength: 50, minLength: 5 },
      phone: { name: 'Phone', maxLength: 10, minLength: 10 },
      email: { name: 'Email', maxLength: 256 },
      city: { name: 'City', maxLength: 50 },
      postalCode: { name: 'Postal (Zip) Code', maxLength: 10 },
      providerName: { name: 'Provider Name', maxLength: 50, minLength: 5 },
    }
  };
  static transaction = {
    add: {
      findPatient: {
        patientName: { name: 'Patient Name', maxLength: 50, minLength: 5 },
        email: { name: 'Email', maxLength: 256, minLength: 5 },
        companyName: { name: 'Company Name', maxLength: 50, minLength: 5 },
      },
      addTransaction: {
        providerName: { name: 'Provider Name', maxLength: 50 },
        selectedCard: { name: 'Card', maxLength: 50 },
        taxPercent: { name: 'Tax Percent', maxLength: 5 },
        patientName: { name: 'Patient Name', maxLength: 50 },
        cardHolderName: { name: 'Card Holder Name', maxLength: 50 },
        cardNumber: { name: 'Card Number', maxLength: 19 },
        cardType: { name: 'Card Type' },
        cardExpiry: { name: 'Card Expiry', minLength: 4, maxLength: 4 },
        cvv: { name: 'CVV', minLength: 3, maxLength: 4 },
        amount: { name: 'Amount', maxLength: 9 },
        convenienceAmount: { name: 'Convenience Amount', maxLength: 50 },
        tipAmount: { name: 'Tip Amount', maxLength: 50 },
        taxAmount: { name: 'Tax Amount', maxLength: 50 },
        discount: { name: 'Discount' },
        discountAmount: { name: 'Discount Amount' },
        totalAmount: { name: 'Total Amount', maxLength: 9 },
        transactionType: { name: 'Transaction Type', maxLength: 50 },
        invoiceno: { name: 'Reference No', maxLength: 25, minLength: 1 },
        email: { name: 'Email', maxLength: 256 },
        payToTheOrderOf: { name: 'Payee Name', maxLength: 50 },
        routingNumber: { name: 'Routing/Transit No', maxLength: 9, minLength: 9 },
        checkNumber: { name: 'Check No', maxLength: 50 },
        accountNumber: { name: 'Account No', minLength: 4, maxLength: 50 },
        institutionName: { name: 'Name of Institution', minLength: 2, maxLength: 50 },
        accountType: { name: 'Account Type', maxLength: 50 },
        checkType: { name: 'Check Type', maxLength: 50 },
        secCode: { name: 'SEC Code', maxLength: 50 },
        memo: { name: 'memo', maxLength: 500 },
        transactionDate: { name: 'Transaction Date' },
        bankName: { name: 'Bank Name', maxLength: 50 },
        nameOnAccount: { name: 'Account Name', maxLength: 25 },
      },
      addressDetails: {
        addressLine1: { name: 'Address Line1', maxLength: 30, minLength: 5 },
        addressLine2: { name: 'Address Line 2', maxLength: 50 },
        city: { name: 'City', maxLength: 50 },
        state: { name: 'State' },
        country: { name: 'Country' },
        postalCode: { name: 'Postal (Zip) Code', maxLength: 10 }
      },
    },
    find: {
      startDate: { name: 'Start Date' },
      endDate: { name: 'End Date' },
      patientName: { name: 'Patient Name', maxLength: 50, minLength: 5 },
      accountName: { name: 'Account Name', maxLength: 50, minLength: 5 },
      providerName: { name: 'Provider Name', maxLength: 50, minLength: 5 },
      cardNumber: { name: 'Card No', maxLength: 4, minLength: 19 },
      amount: { name: 'Amount', maxLength: 19, minLength: 19 },
      status: { name: 'Status', maxLength: 50, minLength: 1 },
      recurringId: { name: 'Payment Plan Id', maxLength: 50, minLength: 1 },
      type: { name: 'Channel Type', maxLength: 50, minLength: 1 },
    },
    view: {

    },
    operation: {
      description: { name: 'Description', maxLength: 50, minLength: 5 },
    }
  };

  static recurring = {
    find: {
      nextBillingStartDate: { name: 'Start Date' },
      nextBillingEndDate: { name: 'End Date' },
      patientName: { name: 'Patient Name' },
      accountName: { name: 'Account Name' },
      paymentName: { name: 'Payment Name' },
      amount: { name: 'Amount', maxLength: 19, minLength: 19 },
      status: { name: 'Status' },
    },
    cancel: {
      reason: { name: 'Reason', maxLength: 256, minLength: 10 },
      cancelRecurring: { name: 'Option' }
    },
    add: {
      findPatient: {
        patientName: { name: 'Patient Name', maxLength: 50, minLength: 5 },
        email: { name: 'Email', maxLength: 256, minLength: 5 },
        companyName: { name: 'Comapnay Name', maxLength: 50, minLength: 5 },
      },
      recurringPayment: {
        patientName: { name: 'Patient Name', maxLength: 50, minLength: 5 },
        patientAccount: { name: 'Payment Account' },
        paymentName: { name: 'Payment Name', maxLength: 50, minLength: 5 },
        frequency: { name: 'Frequency' },
        frequencyParam: { name: 'Frequency Param' },
        type: { name: 'Type' },
        startDate: { name: 'Start Date' },
        endDate: { name: 'End Date' },
        subTotal: { name: 'Amount' },
        downPayment: { name: 'Amount' },
        taxAmount: { name: 'Tax Amount' },
        taxCalculated: { name: 'Tax Calculated' },
        totalAmount: { name: 'Total Amount' },
        noOfPayments: { name: 'No of Payments' },
        paymentAmount: { name: 'Payment Amount' },
        noOfRetries: { name: 'No of Retries' },
        amount: { name: 'Amount' },
        discount: { name: 'Discount' },
        discountAmount: { name: 'Discount Amount' },
        customerName: { name: 'Customer Name', maxLength: 50, minLength: 5 },
        customerAccount: { name: 'Payment Account' },
        planName: { name: 'Plan Name', maxLength: 50 },
        planDescription: { name: 'Payment Plan Description', maxLength: 500 },
        subscriptionAmount: { name: 'Subscription Amount' },
        firstName: { name: 'First Name', maxLength: 50, minLength: 5 },
        middleName: { name: 'Middle Name', maxLength: 50 },
        lastName: { name: 'Last Name', maxLength: 50, minLength: 5 },
        companyName: { name: 'Company Name', maxLength: 50, minLength: 5 },
        cardHolderName: { name: 'Name On Card', minLength: 5, maxLength: 50 },
        CVV: { name: 'CVV', minLength: 3, maxLength: 4 },
        postalCode: { name: 'Zip Code', minLength: 5, maxLength: 10 },
        cardNumber: { name: 'Card Number' },
        cardType: { name: 'Card Type' },
        cardExpiry: { name: 'Card Expiry', minLength: 4, maxLength: 4 },
        refundType: { name: 'Refund Type' },
      }
    },
    edit: {},
  };
  static note = {
    find: {
      patientName: { name: 'Patient Name' },
      createdOn: { name: 'Created On' },
      searchTerm: { name: 'Search Term' }
    }
  }
  static customPlans = {
    find: {
      planName: { name: 'Plan Name' },
      planDescription: { name: 'Plan Description' },
      productAndServices: { name: 'Product & Services' },
      frequency: { name: 'Frequency' },
      paymentType: { name: 'Payment Type' },
      status: { name: 'Status' }
    },
    add: {
      planName: { name: 'Plan Name' },
      planDescription: { name: 'Plan Description' },
      productAndServices: { name: 'Product & Services' },
      frequency: { name: 'Frequency' },
      frequencyParam: { name: 'Frequency Param' },
      paymentType: { name: 'Payment Type' },
      rate: { name: 'Rate' },
      discount: { name: 'Discount' },
      numberOfPayments: { name: 'Number Of Payments' },
      discountAmount: { name: 'Discount Amount' }
    }
  };

  static customer = {
    add: {
      title: { name: 'Title', minLength: 2, maxLength: 10 },
      firstName: { name: 'First Name', minLength: 5, maxLength: 50 },
      middleName: { name: 'Middle Name', minLength: 5, maxLength: 50 },
      lastName: { name: 'Last Name', minLength: 5, maxLength: 50 },
      company: { name: 'Company', minLength: 5, maxLength: 50 },
      department: { name: 'Department', minLength: 5, maxLength: 50 },
      phone: { name: 'Phone', minLength: 10, maxLength: 10 },
      fax: { name: 'Fax', minLength: 10, maxLength: 10 },
      email: { name: 'Email', minLength: 5, maxLength: 256 },
      addressLine1: { name: 'Address Line 1', minLength: 5, maxLength: 30 },
      addressLine2: { name: 'Address Line 2', minLength: 5, maxLength: 50 },
      city: { name: 'City', minLength: 5, maxLength: 50 },
      state: { name: 'State', minLength: 5, maxLength: 50 },
      country: { name: 'Country', minLength: 5, maxLength: 50 },
      postalCode: { name: 'Postal (Zip) Code', minLength: 5, maxLength: 10 },
    },
    find: {
      customerName: { name: 'Name', maxLength: 50, minLength: 5 },
      providerName: { name: 'Provider Name', maxLength: 50, minLength: 5 },
      userName: { name: 'Username', maxLength: 50, minLength: 5 },
      email: { name: 'Email', maxLength: 256 },
      status: { name: 'Status' },
    }
  };
  static patient = {
    add: {
      firstName: { name: 'First Name', minLength: 5, maxLength: 50 },
      middleName: { name: 'Middle Name', minLength: 5, maxLength: 50 },
      doctorId: { name: 'Practitioner', maxLength: 50, minLength: 8 },
      serviceDate: { name: 'Service Date' },
      lastName: { name: 'Last Name', minLength: 5, maxLength: 50 },
      phone: { name: 'Phone', minLength: 10, maxLength: 10 },
      email: { name: 'Email', minLength: 5, maxLength: 256 },
      addressLine1: { name: 'Address Line 1', minLength: 5, maxLength: 30 },
      addressLine2: { name: 'Address Line 2', minLength: 5, maxLength: 50 },
      city: { name: 'City', minLength: 5, maxLength: 50 },
      state: { name: 'State', minLength: 5, maxLength: 50 },
      country: { name: 'Country', minLength: 5, maxLength: 50 },
      postalCode: { name: 'Postal (Zip) Code', minLength: 5, maxLength: 10 },
      mrn: { name: 'MRN', maxLength: 50, minLength: 5 },
      ssn: { name: 'SSN', maxLength: 9, minLength: 9 },
      dob: { name: 'DOB' },
      hasInsurance: { name: 'HasInsurance' },
      checkEligibility: { name: 'Eligibility check' },
      policyNo: { name: 'Policy No', maxLength: 50, minLength: 5 },
      groupNo: { name: 'Group No', maxLength: 50, minLength: 5 },
      binNo: { name: 'Bin No', maxLength: 50, minLength: 5 },
      insurancePartner: { name: 'Insurance Payer' },
      relation: { name: 'Relationship' },

    },
    find: {
      patientName: { name: 'Patient Name', maxLength: 50, minLength: 5 },
      email: { name: 'Email', maxLength: 256 },
      mrn: { name: 'MRN', maxLength: 50, minLength: 5 },
      phone: { name: 'Phone number', maxLength: 10, minLength: 10 },
    },
    note: {
      title: { name: 'Title', minLength: 5, maxLength: 20 },
      description: { name: 'Description', minLength: 10, maxLength: 100 },
    },
    header: {
      providerName: { name: 'Provider Name' }
    },
    checkInOut: {
      date: { name: 'Date' },
      time: { name: 'Time' },
      Meridian: { name: 'Meridian' },
      doctorId: { name: 'Practitioner', maxLength: 50, minLength: 8 },
    }
  };
  static patientAccount = {
    add: {
      paymentType: { name: 'Payment Type', minLength: 5, maxLength: 50 },
      cardHolderName: { name: 'Card Holder Name', minLength: 5, maxLength: 50 },
      cardNumber: { name: 'Card Number', minLength: 5, maxLength: 19 },
      cardType: { name: 'Card Type', minLength: 5, maxLength: 50 },
      cardExpiry: { name: 'Card Expiry', minLength: 4, maxLength: 4 },
      nameOnAccount: { name: 'Account Name', minLength: 5, maxLength: 50 },
      accountType: { name: 'Account Type', minLength: 5, maxLength: 50 },
      accountNo: { name: 'Account No', minLength: 5, maxLength: 50 },
      routingNumber: { name: 'Routing Number', minLength: 9, maxLength: 9 },
      bankName: { name: 'Bank Name', minLength: 5, maxLength: 50 },
      addressLine1: { name: 'Address Line 1', minLength: 5, maxLength: 30 },
      addressLine2: { name: 'Address Line 2', minLength: 5, maxLength: 50 },
      city: { name: 'City', minLength: 5, maxLength: 50 },
      state: { name: 'State', minLength: 5, maxLength: 50 },
      country: { name: 'Country', minLength: 5, maxLength: 50 },
      postalCode: { name: 'Postal (Zip) Code', minLength: 5, maxLength: 10 },
    },
    edit: {}
  };

  static billingConfig = {
    ratePlan: { name: 'Rate Plan' },
    paymentType: { name: 'Mode of Payment' },
    cardNumber: { name: 'Card Number', minLength: 5, maxLength: 19 },
    cardType: { name: 'Card Type', minLength: 5, maxLength: 50 },
    cardExpiry: { name: 'Card Expiry', minLength: 4, maxLength: 4 },
    frequency: { name: 'Billing Execution' },
    frequencyParam: { name: 'Billing Execution' },
    nextBillingDate: { name: 'Next Transaction Date' },
    BillingStartDateDate: { name: 'Next Transaction Date' },
    bankName: { name: 'Bank Name', minLength: 5, maxLength: 50 },
    accountType: { name: 'Account Type', minLength: 5, maxLength: 50 },
    routingNumber: { name: 'Routing Number', minLength: 5, maxLength: 50 },
    accountNo: { name: 'Account No', minLength: 5, maxLength: 50 },
  };

  static ratePlan = {
    add: {
      ratePlanName: { name: 'Rate Plan Name', minLength: 5, maxLength: 50 },
      description: { name: 'Description', minLength: 5, maxLength: 50 }
    }
  };

  static product = {
    find: {
      productName: { name: 'Product Name' },
      cptCode: { name: 'Cpt Code' },
      unitPrice: { name: 'Unit Price', minLength: 2, maxLength: 10 },
      description: { name: 'Description' },
      sorting: { name: 'Sorting' },
      amount: { name: 'Amount', maxLength: 19, minLength: 19 },
      startDate: { name: 'Start Date' },
      endDate: { name: 'End Date' }
    },
    add: {
      ProductType: { name: 'Type', },
      ServiceType: { name: 'Service Type', },
      CodeName: { name: 'Code Name', },
      Icd10Code: { name: 'ICD10 Code', },
      taxPercent: { name: 'Tax Percent', minLength: 1, maxLength: 5 },
      quantity: { name: 'Quantity', minLength: 1, maxLength: 3 },
      CptCode: { name: 'Cpt Code' },
      unitPrice: { name: 'Unit Price', minLength: 2, maxLength: 10 },
      description: { name: 'Description', maxLength: 200 },
      discount: { name: 'Discount' },
      discountAmount: { name: 'Discount Amount' },
      productName: { name: 'Product Name', maxLength: 50 },
      productAlias: { name: 'Product Alias', maxLength: 50 },
      sorting: { name: 'Sorting' },
      partner: { name: 'Partner' },
      activeUntil: { name: 'Expiry Date' },
    }
  };

  static invoice = {
    find: {
      patientName: { name: 'Patient Name' },
      toEmail: { name: 'To', minLength: 5, maxLength: 50 },
      ccEmail: { name: 'CC', minLength: 5, maxLength: 50 },
      invoiceName: { name: 'Invoice Name', minLength: 5, maxLength: 50 },
      amount: { name: 'Amount', minLength: 1, maxLength: 12 },
      status: { name: 'Status', minLength: 5, maxLength: 50 },
      paymentStatus: { name: 'Payment Status', minLength: 5, maxLength: 50 },
      startDate: { name: 'Start Date' },
      endDate: { name: 'End Date' },
    },
    add: {
      patientName: { name: 'Patient Name' },
      toEmail: { name: 'To', minLength: 5, maxLength: 50 },
      ccEmail: { name: 'CC', minLength: 5, maxLength: 50 },
      phone: { name: 'Phone', maxLength: 10, minLength: 10 },
      product_ServiceName: { name: 'Product/Service Name' },
      subTotal: { name: 'Sub Total', minLength: 1, maxLength: 12 },
      discountType: { name: 'Discount Type' },
      discountPercentage: { name: 'Discount Value', minLength: 1, maxLength: 5 },
      discountAmount: { name: 'Discount Amount', minLength: 1, maxLength: 12 },
      taxPercentage: { name: 'Tax Percentage', minLength: 1, maxLength: 5 },
      taxAmount: { name: 'Tax Amount', minLength: 1, maxLength: 12 },
      totalAmount: { name: 'Total Amount', minLength: 1, maxLength: 12 },
      invoiceName: { name: 'Invoice Name', minLength: 5, maxLength: 50 },
      note: { name: 'Note', minLength: 5, maxLength: 50 },
      invoiceDate: { name: 'Invoice Date' },
      dueDate: { name: 'Due Date' },
      visitDate: { name: 'Visit Date' },
      serviceDate: { name: 'Service Date' },
      frequency: { name: 'Frequency' },
      frequencyParam: { name: 'Frequency Param' },
      startDate: { name: 'Start Date' },
      patientInsuranceId: { name: 'Patient Insurance', maxLength: 50, minLength: 5 },
      endDate: { name: 'End Date' },
      dueInDays: { name: 'Due in Days', minLength: 1, maxLength: 5 },
      invoiceNo: { name: 'Reference No', minLength: 1, maxLength: 5 },
      poNo: { name: 'PO No', minLength: 1, maxLength: 11 },
      doctorId: { name: 'Practitioner Name', minLength: 1, maxLength: 11 },
      autoInvoiceDate: { name: 'On Email Delivery', minLength: 1, maxLength: 5 },
      autoGenerateInvoiceNo: { name: 'Auto Generate', minLength: 1, maxLength: 5 },
      noOfTimes: { name: 'No of Times' },
      isActiveDoctor: { name: 'Practitioner' }
    }
  };

  static order = {
    add: {
      partner: { name: 'Partner', minLength: 5, maxLength: 50 },
      product_ServiceName: { name: 'Product/Service Name', minLength: 5, maxLength: 50 },
      quantity: { name: 'Quantity', minLength: 1, maxLength: 3 },
      subTotal: { name: 'SubTotal', minLength: 1, maxLength: 12 },
      discountPercentage: { name: 'Discount Value', minLength: 1, maxLength: 5 },
      discountAmount: { name: 'Discount Amount', minLength: 1, maxLength: 12 },
      state: { name: 'State', minLength: 5, maxLength: 50 },
      taxPercent: { name: 'Tax Percent', minLength: 1, maxLength: 5 },
      taxAmount: { name: 'Tax Amount', minLength: 1, maxLength: 12 },
      totalAmount: { name: 'Total Amount', minLength: 1, maxLength: 12 },
      frequency: { name: 'First Transaction', minLength: 1, maxLength: 12 },
      frequencyParam: { name: 'Subsequent transactions', minLength: 1, maxLength: 12 },
      firstTransactionDate: { name: 'First Transaction Date', minLength: 1, maxLength: 12 },
      customerName: { name: 'Customer Name', minLength: 1, maxLength: 50 },
      toEmail: { name: 'Customer Email', minLength: 5, maxLength: 256 },
      ccEmail: { name: 'Email', minLength: 5, maxLength: 256 },
      phone: { name: 'Phone', minLength: 10, maxLength: 10 },
      invoiceDateOnEmailDelivery: { name: 'Invoice Date on Email Delivery', minLength: 5, maxLength: 50 },
      invoiceDate: { name: 'Invoice Date', minLength: 5, maxLength: 50 },
      dueInDays: { name: 'Due in Days', minLength: 5, maxLength: 50 },
      dueDate: { name: 'Due Date', minLength: 5, maxLength: 50 },
      autoGenerateInvoiceNo: { name: 'Auto Generate Reference No', minLength: 5, maxLength: 50 },
      invoiceNo: { name: 'Reference No', minLength: 5, maxLength: 50 },
      poNo: { name: 'PO No', minLength: 5, maxLength: 11 },
      invoiceFormat: { name: 'Invoice Format', minLength: 5, maxLength: 50 },
      note: { name: 'Note', minLength: 5, maxLength: 50 },
    },
    find: {
      startDate: { name: 'Start Date' },
      endDate: { name: 'End Date' },
      partnerName: { name: 'Partner Name', minLength: 5, maxLength: 50 },
      amount: { name: 'Amount', minLength: 1, maxLength: 12 }
    }
  };

  static appointment = {
    find: {
      name: { name: 'Patient Name', maxLength: 50, minLength: 8 },
      mrn: { name: 'MRN', maxLength: 50, minLength: 8 },
      email: { name: 'Email', maxLength: 50, minLength: 8 },
      doctor: { name: 'Practitioner Name', maxLength: 50, minLength: 8 },
    },
    add: {
      patient: { name: 'Name', maxLength: 50, minLength: 8 },
      doctor: { name: 'Name', maxLength: 50, minLength: 8 },
      repeatOn: { name: 'Repeat On' },
      phone: { name: 'Phone', maxLength: 10, minLength: 10 },
      email: { name: 'Email', maxLength: 256, minLength: 5 },
      startTime: { name: 'Start Time' },
      endTime: { name: 'End Time' },
      startDate: { name: 'Start Date' },
      duration: { name: 'Duration' },
      memo: { name: 'memo', maxLength: 200 },
      appointmentCount: { name: "No of Appointment" },
      patientInsuranceId: { name: 'Patient Insurance', maxLength: 50, minLength: 5 },
      isActiveDoctor: { name: 'Practitioner' },
    }
  };
  static emailSettings = {
    add: {
      phone: { name: 'Phone', minLength: 10, maxLength: 10 },
      fromEmail: { name: 'From Email', minLength: 5, maxLength: 256 },
      contactEmail: { name: 'Contact Email', minLength: 5, maxLength: 256 },
      footer: { name: 'Footer', maxLength: 100, minLength: 5 },
    }
  };

  static insurance = {
    find: {
      insuranceName: { name: 'Insurance Name', maxLength: 50, minLength: 5 },
      email: { name: 'Email', maxLength: 256 },
      phone: { name: 'Phone number', maxLength: 10, minLength: 10 },
    },
    add: {
      insuranceName: { name: 'Insurance Name', minLength: 5, maxLength: 50 },
      phone: { name: 'Phone', minLength: 10, maxLength: 10 },
      email: { name: 'Email', minLength: 5, maxLength: 256 },
      addressLine1: { name: 'Address Line 1', minLength: 5, maxLength: 30 },
      addressLine2: { name: 'Address Line 2', minLength: 5, maxLength: 50 },
      city: { name: 'City', minLength: 5, maxLength: 50 },
      state: { name: 'State', minLength: 5, maxLength: 50 },
      country: { name: 'Country', minLength: 5, maxLength: 50 },
      postalCode: { name: 'Postal (Zip) Code', minLength: 5, maxLength: 10 },
    }
  };

  static doctor = {
    find: {
      doctorName: { name: 'Practitioner Name', maxLength: 50, minLength: 5 },
      email: { name: 'Email', maxLength: 256 },
      phone: { name: 'Phone number', maxLength: 10, minLength: 10 },
    },
    add: {
      doctorTypeCode: { name: 'Practitioner Type Code' },
      doctorTypeTitle: { name: 'Practitioner Type Title' },
      NpiNumber: { name: 'NPI Number', minLength: 10, maxLength: 10 },
      firstName: { name: 'First Name', minLength: 5, maxLength: 50 },
      lastName: { name: 'Last Name', minLength: 5, maxLength: 50 },
      userName: { name: 'Username', minLength: 5, maxLength: 50 },
      phone: { name: 'Phone', minLength: 10, maxLength: 10 },
      email: { name: 'Email', minLength: 5, maxLength: 256 },
      url: { name: 'URL', minLength: 5, maxLength: 256 },
      addressLine1: { name: 'Address Line 1', maxLength: 30, minLength: 5 },
      addressLine2: { name: 'Address Line 2', maxLength: 50, minLength: 5 },
      city: { name: 'City', maxLength: 50, minLength: 5 },
      state: { name: 'State', maxLength: 50 },
      country: { name: 'Country', maxLength: 50 },
      postalCode: { name: 'Postal (Zip) Code', maxLength: 10, minLength: 5 },
      start: { name: 'Start' },
      end: { name: 'End' },
      weekDay: { name: 'WeekDay' },
      isAvailable: { name: 'Avalability' },
    }
  };


  static claims = {
    add: {
      patientId: { name: 'Patient Name', maxLength: 50, minLength: 5 },
      patientInsuranceId: { name: 'Patient Insurance', maxLength: 50, minLength: 5 },
      noOfTimes: { name: 'No of Times' },
      frequency: { name: 'Frequency' },
      startDate: { name: 'Start Date' },
      serviceDate: { name: 'Service Date' },
      doctorId: { name: 'Practitioner Name', minLength: 1, maxLength: 11 },
      isActiveDoctor: { name: 'Practitioner' },
    },
    find: {
      patientName: { name: 'Patient Name', maxLength: 50, minLength: 5 },
      payerName: { name: 'Payer Name', maxLength: 50, minLength: 5 },
    }
  };

  static patientInsurance = {
    add: {
      firstName: { name: 'First Name', minLength: 5, maxLength: 50 },
      middleName: { name: 'Middle Name', minLength: 5, maxLength: 50 },
      lastName: { name: 'Last Name', minLength: 5, maxLength: 50 },
      phone: { name: 'Phone', minLength: 10, maxLength: 10 },
      email: { name: 'Email', minLength: 5, maxLength: 256 },
      addressLine1: { name: 'Address Line 1', minLength: 5, maxLength: 30 },
      addressLine2: { name: 'Address Line 2', minLength: 5, maxLength: 50 },
      city: { name: 'City', minLength: 5, maxLength: 50 },
      state: { name: 'State', minLength: 5, maxLength: 50 },
      country: { name: 'Country', minLength: 5, maxLength: 50 },
      postalCode: { name: 'Postal (Zip) Code', minLength: 5, maxLength: 10 },
      mrn: { name: 'MRN', maxLength: 50, minLength: 5 },
      dob: { name: 'DOB' },
      hasInsurance: { name: 'HasInsurance' },
      checkEligibility: { name: 'Eligibility check' },
      policyNo: { name: 'Policy No', maxLength: 50, minLength: 5 },
      groupNo: { name: 'Group No', maxLength: 50, minLength: 5 },
      binNo: { name: 'Bin No', maxLength: 50, minLength: 5 },
      insurancePartner: { name: 'Insurance Payer' },
      relation: { name: 'Relationship' },
    }
  };

  static scheduleTransactionOperation = {
    update: {
      reason: { name: 'Reason', maxLength: 50, minLength: 5 },
      scheduleDate: { name: 'Schedule Date', maxLength: 50, minLength: 5 },
      patientAccountId: { name: 'Patient Account', maxLength: 50, minLength: 5 },
    }
  };

  static attachment = {
    add: {
      file: { name: 'File', maxLength: 50, minLength: 5 },
      description: { name: 'Description', maxLength: 255, minLength: 5 },
      providerId: { name: 'Provider  Id', maxLength: 255, minLength: 1 }
    }
  };

  static role = {
    find: {
      roleName: { name: 'Role Name', maxLength: 50, minLength: 5 },
    },
    add: {
      roleName: { name: 'Role Name', minLength: 5, maxLength: 50 },
      description: { name: 'Description', minLength: 5, maxLength: 255 },
      checkArray: { name: 'Feature', minLength: 5, maxLength: 255 },
      userType: { name: 'User Type' },
    }
  };
}
