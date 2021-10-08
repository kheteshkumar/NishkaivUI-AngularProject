export enum TransactionOperationEnum {
  Sale = 0,
  VerifyOnly = 1,  // PreAuth for CC //auth
  ForceSale = 2,   // Force Auth For CC //forcecap
  Adjust = 3,      // Tip
  Activate = 4,
  Deactivate = 5,
  Reload = 6,      // For Pre paid cards
  Refund = 7,      // void (Earlier it was -Return)
  Inquire = 8,       // For Gift Card And EBT
}

export enum TransactionTypeEnum {
  'Sale' = '0',
  'Auth Only' = '1',  // PreAuth for CC //auth// PreAuth for CC //auth
}

export enum TransactionTypeForReport {
  Sale = 0,
  VerifyOnly = 1,
}
