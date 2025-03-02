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

CREATE PROCEDURE get_all_students()
BEGIN
    SELECT 
        u.id,
        u.name,
        u.email,
        0 as progress
    FROM user u
    WHERE u.id_role = 2; -- Asumiendo que el id_role 2 corresponde a estudiantes
END//

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

-- Procedimiento para obtener los estudiantes de un curso
DROP PROCEDURE IF EXISTS get_students_by_course_id//

CREATE PROCEDURE get_students_by_course_id(
    IN p_course_id INT
)
BEGIN
    SELECT 
        u.id,
        u.name,
        u.email,
        0 as progress
    FROM user u
    INNER JOIN student_course cs ON u.id = cs.student_id
    WHERE cs.course_id = p_course_id;
END//

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

CREATE PROCEDURE get_lessons_by_course_id(IN p_course_id INT)
BEGIN
    SELECT 
        l.id,
        l.title,
        l.description,
        l.time,
        COALESCE(
            JSON_ARRAYAGG(
                IF(v.id IS NOT NULL,
                    JSON_OBJECT(
                        'id', v.id,
                        'videoPath', v.video_path
                    ),
                    NULL
                )
            ),
            JSON_ARRAY()
        ) as videos
    FROM lesson l
    LEFT JOIN lesson_video v ON l.id = v.lesson_id
    WHERE l.course_id = p_course_id
    GROUP BY l.id, l.title, l.description, l.time
    ORDER BY l.id ASC;
END//

DROP PROCEDURE IF EXISTS create_lesson_video_by_lesson_id//

/* Prueba
CALL create_lesson_video_by_lesson_id(20, 'https://www.youtube.com/watch?v=QH2-TGUlwu4');
SELECT * FROM lesson_video;
*/

CREATE PROCEDURE create_lesson_video_by_lesson_id(
    IN p_lesson_id INT,
    IN p_video_path VARCHAR(255)
)
BEGIN
    -- Insertamos el nuevo video
    INSERT INTO lesson_video (lesson_id, video_path)
    VALUES (p_lesson_id, p_video_path);
    
    -- Obtenemos el ID del video insertado
    SET @video_id = LAST_INSERT_ID();
    
    -- Devolvemos los datos del video
    SELECT 
        id,
        video_path as videoPath,
        lesson_id as lessonId
    FROM lesson_video
    WHERE id = @video_id;
END//

DROP PROCEDURE IF EXISTS get_course_details_by_id//

CREATE PROCEDURE get_course_details_by_id(IN p_course_id INT)
BEGIN
    SELECT 
        c.id,
        c.name,
        c.description,
        c.hours,
        c.teacher_id,
        CONCAT(u.name, ' ', u.surname) as teacher_name,
        (SELECT COUNT(*) FROM student_course sc WHERE sc.course_id = c.id) as student_count
    FROM course c
    LEFT JOIN user u ON c.teacher_id = u.id
    WHERE c.id = p_course_id;
END//

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

DROP PROCEDURE IF EXISTS get_all_courses//

/* Prueba
CALL get_all_courses();
*/

CREATE PROCEDURE get_all_courses()
BEGIN
    SELECT 
        c.id,
        c.name,
        c.description,
        c.hours,
        c.teacher_id,
        CONCAT(u.name, ' ', u.surname) as teacher_name,
        (SELECT COUNT(*) FROM student_course sc WHERE sc.course_id = c.id) as student_count
    FROM course c
    LEFT JOIN user u ON c.teacher_id = u.id
    ORDER BY c.id DESC;
END //

DROP PROCEDURE IF EXISTS update_lesson//

CREATE PROCEDURE update_lesson(
    IN p_lesson_id INT,
    IN p_title VARCHAR(100),
    IN p_description TEXT,
    IN p_time INT
)
BEGIN
    UPDATE lesson
    SET 
        title = p_title,
        description = p_description,
        time = p_time
    WHERE id = p_lesson_id;
    
    -- Devolver la lección actualizada
    SELECT 
        l.id,
        l.title,
        l.description,
        l.time,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', v.id,
                'video_path', v.video_path
            )
        ) as videos
    FROM lesson l
    LEFT JOIN lesson_video v ON l.id = v.lesson_id
    WHERE l.id = p_lesson_id
    GROUP BY l.id, l.title, l.description, l.time;
END//

DROP PROCEDURE IF EXISTS delete_lesson//

