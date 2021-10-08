export enum UploadFileStatusEnum {
  PROCESSING = 1,
  PROCESSED = 2,
  ERROR = 3,
}
export enum UploadRecordStatusEnum {
  FAILED = 1,
  PASSED = 2,
}

export enum PatientUploadRecordEnum {
  Error = 'Error',
  FirstName = 'First Name',
  LastName = 'Last Name',
  Mrn = 'MRN',
  Dob = 'DOB(MM/DD/YYYY)',
  Phone = 'Phone',
  Email = 'Email',
  OptIn = 'Opt In for Text Message(Y/N)',
  AddressLine1 = 'Address Line 1',
  AddressLine2 = 'Address Line 2',
  City = 'City',
  State = 'State',
  Country = 'Country(USA/CANADA)',
  PostalCode = 'Postal Code',
  // HasInsurance = 'Has Insurance(Y/N)',
  // InsurancePayer = 'Insurance Payer',
  // PayerId = 'Payer Id',
  // PolicyNumber = 'Policy No.',
  // GroupNumber = 'Group No.',
  // BinNumber = 'Bin No.',
  // Relationship = 'Relationship(Self/Spouse/Parent/Other)',
  // InsurerFirstName = 'Insurer First Name',
  // InsurerLastName = 'Insurer Last Name',
  // InsurerPhone = 'Insurer Phone',
  // InsurerEmail = 'Insurer Email',
  // InsurerSameAddress = 'Is insurer has same addresss(Y/N)',
  // InsurerAddressLine1 = 'Insurer Address Line 1',
  // InsurerAddressLine2 = 'Insurer Address Line 2',
  // InsurerCity = 'Insurer City',
  // InsurerState = 'Insurer State',
  // InsurerCountry = 'Insurer Country',
  // InsurerPostalCode = 'Insurer Postal Code',
  Comment = 'Comment'
}

export enum ProductUploadRecordEnum {
  Error = 'Error',
  //ProductType = 'Product Type',
  //CodeType = 'Code Type',
  Name = 'Name',
  //CptIcd10Code = 'CPT/ICD10 Code',
  //Icd10Code = 'ICD10 Code',
  Quantity = 'Quantity',
  UnitPrice = 'Unit Price',
  TaxPercent = 'Tax Percent',
  Description = 'Description',
  //Tags = 'Tags',
  //Comment = 'Comment'
}