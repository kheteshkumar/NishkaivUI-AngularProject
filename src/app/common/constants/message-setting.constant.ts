export class MessageSetting {
  static admin = {
    add: 'User added successfully.',
    edit: 'User updated successfully.',
    delete: 'User deleted successfully.'
  };
  static facility = {
    add: 'Facility added successfully.',
    edit: 'Facility edited successfully.',
    delete: 'Facility deleted successfully.',
    activate: 'Facility activated successfully.',
    deactivate: 'Facility deactivated successfully.',
    deactivateConfirmation: 'Are you sure, you would like to deactivate this facility?',
    activateConfirmation: 'Are you sure, you would like to activate this facility?'
  };
  static forms = {
    add: 'Form added successfully.',
    edit: 'Form edited successfully.',
    delete: 'Form deleted successfully.',
    activate: 'Form activated successfully.',
    deactivate: 'Form deactivated successfully.',
    createCopySuccess: 'Created a copy of form successfully.',
    createCopyConfirmation: 'Are you sure, you would like to create a copy of this form?',
    deactivateConfirmation: 'Are you sure, you would like to deactivate this form?',
    activateConfirmation: 'Are you sure, you would like to activate this form?',
    deleteConfirmation: 'Are you sure, you would like to delete form [[formTitle]]?',
    publishConfirmation: 'Are you sure, you would like to publish form [[formTitle]] ?',
    publishSucess: 'Form published successfully.',
    deleteSucess: 'Form deleted successfully.',
    duplicateTitleError: 'Form with same title already exists.',
    invalidFieldsError: 'Please add form fields.',
    successSubmission: 'Form submitted successfully.',
    successUpdateSubmission: 'Form submission updated successfully.',
    failedSubmission: 'Form submission failed.',
    successSendForm: 'Form sent to patient sucessfully.',
    failedSendForm: 'Failed to send the form.',
  };
  static provider = {
    add: 'Provider added successfully.',
    edit: 'Provider edited successfully.',
    delete: 'Provider deleted successfully.',
    activate: 'Provider activated successfully.',
    deactivate: 'Provider deactivated successfully.',
    activateError: 'need to be set before activating provider.',
    resetPassword: 'Reset password successfully, Check email for more details.',
    resetPasswordConfirmation: 'Are you sure, you want to reset password?',
    deactivateConfirmation: 'Are you sure, you would like to deactivate this provider?',
    activateConfirmation: 'Are you sure, you would like to activate this provider?',
    //comfirmation: 'Would you like to collect a payment or create a payment plan?',
    comfirmPaymentAndAppointment: 'Would you like to collect a payment or create an appointment?',
    comfirmOneAndPaymentAndAppointment: 'What would you like to do next?',
    comfirmMakePayment: 'How would you like to pay?'
  };
  static user = {
    add: 'User added successfully.',
    edit: 'User updated successfully.',
    delete: 'User deleted successfully.',
    activate: 'User activated successfully.',
    deactivate: 'User deactivated successfully.',
    activateError: 'need to be set before activating user.',
    resetPassword: 'Reset password successfully, Check email for more details.',
    resetPasswordConfirmation: 'Are you sure, you want to reset password?',
    deactivateConfirmation: 'Are you sure, you would like to deactivate this user?',
    activateConfirmation: 'Are you sure, you would like to activate this user?',
    roleUpdateConfirmation: 'Are you sure, you would like to change this user role?',
  };
  static patient = {
    save: 'Patient details saved successfully.',
    add: 'Patient added successfully.',
    edit: 'Patient edited successfully.',
    link: 'Patient linked successfully.',
    editLinked: 'Patient linked and updated successfully.',
    delete: 'Patient deleted successfully.',
    activate: 'Patient activated successfully.',
    deactivate: 'Patient deactivated successfully.',
    uploadSuccess: 'File uploaded successfully.',
    checkInConfirmation: 'Are you sure you would like to check in this patient?',
    withDoctorConfirmation: 'Are you sure you would like to change the status of this patient to "With Doctor"?',
    checkOutConfirmation: 'Are you sure you would like to check out this patient?',
    visitAddedSuccess: 'Patient Visit Added Successfully',
    visitUpdatedSuccess: 'Patient Visit Updated Successfully',
    attachmentAdd: 'Patient attachment added successfully.',
    deleteAttachmentConfirmation: 'Are you sure, you want to delete this file?',
    deleteAttachment: 'Patient Attachment deleted successfully',
    attachmentLink: 'Provider Linked successfully.',
  };
  static note = {
    add: 'Note added successfully.',
    edit: 'Note edited successfully.',
    delete: 'Note deleted successfully.',
  };
  static appointment = {
    add: 'Appointment added successfully.',
    edit: 'Appointment updated successfully.',
    delete: 'Appointment Cancelled successfully.',
    updateError: 'Past date is not allowed.',
    durationError: "Appointment window is greater than 8 hours",
    emailNotification: "Email notification sent successfully.",
    textNotification: "Text notification sent successfully."
  };
  static transaction = {
    submit: 'Transaction added successfully.',
    updated: 'Transaction updated successfully.',
    void: 'Transaction is void attempted.',
    voidConfirmation: 'Are you sure, you want to void this transaction?',
    voidattempt: 'Transaction sent for void successfully.',
    voidAttemptConfirmation: 'Are you sure, you want to attempt to void this transaction?',
    refund: 'Refund transaction initiated successfully.',
    refundAmountError: 'Refund amount should be greater than 0(zero) and less than or equal to total amount.',
    partialRefundAmountNotAllowedError: 'Refund amount should be equal to total amount.',
    forceauth: 'Force Auth transaction initiated successfully.',
    adjustConfirmation: 'Are you sure, you want to adjust this transaction?',
    adjustSuccess: 'Transaction amount adjusted successfully.',
    adjustError: 'Unable to adjust transaction amount.',
    Key_ChannelConfigurationMissing: 'Transaction failed due to invalid processor configuration.',
    Key_InvalidRequestData: 'Transaction failed due to invalid request data.',
    Key_ProcessorResponseError: `Transaction failed due to error in processor's response.`,
    Key_NetworkError: `Transaction failed due to network issues at processor's end.`,
    reprocessSuccess: `Transaction reprocessed successfully.`,
    mailSuccess: `Mail has been sent successfully.`,
    skip: 'Transaction is void attempted.',
    skipConfirmation: 'Are you sure, you want to skip this transaction?',
    memo: `Thank you for your business!`,
  };

  static recurring = {
    save: 'Payment Plan details saved successfully.',
    addRecurringSuccess: 'Payment Plan added successfully.',
    editRecurringSuccess: 'Payment Plan edited successfully.',
    cancelled: 'Payment Plan cancelled successfully',
    cancelledSchedule: 'Scheduled transaction cancelled successfully',
    accountUpdated: 'Account updated successfully',
    accountAdded: 'New Account added successfully',
    planUpdated: 'Payment Plan updated successfully',
    paymentAccountUpdated: 'Payment account updated successfully',
    skipSchedule: 'Transaction moved to the end.',
    skipScheduleConfirmation: 'Are you sure, you want to move this transaction to end?',
  };


  static recurringSchedule = {
    editRecurringScheduleSuccess: 'Payment Schedule details updated successfully.',
    refundRecurringScheduleSuccess: 'Payment Schedule refunded successfully.',
    voidRecurringScheduleSuccess: 'Payment Schedule voided successfully.',
  };

  static customPlan = {
    addCustomPlanSuccess: 'Custom Plan added successfully.',
    editCustomPlanSuccess: 'Custom Plan edited successfully.'
  };


  static patientAccount = {
    add: 'Account added successfully.',
    update: 'Account updated successfully.'
  };

  static recurringPaymentInfo = {
    add: 'Payment Plan info added successfully.',
    activate: 'Payment Plan activated successfully.',
    deactivate: 'Payment Plan deactivated successfully.'
  };

  static invoice = {
    save: 'Payment activity details saved successfully.',
    finalize: 'Payment activity finalized successfully.',
    delete: 'Payment activity discarded Successfully.',
    finalizeConfirmation: 'Are you sure, you want to finalize this patient balance?',
    finalizeSuccess: 'Payment activity finalized successfully.',
    deleteConfirmation: 'Are you sure, you want to discard this patient balance?',
    cancelConfirmation: 'Are you sure, you want to cancel this patient balance?',
    fullfillConfirmation: 'Are you sure, you want to mark this patient balance as fullfill?',
    cancelSuccess: 'Patient balance cancelled successfully.',
    fullfillSuccess: 'Payment activity marked as fullfilled successfully.',
    sendSuccess: 'Payment activity sent successfully.',
    confirmation: 'Checkout details saved successfully, do you want to continue with further actions?',
    memo: `Thank you for your business!`,
    captureOfflinePayment: 'Offline Payment is captured successfully',
    comfirmation: 'Would you like to collect a payment or create a payment plan?',
    resendInvoiceConfirmation: 'Are you sure, you want to resend this patient balance?',
    resendInvoiceSuccess: 'Notification sent successfully',
    closeConfirmation: 'Are you sure you would like to remove the patient balance and write it off? Please provide reason why.',
    closeSuccess: 'Patient balance closed successfully.',
    writeOffConfirmation: 'Are you sure, you want to cancel and Write Off this patient balance?',
    writeOffSuccess: 'Patient balance cancelled successfully.',
  };

  static allowTransaction = {
    add: 'Allowed transaction types saved successfully.',
    selectAtleastOne: 'Select atleast one transaction type.'
  };

  static common = {
    error: 'Please contact to administrator.',
    errordeletereseller: 'Can not delete this reseller, since it has a child record.',
    // temp error message (need to remove once common error handling is implemented)
    inactiveAccount: 'Your Account is Inactive. Please contact to administrator.',
    sucess: 'Success',
    failed: 'Failed',
    changePasswordMessage: 'Password changed successfully. Please login again.',
    updatePasswordMessage: 'Password changed successfully.',
    Key_MatchingPassword: 'New password cannot be the same as previous 3 passwords. Please enter a different new password and try again.',
    Key_InvalidOldPassword: 'Invalid old password.',
    errorNewPaaswordSameAsOldPassword: 'New password should not be same as old password.',
    resetPasswordMessage: 'Password reset successfully.',
    sessionExpired: 'Session Expired. Please login again.',
    unathorizedToAccessResource: 'Unauthorized to access requested resource. Please login again.',
    passwordMismatch: 'New password and confirm password did not match.',
    resetPassword: 'Reset password successfully, Check email for more details.',
    resetPasswordConfirmation: 'Are you sure, you want to reset password?',
    linkPatientConfirmation: 'Is the patient authorizing this provider in person or over the phone?',
    select: 'Send Notification via..',
    optInConfirmation: 'Is this patient authorizing to opt-in for text message communication via in person or over the phone?',
    optOutConfirmation: 'Is this patient authorizing to opt-out for text message communication via in person or over the phone?',
    invalidMinAndMaxAmountError: 'Please enter valid Min and Max Amount.',
    invalidAccess: 'You don\'t have access to this feature, please contact administrator!',
  };
  static patientSetting = {
    optInConfirmation: 'Are you sure you would like to opt-in for text notifications?',
    optOutConfirmation: 'Are you sure you would like to opt-out of text notifications?'
  }
  static login = {
    invalidCredential: 'Incorrect username or password.'
  };
  static forgotPassword = {
    failed: 'Failed',
    success: 'Success',
    common: 'Password has been sent to your registered Email Id.'
  };
  static forgotUsername = {
    failed: 'Failed',
    success: 'Success',
    common: 'Username has been sent to your registered Email Id.'
  };
  static ratePlan = {
    delete: 'Rate Plan deleted successfully.',
    add: 'Rate Plan added successfully.',
    edit: 'Rate Plan updated successfully.'
  };
  static processorConfiguration = {
    saveSuccess: 'Processor Configuration saved successfully.',
    allowedTransactionTypeError: 'Allowed Transaction Type need to be set before Processor Configuration.'
  };

  static product = {
    delete: 'Product deleted successfully.',
    add: 'Product added successfully.',
    edit: 'Product updated successfully.',
    duplicateTag: 'Product tag already exist',
    activated: 'Product and services activated successfully',
    deactivated: 'Product and services deactivated successfully',
    uploadSuccess: 'File uploaded successfully.',
  };


  static insurance = {
    save: 'Insurance details saved successfully.',
    add: 'Insurance added successfully.',
    edit: 'Insurance edited successfully.',
    delete: 'Insurance deleted successfully.',
    activate: 'Insurance activated successfully.',
    deactivate: 'Insurance deactivated successfully.',
    link: 'Insurance linked successfully.',
  };

  static patientInsurance = {
    save: 'Patient Insurance details saved successfully.',
    add: 'Patient Insurance added successfully.',
    edit: 'Patient Insurance edited successfully.',
    deleteConfirmation: 'Are you sure you want to delete this Insurance?',
    delete: 'Patient Insurance deleted successfully.',
    activate: 'Patient Insurance activated successfully.',
    deactivate: 'Patient Insurance deactivated successfully.',
    link: 'Patient Insurance linked successfully.',
    primaryConfirmation: 'Are you sure you want to set this Insurance as Primary',
    secondaryConfirmation: 'Are you sure you want to set this Insurance as Secondary',
    insuranceType: 'Patient Insurance Type updated successfully.',
    eligibility: 'Patient eligibility check successful.',
  };

  static doctor = {
    save: 'Practitioner details saved successfully.',
    add: 'Practitioner added successfully.',
    edit: 'Practitioner edited successfully.',
    delete: 'Practitioner deleted successfully.',
    activate: 'Practitioner activated successfully.',
    deactivate: 'Practitioner deactivated successfully.',
    link: 'Practitioner linked successfully.',
    activated: 'Practitioner activated successfully',
    deactivated: 'Practitioner deactivated successfully',
    editLinked: 'Practitioner linked and updated successfully.',
  };

  static claims = {
    save: 'Claims details saved successfully.',
    add: 'Claims added successfully.',
    edit: 'Claims edited successfully.',
    delete: 'Claims deleted successfully.',
    activate: 'Claims activated successfully.',
    deactivate: 'Claims deactivated successfully.',
    link: 'Claims linked successfully.',
    cancelConfirmation: 'Are you sure, you want to cancel this claim?',
    cancelSuccess: 'Claim cancelled successfully.',
    statusCheckConfirmation: 'Please confirm to check the claim status now',
    statusCheckSuccess: 'Claim status updated successfully.',
  };

  static notifications = {
    dismiss: 'Notification dismissed successfully.',
  };
  static eligibility = {
    save: 'Eligibility details saved successfully.',
    add: 'Eligibility added successfully.',
    edit: 'Eligibility edited successfully.',
    statusCheckConfirmation: 'Please confirm to check the eligibility status now',
    statusCheckSuccess: 'Eligibility status updated successfully.',
  };
  static reportAmountFilter = ['captureAmount', 'refundAmount', 'achTransactionAmount',
    'achTransactionFees', 'achTransactionOtherFees', 'ccTransactionAmount', 'ccTransactionFees',
    'ccTransactionOtherFees', 'dcTransactionAmount', 'dcTransactionFees', 'dcTransactionOtherFees', 'defaultFee', 'totalBillingAmount'];

  static role = {
    save: 'Role details saved successfully.',
    add: 'Role added successfully.',
    edit: 'Role edited successfully.',
    delete: 'Role deleted successfully.',
    activateConfirmation: 'Are you sure, you would like to activate this role?',
    activate: 'Role activated successfully.',
    deactivateConfirmation: 'Are you sure, you would like to deactivate this role?',
    deactivate: 'Role deactivated successfully.',
  };
}

