export enum InvoiceStatusEnum {
    'Draft' = 1,
    'Finalize' = 2,
    'Cancelled' = 3,
    'FullPaymentCreated' = 4,  //'PayInProgress' = 4,
	'PaymentPlanCreated' = 5,
    'OneTimeScheduledCreated'= 6,   //'PayScheduled' = 6,
	'SubscriptionPlanCreated' = 7,
	'InProgress' = 8, //Unknown = 100,Created = 0,Pending = 1,Approved = 10,
    'Paid' = 9,  //Authorized = 2,Success = 16,
    'Unpaid' = 10,  //Failed = 5, Cancelled = 8,Refunded = 9,CancelAttempt = 11,RefundAttempt = 12,Denied = 14
    'Unsubscribed' = 11, //subscription payment plan when cancel = 8
    'Closed' = 30
}
export enum InvoiceStatusReportEnum {
    'Ready To Send'= <any>1,
    'Awaiting Payment'= <any>2,
    'Cancelled'= <any>3,
    'Full payment created'= <any>4,
    'Payment plan created'= <any>5,
    'OneTime scheduled created'= <any>6,
    'Subscription plan created'= <any>7,
    'In progress'= <any>8,
    'Paid'= <any>9,
    'Unpaid'= <any>10,
    'Unsubscribed'= <any>11,
    'Closed'= <any>30
  }
export enum InvoiceStatusMapEnum {
    'Draft' = 'Ready To Send',
    'Finalize' = 'Awaiting Payment',
    'Cancelled' = 'Cancelled',
    'FullPaymentCreated' = 'Payment Created',
    'PaymentPlanCreated' = 'Payment Plan Created',
    'OneTimeScheduledCreated' = 'Payment Scheduled',
    'SubscriptionPlanCreated' = 'Subscription Plan Created',
    'InProgress' ='In Progress',
    'Paid' = 'Paid',
    'Unpaid' = 'Unpaid',
    'Unsubscribed' ='Unsubscribed',
    'Closed' = 'Closed'
}

export enum InvoicePaymentStatusEnum {
    'Unpaid' = 1,
    'PartiallyPaid' = 2,
    'Paid' = 3
}

export enum InvoiceLineItemSourceEnum {
    'Product' = 1,
    'Manual' = 2
}

export enum InvoiceTypeEnum {
    'OneTime'=   0,
    'Installment'=   1,
    'ScheduledOneTime'=  2,
    'Subscription'= 3
}
export enum InvoiceTypeMapEnum {
    'OneTime'=   'Full Payment',
    'Installment'=   'Installment',
    'ScheduledOneTime'=  'Scheduled One Time',
    'Subscription'= 'Subscription'
}
