INSERT INTO role (id, name)
VALUES (1, 'ADMIN'),
    (2, 'STUDENT'),
    (3, 'TEACHER');

INSERT INTO user (id, name, surname, email, password, active, id_role)
VALUES (1, 'Admin', 'Admin', 'admin@admin.com', 'password', 1, 1);

INSERT INTO admin_general (id_admin_general)
VALUES (1);
