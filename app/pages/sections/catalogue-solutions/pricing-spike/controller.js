import { getContext } from './contextCreator';

export const getPricingSpikeContext = () => {
  // call BAPI for price data
  // call getContext - add BAPI data to manifests
  return getContext();
};
