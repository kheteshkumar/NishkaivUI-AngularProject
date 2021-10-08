export class ProcessorException {
  static processorExceptionMessages = {
    // Elavon
    'AA': 'Approved Transaction',
    'AP': 'Approved Transaction for a Partial Amount',
    'AC': 'Approved Transaction (without Cashback)',
    'NC': 'Decline (Pick Up Card)',
    'ND': 'Decline (Hard or Soft)',
    'NF': 'Decline (Record Not Found)',
    'NR': 'Decline (Referral Message)',
    'N7': 'Decline (For CVV2 Only)',
    'NL': 'Decline (Loyalty/Gift Error)',

    // TSYS
    '500': 'Gateway lost its connection to the network or host while processing the transaction The transaction should be re-attempted If this condition continues, contact Administrator',
    '501': 'The Visa II packet contained a bad BIN, or the host was either unavailable or disconnected prematurely Check BIN and re-try transaction.',
    '502': 'The Visa II packet was formatted improperly. Check the format of the transaction and try again',
	  '503': 'SSL Gateway is unable to contact the network or the host Re-try transaction. If condition persists,contact Administrator',
    '504': 'Merchant attempted to submit a transaction through a transaction other than POST (for example GET) Re-submit transaction as a POST transaction',
    '505': 'SSL Gateway received an invalid response from the network or host. Re-try the transaction. If condition persists, contact administrator NOTE For an SSL connection, make sure Application Type value is set to 4 (Interleaved)',
    '506': 'SSL Gateway received a host response larger than it is capable of handling Re-try the transaction If condition persists, contact Administrator',
    '507': 'The HTTP Content-Type header must be a recognized type (currently "x-Visa-II/x-auth" or "x-Visa-II/x-settle")',
    '508': 'Gateway reached end of settlement batch before receiving a response from the host This can be caused by the omission of a trailer record or other framing errors',
    '509': 'Host rejected the settlement batch for some reason. The number of records sent prior to receiving the NAK is returned to the client for further investigation.',
    '510': 'The SSL Gateway only accepts auth. transactions through the Visa II interleaved protocol (type 4 record). Make sure the submitted packet is formatted correctly and re-try the transaction',
    '511': 'Record in batch does not begin with 0x82. The submitted settlement transaction contains an improperly framed record',
    '512': 'Record in batch does not end with ETX/E113. The submitted settlement transaction contains an improperly framed record',
    '513': 'Record in batch missing LRC. The submitted settlement transaction contains an improperly framed record',
    '514': 'Record in batch is not application type 1. The SSL Payment Gateway only supports application type 1 records.',

    '00': 'Approved Transaction',
    '01': 'Refer to issuer',
    '02': 'Refer to issuer-Special condition',
    '03': 'Term ID Error. Invalid Merchant ID',
    '04': 'Hold-call or Pick Up Card.',
    '05': 'Incorrect CVV code',
    '06': 'Error XXXX General error',
    '07': 'Hold-call or Pick Up Card, special condition (fraud account)',
    '08': 'Approval Honor Mastercard with ID',
    '10': 'Partial approval for the authorized amount returned in Group III version 022',
    '11': 'Approval VIP approval',
    '12': 'Invalid transaction',
    '13': 'Invalid amount',
    '14': 'Invalid card number',
    '15': 'No Such Issuer',
    '19': 'Re-enter transaction',
    '21': 'No Action Taken.Unable to back out transaction',
    '25': 'Unable to locate the account number',
    '28': 'No Reply File is temporarily unavailable',
    '34': 'Transaction Cancelled Mastercard use only; Fraud Concern (Used in reversal requests only)',
    '39': 'No credit account',
    '41': 'Pick Up Card Lost card,(fraud account)',
    '43': 'Pick Up Card Stolen card,(fraud account)',
    '51': 'Decline Insufficient funds',
    '52': 'No checking account',
    '53': 'No savings account',
    '54': 'Expired card',
    '55': 'Incorrect PIN',
    '57': 'Serv not allowed Transaction not permitted-Card',
    '58': 'Serv not allowed Transaction not permitted-Terminal',
    '59': 'Serv not allowed Transaction not permitted-Merchant',
    '61': 'Declined.Exceeds withdrawal limit',
    '62': 'Declined.Invalid service code, restricted',
    '63': 'Security violation',
    '65': 'Declined.Activity limit exceeded',
    '75': 'PIN tried exceeded',
    '76': 'Unsolicated.Reversal Unable to locate, no match',
    '77': 'No Action Taken.Inconsistant data, reversed, or repeat',
    '78': 'No Account',
    '79': 'Already reversed at switch',
    '80': 'No Financial impact (used in reversal responses to declined originals).',
    '81': 'Encryption Error.Cryptographic error',
    '82': 'CVV data is not correct',
    '83': 'Cannot verify PIN',
    '85': 'Card OK.No reason to decline',
    '86': 'Cannot verify PIN',
    '91': 'No Reply Issuer or switch is unavailable',
    '92': 'Invalid Routin.Destination not found',
    '93': 'Decline.Violation,cannot complete',
    '94': 'Duplicate Trans Unable to locate,no match',
    '96': 'System Error System malfunction',
    'A1': 'Activated POS device authentication successful',
    'A2': 'Not Activated POS device authentication not successful',
    'A3': 'Deactivated POS device deactivation successful',
    'B1': 'Surcharge amount not permitted on debit cards or EBT food stamps',
    'B2': 'Surcharge amount not supported by debit network issuer',
    'CV': 'Failure CV Card Type Verification Error',
    'D3': 'SECUR CRYPT FAIL Transaction failure due to missing or invalid 3D-Secure cryptogram',
    'E1': 'ENCR NOT CONFIGD.Encryption is not configured',
    'E2': 'TERM NOT AUTHENT.Terminal is not authenticated',
    'E3': 'DECRYPT FAILURE.Data could not be decrypted',
    'EA': 'Acct Length Error.Verification error',
    'EB': 'Check Digit Error.Verification error',
    'EC': 'CID Format.Error Verification error',
    'HV': 'Failure.HV Hierarchy Verification Error',
    'K0': 'TOKEN RESPONSE.Token request was processed',
    'K1': 'TOKEN NOT CONFIG.Tokenization is not configured',
    'K2': 'TERM NOT AUTHENT.Terminal is not authenticated',
    'K3': 'TOKEN FAILURE.Data could not be de-tokenized',
    'M0': 'DOM DBT NOT ALWD.Mastercard: Canada region-issued Domestic Debit Transaction not allowed',
    'N3': 'Cash back service not available',
    'N4': 'Decline Exceeds issuer withdrawal limit',
    // 'N7': 'CVV2 Value supplied is invalid',
    'P0': 'SERV NOT ALLOWED.Contact Merchant Services/Technical Support',
    'P1': 'SERV NOT ALLOWED.Contact Merchant Services/Technical Support',
    'P2': 'SERV NOT ALLOWED.Contact Merchant Services/Technical Support',
    'P3': 'SERV NOT ALLOWED.Contact Merchant Services/Technical Support',
    'P4': 'SERV NOT ALLOWED.Contact Merchant Services/Technical Support',
    'P5': 'SERV NOT ALLOWED.Contact Merchant Services/Technical Support',
    'P6': 'SERV NOT ALLOWED.Contact Merchant Services/Technical Support',
    'P7': 'Missing Serial Num.The terminal has not yet completed the boarding process. The Serial Number has not been set up.',
    'Q1': 'authentication failed',
    'R0': 'Stop recurring Customer.requested stop of specific recurring payment',
    'R1': 'Stop recurring Customer.requested stop of all recurring payments from specific merchant',
    'T0': 'Approval.First check is OK and has been converted',
    'T1': 'Cannot Convert Check is OK but cannot be converted This is a declined transaction',
    'T2': 'not an ACH participant',
    'T3': 'Amount Error.Amount greater than the limit',
    'T4': 'Unpaid items,failed negative file check',
    'T5': 'Duplicate check number',
    'T6': 'MICR error',
    'T7': 'Too many checks (over merchant or bank limit)',
    'V1': 'Failure VM.Daily threshold exceeded',

    // Actum
    'DAR104': 'Account number length > 17',
    'DAR105': 'Account number contains 123456',
    'DAR108': 'Invalid ABA Number',
    'DAR109': 'Invalid Fractional',
    'DCR103': 'Name scrub',
    'DCR105': 'Email blocking',
    'DCR106': 'Previous scrubbed account (Negative BD)',
    'DCR107': 'Recurring Velocity Check Exceeded',
    'DDR101': 'Duplicate Check indicates that this transaction was previously declined',
    'DMR001': 'Invalid merchant',
    'DMR002': 'Invalid billing profile',
    'DMR003': 'Invalid cross sale ID',
    'DMR004': 'Invalid Consumer Unique',
    'DMR005': 'Missing field: processtype, parent_id, mersubid, accttype, consumername, accountname, host_ip, or client_ip',
    'DMR006': 'Payment Type Not Supported',
    'DMR007': 'Invalid Origination Code',
    'DMR102': 'Transaction over limit for merchant',
    'DMR103': 'Account not eligible for promotion',
    'DMR104': 'Merchant not authorized for credit',
    'DMR105': 'Invalid or non-matching original order for repeat-order-only SubID',
    'DMR106': 'Invalid Amount Passed In',
    'DMR107': 'Invalid Merchant TransID Passed In',
    'DMR109': 'Invalid SysPass or SubID',
    'DMR110': 'Future Initial Billing not authorized for this merchant',
    'DMR201': 'Amount over the per-trans limit',
    'DMR202': 'Amount over daily amount limit',
    'DMR203': 'Count over daily count limit',
    'DMR204': 'Amount over monthly amount limit',
    'DMR205': 'Count over monthly count limit',
    'DOR001': 'An upgrade has already been processed for the order',
    'DOR002': 'A recur has been found for Order',
    'DOR003': 'A return has been found for Order',
    'DOR004': 'Order was not found',
    'DOR005': 'Order is not active.',
    'DOR006': 'The merchant does not match the order',
    'DOR007': 'Upgrade Amount is missing.',
    'DOR008': 'Could not find original transaction for orderkeyid',
    'DOR009': 'Recur Record not found for keyid',
    'DOR010': 'Multiple transactions found with that TransID',
    'DTA001': 'TOAST decline',
    'DTE200': 'Account information could not be verified',
  };


  // static getProcessorExceptionMessage(error) {
  //   let toastMessage = '';
  //   // error = error.toLowerCase();
  //   switch (error) {
  //     case 'AA':
  //       toastMessage = 'Approved Transaction (Authorizations and Reversals)';
  //       break;

  //     case 'AP':
  //       toastMessage = 'Approved Transaction for a Partial Amount ';
  //       break;

  //     case 'AC':
  //       toastMessage = 'Approved Transaction (without Cashback) ';
  //       break;

  //     case 'NC':
  //       toastMessage = 'Decline (Pick Up Card) ';
  //       break;

  //     case 'ND':
  //       toastMessage = 'Decline (Hard or Soft) ';
  //       break;

  //     case 'NF':
  //       toastMessage = 'Decline (Record Not Found) ';
  //       break;

  //     case 'NR':
  //       toastMessage = 'Decline (Referral Message) ';
  //       break;

  //     case 'N7':
  //       toastMessage = 'Decline (For CVV2 Only) ';
  //       break;

  //     case 'NL':
  //       toastMessage = 'Decline (Loyalty/Gift  Error) ';
  //       break;
  //     // Add new exception keys above this line
  //     default :
  //     toastMessage = 'Something went wrong. Please contact administrator.';
  //   }
  //   return toastMessage;
  // }
}