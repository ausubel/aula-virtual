USE virtual_class;

-- Actualizar algunos cursos existentes para que tengan certificados
UPDATE student_course 
SET has_certificate = 1, 
    finished = 1,
    finished_datetime = NOW()
WHERE student_id IN (5, 6) 
AND course_id IN (1, 2)
LIMIT 4;
