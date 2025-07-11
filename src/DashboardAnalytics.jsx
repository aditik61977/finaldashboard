import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import styles from './DashboardAnalytics.module.css';

const DashboardAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/student/reports-analytics/dashboard')
      .then(response => {
        setAnalytics(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={styles.centeredLoading}>
        <CircularProgress />
      </div>
    );
  }
  

  if (!analytics) return <div className={styles.noData}>No data available.</div>;

  // Chart data for job type distribution
  const jobTypeLabels = analytics.job_type_distribution.map(j => j.job_type);
  const jobTypeCounts = analytics.job_type_distribution.map(j => j.job_count);

  const jobTypeChartOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: true,
        tools: { download: true, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true }
      },
      zoom: { enabled: true },
      background: 'transparent'
    },
    xaxis: {
      categories: jobTypeLabels,
      labels: { style: { fontSize: '13px', fontWeight: 500 } },
      title: { text: 'Job Type', style: { fontWeight: 600 } }
    },
    yaxis: {
      title: { text: 'Number of Jobs', style: { fontWeight: 600 } },
      labels: { style: { fontSize: '13px', fontWeight: 500 } }
    },
    colors: ['#4575EF'],
    plotOptions: { bar: { borderRadius: 8, columnWidth: '60%' } },
    dataLabels: { enabled: true, style: { fontSize: '13px', fontWeight: 600 } },
    grid: { borderColor: '#e0e0e0', strokeDashArray: 4 },
    legend: { show: false }
  };

  const jobTypeChartSeries = [
    { name: 'Jobs', data: jobTypeCounts }
  ];

  return (
    <div className={styles.analyticsContainer}>
      <Typography variant="h4" gutterBottom className={styles.dashboardTitle}>
        Placement Dashboard Analytics
      </Typography>
      <Grid container spacing={3}>
        <Grid gridColumn="span 3">
          <Card>
            <CardContent>
              <Typography variant="h6" className={styles.cardTitle}>Total Students</Typography>
              <Typography variant="h4">{analytics.student_statistics.total_students}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card>
            <CardContent>
              <Typography variant="h6" className={styles.cardTitle}>Total Companies</Typography>
              <Typography variant="h4">{analytics.company_statistics.total_companies}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card>
            <CardContent>
              <Typography variant="h6" className={styles.cardTitle}>Total Jobs</Typography>
              <Typography variant="h4">{analytics.job_statistics.total_jobs}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card>
            <CardContent>
              <Typography variant="h6" className={styles.cardTitle}>Total Applications</Typography>
              <Typography variant="h4">{analytics.application_statistics.total_applications}</Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Chart Section */}
        <Grid gridColumn="span 6">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom className={styles.cardTitle}>Job Type Distribution</Typography>
              <ReactApexChart
                options={jobTypeChartOptions}
                series={jobTypeChartSeries}
                type="bar"
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardAnalytics; 