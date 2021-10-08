export enum EligibilityStatusEnum {
    InQueue = 1,
    RequestSent = 2,  // Integrix Status received is 'in processing'
    Deleted = 3,
    ActionRequired = 4, // provided needs to add more data to Eligibility request like EligibilityNo,taxId
    Completed = 5, // Eligibility Status Response received but fulfillment criteria not matched but Eligibility repetition pending

}

export enum EligibilityStatusMapEnum {
    'RequestSent' = 'Request Sent',
    'InQueue' = 'In Queue',
    'ActionRequired' = 'Action Required',
    'Deleted' = 'Deleted',
    'Completed' = 'Completed'
}