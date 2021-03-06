import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { formatDate } from '../../helpers/dateFormatter';
import { formatPrice } from '../../helpers/priceFormatter';
import { logger } from '../../logger';

const generateCallOffPartyDetails = ({ orderPartyData }) => ({
  multiLine: {
    data: [
      `${orderPartyData.primaryContact.firstName} ${orderPartyData.primaryContact.lastName}`,
      orderPartyData.name,
      orderPartyData.odsCode,
      '',
      orderPartyData.address.line1,
      orderPartyData.address.line2,
      orderPartyData.address.line3,
      orderPartyData.address.line4,
      orderPartyData.address.line5,
      orderPartyData.address.town,
      orderPartyData.address.county,
      orderPartyData.address.postcode,
      orderPartyData.address.country,
    ].filter(lineItem => lineItem !== undefined),
    dataTestId: 'call-off-party',
  },
});

const generateSupplierDetails = ({ supplierData }) => ({
  multiLine: {
    data: [
      `${supplierData.primaryContact.firstName} ${supplierData.primaryContact.lastName}`,
      supplierData.name,
      '',
      supplierData.address.line1,
      supplierData.address.line2,
      supplierData.address.line3,
      supplierData.address.line4,
      supplierData.address.line5,
      supplierData.address.town,
      supplierData.address.county,
      supplierData.address.postcode,
      supplierData.address.country,
    ].filter(lineItem => lineItem !== undefined),
    dataTestId: 'supplier',
  },
});

const generateCallOffAndSupplierDetailsTable = ({
  callOffAndSupplierTable, orderPartyData, supplierData,
}) => {
  const columns = [];
  if (orderPartyData) columns.push(generateCallOffPartyDetails({ orderPartyData }));
  if (supplierData) columns.push(generateSupplierDetails({ supplierData }));

  return ({
    ...callOffAndSupplierTable,
    items: [columns],
  });
};

const generateRowForTotal = ({
  labelCellData,
  labelCellClasses,
  labelCellTestId,
  labelHideSeperator,
  valueCellData,
  valueCellClasses,
  valueCellTestId,
  valueHideSeperator,
  showValueColumn = true,
}) => {
  const columns = [];

  columns.push({
    data: labelCellData,
    classes: labelCellClasses,
    dataTestId: labelCellTestId,
    hideSeperator: labelHideSeperator,
  });

  if (showValueColumn) {
    columns.push({
      data: valueCellData !== undefined
        ? formatPrice(valueCellData)
        : '0.00',
      classes: valueCellClasses,
      dataTestId: valueCellTestId,
      hideSeperator: valueHideSeperator,
    });
  } else {
    columns.push({
      data: '',
      dataTestId: 'blank-cell',
      hideSeperator: valueHideSeperator,
    });
  }

  return columns;
};

const generateOneOffCostTotalsTable = ({
  oneOffCostTotalsTable, oneOffCostTotalValue,
}) => {
  const items = [];
  items.push(
    generateRowForTotal({
      labelCellData: oneOffCostTotalsTable.cellInfo.totalOneOffCostLabel.data,
      labelCellClasses: oneOffCostTotalsTable.cellInfo.totalOneOffCostLabel.classes,
      labelCellTestId: 'total-cost-label',
      labelHideSeperator: oneOffCostTotalsTable.cellInfo.totalOneOffCostLabel.hideSeperator,
      valueCellData: oneOffCostTotalValue,
      valueCellClasses: oneOffCostTotalsTable.cellInfo.totalOneOffCostValue.classes,
      valueCellTestId: 'total-cost-value',
      valueHideSeperator: oneOffCostTotalsTable.cellInfo.totalOneOffCostValue.hideSeperator,
    }),
  );

  return ({
    ...oneOffCostTotalsTable,
    items,
  });
};

