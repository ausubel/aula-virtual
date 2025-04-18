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
        u.phone,
        u.degree,
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
        0 as progress,
        cs.has_certificate
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
        c.id,
        c.id as course_id,
        c.name,
        c.description,
        c.hours,
        c.teacher_id,
        u.name as teacher_name,
        sc.has_certificate,
        sc.finished,
        IFNULL(
            (
                SELECT CAST(
                    (COUNT(CASE WHEN ls.finished = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) 
                    AS DECIMAL(5,2)
                )
                FROM lesson_student ls
                JOIN lesson l ON ls.lesson_id = l.id
                WHERE l.course_id = c.id 
                AND ls.student_id = p_student_id
            ),
            0
        ) as progress
    FROM student_course sc
    INNER JOIN course c ON sc.course_id = c.id
    LEFT JOIN user u ON c.teacher_id = u.id
    WHERE sc.student_id = p_student_id;
END//

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
CALL get_lessons_by_course_id(7, 5);
*/

CREATE PROCEDURE get_lessons_by_course_id(
    IN p_course_id INT,
    IN p_student_id INT
)
BEGIN
    SELECT 
        l.id,
        l.title,
        l.description,
        l.time,
        -- Si p_student_id es NULL, devuelve 0 para finished, de lo contrario, obtiene el valor real
        IF(p_student_id IS NULL, 0, 
            IFNULL((SELECT finished FROM lesson_student 
                    WHERE lesson_id = l.id AND student_id = p_student_id), 0)
        ) as finished,
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
update_proc: BEGIN
    -- Declarar todas las variables al inicio del procedimiento
    DECLARE v_exists_lesson INT;
    DECLARE v_exists_student INT;
    DECLARE v_exists INT;
    
    -- Verificar que la lección existe
    SELECT COUNT(*) INTO v_exists_lesson FROM lesson WHERE id = p_lesson_id;
    IF v_exists_lesson = 0 THEN
        SELECT 'LESSON_NOT_FOUND' as message;
        LEAVE update_proc;
    END IF;
    
    -- Verificar que el estudiante existe
    SELECT COUNT(*) INTO v_exists_student FROM student WHERE id = p_student_id;
    IF v_exists_student = 0 THEN
        SELECT 'STUDENT_NOT_FOUND' as message;
        LEAVE update_proc;
    END IF;
    
    -- Verificar si ya existe un registro para esta lección y estudiante
    SELECT COUNT(*) INTO v_exists FROM lesson_student 
    WHERE lesson_id = p_lesson_id AND student_id = p_student_id;

    -- Si no existe, insertamos un nuevo registro
    IF v_exists = 0 THEN
        INSERT INTO lesson_student (lesson_id, student_id, finished)
        VALUES (p_lesson_id, p_student_id, p_finished);
    ELSE
        -- Si existe, actualizamos el valor de finished
        UPDATE lesson_student
        SET finished = p_finished
        WHERE lesson_id = p_lesson_id AND student_id = p_student_id;
    END IF;
    
    -- Verificar si se realizó la operación correctamente
    IF ROW_COUNT() > 0 THEN
        SELECT 'SUCCESS' as message, p_lesson_id as lesson_id, p_student_id as student_id, p_finished as finished;
    ELSE
        SELECT 'ERROR_UPDATING' as message;
    END IF;
END//

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
        (SELECT COUNT(1) FROM student_course sc WHERE sc.course_id = c.id) as student_count,
        finished
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
        FROM student_ids si
        INNER JOIN user u ON si.id = u.id
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

-- Procedimiento para obtener todos los certificados de un estudiante
DROP PROCEDURE IF EXISTS get_all_certificates_by_student_id//

CREATE PROCEDURE get_all_certificates_by_student_id(IN p_student_id INT)
BEGIN
    -- Selecciona los datos del curso para estudiantes que tienen certificado
    SELECT DISTINCT
        c.id,
        c.name,
        c.hours,
        CONVERT_TZ(IFNULL(c.finished_datetime, sc.creation_datetime), 'UTC', 'UTC') as date_emission,
        NULL as file,
        sc.uuid
    FROM student_course sc
    INNER JOIN course c ON sc.course_id = c.id
    WHERE sc.student_id = p_student_id
        AND sc.has_certificate = 1
        AND sc.finished = 1;
END//

-- Procedimiento actualizado para obtener certificado por curso con más detalles
DROP PROCEDURE IF EXISTS get_certificate_by_course_id//

CREATE PROCEDURE get_certificate_by_course_id(
    IN p_course_id INT,
    IN p_student_id INT
)
BEGIN
    -- Si se proporciona un ID de estudiante, obtener el certificado específico
    IF p_student_id IS NOT NULL THEN
        SELECT 
            c.id,
            c.name,
            c.description,
            c.hours,
            CONVERT_TZ(IFNULL(c.finished_datetime, sc.creation_datetime), 'UTC', 'UTC') as date_emission,
            CONCAT(tu.name, ' ', tu.surname) as teacher_name,
            t.degree as teacher_degree,
            t.profile as teacher_profile,
            CONCAT(su.name, ' ', su.surname) as student_name,
            NULL as file,
            sc.uuid
        FROM course c
        JOIN teacher t ON c.teacher_id = t.id
        JOIN user tu ON t.id = tu.id
        JOIN student_course sc ON c.id = sc.course_id
        JOIN student s ON sc.student_id = s.id
        JOIN user su ON s.id = su.id
        WHERE c.id = p_course_id
        AND sc.student_id = p_student_id
        AND sc.has_certificate = 1
        LIMIT 1;
    ELSE
        -- Si no se proporciona un ID de estudiante, obtener información general del certificado
        SELECT 
            c.id,
            c.name,
            c.description,
            c.hours,
            CONVERT_TZ(c.finished_datetime, 'UTC', 'UTC') as date_emission,
            CONCAT(u.name, ' ', u.surname) as teacher_name,
            t.degree as teacher_degree,
            t.profile as teacher_profile,
            NULL as student_name,
            NULL as file,
            NULL as uuid
        FROM course c
        JOIN teacher t ON c.teacher_id = t.id
        JOIN user u ON t.id = u.id
        WHERE c.id = p_course_id
        LIMIT 1;
    END IF;
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

DROP PROCEDURE IF EXISTS update_user_data_by_id//

/* Prueba
CALL update_user_data_by_id(1, 'Juan', 'Perez', 'juanp@aula.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K','999999999','chistemas',true);
*/

CREATE PROCEDURE update_user_data_by_id(
    IN p_id INT,
    IN p_name VARCHAR(50),
    IN p_surname VARCHAR(50),
    IN p_email VARCHAR(50),
    IN p_password VARCHAR(60),
    IN p_phone VARCHAR(50),
    IN p_degree VARCHAR(50)
)
BEGIN
	IF p_password IS NOT NULL AND p_password <> '' THEN
		UPDATE user
        SET
			password = p_password
		WHERE id = p_id;
    END IF;
    UPDATE user 
    SET 
        name = p_name,
        surname = p_surname,
        email = p_email,
        phone = p_phone,
        degree = p_degree
    WHERE id = p_id;
    
    SELECT 'SUCCESS' as message;
END//

DROP PROCEDURE IF EXISTS get_student_profile_data//
/*
Pasos previos:
update lesson_student
set finished = 1
where student_id = 5;

update user
set phone = '123123123'
where id = 5;

update student_course 
set finished = 1, has_certificate = 1
where uuid in ('4ca8fd69-f8bd-11ef-80e9-3c7c3fb98339','5e7802e2-f7ca-11ef-9ea0-3c7c3fb98339');

Prueba
CALL get_student_profile_data(5, @result);
SELECT @result;
*/
CREATE PROCEDURE get_student_profile_data(
    IN p_student_id INT,
    OUT p_result JSON
)
BEGIN
    DECLARE total_courses INT;
    DECLARE completed_courses INT;
    DECLARE total_progress DECIMAL(5,2);
    DECLARE user_data JSON;
    DECLARE certificates_data JSON;
    DECLARE current_courses_data JSON;
    
    -- Get total courses enrolled
    SELECT COUNT(1) INTO total_courses 
    FROM student_course 
    WHERE student_id = p_student_id;
    
    -- Get completed courses
    SELECT COUNT(1) INTO completed_courses 
    FROM student_course 
    WHERE student_id = p_student_id AND finished = 1;
    
    -- Calculate total progress
    IF total_courses > 0 THEN
        SELECT (completed_courses / total_courses) * 100 INTO total_progress;
    ELSE
        SET total_progress = 0;
    END IF;
    
    -- Get user basic information
    SELECT JSON_OBJECT(
        'id', u.id,
        'name', u.name,
        'surname', u.surname,
        'email', u.email,
        'phone', u.phone,
        'location', IFNULL(s.location, ''),
        'bio', IFNULL(s.bio, ''),
        'coursesEnrolled', total_courses,
        'coursesCompleted', completed_courses,
        'totalProgress', total_progress
    ) INTO user_data
    FROM user u
    LEFT JOIN student s ON u.id = s.id
    WHERE u.id = p_student_id;
    
    -- Get certificates (completed courses with certificate)
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', c.id,
            'title', c.name,
            'issueDate', DATE_FORMAT(c.finished_datetime, '%d de %M, %Y'),
            'instructor', CONCAT(t_user.name, ' ', t_user.surname)
        )
    ) INTO certificates_data
    FROM student_course sc
    JOIN course c ON sc.course_id = c.id
    JOIN teacher t ON c.teacher_id = t.id
    JOIN user t_user ON t.id = t_user.id
    WHERE sc.student_id = p_student_id 
    AND sc.finished = 1 
    AND sc.has_certificate = 1;
    
    -- Handle NULL certificates
    IF certificates_data IS NULL THEN
        SET certificates_data = JSON_ARRAY();
    END IF;
    
    -- Get current courses (not finished)
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', c.id,
            'title', c.name,
            'progress', (
                SELECT 
                    IFNULL(
                        (COUNT(ls.id) * 100) / NULLIF(COUNT(l.id), 0),
                        0
                    )
                FROM lesson l
                LEFT JOIN lesson_student ls ON l.id = ls.lesson_id AND ls.student_id = p_student_id AND ls.finished = 1
                WHERE l.course_id = c.id
            ),
            'instructor', CONCAT(t_user.name, ' ', t_user.surname)
        )
    ) INTO current_courses_data
    FROM student_course sc
    JOIN course c ON sc.course_id = c.id
    JOIN teacher t ON c.teacher_id = t.id
    JOIN user t_user ON t.id = t_user.id
    WHERE sc.student_id = p_student_id 
    AND sc.finished = 0;
    
    -- Handle NULL current courses
    IF current_courses_data IS NULL THEN
        SET current_courses_data = JSON_ARRAY();
    END IF;
    
    -- Combine all data into a single JSON object
    SET p_result = JSON_OBJECT(
        'id', JSON_UNQUOTE(JSON_EXTRACT(user_data, '$.id')),
        'name', JSON_UNQUOTE(JSON_EXTRACT(user_data, '$.name')),
        'surname', JSON_UNQUOTE(JSON_EXTRACT(user_data, '$.surname')),
        'email', JSON_UNQUOTE(JSON_EXTRACT(user_data, '$.email')),
        'phone', JSON_UNQUOTE(JSON_EXTRACT(user_data, '$.phone')),
        'location', JSON_UNQUOTE(JSON_EXTRACT(user_data, '$.location')),
        'bio', JSON_UNQUOTE(JSON_EXTRACT(user_data, '$.bio')),
        'coursesEnrolled', JSON_EXTRACT(user_data, '$.coursesEnrolled'),
        'coursesCompleted', JSON_EXTRACT(user_data, '$.coursesCompleted'),
        'totalProgress', JSON_EXTRACT(user_data, '$.totalProgress'),
        'certificates', certificates_data,
        'currentCourses', current_courses_data
    );
