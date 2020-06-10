import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

const generateRecipientOptions = ({ recipients }) => (
  recipients.map(recipient => ({
    value: recipient.odsCode,
    text: `${recipient.name} (${recipient.odsCode})`,
  }))
);

const generateQuestionsContext = ({ recipients }) => (
  manifest.questions.map(question => ({
    ...question,
    options: generateRecipientOptions({ recipients }),
  }))
);

export const getContext = ({ orderId, solutionName, recipients }) => ({
  ...manifest,
  title: `${manifest.title} ${solutionName}`,
  questions: recipients && generateQuestionsContext({ recipients }),
  backLinkHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select-solution/select-price`,
});
