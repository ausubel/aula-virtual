USE virtual_class;

DELIMITER //

DROP PROCEDURE IF EXISTS register_student//

/* Prueba
CALL register_student('prueba@aula.com', 'Prueba', 'Prueba', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K');
SELECT * FROM user;
*/

CREATE PROCEDURE register_student(
    IN p_email VARCHAR(50),
    IN p_name VARCHAR(50),
    IN p_surname VARCHAR(50),
    IN p_password VARCHAR(60)
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_role_id INT;
    DECLARE v_existing_user INT;
    
    -- Verificar si el email ya existe
    SELECT id INTO v_existing_user FROM user WHERE email = p_email LIMIT 1;
    
    IF v_existing_user IS NOT NULL THEN
        SELECT 'EMAIL_EXISTS' as message;
    ELSE
        SET v_role_id = 2; -- ID del rol STUDENT
        
        -- Iniciar transacción
        START TRANSACTION;
        
        BEGIN
            -- Usar un bloque BEGIN/END para capturar errores
            DECLARE EXIT HANDLER FOR SQLEXCEPTION
            BEGIN
                -- Si hay error, hacer rollback
                ROLLBACK;
                SELECT 'ERROR' as message;
            END;
            
            -- Insertar en la tabla user
            INSERT INTO user (
                name,
                surname,
                email,
                password,
                id_role
            ) VALUES (
                p_name,
                p_surname,
                p_email,
                p_password,
                v_role_id
            );
            
            -- Obtener el ID del usuario insertado
            SET v_user_id = LAST_INSERT_ID();
            
            -- Insertar en la tabla student
            INSERT INTO student (id, id_role)
            VALUES (v_user_id, v_role_id);
            
            -- Confirmar transacción
            COMMIT;
            
            -- Devolver SUCCESS
            SELECT 'SUCCESS' as message;
        END;
    END IF;
END //

DROP PROCEDURE IF EXISTS get_or_create_google_user// 

/* Prueba
CALL get_or_create_google_user('prueba@aula.com', 'Prueba', 'Prueba');
*/

-- Login procedures
CREATE PROCEDURE get_or_create_google_user(
    IN p_email VARCHAR(50),
    IN p_name VARCHAR(50),
    IN p_surname VARCHAR(50)
)
BEGIN
    DECLARE v_user_id INT;

    DECLARE v_role_id INT;
    SET v_role_id = 2;

    -- Intentar encontrar el usuario por email
    SELECT id INTO v_user_id FROM user WHERE email = p_email;
    -- Si el usuario no existe, crearlo
    IF v_user_id IS NULL THEN
        INSERT INTO user (
            name,
            surname,
            email,
            id_role
        )
        VALUES (
            p_name,
            p_surname,
            p_email,
            v_role_id -- Usar el rol obtenido
        );
        
        SET v_user_id = LAST_INSERT_ID();
        
        INSERT INTO student (id, id_role)
        VALUES (v_user_id, v_role_id);
    
    END IF;

    -- Devolver los datos del usuario
    SELECT 
        u.id,
        u.email,
        u.name,
        u.surname,
        u.id_role as roleId,
        (SELECT 1 FROM student WHERE id = u.id AND cv_file IS NOT NULL) as hasCV
    FROM user u
    WHERE u.id = v_user_id;
END //

DROP PROCEDURE IF EXISTS upload_cv// 

CREATE PROCEDURE upload_cv(
    IN p_file LONGTEXT,
    IN p_student_id INT
)
BEGIN
    IF p_file IS NULL OR p_student_id IS NULL THEN
        SELECT 'file or student_id is null' AS message;
    ELSE
        UPDATE student SET cv_file = p_file WHERE id = p_student_id;
    END IF;
END //

DROP PROCEDURE IF EXISTS get_password_by_email//

/* Prueba
CALL get_password_by_email('prueba@aula.com');
*/

CREATE PROCEDURE get_password_by_email(
    IN p_email VARCHAR(50)
)
BEGIN
    SELECT id, password
    FROM user
    WHERE email = p_email;
END //

DROP PROCEDURE IF EXISTS get_user_data_by_id// 

/* Prueba
CALL get_user_data_by_id(1);
*/

CREATE PROCEDURE get_user_data_by_id(
    IN p_id INT
)
BEGIN
    SELECT 
        u.id,
        u.email,
        u.name,
        u.surname,
        u.id_role as roleId,
        u.active,
        (SELECT 1 FROM student WHERE id = u.id AND cv_file IS NOT NULL) as hasCV
    FROM user u
    WHERE u.id = p_id;
END //

DROP PROCEDURE IF EXISTS get_all_teachers//

/* Prueba
CALL get_all_teachers();
*/

CREATE PROCEDURE get_all_teachers()
BEGIN
    SELECT 
        u.id,
        t.degree,
        t.profile,
        u.email,
        u.name,
        u.surname
    FROM user u
    INNER JOIN teacher t ON u.id = t.id
    WHERE u.id_role = 3 and u.active = 1;
END //

DROP PROCEDURE IF EXISTS get_all_students//

/* Prueba
CALL get_all_students();
*/

CREATE PROCEDURE get_all_students()
BEGIN
    SELECT 
        u.id,
        u.email,
        u.name,
        u.surname
    FROM user u
    INNER JOIN student s ON u.id = s.id
    WHERE u.id_role = 2 and u.active = 1;
END //

DROP PROCEDURE IF EXISTS create_course//

/* Prueba
CALL create_course('Prueba Nombre', 'Prueba Descripcion', 10, 3);
select * from course;
*/

CREATE PROCEDURE create_course(
    IN p_name VARCHAR(50),
    IN p_description TEXT,
    IN p_hours INT,
    IN p_teacher_id INT
)
BEGIN
    INSERT INTO course (teacher_id, name, description, hours) 
    VALUES (p_teacher_id, p_name, p_description, p_hours);

    SELECT 'SUCCESS' as message;
END //

DROP PROCEDURE IF EXISTS assign_students_list_to_course//

/* Prueba
CALL assign_students_list_to_course(7, '[8, 9, 10]');
select * from student_course where student_id in (8, 9, 10);
select * from lesson_student where student_id in (8, 9, 10);
*/

CREATE PROCEDURE assign_students_list_to_course(
    IN p_course_id INT,
    IN p_student_list_ids JSON
)
BEGIN
    -- Declarar todas las variables al principio
    DECLARE v_course_exists INT;
    DECLARE v_valid_students INT;
    
    -- Verificar que el curso existe
    SELECT COUNT(1) INTO v_course_exists FROM course WHERE id = p_course_id;
    
    -- Convertir la lista en una tabla temporal
    DROP TEMPORARY TABLE IF EXISTS student_ids;
    CREATE TEMPORARY TABLE student_ids AS
    SELECT t.id 
    FROM JSON_TABLE(
        p_student_list_ids, 
        '$[*]' COLUMNS(id INT PATH '$')
    ) t;
    
    IF v_course_exists = 0 THEN
        SELECT 'COURSE_NOT_FOUND' as message;
    ELSE
        -- Crear tabla temporal con solo los estudiantes que existen que no esten en el curso
        DROP TEMPORARY TABLE IF EXISTS valid_student_ids;
        CREATE TEMPORARY TABLE valid_student_ids AS
        SELECT s.id
        FROM student_ids si
        INNER JOIN student s ON si.id = s.id
        WHERE s.id NOT IN (SELECT student_id FROM student_course WHERE course_id = p_course_id);
        
        -- Verificar si hay estudiantes válidos
        SELECT COUNT(1) INTO v_valid_students FROM valid_student_ids;
        
        IF v_valid_students = 0 THEN
            SELECT 'NO_VALID_STUDENTS' as message;
        ELSE
            -- Asignar los estudiantes válidos al curso
            INSERT INTO student_course (id, course_id, student_id) 
            SELECT UUID(), p_course_id, id FROM valid_student_ids;
            
            -- Asignar las lecciones a los estudiantes si existen
            DROP TEMPORARY TABLE IF EXISTS lesson_ids;
            CREATE TEMPORARY TABLE lesson_ids AS 
            SELECT id FROM lesson WHERE course_id = p_course_id;
            
            -- Para cada estudiante válido, asignar todas las lecciones del curso
            -- Verificar primero que no existan ya estas asignaciones
            INSERT INTO lesson_student (lesson_id, student_id)
            SELECT l.id, s.id 
            FROM valid_student_ids s
            CROSS JOIN lesson_ids l
            WHERE NOT EXISTS (
                SELECT 1 FROM lesson_student ls 
                WHERE ls.lesson_id = l.id AND ls.student_id = s.id
            );

            DROP TEMPORARY TABLE IF EXISTS lesson_ids;

            SELECT 'SUCCESS' as message;
        END IF;
    END IF;
    
    -- Limpiar tablas temporales
    DROP TEMPORARY TABLE IF EXISTS student_ids;
    DROP TEMPORARY TABLE IF EXISTS valid_student_ids;
END //

DROP PROCEDURE IF EXISTS get_all_courses_by_teacher_id//

/* Prueba
CALL get_all_courses_by_teacher_id(1);
*/

CREATE PROCEDURE get_all_courses_by_teacher_id(
    IN p_teacher_id INT
)
BEGIN
    SELECT 
        c.id,
        c.name,
        c.description,
        c.hours
    FROM course c
    WHERE c.teacher_id = p_teacher_id;
END //

DROP PROCEDURE IF EXISTS get_course_by_id//

/* Prueba
CALL get_course_by_id(1);
*/

CREATE PROCEDURE get_course_by_id(
    IN p_course_id INT
)
BEGIN
    SELECT 
        c.id,
        c.name,
        c.description,
        c.hours
    FROM course c
    WHERE c.id = p_course_id;
END //

DROP PROCEDURE IF EXISTS get_students_by_course_id//

/* Prueba
CALL get_students_by_course_id(1);
*/

CREATE PROCEDURE get_students_by_course_id(
    IN p_course_id INT
)
BEGIN
    SELECT 
        sc.student_id
    FROM student_course sc
    WHERE sc.course_id = p_course_id;
END //

DROP PROCEDURE IF EXISTS get_courses_by_student_id//

/* Prueba
CALL get_courses_by_student_id(1);
*/

CREATE PROCEDURE get_courses_by_student_id(
    IN p_student_id INT
)
BEGIN
    SELECT
        sc.id,
        sc.course_id,
        c.name,
        c.description,
        c.hours,
        sc.finished,
        sc.has_certificate
    FROM student_course sc
    INNER JOIN course c ON sc.course_id = c.id
    WHERE sc.student_id = p_student_id;
END //

DROP PROCEDURE IF EXISTS create_lesson_for_course//

/* Prueba
CALL create_lesson_for_course(7, 'Prueba Lesson 1', 'Prueba Lesson 1 Description', 10);
select * from lesson_student where lesson_id in (select id from lesson where course_id = 7) order by 2,3;
select * from lesson where course_id = 7;
select * from student_course where course_id = 7;
*/

CREATE PROCEDURE create_lesson_for_course(
    IN p_course_id INT,
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    IN p_time INT
)
BEGIN
	DECLARE v_last_order INT;
    SELECT MAX(order_) + 1 INTO v_last_order FROM lesson where course_id = p_course_id;
    
    INSERT INTO lesson (course_id, title, description, time, order_)
    VALUES (p_course_id, p_title, p_description, p_time, v_last_order);
    
    -- Insertar en lesson_student los estudiantes del curso
    INSERT INTO lesson_student (lesson_id, student_id)
    SELECT LAST_INSERT_ID(), student_id
    FROM student_course
    WHERE course_id = p_course_id;
    
    SELECT 'SUCCESS' as message;
END //

DROP PROCEDURE IF EXISTS get_lessons_by_course_id//

/* Prueba
CALL get_lessons_by_course_id(7);
*/

CREATE PROCEDURE get_lessons_by_course_id(
    IN p_course_id INT
)
BEGIN
    SELECT 
        l.id,
        l.title,
        l.description,
        l.time
    FROM lesson l
    WHERE l.course_id = p_course_id
    ORDER BY l.order_ ASC;
END //

DROP PROCEDURE IF EXISTS create_lesson_video_by_lesson_id//

/* Prueba
CALL create_lesson_video_by_lesson_id(20, 'https://www.youtube.com/watch?v=QH2-TGUlwu4');
SELECT * FROM lesson_video;
*/

CREATE PROCEDURE create_lesson_video_by_lesson_id(
    IN p_lesson_id INT,
    IN p_video_path LONGTEXT
)
BEGIN
    INSERT INTO lesson_video (lesson_id, video_path)
    VALUES (p_lesson_id, p_video_path);
    
    SELECT 'SUCCESS' as message;
END //

DROP PROCEDURE IF EXISTS get_course_details_by_id//

/* Prueba
SET @result = NULL;
CALL get_course_details_by_id(7, @result);
SELECT @result;
*/

CREATE PROCEDURE get_course_details_by_id(
    IN p_course_id INT,
    OUT p_result JSON
)
BEGIN 
    DECLARE course_json JSON;
    DECLARE lessons_json JSON;
    DECLARE videos_json JSON;
    
    DROP TABLE IF EXISTS temp_course;
    DROP TABLE IF EXISTS temp_lessons;
    DROP TABLE IF EXISTS temp_videos;
    -- Crear tabla temporal para el curso y profesor
    CREATE TEMPORARY TABLE temp_course AS
    SELECT 
        c.id,
        c.name,
        c.description,
        c.hours,
        u.id AS teacher_id,
        u.name AS teacher_name,
        u.surname AS teacher_surname
    FROM course c
    INNER JOIN user u ON c.teacher_id = u.id
    WHERE c.id = p_course_id;
    
    -- Crear tabla temporal para las lecciones
    CREATE TEMPORARY TABLE temp_lessons AS
    SELECT 
        l.id,
        l.title,
        l.description,
        l.time,
        l.order_
    FROM lesson l
    WHERE l.course_id = p_course_id
    ORDER BY l.order_ ASC;
    
    -- Crear tabla temporal para los videos
    CREATE TEMPORARY TABLE temp_videos AS
    SELECT 
        lv.id,
        lv.lesson_id,
        lv.video_path
    FROM lesson_video lv
    INNER JOIN lesson l ON lv.lesson_id = l.id
    WHERE l.course_id = p_course_id;
    
    -- Convertir curso a JSON
    SELECT JSON_OBJECT(
        'id', id,
        'name', name,
        'description', description,
        'hours', hours,
        'teacher', JSON_OBJECT(
            'id', teacher_id,
            'name', teacher_name,
            'surname', teacher_surname
        )
    ) INTO course_json
    FROM temp_course;
    
    -- Convertir lecciones a JSON array
    SELECT COALESCE(JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', l.id,
            'title', l.title,
            'description', l.description,
            'time', l.time,
            'order', l.order_,
            'videos', (
                SELECT COALESCE(JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', v.id,
                        'video_path', v.video_path
                    )
                ), JSON_ARRAY())
                FROM temp_videos v
                WHERE v.lesson_id = l.id
            )
        )
    ), JSON_ARRAY()) INTO lessons_json
    FROM temp_lessons l;
    
    -- Combinar todo en un único JSON
    SET p_result = JSON_OBJECT(
        'course', course_json,
        'lessons', lessons_json
    );
    
    -- Limpiar tablas temporales
    DROP TEMPORARY TABLE IF EXISTS temp_course;
    DROP TEMPORARY TABLE IF EXISTS temp_lessons;
    DROP TEMPORARY TABLE IF EXISTS temp_videos;