END //

DROP PROCEDURE IF EXISTS get_cv_by_student_id//

CREATE PROCEDURE get_cv_by_student_id(
    IN p_student_id INT
)
BEGIN
    SELECT cv_file FROM student WHERE id = p_student_id;
END //

DROP PROCEDURE IF EXISTS upload_photo//

CREATE PROCEDURE upload_photo(
    IN p_file LONGTEXT,
    IN p_student_id INT
)
BEGIN
    IF p_file IS NULL OR p_student_id IS NULL THEN
        SELECT 'file or student_id is null' AS message;
    ELSE
        UPDATE student SET photo_file = p_file WHERE id = p_student_id;
    END IF;
END //

DROP PROCEDURE IF EXISTS update_student_profile_info//

/*
Prueba:
CALL update_student_profile_info(1, 'Lima, Perú', 'Estudiante de ingeniería de software apasionado por la tecnología.');
*/

CREATE PROCEDURE update_student_profile_info(
    IN p_student_id INT,
    IN p_name VARCHAR(100),
    IN p_surname VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_location VARCHAR(255),
    IN p_bio TEXT
)
BEGIN
    DECLARE v_bio_truncated TEXT;
    DECLARE v_student_exists INT;
    
    -- Verificar que el usuario exista
    IF NOT EXISTS (SELECT 1 FROM user WHERE id = p_student_id AND id_role = 2) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El usuario estudiante no existe';
    END IF;
    
    -- Verificar si el estudiante existe en la tabla student
    SELECT COUNT(1) INTO v_student_exists FROM student WHERE id = p_student_id;
    
    -- Si no existe, crearlo
    IF v_student_exists = 0 THEN
        INSERT INTO student (id, id_role) VALUES (p_student_id, 2);
    END IF;
    
    -- Limitar la biografía a 500 caracteres
    IF LENGTH(p_bio) > 500 THEN
        SET v_bio_truncated = LEFT(p_bio, 500);
    ELSE
        SET v_bio_truncated = p_bio;
    END IF;
    
    -- Actualizar la información del perfil en la tabla user
    UPDATE user
    SET 
        name = CASE WHEN p_name IS NOT NULL AND p_name != '' THEN p_name ELSE name END,
        surname = CASE WHEN p_surname IS NOT NULL AND p_surname != '' THEN p_surname ELSE surname END,
        phone = CASE WHEN p_phone IS NOT NULL AND p_phone != '' THEN p_phone ELSE phone END
    WHERE id = p_student_id AND id_role = 2;
    
    -- Actualizar la información del perfil en la tabla student
    UPDATE student
    SET 
        location = p_location,
        bio = v_bio_truncated
    WHERE id = p_student_id;
    
    SELECT 'Perfil actualizado correctamente' AS message;
