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
    active BIT NOT NULL DEFAULT 1,
    inactive_datetime DATETIME DEFAULT NULL,
    creation_datetime DATETIME DEFAULT NULL,
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
    id_role INT NOT NULL,
    FOREIGN KEY (id_role) REFERENCES role(id)
);

CREATE TABLE teacher (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_role INT NOT NULL,
    FOREIGN KEY (id_role) REFERENCES role(id)
);

CREATE TABLE course (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    hours INT,
    teacher_id INT,
    FOREIGN KEY (teacher_id) REFERENCES teacher(id)
);

CREATE TABLE certificate (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    course_id INT,
    file LONGTEXT,
    date_emission DATE,
    FOREIGN KEY (student_id) REFERENCES student(id),
    FOREIGN KEY (course_id) REFERENCES course(id)
);

CREATE TABLE video_course (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    title VARCHAR(255),
    duration TIME,
    video_path VARCHAR(255),
    FOREIGN KEY (course_id) REFERENCES course(id)
);

CREATE TABLE student_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    video_id INT,
    completed BIT NOT NULL DEFAULT 0,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(id),
    FOREIGN KEY (course_id) REFERENCES course(id),
    FOREIGN KEY (video_id) REFERENCES video_course(id)
);