CREATE PROCEDURE delete_lesson(
    IN p_lesson_id INT
)
BEGIN
    -- Primero eliminar los registros relacionados
    DELETE FROM lesson_video WHERE lesson_id = p_lesson_id;
    DELETE FROM lesson_student WHERE lesson_id = p_lesson_id;
    
    -- Luego eliminar la lección
    DELETE FROM lesson WHERE id = p_lesson_id;
    
    SELECT 'SUCCESS' as message;
END //

DROP PROCEDURE IF EXISTS delete_video//

CREATE PROCEDURE delete_video(
    IN p_video_id INT
)
BEGIN
    -- Verificar si el video existe
    DECLARE v_exists INT;
    SELECT COUNT(*) INTO v_exists FROM lesson_video WHERE id = p_video_id;
    
    IF v_exists > 0 THEN
        -- Eliminar el video
        DELETE FROM lesson_video WHERE id = p_video_id;
        SELECT 'SUCCESS' as message, p_video_id as id;
    ELSE
        SELECT 'NOT_FOUND' as message, p_video_id as id;
    END IF;
END //

DROP PROCEDURE IF EXISTS ensure_default_teacher//

CREATE PROCEDURE ensure_default_teacher()
BEGIN
    DECLARE v_teacher_id INT;
    
    -- Verificar si ya existe un profesor
    SELECT id INTO v_teacher_id FROM teacher LIMIT 1;
    
    -- Si no existe ningún profesor, crear uno por defecto
    IF v_teacher_id IS NULL THEN
        -- Primero crear el usuario
        INSERT INTO user (
            name,
            surname,
            email,
            username,
            userpass,
            active,
            creation_datetime,
            id_role
        ) VALUES (
            'Profesor',
            'Por Defecto',
            'profesor@default.com',
            'profesor.default',
            '$2b$10$ZQh5hVxYWJtO5ZuKxvUrruYXNL2V9YvzqeuZW4QJxwxLjr1VOO.Hy', -- contraseña: 123456
            1,
            NOW(),
            3 -- rol de profesor
        );
        
        -- Obtener el ID del usuario creado
        SET v_teacher_id = LAST_INSERT_ID();
        
        -- Crear el registro en la tabla teacher
        INSERT INTO teacher (id, id_role, degree, profile)
        VALUES (v_teacher_id, 3, 'Profesor', 'Profesor por defecto del sistema');
    END IF;
    
    -- Devolver el ID del profesor
    SELECT v_teacher_id as teacher_id;
END//

DROP PROCEDURE IF EXISTS update_course//

CREATE PROCEDURE update_course(
    IN p_course_id INT,
    IN p_name VARCHAR(100),
    IN p_description TEXT,
    IN p_hours INT,
    IN p_teacher_id INT
)
BEGIN
    UPDATE course
    SET 
        name = p_name,
        description = p_description,
        hours = p_hours,
        teacher_id = p_teacher_id
    WHERE id = p_course_id;
    
    -- Devolver los datos actualizados
    SELECT 
        c.id,
        c.name,
        c.description,
        c.hours,
        c.teacher_id,
        CONCAT(u.name, ' ', u.surname) as teacher_name,
        (SELECT COUNT(*) FROM student_course sc WHERE sc.course_id = c.id) as student_count
    FROM course c
    LEFT JOIN user u ON c.teacher_id = u.id
    WHERE c.id = p_course_id;
END//

DROP PROCEDURE IF EXISTS remove_student_from_course//

/* Prueba
CALL remove_student_from_course(1, 2);
*/

CREATE PROCEDURE remove_student_from_course(
    IN p_course_id INT,
    IN p_student_id INT
)
BEGIN
    DECLARE v_course_exists INT;
    DECLARE v_student_in_course INT;
    
    -- Verificar que el curso existe
    SELECT COUNT(1) INTO v_course_exists FROM course WHERE id = p_course_id;
    
    -- Verificar que el estudiante está en el curso
    SELECT COUNT(1) INTO v_student_in_course 
    FROM student_course 
    WHERE course_id = p_course_id AND student_id = p_student_id;
    
    IF v_course_exists = 0 THEN
        SELECT 'COURSE_NOT_FOUND' as message;
    ELSEIF v_student_in_course = 0 THEN
        SELECT 'STUDENT_NOT_IN_COURSE' as message;
    ELSE
        -- Eliminar las asignaciones de lecciones
        DELETE FROM lesson_student 
        WHERE student_id = p_student_id 
        AND lesson_id IN (SELECT id FROM lesson WHERE course_id = p_course_id);
        
        -- Eliminar la asignación del curso
        DELETE FROM student_course 
        WHERE course_id = p_course_id AND student_id = p_student_id;
        
        SELECT 'SUCCESS' as message, p_student_id as student_id;
    END IF;