END//

-- Procedimiento para obtener todos los certificados de un estudiante
DROP PROCEDURE IF EXISTS get_all_certificates_by_student_id//

CREATE PROCEDURE get_all_certificates_by_student_id(IN p_student_id INT)
BEGIN
    -- Selecciona los datos del curso para estudiantes que tienen certificado
    SELECT DISTINCT
        c.id,
        c.name,
        c.hours,
        CONVERT_TZ(IFNULL(c.finished_datetime, sc.creation_datetime), 'UTC', 'UTC') as date_emission,
        NULL as file,
        sc.uuid
    FROM student_course sc
    INNER JOIN course c ON sc.course_id = c.id
    WHERE sc.student_id = p_student_id
        AND sc.has_certificate = 1
        AND sc.finished = 1;
END//

-- Procedimiento actualizado para obtener certificado por curso con más detalles
DROP PROCEDURE IF EXISTS get_certificate_by_course_id//

CREATE PROCEDURE get_certificate_by_course_id(
    IN p_course_id INT,
    IN p_student_id INT
)
BEGIN
    -- Si se proporciona un ID de estudiante, obtener el certificado específico
    IF p_student_id IS NOT NULL THEN
        SELECT 
            c.id,
            c.name,
            c.description,
            c.hours,
            CONVERT_TZ(IFNULL(c.finished_datetime, sc.creation_datetime), 'UTC', 'UTC') as date_emission,
            CONCAT(tu.name, ' ', tu.surname) as teacher_name,
            t.degree as teacher_degree,
            t.profile as teacher_profile,
            CONCAT(su.name, ' ', su.surname) as student_name,
            NULL as file,
            sc.uuid
        FROM course c
        JOIN teacher t ON c.teacher_id = t.id
        JOIN user tu ON t.id = tu.id
        JOIN student_course sc ON c.id = sc.course_id
        JOIN student s ON sc.student_id = s.id
        JOIN user su ON s.id = su.id
        WHERE c.id = p_course_id
        AND sc.student_id = p_student_id
        AND sc.has_certificate = 1
        LIMIT 1;
    ELSE
        -- Si no se proporciona un ID de estudiante, obtener información general del certificado
        SELECT 
            c.id,
            c.name,
            c.description,
            c.hours,
            CONVERT_TZ(c.finished_datetime, 'UTC', 'UTC') as date_emission,
            CONCAT(u.name, ' ', u.surname) as teacher_name,
            t.degree as teacher_degree,
            t.profile as teacher_profile,
            NULL as student_name,
            NULL as file,
            NULL as uuid
        FROM course c
        JOIN teacher t ON c.teacher_id = t.id
        JOIN user u ON t.id = u.id
        WHERE c.id = p_course_id
        LIMIT 1;
    END IF;
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



