import React from 'react';
import { Suspense } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { jobs as JobsData } from '../../data/jobs';
import './Insights.css';
const JobCard = React.lazy(() => import('../../components/Insights/JobCard'));

const ShowJobCards = (jobs) => {
	return jobs.map((job, idx) => (
		<Col key={idx} xs={12} md={6} lg={4}>
			<JobCard key={idx} job={job} />
		</Col>
	));
};

const Insights = () => {
	const [jobs, setJobs] = React.useState(JobsData);

	const updateSearchInput = (event) => {
		let searchValue = event.currentTarget?.value?.toUpperCase() || '';
		setJobs(() =>
			searchValue && searchValue !== ''
				? JobsData.filter(
						(job) =>
							job.company.name.toUpperCase().includes(searchValue) ||
							job.title.toUpperCase().includes(searchValue)
				  )
				: JobsData
		);
	};

	/** Need some state to fetch and populate a list of jobs */
	return (
		<Container fluid className='contained hero container-fluid'>
			<h1 className='title'>Cougar Insights</h1>
			<Container className='secondary'>
				<div className='search-content'>
					<div className='search'>
						<div className='search-input'>
							<input
								onChange={updateSearchInput}
								placeholder={'Company name, position'}
							/>
						</div>
						<h6>{jobs.length} jobs found</h6>
					</div>
				</div>
				<Container className='job-content'>
					<Suspense fallback={'Loading...'}>
						<Row>{ShowJobCards(jobs)}</Row>
					</Suspense>
				</Container>
			</Container>
		</Container>
	);
};
export default Insights;
