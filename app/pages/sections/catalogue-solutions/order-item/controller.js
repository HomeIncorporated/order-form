import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { logger } from '../../../../logger';
import { getEndpoint } from '../../../../endpoints';
import { getSolution } from '../select/recipient/controller';

export const getRecipientName = async ({ selectedRecipientId, accessToken }) => {
  const endpoint = getEndpoint({ api: 'oapi', endpointLocator: 'getServiceRecipient', options: { selectedRecipientId } });
  const serviceRecipientData = await getData({ endpoint, accessToken, logger });
  logger.info(`service recipient returned for ${selectedRecipientId}`);

  return serviceRecipientData.name;
};

export const getOrderItemContext = async ({
  orderId,
  selectedSolutionId,
  selectedRecipientId,
  selectedPriceId,
  accessToken,
}) => {
  const solutionName = (await getSolution({ solutionId: selectedSolutionId, accessToken })).name;
  const serviceRecipientName = await getRecipientName({ selectedRecipientId, accessToken });
  const selectedPrice = await get

  return getContext({
    orderId, solutionName, serviceRecipientName, odsCode: selectedRecipientId,
  });
};