-- Procedimiento para obtener el total de cursos activos
DROP PROCEDURE IF EXISTS GetActiveCourses//

CREATE PROCEDURE GetActiveCourses()
BEGIN
    SELECT COUNT(1) as total FROM course WHERE finished = 0;
END //

-- Procedimiento para obtener el total de certificados emitidos
DROP PROCEDURE IF EXISTS GetCertificatesIssued//

CREATE PROCEDURE GetCertificatesIssued()
BEGIN
    SELECT COUNT(*) as total 
    FROM student_course 
    WHERE has_certificate = 1;
END //


-- Procedimiento para calcular la tasa de finalización de cursos
DROP PROCEDURE IF EXISTS GetCompletionRate//
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


-- Procedimiento para calcular el promedio de horas por curso
DROP PROCEDURE IF EXISTS GetAverageHours//
CREATE PROCEDURE GetAverageHours()
BEGIN
    SELECT COALESCE(ROUND(AVG(hours), 0), 0) as average_hours 
    FROM course
    WHERE hours > 0;
END //


-- Procedimiento para obtener los estudiantes activos en la última semana
DROP PROCEDURE IF EXISTS GetActiveStudents//
CREATE PROCEDURE GetActiveStudents()
BEGIN
    -- Estudiantes con actividad reciente en lecciones o cursos
    SELECT COUNT(DISTINCT student_id) as active_students
    FROM (
        -- Estudiantes que han iniciado o completado cursos recientemente
        SELECT student_id
        FROM student_course
        WHERE creation_datetime >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        UNION
        -- Estudiantes que han completado lecciones recientemente
        SELECT ls.student_id
        FROM lesson_student ls
        WHERE ls.finished = 1
    ) active_users;
