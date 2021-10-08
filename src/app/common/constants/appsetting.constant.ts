//const baseUrl = 'https://api.uat.hellopatients.com/';//hellopateint UAT Environment
//const baseUrl = 'https://api.hellopatients.com/';//hellopateint Prod Environment
//HPT new dev environment
let baseUrl = 'https://atg96ts3g3.execute-api.us-east-2.amazonaws.com/v1/';
if (window.location.host.includes("login.uat") || window.location.host.includes("admin.uat")) {
  baseUrl = 'https://api.uat.hellopatients.com/';
}
if (window.location.host.includes("admin.hellopatients") || window.location.host.includes("login.hellopatients")) {
  baseUrl = 'https://api.hellopatients.com/';
}
// if(window.location.host.includes("admindev.")||window.location.host.includes("logindev.")||window.location.host.includes("hptui.")||window.location.host.includes("localhost:")){
//   baseUrl = 'https://atg96ts3g3.execute-api.us-east-2.amazonaws.com/v1/';
// }
//console.log(baseUrl)
//const baseUrl = 'https://atg96ts3g3.execute-api.us-east-2.amazonaws.com/v1/'//const baseUrl = 'http://10.197.1.62:5000/';
export class AppSetting {
  static baseUrl = baseUrl;
  static defaultCountry = '1';
  static common = {
    emulate: AppSetting.baseUrl + 'user/session/{username}/emulation',
    login: baseUrl + 'users/sessions',
    patientLogin: baseUrl + 'patient/sessions',
    getUserByUserName: baseUrl + 'users',
    getCountry: baseUrl + 'countries/list',
    getState: baseUrl + 'states/',
    getTimeZone: baseUrl + 'timezones',
    forgotPassword: baseUrl + 'forgotPassword',
    forgotUsername: baseUrl + 'forgotUsername',
    patientLookup: baseUrl + 'providers/{providerId}/patients/lookup',
    getRefreshToken: baseUrl + 'user/session/{userId}/refresh',
    providerLookup: baseUrl + 'patients/{patientId}/providers',
    customPlanLookup: baseUrl + 'providers/{providerId}/customplans/lookup',
    recurringLookup: baseUrl + 'providers/{providerId}/recurringpayments/lookup',
    acceptTerm: baseUrl + 'users/{user}/termsconditions',
    patientLoginOTP: baseUrl + 'patient/sendotp',
    patientLoginViaOTP: baseUrl + 'patient/onetimepassword/sessions',
    insuranceLookup: baseUrl + 'insurance/lookup',
    training: baseUrl + 'training/videos',
    getGlobalUserByUserName: baseUrl + 'users/{username}/name',
    getProviderUserByUserName: baseUrl + 'providers/{parentId}/users/{username}/name',
    getPatientUserByUserName: baseUrl + 'patients/{parentId}/users/{username}/name',
    getProviderUserDetail: baseUrl + 'providers/{parentId}/users/details/{username}',
  };

  static featuresaccess = {
    getDefaultconfig: AppSetting.baseUrl + 'modules/{userType}',
    addModuleConfig: AppSetting.baseUrl + 'providers/{parentId}/moduleconfig',
    getModuleConfig: AppSetting.baseUrl + 'providers/{parentId}/moduleconfig',
    getfeatureConfig: AppSetting.baseUrl + 'providers/{parentId}/featureconfig',
    addfeatureConfig: AppSetting.baseUrl + 'providers/{parentId}/featureconfig',
  };


  static facility = {
    add: baseUrl + 'facility',
    edit: baseUrl + 'facility',
    delete: baseUrl + 'facility',
    get: baseUrl + 'global/facility',
    getById: baseUrl + 'facility',
    find: baseUrl + 'global/facility/',
    common: baseUrl + 'facility'
  };

  static forms = {
    get: baseUrl + 'providers/{parentId}/forms',
    add: baseUrl + 'providers/{parentId}/forms',
    edit: baseUrl + 'providers/{parentId}/forms',
    delete: baseUrl + 'providers/{parentId}/forms/{formId}'
  }

