DELIMITER //

CREATE PROCEDURE get_or_create_google_user(
    IN p_email VARCHAR(50),
    IN p_name VARCHAR(50),
    IN p_surname VARCHAR(50)
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_role_id INT;
    
    -- Obtener el primer rol disponible (asumiendo que es el rol por defecto)
    SELECT id INTO v_role_id FROM role LIMIT 1;
    
    IF v_role_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No hay roles disponibles en la tabla role';
    END IF;
    
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
            creation_datetime,
            id_role
        )
        VALUES (
            p_name,
            p_surname,
            p_email,
            '', -- Password vacío para usuarios de Google
            1,  -- active = true
            NOW(), -- fecha de creación actual
            v_role_id -- Usar el rol obtenido
        );
        
        SET v_user_id = LAST_INSERT_ID();
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
