-- Industry
CREATE TABLE industry (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  industry_name VARCHAR(255) NOT NULL
);

-- Company
CREATE TABLE company (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(255) NOT NULL,
  company_url VARCHAR(255) NOT NULL,
  about TEXT NOT NULL,
  industry_id BIGINT NOT NULL,
  imagelink VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  FOREIGN KEY (industry_id) REFERENCES industry(id)
);

-- Company HR
CREATE TABLE company_hr (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  FOREIGN KEY (company_id) REFERENCES company(id)
);

-- Student Master
CREATE TABLE student_master (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  contact BIGINT NOT NULL,
  roll_num BIGINT UNIQUE NOT NULL,
  urls VARCHAR(255) NOT NULL,
  about_yourself TEXT NOT NULL,
  dob DATETIME NOT NULL,
  Is_resume_public BOOLEAN NOT NULL DEFAULT TRUE,
  photo_url VARCHAR(255) NOT NULL
);

-- Skillset
CREATE TABLE skillset_master (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL
);

-- user_to_skillset
CREATE TABLE user_to_skillset (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  skill_id BIGINT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES student_master(id),
  FOREIGN KEY (skill_id) REFERENCES skillset_master(id)
);

-- Resume
CREATE TABLE resume (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  resume_url VARCHAR(255) NOT NULL,
  resume_name VARCHAR(255) NOT NULL,
  is_default BOOLEAN NOT NULL,
  FOREIGN KEY (student_id) REFERENCES student_master(id)
);

-- applied_jobs
CREATE TABLE applied_jobs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  job_id BIGINT NOT NULL,
  resume_id BIGINT NOT NULL,
  date_applied DATETIME NOT NULL,
  application_status ENUM('applied', 'under review', 'selected', 'better luck next time') NOT NULL,
  sem BIGINT NOT NULL,
  last_updated DATETIME NOT NULL,
  FOREIGN KEY (student_id) REFERENCES student_master(id),
  FOREIGN KEY (resume_id) REFERENCES resume(id)
);

-- student eligibility mapping
CREATE TABLE student_eligibility_mapping (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  eligibility_param_name ENUM('cgpa', '10th', '12th', 'branch', 'year', 'work experience') NOT NULL,
  eligibility_param_value BIGINT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES student_master(id)
);

-- student_to_profile_url_mapping
CREATE TABLE student_to_profile_url_mapping (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  application_name VARCHAR(255) NOT NULL,
  profile_link VARCHAR(255) NOT NULL,
  student_id BIGINT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES student_master(id)
);

-- Jobs
CREATE TABLE jobs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  job_type ENUM('full time', 'part time', 'intern') NOT NULL,
  duration BIGINT NOT NULL,
  job_role VARCHAR(255) NOT NULL,
  salary BIGINT NOT NULL,
  jd_url VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  tech_stack VARCHAR(255) NOT NULL,
  eligibility_id BIGINT NOT NULL,
  company_id BIGINT NOT NULL,
  application_deadline DATETIME NOT NULL,
  posted_date DATETIME NOT NULL,
  no_of_openings BIGINT NOT NULL,
  academic_year VARCHAR(10) NOT NULL,
  FOREIGN KEY (company_id) REFERENCES company(id)
);

-- job_eligibility_mapping
CREATE TABLE job_eligibility_mapping (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  job_id BIGINT NOT NULL,
  eligibility_param_name ENUM('cgpa', '10th', '12th', 'branch', 'year', 'work experience') NOT NULL,
  eligibility_param_value_min BIGINT NOT NULL,
  eligibility_param_value_max BIGINT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- review
CREATE TABLE review (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  type ENUM("Assessment","Interview","Company expierience","Work expirience","genral"),
  job_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  date_posted TIMESTAMP NOT NULL,
  rating INT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES student_master(id),
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- questions
CREATE TABLE questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  type ENUM("Assessment","Interview","Company expierience","Work expirience","genral"),
  Question_type ENUM("rating","mcq","descrptive",""),
  Question TEXT NOT NULL,
  created_on TIMESTAMP NOT NULL
);

-- response
CREATE TABLE response (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  job_id BIGINT NOT NULL,
  answer TEXT NOT NULL,
  responded_on TIMESTAMP NOT NULL,
  rating TEXT NOT NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (student_id) REFERENCES student_master(id),
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Resume template
CREATE TABLE resume_template (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  link VARCHAR(255) NOT NULL
);

-- placement_operator
CREATE TABLE placement_operator (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  branch VARCHAR(255) NOT NULL,
  year VARCHAR(255) NOT NULL,
  photo VARCHAR(255) UNIQUE,
  enrollment_nn VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

-- minimal students table (for notifications only)
CREATE TABLE students (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255)
);

-- minimal company_hrs table (for notifications only)
CREATE TABLE company_hrs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  company_name VARCHAR(255),
  email VARCHAR(255)
);

-- announcements
CREATE TABLE announcements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  announcement_description TEXT,
  source_id BIGINT,
  source_type VARCHAR(255),
  created_at TIMESTAMP
);

-- events
CREATE TABLE events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  event_location VARCHAR(255) NOT NULL,
  created_by_id BIGINT,
  created_by_type VARCHAR(255),
  created_at TIMESTAMP
);

-- notifications
CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  target_id BIGINT,
  target_type VARCHAR(255),
  reference_id BIGINT,
  notification_type VARCHAR(255),
  notif_short_msg TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
); 