  static plforms = {
    get: baseUrl + 'providers/{parentId}/forms',
    getFormById: baseUrl + 'providers/{parentId}/forms/{formId}',
    sendEmail: baseUrl + 'providers/{parentId}/formurl/{formId}/send',
    add: baseUrl + 'providers/{parentId}/forms',
    link: baseUrl + 'providers/{parentId}/forms/{formId}/link',
    edit: baseUrl + 'providers/{parentId}/forms',
    delete: baseUrl + 'providers/{parentId}/forms/{formId}',
    lookup: baseUrl + 'providers/{parentId}/forms/lookup',
    formsMapping: baseUrl + 'providers/{parentId}/formsmapping',
    updateFormsMapping: baseUrl + 'providers/{parentId}/formsmapping/{mappingId}',
    submissions: baseUrl + 'submissions',
    getFormsByIds: baseUrl + 'providers/{parentId}/forms',
    submissionsProvider: baseUrl + 'providers/{parentId}/submissions',
    submissionsProviderHistory: baseUrl + 'providers/{parentId}/submissions/history',
    updateSubmission: baseUrl + 'submissions/{submissionId}',
    sendForm: baseUrl + 'providers/{parentId}/forms/{formId}/send'
  }

  static patientForms = {
    get: baseUrl + 'patients/{parentId}/forms',
    getFormById: baseUrl + 'patients/{parentId}/forms/{formId}',
    getFormsByIds: baseUrl + 'patients/{parentId}/forms',
    formsMapping: baseUrl + 'patients/{parentId}/formsmapping',
    submissionsPatients: baseUrl + 'patients/{parentId}/submissions',
    submissions: baseUrl + 'submissions',
  }

  static provider = {
    // add: baseUrl + 'providers',
    edit: baseUrl + 'providers',
    get: baseUrl + 'providers',
    getProviderByUserName: baseUrl + 'providers',
    getProviderDetail: baseUrl + 'providers/{providerId}/details',


    find: baseUrl + 'providers/',
    getById: baseUrl + 'providers',
    common: baseUrl + 'providers',
    delete: baseUrl + 'providers',

    globalGetProviderById: baseUrl + 'providers/{providerId}',
    globalFindProvider: baseUrl + 'providers',
    addProviderUnderGlobal: baseUrl + 'providers',
    editProviderUnderGlobal: baseUrl + 'providers/{providerId}',
    activateProviderUnderGlobal: baseUrl + 'providers/{providerId}/activations',
    deactivateProviderUnderGlobal: baseUrl + 'providers/{providerId}/activations',
    deleteProviderUnderGlobal: baseUrl + 'providers/{providerId}'
  };
  static user = {
    find: baseUrl + 'providers/{providerId}/users',
    getById: baseUrl + 'providers/{providerId}/users/{userId}',
    common: baseUrl + 'providers/{providerId}/users',
    delete: baseUrl + 'providers/{providerId}/users/{userId}',
    add: baseUrl + 'providers/{providerId}/user',
    edit: baseUrl + 'providers/{providerId}/users/{userId}',
    activate: baseUrl + 'providers/{providerId}/users/{userId}/activations',
    deactivate: baseUrl + 'providers/{providerId}/users/{userId}/activations'
  };
  // static merchant = {
  //   getMerchantByUserName: baseUrl + 'merchants'
  // };
  // ------------------------------------------------------------------------------------------------------------------------------

