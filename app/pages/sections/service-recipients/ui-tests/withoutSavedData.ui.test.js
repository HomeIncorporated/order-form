import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { orderApiUrl, organisationApiUrl } from '../../../../config';

const pageUrl = 'http://localhost:1234/organisation/order-id/service-recipients';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mockOapiData = [{
  name: 'Some service recipient 1',
  odsCode: 'ods1',
}, {
  name: 'Some service recipient 2',
  odsCode: 'ods2',
}];

const mocks = () => {
  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id/service-recipients')
    .reply(200, mockOapiData);
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/service-recipients')
    .reply(200, { serviceRecipients: [] });
};

const pageSetup = async (t, withAuth = false) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
};

fixture('service-recipients page - without saved data')
  .page('http://localhost:1234/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      // eslint-disable-next-line no-console
      console.log(`pending mocks: ${nock.pendingMocks()}`);
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('should render unchecked checkbox for each service recipient', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);
  const checkbox1Input = Selector('[data-test-id="organisation-name-checkbox-ods1"] input');
  const checkbox1Label = Selector('[data-test-id="organisation-name-checkbox-ods1"] label');
  const checkbox2Input = Selector('[data-test-id="organisation-name-checkbox-ods2"] input');
  const checkbox2Label = Selector('[data-test-id="organisation-name-checkbox-ods2"] label');
  await t
    .expect(checkbox1Input.exists).ok()
    .expect(checkbox1Input.getAttribute('name')).eql('ods1-name')
    .expect(checkbox1Input.getAttribute('id')).eql('ods1-id')
    .expect(checkbox1Input.getAttribute('type')).eql('checkbox')
    .expect(checkbox1Input.find(':checked').exists).notOk()
    .expect(checkbox1Label.exists).ok()
    .expect(await extractInnerText(checkbox1Label)).eql(mockOapiData[0].name)
    .expect(checkbox1Label.getAttribute('for')).eql('ods1-id')

    .expect(checkbox2Input.exists).ok()
    .expect(checkbox2Input.getAttribute('name')).eql('ods2-name')
    .expect(checkbox2Input.getAttribute('id')).eql('ods2-id')
    .expect(checkbox2Input.getAttribute('type')).eql('checkbox')
    .expect(checkbox2Input.find(':checked').exists).notOk()
    .expect(checkbox2Label.exists).ok()
    .expect(await extractInnerText(checkbox2Label)).eql(mockOapiData[1].name)
    .expect(checkbox2Label.getAttribute('for')).eql('ods2-id');
});

test('should render ods code for each service recipient', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);
  const odsCode1 = Selector('[data-test-id="ods-code-ods1"]');
  const odsCode2 = Selector('[data-test-id="ods-code-ods2"]');

  await t
    .expect(odsCode1.exists).ok()
    .expect(await extractInnerText(odsCode1)).eql(mockOapiData[0].odsCode)
    .expect(odsCode2.exists).ok()
    .expect(await extractInnerText(odsCode2)).eql(mockOapiData[1].odsCode);
});