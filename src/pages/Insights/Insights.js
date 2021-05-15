import React from 'react';
import { Suspense } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { jobs as JobsData } from '../../data/jobs';
import './Insights.css';
import Loading from '../../components/Loading/Loading';
const JobCard = React.lazy(() => import('../../components/Insights/JobCard'));

// Api result based on cursor-pagination from Facebook: https://developers.facebook.com/docs/graph-api/using-graph-api/#paging
/*
{
	data: [ ...jobs... ],
	paging: {
		cursors: {
			after: someStringValue,
			before: someStringValue
		},
		previous: https://base_url/api_endpoint/jobs?limit={limit}&before={beforeCursor}&search={search}
		next: https://base_url/api_endpoint/jobs?limit={limit}&after={afterCursor}&search={search}
	}
}
We don't really need previous since we are lazy loading forward only
Notes: paging must stop when there is no more 'next'
*/
const fetchJobs = (direction, cursor, limit, searchValue) => {
	return new Promise((resolve) =>
		setTimeout(() => {
			let data =
				searchValue && searchValue !== ''
					? [...JobsData]
							.sort()
							.filter(
								(job) =>
									job.company.name.toUpperCase().includes(searchValue) ||
									job.title.toUpperCase().includes(searchValue)
							)
							.filter((job) =>
								direction === 'before'
									? job.company.name < cursor
									: job.company.name > cursor
							)
							.filter((job) => job.company.name > cursor)
					: [...JobsData].sort();
			let afterCursor =
				data.length > limit ? data[limit - 1].company.name : null;
			let beforeCursor =
				!!cursor && data.length > 1 ? data[0].company.name : null;
			let response = {
				data: data.slice(0, limit),
				paging: {
					cursors: {
						after: afterCursor,
						before: beforeCursor,
					},
					previous: 'previous_cursor_api_url',
					next: 'next_cursor_api_url',
					totalLength: data.length,
				},
			};
			resolve(response);
		}, 3500)
	);
};
const Insights = () => {
	const jobsReducer = (state, action) => {
		console.log(`Reducing jobs ${action.type}`);
		switch (action.type) {
			case 'APPEND_JOBS':
				return { ...state, jobs: state.jobs.concat(action.jobs) };
			case 'FETCHING_JOBS':
				return { ...state, fetching: action.fetching };
			default:
				return { ...state };
		}
	};
	const [jobsData, jobsDispatch] = React.useReducer(jobsReducer, {
		jobs: [],
		cursor: '',
		fetching: false,
		totalLength: -1,
	});
	const cursorReducer = (state, action) => {
		console.log(`Reducing cursor ${action.type}`);
		switch (action.type) {
			case 'TOGGLE_LOAD':
				return { ...state, shouldLoadNext: action.shouldLoadNext };
			case 'SET_CURSOR':
				return {
					...state,
					next: action.next,
				};
			default:
				return { ...state };
		}
	};
	const [cursor, cursorDispatch] = React.useReducer(cursorReducer, {
		next: '',
		shouldLoadNext: false,
	});

	React.useEffect(() => {
		if (cursor.shouldLoadNext && !jobsData.fetching) {
			console.log(`Fetching after ${cursor.next}`);
			jobsDispatch({ type: 'FETCHING_JOBS', fetching: true });
			cursorDispatch({ type: 'TOGGLE_LOAD', shouldLoadNext: false });
			fetchJobs('next', cursor.next, 10, '')
				.then((response) => {
					jobsDispatch({
						type: 'APPEND_JOBS',
						jobs: response.data,
					});
					cursorDispatch({
						type: 'SET_CURSOR',
						next: response.paging.cursors.after,
					});
				})
				.catch((error) => {
					return error;
				})
				.finally(() => {
					jobsDispatch({ type: 'FETCHING_JOBS', fetching: false });
				});
		}
	}, [jobsData.fetching, cursor]);

	let lazyLoadBoundaryRef = React.useRef(null);
	const scrollObserver = React.useCallback(
		(node) => {
			new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.intersectionRatio > 0) {
						cursorDispatch({ type: 'TOGGLE_LOAD', shouldLoadNext: true });
					}
				});
			}).observe(node);
		},
		[cursorDispatch]
	);

	React.useEffect(() => {
		if (lazyLoadBoundaryRef.current) {
			scrollObserver(lazyLoadBoundaryRef.current);
		}
	}, [scrollObserver, lazyLoadBoundaryRef]);

	/** Need some state to fetch and populate a list of jobs */
	return (
		<Container fluid className='contained hero container-fluid'>
			<h1 className='title'>Cougar Insights</h1>
			<Container className='secondary'>
				<div className='search-content'>
					<div className='search'>
						<div className='search-input'>
							<input placeholder={'Company name, position'} />
						</div>
						<h6>{jobsData.jobs.length} jobs found</h6>
					</div>
				</div>
				<Container className='job-content'>
					<Suspense fallback={'Loading...'}>
						<Row>
							{jobsData.jobs.map((job, idx) => (
								<Col key={idx} xs={12} md={6} lg={4}>
									<JobCard key={idx} job={job} />
								</Col>
							))}
						</Row>
					</Suspense>
					<Row className='insights-loader'>
						{jobsData.fetching && <Loading />}
					</Row>
					<div id='page-bottom-boundary' ref={lazyLoadBoundaryRef}></div>
				</Container>
			</Container>
		</Container>
	);
};
export default Insights;