  static patient = {
    getPatientByUserName: baseUrl + 'patients',
    addPatient: baseUrl + 'providers/{providerId}/patients',
    findPatient: baseUrl + 'providers/{providerId}/patients',
    findPatientAccount: baseUrl + 'providers/{providerId}/patients/{custId}/accounts',
    linkPatient: baseUrl + 'providers/{providerId}/patients/{patientId}/link',
    activatePatientAccount: baseUrl + 'providers/{providerId}/patients/{patientId}/accounts/{accountId}/activations',
    activatePatient: baseUrl + 'providers/{providerId}/patients/{custId}/activations',
    edit: baseUrl + 'providers/{providerId}/patients/',
    editForPatient: baseUrl + 'patients/{patientId}',
    getInsurancerPartner: baseUrl + 'providers/insurancepartners',
    getNotes: baseUrl + 'providers/{providerId}/notes',
    addNote: baseUrl + 'providers/{providerId}/patients/{patientId}/notes',
    isExists: baseUrl + 'providers/{providerId}/patients/exists/{emailId}',
    optInOptOut: baseUrl + 'hpt/mobile/optInoptOut',
    visits: baseUrl + 'providers/{providerId}/patients/{patientId}/visits',
    updateVisits: baseUrl + 'providers/{providerId}/patients/{patientId}/visits/{visitId}',
  };
  static wallet = {
    findPatientAccount: baseUrl + 'patients/{custId}/accounts',
    linkPatient: baseUrl + 'patients/{patientId}/link',
    activatePatientAccount: baseUrl + 'patients/{patientId}/accounts/{accountId}/activations',
    deletePatientAccount: baseUrl + 'patients/{patientId}/accounts/{accountId}',
    activatePatient: baseUrl + 'patients/{custId}/activations',
    edit: baseUrl + 'patients/',
  };
  static patientAccount = {
    addPatientAccount: baseUrl + '',
    findPatientAccount: baseUrl + 'patients/{custId}/accounts',
    activatePatientAccount: baseUrl + 'patients/{custId}/accounts/{accountId}/activations',
    isExists: baseUrl + 'patients/{patientId}/accounts/exists',
  };
  static transaction = {
    add: baseUrl + 'providers/{providerId}/transactions',
    patientTransaction: baseUrl + 'patients/{patientId}/transactions',
    updateTransaction: baseUrl + 'providers/{providerId}/transactions/{transactionId}',
    getCardDetails: baseUrl + 'binlookup',
    retry: baseUrl + 'providers/{providerId}/transactions/{transactionId}/retry',
    getById: '',
    find: '',
    sendReceipt: baseUrl + 'providers/{providerId}/transactions/{transactionId}/email',
    sendReceiptFromPatient: baseUrl + 'patients/{patientId}/transactions/{transactionId}/email',
    sendSchedule: baseUrl + 'providers/{providerId}/schedulepayments/{recurringScheduleId}/email',
    sendScheduleFromPatient: baseUrl + 'patients/{patientId}/schedulepayments/{recurringScheduleId}/email',
    refund: baseUrl + 'providers/{providerId}/transactions/{transactionId}/refund',
  };

  static recurringPayments = {
    find: baseUrl + 'providers/{providerId}/recurringpayments',
    details: baseUrl + 'providers/{providerId}/patientsdetails',
    getById: baseUrl + 'providers/{providerId}/recurringpayments/{recurringId}',
    add: baseUrl + 'providers/{providerId}/recurringpayments',
    edit: baseUrl + 'providers/{providerId}/recurringpayments/{recurringId}',
    activate: baseUrl + 'providers/{providerId}/recurringpayments/{recurringId}/activations',
    deactivate: baseUrl + 'providers/{providerId}/recurringpayments/{recurringId}/activations',
    cancelPaymentPlan: baseUrl + 'providers/{providerId}/recurringpayments/{recurringId}/cancel',
    schedule: baseUrl + 'providers/{providerId}/recurringschedule/{recurringId}',
    addScheduleTransaction: baseUrl + 'scheduletransaction',
    updateAccount: baseUrl + 'providers/{providerId}/recurringpayments/{recurringId}/accounts',
    updatePatientAccount: baseUrl + 'patients/{patientId}/recurringpayments/{recurringId}/accounts',
    report: baseUrl + 'providers/{providerId}/reports',
    recurringScheduleReport : baseUrl + 'providers/{providerId}/scheduledReports',
  };
  static patientRecurringPayments = {
    find: baseUrl + 'patients/{patientId}/recurringpayments',
    details: baseUrl + 'patients/{patientId}/patientsdetails',
    getById: baseUrl + 'patients/{patientId}/recurringpayments/{recurringId}',
    add: baseUrl + 'patients/{patientId}/recurringpayments',
    edit: baseUrl + 'patients/{patientId}/recurringpayments/{recurringId}',
    activate: baseUrl + 'patients/{patientId}/recurringpayments/{recurringId}/activations',
    deactivate: baseUrl + 'patients/{patientId}/recurringpayments/{recurringId}/activations',
    schedule: baseUrl + 'patients/{patientId}/recurringschedule/{recurringId}',
    scheduleByDay: baseUrl + 'patients/{patientId}/recurringschedule'
  };

  static recurringPaymentSchedule = {
    updateRecurringSchedule: baseUrl + 'providers/{providerId}/recurringpayments/{recurringId}/reschedule/{transactionId}'
  };

