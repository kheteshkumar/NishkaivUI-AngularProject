export enum DownloadToCSV_FacilityManagement {
  name = 'Facility_Name',
  branchName = 'Branch_Name',
  fullAddress = 'Address',
  isActive = 'Status',
  phone = 'Phone_Number',
  createdOn = 'Created_On',
  url = 'Url'
}
export enum DownloadToCSV_ProviderManagement {
  fullName = 'Provider_Name',
  name = 'Provider_Company',
  fullAddress = 'Address',
  isActive = 'Status',
  phone = 'Phone_Number',
  email = 'Email_Id',
  createdOn = 'Created_On',
  url = 'Url',
  branchName = 'Facility Branch',
  facilityName = 'Faciltiy Name',
  providerNpi = 'Provider Npi',
  merchantKey = 'Merchant Key',
  fromEmail = 'Email',
  providerUrlSuffix = 'Provider Url Suffix'
}

export enum DownloadToCSV_TransactionList {
  authCode = 'Auth_Code',
  captureAmount = 'Total_Amount',
  channelType = 'Channel_Type',
  cardNumber = 'Card_Number',
  cardType = 'Card_Type',
  convenienceAmount = 'Convenience_Amount',
  customerName = 'Customer_Name',
  nameOnCheckOrCard = 'Name_On_Card',
  settlementDate = 'Settlement_Date',
  taxAmount = 'Tax_Amount',
  tipAmount = 'Tip_Amount',
  transactionDate = 'Transaction_Date',
  transactionStatus = 'Transaction_Status',
  amount = 'Amount',
}

export enum DownloadToCSVForACH_TransactionList {
  authCode = 'Auth_Code',
  captureAmount = 'Total_Amount',
  channelType = 'Channel_Type',
  accountNumber = 'Account_Number',
  convenienceAmount = 'Convenience_Amount',
  customerName = 'Customer_Name',
  routingNumber = 'Routing_Number',
  settlementDate = 'Settlement_Date',
  taxAmount = 'Tax_Amount',
  tipAmount = 'Tip_Amount',
  transactionDate = 'Transaction_Date',
  transactionStatus = 'Transaction_Status',
  amount = 'Amount',
}




export enum DownloadToCSV_PatientManagement {
  fullName = 'Name',
  fullAddress = 'Address',
  phone = 'Phone_Number',
  email = 'Email_Id',
  mrn = 'MRN No',
  dob = 'DOB',
  isInsured = 'Has Insurance',
  createdOn = 'Created On',
  // isRegistered = 'Status',
  primaryFullName = 'Policyholder\'s Name',
  primaryFullAddress = 'Policyholder\'s Address',
  relation = 'Policyholder\'s Relationship',
  primaryMobile = 'Policyholder\'s Phone',
  primaryEmail = 'Policyholder\'s Email',
  insurancePartner = 'Insurance Payer',
  policyNo = 'Policy No',
  groupNo = 'Group No',
  binNo = 'Bin No',
  secFullName = 'Secondary Policyholder\'s Name',
  SecFullAddress = 'Secondary Policyholder\'s Address',
  secRelation = 'Secondary Policyholder\'s Relationship',
  secMobile = 'Secondary Policyholder\'s Phone',
  secEmail = 'Secondary Policyholder\'s Email',
  SecInsurancePartner = 'Secondary Insurance Payer',
  secPolicyNo = 'Secondary Policy No',
  secGroupNo = 'Secondary Group No',
  secBinNo = 'Secondary Bin No',
  authorizeMode = 'Authorize Mode',
  isOptIn = 'Is Opted In',
}

export enum DownloadToCSV_PatientReport {
  reportType = 'Report Type',
  value = 'Value',
  before24HrPatientCount = 'Patients Registered in 24 Hours',
  customPatientCount = 'Patients Registered in Selected Period',
  monthlyPatientRecord = ' Patients Registered in 1 Month',
  totalPatientRegistered = 'Total Patients Registered',
  yearlyPatientRecord = 'Patients Registered in 1 Year',

}

export enum DownloadToCSV_ScheduledPaymentReport {
  reportType = 'Report Type',
  value = 'Value',
  totalAmount = 'Total Amount',
  totalTransactionCount = 'Total Count'

}

export enum DownloadToCSV_OutstandingReceivablesReport {
  reportType = 'Report Type',
  value = 'Value',
  totalOutstandingBalance = 'Total Outstanding Balance',

}

export enum DownloadToCSV_TransactionStatusReport {
  channelType = 'Channel Type',
  operationType = 'Operation Type',
  totalSalesAmount = 'Total Sales Amount',
  totalTransactions = 'Total Transactions',
  transactionStatus = 'Transaction Status',
}

