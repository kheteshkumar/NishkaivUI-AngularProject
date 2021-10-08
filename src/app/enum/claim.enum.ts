export enum ClaimStatusEnum {
    InQueue = 1,
    RequestSent = 2,  // Integrix Status received is 'in processing'
    Cancelled = 3,
    ActionRequired = 4, // provided needs to add more data to claim request like claimNo,taxId
    Open = 5, // Claim Status Response received but fulfillment criteria not matched but claim repetition pending
    Denied = 6, // claim is updated as denied from  integrix response 
    Paid = 7, // claim fulfillment criteria is matched
    Closed = 8  // claim fulfillment criteria is not matched and last claim hit is also done..
}

export enum ClaimStatusMapEnum {
    'Open' = 'Open',
    'RequestSent' = 'Request Sent',
    'InQueue' = 'In Queue',
    'ActionRequired' = 'Action Required',
    'Denied' = 'Denied',
    'Cancelled' = 'Cancelled',
    'Paid' = 'Paid',
    'Closed' = 'Closed'
}