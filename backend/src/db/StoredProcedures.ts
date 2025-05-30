export const StoredProcedures = {
    // Auth procedures
    GetPasswordByEmail: 'CALL get_password_by_email(?)',
    GetUserDataById: 'CALL get_user_data_by_id(?)',
    GetOrCreateGoogleUser: 'CALL get_or_create_google_user(?, ?, ?)',
    RegisterStudent: 'CALL register_student(?, ?, ?, ?)',

    //User procedures
    UpdateUserDataById: 'CALL update_user_data_by_id(?, ?, ?, ?, ?, ?, ?)',
    GetStudentProfileData: 'CALL get_student_profile_data(?, @result); SELECT @result as profileData',

    // Course procedures
    CreateCourse: 'CALL create_course(?, ?, ?, ?)',
    GetAllCourses: 'CALL get_all_courses()',
    GetCourseDetailsById: 'CALL get_course_details_by_id(?)',
    GetCoursesByStudentId: 'CALL get_courses_by_student_id(?)',
    GetStudentsByCourseId: 'CALL get_students_by_course_id(?)',
    AssignStudentsToCourse: 'CALL assign_students_list_to_course(?, ?)',
    GetAllStudents: 'CALL get_all_students()',
    update_course: 'CALL update_course(?, ?, ?, ?, ?)',
    RemoveStudentFromCourse: 'CALL remove_student_from_course(?, ?)',
    FinishCourseById: 'CALL finish_course_by_id(?)',
    AssignStudentsToCertificate: 'CALL assign_student_list_to_certificate(?, ?)',
    
    // Lesson procedures
    GetLessonsByCourseId: 'CALL get_lessons_by_course_id(?, ?)',  // Actualizado para incluir el ID del estudiante
    CreateLessonForCourse: 'CALL create_lesson_for_course(?, ?, ?, ?)',
    UpdateLesson: 'CALL update_lesson(?, ?, ?, ?)',
    DeleteLesson: 'CALL delete_lesson(?)',
    CreateLessonVideo: 'CALL create_lesson_video_by_lesson_id(?, ?)',
    DeleteVideo: 'CALL delete_video(?)',
    UpdateLessonStudentFinish: 'CALL update_lesson_student_finish(?, ?, ?)', // Nuevo procedimiento para actualizar el estado de finalización
    
    // Document procedures
    UploadCV: 'CALL upload_cv(?, ?)',
    UploadPhoto: 'CALL upload_photo(?, ?)',
    GetCVByStudentId: 'CALL get_cv_by_student_id(?)',
    GetPhotoByStudentId: 'CALL get_photo_by_student_id(?)',
    UpdateStudentProfileInfo: 'CALL update_student_profile_info(?, ?, ?, ?, ?, ?)',
    GetAllCertificatesByStudentId: 'CALL get_all_certificates_by_student_id(?)',
    GetCertificateByCourseId: 'CALL get_certificate_by_course_id(?, ?)',
    GetCertificateByUUID: 'CALL get_certificate_by_uuid(?)',
    
    // Teacher procedures
    GetAllTeachers: 'CALL get_all_teachers()',
    EnsureDefaultTeacher: 'CALL ensure_default_teacher()',
    
    // Dashboard Metrics procedures
    GetDashboardMetrics: 'CALL GetDashboardMetrics()',
    GetTotalStudents: 'CALL GetTotalStudents()',
    GetActiveCourses: 'CALL GetActiveCourses()',
    GetCertificatesIssued: 'CALL GetCertificatesIssued()',
    GetCompletionRate: 'CALL GetCompletionRate()',
    GetAverageHours: 'CALL GetAverageHours()',
    GetActiveStudents: 'CALL GetActiveStudents()',
    GetPassRate: 'CALL GetPassRate()',
    GetGraduatesThisYear: 'CALL GetGraduatesThisYear()'
};

export default StoredProcedures;