export enum DownloadToCSV_TransactionReport {
  paymentMethod = 'Payment Method',
  operationType = 'Operation Type',
  cardType = 'Card Type',
  transactionCount = 'Total Transactions',
  salesAmount = 'Sales Amount',
}

export enum DownloadReportForRecurringPayment {
  fullName = 'Name',
  email = 'Email',
  discountAmount = 'Discount_Amount',
  endDate = 'End_Date',
  frequency = 'Frequency',
  nextTransactionDate = 'Next_Transaction_Date',
  recurringStatus = 'Status',
  recurringTransactionName = 'Payment_Plan_Name',
  recurringTransactionType = 'Payment_Type',
  startDate = 'Start_Date',
  subTotal = 'Amount',
  taxAmount = 'Tax_Amount',
  totalAmount = 'Total_Amount',
  totalNumberOfPayments = 'Number_Of_Payment',
  isCreditCardAccount = 'Credit_Card/ACH',
  maskedCardNumber = 'Card_Number',
  maskedAccountNumber = 'Account_Number'
}

export enum DownloadReportForCustomPlan {
  amount = 'Amount',
  description = 'Plan_Description',
  discountAmount = 'Discount_Amount',
  discountRate = 'Discount_Rate',
  discountType = 'Discount_Type',
  frequency = 'Frequency',
  instalmentAmount = 'Installment_Amount',
  isActive = 'Status',
  name = 'Plan_Name',
  noOfInstalments = 'Number_Of_Installment',
  productsAndServices = 'Products_And_Services',
  recurringType = 'Payment_Type',
  totalAmount = 'Total_Amount'
}

export enum DownloadReportForProduct {
  createdOn = 'Created_On',
  name = 'Product Name',
  unitPrice = 'Unit Price',
  description = 'Description',
  discountType = 'Discount Type',
  discount = 'Discount Amount',
  cptCode = 'Cpt Code',
  categoryType = 'Category Type',
  status = 'Status',
  tags = 'Tags',
}


export enum DownloadToPDF_Invoice {
  reportType = 'Report Type',
  value = 'Value',
  productName = 'Product/Services',
  quantity = 'Quantity',
  unitRate = 'Unit Rate',
  discount = 'Discount',
  totalDiscount = 'Total Discount',
  rate = 'Rate',
  calculatedAmount = 'Amount',
  subTotal = 'SubTotal',
  finalAmount = 'Total Amount',
  tax = 'Tax',
  totalTax = 'Total Tax',
  patientDetail = 'Patient',
  invoiceDate = 'Invoice Date',
  dueDate = 'Due Date',
  visitDate = 'Visit Date',
  serviceDate = 'Service Date',
  note = 'Note',

}

export enum DownloadToCSV_InsuranceManagement {
  name = 'Insurance Name',
  phone = 'Phone Number',
  email = 'Email Id',
  address = 'Address',
  state = 'State',
  city = 'City',
  countryText = 'Country',
  postalCode = 'Postal Code',
  createdOn = 'Creation Date'
}

export enum DownloadToCSV_DoctorManagement {
  doctorType = 'Provider Type',
  firstName = 'First Name',
  lastName = 'Last Name',
  mobile = 'Phone Number',
  email = 'Email Id',
  address = 'Address',
  adddressLine1 = 'Address Line1',
  adddressLine2 = 'Address Line2',
  state = 'State',
  city = 'City',
  countryText = 'Country',
  postalCode = 'Postal Code',
  createdOn = 'Creation Date',
  npi = 'NPI Number'
}

export enum DownloadToCSV_TodaysAppointment {
  fullName = 'Patient Name',
  fromDate = 'From Date',
  toDate = 'To Date',
  email = 'Email',
  duration = 'Duration (in Mins)'
}




export enum DownloadToPDF_Receipt {
  reportType = 'Report Type',
  value = 'Value',
  providerId = 'Provider ID',
  cardDetails = 'Card Details',
  checkDetails = 'Check Details',
  accountDetails = 'Account Details',
  cardNumber = 'Card Number',
  accountNumber = 'Account Number',
  nameOnCard = 'Name on Card',
  nameOnAccount = 'Account Name',
  cardType = 'Card Type',
  bankName = 'Bank Name',
  institutionName = 'Name of Institution',
  paymentType = 'Payment Type',
  totalDiscount = 'Total Discount',
  discount = 'Discount',
  rate = 'Rate',
  calculatedAmount = 'Amount',
  subTotal = 'SubTotal',
  finalAmount = 'Total Amount',
  tax = 'Tax',
  totalTax = 'Total Tax',
  note = 'Memo',

}