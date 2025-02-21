export enum StoredProcedures {
  GetAllCertificatesByStudentId = "CALL get_all_certificates_by_student_id(?)",
  RegisterStudent = "CALL register_student(?, ?, ?, ?, ?, ?)",
  GetPasswordByUserName = "CALL get_password_by_user_name(?)",
  GetUserDataById = "CALL get_user_data_by_id(?)",
  GetCertificateByCourseId = "CALL get_certificate_by_course_id(?)",
  UploadCV = "CALL upload_cv(?)"
}

export default StoredProcedures;
	