const drawRectangles = (imgRef, canvasRef, detectedObjects, label) => {
  // imgref.current is the same as get document.query....
  const cv = window.cv;
  const cvImage = cv.imread(imgRef.current);

  const onlyLabelObject = detectedObjects.filter(
    (detectedObjects) => detectedObjects.name.toLowerCase() === label.toLowerCase());

  if (!onlyLabelObject.length)
    return null;

  onlyLabelObject.forEach((detectedObject) => {
    // it's necessary to normalize the points, so we need to multiply by width and height
    // to transform it to pixels, cols = width, rows = height
    const p1 = new cv.Point(
      detectedObject.boundingPoly.normalizedVertices[0].x * cvImage.cols,
      detectedObject.boundingPoly.normalizedVertices[0].y * cvImage.rows
    );

    const p2 = new cv.Point(
      detectedObject.boundingPoly.normalizedVertices[2].x * cvImage.cols,
      detectedObject.boundingPoly.normalizedVertices[2].y * cvImage.rows
    );

    // rgb, the last one is opacity
    const colorRectangle = [0, 255, 0, 255];

    cv.rectangle(cvImage, p1, p2, colorRectangle, 4);

    cv.imshow('canvasOutput', cvImage);

    // overwriting image
    imgRef.current.src = canvasRef.current.toDataURL();
  });

  return onlyLabelObject;
};

//  takes a data URL representing an image and returns a Blob object that can be used to represent the same image as binary data
const canvastoBlob = (canvasRef) => {
  // Returns the data URI 
  const dataURL = canvasRef.current.toDataURL('image/png');
  // next few lines convert to blob
  // the MIME type and the base64-encoded data
  var arr = dataURL.split(",");
  // extracts the MIME type from the first part of the split array
  // using regular expression to match the portion of the string between the first colon and the first semicolon
  var mime = arr[0].match(/:(.*?);/)[1];
  // decodes the base64-encoded data using the atob() function. This converts the data from a string of ASCII characters to a binary string
  var bstr = atob(arr[1]);
  // length of the binary string 
  var n = bstr.length;
  // create a new Uint8Array object with that length
  // which is used to store the binary data as an array of 8-bit unsigned integers
  var u8arr = new Uint8Array(n);
  // iterates through each character of the binary string and assigns its value to the corresponding element in the Uint8Array
  while(n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  // creates a new Blob object using the Uint8Array and the MIME type extracted from the data URL
  return new Blob([u8arr], {type:mime});
};

// get only the detected license
// only one object must be passed
const getRoiOfDetectedLicense = (detectedObject, canvasRef, detectedCanvasRef) => {
  const cv = window.cv;

  const x1 = Math.round(detectedObject.boundingPoly.normalizedVertices[0].x * canvasRef.current.width);
  const y1 = Math.round(detectedObject.boundingPoly.normalizedVertices[0].y * canvasRef.current.height);
  const x2 = Math.round(detectedObject.boundingPoly.normalizedVertices[2].x * canvasRef.current.width);
  const y2 = Math.round(detectedObject.boundingPoly.normalizedVertices[2].y * canvasRef.current.height);

  // reading the curret image of canvas
  let src = cv.imread(canvasRef.current);
  let dst = new cv.Mat();
  // getting the reactagles
  dst = src.roi(new cv.Rect(x1, y1, x2 - x1, y2 - y1));
  cv.imshow('onlyDetectLicense', dst);
  src.delete();
  dst.delete();

  return canvastoBlob(detectedCanvasRef);
};

export { drawRectangles, getRoiOfDetectedLicense };