  static customPlans = {
    find: baseUrl + 'providers/{parentId}/recurringplans',
    getById: baseUrl + 'providers/{parentId}/recurringplans/{customPlanId}',
    add: baseUrl + 'providers/{parentId}/recurringplans',
    edit: baseUrl + 'providers/{parentId}/recurringplans/{customPlanId}',
    activate: baseUrl + 'providers/{parentId}/recurringplans/{customPlanId}/activations',
    deactivate: baseUrl + 'providers/{parentId}/recurringplans/{customPlanId}/activations'
  };

  static dashboard = {
    adminTransactionVolume: baseUrl + 'providers/reports',
    providerTransactionVolume: baseUrl + 'providers/{providerId}/dashboardReports',
    providerInvoiceVolume: baseUrl + 'providers/{providerId}/reports',
    providerRecentActivities: baseUrl + 'providers/{providerId}/recentActivities'
  };

  static settings = {

    putProviderSettings: baseUrl + 'providers/{providerId}/providersettings',
    getProviderSettings: baseUrl + 'providers/{providerId}/providersettings',
    putProviderSettingsInvoiceFormat: baseUrl + 'providers/{providerId}/providersettings/invoiceformat',
    getProviderSettingsInvoiceFormat: baseUrl + 'providers/{providerId}/providersettings/invoiceformat',
    putProviderSettingsSkin: baseUrl + 'providers/{providerId}/providersettings/skin',
    getProviderSettingsSkin: baseUrl + 'providers/{providerId}/providersettings/skin',
    putProviderSettingsTimezone: baseUrl + 'providers/{providerId}/providersettings/timezone',
    getProviderSettingsTimezone: baseUrl + 'providers/{providerId}/providersettings/timezone',
    putProviderSettingsLogo: baseUrl + 'providers/{providerId}/providersettings/logo',
    getProviderSettingsLogo: baseUrl + 'providers/{providerId}/providersettings/logo'
  };


  static invoice = {
    findInvoice: baseUrl + 'providers/{providerId}/invoices',
    addInvoice: baseUrl + 'providers/{providerId}/invoices',
    deleteInvoice: baseUrl + 'providers/{providerId}/invoices/{invoiceId}',
    getInvoiceById: baseUrl + 'providers/{providerId}/invoices/{invoiceId}',
    editInvoice: baseUrl + 'providers/{providerId}/invoices/{invoiceId}',
    finalizeInvoice: baseUrl + 'providers/{providerId}/invoices/{invoiceId}/finalize',
    patientInvoice: baseUrl + 'patients/{patientId}/invoices',
    getInvoiceByIdForPatient: baseUrl + 'patients/{patientId}/invoices/{invoiceId}',
    payments: baseUrl + 'invoices/{invoiceId}/payment',
    schedulepayment: baseUrl + 'invoices/{invoiceId}/schedulepayment',
    recurringpayment: baseUrl + 'invoices/{invoiceId}/recurringpayment',
    resendInvoice: baseUrl + 'invoices/{invoiceId}/email',
    getInvoiceCount: baseUrl + 'providers/{providerId}/invoices/count',
    closeInvoice: baseUrl + 'providers/{providerId}/invoices/{invoiceId}/close',
    statusreport: baseUrl + 'providers/{providerId}/invoicestatus/report'
  };
  static recurringInvoice = {
    findRecurringInvoice: baseUrl + 'providers/{providerId}/recurringinvoices',
    addRecurringInvoice: baseUrl + 'providers/{providerId}/recurringinvoices',
    deleteRecurringInvoice: baseUrl + 'providers/{providerId}/recurringinvoices/{invoiceId}',
    getRecurringInvoiceById: baseUrl + 'providers/{providerId}/recurringinvoices/{invoiceId}',
    editRecurringInvoice: baseUrl + 'providers/{providerId}/recurringinvoices/{invoiceId}',
    finalizeRecurringInvoice: baseUrl + 'providers/{providerId}/recurringinvoices/{invoiceId}/finalize',
  };

  static insurance = {
    find: baseUrl + 'providers/{providerId}/insurance',
    add: baseUrl + 'providers/{providerId}/insurance',
    delete: baseUrl + 'providers/{providerId}/insurance/{insuranceId}',
    getById: baseUrl + 'providers/{providerId}/insurance/{insuranceId}',
    edit: baseUrl + 'providers/{providerId}/insurance/{insuranceId}',
    link: baseUrl + 'providers/{providerId}/insurance/{insuranceId}/link'
  };

