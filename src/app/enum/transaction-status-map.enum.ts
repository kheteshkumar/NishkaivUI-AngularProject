export enum TransactionStatusMapEnum {
  Created = 'Created',  // 0
  Pending = 'Pending',  // 1
  Authorized = 'Authorized',  // 2
  Posted = 'Posted',  // 3
  Captured = 'Accepted',  // 4 (Earlier it was- Settled)
  Failed = 'Failed',  // 5
  Returned = 'Returned',  // 6
  Chargeback = 'Chargeback',  // 7
  Cancelled = 'Void',  // 8
  Refunded = 'Refunded',  // 9
  Approved = 'Approved',  // 10
  CancelAttempt = 'Void attempted',  // 11
  RefundAttempt = 'Refund attempted' , // 12
  Hold = 'Hold',  // 13
  Denied = 'Denied',  // 14
  SettlementHold = 'Settlement hold', // 15
  Success = 'Success',  // 16
  ReprocessAttempt = 'Reprocess attempted',
  Reprocessed = 'Reprocessed',
  Unknown = 'Unknown',  // 100
  PartiallyCaptured = 'Partially accepted', // 101
  PartiallyReturned = 'Partially returned', // 102
  PartialReturnRequested = 'Partial return requested', // 103
  Closed = 'Closed', //30
  Deleted = 'Deleted' //25 where Recurring schdule table record is deleted
}
