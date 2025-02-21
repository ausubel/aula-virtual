USE virtual_class;

DELIMITER //

CREATE PROCEDURE get_all_certificates_by_student_id(
    IN p_student_id INT
)
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

DELIMITER //
CREATE PROCEDURE GetCertificateByCourseId(IN courseId INT)
BEGIN
  SELECT c.id, cr.name, cr.hours, c.date_emission, c.file
  FROM certificate c
  INNER JOIN course cr ON c.course_id = cr.id
  WHERE course_id = courseId;
END //

DELIMITER //
CREATE PROCEDURE upload_cv(
    IN p_file LONGTEXT
)
BEGIN
    IF p_file IS NULL THEN
        SELECT 'file is null' AS message;
    ELSE
        INSERT INTO student (cv_file) VALUES (p_file);
    END IF;
END //

DELIMITER;

CREATE TABLE student (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cv_file LONGTEXT,
    id_role INT NOT NULL,
    FOREIGN KEY (id_role) REFERENCES role(id)
);