SELECT @@SERVERNAME;

Create Database HouseofTutor
use HouseofTutor

CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    cnic VARCHAR(20),
    password VsARCHAR(100),
    role VARCHAR(20) CHECK (role IN ('Student', 'Tutor', 'Admin','Parent'))
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
    status VARCHAR(20),
    location VARCHAR(Max),
    Latitude FLOAT, 
    Longitude FLOAT,
    Father_Cnic VARCHAR(20),

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Course (
    course_id INT PRIMARY KEY IDENTITY(1,1),
    course_title VARCHAR(100)
);

CREATE TABLE Schedule (
    schedule_id INT PRIMARY KEY IDENTITY(1,1),
    tutor_id INT,
    day VARCHAR(20),
    time VARCHAR(100),
    start_date DATE,
    end_date DATE,
    Type varchar(50),

    FOREIGN KEY (tutor_id) REFERENCES Tutor(tutor_id)
);

CREATE TABLE Student_Schedule (
    schedule_id INT PRIMARY KEY IDENTITY(1,1),
    student_id INT,
    day VARCHAR(20),
    time VARCHAR(100),
    start_date DATE,
    end_date DATE,
    Type varchar(50),

    FOREIGN KEY (student_id) REFERENCES Student(student_id),
);

CREATE TABLE Tutor_Course (
    tutor_id INT,
    course_id INT,
    grade VARCHAR(10),
    is_completed BIT NOT NULL DEFAULT 0,
    completed_date DATETIME NULL,

    PRIMARY KEY (tutor_id, course_id),
    FOREIGN KEY (tutor_id) REFERENCES Tutor(tutor_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);

CREATE TABLE Student_Course (
    student_id INT,
    course_id INT,
    grade VARCHAR(10),

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
    class_date DATE,
    day VARCHAR(20),
    request_type VARCHAR(50), -- Normal / Reschedule / Preschedule
    parent_request_id INT NULL, --Original class reference
    learning_mode VARCHAR(20),      -- FullTime / SpecificTime
    learning_duration INT NULL,     -- e.g. 2
    learning_duration_unit VARCHAR(20) NULL, -- Days / Weeks / Months

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
    feedback_by NVARCHAR(20),

    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (tutor_id) REFERENCES Tutor(tutor_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);

--Tutor fee per Course
CREATE TABLE Tutor_Course_Rate (
    rate_id INT PRIMARY KEY IDENTITY(1,1),
    tutor_id INT NOT NULL,
    course_id INT NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    admin_set_min_hourly_rate DECIMAL(10,2),
    admin_set_max_hourly_rate DECIMAL(10,2),
    
    FOREIGN KEY (tutor_id) REFERENCES Tutor(tutor_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);

--Student Total Fee per Course,,,,And I think When Tutor mark Course Done Insert Total Fee in this Table 
CREATE TABLE Student_Course_Fee
(
    fee_id INT PRIMARY KEY IDENTITY(1,1),
    student_id INT NOT NULL,
    tutor_id INT NOT NULL,
    course_id INT NOT NULL,
    total_fee DECIMAL(10,2) NOT NULL,
    created_date DATETIME DEFAULT GETDATE(),

    FOREIGN KEY(student_id) REFERENCES Student(student_id),
    FOREIGN KEY(tutor_id) REFERENCES Tutor(tutor_id),
    FOREIGN KEY(course_id) REFERENCES Course(course_id),
    UNIQUE(student_id, tutor_id, course_id)
);

CREATE TABLE Payment
(
    payment_id INT PRIMARY KEY IDENTITY(1,1),
    fee_id INT,
    amount DECIMAL(10,2),
    payment_type VARCHAR(20),   -- Full / Partial
    payment_date DATETIME DEFAULT GETDATE(),
    parent_status VARCHAR(20),  -- Sent
    tutor_status VARCHAR(20),   -- Pending / Received / NotReceived
    remarks VARCHAR(200),

    FOREIGN KEY(fee_id) REFERENCES Student_Course_Fee(fee_id)
);


--Student Specific Time Alteration 
ALTER TABLE Request
ADD learning_mode VARCHAR(20),      -- FullTime / SpecificTime
    learning_duration INT NULL,     -- e.g. 2
    learning_duration_unit VARCHAR(20) NULL; -- Days / Weeks / Months


ALTER TABLE Student
ADD Father_Cnic VARCHAR(20);

ALTER TABLE Users
ADD CONSTRAINT chk_role CHECK (role IN ('Student', 'Tutor', 'Admin', 'Parent'));
--Add CONSTRAINT (CONSTRAINT_NAME) CHECK (role In ('Student', 'Tutor', 'Admin', 'Parent'))
ALTER TABLE Feedback
ADD feedback_by NVARCHAR(20)

Alter table Schedule Add start_date DATE;
Alter table Schedule Add end_date DATE;
Alter Table Schedule Add Type varchar(50);

Alter table Student_Schedule Add start_date DATE;
Alter table Student_Schedule Add end_date DATE;
Alter Table Student_Schedule Add Type varchar(50);

Alter table Student_Course Add grade VARCHAR(10);

ALTER TABLE Request
ADD class_date DATE,
    day VARCHAR(20),
    request_type VARCHAR(50), -- Normal / Reschedule / Preschedule
    parent_request_id INT NULL; --Original class reference


ALTER TABLE Tutor_Course ADD is_completed BIT NOT NULL DEFAULT 0;
ALTER TABLE Tutor_Course ADD completed_date DATETIME NULL;

ALTER TABLE Tutor_Course_Rate
ADD
admin_set_min_hourly_rate DECIMAL(10,2),
admin_set_max_hourly_rate DECIMAL(10,2);

Alter table Student Add status VARCHAR(20);


Select * from Users    
Select * from Student
Select * from Tutor
Select * from Course
Select * from Schedule
Select * from Student_Schedule
Select * from Tutor_Course
Select * from Student_Course
Select * from Request
Select * from Feedback
Select * from Student_Course_Fee
Select * from Tutor_Course_Rate
Select * from Payment


update Tutor set status = 'Pending' where user_id =6
update Request set Status='Pending' where student_id=2 and course_id=1 
update Request set Status='Complete' where student_id=2 and course_id=1
update Request set Status='Complete' where student_id=2 and course_id=2
update Request set Status='Complete' where request_id=3037
update Request set request_date='2026-06-18 03:03:10.383' where student_id=2
update Request set class_date='2s026-06-18' where student_id=2
update Request set class_date='2026-06-18' where tutor_id=2
update Request set request_type='Normal' where request_id=2015
update Request set class_date='2026-06-28' where day='Fri'
update Request set Status ='Accepted' where tutor_id=2 
update Request set Status ='Accepted' where tutor_id=2 and day='Thu' and request_id=3039
update Request set Status ='Cancelled' where tutor_id=2
update Request set Status ='Accepted' where student_id=2
update Request set Status='Complete' where student_id=2
update Request set Status='Complete' where tutor_id=3038
update Request set Status='RequestedByStudent' where request_id>=3034
update Student Set Father_Cnic='6856886422468' where user_id=7
update Tutor_Course SET is_completed = 0, completed_date = NULL WHERE course_id = 1;
update Users set full_name='Mesam' where user_id=1015
update Users set email='15121472' where user_id=1020
update Users set password='51214' where user_id=1020
update Student set Father_Cnic='738393626281' where student_id=23
update Student set Father_Cnic='6856886422468' where student_id=6
update Payment set tutor_status='Pending'where payment_id=1
update Tutor_Course set is_completed=1 where tutor_id=2
update Request set class_date= '2026-8-1' where request_id=3039
update Request set class_date= '2026-8-1' where student_id=2


Delete from Request where request_id<=2013
Delete from Schedule where schedule_id<=13
Delete from Student_Schedule where schedule_id<=60
Delete from Tutor_Course where tutor_id!=2
Delete from Tutor_Course where course_id=12
Delete from Tutor_Course where tutor_id=2
Delete from Feedback where student_id!=2
Delete from Users where user_id=1012
Delete from Student where user_id=1012
Delete Tutor_Course




--Preschedule



---for tutor fees
CREATE TABLE Tutor_Course_Rate (
    rate_id INT PRIMARY KEY IDENTITY(1,1),
    tutor_id INT NOT NULL,
    course_id INT NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (tutor_id) REFERENCES Tutor(tutor_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);
--Write an API function which parent get number of classes per Course from this tutor to pay the fee to that tutor








INSERT INTO Users (full_name, email, phone, cnic, password, role)
VALUES ('System Administrator', 'admin@example.com', '033123456789', '12345-6789012-3', 'SecurePass123!', 'Tutor');

INSERT INTO Users (full_name, email, phone, cnic, password, role)

VALUES ('Student', 'student@example.com', '033123456789', '12345-6789012-2', 'SecurePass123!', 'Student');
INSERT INTO Users (full_name, email, phone, cnic, password, role)
VALUES ('Tutor', 'Tutor@example.com', '033123456789', '12345-6789012-2', 'SecurePass123!', 'Tutor');

Insert into Users (full_name, email, phone, cnic, password, role) Values
('ABC','abc123@gmail.com','03331223344','12345-6789012-5','123','Admin');

INSERT INTO Schedule (tutor_id, day, time)
VALUES (6, 'Tuesday', '11:00-12:00pm');

Insert into Tutor (user_id,qualification ,experience ,location ,radius,status)values
(9, 'MBBS',3,'null',20,'Active');

Delete from Schedule where schedule_id>=1325

Update Request set Status ='Accepted' where tutor_id=2
Update Request set Status ='Complete' where tutor_id=2
Update Request set Status ='Pending' where request_id>=2016



Alter table Request Add Time Varchar(50)
Update Schedule set time ='' where tutor_id=2

INSERT INTO Schedule (tutor_id, day, time)
VALUES (2, 'Monday', '10:00-11:00am');
INSERT INTO Schedule (tutor_id, day, time)
VALUES (3, 'Monday', '10:00-11:00am');
INSERT INTO Schedule (tutor_id, day, time)
VALUES (8, 'Tuesday', '11:00-12:00pm');



insert into Tutor_Course(tutor_id, course_id, grade)Values (6,1,'A');

Update Request set Time ='12:00-1:00pm' where request_id =7
-- Record 1: Student 'Syed Mesam Abbas' (ID 5) requests 'Usaid Ur Rehman' (ID 2)
INSERT INTO Request (student_id, tutor_id, course_id)
VALUES (12, 1, 1);

-- Record 2: Student 'Maryam bibi' (ID 7) requests 'Faizan shahid' (ID 6)
INSERT INTO Request (student_id, tutor_id, course_id)
VALUES (2, 2, 1);

-- Record 3: Student 'Manna Rana' (ID 8) requests 'Tutor' (ID 9)
INSERT INTO Request (student_id, tutor_id, course_id)
VALUES (3, 3, 2);


INSERT INTO Course (course_title)
VALUES 
('Introduction to Computer Science'),
('Calculus I'),
('Data Structures and Algorithms'),
('Database Management Systems'),
('Web Development');


Update Student set Latitude=33.6844 where student_id=2
Update Student set Longitude=73.0479 where student_id=2

Delete Request where request_id=4
