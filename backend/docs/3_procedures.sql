USE virtual_class;

DELIMITER //

-- Procedimiento para obtener todos los certificados de un estudiante
DROP PROCEDURE IF EXISTS get_all_certificates_by_student_id//

CREATE PROCEDURE get_all_certificates_by_student_id(IN p_student_id INT)
BEGIN
    -- Selecciona los datos del curso para estudiantes que tienen certificado
    SELECT DISTINCT
        c.id,
        c.name,
        c.hours,
        IFNULL(sc.finished_datetime, sc.creation_datetime) as date_emission,
        NULL as file
    FROM student_course sc
    INNER JOIN course c ON sc.course_id = c.id
    WHERE sc.student_id = p_student_id
        AND sc.has_certificate = 1
        AND sc.finished = 1;
END//

-- Procedimiento actualizado para obtener certificado por curso con más detalles
DROP PROCEDURE IF EXISTS get_certificate_by_course_id//

CREATE PROCEDURE get_certificate_by_course_id(IN p_course_id INT)
BEGIN
    SELECT 
        c.id,
        c.name,
        c.description,
        c.hours,
        c.creation_datetime as date_emission,
        CONCAT(u.name, ' ', u.surname) as teacher_name,
        t.degree as teacher_degree,
        t.profile as teacher_profile,
        NULL as file
    FROM course c
    INNER JOIN user u ON c.teacher_id = u.id
    INNER JOIN teacher t ON u.id = t.id
    WHERE c.id = p_course_id;
END//

-- Procedimiento para contar certificados de un estudiante
DROP PROCEDURE IF EXISTS get_certificates_count_by_student//

CREATE PROCEDURE get_certificates_count_by_student(IN p_student_id INT)
BEGIN
    SELECT COUNT(*) as certificates_count
    FROM student_course sc
    WHERE sc.student_id = p_student_id
        AND sc.has_certificate = 1
        AND sc.finished = 1;
END//

DELIMITER ;

-- Insertar datos de prueba
-- Primero, asegurarnos de que el profesor tenga los datos completos
UPDATE teacher 
SET degree = 'Doctor en Ciencias de la Computación',
    profile = 'Profesor con más de 10 años de experiencia en desarrollo de software y educación en tecnología.'
WHERE id IN (
    SELECT teacher_id 
    FROM course 
    WHERE id IN (1, 2)
);

-- Actualizar algunos cursos con descripciones
UPDATE course
SET description = CASE id 
    WHEN 1 THEN 'Curso completo de desarrollo web, abarcando front-end y back-end con las últimas tecnologías.'
    WHEN 2 THEN 'Curso intensivo de bases de datos SQL, desde conceptos básicos hasta administración avanzada.'
    ELSE description
END
WHERE id IN (1, 2);

-- Asignar certificados a estudiantes específicos
UPDATE student_course 
SET has_certificate = 1,
    finished = 1,
    finished_datetime = NOW()
WHERE student_id IN (5, 6)
AND course_id IN (1, 2);

-- Test queries
-- CALL get_all_certificates_by_student_id(5);
-- CALL get_certificate_by_course_id(1);
-- CALL get_certificates_count_by_student(5);
