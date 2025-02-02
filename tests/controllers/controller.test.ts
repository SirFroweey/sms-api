import { Request } from 'express';
import httpMocks from 'node-mocks-http';

import { getSafeQueryNumberArgument } from '../../controllers';

describe('test controller utility helper functions', () => { 
  it('should safely retrieve defaultValue since request will not include referenced property', () => {
    const request: Request = httpMocks.createRequest({
      method: 'POST',
      url: '/api/messages',
      query: {}
    });
    const value = getSafeQueryNumberArgument(request, 'someRequestParameter', 123);
    expect(value).toBe(123);
  });

  it('should safely retrieve query parameter since request will contain referenced property', () => {
    const request: Request = httpMocks.createRequest({
      method: 'POST',
      url: '/api/messages',
      query: {
        someRequestParameter: 456
      }
    });
    const value = getSafeQueryNumberArgument(request, 'someRequestParameter', 123);
    expect(value).toBe(456);
  });
});