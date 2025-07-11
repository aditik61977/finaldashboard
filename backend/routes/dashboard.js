const express = require('express');
const router = express.Router();
const db = require('../config/database');

console.log('DASHBOARD ROUTES LOADED');

// Simple test endpoint (no database required)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Dashboard API is working!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Get dashboard overview metrics
router.get('/metrics', async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    // Get total students
    const [studentsResult] = await connection.execute(
      'SELECT COUNT(*) as total_students FROM student_master'
    );
    
    // Get total companies
    const [companiesResult] = await connection.execute(
      'SELECT COUNT(*) as total_companies FROM company'
    );
    
    // Get total jobs
    const [jobsResult] = await connection.execute(
      'SELECT COUNT(*) as total_jobs FROM jobs'
    );
    
    // Get average package
    const [avgPackageResult] = await connection.execute(
      'SELECT AVG(salary) as avg_package FROM jobs'
    );
    
    // Get highest package
    const [maxPackageResult] = await connection.execute(
      'SELECT MAX(salary) as max_package FROM jobs'
    );
    
    // Get total applications
    const [applicationsResult] = await connection.execute(
      'SELECT COUNT(*) as total_applications FROM applied_jobs'
    );

    // Get total offers
    const [offersResult] = await connection.execute(
      'SELECT SUM(no_of_openings) as total_offers FROM jobs'
    );

    // Get number of selected students
    const [selectedStudentsResult] = await connection.execute(
      `SELECT COUNT(DISTINCT student_id) as selected_students
       FROM applied_jobs
       WHERE application_status = 'selected'`
    );

    const placement_percentage = studentsResult[0].total_students
      ? (selectedStudentsResult[0].selected_students / studentsResult[0].total_students) * 100
      : 0;
    
    connection.release();
    
    res.json({
      total_students: studentsResult[0].total_students,
      total_companies: companiesResult[0].total_companies,
      total_jobs: jobsResult[0].total_jobs,
      avg_package: Math.round(avgPackageResult[0].avg_package || 0),
      max_package: maxPackageResult[0].max_package || 0,
      total_applications: applicationsResult[0].total_applications,
      total_offers: offersResult[0].total_offers || 0,
      placement_percentage: Math.round(placement_percentage)
    });
    
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

// Get placement trends by year
router.get('/placement-trends', async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    // Get placement data by year
    const [trendsResult] = await connection.execute(`
      SELECT 
        YEAR(aj.date_applied) as year,
        COUNT(*) as total_applications,
        COUNT(CASE WHEN aj.application_status = 'selected' THEN 1 END) as selected_count
      FROM applied_jobs aj
      GROUP BY YEAR(aj.date_applied)
      ORDER BY year DESC
      LIMIT 5
    `);
    
    connection.release();
    
    res.json(trendsResult);
    
  } catch (error) {
    console.error('Error fetching placement trends:', error);
    res.status(500).json({ error: 'Failed to fetch placement trends' });
  }
});

// Get industry-wise placement distribution
router.get('/industry-distribution', async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    const [distributionResult] = await connection.execute(`
      SELECT 
        i.industry_name,
        COUNT(DISTINCT c.id) as company_count,
        COUNT(aj.id) as total_applications,
        COUNT(CASE WHEN aj.application_status = 'selected' THEN 1 END) as selected_count
      FROM industry i
      LEFT JOIN company c ON i.id = c.industry_id
      LEFT JOIN jobs j ON c.id = j.company_id
      LEFT JOIN applied_jobs aj ON j.id = aj.job_id
      GROUP BY i.id, i.industry_name
      ORDER BY company_count DESC
    `);
    
    connection.release();
    
    res.json(distributionResult);
    
  } catch (error) {
    console.error('Error fetching industry distribution:', error);
    res.status(500).json({ error: 'Failed to fetch industry distribution' });
  }
});

// Get package distribution
router.get('/package-distribution', async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    const [packageResult] = await connection.execute(`
      SELECT 
        salary_range,
        COUNT(*) as job_count
      FROM (
        SELECT 
          CASE 
            WHEN salary < 500000 THEN '0-5 LPA'
            WHEN salary < 1000000 THEN '5-10 LPA'
            WHEN salary < 1500000 THEN '10-15 LPA'
            WHEN salary < 2000000 THEN '15-20 LPA'
            WHEN salary < 2500000 THEN '20-25 LPA'
            ELSE '25+ LPA'
          END as salary_range
        FROM jobs
      ) as salary_ranges
      GROUP BY salary_range
      ORDER BY 
        CASE salary_range
          WHEN '0-5 LPA' THEN 1
          WHEN '5-10 LPA' THEN 2
          WHEN '10-15 LPA' THEN 3
          WHEN '15-20 LPA' THEN 4
          WHEN '20-25 LPA' THEN 5
          ELSE 6
        END
    `);
    
    connection.release();
    
    res.json(packageResult);
    
  } catch (error) {
    console.error('Error fetching package distribution:', error);
    res.status(500).json({ error: 'Failed to fetch package distribution' });
  }
});

// Get top recruiting companies
router.get('/companies/top-recruiting', async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [topCompanies] = await connection.execute(`
      SELECT 
        c.company_name,
        COUNT(DISTINCT j.id) as total_jobs,
        AVG(j.salary) as avg_salary,
        MAX(j.salary) as max_salary,
        i.industry_name,
        COUNT(aj.id) as total_applications,
        COUNT(CASE WHEN aj.application_status = 'selected' THEN 1 END) as selected_count
      FROM company c
      LEFT JOIN industry i ON c.industry_id = i.id
      LEFT JOIN jobs j ON c.id = j.company_id
      LEFT JOIN applied_jobs aj ON j.id = aj.job_id
      GROUP BY c.id, c.company_name, i.industry_name
      HAVING total_jobs > 0
      ORDER BY total_jobs DESC, avg_salary DESC
      LIMIT 10
    `);
    connection.release();
    res.json(topCompanies);
  } catch (error) {
    console.error('Error fetching top companies:', error);
    res.status(500).json({ error: 'Failed to fetch top companies' });
  }
});

