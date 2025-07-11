
import React from 'react';
import styles from './Footer.module.css';
import { Instagram, Twitter, LinkedIn, YouTube, Facebook } from '@mui/icons-material';

const Footer = () => (
  <footer className={styles.footer}>
    <p>All rights reserved©</p>
    <p>supportmail@ietdavv.edu.in</p>
    <p>Managed by Placement CELL IET</p>
    <div className={styles.socialIcons}>
      <Instagram />
      <Twitter />
      <LinkedIn />
      <YouTube />
      <Facebook />
    </div>
  </footer>
);

export default Footer;
