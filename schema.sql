
CREATE DATABASE itcc40;
USE itcc40;

CREATE TABLE users (
    userid INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

INSERT INTO users (username, password) VALUES
('bynayot', '1234'),
('beyn', '5678');