  static patientInsurance = {
    find: baseUrl + 'providers/{providerId}/patients/{patientId}/insurance',
    add: baseUrl + 'providers/{providerId}/patients/{patientId}/insurance',
    delete: baseUrl + 'providers/{providerId}/patients/{patientId}/insurance/{insuranceId}',
    getById: baseUrl + 'providers/{providerId}/patients/{patientId}/insurance/{insuranceId}',
    edit: baseUrl + 'providers/{providerId}/patients/{patientId}/insurance/{insuranceId}',
    changeType: baseUrl + 'providers/{providerId}/patients/{patientId}/insurance/{insuranceId}/type',
    patientFind: baseUrl + 'patients/{patientId}/insurance',
    patientAdd: baseUrl + 'patients/{patientId}/insurance',
    patientDelete: baseUrl + 'patients/{patientId}/insurance/{insuranceId}',
    patientGetById: baseUrl + 'patients/{patientId}/insurance/{insuranceId}',
    patientEdit: baseUrl + 'patients/{patientId}/insurance/{insuranceId}',
    patientChangeType: baseUrl + 'patients/{patientId}/insurance/{insuranceId}/type',

  };

  static doctor = {
    find: baseUrl + 'providers/{providerId}/doctors',
    add: baseUrl + 'providers/{providerId}/doctors',
    delete: baseUrl + 'providers/{providerId}/doctors/{doctorId}',
    getById: baseUrl + 'providers/{providerId}/doctors/{doctorId}',
    // getNPIRegistry: 'api',
    getNPIRegistry: baseUrl + 'npiregistry/lookup',
    edit: baseUrl + 'providers/{providerId}/doctors/{doctorId}',
    lookup: baseUrl + 'providers/{providerId}/doctors/lookup',
    link: baseUrl + 'providers/{providerId}/doctors/{doctorId}/link',
    typeLookup: baseUrl + 'providers/{providerId}/doctors/type/lookup',
    activateDeactivatePractitioners: AppSetting.baseUrl + 'providers/{providerId}/doctors/{doctorId}/activations',
    checkAvailability: baseUrl + 'providers/{providerId}/doctors/{doctorId}/check/workinghours'
  };

  static appointment = {
    findAppointment: baseUrl + 'providers/{providerId}/appointments',
    editAppointment: baseUrl + 'providers/{providerId}/appointments/{appointmentId}',
    deleteAppointment: baseUrl + 'appointments/{appointmentId}/cancel',
    getPatientAppointment: baseUrl + 'patients/{patientId}/appointments',
    getPatientAppointmentForAdmin: baseUrl + 'providers/appointments',
    sendAptNotification: baseUrl + 'providers/{providerId}/appointments/{appointmentId}/notification',
    checkAvailability: baseUrl + 'providers/{providerId}/doctors/{doctorId}/check/slot',
    getConfigurations: baseUrl + 'providers/{providerId}/appointmentconfig'
  }

  static globalAdminName = 'Hellopayments';
  static email = 'support@hellopayments.net';
  static defaultLogoForInvoiceFormat = 'https://hpg2-ui.s3.us-east-2.amazonaws.com/assets/images/logo_login.png';
  static resultsPerPage = 10;
  static truncateWordLength = 20;
  static defaultStartDateRange = 3;

  static product = {
    find: AppSetting.baseUrl + 'providers/{parentId}/items',
    findForPartner: AppSetting.baseUrl + 'providers/{parentId}/partners/{partnerId}/items',
    getById: AppSetting.baseUrl + 'providers/{parentId}/items/{productId}',
    getByIdForPartner: AppSetting.baseUrl + 'providers/{parentId}/partners/{partnerId}/items/{productId}',
    add: AppSetting.baseUrl + 'providers/{parentId}/items',
    addForPartner: AppSetting.baseUrl + 'providers/{parentId}/partners/{partnerId}/items', // partner adds product for himself
    edit: AppSetting.baseUrl + 'providers/{parentId}/items/{productId}',
    editForPartner: AppSetting.baseUrl + 'providers/{parentId}/partners/{partnerId}/items/{productId}',
    addCustomTags: AppSetting.baseUrl + 'providers/{parentId}/tags',
    getAllLookupTags: AppSetting.baseUrl + 'providers/{parentId}/tags/lookup',
    getProductsCptCodes: AppSetting.baseUrl + 'providers/{parentId}/servicecodes',
    activateDeactivateProducts: AppSetting.baseUrl + 'providers/{parentId}/items/{productId}/activations',
    lookup: AppSetting.baseUrl + 'providers/{parentId}/items/lookup'
  };

