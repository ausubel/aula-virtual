export enum StoredProcedures {
  //#region Certificates
  GetAllCertificatesByStudentId = "CALL get_all_certificates_by_student_id(?)",
  GetCertificateByCourseId = "CALL get_certificate_by_course_id(?)",
  //#endregion

  //#region Auth & User
  RegisterStudent = "CALL register_student(?, ?, ?, ?)",
  GetPasswordByEmail = "CALL get_password_by_email(?)",
  GetUserDataById = "CALL get_user_data_by_id(?)",
  UploadCV = "CALL upload_cv(?, ?)",
  GetOrCreateGoogleUser = 'CALL get_or_create_google_user(?, ?, ?)',
  //#endregion

  //#region Courses
  CreateCourse = "CALL create_course(?, ?, ?, ?)",
  GetAllCourses = "CALL get_all_courses()",
  GetCourseById = "CALL get_course_by_id(?)",
  AssignStudentsToCourse = "CALL assign_students_list_to_course(?, ?)",
  GetStudentsByCourseId = "CALL get_students_by_course_id(?)",
  CreateLessonForCourse = "CALL create_lesson_for_course(?, ?, ?, ?)",
  GetLessonsByCourseId = "CALL get_lessons_by_course_id(?)",
  CreateLessonVideo = "CALL create_lesson_video_by_lesson_id(?, ?)",
  GetCourseDetailsById = "CALL get_course_details_by_id(?)",
  UpdateLesson = "CALL update_lesson(?, ?, ?, ?)",
  DeleteLesson = "CALL delete_lesson(?)",
  DeleteVideo = "CALL delete_video(?)",
  //#endregion
}

export default StoredProcedures;
