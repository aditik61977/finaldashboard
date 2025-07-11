const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Dashboard statistics - Only using existing schema
router.get('/student/reports-analytics/dashboard', async (req, res) => {
  try {
    // 1. Student Statistics (using only existing columns)
    const [studentStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_students,
        COUNT(DISTINCT email) AS unique_emails,
        COUNT(DISTINCT contact) AS unique_contacts
      FROM student_master
    `);

    // 2. Application Statistics (using existing applied_jobs table)
    const [applicationStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_applications,
        COUNT(DISTINCT student_id) AS unique_students_applied,
        COUNT(DISTINCT job_id) AS unique_jobs_applied,
        COUNT(DISTINCT resume_id) AS unique_resumes_used
      FROM applied_jobs
    `);

    // 3. Company Statistics (using existing company table)
    const [companyStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_companies,
        COUNT(DISTINCT industry_id) AS total_industries,
        COUNT(DISTINCT location) AS total_locations
      FROM company
    `);

    // 4. Job Statistics (using existing jobs table)
    const [jobStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_jobs,
        COUNT(DISTINCT company_id) AS companies_with_jobs,
        COUNT(DISTINCT job_type) AS job_types_available,
        COUNT(DISTINCT location) AS job_locations,
        SUM(no_of_openings) AS total_openings,
        ROUND(AVG(salary), 2) AS average_salary,
        ROUND(MIN(salary), 2) AS min_salary,
        ROUND(MAX(salary), 2) AS max_salary
      FROM jobs
    `);

    // 5. Resume Statistics (using existing resume table)
    const [resumeStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_resumes,
        COUNT(DISTINCT student_id) AS students_with_resumes,
        COUNT(CASE WHEN is_default = 1 THEN 1 END) AS default_resumes
      FROM resume
    `);

    // 6. Industry Statistics (using existing industry table)
    const [industryStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_industries
      FROM industry
    `);

    // 7. Recent Applications (Last 30 days)
    const [recentApplications] = await db.query(`
      SELECT 
        sm.name AS student_name,
        sm.email AS student_email,
        c.company_name,
        j.job_role,
        j.salary,
        j.job_type,
        aj.date_applied,
        aj.application_status
      FROM applied_jobs aj
      JOIN student_master sm ON aj.student_id = sm.id
      JOIN jobs j ON aj.job_id = j.id
      JOIN company c ON j.company_id = c.id
      WHERE aj.date_applied >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      ORDER BY aj.date_applied DESC
      LIMIT 10
    `);

    // 8. Top Companies by Applications
    const [topCompanies] = await db.query(`
      SELECT 
        c.company_name,
        c.location,
        i.industry_name,
        COUNT(aj.id) AS applications_count,
        COUNT(DISTINCT j.id) AS jobs_posted,
        ROUND(AVG(j.salary), 2) AS average_salary
      FROM company c
      LEFT JOIN industry i ON c.industry_id = i.id
      LEFT JOIN jobs j ON c.id = j.company_id
      LEFT JOIN applied_jobs aj ON j.id = aj.job_id
      GROUP BY c.id, c.company_name, c.location, i.industry_name
      ORDER BY applications_count DESC
      LIMIT 5
    `);

    // 9. Job Type Distribution
    const [jobTypeStats] = await db.query(`
      SELECT 
        job_type,
        COUNT(*) AS job_count,
        SUM(no_of_openings) AS total_openings,
        ROUND(AVG(salary), 2) AS average_salary
      FROM jobs
      GROUP BY job_type
      ORDER BY job_count DESC
    `);

    // 10. Application Status Distribution
    const [applicationStatusStats] = await db.query(`
      SELECT 
        application_status,
        COUNT(*) AS status_count,
        COUNT(DISTINCT student_id) AS unique_students
      FROM applied_jobs
      GROUP BY application_status
      ORDER BY status_count DESC
    `);

    res.json({
      student_statistics: studentStats[0],
      application_statistics: applicationStats[0],
      company_statistics: companyStats[0],
      job_statistics: jobStats[0],
      resume_statistics: resumeStats[0],
      industry_statistics: industryStats[0],
      recent_applications: recentApplications,
      top_companies: topCompanies,
      job_type_distribution: jobTypeStats,
      application_status_distribution: applicationStatusStats,
      last_updated: new Date().toISOString(),
      academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Company analytics
router.get('/student/reports-analytics/company-analytics', async (req, res) => {
  try {
    const [companyAnalytics] = await db.query(`
      SELECT 
        c.company_name,
        c.location,
        c.company_url,
        i.industry_name,
        COUNT(DISTINCT j.id) AS total_jobs_posted,
        COUNT(aj.id) AS total_applications,
        COUNT(DISTINCT aj.student_id) AS unique_applicants,
        ROUND(AVG(j.salary), 2) AS average_salary,
        ROUND(MIN(j.salary), 2) AS min_salary,
        ROUND(MAX(j.salary), 2) AS max_salary,
        SUM(j.no_of_openings) AS total_openings
      FROM company c
      LEFT JOIN industry i ON c.industry_id = i.id
      LEFT JOIN jobs j ON c.id = j.company_id
      LEFT JOIN applied_jobs aj ON j.id = aj.job_id
      GROUP BY c.id, c.company_name, c.location, c.company_url, i.industry_name
      ORDER BY total_applications DESC
    `);

    res.json({
      company_analytics: companyAnalytics
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student analytics
router.get('/student/reports-analytics/student-analytics', async (req, res) => {
  try {
    const [studentAnalytics] = await db.query(`
      SELECT 
        sm.name,
        sm.email,
        sm.contact,
        sm.roll_num,
        COUNT(aj.id) AS total_applications,
        COUNT(DISTINCT aj.job_id) AS unique_jobs_applied,
        COUNT(r.id) AS resume_count,
        COUNT(CASE WHEN r.is_default = 1 THEN 1 END) AS has_default_resume,
        MAX(aj.date_applied) AS last_application_date
      FROM student_master sm
      LEFT JOIN applied_jobs aj ON sm.id = aj.student_id
      LEFT JOIN resume r ON sm.id = r.student_id
      GROUP BY sm.id, sm.name, sm.email, sm.contact, sm.roll_num
      ORDER BY total_applications DESC
    `);

    res.json({
      student_analytics: studentAnalytics
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Job analytics
router.get('/student/reports-analytics/job-analytics', async (req, res) => {
  try {
    const [jobAnalytics] = await db.query(`
      SELECT 
        j.job_role,
        j.job_type,
        j.location,
        j.tech_stack,
        j.salary,
        j.no_of_openings,
        j.academic_year,
        c.company_name,
        i.industry_name,
        COUNT(aj.id) AS applications_received,
        COUNT(DISTINCT aj.student_id) AS unique_applicants,
        j.posted_date,
        j.application_deadline,
        CASE 
          WHEN j.application_deadline >= CURDATE() THEN 'Active'
          ELSE 'Expired'
        END AS status
      FROM jobs j
      LEFT JOIN company c ON j.company_id = c.id
      LEFT JOIN industry i ON c.industry_id = i.id
      LEFT JOIN applied_jobs aj ON j.id = aj.job_id
      GROUP BY j.id, j.job_role, j.job_type, j.location, j.tech_stack, j.salary, j.no_of_openings, j.academic_year, c.company_name, i.industry_name, j.posted_date, j.application_deadline
      ORDER BY applications_received DESC
    `);

    res.json({
      job_analytics: jobAnalytics
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Industry analytics
router.get('/student/reports-analytics/industry-analytics', async (req, res) => {
  try {
    const [industryAnalytics] = await db.query(`
      SELECT 
        i.industry_name,
        COUNT(DISTINCT c.id) AS total_companies,
        COUNT(DISTINCT j.id) AS total_jobs,
        COUNT(aj.id) AS total_applications,
        COUNT(DISTINCT aj.student_id) AS unique_applicants,
        ROUND(AVG(j.salary), 2) AS average_salary,
        SUM(j.no_of_openings) AS total_openings
      FROM industry i
      LEFT JOIN company c ON i.id = c.industry_id
      LEFT JOIN jobs j ON c.id = j.company_id
      LEFT JOIN applied_jobs aj ON j.id = aj.job_id
      GROUP BY i.id, i.industry_name
      ORDER BY total_applications DESC
    `);

    res.json({
      industry_analytics: industryAnalytics
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 