import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import VideoGrid from '@site/src/components/VideoGrid/VideoGrid';
import styles from './index.module.css';
import Head from '@docusaurus/Head';

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    const OGMeta = () => (
        <Head>
            <meta name="og:image" content="https://awslabs.github.io/ai-on-eks/img/aioeks-logo-green.png" />
        </Head>
    );
    return (
        <header className={clsx('hero', styles.heroBanner)}>
            {OGMeta()}
            <div className={styles.heroContainer}>
                {/* Main Logo Section */}
                <div className={styles.logoSection}>
                    <img
                        src="img/aioeks-logo-green.png"
                        alt="AI on EKS"
                        className={styles.logoImage}
                    />
                </div>

                {/* Hero Content */}
                <div className={styles.heroContent}>
                    <p className={styles.heroSubtitle}>
                        {siteConfig.tagline}
                    </p>
                    <p className={styles.heroDescription}>
                        The comprehensive set of tools for running AI workloads on Amazon EKS.
                        <br />
                        Build, deploy, and scale your AI infrastructure with confidence.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className={styles.ctaSection}>
                    <Link
                        className={clsx(styles.primaryButton)}
                        to="/docs/blueprints/">
                        <span>Get Started</span>
                        <svg className={styles.buttonIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10.75 8.75L14.25 12.25L10.75 15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19.25 12.25H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </Link>
                    <Link
                        className={clsx(styles.secondaryButton)}
                        to="https://awslabs.github.io/data-on-eks/">
                        Explore Data on EKS
                    </Link>
                </div>

            </div>

            {/* Background Elements */}
            <div className={styles.backgroundElements}>
                <div className={styles.bgCircle1}></div>
                <div className={styles.bgCircle2}></div>
                <div className={styles.bgCircle3}></div>
            </div>
        </header>
    );
}

function AIOnEKSHeader() {
    return (
        <div className={styles.aiOnEKSHeader}>
        </div>
    );
}

export default function Home() {
    const {siteConfig} = useDocusaurusContext();
    return (
        <Layout
            title={`AI on EKS (AIoEKS)`}
            description="Tested AI/ML on Amazon Elastic Kubernetes Service">
            <HomepageHeader />
            <AIOnEKSHeader />
            <main>
                <div className="container">
                    <HomepageFeatures/>
                </div>
            </main>
        </Layout>
    );
}
