import * as Yup from 'yup';


export const CryptoWalletValidSchema = Yup.object({
    WalletAddress: Yup.string().required('USDTWalletAddress is Required'),
    OTP: Yup.string().required('OTP is required').max(6, 'OTP must be 6 characters'),
  });

export  const BankINRvalidSchema = Yup.object({
    IFSC: Yup.string().required('IFSCcode is Required'),
    BankName: Yup.string().required('Bank_Name is Required'),
    BranchName: Yup.string().required('Branch_Name is Required'),
    AccountNo: Yup.string().required('Account_Number is Required'),
    AccountHolderName: Yup.string().required('Account_Holder_Name is Required'),
    OTP: Yup.string().required('OTP is required').max(6, 'OTP must be 6 characters'),
  })

export const BANK_AEDVailSchema = Yup.object({
  AEDAccountHolderName: Yup.string().required('Account_Holder Name  is Required'),
  AEDAccountNumber: Yup.string().required('Account Name  is Required'),
  IBANNumber: Yup.string().required('IBAN is Required'),
  SwiftCode: Yup.string().required('Swift Code is Required'),
  OTP: Yup.string().required('OTP is required').max(6, 'OTP must be 6 characters'),
})

export const Cedit_Card_DetailsVailSchema = Yup.object({
  CreditCardHolderMobileNo:Yup.string().required("CreditCard Holder MobileNo is Required"),
  CreditCardNo:Yup.string().required("Credit Card Number is Required"),
  CreditCardHolderName:Yup.string().required("Credit Card Holder Name is Required"),
  OTP:Yup.string().required("OTP is Required"),
})


//================ My Profile form Validation Schema starts Here

export const Personal_DetailsValid_Schema = Yup.object({
  FirstName:Yup.string().required("First Name is Required"),
  MobileNo:Yup.string().required("Mobile Number is Required")
  .matches(/^\+?\d*$/, 'You have Entered Invalid Mobile No'),
  DateofBirth:Yup.string().required("Date of Birth is Required"),
  EmailId:Yup.string().required("Email Id is Required").email('Invalid email format'),
})


export const Nominee_DetailsValid_Schema = Yup.object({
  NomineeName:Yup.string().required("Nominee Name is Required."),
  NomineeRelation:Yup.string().required("Nominee Relation is Required."),
  NomineeDOB:Yup.string().required(" Nominee Date of Birth is Required."),
  NomineeNationalId:Yup.string().required("Nominee National Id is Required."),
  NomineeDrivingLicence:Yup.string().required("Nominee Driving Licence is Required.").optional(),
  NomineePassportNumber:Yup.string().required("Nominee Passport Number is Required.").optional(),
})

export const Change_PasswordValid_Schema = Yup.object({
  OldPassword:Yup.string()
  .required("Old Password is Required."),
  NewPassword:Yup.string()
  .required("New Password is Required.")
  .min(8, 'Password must be at least 8 characters long')
  .matches(/[a-zA-Z]/, 'Password can only contain Latin letters.'),
  ConfirmPassword:Yup.string()
  .oneOf([Yup.ref('NewPassword')], "Password is Missmatch")
  .required("please confirm your passwrod")
})

export const SearchFormValid_Schema = Yup.object({
  FromDate:Yup.date().required('From Date is Required.'),
  ToDate:Yup.date().required('ToDate is Required.')
})

export const SupportTicketForm = Yup.object({
  QueryString:Yup.string().required("Please Select Type").optional(),
  SearchString:Yup.string().required("Search Field is required").optional(),
  StatusString:Yup.string().required("Select Status Field").optional(),

})

export const KYC_WalletForm_Schema = Yup.object({
  Payment_Amount: Yup.string().required("Payment Amount is Required"),
  Payment_Date: Yup.date()
    .required("Payment Date is Required")
    .min(new Date("2024-12-31"), "Date cannot be before 1 Jan 2025"), // Custom date validation
  UTR_NO: Yup.string().required("UTR No is Required"),
});

export const KYC_documentverification = Yup.object({
  Document_Type: Yup.string().required("Select Document Type"),
  Document_No: Yup.string()
    .matches(/^\d{12}$/, "Document No must be a 12-digit number")
    .required("Document No is required"),
  OTP: Yup.string().required("OTP is Required"),
});