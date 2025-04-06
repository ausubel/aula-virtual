USE virtual_class;

-- Roles
INSERT INTO role (id, name)
VALUES 
  (1, 'ADMIN'),
  (2, 'STUDENT'),
  (3, 'TEACHER');

INSERT INTO user (name, surname, email, password, active, id_role, phone)
VALUES ('Admin', 'Admin', 'admin@admin.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K', 1, 1, '123456789'),
('Pepe','Rodríguez',  'pepe@gmail.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K',1,3, '123456789'),
('Papu','Rodríguez',  'papu@gmail.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K',1,3, '123456789'),
('Pupa','Rodríguez',  'pupa@gmail.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K',1,3, '123456789');
INSERT INTO admin_general (id_admin_general)
VALUES (1);

-- Profesores
INSERT INTO teacher (id, id_role, degree, profile) 
VALUES 
  (2, 3, 'Software Engineer', 'Expert in Java'),
  (3, 3, 'Software Engineer', 'Expert in Python'),
  (4, 3, 'Software Engineer', 'Expert in C++');
