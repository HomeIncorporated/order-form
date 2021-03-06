import manifest from './manifest.json';
import { baseUrl } from '../../../../config';
import { getSectionErrorContext } from '../../getSectionErrorContext';

const generateSupplierOptions = ({ suppliers, selectedSupplier }) => (
  suppliers.map(supplier => ({
    value: supplier.supplierId,
    text: supplier.name,
    checked: supplier.supplierId === selectedSupplier ? true : undefined,
  }))
);

const generateQuestionsContext = ({ suppliers, selectedSupplier }) => (
  manifest.questions.map(question => ({
    ...question,
    options: generateSupplierOptions({ suppliers, selectedSupplier }),
  }))
);

export const getContext = ({ orderId, suppliers, selectedSupplier }) => ({
  ...manifest,
  questions: suppliers && generateQuestionsContext({ suppliers, selectedSupplier }),
  backLinkHref: `${baseUrl}/organisation/${orderId}/supplier/search`,
});

export const getErrorContext = (params) => {
  const updatedManifest = getContext({ orderId: params.orderId, suppliers: params.suppliers });

  return {
    ...getSectionErrorContext({ ...params, manifest: updatedManifest }),
  };
};