END //

DROP PROCEDURE IF EXISTS update_lesson_student_finish//

/* Prueba
CALL update_lesson_student_finish(1, 1, 1);
*/

CREATE PROCEDURE update_lesson_student_finish(
    IN p_lesson_id INT,
    IN p_student_id INT,
    IN p_finished BIT
)
BEGIN
    UPDATE lesson_student
    SET finished = p_finished
    WHERE lesson_id = p_lesson_id AND student_id = p_student_id;
    
    SELECT 'SUCCESS' as message;
END //

DROP PROCEDURE IF EXISTS get_course_details_for_certificate_by_id//

/* Prueba
SET @result = NULL;
CALL get_course_details_for_certificate_by_id(7, @result);
SELECT @result;
*/

CREATE PROCEDURE get_course_details_for_certificate_by_id(
    IN p_course_id INT,
    OUT p_result JSON
)
BEGIN
    DECLARE v_id INT;
    DECLARE v_name VARCHAR(255);
    DECLARE v_description TEXT;
    DECLARE v_hours INT;
    DECLARE v_teacher_id INT;
    DECLARE v_teacher_name VARCHAR(50);
    DECLARE v_teacher_surname VARCHAR(50);
    
    -- Obtener la información del curso y del profesor
    SELECT 
        c.id,
        c.name,
        c.description,
        c.hours,
        u.id,
        u.name,
        u.surname
    INTO
        v_id,
        v_name,
        v_description,
        v_hours,
        v_teacher_id,
        v_teacher_name,
        v_teacher_surname
    FROM course c
    JOIN user u ON c.teacher_id = u.id
    WHERE c.id = p_course_id;
    
    -- Devuelve el resultado en formato JSON
    SET p_result = JSON_OBJECT(
        'id', v_id,
        'name', v_name,
        'description', v_description,
        'hours', v_hours,
        'teacher', JSON_OBJECT(
            'id', v_teacher_id,
            'name', v_teacher_name,
            'surname', v_teacher_surname
        )
    );
END //