-- Procedimiento para obtener el total de estudiantes
DELIMITER //
CREATE PROCEDURE GetTotalStudents()
BEGIN
    -- Usamos la tabla user junto con student para obtener estudiantes activos
    SELECT COUNT(DISTINCT s.id) as total 
    FROM student s
    JOIN user u ON s.id = u.id
    WHERE u.active = 1;
END //
DELIMITER ;

-- Procedimiento para obtener el total de cursos activos
DELIMITER //
CREATE PROCEDURE GetActiveCourses()
BEGIN
    SELECT COUNT(*) as total FROM course;
END //
DELIMITER ;

-- Procedimiento para obtener el total de certificados emitidos
DELIMITER //
CREATE PROCEDURE GetCertificatesIssued()
BEGIN
    SELECT COUNT(*) as total 
    FROM student_course 
    WHERE has_certificate = 1;
END //
DELIMITER ;

-- Procedimiento para calcular la tasa de finalización de cursos
DELIMITER //
CREATE PROCEDURE GetCompletionRate()
BEGIN
    SELECT 
        ROUND(
            (COUNT(CASE WHEN finished = 1 THEN 1 END) / 
            NULLIF(COUNT(*), 0)) * 100, 
            2
        ) as completion_rate
    FROM student_course;
END //
DELIMITER ;

-- Procedimiento para calcular el promedio de horas por curso
DELIMITER //
CREATE PROCEDURE GetAverageHours()
BEGIN
    SELECT COALESCE(ROUND(AVG(hours), 0), 0) as average_hours 
    FROM course
    WHERE hours > 0;
END //
DELIMITER ;

-- Procedimiento para obtener los estudiantes activos en la última semana
DELIMITER //
CREATE PROCEDURE GetActiveStudents()
BEGIN
    -- Estudiantes con actividad reciente en lecciones o cursos
    SELECT COUNT(DISTINCT student_id) as active_students
    FROM (
        -- Estudiantes que han iniciado o completado cursos recientemente
        SELECT student_id
        FROM student_course
        WHERE creation_datetime >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        OR finished_datetime >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        
        UNION
        
        -- Estudiantes que han completado lecciones recientemente
        SELECT ls.student_id
        FROM lesson_student ls
        WHERE ls.finished = 1
    ) active_users;
END //
DELIMITER ;

-- Procedimiento para calcular la tasa de aprobación (basada en lecciones completadas)
DELIMITER //
CREATE PROCEDURE GetPassRate()
BEGIN
    SELECT 
        ROUND(
            (COUNT(CASE WHEN ls.finished = 1 THEN 1 END) / 
            NULLIF(COUNT(*), 0)) * 100, 
            2
        ) as pass_rate
    FROM lesson_student ls;
END //
DELIMITER ;

-- Procedimiento para obtener los graduados de este año
DELIMITER //
CREATE PROCEDURE GetGraduatesThisYear()
BEGIN
    SELECT COUNT(DISTINCT student_id) as total
    FROM student_course
    WHERE finished = 1 
    AND YEAR(finished_datetime) = YEAR(CURRENT_DATE());
END //
DELIMITER ;

-- Procedimiento principal que obtiene todas las métricas del dashboard
DELIMITER //
CREATE PROCEDURE GetDashboardMetrics()
BEGIN
    -- Total de estudiantes activos
    SELECT COUNT(DISTINCT s.id) as total_students 
    FROM student s
    JOIN user u ON s.id = u.id
    WHERE u.active = 1;
    
    -- Total de cursos
    SELECT COUNT(*) as total_active_courses FROM course;
    
    -- Certificados emitidos
    SELECT COUNT(*) as certificates_issued 
    FROM student_course 
    WHERE has_certificate = 1;
    
    -- Tasa de finalización
    SELECT 
        ROUND(
            (COUNT(CASE WHEN finished = 1 THEN 1 END) / 
            NULLIF(COUNT(*), 0)) * 100, 
            2
        ) as completion_rate
    FROM student_course;
    
    -- Promedio de horas por curso
    SELECT COALESCE(ROUND(AVG(hours), 0), 0) as average_hours 
    FROM course
    WHERE hours > 0;
    
    -- Estudiantes activos en la última semana
    SELECT COUNT(DISTINCT student_id) as active_students
    FROM (
        SELECT student_id
        FROM student_course
        WHERE creation_datetime >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        OR finished_datetime >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        
        UNION
        
        SELECT ls.student_id
        FROM lesson_student ls
        WHERE ls.finished = 1
    ) active_users;
    
    -- Tasa de aprobación basada en lecciones completadas
    SELECT 
        ROUND(
            (COUNT(CASE WHEN ls.finished = 1 THEN 1 END) / 
            NULLIF(COUNT(*), 0)) * 100, 
            2
        ) as pass_rate
    FROM lesson_student ls;
    
    -- Graduados este año
    SELECT COUNT(DISTINCT student_id) as graduates_this_year
    FROM student_course
    WHERE finished = 1 
    AND YEAR(finished_datetime) = YEAR(CURRENT_DATE());
END //
DELIMITER ;