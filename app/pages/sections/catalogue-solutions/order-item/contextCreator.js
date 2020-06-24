import manifest from './manifest.json';
import { baseUrl } from '../../../../config';
import { getSectionErrorContext } from '../../getSectionErrorContext';

export const populateEstimationPeriod = ((selectedPrice) => {
  manifest.questions.estimationPeriod.options.forEach((option, i) => {
    manifest.questions.estimationPeriod.options[i]
      .checked = option.text.toLowerCase() === selectedPrice
        .timeUnit.description.toLowerCase()
        ? true : undefined;
  });
});

export const populateTable = ((selectedPrice) => {
  manifest.addPriceTable.data[0][0].question.data = selectedPrice.price;
  manifest.addPriceTable.data[0][1].data = selectedPrice.itemUnit.description;
});

export const getContext = ({
  orderId, solutionName, serviceRecipientName, odsCode, selectedPrice,
}) => {
  populateEstimationPeriod(selectedPrice);
  populateTable(selectedPrice);

  return ({
    ...manifest,
    title: `${solutionName} ${manifest.title} ${serviceRecipientName} (${odsCode})`,
    deleteButtonHref: '#',
    backLinkHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/recipient`,
  });
};

const addErrorsToTableQuestions = ({ updatedManifest, errors }) => {
  const manifestWithErrors = { ...updatedManifest };
  const foundError = errors.find(error => error.field === updatedManifest.addPriceTable.data[0][0].question.id);
  if (foundError) {
    const errorMessage = updatedManifest.errorMessages[foundError.id];
    manifestWithErrors.addPriceTable.data[0][1].error = { message: errorMessage };
  }
  return manifestWithErrors;
};

const errors = [
  {
    field: 'price-input-id',
    id: 'PriceInputRequired',
  },
];

export const getErrorContext = ({
  params,
}) => {
  const updatedManifest = getContext({
    orderId: params.orderId,
    solutionName: params.solutionName,
    serviceRecipientName: params.serviceRecipientName,
    odsCode: params.odsCode,
    selectedPrice: params.selectedPrice,
  });

  const updatedManifest2 = getSectionErrorContext({ ...params, manifest: updatedManifest });

  return {
    ...addErrorsToTableQuestions({ ...params, manifest: updatedManifest2 }),
  };
};
