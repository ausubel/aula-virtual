export enum StoredProcedures {
  //#region Certificates
  GetAllCertificatesByStudentId = "CALL get_all_certificates_by_student_id(?)",
  GetCertificateByCourseId = "CALL get_certificate_by_course_id(?)",
  //#endregion
  RegisterStudent = "CALL register_student(?, ?, ?, ?, ?, ?)",
  GetPasswordByEmail = "CALL get_password_by_email(?)",
  GetUserDataById = "CALL get_user_data_by_id(?)",
  UploadCV = "CALL upload_cv(?, ?)",
  GetOrCreateGoogleUser  = 'CALL get_or_create_google_user(?, ?, ?)'
}

export default StoredProcedures;
