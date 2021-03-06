import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { baseUrl, orderApiUrl } from '../../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/catalogue-solutions';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mockAddedOrderItems = [
  {
    orderItemId: 'orderItem1',
    solutionName: 'Solution One',
    serviceRecipient: {
      name: 'Recipient One',
      odsCode: 'recipient-1',
    },
  },
  {
    orderItemId: 'orderItem2',
    solutionName: 'Solution One',
    serviceRecipient: {
      name: 'Recipient Two',
      odsCode: 'recipient-2',
    },
  },
];

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-1/sections/catalogue-solutions')
    .reply(200, { orderDescription: 'Some order', orderItems: mockAddedOrderItems });
};

const pageSetup = async () => {
  mocks();
  await setCookies();
};

fixture('Catalogue-solution page - without saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('should render the added catalogue solutions table with the column headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addedOrderItems = Selector('[data-test-id="added-orderItems"]');
  const addedOrderItemsColumnHeading1 = addedOrderItems.find('[data-test-id="column-heading-0"]');
  const addedOrderItemsColumnHeading2 = addedOrderItems.find('[data-test-id="column-heading-1"]');

  await t
    .expect(addedOrderItems.exists).ok()
    .expect(addedOrderItemsColumnHeading1.exists).ok()
    .expect(await extractInnerText(addedOrderItemsColumnHeading1)).eql('Catalogue Solution')

    .expect(addedOrderItemsColumnHeading2.exists).ok()
    .expect(await extractInnerText(addedOrderItemsColumnHeading2)).eql('Service Recipient (ODS code)');
});

test('should render the added catalogue solutions items in the table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addedOrderItems = Selector('[data-test-id="added-orderItems"]');
  const row1 = addedOrderItems.find('[data-test-id="table-row-0"]');
  const row1SolutionName = row1.find('a[data-test-id="orderItem1-solutionName"]');
  const row1ServiceRecipient = row1.find('div[data-test-id="orderItem1-serviceRecipient"]');
  const row2 = addedOrderItems.find('[data-test-id="table-row-1"]');
  const row2SolutionName = row2.find('a[data-test-id="orderItem2-solutionName"]');
  const row2ServiceRecipient = row2.find('div[data-test-id="orderItem2-serviceRecipient"]');

  await t
    .expect(row1.exists).ok()
    .expect(row1SolutionName.exists).ok()
    .expect(await extractInnerText(row1SolutionName)).eql('Solution One')
    .expect(row1SolutionName.getAttribute('href')).eql(`${baseUrl}/organisation/order-1/catalogue-solutions/orderItem1`)
    .expect(row1ServiceRecipient.exists).ok()
    .expect(await extractInnerText(row1ServiceRecipient)).eql('Recipient One (recipient-1)')

    .expect(row2.exists).ok()
    .expect(row2SolutionName.exists).ok()
    .expect(await extractInnerText(row2SolutionName)).eql('Solution One')
    .expect(row2SolutionName.getAttribute('href')).eql(`${baseUrl}/organisation/order-1/catalogue-solutions/orderItem2`)
    .expect(row2ServiceRecipient.exists).ok()
    .expect(await extractInnerText(row2ServiceRecipient)).eql('Recipient Two (recipient-2)');
});