  static claims = {
    findClaims: baseUrl + 'providers/{providerId}/claims',
    getClaimById: baseUrl + 'providers/{providerId}/claims/{claimId}',
    add: baseUrl + 'providers/{providerId}/claims',
    edit: baseUrl + 'providers/{providerId}/claims/{claimId}',
    delete: baseUrl + 'providers/{providerId}/claims/{claimId}',
    reschedule: baseUrl + 'providers/{providerId}/claims/{claimId}/reschedule',
    checkStatus: baseUrl + 'providers/{providerId}/claims/{claimId}/status',
    getClaimCount: baseUrl + 'providers/{providerId}/claims/count',
  };
  static eligibility = {
    find: baseUrl + 'providers/{providerId}/eligibility',
    patientFind: baseUrl + 'patients/{patientId}/eligibility',
    add: baseUrl + 'providers/{providerId}/eligibility',
    getById: baseUrl + 'providers/{providerId}/eligibility/{eligibilityId}',
    //edit: baseUrl + 'providers/{providerId}/eligibility/{eligibilityId}',
    checkStatus: baseUrl + 'providers/{providerId}/eligibility/{eligibilityId}/status'
  };
  static emailSettings = {
    putProviderEmailSettings: AppSetting.baseUrl + 'providers/{parentId}/providersettings/email',
    verifyIdentity: AppSetting.baseUrl + 'providers/{parentId}/verifyidentity',
    isVerifiedIdentity: AppSetting.baseUrl + 'providers/{parentId}/isverifiedidentity'
  };

  static productUploads = {
    uploadProductsFile: AppSetting.baseUrl + 'providers/{parentId}/uploaditems',
    getAllUploadLogs: AppSetting.baseUrl + 'providers/{parentId}/uploaditems',
    getByIdUploadLog: AppSetting.baseUrl + 'providers/{parentId}/uploaditems/{id}',
  }

  static patientUploads = {
    uploadPatientFile: AppSetting.baseUrl + 'providers/{parentId}/uploadpatients',
    getAllUploadLogs: AppSetting.baseUrl + 'providers/{parentId}/uploadpatients',
    getByIdUploadLog: AppSetting.baseUrl + 'providers/{parentId}/uploadpatients/{id}',
    uploadPatientAttachment: AppSetting.baseUrl + 'providers/{parentId}/uploadpatients',
  }

  static role = {
    find: baseUrl + 'providers/{providerId}/roles',
    add: baseUrl + 'providers/{providerId}/roles',
    delete: baseUrl + 'providers/{providerId}/roles/{roleId}',
    getById: baseUrl + 'providers/{providerId}/roles/{roleId}',
    edit: baseUrl + 'providers/{providerId}/roles/{roleId}',
    lookup: baseUrl + 'providers/{providerId}/roles/lookup',
    activateDeactivateRole: baseUrl + 'providers/{parentId}/roles/{roleId}/activations',
  };

  static attachments = {
    providerAttachment: AppSetting.baseUrl + 'providers/{parentId}/patients/{patientId}/docs',
    providerDelete: AppSetting.baseUrl + 'providers/{parentId}/patients/{patientId}/docs/{docId}',
    patientAttachment: AppSetting.baseUrl + 'patients/{patientId}/docs',
    patientDelete: AppSetting.baseUrl + 'patients/{patientId}/docs/{docId}',
    authorize: AppSetting.baseUrl + 'patients/{patientId}/docs/authorize',
  }

  static notification = {
    get: baseUrl + 'providers/{providerId}/claims',
    getById: baseUrl + 'providers/{providerId}/claims/{claimId}',
  };

  static defaultDueInDaysForInvoice = 0;

  static dueInDaysOptionsList = [
    { 'name': 'On Receipt', id: 0 },
    { 'name': 'Custom', id: '' },
    { 'name': 'Net 10', id: 10 },
    { 'name': 'Net 15', id: 15 },
    { 'name': 'Net 30', id: 30 },
    { 'name': 'Net 45', id: 45 }
  ];
  static excerptSize = 150;
  static npiSearchApiVersion = '2.1';
  static npiSearchApiMinResult = 20;
  static maxRefundLimitInDays = 180;

}


