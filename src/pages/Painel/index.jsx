import { useRef, useState } from 'react';
import { Col, Row, Form, Button, InputGroup, Image } from 'react-bootstrap';
import CustomCard from '../../components/Card';
import defaultImage from '../../assets/default_image.jpg';
import axios from '../../service/api.js';
import { toast } from 'react-toastify';

import {
  drawRectangles,
  getRoiOfDetectedLicense,
} from '../../utils/drawRectangles.js';
import CustomSpinner from '../../components/Spinner';
import ErrorBoundary from '../../ErrorBoundary';
import LicensePlate from './LicensePlate';

const Painel = () => {
  const imgRef = useRef();
  const canvasRef = useRef();
  const detectedCanvasRef = useRef();

  const [image, setImage] = useState(defaultImage);
  // it'll contain text and confidence
  const [licensePlateOCR, setLicensePlateOCR] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (event.target.image.files[0]) {
      const formData = new FormData();
      formData.append('image', event.target.image.files[0]);
      try {
        const response = await axios.post(
          '/?option=OBJECT_LOCALIZATION',
          formData
        );

        // eslint-disable-next-line no-unused-vars
        const onlyLabelObject = drawRectangles(
          imgRef,
          canvasRef,
          response.data.result,
          'License Plate'
        );

        if (!onlyLabelObject) {
          toast.error(
            "It wasn't possible to identify a license plate on this image. Please provide another one."
          );
        }
        // assim que detectar o objeto, fazer o ocr na placa
        if (onlyLabelObject) {
          await handleOCR(onlyLabelObject);
        }
      } catch (err) {
        if (err.message === 'Network Error') {
          return toast.error(
            'Erro de conexão com o servidor. Tente novamente mais tarde!'
          );
        }
        console.error(err);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOCR = async (detectedLicensePlate) => {
    try {
      // only first plate
      // getttingBlock to pass it to a multipart/form
      const blobImage = getRoiOfDetectedLicense(
        detectedLicensePlate[0],
        canvasRef,
        detectedCanvasRef
      );

      const imageFormData = new FormData();
      imageFormData.append('image', blobImage, 'detected.png');

      const response = await axios.post(
        '/?option=DOCUMENT_TEXT_DETECTION',
        imageFormData
      );

      setLicensePlateOCR({
        license: response.data.result.text,
        confidence: response.data.result.pages[0].confidence,
      });
    } catch (err) {
      if (err.message === 'Network Error') {
        return toast.error(
          'Erro de conexão com o servidor. Tente novamente mais tarde!'
        );
      }
      console.error(err);
      toast.error(err.message);
    }
  };

  return (
    <CustomCard borderColor='#fff'>
      <Row className='justify-content-center'>
        <Col md={5} className='mb-2'>
          <h2 className='text-center'>Check license Plate</h2>
          <Image
            ref={imgRef}
            id='image'
            fluid
            width={500}
            height={430}
            src={image}
            alt='An image uploaded by the user'
            className='d-block mx-auto rounded'
            thumbnail
          />
        </Col>
      </Row>
      <Row className='justify-content-center'>
        <Col md={5} className='mb-2'>
          <ErrorBoundary>
            {licensePlateOCR && (
              <>
                <LicensePlate text={licensePlateOCR.license} />
                <br />
                <p className='text-center'>
                  <b>Probability: </b>
                  {`${(licensePlateOCR.confidence * 100).toFixed(2)}%`}
                </p>{' '}
              </>
            )}
          </ErrorBoundary>
        </Col>
      </Row>
      <Row className='justify-content-center'>
        <canvas
          ref={detectedCanvasRef}
          id='onlyDetectLicense'
          style={{
            display: `${licensePlateOCR ? '' : 'none'}`,
            maxWidth: '200px',
          }}
        />
      </Row>
      <Row className='justify-content-center'>
        <Col md={5} className='mb-2'>
          <Form
            onSubmit={handleSubmit}
            encType='multipart/form-data'
            className='text-center mt-4'
          >
            <InputGroup className='mb-3'>
              <Form.Control
                size='sm'
                type='file'
                name='image'
                accept='.png, .jpg, .jpeg'
                onChange={(e) => {
                  return setImage(URL.createObjectURL(e.target.files[0]));
                }}
              />
              <Button
                className='text-nowrap'
                size='sm'
                variant='dark'
                type='submit'
              >
                Identify
              </Button>
            </InputGroup>
          </Form>
        </Col>
      </Row>
      <Row className='jutify-content-center mt-2'>
        <Col className='align-self-center'>
          <div className='text-center'>
            <CustomSpinner loading={loading} color='#ff6100' />
          </div>
        </Col>
      </Row>
      <canvas
        ref={canvasRef}
        id='canvasOutput'
        style={{ display: 'none' }}
      ></canvas>
    </CustomCard>
  );
};
export default Painel;
