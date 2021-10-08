export class Exception {

  static exceptionMessage(error) {
    const errormessage = [];

    if (error !== undefined && error !== null
      && error.error !== undefined && error.error !== null
      && error.error.errors !== undefined && error.error.errors !== null) {

      const errorArray = error.error.errors;
      if (errorArray.length === 0) {
        errormessage.push(this.getExceptionMessage(error.error.message));
      } else {
        for (const i in errorArray) {
          if (i) {
            if (errorArray[i]['message'].includes('Key_')) {
              errormessage.push(this.getExceptionMessage(errorArray[i]['message']));
            } else {

              errormessage.push(this.getExceptionMessage(errorArray[i]['field']));
            }
          }
        }
      }
      return errormessage;
    } else if (error.status === 401) {
      // if (error.error.errors === undefined) {
      errormessage.push(this.getExceptionMessage('User is not authorized to access this resource'));
      return errormessage;
      // }
    } else if (error.status === 403) {
      if (error.error.errors === undefined) {
        errormessage.push(this.getExceptionMessage(error.error.message));
        return errormessage;
      }
    } else if (error.status === 404) {
      if (error.error.errors === undefined) {
        errormessage.push(this.getExceptionMessage(error.error.message));
        return errormessage;
      }
    } else if (error.status === 400) {
      if (error.error.errors === undefined) {
        errormessage.push(this.getExceptionMessage(error.error.message));
        return errormessage;
      }
    } else if (error.status === 500) {
      errormessage.push('Internal server error. Please contact administrator.');
      return errormessage;
    }
    errormessage.push('Something went wrong. Please contact administrator.');
    return errormessage;
  }

  static getExceptionMessage(error) {
    let toastMessage = '';
    error = error.charAt(0).toUpperCase() + error.slice(1);
    switch (error) {
      case 'Key_PatientNotLinkedWithProvider':
        toastMessage = 'Your patient account is not activated with this provider. Please reach out to provider for more information.';
        break;
      // Payment Form
      case 'Key_FormNameCannotBeEmpty':
        toastMessage = 'Form name cannot be empty';
        break;
      case 'Key_FormAlreadyExist':
        toastMessage = 'Form Already exist';
        break;
      case 'Key_Address1CannotBeEmpty':
        toastMessage = 'Address1 cannot be empty';
        break;

      case 'Key_CityRequired':
        toastMessage = 'City name is required';
        break;

      case 'Key_StateRequired':
        toastMessage = 'State name is required';
        break;
      case 'Key_SSNInvalid':
        toastMessage = 'Invalid SSN';
        break;
      case 'Key_SsnAlreadyExists':
        toastMessage = 'SSN already exists';
        break;
      case 'Key_DateOfServiceCannotBeBlank':
        toastMessage = 'Date of service cannot be blank';
        break;
      case 'Key_PostalCodeCannotBeEmpty':
        toastMessage = 'Postal code can not be empty';
        break;

      case 'Key_EmailCannotBeEmpty':
        toastMessage = 'Email cannot be empty';
        break;

      case 'Key_CountryCannotBeEmpty':
        toastMessage = 'Country name is required';
        break;

      case 'Key_InvalidEmail':
        toastMessage = 'Email Id is invalid';
        break;

      case 'Key_MerchantInactive':
        toastMessage = 'Merchant is inactive';
        break;

      case 'Key_InactiveCustomerAccountId':
        toastMessage = 'Patient Account is Inactive';
        break;

      case 'Key_ProviderInActive':
        toastMessage = 'Provider is inactive';
        break;
      case 'Key_InvalidColourCode':
        toastMessage = 'Colour code is invalid';
        break;

      case 'Key_InvalidAllowedCreditCardType':
        toastMessage = 'Credit Card type is invalid';
        break;

      case 'Key_AllowedCreditCardTypeCannotBeEmpty':
        toastMessage = 'Card Card type cannot be empty';
        break;

      case 'Key_AccountAlreadyExists':
        toastMessage = 'Account already exists';
        break;

      case 'Key_NoSuchProvisionMetadataForThisGatewayAndProcessor':
        toastMessage = 'No such provision meta data for this gateway and processor';
        break;

      case 'Key_NoSuchChannelTypeForThisGatewayAndProcessor':
        toastMessage = 'No such channel type for this gateway and processor';
        break;

      case 'Key_NoSuchProcessorForThisGatewayAndChannelType':
        toastMessage = 'No such processor for this gateway and channel type';
        break;

      case 'Key_NoSuchProcessorForThisGateway':
        toastMessage = 'No such processor for this gateway';
        break;

      case 'Key_NoGatewaySupported':
        toastMessage = 'No gateway supported';
        break;

      case 'Key_InvalidGatewayName':
        toastMessage = 'Gateway name is invalid';
        break;

      case 'Key_InvalidProcessorName':
        toastMessage = 'Processor Name is invalid';
        break;

      case 'Key_InvalidChannelType':
        toastMessage = 'ChannelType is invalid';
        break;

      case 'Key_InvalidChannelSubType':
        toastMessage = 'Channel sub type not configured in allowed transaction types and processor configuration';
        break;

      case 'Key_InvalidUserName':
        toastMessage = 'Username is invalid';
        break;

      case 'Key_InvalidPassword':
        toastMessage = 'Password is invalid';
        break;

      case 'Key_NoSuchCustomerAccount':
        toastMessage = 'Patient account does not exists';
        break;

      case 'Key_InvalidAccountType':
        toastMessage = 'Account type is invalid';
        break;
      case 'Key_PhoneAlreadyExists':
        toastMessage = 'Phone already exists.';
        break;
      case 'Key_InvalidAccountNumber':
        toastMessage = 'Account number is invalid';
        break;

      case 'Key_InvalidRoutingNumber':
        toastMessage = 'Routing number is invalid';
        break;

      case 'Key_CustomerNameInUse':
        toastMessage = 'Patient name is in use';
        break;

      case 'Key_CannotChangeAccountType':
        toastMessage = 'Cannot change account type';
        break;

      case 'Key_InvalidCardExpiry':
        toastMessage = 'Card expiry date is invalid';
        break;

      case 'Key_InvalidCardNumber':
        toastMessage = 'Card number is invalid';
        break;


      case 'Key_InvalidCardType':
        toastMessage = 'Card type is invalid';
        break;


      case 'Key_FirstNameCannotBeEmpty':
        toastMessage = 'First name cannot be empty';
        break;

      case 'Key_LastNameCannotBeEmpty':
        toastMessage = 'Last name cannot be empty';
        break;

      case 'Key_PhoneCannotBeEmpty':
        toastMessage = 'Phone number cannot be empty';
        break;

      case 'Key_Address2CannotBeEmpty':
        toastMessage = 'Address 2 cannot be empty';
        break;

      case 'Key_InvalidURL':
        toastMessage = 'URL is invalid';
        break;

      case 'Key_SetMerchant':
        toastMessage = 'Merchant is not set';
        break;

      case 'Key_NoTransactionTypeSet':
        toastMessage = 'Transaction type is not set';
        break;

      case 'Key_NoProcessorsSet':
        toastMessage = 'Processor is not set';
        break;

      case 'Key_NoProcessorSetForEachChannelType':
        toastMessage = 'Processor is not set for each channel type';
        break;

      case 'Key_DuplicateChannelSubType':
        toastMessage = 'Duplicate channel sub type';
        break;

      case 'Key_InValidTransactionType':
        toastMessage = 'Transaction type is invalid';
        break;

      case 'Key_RoleIsInUsed':
        toastMessage = 'Role is in use';
        break;

      case 'Key_InvalidFirstName':
        toastMessage = 'First name is invalid';
        break;

      case 'Key_InvalidLastName':
        toastMessage = 'Last name is invalid';
        break;

      case 'Key_InvalidFaxNo':
        toastMessage = 'Fax number is invalid';
        break;

      case 'Key_InvalidCompanyName':
        toastMessage = 'Provider name is invalid';
        break;

      case 'Key_InvalidPhoneNo':
        toastMessage = 'Phone number is invalid';
        break;

      case 'Key_InvalidCity':
        toastMessage = 'City name is invalid';
        break;

      case 'Key_InvalidPostalCode':
        toastMessage = 'Postal code is invalid';
        break;

      case 'Key_InvalidFederalTaxId':
        toastMessage = 'Federal Tax id is invalid';
        break;

      case 'Key_ResellerNameCannotBeEmpty':
        toastMessage = 'Reseller name cannot be empty';
        break;

      case 'Key_NameCannotBeEmpty':
        toastMessage = 'Name cannot be empty';
        break;

      case 'Key_CustomFeeNameAlreadyExists':
        toastMessage = 'Custom fee name already exists';
        break;

      case 'Key_InvalidFeeName':
        toastMessage = 'Fee name is invalid';
        break;

      case 'Key_InvalidFrequency':
        toastMessage = 'Frequency is invalid';
        break;


      case 'Key_InvalidFeeType':
        toastMessage = 'Fee Type is invalid';
        break;

      case 'Key_FeeCanNotBeDeletedAsIsItUsedInRatePlan':
        toastMessage = 'Fee cannot be deleted as it is used in rate plan';
        break;

      case 'Key_CanNotDeleteSystemFee':
        toastMessage = 'Cannot delete system fee';
        break;

      case 'Key_RatePlanIdInUse':
        toastMessage = 'Rate plan Id is in use';
        break;

      case 'Key_InvalidFeeId':
        toastMessage = 'Fee Id is invalid';
        break;

      case 'Key_InvalidUserType':
        toastMessage = 'User type is invalid';
        break;

      case 'Key_InvalidTargetId':
        toastMessage = 'Target Id is invalid';
        break;

      case 'Key_RatePlanCanNotBeDeletedAsAssignedResellerOrMerchantIsInActiveMode':
        toastMessage = 'Rate plan cannot be deleted as it is assiged to a reseller or merchant';
        break;

      case 'Key_RatePlanAlreadyAssignedToTargetId':
        toastMessage = 'Rate plan already assigned to target Id';
        break;

      case 'Key_BuyRateCanNotBeNegative':
        toastMessage = 'Buy Rate cannot be negative';
        break;

      case 'Key_SellRateCanNotBeNegative':
        toastMessage = 'Sell Rate cannot be negative';
        break;

      case 'Key_InvalidFrequencyParameter':
        toastMessage = 'Frequency parameter is invalid';
        break;

      case 'Key_StartDateCannotBeEmpty':
        toastMessage = 'Start date cannot be empty';
        break;

      case 'Key_ResellerInActive':
        toastMessage = 'Reseller is inactive';
        break;

      case 'Key_InvalidMerchantId':
        toastMessage = 'Merchant Id is invalid';
        break;

      case 'Key_InvalidRatePlanId':
        toastMessage = 'Please select Rate plan';
        break;

      case 'Key_RatePlanNameCannotBeEmpty':
        toastMessage = 'Rate plan name cannot be empty';
        break;

      case 'Key_RatePlanNameIsInUse':
        toastMessage = 'Rate plan name is in use';
        break;

      case 'Key_ParentIdIsInvalid':
        toastMessage = 'Parent Id is invalid';
        break;

      case 'Key_DuplicateFeeConfig':
        toastMessage = 'Duplicate fee config';
        break;

      // Infrastructure
      case 'Key_CannotGoToEmulationMode':
        toastMessage = 'Cannot go to emulation mode';
        break;

      case 'Key_OldPasswordBlank':
        toastMessage = 'Old password is blank';
        break;

      case 'Key_InvalidOldPassword':
        toastMessage = 'Old Password is invalid';
        break;

      case 'Key_InvalidUsernameOrPassword':
        toastMessage = 'Invalid username or password';
        break;

      case 'Key_PasswordCannotBeEmpty':
        toastMessage = 'Password cannot be empty';
        break;

      case 'Key_InvalidPasswordLength':
        toastMessage = 'Password length should be greater than 8 characters';
        break;

      case 'Key_MatchingPassword':
        toastMessage = 'New password cannot be the same as previous 3 passwords. Please enter a different new password and try again.';
        break;

      case 'Key_LockedAccount':
        toastMessage = 'Your account has been locked. Please try again in 30 minutes or request a password reset after 30 minutes.';
        break;

      case 'Key_UserNameCannotBeEmpty':
        toastMessage = 'Username cannot be empty';
        break;

      case 'Key_UserMustBeAtleastOf6Characters':
        toastMessage = 'Username must be of atleast 6 charaters long';
        break;

      case 'Key_UserNameAlreadyExist':
        toastMessage = 'Username already exists';
        break;

      case 'Key_RoleNameCanNotBeEmpty':
        toastMessage = 'Role name cannot be empty';
        break;

      case 'Key_RoleNameIsAlreadyUsed':
        toastMessage = 'Role Name is already used';
        break;

      case 'Key_EmailNotExistsInDatabase':
        toastMessage = 'Email Id does not exists';
        break;

      case 'Key_NoRecordsFound':
        toastMessage = 'No record found';
        break;

      case 'Key_InActiveAccount':
        toastMessage = 'Account is inactive';
        break;

      case 'Key_UserEmailAlreadyExist':
        toastMessage = 'User Email already exists';
        break;

      case 'Key_AccountIdUsedWithContract':
        toastMessage = 'Account Id used with contract';
        break;

      case 'Key_NumbersNotAllowed':
        toastMessage = 'Numbers not allowed';
        break;

      case 'Key_InvalidModifyAccess':
        toastMessage = 'Modify access is invalid';
        break;

      case 'Key_InvalidDeleteAccesse':
        toastMessage = 'Delete accesse is invalid';
        break;

      case 'Key_InvalidViewAccess':
        toastMessage = 'View access is invalid';
        break;

      case 'Key_InvalidExecuteAccess':
        toastMessage = 'Execute access is invalid';
        break;

      case 'Key_InvalidOperationid':
        toastMessage = 'Operation Id is invalid';
        break;

      case 'Key_OperartionCanNotBeEdited':
        toastMessage = 'Operation cannot be edited';
        break;

      case 'Key_OperartionCanNotBeDuplicate':
        toastMessage = 'Operation cannot be duplicate';
        break;

      case 'Key_InvalidRoleName':
        toastMessage = 'Role Name is invalid';
        break;

      case 'Key_InvalidRole':
        toastMessage = 'Role is invalid';
        break;

      case 'Key_InactiveParentReseller':
        toastMessage = 'Reseller is inactive.';
        break;

      case 'Key_TransactionDenied':
        toastMessage = 'Transaction Denied';
        break;

      case 'Key_InvalidChannelProvisionedData':
        toastMessage = 'Channel provision data is invalid';
        break;

      case 'Key_CannotRepeatOldTransaction':
        toastMessage = 'Cannot repeat old transaction';
        break;

      case 'Key_CannotRefundOldTransaction':
        toastMessage = 'Cannot refund old transaction';
        break;

      case 'Key_InvalidOperationType':
        toastMessage = 'Operation type is invalid';
        break;

      case 'Key_InvalidEBTCardExpiry':
        toastMessage = 'EBTCard expiry is invalid';
        break;

      case 'Key_CheckNumberMissing':
        toastMessage = 'Check number is missing';
        break;

      case 'Key_InvalidAmount':
        toastMessage = 'Amount is invalid';
        break;

      case 'Key_CardNumberMissing':
        toastMessage = 'Card number is missing';
        break;

      case 'Key_CardExpiryMissing':
        toastMessage = 'Card expiry date is missing';
        break;

      case 'Key_CardTypeMissing':
        toastMessage = 'Card type missing';
        break;

      case 'Key_InvalidTransactionCode':
        toastMessage = 'Transaction code is invalid';
        break;

      case 'Key_TenderInfoMissing':
        toastMessage = 'Tender info is missing';
        break;

      case 'Key_MerchantNotSpecified':
        toastMessage = 'Merchant is not specified';
        break;

      case 'Key_InvalidGatewayInfo':
        toastMessage = 'Gateway Info is invalid';
        break;

      case 'Key_InvalidProcessorInfo':
        toastMessage = 'Parent reseller is inactive';
        break;

      case 'Key_ChannelTypeUnknown':
        toastMessage = 'Channel Type unknown';
        break;

      case 'Key_MerchantDisabled':
        toastMessage = 'Merchant is disabled';
        break;

      case 'Key_CannotAdjustTransactionMerchantDisabled':
        toastMessage = 'Cannot adjust Transaction as merchant is disabled';
        break;

      case 'Key_DuplicateTransaction':
        toastMessage = 'Duplicate transaction';
        break;

      case 'Key_AdjustedAmountCannotbeLessThanZero':
        toastMessage = 'Adjusted amount cannot be less than zero';
        break;

      case 'Key_CannotAdjustTransactionMarchantMismatch':
        toastMessage = 'Cannot adjust Transaction Merchant mismatch';
        break;

      case 'Key_CannotAdjustTransactionNoTransactionResultFound':
        toastMessage = 'No transaction result found';
        break;

      case 'Key_CannotAdjustCancelledTransaction':
        toastMessage = 'Cannot adjust cancelled transaction';
        break;

      case 'Key_CannotAdjustSettledTransaction':
        toastMessage = 'Cannot adjust settled transaction';
        break;

      case 'Key_CannotAdjustTransactionInvalidOperationType':
        toastMessage = 'Operation type is invalid';
        break;

      case 'Key_CannotCancelTransaction':
        toastMessage = 'Cannot cancel transaction';
        break;

      case 'Key_CannotRefundTransaction':
        toastMessage = 'Cannot refund transaction';
        break;

      case 'Key_CannotResubmitTransaction':
        toastMessage = 'Cannot resubmit transaction';
        break;

      case 'Key_OperationNotSupportedByProcessor':
        toastMessage = 'Operation not supported by processor';
        break;

      case 'Key_FraudTransaction':
        toastMessage = 'Fraud transaction';
        break;

      case 'Key_CVVFraudTransaction':
        toastMessage = 'CVV fraud transaction';
        break;

      case 'Key_AVSFraudTransaction':
        toastMessage = 'AVS fraud transaction';
        break;

      case 'Key_PinDataNotCaptured':
        toastMessage = 'Pin data not captured';
        break;

      case 'Key_CancellationFailed':
        toastMessage = 'Cancellation failed';
        break;

      case 'Key_InvalidPNRef':
        toastMessage = 'PNRef is invalid';
        break;

      case 'Key_InvalidAuthCode':
        toastMessage = 'AuthCode is invalid';
        break;

      case 'Key_InvalidTraceNumber':
        toastMessage = 'Trace number is invalid';
        break;

      case 'Key_TransactionIsNotVerified':
        toastMessage = 'Transaction is not verified';
        break;

      case 'Key_MaximumAllowedRecordExceedsForBatchTransaction':
        toastMessage = 'Maximum allowed record exceeds for batch transaction';
        break;

      case 'Key_InvalidAuthCodeOrPNRef':
        toastMessage = 'Invalid AuthCode or PNRef';
        break;

      case 'Key_OriginalTransactionNotFound':
        toastMessage = 'Original transaction nor found';
        break;

      case 'Key_NoACHDetailFound':
        toastMessage = 'ACH details not found';
        break;

      case 'Key_NoCCDetailFound':
        toastMessage = 'CC details not found';
        break;

      case 'Key_NoDCDetailFound':
        toastMessage = 'DC details not found';
        break;

      case 'Key_CvvDataMissing':
        toastMessage = 'Cvv data missing';
        break;

      case 'Key_ProcessorResponseError':
        toastMessage = 'Transaction failed due to error in processor\'s response';
        break;

      case 'Key_NetworkError':
        toastMessage = 'Transaction failed due to network issues at processor\'s end';
        break;

      case 'Key_ChannelConfigurationMissing':
        toastMessage = 'Transaction failed due to invalid processor configuration';
        break;

      case 'Key_InvalidRequestData':
        toastMessage = 'Transaction failed due to invalid request data';
        break;

      case 'Key_InactiveParentMerchant':
        toastMessage = 'Please contact your Reseller, to activate the account';
        break;

      case 'Key_TransactionOnHold':
        toastMessage = 'Transaction is on hold';
        break;

      case 'Key_TransactionFailed':
        toastMessage = 'Transaction failed';
        break;

      case 'Key_DailyTransactionAmountExceedsTheLimitForMerchant':
        toastMessage = 'Daily transaction amount exceeds the limit';
        break;

      case 'Key_WeeklyTransactionAmountExceedsTheLimitForMerchant':
        toastMessage = 'Weekly transaction amount exceeds the limit';
        break;

      case 'Key_MonthlyTransactionAmountExceedsTheLimitForMerchant':
        toastMessage = 'Monthly transaction amount exceeds the limit';
        break;

      case 'Key_MaximumTransactionAmountExceedsTheLimitForMerchant':
        toastMessage = 'Maximum transaction amount exceeds the limit';
        break;

      case 'Key_DailyTransactionCountExceedsTheLimitForMerchant':
        toastMessage = 'Daily transaction count exceeds the limit';
        break;

      case 'Key_WeeklyTransactionCountExceedsTheLimitForMerchant':
        toastMessage = 'Weekly transaction count exceeds the limit';
        break;

      case 'Key_MonthlyTransactionCountExceedsTheLimitForMerchant':
        toastMessage = 'Monthly transaction count exceeds the limit';
        break;

      case 'Key_YourTransactionIsOnHold':
        toastMessage = 'Your transaction is on hold';
        break;

      case 'Key_TransactionNotSucssessfulVelocityNotUpdated':
        toastMessage = 'Transaction not successful, Velocity not updated';
        break;

      case 'Key_CountryOrIpAddressIsBlocked':
        toastMessage = 'Country or IP address is blocked';
        break;

      // Merchant
      case 'Key_MerchantNameCannotBeEmpty':
        toastMessage = 'Merchant name can not be empty';
        break;

      case 'Key_MerchantAdminUserCannotBeEmpty':
        toastMessage = 'Merchant admin Username can not be empty';
        break;

      case 'Key_MerchantIdRequiredForRevenueCalMode':
        toastMessage = 'Merchant id required for revenue cal mode';
        break;

      case 'Key_ValueNotAvailable':
        toastMessage = 'Value not available';
        break;

      case 'Key_MerchantNameAlreadyExist':
        toastMessage = 'Merchant name already exists';
        break;

      case 'Key_InValidMerchantName':
        toastMessage = 'Invalid merchant name';
        break;

      case 'Key_InValidMerchantAdminUser':
        toastMessage = 'Invalid merchant admin user';
        break;

      case 'Key_InvalidPhone':
        toastMessage = 'Phone number is invalid';
        break;

      case 'Key_InvalidFax':
        toastMessage = 'Fax number is invalid';
        break;

      case 'Key_CustomerInactive':
        toastMessage = 'Patient is inactive';
        break;

      case 'Key_InvalidPaymentFormID':
        toastMessage = 'Invalid payment form id';
        break;

      case 'Key_CommunicationException':
        toastMessage = 'Communication exception';
        break;

      case 'Key_MerchantConfiguration':
        toastMessage = 'Merchant configuration';
        break;

      case 'Key_MerchantCannotBeDeleteBillingConfigAssigned':
        toastMessage = 'Merchant can not be deleted since billing config is assigned';
        break;

      case 'Key_ResellerAdminUserCannotBeEmpty':
        toastMessage = 'Reseller admin user can not be empty';
        break;

      case 'Key_ResellerNameInvalid':
        toastMessage = 'Invalid reseller name';
        break;

      case 'Key_NoTransactionTypeSetForReseller':
        toastMessage = 'Transaction type is not set for reseller';
        break;
      case 'Key_DuplicateTransactionType':
        toastMessage = 'Duplicate transaction type';
        break;

      case 'Key_NoProcessorSetForReseller':
        toastMessage = 'No processor set for reseller';
        break;

      case 'Key_CityCannotBeEmpty':
        toastMessage = 'City can not be empty';
        break;

      case 'Key_FederalTaxIdCannotBeEmpty':
        toastMessage = 'Federal tax id can not be empty';
        break;

      case 'Key_StateCannotBeEmpty':
        toastMessage = 'State can not be empty';
        break;

      case 'Key_InvalidIPAddress':
        toastMessage = 'Invalid IP address';
        break;

      case 'Key_ThemeCannotBeEmpty':
        toastMessage = 'Theme can not be empty';
        break;

      case 'Key_ResellerNameAlredyExist':
        toastMessage = 'Reseller name already exists';
        break;

      case 'Key_UserAlreadyExist':
        toastMessage = 'Username already exists';
        break;

      case 'Key_LogoCannotBeEmpty':
        toastMessage = 'Logo can not be empty';
        break;

      case 'Key_CannotDeleteIfChildExist':
        toastMessage = 'Can not delete since child exists';
        break;

      case 'Key_TransactionOnHold_CountryIsBlocked':
        toastMessage = 'Transaction originating from this country is blocked.';
        break;

      case 'Key_TransactionDenied_CountryIsBlocked':
        toastMessage = 'Transaction originating from this country is blocked.';
        break;

      case 'Key_TransactionOnHold_IPAddressIsBlocked':
        toastMessage = 'Transaction originating from this IP Address is blocked.';
        break;

      case 'Key_TransactionDenied_IPAddressIsBlocked':
        toastMessage = 'Transaction originating from this IP Address is blocked.';
        break;

      case 'Key_CanNotDoOfflineinCurrentStatusOfTransaction':
        toastMessage = 'Can not perform offline transaction in current status.';
        break;

      case 'Key_OfflineTransactionNotSupported':
        toastMessage = 'Offline transaction not supported.';
        break;

      case 'Key_CardNoNotMatchedWithOriginalTransaction':
        toastMessage = 'Card number does not match with original transaction.';
        break;

      // Added on 15-01-2018 as per list provided by back end team
      case 'key_FeeCanNotBeModifyAsIsItUsedInRatePlan':
        toastMessage = 'Fee can not be modify as it is used in rate plan.';
        break;

      case 'key_FeeCanNotBeDeleteAsIsItUsedInRatePlan':
        toastMessage = 'Fee can not be delete as it is used in rate plan.';
        break;

      case 'key_CanNotModifySystemFee':
        toastMessage = 'Can not modify system fee.';
        break;

      case 'key_CanNotModifyChannelType':
        toastMessage = 'Can not modify channel type.';
        break;

      case 'Key_InvalidAddress1':
        toastMessage = 'Invalid address1.';
        break;

      case 'Key_CustomerNameCannotBeBlank':
        toastMessage = 'Patient name cannot be blank.';
        break;

      case 'Key_CustomerFirstNameCannotBeBlank':
        toastMessage = 'Patient first name can not be blank.';
        break;

      case 'Key_CustomerLastNameCannotBeBlank':
        toastMessage = 'Patient last name can not be blank.';
        break;

      case 'Key_CustomerCompanyNameCannotBeBlank':
        toastMessage = 'Patient company name cannot be blank.';
        break;

      case 'Key_CustomerDayTimePhoneCannotBeBlank':
        toastMessage = 'Patient phone cannot be blank.';
        break;

      case 'Key_CustomerAddress1CannotBeBlank':
        toastMessage = 'Patient address1 cannot be blank.';
        break;

      case 'Key_CustomerCityCannotBeBlank':
        toastMessage = 'Patient city cannot be blank.';
        break;

      case 'Key_CustomerPostalCodeCannotBeBlank':
        toastMessage = 'Patient postal code cannot be blank.';
        break;

      case 'Key_InvalidAlternativePhoneNumber':
        toastMessage = 'Invalid alternative phone number.';
        break;

      case 'Key_InvalidMobileNumber':
        toastMessage = 'Invalid mobile number.';
        break;

      case 'Key_InvalidTitle':
        toastMessage = 'Invalid title.';
        break;

      case 'Key_CustomerEmailAlreadyExists':
        toastMessage = 'Email already exists.';
        break;

      case 'Key_InvalidCreditCardNumber':
        toastMessage = 'Invalid credit card number.';
        break;
      case 'Key_Failed_UpdateEligibility':
        toastMessage = 'Error while checking eligibility';
        break;
      case 'Key_CreditCardNumberIsNotOfTypeVisa':
        toastMessage = 'Credit card number is not of type visa.';
        break;

      case 'Key_CreditCardNumberIsNotOfTypeMasterCard':
        toastMessage = 'Credit card number is not of type master card.';
        break;

      case 'Key_CreditCardNumberIsNotOfTypeAMEX':
        toastMessage = 'Credit card number is not of type amex.';
        break;

      case 'Key_CreditCardNumberIsNotOfTypeDiscover':
        toastMessage = 'Credit card number is not of type discover.';
        break;

      case 'Key_CreditCardNumberIsNotOfTypeDiners':
        toastMessage = 'Credit card number is not of type diners.';
        break;

      case 'Key_CreditCardNumberIsNotOfTypeJCB':
        toastMessage = 'Credit card number is not of type jcb.';
        break;

      case 'Key_InActiveMerchant':
        toastMessage = 'Merchant is inactive.';
        break;

      case 'Key_InValidBankName':
        toastMessage = 'Invalid bank name.';
        break;

      case 'Key_InValidInValidSSN':
        toastMessage = 'Invalid SSN.';
        break;

      case 'Key_AllowedTransactionTypeNotSet':
        toastMessage = 'Allowed transaction type not set.';
        break;

      case 'Key_ChannelSubTypeNotSet':
        toastMessage = 'Channel sub type not set.';
        break;

      case 'Key_AmountCanNotBeEmpty':
        toastMessage = 'Amount can not be empty.';
        break;

      case 'Key_NotificationTemplateIdCanNotBeEmpty':
        toastMessage = 'Notification template id can not be empty.';
        break;

      case 'Key_NotificationTemplateIdNumericOnly':
        toastMessage = 'Notification template id numeric only.';
        break;

      case 'Key_GracePeriodNumericOnly':
        toastMessage = 'Grace period numeric only.';
        break;

      case 'Key_ScheduleNameCanNotBeEmpty':
        toastMessage = 'Schedule name can not be empty.';
        break;

      case 'Key_InvalidScheduleName':
        toastMessage = 'Invalid schedule name.';
        break;

      case 'Key_InvalidScheduleEndDate':
        toastMessage = 'Invalid schedule end date.';
        break;

      case 'Key_InvalidResellerAdminUser':
        toastMessage = 'Invalid reseller admin user.';
        break;

      case 'key_InvalidCountryFailAction':
        toastMessage = 'Invalid country fail action.';
        break;

      case 'key_InvalidIpAddressFailAction':
        toastMessage = 'Invalid IP address fail action.';
        break;

      case 'key_InvalidInvalidCountryCode':
        toastMessage = 'Invalid country code.';
        break;

      case 'Key_InvalidCountryId':
        toastMessage = 'Invalid country id.';
        break;

      case 'Key_WeeklyDebitTransactionCountExceeded':
        toastMessage = 'Weekly debit transaction count exceeded.';
        break;

      case 'Key_WeeklyDebitTransactionAmountExceeded':
        toastMessage = 'Weekly debit transaction amount exceeded.';
        break;

      case 'Key_MonthlyDebitTransactionCountExceeded':
        toastMessage = 'Monthly debit transaction count exceeded.';
        break;

      case 'Key_MonthlyDebitTransactionAmountExceeded':
        toastMessage = 'Monthly debit transaction amount exceeded.';
        break;

      case 'Key_DailyDebitTransactionCountExceeded':
        toastMessage = 'Daily debit transaction count exceeded.';
        break;

      case 'Key_DailyDebitTransactionAmountExceeded':
        toastMessage = 'Daily debit transaction amount exceeded.';
        break;

      case 'Key_WeeklyCreditTransactionCountExceeded':
        toastMessage = 'Weekly credit transaction count exceeded.';
        break;

      case 'Key_WeeklyCreditTransactionAmountExceeded':
        toastMessage = 'Weekly credit transaction amount exceeded.';
        break;

      case 'Key_MonthlyCreditTransactionCountExceeded':
        toastMessage = 'Monthly credit transaction count exceeded.';
        break;

      case 'Key_MonthlyCreditTransactionAmountExceeded':
        toastMessage = 'Monthly credit transaction amount exceeded.';
        break;

      case 'Key_DailyCreditTransactionCountExceeded':
        toastMessage = 'Daily credit transaction count exceeded.';
        break;

      case 'Key_DailyCreditTransactionAmountExceeded':
        toastMessage = 'Daily credit transaction amount exceeded.';
        break;

      case 'Key_MaximumAmoutExceeded':
        toastMessage = 'Maximum amout exceeded.';
        break;

      case 'Key_WeeklyTransactionCountShouldNotBeNegative':
        toastMessage = 'Weekly transaction count should not be negative.';
        break;

      case 'Key_WeeklyTransactionAmountShouldNotBeNegative':
        toastMessage = 'Weekly transaction amount should not be negative.';
        break;

      case 'Key_MonthlyTransactionCountShouldNotBeNegative':
        toastMessage = 'Monthly transaction count should not be negative.';
        break;

      case 'Key_MonthlyTransactionAmountShouldNotBeNegative':
        toastMessage = 'Monthly transaction amount should not be negative.';
        break;

      case 'Key_DailyTransactionCountShouldNotBeNegative':
        toastMessage = 'Daily transaction count should not be negative.';
        break;

      case 'Key_DailyTransactionAmountShouldNotBeNegative':
        toastMessage = 'Daily transaction amount should not be negative.';
        break;

      case 'Key_MaximumAmoutShouldNotBeNegative':
        toastMessage = 'Maximum amout should not be negative.';
        break;

      // need to confirm with jaya
      case 'Key_DailyTransactionAmountExceedsTheLimitForGlobal':
      case 'Key_DailyTransactionAmountExceedsTheLimitForUser':
      case 'Key_DailyTransactionAmountExceedsTheLimitForReseller':
        toastMessage = 'Daily transaction amount exceeds the limit.';
        break;

      case 'Key_WeeklyTransactionAmountExceedsTheLimitForGlobal':
      case 'Key_WeeklyTransactionAmountExceedsTheLimitForUser':
      case 'Key_WeeklyTransactionAmountExceedsTheLimitForReseller':
        toastMessage = 'Weekly transaction amount exceeds the limit.';
        break;

      case 'Key_MonthlyTransactionAmountExceedsTheLimitForGlobal':
      case 'Key_MonthlyTransactionAmountExceedsTheLimitForUser':
      case 'Key_MonthlyTransactionAmountExceedsTheLimitForReseller':
        toastMessage = 'Monthly transaction amount exceeds the limit.';
        break;

      case 'Key_MaximumTransactionAmountExceedsTheLimitForGlobal':
      case 'Key_MaximumTransactionAmountExceedsTheLimitForUser':
      case 'Key_MaximumTransactionAmountExceedsTheLimitForReseller':
        toastMessage = 'Maximum transaction amount exceeds the limit.';
        break;

      case 'Key_DailyTransactionCountExceedsTheLimitForGlobal':
      case 'Key_DailyTransactionCountExceedsTheLimitForUser':
      case 'Key_DailyTransactionCountExceedsTheLimitForReseller':
        toastMessage = 'Daily transaction count exceeds the limit.';
        break;

      case 'Key_WeeklyTransactionCountExceedsTheLimitForGlobal':
      case 'Key_WeeklyTransactionCountExceedsTheLimitForUser':
      case 'Key_WeeklyTransactionCountExceedsTheLimitForReseller':
        toastMessage = 'Weekly transaction count exceeds the limit.';
        break;

      case 'Key_MonthlyTransactionCountExceedsTheLimitForGlobal':
      case 'Key_MonthlyTransactionCountExceedsTheLimitForUser':
      case 'Key_MonthlyTransactionCountExceedsTheLimitForReseller':
        toastMessage = 'Monthly transaction count exceeds the limit.';
        break;

      case 'Key_TemplateNameCannotBeBlank':
        toastMessage = 'Template name can not be blank.';
        break;

      case 'Key_FromEmailCannotBeBlank':
        toastMessage = 'From email can not be blank.';
        break;

      case 'Key_ToEmailCannotBeBlank':
        toastMessage = 'To email can not be blank.';
        break;

      case 'Key_SubjectCannotBeBlank':
        toastMessage = 'Subject can not be blank.';
        break;

      case 'Key_SmtpServerNotConfigured':
        toastMessage = 'Smtp server not configured.';
        break;

      case 'Key_TemplateInUse':
        toastMessage = 'Template in use.';
        break;

      case 'Key_ReferenceCannotBeBlank':
        toastMessage = 'Reference can not be blank.';
        break;

      case 'key_ChannelTypeCannotBeBlank':
        toastMessage = 'Channel type can not be blank.';
        break;

      case 'key_InvalidFieldsSpecifiedInTemplate':
        toastMessage = 'Invalid fields specified in template.';
        break;

      case 'Key_InvalidTemplateName':
        toastMessage = 'Invalid template name.';
        break;

      case 'Key_InvalidTemplateOrCategoryId':
        toastMessage = 'Invalid template or category id.';
        break;

      case 'Key_InvalidFromEmail':
        toastMessage = 'Invalid from email.';
        break;

      case 'Key_InvalidToEmail':
        toastMessage = 'Invalid to email.';
        break;

      case 'Key_InvalidSubject':
        toastMessage = 'Invalid subject.';
        break;

      case 'Key_EMailshouldnotbenull':
        toastMessage = 'Email should not be blank.';
        break;

      case 'Key_EmailFormatisnotvalid':
        toastMessage = 'Email format is not valid.';
        break;

      case 'Key_InvalidAddressLine1':
        toastMessage = 'Invalid address line1.';
        break;

      case 'Key_InvalidProvisionedData':
        toastMessage = 'Invalid provisioned data.';
        break;

      case 'Key_InvalidEndDate':
        toastMessage = 'Invalid end date.';
        break;

      case 'Key_InvalidSubTotal':
        toastMessage = 'Invalid subtotal.';
        break;

      case 'Key_TotalNumberOfPaymentsCannotBeEmpty':
        toastMessage = 'Total number of payments can not be empty.';
        break;

      case 'Key_InvalidCustomerAccount':
        toastMessage = 'Invalid patient account.';
        break;

      case 'Key_AlreadyActivated':
        toastMessage = 'Already activated.';
        break;

      case 'Key_CannotAdjustTransactionNoResultFound':
        toastMessage = 'Can not adjust transaction no result found.';
        break;

      case 'Key_CannotAdjustCapturedTransaction':
        toastMessage = 'Can not adjust captured transaction.';
        break;

      case 'Key_RefundAmountCanNotExceedOriginalAmount':
        toastMessage = 'Refund amount can not exceed original amount.';
        break;

      case 'Key_TransactionCanNotBeAdjustedInCurrentStatus':
        toastMessage = 'Transaction can not be adjusted in current status.';
        break;

      case 'Key_BadRequest':
        toastMessage = 'Bad request.';
        break;

      case 'Key_CannotRefundCreditTransaction':
        toastMessage = 'Can not refund credit transaction.';
        break;

      case 'Key_CanRefundOnlySaleTransaction':
        toastMessage = 'You can refund only sale transaction.';
        break;

      case 'Key_InvalidPreAuthCode':
        toastMessage = 'Invalid pre auth code.';
        break;

      case 'Key_InvalidReferenceTransactionId':
        toastMessage = 'Invalid reference transaction id.';
        break;

      case 'Key_InvalidCVDataLength':
        toastMessage = 'Invalid CVV length.';
        break;

      case 'Key_InvalidInvoiceNo':
        toastMessage = 'Invalid invoice no.';
        break;

      // Added to handle StatusCode=404

      case 'Key_InvalidReseller':
        toastMessage = 'Invalid reseller.';
        break;

      case 'Key_InvalidCustomer':
        toastMessage = 'Invalid patient.';
        break;

      case 'Key_InvalidInvoice':
        toastMessage = 'Invalid invoice.';
        break;

      case 'Key_InvalidMerchant':
        toastMessage = 'Invalid merchant.';
        break;

      case 'Key_InvalidPaymentForm':
        toastMessage = 'Invalid payment form.';
        break;

      case 'Key_InvalidChannel':
        toastMessage = 'Invalid channel.';
        break;

      case 'Key_InvalidTransaction':
        toastMessage = 'Invalid transaction.';
        break;

      case 'Key_InValidRatePlan':
        toastMessage = 'Invalid rate plan.';
        break;

      case 'Key_InValidFee':
        toastMessage = 'Invalid fee.';
        break;

      case 'Key_InvalidUser':
        toastMessage = 'Invalid user.';
        break;

      case 'Key_InvalidVelocity':
        toastMessage = 'Invalid velocity.';
        break;

      case 'Key_InvalidCountries':
        toastMessage = 'Invalid countries.';
        break;

      case 'Key_UserNotFound':
        toastMessage = 'User not found.';
        break;

      case 'Key_RoleNotFound':
        toastMessage = 'Role not found.';
        break;

      case 'Key_OperationNotFound':
        toastMessage = 'Operation not found.';
        break;

      case 'Key_NotificationTemplateNotFound':
        toastMessage = 'Notification template not found.';
        break;

      case 'Key_InvalidNotificationTemplate':
        toastMessage = 'Invalid notification template.';
        break;

      case 'Key_NotificationCategoryNotFound':
        toastMessage = 'Notification category not found.';
        break;

      case 'Key_PaymentFormNotFound':
        toastMessage = 'Payment form not found.';
        break;

      case 'Key_FromAmountCantBeGreaterToAmount':
        toastMessage = 'Min amount can not be greater than max amount.';
        break;

      case 'Key_EnterNonNegativeAmount':
        toastMessage = 'Amount should be greater than zero.';
        break;

      case 'Key_InvalidCustomerList':
        toastMessage = 'Invalid patient list';
        break;

      case 'Key_InvalidCcSettlementTimeFormat':
        toastMessage = 'Invalid time format of cc settlement.';
        break;

      case 'Key_InvalidCcSettlementTime':
        toastMessage = 'Invalid cc settlement time.';
        break;

      case 'Key_Unauthorized':
        toastMessage = 'Unauthorized.';
        break;

      case 'Key_InvalidName':
        toastMessage = 'Invalid custom plan name';
        break;

      case 'Key_InvalidProductsAndServices':
        toastMessage = 'Invalid products and services';
        break;

      case 'Key_InvalidFrequencyParam':
        toastMessage = 'Frequency parameter is invalid';
        break;

      case 'Key_InvalidTotalAmount':
        toastMessage = 'Total amount is invalid';
        break;

      case 'Key_InvalidNoOfPayments':
        toastMessage = 'Number of payments are invalid';
        break;

      case 'Key_InvalidInvalidPaymentAmount':
        toastMessage = 'Payment amount is invalid';
        break;

      case 'Key_CustomPalnNameAlreadyExists':
        toastMessage = 'Custom plan name already exists.';
        break;

      case 'Key_MerchantAdminUserMustBeMoreThan6Characters':
        toastMessage = 'Merchant admin Username must be more than 6 characters.';
        break;

      case 'Key_ResellerAdminUserMustBeMoreThan6Characters':
        toastMessage = 'Reseller admin Username must be more than 6 characters.';
        break;

      case 'Key_CannotCreateSubReseller':
        toastMessage = 'Can not create subreseller.';
        break;

      case 'Key_InvalidProduct':
        toastMessage = 'Product is not valid.';
        break;

      case 'Key_ProductNotFound':
        toastMessage = 'Products and Services not found.';
        break;

      case 'Key_ProductNameCannotBeBlank':
        toastMessage = 'Product name can not be blank.';
        break;

      case 'Key_UnitPriceCannotBeBlank':
        toastMessage = 'Unit price can not be blank.';
        break;

      case 'Key_UnitPriceNotNumber':
        toastMessage = 'Please enter valid unit price.';
        break;

      case 'Key_UnitPriceShouldBePositiveNumber':
        toastMessage = 'Please enter valid unit price.';
        break;

      case 'Key_InvalidDiscountType':
        toastMessage = 'Discount type is not valid.';
        break;

      case 'Key_InvalidDiscount':
        toastMessage = 'Discount is not valid.';
        break;

      case 'Key_DiscountToBeGreaterThanZero':
        toastMessage = 'Please enter discount greater than 0.';
        break;

      case 'DiscountCantBeGreaterThanUnitPrice':
        toastMessage = 'Discount can not be greater than unit price.';
        break;

      case 'NameExists':
        toastMessage = 'Name already exists.';
        break;

      case 'Key_UnAuthorisedParent':
        toastMessage = 'Unauthorised Parent.';
        break;

      case 'Key_InvoiceAlreadyFinalized':
        toastMessage = 'Invoice already finalized.';
        break;

      case 'Key_InvalidInvoiceId':
        toastMessage = 'Invalid invoice id.';
        break;

      case 'Key_CustomerNotFound':
        toastMessage = 'Patient not found.';
        break;

      case 'Key_CustomerNotEditable':
        toastMessage = 'Patient not editable';
        break;

      case 'Key_InvoiceNotFound':
        toastMessage = 'Invoice not found.';
        break;

      case 'Key_DiscountTypeNotNumber':
        toastMessage = 'Discount type not number.';
        break;

      case 'Key_FinalAmountNotNumber':
        toastMessage = 'Final amount not number.';
        break;

      case 'Key_SubTotalNotNumber':
        toastMessage = 'SubTotal not number.';
        break;

      case 'Key_FinalAmountNotToBeNegative':
        toastMessage = 'Final amount should not be negative.';
        break;

      case 'Key_SubTotalNotToBeNegative':
        toastMessage = 'SubTotal should not be negative.';
        break;

      case 'Key_InvoiceDiscountNotToBeMoreThanProductTotal':
        toastMessage = 'Discount Amount should not be greater than total amount.';
        break;

      case 'Key_DiscountNotNumber':
        toastMessage = 'Discount not number.';
        break;

      case 'Key_DiscountCantBeGreaterThanToUnitPrice':
        toastMessage = 'Discount cannnot be greater than Unit Price';
        break;
      case 'Key_DiscountCantBeGreatThanHundered':
        toastMessage = 'Discount cannot be greater than 100%';
        break;

      case 'Key_DiscountNotToBeNegative':
        toastMessage = 'Discount should not be negative.';
        break;
      case 'Key_DiscountCantBeGreaterThanHundered':
        toastMessage = 'Discount should not be greater than hundered.';
        break;

      case 'Key_DiscountCantBeGreaterThanSubTotal':
        toastMessage = 'Discount should not be greater than SubTotal.';
        break;
      case 'Key_ToEmailIdNotValid':
        toastMessage = 'Invalid To email.';
        break;

      case 'Key_CCEmailNotValid':
        toastMessage = 'Invalid CC email.';
        break;

      case 'Key_DueDateNotValid':
        toastMessage = 'Invalid Due date.';
        break;

      case 'Key_InvoiceDateNotValid':
        toastMessage = 'Invalid Invoice date.';
        break;

      case 'Key_CustomerIdNotValid':
        toastMessage = 'Invalid patient id.';
        break;
      case 'Key_RecurringPaymentCancelled':
        toastMessage = 'Payment plan cancelled successfully.';
        break;
      case 'Key_RecurringPaymentCannotCancelled':
        toastMessage = 'Payment plan cannot be cancelled.';
        break;
      case 'Key_RecurringPaymentAlreadyCancelled':
        toastMessage = 'Payment plan already cancelled.';
        break;
      case 'Key_RecurringPaymentNotBelogsToProvider':
        toastMessage = 'Payment plan not belongs to provider.';
        break;
      case 'Key_AuthorizeModeNotValid':
        toastMessage = 'Authorize mode not valid.';
        break;
      case 'Key_AuthorizeModeNotFound':
        toastMessage = 'Authorize mode not found.';
        break;
      case 'Key_TaxPercentageNotValid':
        toastMessage = 'Tax percentage not valid.';
        break;
      case 'Key_InvalidToken':
        toastMessage = 'Account is Invalid. Please use valid account.';
        break;
      case 'Key_InvalidScheduledDate':
        toastMessage = 'Scheduled Date not valid.';
        break;
      case 'Key_InvalidFrequencyAndTransactionType':
        toastMessage = 'Invalid Frequency and Transaction Type';
        break;
      case 'Key_CurrentDateIsNotApplicable':
        toastMessage = 'CurrentDate is not applicable';
        break;
      case 'Key_TaxPercentNotNumber':
        toastMessage = 'Tax Percent not number';
        break;
      case 'Key_InvalidRecurringPayment':
        toastMessage = 'Payment invalid.';
        break;
      case 'Key_InactivePaymentAccount':
        toastMessage = 'Account is inactive.';
        break;
      case 'Key_PaymentAccountNotBelongsToPatient':
        toastMessage = 'Payment account not belongs to Patient';
        break;
      case 'Key_PaymentAccountMandatory':
        toastMessage = 'Payment Account Mandatory';
        break;
      case 'Key_PaymentAccountNotFound':
        toastMessage = 'Payment Account not found';
        break;
      case 'Key_RecurringNotBelongsToPatient':
        toastMessage = 'Payment plan not belongs to Patient';
        break;
      case 'Key_RecurringPaymentAlreadyCompleted':
        toastMessage = 'Payment Already Completed';
        break;
      case 'Key_Failed_UpdatePaymentAccountToRecurringPayment':
        toastMessage = 'Failed to update Payment account';
        break;
      case 'Key_scheduleDateShouldBeFutureDate':
        toastMessage = 'Schedule Date should be future date';
        break;
      case 'Key_SamePaymentAccountCannotBeUpdated':
        toastMessage = 'Same Payment Account cannot be updated';
        break;
      case 'Key_FrequencyNotInRange':
        toastMessage = 'Frequency not in Range';
        break;
      case 'Key_NumberOfPaymentsNotNumber':
        toastMessage = 'Number of payments not number';
        break;
      case 'Key_ScheduleDateNotInRange':
        toastMessage = 'Schedule Date not in range';
        break;
      case 'Key_CustomerNameNotString':
        toastMessage = 'Invalid Patient Name.';
        break;
      case 'Key_TaxAmountNotNumber':
        toastMessage = 'TaxAmount should be number.';
        break;
      case 'Key_FirstTransationDateInPast':
        toastMessage = 'First transation date in past.';
        break;
      case 'Key_AccountTypeCannotBeBlank':
        toastMessage = 'AccountType cannot be blank.';
        break;
      case 'Key_FirstTransationDateShouldBeFutureDate':
        toastMessage = 'First transation date should be future date.';
        break;
      case 'Key_DownPaymentExceedsTotalAmount':
        toastMessage = 'Down payment exceeds total amount.';
        break;
      case 'Key_UpdateLimitExceeded':
        toastMessage = 'Update limit exceeded.';
        break;
      case 'Key_FirstTransactionDateNotValid':
        toastMessage = 'First transaction date not valid.';
        break;
      case 'Key_FrequencyParamCannotBeBlank':
        toastMessage = 'Frequency cannot be blank.';
        break;
      case 'Key_FirstTransationExceeds30DaysLimit':
        toastMessage = 'First transation date exceeds 30 days limit.';
        break;
      case 'Key_TaxAmountNotToBeNegative':
        toastMessage = 'TaxAmount should not be negative.';
        break;

      case 'Key_InvalidPaymentStatus':
        toastMessage = 'Invalid payment status';
        break;

      case 'Key_InvalidInvoiceStatus':
        toastMessage = 'Invalid invoice status';
        break;

      case 'Key_PaymentFormIdNotValid':
        toastMessage = 'Invalid Payment Form Id.';
        break;

      case 'Key_PaymentFormNotValid':
        toastMessage = 'Invalid PaymentForm.';
        break;

      case 'Key_ProductNotToBeDuplicate':
        toastMessage = 'Duplicate products are not allowed.';
        break;

      case 'Key_ProductQuantityToBeGreaterThanZero':
        toastMessage = 'Product quantity should be greater than Zero.';
        break;

      case 'Key_ProductIdNotValid':
        toastMessage = 'Invalid ProductId.';
        break;

      case 'Key_DueDateTobeGreaterThanCurrentDate':
        toastMessage = 'DueDate should be greater than current date';
        break;

      case 'Key_FromInvoiceDateNotValid':
        toastMessage = 'Invalid From Date.';
        break;

      case 'Key_ToInvoiceDateNotValid':
        toastMessage = 'Invalid To Date.';
        break;
      case 'Key_InvoiceAmountNotNumber':
        toastMessage = 'Invalid Invoice Amount.';
        break;

      case 'Key_InvalidPaymentStatusWhenInvoiceStatusisDraft':
        toastMessage = 'Invalid payment status when invoice status is draft.';
        break;

      case 'Key_InvoiceNotEditable':
        toastMessage = 'Invoice not allowed to edit.';
        break;

      case 'Key_FromInvoiceDateTobeGreaterThanToInvoiceDate':
        toastMessage = 'From Invoice Date To be Greater Than To Invoice Date';
        break;

      case 'Key_InvoiceUpdatedToFinal':
        toastMessage = 'Invoice Updated To Final';
        break;
      case 'Key_InvoiceCannotBeDeleted':
        toastMessage = 'Invoice Cannot Be Deleted';
        break;
      case 'Key_InvoiceIsDeleted':
        toastMessage = 'Invoice Is Deleted';
        break;
      case 'Key_FromInvoiceAmountNotNumber':
        toastMessage = 'From Invoice Amount Not Number';
        break;
      case 'Key_ToInvoiceAmountNotNumber':
        toastMessage = 'To Invoice Amount Not Number';
        break;
      case 'Key_ToInvoiceAmountToBeGreaterThanFromInvoiceAmount':
        toastMessage = 'To Invoice Amount ToBe Greater Than From Invoice Amount';
        break;
      case 'Key_StartDateNotValid':
        toastMessage = 'Start Date Not Valid';
        break;
      case 'Key_RecurringNameCannotBeEmpty':
        toastMessage = 'Payment Plan Name Cannot Be Empty';
        break;
      case 'Key_EndDateTobeGreaterThanCurrentDate':
        toastMessage = 'EndDate Tobe Greater Than CurrentDate';
        break;
      case 'Key_EndDateNotValid':
        toastMessage = 'End Date Not Valid';
        break;
      case 'Key_RecurringNameAlreadyExists':
        toastMessage = 'Payment Plan Name Already Exists';
        break;
      case 'Key_IsActiveTobeEqualtoOneorTwo':
        toastMessage = 'IsActive Tobe Equal to OneorTwo';
        break;
      case 'Key_FrequencyTobeInRangeofZeroToFour':
        toastMessage = 'Frequency Tobe InRange of Zero To Four';
        break;
      case 'Key_InvoiceNotToBeActivatedWhenInvoiceStatusIsDraft':
        toastMessage = 'Invoice Not ToBe Activated When Invoice Status Is Draft';
        break;
      case 'Key_InvoiceisActivated':
        toastMessage = 'Invoice is Activated';
        break;
      case 'Key_NonEditableFormCannotBeCopied':
        toastMessage = 'Non editable form cannot be copied';
        break;
      case 'Key_FormCannotBeEditable':
        toastMessage = 'Form is non-editable. Please contact administrator to edit the form.';
        break;
      case 'Key_InvoiceCannotBeActivated':
        toastMessage = 'Invoice CannotBe Activated';
        break;
      case 'Key_DraftInvoiceCannotBeActivated':
        toastMessage = 'Draft Invoice CannotBe Activated';
        break;
      case 'Key_InvoiceNotToBeDeActivatedWhenInvoiceStatusIsDraft':
        toastMessage = 'Invoice Not ToBe DeActivated When InvoiceStatus Is Draft';
        break;
      case 'Key_InvoiceisDeActivated':
        toastMessage = 'Invoice is DeActivated';
        break;
      case 'Key_InvoiceCannotBeDeactivated':
        toastMessage = 'Invoice Cannot Be Deactivated';
        break;
      case 'Key_Draft Invoice CannotBe Deactivated':
        toastMessage = 'Draft Invoice CannotBe Deactivated';
        break;


      case 'Key_PaymentTermNotString':
        toastMessage = 'Payment Term Not String';
        break;
      case 'Key_PaymentTermExceededMaximumLength':
        toastMessage = 'PaymentTermExceededMaximumLength';
        break;
      case 'Key_PaymentTermCannotBeBlank':
        toastMessage = 'PaymentTermCannotBeBlank';
        break;

      // Add new exception keys above this line
      case 'User is not authorized to access this resource':
        toastMessage = 'User is not authorized to access this resource.';
        break;
      case 'Key_FacilityNameAlreadyExists':
        toastMessage = 'Facility name already exists';
        break;

      case 'User is not authorized to access ':
        toastMessage = 'User is not authorized to access this resource.';
        break;
      case 'Key_PatientNotFound':
        toastMessage = 'Patient Not Found';
        break;
      case 'Key_EmailIdNotValid':
        toastMessage = 'Invalid Email Id';
        break;
      case 'Key_DobNotValid':
        toastMessage = 'Dob Invalid';
        break;
      case 'Key_NpiNotValid':
        toastMessage = 'Npi Invalid';
        break;

      case 'Key_LastNameNotString':
        toastMessage = 'LastNameNotString';
        break;

      case 'Key_PhoneNotToBeNegative':
        toastMessage = 'PhoneNotToBeNegative';
        break;
      case 'Key_PostalCodeNumber':
        toastMessage = 'PostalCode only number allowed';
        break;
      case 'Key_PostalCodeNegative':
        toastMessage = 'PostalCode negative value not allowed';
        break;
      case 'Key_PostalCodeUptoTenDigitNumber':
        toastMessage = 'PostalCode upto 10 digit allowed ';
        break;
      case 'Key_InsurancePartnerIdNotValid':
        toastMessage = 'InsurancePartnerId Not Valid';
        break;
      case 'Key_GroupNoNumber':
        toastMessage = 'Group only Number allowed';
        break;
      case 'Key_GroupNoNegative':
        toastMessage = 'Group Negative not allowed';
        break;
      case 'Key_BinNoNumber':
        toastMessage = 'Bin only Number allowed';
        break;
      case 'Key_BinNegative':
        toastMessage = 'Bin Negative not allowed';
        break;
      case 'Key_IsInsuredNotValid':
        toastMessage = 'IsInsured Not Valid';
        break;
      case 'Key_RelationTobeInRangeofZeroToThree':
        toastMessage = 'Relationship To be In Range of Zero To Three';
        break;
      case 'Key_MrnAlreadyExists':
        toastMessage = 'MRN Already Exists';
        break;
      case 'Key_InsuranceIdNotString':
        toastMessage = 'InsuranceId not String';
        break;
      case 'Key_InsuranceDetailsDuplicate':
        toastMessage = 'Insurance Details Duplicate';
        break;

      case 'Key_InsurancePartnerNotFound':
        toastMessage = 'InsurancePartner Not Found';
        break;

      case 'Key_TitleCannotBeEmpty':
        toastMessage = 'Title cannot be empty';
        break;
      case 'Key_DescriptionCannotBeEmpty':
        toastMessage = 'Description cannot be empty';
        break;
      case 'Key_GroupNoNotNumber':
        toastMessage = 'Group No - only number allowed';
        break;
      case 'Key_BinNoNotNumber':
        toastMessage = 'Bin No - only number allowed';
        break;
      case 'Key_PolicyNoAllowsOnlyAlphaNumeric':
        toastMessage = 'Policy No - only AlphaNumeric allowed';
        break;
      case 'Key_GroupNoAllowsOnlyAlphaNumeric':
        toastMessage = 'Group No - only AlphaNumeric allowed';
        break;
      case 'Key_BinNoAllowsOnlyAlphaNumeric':
        toastMessage = 'Bin No - only AlphaNumeric allowed';
        break;
      case 'Key_PostalCodeNotValid':
        toastMessage = 'PostalCode Not Valid';
        break;
      case 'Key_PostalCodeUptoNineDigitNumber':
        toastMessage = 'PostalCode Upto 9 Digit';
        break;
      case 'Key_ProviderNameAlreadyExist':
        toastMessage = 'Provider Name already exist';
        break;
      case 'Key_NameNotString':
        toastMessage = 'Invalid Name';
        break;

      case 'Key_accountTypeTobeOneorTwo':
        toastMessage = 'AccountType is invalid';
        break;
      case 'Key_IsDefaultNotValid':
        toastMessage = 'IsDefault not Valid';
        break;
      case 'Key_CreditCardNumberAlreadyExists':
        toastMessage = 'CreditCard Number Already Exists';
        break;
      case 'Key_PaymentAccountActivated':
        toastMessage = 'Payment Account Activated';
        break;
      case 'Key_PaymentAccountCannotBeActivated':
        toastMessage = 'Payment Account Cannot Be Activated';
        break;
      case 'Key_PaymentAccountDeActivated':
        toastMessage = 'Payment Account Deactivated';
        break;
      case 'Key_PaymentAccountCannotBeDeActivated':
        toastMessage = 'Payment Account Cannot Be Deactivated';
        break;
      case 'Key_IsCheckingAccountNotValid':
        toastMessage = 'Checking Account Not Valid';
        break;
      case 'Key_SamePatientAddressNotValid':
        toastMessage = 'SameAsPatientAddress Not Valid';
        break;
      case 'Key_CreditCardShouldBeNumberValue':
        toastMessage = 'CreditCard: only Number allowed';
        break;
      case 'Key_InvalidBankAccountNo':
        toastMessage = 'Invalid Bank Account No';
        break;
      case 'Key_AccountNumberExists':
        toastMessage = 'Account Number already exists';
        break;
      case 'Key_EmailAlreadyExists':
        toastMessage = 'Email already exists';
        break;

      case 'Key_TransactionNotFound':
        toastMessage = 'Transaction not found';
        break;
      case 'Key_InvalidPatient':
        toastMessage = 'Invalid Patient';
        break;
      case 'Key_AppointmentDurationLessThanMinLimit':
        toastMessage = 'Duration is less than 1 mins.';
        break;
      case 'Key_InvalidFromDate':
        toastMessage = 'Start time is invalid';
        break;
      case 'Key_InvalidToDate':
        toastMessage = 'End time is invalid';
        break;
      case 'Key_InvalidAppointment':
        toastMessage = 'Appointment is invalid';
        break;
      case 'Key_AppointmentNotFound':
        toastMessage = 'Appointment not found';
        break;
      case 'Key_AppointmentCancelledSuccessfully':
        toastMessage = 'Appointment cancelled successfully';
        break;
      case 'Key_AppointmentCannotCancelled':
        toastMessage = 'Appointment cannot be cancel';
        break;
      case 'Key_AppointmentNotBelogsToProvider':
        toastMessage = 'Appointment not belong to provider';
        break;
      case 'Key_AppointmentNotBelongsToPatient':
        toastMessage = 'Appointment not belong to patient';
        break;
      case 'Key_ToDateInPast':
        toastMessage = 'Please select future end time';
        break;
      case 'Key_FromDateInPast':
        toastMessage = 'Please select future start time';
        break;
      case 'Key_AppointmentDurationExceededMaxLimit':
        toastMessage = 'Durantion should be less that 480 mins';
        break;
      case 'Key_FromDateExceededMaxDateAllowed':
        toastMessage = 'Appointment is not allowed for this date';
        break;
      case 'Key_Failed_UpdateAppointment':
        toastMessage = 'Update appointment failed';
        break;
      case 'Key_ReasonCannotBeBlank':
        toastMessage = 'Reason cannot be blank';
        break;
      case 'Key_FromDateAndToDateCannotBeSameAsExisting':
        toastMessage = 'Same start time and end time is not allowed';
        break;
      case 'Key_InvalidProvider':
        toastMessage = 'Invalid Provider';
        break;
      case 'Key_InActiveProvider':
        toastMessage = 'InActive Provider';
        break;
      case 'Key_InvalidPaymentAccount':
        toastMessage = 'Invalid Payment Account';
        break;
      case 'Key_InvalidNotes':
        toastMessage = 'Invalid Notes';
        break;

      case 'Key_InvalidInitiator':
        toastMessage = 'Invalid Initiator';
        break;
      case 'Key_IsDebitNotValid':
        toastMessage = 'IsDebit Not Valid';
        break;
      case 'Key_AmountNotNumber':
        toastMessage = 'Amount is Not a Number';
        break;
      case 'Key_AmountNotToBeNegative':
        toastMessage = 'Negative value not allowed for Amount';
        break;
      case 'Key_TotalAmountNotNumber':
        toastMessage = 'TotalAmount only Number allowed';
        break;
      case 'Key_TotalAmountNotToBeNegative':
        toastMessage = 'TotalAmount negative value not allowed';
        break;
      case 'Key_TaxNotNumber':
        toastMessage = 'Tax only number allowed';
        break;
      case 'Key_TaxNotToBeNegative':
        toastMessage = 'Negative Tax value not allowed';
        break;

      case 'Key_CardTypeNotString':
        toastMessage = 'CardType Not String';
        break;
      case 'Key_CardTypeCannotBeEmpty':
        toastMessage = 'CardType Cannot Be Empty';
        break;

      case 'Key_FirstNameNotString':
        toastMessage = 'FirstName Not String';
        break;

      case 'Key_PhoneShouldBeTenDigitNumber':
        toastMessage = 'Phone Should Be Ten Digit Number';
        break;

      case 'Key_PostalCodeEitherFiveDigitorNineDigitNumber':
        toastMessage = 'PostalCode Either Five Digit or Nine Digit Number';
        break;

      case 'Key_AddressLine1NotString':
        toastMessage = 'AddressLine1 Not String';
        break;
      case 'Key_AddressLine1CannotBeEmpty':
        toastMessage = 'AddressLine1 Cannot BeEmpty';
        break;
      case 'Key_PatientAlreadyLinkedToProvider':
        toastMessage = 'Patient Already Linked To Provider';
        break;
      case 'Key_CardHolderNameNotString':
        toastMessage = 'CardHolderName Not String';
        break;
      case 'Key_CardHolderNameCannotBeEmpty':
        toastMessage = 'CardHolderName Cannot Be Empty';
        break;

      case 'Key_PatientIdCannotBeBlank':
        toastMessage = 'PatientId Cannot Be Blank';
        break;
      case 'Key_PaymentAccountIdCannotBeBlank':
        toastMessage = 'Payment AccountId Cannot Be Blank';
        break;
      case 'Key_RecurringPaymentNotFound':
        toastMessage = 'Payment Plan Not Found';
        break;
      case 'Key_InvalidCustomerIdOrCustomerAccountId':
        toastMessage = 'Invalid Patient Or CustomerAccount';
        break;
      case 'Key_ProviderNotFound':
        toastMessage = 'Provider Not Found';
        break;
      case 'Key_InitatorCannotBeBlank':
        toastMessage = 'Initiator Cannot Be Blank';
        break;
      case 'Key_InitiatorCannotBeBlank':
        toastMessage = 'Initiator Cannot Be Blank';
        break;
      case 'Key_TotalAmountCannotBeBlank':
        toastMessage = 'TotalAmount Cannot Be Blank';
        break;

      case 'Key_CityNotValid':
        toastMessage = 'City not Valid';
        break;
      case 'Key_AddressLine1NotMoreThanThirty':
        toastMessage = 'AddressLine1 not more than 30';
        break;
      case 'Key_PaymentAccountInUse':
        toastMessage = 'This card cannot be deleted as it is associated with a payment plan. To remove card, please update payment plan to another payment method, then delete.';
        break;
      case 'Key_PaymentAccountCannotBeDeleted':
        toastMessage = 'Payment Account cannot be deleted';
        break;
      case 'Key_PaymentAccountDeleted':
        toastMessage = 'Payment Account Deleted';
        break;
      case 'Key_ErrorMailSend':
        toastMessage = 'Error in sending Mail';
        break;
      case 'Key_FirstTransDateInPast':
        toastMessage = 'First Transaction Date is in Past';
        break;
      case 'Key_InvalidOTP':
        toastMessage = 'Invalid OTP';
        break;
      case 'Key_OtpExpired':
        toastMessage = 'Your One Time Password is Expired. Please re-generate and try again';
        break;
      case 'Key_UserOptedOutFromSMS':
        toastMessage = 'User Opted Out from SMS';
        break;
      case 'Key_UserPhoneAndEmailNotLinked':
        toastMessage = 'Phone number and Email not linked';
        break;

      case 'Key_RemarksShoulNotBeEmpty':
        toastMessage = 'Reason should not be empty.';
        break;
      case 'Key_PhoneNumberCanbeOptedInAfter30days':
        toastMessage = 'You cannot opt in within 30 days of opting out. Please try again later';
        break;
      case 'Key_PatientDoesNotHavePhoneNumber':
        toastMessage = 'Patient does not have phone number added. Please try again later';
        break;
      case 'Key_InvalidLogoFormat':
        toastMessage = 'Invalid Logo format.';
        break;
      case 'Key_UnAuthorisedUserType':
        toastMessage = 'Usertype is unauthorised.';
        break;

      case 'Key_FromDateAndToDateNotSame':
        toastMessage = 'Start and end date are not matching with DB';
        break;
      case 'Key_PatientEmailNotAvailable':
        toastMessage = 'Patient email not available. Please update patient email.';
        break;
      case 'Key_AppointmentEmailSendSuccessfully':
        toastMessage = 'Email sent successfully';
        break;
      case 'Key_AppointmentEmailSendNotSuccessful':
        toastMessage = 'Error in sending Mail';
        break;

      case 'Key_PatientMobileNotAvailable':
        toastMessage = 'Patient mobile not available';
        break;
      case 'Key_PatientOptedOut':
        toastMessage = 'Patient is opted out. Notification not sent.';
        break;
      case 'Key_Failed_AddTag':
        toastMessage = 'Failed to add tag';
        break;
      case 'Key_InvalidTag':
        toastMessage = 'Tag is Invalid';
        break;
      case 'Key_TagNotToBeDuplicate':
        toastMessage = 'Tag already exists';
        break;
      case 'Key_TagNotToBeEmpty':
        toastMessage = 'Tag cannot be empty';
        break;
      case 'Key_TagShouldBeArrayofStrings':
        toastMessage = 'Should provide array of strings';
        break;
      case 'Key_TagShouldBeArray':
        toastMessage = 'Should provide array';
        break;
      case 'Key_TagAlreadyExists':
        toastMessage = 'Tag already exists';
        break;

      case 'Key_CptIdNotNumber':
        toastMessage = 'CptId is not a number';
        break;
      case 'Key_CptIdAlreadyExists':
        toastMessage = 'Cpt Id already exists';
        break;
      case 'Key_InvalidProviderSuffix':
        toastMessage = 'Provider Suffix is Invalid';
        break;
      case 'Key_IsOptInNotValid':
        toastMessage = 'OptIn value not valid';
        break;
      case 'Key_InvalidItemId':
        toastMessage = 'Invalid Item Id';
        break;
      case 'Key_ItemIdNotValid':
        toastMessage = 'Invalid Item Id';
        break;
      case 'Key_ItemNotFound':
        toastMessage = 'Product not found';
        break;
      case 'Key_ProductNameAlreadyExists':
        toastMessage = 'Product name already exists!';
        break;
      case 'Failed_AddItem':
        toastMessage = 'Error while adding Item';
        break;
      case 'Failed_UpdateItem':
        toastMessage = 'Error while updating Item';
        break;
      case 'Key_InsuranceNotFound':
        toastMessage = 'Insurance not found';
        break;
      case 'Key_InsuranceAlreadyLinked':
        toastMessage = 'Insurance already linked with Provider';
        break;
      case 'Key_InvalidInsurancePayerId':
        toastMessage = 'Invalid Insurance Id';
        break;
      case 'Key_AddressLineNotLessThanFive':
        toastMessage = 'Address should be atleast 5 character';
        break;
      case 'Key_CountryEitherOneorTwo':
        toastMessage = 'Country Should be either USA or Canada';
        break;
      case 'InsuranceNameAlreadyExists':
        toastMessage = 'Insurance name already Exists';
        break;
      case 'Key_Failed_AddInsurance':
        toastMessage = 'Error in adding Insurance';
        break;
      case 'Key_Failed_UpdateInsurance':
        toastMessage = 'Error in updating Insurance';
        break;
      case 'Key_InsuranceLinked':
        toastMessage = 'Insurance linked successfully';
        break;
      case 'Key_InsuranceLinkedError':
        toastMessage = 'Error in linking Insurance';
        break;
      case 'Key_PhoneNumberAlreadyOptedOut':
        toastMessage = 'Phone Number already opted out';
        break;
      case 'Key_InstallmentDateExceedsCardExpiryDate':
        toastMessage = 'Installment date exceeds card expiry date.';
        break;
      case 'Key_ScheduleTransactionDateExceedsCardExpiryDate':
        toastMessage = 'Schedule transaction date exceeds card expiry date.';
        break;
      case 'Key_LastInstallmentDateExceedsCardExpiryDate':
        toastMessage = 'Last installment date exceeds card expiry date.';
        break;
      case 'Key_DoctorLinkedToProvider':
        toastMessage = 'Practitioner  linked to Provider';
        break;
      case 'Key_ErrorDoctorLinkedToProvider':
        toastMessage = 'Error in linking doctor to provider';
        break;
      case 'Key_Failed_UpdateDoctor':
        toastMessage = 'Error id updating the doctor';
        break;
      case 'Key_Failed_AddDoctor':
        toastMessage = 'Unable to addd Practitioner ';
        break;
      case 'Key_DoctorNotFound':
        toastMessage = 'Practitioner  not found';
        break;
      case 'Key_InvalidDoctor':
        toastMessage = 'Practitioner  is not valid';
        break;
      case 'Key_ScheduleTransactionDateNotValid':
        toastMessage = 'Invalid Scheduled traansaction date';
        break;
      case 'Key_CheckNumberShouldBeNumberValue':
        toastMessage = 'Check number should be numeric value';
        break;
      case 'Key_InvalidCheckNumber':
        toastMessage = 'Invalid check number';
        break;
      case 'Key_InvalidTransactionDate':
        toastMessage = 'Invalid transaction date';
        break;
      case 'Key_NumberOfPaymentsCannotbeLessThanOne':
        toastMessage = 'Number of Payments must be greater than zero';
        break;
      case 'Key_NumberOfPaymentsExceededMaximumLimit':
        toastMessage = 'Number of payment exceeds maximum limit';
        break;
      case 'Key_NumberOfPaymentsNotToBeNegative':
        toastMessage = 'Number of payments cannot be a negative value';
        break;
      case 'Key_NotValidTransactionDate':
        toastMessage = 'Invalid transaction date';
        break;
      case 'Key_TransationDateExceedsPastDateLimit':
        toastMessage = 'Transaction date exceeds past date limit';
        break;
      case 'Key_TransactionTypeCannotBeBlank':
        toastMessage = 'Transaction Type cannot be blank';
        break;
      case 'Key_ParamRequired':
        toastMessage = 'Error while checking doctor\'s availability. Required field not available. Please contact administrator.';
        break;
      case 'Key_InvoicePayScheduled':
        toastMessage = 'Payment already scheduled!';
        break;
      case 'Key_QuantityNotNumber':
        toastMessage = 'Quantity not number';
        break;
      case 'Key_ItemNameChangeNotAllowed':
        toastMessage = 'Cannot change Item name!';
        break;
      case 'Key_ServiceIdNotFound':
        toastMessage = 'Invalid Service Id!';
        break;
      case 'Key_SlotNotAvailable':
        toastMessage = 'Slot not available';
        break;
      case 'Key_InvalidFrequency':
        toastMessage = 'Invalid Frequency';
        break;
      case 'Key_InvoiceAlreadyCancelled':
        toastMessage = 'Patient Balance already cancelled';
        break;
      case 'Key_ItemNameAlreadyExists':
        toastMessage = 'Item Name already exists';
        break;
      case 'Key_OperationTypeCannotBeBlank':
        toastMessage = 'Operation type cannot be blank';
        break;
      case 'Key_NewExecutionDateCannotBeBlank':
        toastMessage = 'New execution date cannot be blank';
        break;
      case 'Key_QuantityNotValid':
        toastMessage = 'Quantity is not valid';
        break;
      case 'Key_TaxPercentNotToBeNegative':
        toastMessage = 'Tax percent cannot be negative';
        break;
      case 'Key_TaxPercentNotMoreThanHundred':
        toastMessage = 'Tax percent cannot be greater than or equal to 100';
        break;
      case 'Key_ServiceIdNotNumber':
        toastMessage = 'Service Id should be numeric value';
        break;
      case 'Key_ServiceIdNotValid':
        toastMessage = 'Invalid Service Id';
        break;
      case 'Key_ItemNameCannotBeBlank':
        toastMessage = 'Item Name cannot be blank';
        break;
      case 'Key_UnitPriceNotToBeNegative':
        toastMessage = 'Unt price cannot be negative';
        break;
      case 'Key_ItemIdNotNumber':
        toastMessage = 'Item Id is not a number';
        break;
      case 'Key_InvalidItemType':
        toastMessage = 'Invalid Item Type';
        break;
      case 'Key_InvalidServiceType':
        toastMessage = 'Invalid Service type';
        break;
      case 'Key_ItemQuantityToBeGreaterThanZero':
        toastMessage = 'Quantity should be greater than zero';
        break;
      case 'Key_ItemNotToBeDuplicate':
        toastMessage = 'Item name already exists';
        break;
      case 'Key_DiscountTypeTobeEqualtoOneorTwo':
        toastMessage = 'Invalid discount type';
        break;
      case 'Key_FromPriceShouldBePositiveNumber':
        toastMessage = 'From price should be a positive number';
        break;
      case 'Key_ToUnitPriceShouldBePositiveNumber':
        toastMessage = 'Unit price should be a positive number';
        break;
      case 'Key_FromPriceCantBeGreaterToUnitPrice':
        toastMessage = 'From price cannot be greater than to price';
        break;
      case 'Key_FromDiscountShouldBePositiveNumber':
        toastMessage = 'From discount should be a positive number';
        break;
      case 'Key_ToDiscountShouldBePositiveNumber':
        toastMessage = 'To discount should be a positive number';
        break;
      case 'Key_DiscountAndDiscountTypeNotToBeEmpty':
        toastMessage = 'Discount and discount type should not be empty';
        break;
      case 'Key_ItemTypeChangeNotAllowed':
        toastMessage = 'Cannot change Item type';
        break;
      case 'Key_ServiceTypeChangeNotAllowed':
        toastMessage = 'Cannot change service type';
        break;
      case 'Key_ServiceCodeChangeNotAllowed':
        toastMessage = 'Cannot change service code';
        break;
      case 'Key_ServiceIdAlreadyExists':
        toastMessage = 'Code already exists';
        break;
      case 'Key_ItemActivated':
        toastMessage = 'Item activated';
        break;
      case 'Key_Failed_ItemActivated':
        toastMessage = 'Fail to activate Item';
        break;
      case 'Key_ItemAlreadyActivated':
        toastMessage = 'Item already activated';
        break;
      case 'Key_ItemDeActivated':
        toastMessage = 'Item deactivated';
        break;
      case 'Key_ItemAlreadyDeActivated':
        toastMessage = 'Item already deactivated';
        break;
      case 'Key_Failed_ItemDeActivated':
        toastMessage = 'Fail to deactivate Item';
        break;
      case 'Key_AmountShouldBeMoreThanZero':
        toastMessage = 'Amount should be greater than zero';
        break;
      case 'Key_TotalAmountShouldBeMoreThanZero':
        toastMessage = 'Total amount should be greater than zero';
        break;
      case 'Key_NpiAlreadyExists':
        toastMessage = 'Npi number already exists';
        break;
      case 'Key_NpiShouldBeTenDigitNumber':
        toastMessage = 'NPI number should be 10 digits';
        break;
      case 'Key_ProviderNpiAlreadyExist':
        toastMessage = 'Provider Npi number already exists';
        break;
      case 'Key_ProviderNpiShouldBeTenDigitNumber':
        toastMessage = 'Provider NPI number should be 10 digits';
        break;
      case 'Key_InvalidProviderNpi':
        toastMessage = 'Invalid Provider Npi';
        break;
      case 'Key_RecurringPaymentCancelledSuccessfully':
        toastMessage = 'Payment Plan Cancelled Successfully';
        break;
      case 'Key_PatientNameCannotBeBlank':
        toastMessage = 'Patient Name cannot be blank';
        break;
      case 'Key_InvoiceAlreadyUnsubscribed':
        toastMessage = 'Invoice already unsubscribed';
        break;
      case 'Key_InvoicePaymentInitiated':
        toastMessage = 'Payment already initiated.';
        break;
      case 'Key_InvoiceAlreadyPaid':
        toastMessage = 'Invoice already paid.';
        break;
      case 'Key_InvoiceAlreadyClosed':
        toastMessage = 'Invoice already closed.';
        break;
      case 'Key_CloseReasonLessThanMinimumLength':
        toastMessage = 'Close reason less than minimum length.';
        break;
      case 'Key_CloseReasonNotString':
        toastMessage = 'Invalid Reason.';
        break;
      case 'Key_InvalidPatientInsurance':
        toastMessage = 'Invalid Patient Insurance';
        break;
      case 'Key_Failed_AddClaim':
        toastMessage = 'Add claim failed';
        break;
      case 'Key_Failed_UpdateClaim':
        toastMessage = 'Update claim failed';
        break;
      case 'Key_ServiceDateNotValid':
        toastMessage = 'Invalid service date';
        break;
      case 'Key_ClaimFrequencyNotInRange':
        toastMessage = 'Claim frequency not in range';
        break;
      case 'Key_FirstClaimDateNotValid':
        toastMessage = 'First claim date not vlaid';
        break;
      case 'Key_FirstClaimDateInPast':
        toastMessage = 'Past date not allowed for first claim';
        break;
      case 'Key_NumberOfClaimsCannotbeLessThanOne':
        toastMessage = 'No of times cannot be less than 1';
        break;
      case 'Key_NumberOfClaimsNotNumber':
        toastMessage = 'No of times is not a number';
        break; case 'Key_ClaimNotFound':
        toastMessage = 'Claim not found';
        break;
      case 'Key_PatientNotEditable':
        toastMessage = 'Patient details not editable for claim';
        break;
      case 'Key_ClaimAlreadyCancelled':
        toastMessage = 'Claim already cancelled';
        break;
      case 'Key_ClaimAlreadyPaid':
        toastMessage = 'Claim Already paid';
        break;
      case 'Key_ClaimIsClosed':
        toastMessage = 'Claim is closed';
        break;
      case 'Key_ClaimIsDenied':
        toastMessage = 'Claim denied';
        break;
      case 'Key_Failed_UpdateClaim':
        toastMessage = 'Claim update failed';
        break;
      case 'Key_ClaimCancelledSuccessfully':
        toastMessage = 'Claim cancelled successfully';
        break;
      case 'Key_NoChangeinClaimSchedule':
        toastMessage = 'No change in claim schedule';
        break;
      case 'Key_Failed_RescheduleClaim':
        toastMessage = 'Failed to re schedule claim';
        break;
      case 'Key_FileTypeNotAccepted':
        toastMessage = 'File type not accepted';
        break;
      case 'Key_InvalidPatientBulkUpload':
        toastMessage = 'Invalid patient bulk upload';
        break;
      case 'Key_NumberOfClaimsCannotbeMoreThan99':
        toastMessage = 'Total number of claims cannot be greater than 99';
        break;
      case 'Key_InsurancePayerNotEligibleForClaimUpdate':
        toastMessage = 'Insurance payer not eligible for claim update';
        break;
      case 'Key_PatientOrInsuranceNotFound':
        toastMessage = 'Patient or Insurance not found';
        break;
      case 'Key_InvalidFirstClaimDate':
        toastMessage = 'Invalid first claim date';
        break;
      case 'Key_FirstClaimsDateInPast':
        toastMessage = 'First claim date in past';
        break;
      case 'Key_AutoClaimStatusShouldBeBoolean':
        toastMessage = 'Auto claim status should be a true or false';
        break;
      case 'Key_InvoiceCannotBeCancelled':
        toastMessage = 'Invoice cannot be cancelled';
        break;
      case 'Key_InvoiceAlreadyCompleted':
        toastMessage = 'Invoice already completed';
        break;
      case 'Key_CheckEligibilityNotValid':
        toastMessage = 'Invalid Check Eligibility';
        break;
      case 'Key_InsuranceDetailsCannotBeBlank':
        toastMessage = 'Insurance details cannot be blank';
        break;
      case 'Key_FirstNameNotValid':
        toastMessage = 'FirstName is invalid';
        break;
      case 'Key_LastNameNotValid':
        toastMessage = 'LastName is invalid';
        break;
      case 'Key_PatientInsuranceLimitExceeded':
        toastMessage = 'Patient Insurance limit exceeded, can only add 5 insurance per patient';
        break;
      case 'Key_PatientInsuranceNotFound':
        toastMessage = 'Patient Insurance not found';
        break;
      case 'Key_InvalidPatientInsuranceId':
        toastMessage = 'Invalid Patient Insurance Id';
        break;
      case 'Key_PatientInsuranceUpdated':
        toastMessage = 'Patient Insurance Updated';
        break;
      case 'Key_InvalidInsuranceType':
        toastMessage = 'Invalid Insurance Type';
        break;
      case 'Key_InsuranceTypeNotInRange':
        toastMessage = 'Insurance Type not in Range';
        break;
      case 'Key_CannotSetSameInsuranceType':
        toastMessage = 'Cannot set same Insurance type';
        break;
      case 'Key_CannotSetToSecondary':
        toastMessage = 'Cannot set this I nsurance as Secondary';
        break;
      case 'Key_InsurancePayerNotEligibleForEligibilityCheck':
        toastMessage = 'Insurance payer is not eligible for check eligibility';
        break;
      case 'Key_InvalidDoctorType':
        toastMessage = 'Invalid Practitioner Type';
        break;
      case 'Key_InvalidAccess':
        toastMessage = 'You don\'t have access to this module';
        break;
      case 'Key_InvalidModule':
        toastMessage = 'Invalid Module';
        break;
      case 'Key_ModuleNotToBeDuplicate':
        toastMessage = 'Module Name cannot be duplicate';
        break;
      case 'Key_ModuleNotToBeEmpty':
        toastMessage = 'Invalid Name cannot be empty';
        break;
      case 'Key_ModuleShouldBeArray':
        toastMessage = 'Should be array of module';
        break;
      case 'Key_InvalidModuleConfig':
        toastMessage = 'Invalid Module Config';
        break;
      case 'Key_SMSTurnedOffForProvider':
        toastMessage = 'SMS service turned off for provider';
        break;
      case 'Key_EmailTurnedOffForProvider':
        toastMessage = 'Email service turned off for provider';
        break;
      case 'Key_NotificationTurnedOffForProvider':
        toastMessage = 'Notification turned off for provider';
        break;
      case 'Key_InvoiceNotificationsDisabled':
        toastMessage = 'Notification turned off for payment activity';
        break;
      case 'Key_DoctorActivated':
        toastMessage = 'Practitioner successfully activated';
        break;
      case 'Key_DoctorCannotBeActivated':
        toastMessage = 'Practitioner cannot be activated';
        break;
      case 'Key_DoctorDeActivated':
        toastMessage = 'Practitioner successfully deactivatedt';
        break;
      case 'Key_DoctorCannotBeDeActivated':
        toastMessage = 'Practitioner cannot be deactivated';
        break;
      case 'Key_DoctorInActive':
        toastMessage = 'Practitioner is not active';
        break;
      case 'Key_InValidNewExecutionDate':
        toastMessage = 'New Excecution date is not valid';
        break;
      case 'Key_NewExecutionDateInPast':
        toastMessage = 'New excecution date cannot be in past';
        break;
      case 'Key_NewExecutionDateShouldBeFutureDate':
        toastMessage = 'New excecution date should be future date';
        break;
      case 'Key_NewExecutionDateNotValid':
        toastMessage = 'New excecution date is not valid';
        break;
      case 'Key_RecurringScheduleNotFound':
        toastMessage = 'Recurring Schedule not found';
        break;
      case 'Key_DownPaymentNotEligibleForReschedule':
        toastMessage = 'Down Payment is not eligible for reschedule';
        break;
      case 'Key_NewExecutionDateShouldNotExceedsNextScheduleDate':
        toastMessage = 'New excecution date cannot be equal to or greater than next schedule date';
        break;
      case 'Key_NewExecutionDateShouldBeGreaterThanExistingScheduleDate':
        toastMessage = 'New excecution date should be greater than current schedule date';
        break;
      case 'Key_NewExecutionDateShouldNotExceedsEstimatedScheduleDateAsPerFrequency':
        toastMessage = 'New excecution date is exceeding the limit';
        break;
      case 'Key_FrequencyNotEligibleForReschedule':
        toastMessage = 'Recurring schedule with this frequency cannot be rescheduled';
        break;
      case 'Key_LastVisit_Not_Closed':
        toastMessage = 'Please checkout previous Check In request';
        break;
      case 'Key_InvalidCheckInDate':
        toastMessage = 'Invalid Check In Date';
        break;
      case 'Key_VisitStatusNotInRange':
        toastMessage = 'Visit status not in Range';
        break;
      case 'Key_InvalidDoctorCheckInDate':
        toastMessage = 'Invalid doctor check In Date';
        break;
      case 'Key_InvalidCheckOutDate':
        toastMessage = 'Invalid check Out Date';
        break;
      case 'Key_Failed_AddPatientVisit':
        toastMessage = 'Failed to add Patient Visit';
        break;
      case 'Key_Failed_UpdatePatientVisit':
        toastMessage = 'Failed to Update Patient Visit';
        break;
      case 'Key_ItemsNotFound':
        toastMessage = 'Line Items not found';
        break;
      case 'Key_PatientVisitNotFound':
        toastMessage = 'Invalid Patient Visit';
        break;
      case 'Key_CheckOutDateSldBeMoreThanDoctorCheckInDate':
        toastMessage = 'Checkout date should be greater than doctor Check In date';
        break;
      case 'Key_DoctorCheckInDateSldBeMoreThanCheckInDate':
        toastMessage = 'Docotr check In date should be greater than Check In date';
        break;
      case 'Key_DoctorCheckInNotAllowed':
        toastMessage = 'Doctor Check In not allowed';
        break;
      case 'Key_CheckOutNotAllowed':
        toastMessage = 'Patient checkout not allowed';
        break;
      case 'Key_DocumentNotFound':
        toastMessage = 'Document not found';
        break;
      case 'Key_DeleteNotAllowed':
        toastMessage = 'Cannot delete this document';
        break;
      case 'Key_DocumentDeleted':
        toastMessage = 'Patient document deleted successfully';
        break;
      case 'Key_DocumentCannotBeDeleted':
        toastMessage = 'Document cannot be deleted';
        break;
      case 'Key_DocumentAccessAuthorized':
        toastMessage = 'Document is successfully linked to provider';
        break;
      case 'Key_DocumentAccessCannotBeAuthorized':
        toastMessage = 'Unable to link the document';
        break;
      case 'Key_DocumentAccessRemoved':
        toastMessage = 'Document access removed successfully';
        break;
      case 'Key_DocumentAccessCannotBeRemoved':
        toastMessage = 'Unable to remove the aceess to this document';
        break;
      case 'Key_InvalidBankName':
        toastMessage = 'Invalid Bank Name';
        break;
      case 'Key_FeatureNotToBeEmpty':
        toastMessage = 'Feature name is empty';
        break;
      case 'Key_FeatureNotToBeDuplicate':
        toastMessage = 'Feature name cannot be duplicate';
        break;
      case 'Key_OnlySMSAndEMailModuleAccessible':
        toastMessage = 'Only Email and Sms Module is accessible';
        break;
      case 'Key_FeatureIdCannotBeBlank':
        toastMessage = 'Feature Id cannot be blank';
        break;
      case 'Key_IsEmailEnabledCannotBeBlank':
        toastMessage = 'isEmailEnabled field cannot be blank';
        break;
      case 'Key_IsSmsEnabledCannotBeBlank':
        toastMessage = 'isSmsEnabled field cannot be blank';
      case 'Key_ReportNotFound':
        toastMessage = "Invoice reporting data not found."
        break;
      case 'Key_InvalidPatientId':
        toastMessage = "Invalid patient Id"
        break;
      case 'Key_Not_Authorized_To_Access_Features':
        toastMessage = "Provider is not authorized to access this feature"
        break;
      case 'Key_RoleNameNotString':
        toastMessage = "Role name should be string"
        break;
      case 'Key_RoleNameNotValid':
        toastMessage = "Role name is not valid"
        break;
      case 'Key_RoleNameCannotBeEmpty':
        toastMessage = "Role name cannot be empty "
        break;
      case 'Key_FeaturesListNotToBeDuplicate':
        toastMessage = "dDuplicate feature list"
        break;
      case 'Key_FeaturesListNotToBeEmpty':
        toastMessage = "Feature list should not be empty"
        break;
      case 'Key_FeaturesListShouldBeArray':
        toastMessage = "feature list should be an array"
        break;
      case 'Key_RoleNameAlreadyExists':
        toastMessage = "Role Name already exists"
        break;
      case 'Key_RoleNotFound':
        toastMessage = "Role not found"
        break;
      case 'Key_RoleActivated':
        toastMessage = "Role activated sucessfully"
        break;
      case 'Key_RoleCannotBeActivated':
        toastMessage = "Role cannot be activated"
        break;
      case 'Key_UserNameAlreadyExists':
        toastMessage = "Username already exists"
        break;
      case 'Key_RoleDeActivated':
        toastMessage = "Role de activated sucessfully"
        break;
      case 'Key_RoleCannotBeDeActivated':
        toastMessage = "Role cannot be de activated"
        break;
      case 'Key_RoleInUse':
        toastMessage = "Role in use"
        break;
      case 'Key_InvoiceCloseNotAllowed':
        toastMessage = "Closing invoice is not allowed."
        break;
      case 'Key_ErrorInFetchingInvoiceReport':
        toastMessage = "Error in fetching report."
        break;
      case 'Key_ErrorInFetchingRecuringPaymentReport':
        toastMessage = "Error in fetching report."
        break;
      case 'Key_StartTimeShouldNotEmptyInParams':
        toastMessage = "Start time should not be empty"
        break;
      case 'Key_EndTimeShouldNotEmptyInParams':
        toastMessage = "End time should not be empty"
        break;
      case 'Key_DaysShouldNotEmptyInParams':
        toastMessage = "Week Day should not be empty"
        break;
      case 'Key_StartTimeShouldBeLessThenEndTime':
        toastMessage = "Start time should be less than end time"
        break;
      case 'Key_AppointmentOutsideWorkingHoursRange':
        toastMessage = "Appointment outside Practitioner's working hours"
        break;
      case 'Key_TimeZoneRequired':
        toastMessage = "Timezone required. Error in checking Practitioner's working hours."
        break;
      case 'Key_DoctorScheduledAtAnotherPractice':
        toastMessage = "This doctor is scheduled at another practice for times selected."
        break;

      default:
        toastMessage = 'Something went wrong. Please contact administrator.';

    }
    return toastMessage;
  }
}