END//

DROP PROCEDURE IF EXISTS assign_students_list_to_course//

CREATE PROCEDURE assign_students_list_to_course(
    IN p_course_id INT,
    IN p_student_list_ids JSON
)
BEGIN
    -- Declarar variables
    DECLARE v_course_exists INT;
    DECLARE v_valid_students INT;
    
    -- Verificar que el curso existe
    SELECT COUNT(1) INTO v_course_exists FROM course WHERE id = p_course_id;
    
    -- Convertir la lista JSON en una tabla temporal
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
        -- Crear tabla temporal con solo los estudiantes que existen y que no están en el curso
        DROP TEMPORARY TABLE IF EXISTS valid_student_ids;
        CREATE TEMPORARY TABLE valid_student_ids AS
        SELECT s.id
        FROM student_ids s
        INNER JOIN user u ON s.id = u.id
        WHERE u.id_role = 2
        AND s.id NOT IN (SELECT student_id FROM student_course WHERE course_id = p_course_id);
        
        -- Verificar si hay estudiantes válidos
        SELECT COUNT(1) INTO v_valid_students FROM valid_student_ids;
        
        IF v_valid_students = 0 THEN
            SELECT 'NO_VALID_STUDENTS' as message;
        ELSE
            -- Asignar los estudiantes válidos al curso
            INSERT INTO student_course (course_id, student_id) 
            SELECT p_course_id, id FROM valid_student_ids;
            
            SELECT 'SUCCESS' as message, v_valid_students as count;
        END IF;
    END IF;
END//

-- Procedimiento para asignar estudiantes a un curso
DROP PROCEDURE IF EXISTS assign_students_list_to_course//

CREATE PROCEDURE assign_students_list_to_course(
    IN p_course_id INT,
    IN p_student_list_ids JSON
)
BEGIN
    -- Declarar variables
    DECLARE v_course_exists INT;
    DECLARE v_valid_students INT;
    
    -- Verificar que el curso existe
    SELECT COUNT(1) INTO v_course_exists FROM course WHERE id = p_course_id;
    
    -- Convertir la lista JSON en una tabla temporal
    DROP TEMPORARY TABLE IF EXISTS student_ids;
    CREATE TEMPORARY TABLE student_ids (
        student_id INT
    );
    
    -- Insertar los IDs de estudiantes desde el JSON a la tabla temporal
    INSERT INTO student_ids (student_id)
    SELECT t.id 
    FROM JSON_TABLE(
        p_student_list_ids, 
        '$[*]' COLUMNS(id INT PATH '$')
    ) t;
    
    IF v_course_exists = 0 THEN
        SELECT 'COURSE_NOT_FOUND' as message;
    ELSE
        -- Crear tabla temporal con solo los estudiantes que existen y que no están en el curso
        DROP TEMPORARY TABLE IF EXISTS valid_student_ids;
        CREATE TEMPORARY TABLE valid_student_ids (
            student_id INT
        );
        
        INSERT INTO valid_student_ids (student_id)
        SELECT s.student_id
        FROM student_ids s
        INNER JOIN user u ON s.student_id = u.id
        WHERE u.id_role = 2 -- Asumiendo que el id_role 2 corresponde a estudiantes
        AND s.student_id NOT IN (SELECT student_id FROM student_course WHERE course_id = p_course_id);
        
        -- Verificar si hay estudiantes válidos
        SELECT COUNT(1) INTO v_valid_students FROM valid_student_ids;
        
        IF v_valid_students = 0 THEN
            SELECT 'NO_VALID_STUDENTS' as message;
        ELSE
            -- Asignar los estudiantes válidos al curso
            -- No especificamos la columna uuid, se generará automáticamente
            INSERT INTO student_course (course_id, student_id) 
            SELECT p_course_id, student_id FROM valid_student_ids;
            
            SELECT 'SUCCESS' as message, v_valid_students as count;
        END IF;
    END IF;
END//
DELIMITER ;