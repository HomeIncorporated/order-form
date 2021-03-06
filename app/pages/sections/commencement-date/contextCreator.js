import manifest from './manifest.json';
import { baseUrl } from '../../../config';
import { formatCommencementDate } from '../../../helpers/dateFormatter';

const addDataToManifest = (commencementDate) => {
  if (commencementDate) {
    const [day, month, year] = commencementDate;
    return {
      ...manifest,
      questions: [{
        ...manifest.questions[0],
        data: { day, month, year },
      }],
    };
  }
  return manifest;
};

export const getContext = ({ orderId, data }) => ({
  ...addDataToManifest(formatCommencementDate(data)),
  title: `${manifest.title} ${orderId}`,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});

const addErrorsToManifest = ({ validationErrors, modifiedManifest }) => {
  const errorMessage = manifest.errorMessages[validationErrors[0].id];
  const questionError = { message: errorMessage, fields: validationErrors[0].part || ['day', 'month', 'year'] };
  const manifestWithErrors = { ...modifiedManifest };
  manifestWithErrors.questions[0].error = questionError;
  manifestWithErrors.errors = [{ text: errorMessage, href: '#commencementDate' }];

  return manifestWithErrors;
};

export const getErrorContext = ({ validationErrors, orderId, data }) => {
  const formattedDate = [data['commencementDate-day'], data['commencementDate-month'], data['commencementDate-year']];
  const modifiedManifest = addDataToManifest(formattedDate);
  const manifestWithErrors = addErrorsToManifest({ validationErrors, modifiedManifest });

  return {
    ...manifestWithErrors,
    title: `${manifest.title} ${orderId}`,
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
  };
};
