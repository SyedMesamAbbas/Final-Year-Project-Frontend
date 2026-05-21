Create Database HouseofTutor
use HouseofTutor

CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    cnic VARCHAR(20),
    password VARCHAR(100),
    role VARCHAR(20) CHECK (role IN ('Student', 'Tutor', 'Admin'))
);

CREATE TABLE Tutor (
    tutor_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    qualification VARCHAR(100),
    experience INT,
    location VARCHAR(Max),
    radius INT,
    status VARCHAR(20),
    Latitude FLOAT, 
    Longitude FLOAT,

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);


CREATE TABLE Student (
    student_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    location VARCHAR(Max),
    Latitude FLOAT, 
    Longitude FLOAT,

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);


CREATE TABLE Course (
    course_id INT PRIMARY KEY IDENTITY(1,1),
    course_title VARCHAR(100)
);

//This is for Tutor Schedule
CREATE TABLE Schedule (
    schedule_id INT PRIMARY KEY IDENTITY(1,1),
    tutor_id INT,
    day VARCHAR(20),
    time VARCHAR(100),

    FOREIGN KEY (tutor_id) REFERENCES Tutor(tutor_id)
);

CREATE TABLE Student_Schedule (
    schedule_id INT PRIMARY KEY IDENTITY(1,1),
    student_id INT,
    day VARCHAR(20),
    time VARCHAR(100),

    FOREIGN KEY (student_id) REFERENCES Student(student_id),
);

CREATE TABLE Tutor_Course (
    tutor_id INT,
    course_id INT,
    grade VARCHAR(10),

    PRIMARY KEY (tutor_id, course_id),
    FOREIGN KEY (tutor_id) REFERENCES Tutor(tutor_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);

CREATE TABLE Student_Course (
    student_id INT,
    course_id INT,

    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);


CREATE TABLE Request (
    request_id INT PRIMARY KEY IDENTITY(1,1),
    student_id INT,
    tutor_id INT,
    course_id INT,
    request_date DATETIME DEFAULT GETDATE(),
    Status Varchar(50),
    Time VARCHAR(100),

    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (tutor_id) REFERENCES Tutor(tutor_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);


CREATE TABLE Feedback (
    feedback_id INT PRIMARY KEY IDENTITY(1,1),
    student_id INT,
    tutor_id INT,
    course_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(255),
    feedback_date DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (tutor_id) REFERENCES Tutor(tutor_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);