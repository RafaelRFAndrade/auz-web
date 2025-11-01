// Create a shared mock instance that can be accessed by tests
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(() => {
        return { eject: jest.fn() };
      }),
      eject: jest.fn()
    },
    response: {
      use: jest.fn(() => {
        return { eject: jest.fn() };
      }),
      eject: jest.fn()
    }
  },
  defaults: {
    headers: {
      common: {}
    }
  }
};

const axios = {
  create: jest.fn(() => mockAxiosInstance),
  default: {
    create: jest.fn(() => mockAxiosInstance)
  }
};

// Export the mock instance so tests can access it
module.exports = axios;
module.exports.default = axios;
module.exports.mockAxiosInstance = mockAxiosInstance;

