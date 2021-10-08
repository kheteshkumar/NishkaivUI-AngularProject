export enum ReportFilter {
  fromdate = 'Start Date',
  todate = 'End Date',
  cardType = 'Channel Type',
  isActive = 'Is Activated',
  endDate = 'End Date',
  startDate = 'Start Date',
  companyName = 'Company Name',
  email = 'Email',
  status = 'Status',

  // transaction Management
  minAmount = 'Minimum Amount',
  maxAmount = 'Maximum Amount',
  cardNo = 'Card Number',
  recurringId = 'Payment Plan Id',

  // recurring payment
  nextBillingStartDate = 'Next Billing Start Date',
  nextBillingEndDate = 'Next Billing End Date',
  paymentName = 'Payment Name',
  type = 'Payment Type',

  // custom plan
  planName = 'Plan Name',
  frequency = 'Frequency',

  // Facility
  facilityName = 'Facility Name',

  // Provider
  providerName = 'Provider Name',
  providerCompany = 'Provider Company',
  branchName = 'Facility Branch',

  // Patient
  patientName = 'Patient Name',
  mrn = 'Mrn No',

  // Product
  name = 'Name',
  discountMinAmount = 'Discount Minimum Amount',
  discountMaxAmount = 'Discount Maximum Amount',
  discountType = 'Discount Type',

  // Insurance
  insuranceName = 'Insurance Name',
  phone = 'Phone',
  // Doctor
  doctorName = 'Doctor Name',
}
