USE mysql;

DROP DATABASE IF EXISTS virtual_class;

CREATE DATABASE virtual_class;

USE virtual_class;

CREATE TABLE IF NOT EXISTS role(
    id INT NOT NULL,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE user (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(60) NULL,
    phone VARCHAR(20) NULL,
    degree VARCHAR(50) NULL,
    active BIT NOT NULL DEFAULT 1,
    creation_datetime DATETIME DEFAULT NOW(),
    inactive_datetime DATETIME DEFAULT NULL,
    id_role INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (id_role) REFERENCES role(id)
);

CREATE TABLE admin_general (
    id_admin_general INT NOT NULL,
    PRIMARY KEY (id_admin_general),
    FOREIGN KEY (id_admin_general) REFERENCES user(id)
);

CREATE TABLE student (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cv_file LONGTEXT,
    photo_file LONGTEXT,
    location VARCHAR(255),
    bio TEXT,
    id_role INT NOT NULL,
    FOREIGN KEY (id_role) REFERENCES role(id)
);

CREATE TABLE teacher (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_role INT NOT NULL,
    degree VARCHAR(50),
    profile LONGTEXT,
    FOREIGN KEY (id_role) REFERENCES role(id)
);

CREATE TABLE course (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT,
    name VARCHAR(255),
    description TEXT,
    hours INT,
    creation_datetime DATETIME DEFAULT NOW(),
    FOREIGN KEY (teacher_id) REFERENCES teacher(id)
);

CREATE TABLE student_course (
    uuid VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id INT,
    course_id INT,
    finished BIT NOT NULL DEFAULT 0,
    has_certificate BIT NOT NULL DEFAULT 0,
    creation_datetime DATETIME DEFAULT NOW(),
    finished_datetime DATETIME DEFAULT NULL,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE
);

CREATE TABLE lesson (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    title VARCHAR(255),
    description TEXT,
    time INT,
    order_ INT,
    FOREIGN KEY (course_id) REFERENCES course(id)
);

CREATE TABLE lesson_video (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT,
    video_path LONGTEXT,
    FOREIGN KEY (lesson_id) REFERENCES lesson(id)
);

CREATE TABLE lesson_student (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT,
    student_id INT,
    finished BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (lesson_id) REFERENCES lesson(id),
    FOREIGN KEY (student_id) REFERENCES student(id)
);