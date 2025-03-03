import { Certificate } from "./certificate"

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface CertificateResponse {
  certificate: Certificate;
}