const generateRecurringCostTotalsTable = ({
  recurringCostTotalsTable, recurringYearCost, recurringMonthCost, ownershipCost,
}) => {
  const items = [];
  items.push(
    generateRowForTotal({
      labelCellData: recurringCostTotalsTable.cellInfo.totalOneYearCostLabel.data,
      labelCellClasses: recurringCostTotalsTable.cellInfo.totalOneYearCostLabel.classes,
      labelCellTestId: 'total-year-cost-label',
      labelHideSeperator: recurringCostTotalsTable.cellInfo.totalOneYearCostLabel.hideSeperator,
      valueCellData: recurringYearCost,
      valueCellClasses: recurringCostTotalsTable.cellInfo.totalOneYearCostValue.classes,
      valueCellTestId: 'total-year-cost-value',
      valueHideSeperator: recurringCostTotalsTable.cellInfo.totalOneYearCostValue.hideSeperator,
    }),
  );

  items.push(
    generateRowForTotal({
      labelCellData: recurringCostTotalsTable.cellInfo.totalMonthlyCostLabel.data,
      labelCellClasses: recurringCostTotalsTable.cellInfo.totalMonthlyCostLabel.classes,
      labelCellTestId: 'total-monthly-cost-label',
      labelHideSeperator: recurringCostTotalsTable.cellInfo.totalMonthlyCostLabel.hideSeperator,
      valueCellData: recurringMonthCost,
      valueCellClasses: recurringCostTotalsTable.cellInfo.totalMonthlyCostValue.classes,
      valueCellTestId: 'total-monthly-cost-value',
      valueHideSeperator: recurringCostTotalsTable.cellInfo.totalMonthlyCostValue.hideSeperator,
    }),
  );

  items.push(
    generateRowForTotal({
      labelCellData: recurringCostTotalsTable.cellInfo.totalOwnershipCostLabel.data,
      labelCellClasses: recurringCostTotalsTable.cellInfo.totalOwnershipCostLabel.classes,
      labelCellTestId: 'total-ownership-cost-label',
      labelHideSeperator: recurringCostTotalsTable.cellInfo.totalOwnershipCostLabel.hideSeperator,
      valueCellData: ownershipCost,
      valueCellClasses: recurringCostTotalsTable.cellInfo.totalOwnershipCostValue.classes,
      valueCellTestId: 'total-ownership-cost-value',
      valueHideSeperator: recurringCostTotalsTable.cellInfo.totalOwnershipCostValue.hideSeperator,
    }),
  );

  items.push(
    generateRowForTotal({
      labelCellData: recurringCostTotalsTable.cellInfo.totalOwnershipTerms.data,
      labelCellClasses: recurringCostTotalsTable.cellInfo.totalOwnershipTerms.classes,
      labelCellTestId: 'total-ownership-terms',
      labelHideSeperator: recurringCostTotalsTable.cellInfo.totalOwnershipTerms.hideSeperator,
      valueHideSeperator: recurringCostTotalsTable.cellInfo.totalOwnershipTerms.hideSeperator,
      showValueColumn: false,
    }),
  );

  return ({
    ...recurringCostTotalsTable,
    items,
  });
};

const getCurrentDate = () => formatDate(new Date(Date.now()));

const generateRecurringCostDetailsTable = ({
  recurringCostTable, recurringCostItems = [], serviceRecipients = {},
}) => {
  const items = recurringCostItems.map((item) => {
    const columns = [];

    if (!serviceRecipients[item.serviceRecipientsOdsCode]) {
      logger.error(`service recipient ${item.serviceRecipientsOdsCode} not found`);
      throw new Error();
    }

    const serviceRecipient = serviceRecipients[item.serviceRecipientsOdsCode];

    columns.push(({
      classes: manifest.recurringCostTable.cellInfo.recipientName.classes,
      data: `${serviceRecipient.name} (${serviceRecipient.odsCode})`,
      dataTestId: 'recipient-name',
    }));

    columns.push(({
      classes: manifest.recurringCostTable.cellInfo.itemId.classes,
      data: item.itemId,
      dataTestId: 'item-id',
    }));

    columns.push(({
      classes: manifest.recurringCostTable.cellInfo.itemName.classes,
      data: item.catalogueItemName,
      dataTestId: 'item-name',
    }));

    columns.push(({
      classes: manifest.recurringCostTable.cellInfo.priceUnit.classes,
      data: `${formatPrice(item.price)} ${item.itemUnitDescription} ${item.timeUnitDescription}`,
      dataTestId: 'price-unit',
    }));

    columns.push(({
      classes: manifest.recurringCostTable.cellInfo.quantity.classes,
      data: `${item.quantity.toLocaleString()} ${item.quantityPeriodDescription}`,
      dataTestId: 'quantity',
    }));

    columns.push(({
      classes: manifest.recurringCostTable.cellInfo.plannedDeliveryDate.classes,
      data: formatDate(item.deliveryDate),
      dataTestId: 'planned-date',
    }));

    columns.push(({
      classes: manifest.recurringCostTable.cellInfo.itemCost.classes,
      data: formatPrice(item.costPerYear),
      dataTestId: 'item-cost',
    }));

    return columns;
  });

  return ({
    ...recurringCostTable,
    items,
  });
};

export const getContext = ({
  orderId, orderData, recurringCostItems, serviceRecipients,
}) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription: orderData.description,
  dateSummaryCreated: getCurrentDate(),
  callOffAndSupplierTable: generateCallOffAndSupplierDetailsTable({
    callOffAndSupplierTable: manifest.callOffAndSupplierTable,
    orderPartyData: orderData.orderParty,
    supplierData: orderData.supplier,
  }),
  oneOffCostTotalsTable: generateOneOffCostTotalsTable({
    oneOffCostTotalsTable: manifest.oneOffCostTotalsTable,
    oneOffCostTotalValue: orderData.totalOneOffCost,
  }),
  recurringCostTable: generateRecurringCostDetailsTable({
    recurringCostTable: manifest.recurringCostTable,
    recurringCostItems,
    serviceRecipients,
  }),
  recurringCostTotalsTable: generateRecurringCostTotalsTable({
    recurringCostTotalsTable: manifest.recurringCostTotalsTable,
    recurringYearCost: orderData.totalRecurringCostPerYear,
    recurringMonthCost: orderData.totalRecurringCostPerMonth,
    ownershipCost: orderData.totalOwnershipCost,
  }),
  commencementDate: formatDate(orderData.commencementDate),
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});
