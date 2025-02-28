
USE virtual_class;

INSERT INTO role (id, name)
VALUES (1, 'ADMIN'),
    (2, 'STUDENT'),
    (3, 'TEACHER');

INSERT INTO user (id, name, surname, email, password, active, id_role)
VALUES (1, 'Admin', 'Admin', 'admin@admin.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K', 1, 1),
(2, 'Pepe','Rodríguez',  'carlos@gmail.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K',1,3 );

INSERT INTO admin_general (id_admin_general)
VALUES (1);

INSERT INTO teacher (id, id_role) 
VALUES (2, 3);

INSERT INTO course (name, description, hours, teacher_id) 
VALUES ('Desarrollo Web Full Stack', 'Curso completo de desarrollo web', 120, 2);