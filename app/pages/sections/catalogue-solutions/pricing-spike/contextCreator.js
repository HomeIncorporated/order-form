import commonManifest from './manifest.json';
import flatDeclarativeManifest from './flat-declarative/manifest.json';

export const getContext = ({ data }) => {
  let manifest;

  // use BAPI data "price type" and "order type" to select correct manifest
  // (could use switch statement)
  if (data['price-type'] === 'flat' && data['order-type'] === 'Declarative') {
    manifest = flatDeclarativeManifest;
  }
  // map through and add data to table in manifest

  return {
    ...commonManifest,
    ...manifest,
    // other usual bits like title, backlinkhref
  };
};
