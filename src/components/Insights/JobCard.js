import React from 'react';
import { Card } from 'react-bootstrap';

const JobCard = ({ job }) => {
	const { company, title, description } = job;

	return (
		<Card className='job-card'>
			<Card.Body>
				<Card.Title>
					<div>{company.name}</div>
				</Card.Title>
				<Card.Subtitle className='mb-2 text-muted'>{title}</Card.Subtitle>
				<Card.Text>{description}</Card.Text>
				<Card.Link href='#'></Card.Link>
			</Card.Body>
		</Card>
	);
};

export default JobCard;
