DELIMITER //

CREATE PROCEDURE get_or_create_google_user(
    IN p_username VARCHAR(255),
    IN p_name VARCHAR(255),
    IN p_lastname VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT;
    
    -- Intentar encontrar el usuario por username (email)
    SELECT id INTO v_user_id FROM users WHERE username = p_username LIMIT 1;
    
    -- Si el usuario no existe, crearlo
    IF v_user_id IS NULL THEN
        INSERT INTO users (username, name, lastname, password, role_id)
        VALUES (p_username, p_name, p_lastname, '', 1); -- role_id 1 para usuarios normales
        
        SET v_user_id = LAST_INSERT_ID();
    END IF;
    
    -- Devolver los datos del usuario
    SELECT u.id, u.username, u.name, u.lastname, u.role_id
    FROM users u
    WHERE u.id = v_user_id;
END //

DELIMITER ;
