export enum ChannelTypeEnum {
   NotDefined = 1,
   ACH = 2,
   CreditCard = 3,
   DebitCard = 4,
   Cash = 9,
   Check = 10,
}
export enum ChannelTypeTabEnum {
   'all' = 0,
   'ach' = 2,
   'credit' = 3,
   'debit' = 4,
   'cash' = 9,
   'check' = 10,
}
export enum ChannelTypeForReportEnum {
   'All' = '0',
   'ACH' = '2',
   'CC' = '3',
   'Debit' = '4',
   'Cash' = '9',
   'Check' = '10',
}
export enum ChannelTypeForPaymentPlanReportEnum {
   'All' = '0',
   'ACH' = '2',
   'CC' = '3'
}
export enum InvoicePaymentTypeForReportEnum{
   'All' = 'NA',
   'Installment' = '1',
   'Scheduled OneTime' = '2',
   'Subscription' = '3'
}
export enum TransactionVolumeTypeForReportEnum{
   'Payment Collected' = 'totalSale',
   //'InProcess' = 'inProcess',
   'Refund' = 'refund',
   'Decline' = 'decline'
}
export enum InvoiceReportTypeEnum {
   'All' = '0',
   'Total' = '1',
   'Tax' = '2',
   'Discount' = '3'
}
export enum ChannelTypeForReportListEnum {
   'All' = '0',
   'ACH' = '2',
   'Credit Card' = '3',
   'Debit Card' = '4',
   'Cash' = '9',
   'Check' = '10',
}
