USE virtual_class;

DELIMITER //

DROP PROCEDURE IF EXISTS get_or_create_google_user// 

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
    SELECT id INTO v_user_id FROM user WHERE email = p_email LIMIT 1;
    -- Si el usuario no existe, crearlo
    IF v_user_id IS NULL THEN
        INSERT INTO user (
            name,
            surname,
            email,
            password,
            active,
            inactive_datetime,
            creation_datetime,
            id_role
        )
        VALUES (
            p_name,
            p_surname,
            p_email,
            '',
            1,  -- active = true
            NOW(), -- fecha de creación actual
            NULL,
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
        IF EXISTS (SELECT 1 FROM student WHERE id = u.id AND cv_file IS NOT NULL) as hasCV,
        s.cv_file
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

CREATE PROCEDURE get_password_by_email(
    IN p_email VARCHAR(50)
)
BEGIN
    SELECT id, password
    FROM user
    WHERE email = p_email;
END //

DROP PROCEDURE IF EXISTS get_user_data_by_id// 

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
        IF EXISTS (SELECT 1 FROM student WHERE id = u.id AND cv_file IS NOT NULL) as hasCV
    FROM user u
    WHERE u.id = p_id;
END //

-- Certificate procedures
CREATE PROCEDURE get_all_certificates_by_student_id(
    IN p_student_id INT
)
BEGIN
BEGIN
    IF p_student_id IS NULL THEN
        SELECT 'student_id is null' AS message;
    ELSE
        SELECT c.id, cr.name, cr.hours, c.date_emission
        FROM certificate c
        INNER JOIN course cr ON c.course_id = cr.id
        WHERE student_id = p_student_id;
    END IF;
END //

CREATE PROCEDURE GetCertificateByCourseId(IN courseId INT)
BEGIN
  SELECT c.id, cr.name, cr.hours, c.date_emission, c.file
  FROM certificate c
  INNER JOIN course cr ON c.course_id = cr.id
  WHERE course_id = courseId;
END //
