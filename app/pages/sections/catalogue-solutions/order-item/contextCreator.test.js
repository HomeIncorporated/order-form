import commonManifest from './commonManifest.json';
import flatOndemandManifest from './flat/ondemand/manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import * as errorContext from '../../getSectionErrorContext';

jest.mock('../../getSectionErrorContext', () => ({
  getSectionErrorContext: jest.fn(),
}));


describe('catalogue-solutions order-item contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({
        commonManifest,
      });
      expect(context.backLinkText).toEqual(commonManifest.backLinkText);
    });

    it('should return the title', () => {
      const solutionName = 'solution-name';
      const serviceRecipientName = 'service-recipient-name';
      const odsCode = 'ods-code';

      const context = getContext({
        commonManifest, solutionName, serviceRecipientName, odsCode,
      });
      expect(context.title).toEqual(`${solutionName} ${commonManifest.title} ${serviceRecipientName} (${odsCode})`);
    });

    it('should return the description', () => {
      const context = getContext({ commonManifest });
      expect(context.description).toEqual(commonManifest.description);
    });

    it('should return the delete button', () => {
      const context = getContext({ commonManifest });
      expect(context.deleteButtonText).toEqual(commonManifest.deleteButtonText);
    });

    it('should return the save button', () => {
      const context = getContext({ commonManifest });
      expect(context.saveButtonText).toEqual(commonManifest.saveButtonText);
    });

    describe('flat - ondemand', () => {
      it('should return the questions', () => {
        const context = getContext({
          commonManifest, selectedPriceManifest: flatOndemandManifest,
        });
        expect(context.questions).toEqual(flatOndemandManifest.questions);
      });

      it('should return the addPriceTable colummInfo', () => {
        const context = getContext({
          commonManifest, selectedPriceManifest: flatOndemandManifest,
        });

        expect(context.addPriceTable.columnInfo)
          .toEqual(flatOndemandManifest.addPriceTable.columnInfo);
      });

      it('should return the addPriceTable with items and the price input and unit of order populated', () => {
        const expectedContext = {
          addPriceTable: {
            ...flatOndemandManifest.addPriceTable,
            items: [
              [
                {
                  ...flatOndemandManifest.addPriceTable.cellInfo.price,
                  question: {
                    ...flatOndemandManifest.addPriceTable.cellInfo.price.question,
                    data: 0.1,
                  },
                },
                {
                  ...flatOndemandManifest.addPriceTable.cellInfo.unitOfOrder,
                  data: 'per consultation',
                },
              ],
            ],
          },
        };

        const selectedPrice = {
          price: 0.1,
          itemUnit: { description: 'per consultation' },
        };

        const context = getContext({
          commonManifest, selectedPriceManifest: flatOndemandManifest, selectedPrice,
        });

        expect(context.addPriceTable).toEqual(expectedContext.addPriceTable);
      });
    });
  });

  describe('getErrorContext', () => {
    const mockValidationErrors = [
      { field: 'quantity', id: 'quantityRequired' },
      { field: 'price', id: 'priceRequired' },
    ];

    const selectedPrice = {
      price: 0.1,
      itemUnit: { description: 'per consultation' },
    };

    const manifestWithErrors = {
      questions:
      [{
        id: 'quantity',
        mainAdvice: 'Quantity',
        rows: 3,
        error: {
          message: 'quantity error',
        },
      }],
      addPriceTable:
      {
        data: [[{
          question: {
            type: 'input',
            id: 'price',
          },
        }]],
      },
      errorMessages:
      {
        quantityRequired: 'Enter a quantity',
        priceRequired: 'Enter a price',
      },
    };

    afterEach(() => {
      errorContext.getSectionErrorContext.mockReset();
    });

    it('should call getSectionErrorContext with correct params', () => {
      errorContext.getSectionErrorContext.mockReturnValue(manifestWithErrors);

      const params = {
        commonManifest,
        selectedPriceManifest: {},
        orderId: 'order-id',
        solutionName: 'solution-name',
        serviceRecipientName: 'recipient-name',
        odsCode: 'ods-code',
        selectedPrice,
        validationErrors: mockValidationErrors,
      };

      getErrorContext(params);
      expect(errorContext.getSectionErrorContext.mock.calls.length).toEqual(1);
    });

    it('should add error message to the table data', async () => {
      errorContext.getSectionErrorContext.mockReturnValue(manifestWithErrors);

      const params = {
        orderId: 'order-id',
        solutionName: 'solution-name',
        serviceRecipientName: 'recipient-name',
        odsCode: 'ods-code',
        selectedPrice,
        validationErrors: mockValidationErrors,
      };

      const returnedErrorContext = await getErrorContext(params);
      expect(returnedErrorContext.addPriceTable.data[0][0].question.error.message).toEqual('Enter a price');
    });
  });
});