END //


-- Procedimiento para calcular la tasa de aprobación (basada en lecciones completadas)
DROP PROCEDURE IF EXISTS GetPassRate//
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


-- Procedimiento para obtener los graduados de este año
DROP PROCEDURE IF EXISTS GetGraduatesThisYear//
CREATE PROCEDURE GetGraduatesThisYear()
BEGIN
    SELECT COUNT(DISTINCT student_id) as total
    FROM student_course
    WHERE finished = 1 
    AND YEAR(finished_datetime) = YEAR(CURRENT_DATE());
END //


-- Procedimiento principal que obtiene todas las métricas del dashboard
DROP PROCEDURE IF EXISTS GetDashboardMetrics//
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
    SELECT COUNT(DISTINCT a.student_id) as graduates_this_year
    FROM student_course a
    INNER JOIN course c ON a.course_id = c.id
    WHERE a.finished = 1 
    AND YEAR(c.finished_datetime) = YEAR(CURRENT_DATE());
END //

DROP PROCEDURE IF EXISTS finish_course_by_id;

CREATE PROCEDURE finish_course_by_id(
    IN p_course_id INT
)
BEGIN
    UPDATE course
    SET finished = 1, finished_datetime = NOW()
    WHERE id = p_course_id;

    UPDATE student_course
    SET finished = 1  
    WHERE course_id = p_course_id;
END //

DROP PROCEDURE IF EXISTS finish_course_by_id;

CREATE PROCEDURE finish_course_by_id(
    IN p_course_id INT
)
BEGIN
    UPDATE course
    SET finished = 1, finished_datetime = NOW()
    WHERE id = p_course_id;

    UPDATE student_course
    SET finished = 1  
    WHERE course_id = p_course_id;
END //


-- Procedimiento para asignar certificados a los estudiantes de un curso
DROP PROCEDURE IF EXISTS assign_student_list_to_certificate//

CREATE PROCEDURE assign_student_list_to_certificate(
    IN p_course_id INT,
    IN p_student_list_ids JSON
)
BEGIN
    -- Declarar variables
    DECLARE v_course_exists INT;
    
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
        
        UPDATE student_course A
        INNER JOIN student_ids B ON A.student_id = B.student_id
        SET A.has_certificate = 1;
        
        SELECT 'SUCCESS' as message, COUNT(*) as count;
    END IF;
END//

-- Procedimiento para obtener un certificado por su UUID
DROP PROCEDURE IF EXISTS get_certificate_by_uuid//

CREATE PROCEDURE get_certificate_by_uuid(IN p_uuid VARCHAR(36))
BEGIN
    SELECT 
        c.id,
        c.name,
        c.description,
        c.hours,
        CONVERT_TZ(IFNULL(c.finished_datetime, sc.creation_datetime), 'UTC', 'UTC') as date_emission,
        CONCAT(tu.name, ' ', tu.surname) as teacher_name,
        t.degree as teacher_degree,
        t.profile as teacher_profile,
        CONCAT(su.name, ' ', su.surname) as student_name,
        NULL as file,
        sc.uuid
    FROM student_course sc
    JOIN course c ON sc.course_id = c.id
    JOIN student s ON sc.student_id = s.id
    JOIN user su ON s.id = su.id
    JOIN teacher t ON c.teacher_id = t.id
    JOIN user tu ON t.id = tu.id
    WHERE sc.uuid = p_uuid
    AND sc.has_certificate = 1;
END//

DELIMITER ;