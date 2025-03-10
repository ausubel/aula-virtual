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
('Pupa','Rodríguez',  'pupa@gmail.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K',1,3, '123456789'),
('Maria', 'Garcia', 'maria@gmail.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K',1,2, '123456789'),
('Carlos', 'Lopez', 'carlos@gmail.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K',1,2, '123456789'),
('Laura', 'Martinez', 'laura@gmail.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K',1,2, '123456789'),
('Joaquin', 'Gonzalez', 'joaquin@gmail.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K',1,2, '123456789'),
('Jose', 'Molina', 'jose@gmail.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K',1,2, '123456789'),
('Ana', 'Ruiz', 'ana@gmail.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K',1,2, '123456789'),
('Sergio', 'Sanchez', 'sergio@gmail.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K',1,2, '123456789'),
('Luis', 'Perez', 'luis@gmail.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K',1,2, '123456789'),
('Miguel', 'Hernandez', 'miguel@gmail.com', '$2a$12$UpFrqypEsvCV/ph5eqi8CepwOXsWny1Oo9cAb5s9U2PZJ7JTV.c2K',1,2, '123456789');

INSERT INTO admin_general (id_admin_general)
VALUES (1);

-- Profesores
INSERT INTO teacher (id, id_role, degree, profile) 
VALUES 
  (2, 3, 'Software Engineer', 'Expert in Java'),
  (3, 3, 'Software Engineer', 'Expert in Python'),
  (4, 3, 'Software Engineer', 'Expert in C++');
    
-- Estudiantes
INSERT INTO student (id, id_role) 
VALUES 
  (5, 2),
  (6, 2),
  (7, 2),
  (8, 2),
  (9, 2),
  (10, 2),
  (11, 2),
  (12, 2),
  (13, 2);
    
-- Cursos
INSERT INTO course (name, description, hours, teacher_id, creation_datetime) 
VALUES 
  ('Desarrollo Web Full Stack', 'Curso completo de desarrollo web', 120, 2, '2024-01-01'),
  ('Bases de Datos SQL', 'Curso completo de bases de datos SQL', 120, 3, '2024-01-01'),
  ('Programación Orientada a Objetos', 'Curso completo de programación orientada a objetos', 120, 4, '2024-01-01'),
  ('Introducción a la Programación', 'Curso completo de introducción a la programación', 120, 2, '2024-01-01'),
  ('Desarrollo Web Frontend', 'Curso completo de desarrollo web frontend', 120, 3, '2024-01-01'),
  ('Desarrollo Web Backend', 'Curso completo de desarrollo web backend', 120, 4, '2024-01-01'),
  ('Desarrollo Web Full Stack Avanzado', 'Curso completo de desarrollo web full stack avanzado', 120, 2, '2024-01-01');

-- Asignación de estudiantes a cursos
-- Se agrega el certificado para el estudiante "Maria Garcia" (id 5) en dos cursos, con fechas de emisión distintas.
INSERT INTO student_course (student_id, course_id, has_certificate, creation_datetime)
VALUES 
  (5, 1, 1, '2024-05-01'),
  (6, 1, 0, '2024-05-01'),
  (5, 2, 1, '2024-05-03'),
  (6, 2, 0, '2024-05-01');

-- Lecciones
INSERT INTO lesson (course_id, title, description, time, order_)
VALUES 
  (1, 'Introducción', 'Curso introductorio de desarrollo web', 120, 1),
  (1, 'Fundamentos de HTML', 'Curso de introducción a HTML', 120, 2),
  (1, 'Fundamentos de CSS', 'Curso de introducción a CSS', 120, 3),
  (2, 'Introducción', 'Curso introductorio de bases de datos SQL', 120, 1),
  (2, 'Fundamentos de SQL', 'Curso de introducción a SQL', 120, 2),
  (3, 'Introducción', 'Curso introductorio de programación orientada a objetos', 120, 1),
  (3, 'Fundamentos de POO', 'Curso de introducción a POO', 120, 2),
  (4, 'Introducción', 'Curso introductorio de introducción a la programación', 120, 1),
  (4, 'Fundamentos de programación', 'Curso de introducción a la programación', 120, 2),
  (5, 'Introducción', 'Curso introductorio de desarrollo web frontend', 120, 1),
  (5, 'Fundamentos de HTML', 'Curso de introducción a HTML', 120, 2),
  (5, 'Fundamentos de CSS', 'Curso de introducción a CSS', 120, 3),
  (6, 'Introducción', 'Curso introductorio de desarrollo web backend', 120, 1),
  (6, 'Fundamentos de SQL', 'Curso de introducción a SQL', 120, 2),
  (7, 'Introducción', 'Curso introductorio de desarrollo web full stack avanzado', 120, 1),
  (7, 'Fundamentos de HTML', 'Curso de introducción a HTML', 120, 2),
  (7, 'Fundamentos de CSS', 'Curso de introducción a CSS', 120, 3);

-- Relación lección-estudiante (para seguimiento de progreso)
INSERT INTO lesson_student (lesson_id, student_id)
VALUES 
  (1, 5),
  (1, 6),
  (2, 5),
  (2, 6),
  (3, 5),
  (3, 6),
  (4, 5),
  (4, 6),
  (5, 5),
  (5, 6);
