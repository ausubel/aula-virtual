USE virtual_class;

-- Asegurarnos que el estudiante con ID 5 tenga cursos asignados
INSERT IGNORE INTO student_course (student_id, course_id, creation_datetime)
VALUES 
(5, 1, NOW()),
(5, 2, NOW());

-- Marcar estos cursos como completados con certificado
UPDATE student_course 
SET 
    has_certificate = 1,
    finished = 1,
    finished_datetime = NOW()
WHERE student_id = 5 
AND course_id IN (1, 2);

-- Verificar los datos
SELECT 
    sc.student_id,
    c.name as course_name,
    sc.has_certificate,
    sc.finished,
    sc.finished_datetime
FROM student_course sc
JOIN course c ON sc.course_id = c.id
WHERE sc.student_id = 5;
