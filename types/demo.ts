export interface DemoRequestPayload {
  fullName: string;
  company: string;
  email: string;
  phoneNumber: string;
  country: string;
  companySize: string;
}

export interface DemoResponseData {
  success: boolean;
  message: string;
}
