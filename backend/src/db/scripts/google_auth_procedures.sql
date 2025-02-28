DELIMITER //

DROP PROCEDURE IF EXISTS get_or_create_google_user// 

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
            username,
            userpass,
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
        u.active
    FROM user u
    WHERE u.id = v_user_id;
END //

DELIMITER ;
