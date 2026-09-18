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
    teaching_mode VARCHAR(20) NULL,

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
    fee_responsibility VARCHAR(20) NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Course (
    course_id INT PRIMARY KEY IDENTITY(1,1),
    course_title VARCHAR(100),
    admin_set_min_hourly_rate DECIMAL(10,2),
    admin_set_max_hourly_rate DECIMAL(10,2)
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
    institute VARCHAR(150) NULL,

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
    request_group_id INT NULL,
    tutor_sequence INT NULL,
    response_deadline DATETIME NULL,


    FOREIGN KEY(request_group_id) REFERENCES Request_Group(request_group_id),
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
    fee_responsibility VARCHAR(20) NOT NULL DEFAULT 'Parent',

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


CREATE TABLE Request_Group
(
    request_group_id INT PRIMARY KEY IDENTITY(1,1),

    student_id INT NOT NULL,
    course_id INT NOT NULL,

    created_date DATETIME DEFAULT GETDATE(),

    status VARCHAR(30) NOT NULL,
    -- Searching / Accepted / Rejected / Expired / Cancelled

    current_request_id INT NULL,

    FOREIGN KEY(student_id) REFERENCES Student(student_id),
    FOREIGN KEY(course_id) REFERENCES Course(course_id)
);

CREATE TABLE Student_Course_Content
(
    content_id INT PRIMARY KEY IDENTITY(1,1),

    student_id INT NOT NULL,
    course_id INT NOT NULL,

    title VARCHAR(150) NOT NULL,

    file_name VARCHAR(255),
    file_path VARCHAR(500),

    description VARCHAR(500),

    uploaded_date DATETIME DEFAULT GETDATE(),

    FOREIGN KEY(student_id) REFERENCES Student(student_id),
    FOREIGN KEY(course_id) REFERENCES Course(course_id)
);






ALTER TABLE Request
ADD request_group_id INT NULL,
    tutor_sequence INT NULL,
    response_deadline DATETIME NULL;

ALTER TABLE Request
ADD CONSTRAINT FK_Request_RequestGroup
FOREIGN KEY(request_group_id)
REFERENCES Request_Group(request_group_id);



ALTER TABLE Tutor
ADD teaching_mode VARCHAR(20) NULL;


ALTER TABLE Tutor_Course
ADD institute VARCHAR(150) NULL;


ALTER TABLE Student_Course_Fee
ADD fee_responsibility VARCHAR(20) NOT NULL
    DEFAULT 'Parent';


ALTER TABLE Student
ADD fee_responsibility VARCHAR(20) NULL;


Select * from Users
Select * from Student
Select * from Tutor
Select * from Course
Select * from Student_Course
Select * from Student_Course_Content
Select * from Tutor_Course
Select * from Tutor_Course_Rate
Select * from Student_Course_Fee
Select * from Request
Select * from Payment


Update Payment set tutor_status='Pending' where fee_id=5
Update Payment set tutor_status='Received' where fee_id=5
update Student set fee_responsibility='ByMe' where user_id=7
Update Student set Father_Cnic='6856886422468' where user_id=1031
update Student set fee_responsibility='ByParent' where student_id>=1 and student_id<=30
update Student set fee_responsibility='ByMe' where user_id=1031
update Course set admin_set_max_hourly_rate=3000 where course_title='Computer Science'
update Course set admin_set_min_hourly_rate=1000 where course_title='Computer Science'
update Course set admin_set_max_hourly_rate=3000 where course_id<=11
update Course set admin_set_min_hourly_rate=1000 where course_id<=11
update Tutor_Course set institute='FAST' where grade!='A'
update Tutor_Course set institute='BIIT' where grade='A'
update Request set class_date='2026-09-13' where request_id=3042
update Request set Status='Accepted' where request_id=3042

Delete Student_Course where course_id=2