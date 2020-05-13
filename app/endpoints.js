import { oidcBaseUri, orderApiUrl } from './config';

const endpoints = {
  getIdentityApiHealth: () => `${oidcBaseUri}/health/ready`,
  getOrders: options => `${orderApiUrl}/api/v1/organisation/${options.orgId}/orders`,
  postDescription: () => `${orderApiUrl}/api/v1/orders`,
  putDescription: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/description`,
  getDescription: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/description`,
};

export const getEndpoint = ({ endpointLocator, options }) => endpoints[endpointLocator](options);
