import request from 'supertest';
import { FakeAuthProvider } from 'buying-catalogue-library';
import { App } from './app';
import { routes } from './routes';
import { baseUrl } from './config';
import * as dashboardController from './pages/dashboard/controller';

jest.mock('./logger');

dashboardController.getDashboardContext = jest.fn()
  .mockResolvedValue({});

const mockLogoutMethod = jest.fn().mockImplementation(() => Promise.resolve({}));

const mockAuthorisedJwtPayload = JSON.stringify({
  id: '88421113', name: 'Cool Dude', ordering: 'manage',
});

const mockAuthorisedCookie = `fakeToken=${mockAuthorisedJwtPayload}`;

const setUpFakeApp = () => {
  const authProvider = new FakeAuthProvider(mockLogoutMethod);
  const app = new App(authProvider).createApp();
  app.use('/', routes(authProvider));
  return app;
};

const checkAuthorisedRouteNotLoggedIn = path => (
  request(setUpFakeApp())
    .get(path)
    .expect(302)
    .then((res) => {
      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual('http://identity-server/login');
    }));

describe('routes', () => {
  describe('GET /', () => {
    const path = '/';

    it('should redirect to the login page if the user is not logged in', () => (
      checkAuthorisedRouteNotLoggedIn(path)
    ));

    it('should redirect to /organisation', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(302)
      .then((res) => {
        expect(res.redirect).toEqual(true);
        expect(res.headers.location).toEqual(`${baseUrl}/organisation`);
      }));
  });

  describe('GET /organisation', () => {
    const path = '/organisation';

    it('should redirect to the login page if the user is not logged in', () => (
      checkAuthorisedRouteNotLoggedIn(path)
    ));

    it('should return the correct status and text when the user is authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="dashboard-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
      }));
  });

  describe('GET /organisation/neworder', () => {
    const path = '/organisation/neworder';

    it('should redirect to the login page if the user is not logged in', () => (
      checkAuthorisedRouteNotLoggedIn(path)
    ));

    it('should return the correct status and text when the user is authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="neworder-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
      }));
  });

  describe('GET /organisation/neworder/description', () => {
    const path = '/organisation/neworder/description';

    it('should redirect to the login page if the user is not logged in', () => (
      checkAuthorisedRouteNotLoggedIn(path)
    ));

    it('should return the correct status and text when the user is authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="description-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
      }));
  });

  describe('GET /organisation/some-order-id', () => {
    const path = '/organisation/some-order-id';

    it('should redirect to the login page if the user is not logged in', () => (
      checkAuthorisedRouteNotLoggedIn(path)
    ));

    it('should return the correct status and text when the user is authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text).toEqual('existing order some-order-id page');
      }));
  });

  describe('GET /organisation/some-order-id/description', () => {
    const path = '/organisation/some-order-id/description';

    it('should redirect to the login page if the user is not logged in', () => (
      checkAuthorisedRouteNotLoggedIn(path)
    ));

    it('should return the correct status and text when the user is authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="description-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
      }));
  });

  describe('GET *', () => {
    it('should return error page if url cannot be matched', done => request(setUpFakeApp())
      .get('/aaaa')
      .expect(200)
      .then((res) => {
        expect(res.text.includes('<h1 class="nhsuk-heading-l nhsuk-u-margin-top-5" data-test-id="error-title">Incorrect url /aaaa</h1>')).toEqual(true);
        expect(res.text.includes('<p data-test-id="error-description">Please check it is valid and try again</p>')).toEqual(true);
        done();
      }));
  });
});
