import { getData, putData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

export const getServiceRecipientsContext = async ({
  orderId, orgId, accessToken, selectStatus,
}) => {
  let selectedData;

  const serviceRecipientEndpoint = getEndpoint({ api: 'oapi', endpointLocator: 'getServiceRecipients', options: { orgId } });
  const serviceRecipientsData = await getData({
    endpoint: serviceRecipientEndpoint,
    accessToken,
    logger,
  });
  logger.info(`Service recipients for organisation with id: ${orgId} found in OAPI.`);

  try {
    const selectedServiceRecipientsEndpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getSelectedServiceRecipients', options: { orderId } });
    selectedData = await getData({
      endpoint: selectedServiceRecipientsEndpoint,
      accessToken,
      logger,
    });
    logger.info(`${selectedData.serviceRecipients ? selectedData.serviceRecipients : 'No'} selected service recipients found in ORDAPI.`);
  } catch (err) {
    logger.error(`Error getting service recipients data from ORDAPI for org id: ${orgId}. ${JSON.stringify(err)}`);
    throw new Error();
  }

  return getContext({
    orderId,
    serviceRecipientsData,
    selectedRecipientIdsData: selectedData ? selectedData.serviceRecipients : [],
    selectStatus,
  });
};

const formatPutData = data => Object.entries(data).filter(item => item[0] !== '_csrf')
  .map(([odsCode, name]) => ({ name, odsCode }));

export const putServiceRecipients = async ({ accessToken, data, orderId }) => {
  const endpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'putServiceRecipients', options: { orderId } });
  const body = { serviceRecipients: formatPutData(data) };
  await putData({
    endpoint,
    body,
    accessToken,
    logger,
  });
  logger.info(`Service recipients updated - order id: ${orderId}, ${JSON.stringify(body)}`);
  return { success: true };
};