// POST /students - Add a new student
router.post('/students', async (req, res) => {
  try {
    const {
      name, email, contact, roll_num, urls,
      about_yourself, dob, Is_resume_public, photo_url
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO student_master
      (name, email, contact, roll_num, urls, about_yourself, dob, Is_resume_public, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, contact, roll_num, urls, about_yourself, dob, Is_resume_public, photo_url]
    );

    res.status(201).json({ id: result.insertId, message: 'Student created successfully' });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// GET /students - Test route for browser
router.get('/students', async (req, res) => {
  res.json({ message: 'GET /students works!' });
});

// POST /companies - Add a new company
router.post('/companies', async (req, res) => {
  try {
    const {
      company_name, company_url, about, industry_id, imagelink, location
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO company
      (company_name, company_url, about, industry_id, imagelink, location)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [company_name, company_url, about, industry_id, imagelink, location]
    );

    res.status(201).json({ id: result.insertId, message: 'Company created successfully' });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// POST /jobs - Add a new job
router.post('/jobs', async (req, res) => {
  try {
    const {
      job_type, duration, job_role, salary, jd_url, location, tech_stack, eligibility_id, company_id, application_deadline, posted_date, no_of_openings, academic_year
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO jobs
      (job_type, duration, job_role, salary, jd_url, location, tech_stack, eligibility_id, company_id, application_deadline, posted_date, no_of_openings, academic_year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [job_type, duration, job_role, salary, jd_url, location, tech_stack, eligibility_id, company_id, application_deadline, posted_date, no_of_openings, academic_year]
    );

    res.status(201).json({ id: result.insertId, message: 'Job created successfully' });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// POST /applications - Add a new application
router.post('/applications', async (req, res) => {
    try {
      const {
        student_id, job_id, resume_id, date_applied, application_status, sem, last_updated
      } = req.body;
  
      const [result] = await db.query(
        `INSERT INTO applied_jobs
        (student_id, job_id, resume_id, date_applied, application_status, sem, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [student_id, job_id, resume_id, date_applied, application_status, sem, last_updated]
      );
  
      res.status(201).json({ id: result.insertId, message: 'Application created successfully' });
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({ error: 'Failed to create application' });
    }
  });
  // Job Type Distribution
router.get('/job-type-distribution', async (req, res) => {
    try {
      const [result] = await db.query(`
        SELECT 
          job_type,
          COUNT(*) as job_count,
          AVG(salary) as avg_salary,
          COUNT(aj.id) as total_applications,
          COUNT(CASE WHEN aj.application_status = 'selected' THEN 1 END) as selected_count
        FROM jobs j
        LEFT JOIN applied_jobs aj ON j.id = aj.job_id
        GROUP BY job_type
        ORDER BY job_count DESC
      `);
      res.json(result);
    } catch (error) {
      console.error('Error fetching job type distribution:', error);
      res.status(500).json({ error: 'Failed to fetch job type distribution' });
    }
  });
  
  // Application Status Distribution
  router.get('/application-status-distribution', async (req, res) => {
    try {
      const [result] = await db.query(`
        SELECT 
          application_status,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM applied_jobs), 2) as percentage
        FROM applied_jobs
        GROUP BY application_status
        ORDER BY count DESC
      `);
      res.json(result);
    } catch (error) {
      console.error('Error fetching application status distribution:', error);
      res.status(500).json({ error: 'Failed to fetch application status distribution' });
    }
  });

// GET /branch-comparison - Branch-wise placement comparison
router.get('/branch-comparison', async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT 
        sem.eligibility_param_value as branch_code,
        CASE 
          WHEN sem.eligibility_param_value = 1 THEN 'Computer Science'
          WHEN sem.eligibility_param_value = 2 THEN 'Information Technology'
          WHEN sem.eligibility_param_value = 3 THEN 'Electronics & Communication'
          WHEN sem.eligibility_param_value = 4 THEN 'Mechanical Engineering'
          WHEN sem.eligibility_param_value = 5 THEN 'Civil Engineering'
          WHEN sem.eligibility_param_value = 6 THEN 'Electrical Engineering'
          ELSE CONCAT('Branch ', sem.eligibility_param_value)
        END as branch_name,
        COUNT(DISTINCT sm.id) as total_students,
        COUNT(DISTINCT aj.student_id) as students_applied,
        COUNT(CASE WHEN aj.application_status = 'selected' THEN 1 END) as students_placed,
        ROUND(COUNT(CASE WHEN aj.application_status = 'selected' THEN 1 END) * 100.0 / COUNT(DISTINCT sm.id), 2) as placement_percentage,
        AVG(j.salary) as avg_package,
        MAX(j.salary) as max_package
      FROM student_master sm
      LEFT JOIN student_eligibility_mapping sem ON sm.id = sem.student_id AND sem.eligibility_param_name = 'branch'
      LEFT JOIN applied_jobs aj ON sm.id = aj.student_id
      LEFT JOIN jobs j ON aj.job_id = j.id
      WHERE sem.eligibility_param_value IS NOT NULL
      GROUP BY sem.eligibility_param_value
      ORDER BY placement_percentage DESC, total_students DESC
    `);
    res.json(result);
  } catch (error) {
    console.error('Error fetching branch comparison:', error);
    res.status(500).json({ error: 'Failed to fetch branch comparison' });
  }
});

module.exports = router; 