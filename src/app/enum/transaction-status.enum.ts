export enum TransactionStatusEnum {
Created = 0,
Pending = 1,
Authorized = 2,
Posted = 3,
Captured = 4,  // (Earlier it was- Settled)
Failed = 5,
Returned = 6,
Chargeback = 7,
Cancelled = 8,
Refunded = 9,
Approved = 10,
CancelAttempt = 11,
RefundAttempt = 12,
Hold = 13,
Denied = 14,
SettlementHold = 15,
Success = 16,
Retried=17,
ReprocessAttempt = 18,
Reprocessed = 19,
Unknown = 100,
PartiallyCaptured = 101,
PartiallyReturned = 102,
PartialReturnRequested = 103,
Closed = 30,
Deleted = 25 //where Recurring schdule table record is deleted
}
