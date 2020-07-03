export const getDateErrors = (data) => {
  const errorsMap = {
    PlannedDeliveryDateRequired: {
      field: 'PlannedDeliveryDate',
      part: ['day', 'month', 'year'],
      id: 'PlannedDeliveryDateRequired',
    },
    PlannedDeliveryDateDayRequired: {
      field: 'PlannedDeliveryDate',
      part: ['day'],
      id: 'PlannedDeliveryDateDayRequired',
    },
    PlannedDeliveryDateMonthRequired: {
      field: 'PlannedDeliveryDate',
      part: ['month'],
      id: 'PlannedDeliveryDateMonthRequired',
    },
    PlannedDeliveryDateYearRequired: {
      field: 'PlannedDeliveryDate',
      part: ['year'],
      id: 'PlannedDeliveryDateYearRequired',
    },
    PlannedDeliveryDateNotReal: {
      field: 'PlannedDeliveryDate',
      part: ['day', 'month'],
      id: 'PlannedDeliveryDateNotReal',
    },
    PlannedDeliveryDateYearLength: {
      field: 'PlannedDeliveryDate',
      part: ['year'],
      id: 'PlannedDeliveryDateYearLength',
    },
  };
  const day = data['plannedDeliveryDate-day'];
  const month = data['plannedDeliveryDate-month'];
  const year = data['plannedDeliveryDate-year'];

  if (!day && !month && !year) return errorsMap.PlannedDeliveryDateRequired;
  if (!day) return errorsMap.PlannedDeliveryDateDayRequired;
  if (!month) return errorsMap.PlannedDeliveryDateMonthRequired;
  if (!year) return errorsMap.PlannedDeliveryDateYearRequired;
  if (year.length !== 4) return errorsMap.PlannedDeliveryDateYearLength;
  if (+day > 31) return { ...errorsMap.PlannedDeliveryDateNotReal, part: ['day'] };
  if (+month > 12) return { ...errorsMap.PlannedDeliveryDateNotReal, part: ['month'] };
  if (+year < 1000) return { ...errorsMap.PlannedDeliveryDateNotReal, part: ['year'] };

  const date = new Date(+year, +month - 1, +day);
  if (date.getFullYear() !== +year || date.getMonth() + 1 !== +month) {
    return errorsMap.PlannedDeliveryDateNotReal;
  }

  return null;
};
