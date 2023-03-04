import { Col, Row } from 'react-bootstrap';

const LicensePlate = ({ text }) => {
  return (
    <Row className='justify-content-center'>
      <Col md={5}>
        <Row style={{ backgroundColor: '#012E99', color: '#FFF' }}>
          <Col>
            <p className='text-center my-auto'>License Plate</p>
          </Col>
        </Row>
        <Row
          style={{
            backgroundColor: '#BABFBC',
            color: '#000',
            fontFamily: 'roboto',
            fontSize: '20px',
          }}
        >
          <Col>
            <p className='text-center my-auto'>{text}</p>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default LicensePlate;
