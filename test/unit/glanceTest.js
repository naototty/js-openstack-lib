/*
 * Copyright (c) 2016 Hewlett Packard Enterprise Development L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See
 * the License for the specific language governing permissions and limitations
 * under the License.
 */

import Glance from '../../src/glance.js';
import * as mockData from './helpers/data/glance';
import fetchMock from 'fetch-mock';

describe('Glance', () => {

  afterEach(fetchMock.restore);

  it('should export a class', () => {
    const glance = new Glance(mockData.config);
    expect(glance).toBeDefined();
  });

  it('should throw an error for an empty config', () => {
    try {
      const glance = new Glance();
      glance.versions();
    } catch (e) {
      expect(e.message).toEqual('An endpoint configuration is required.');
    }
  });

  describe("versions()", () => {
    it("Should return a list of all versions available on this clouds' glance", (done) => {
      const glance = new Glance(mockData.config);

      fetchMock.mock(mockData.root());

      glance.versions()
        .then((versions) => {
          // Quick sanity check.
          expect(versions.length).toBe(6);
          done();
        })
        .catch((error) => done.fail(error));
    });

    it("Should NOT cache its results", (done) => {
      const glance = new Glance(mockData.config);
      const mockOptions = mockData.root();

      fetchMock.mock(mockOptions);

      glance.versions()
        .then(() => {
          // Validate that the mock has only been invoked once
          expect(fetchMock.calls(mockOptions.name).length).toEqual(1);
          return glance.versions();
        })
        .then(() => {
          expect(fetchMock.calls(mockOptions.name).length).toEqual(2);
          done();
        })
        .catch((error) => done.fail(error));
    });
  });

  describe("version()", () => {

    it("Should return a supported version of the glance API.", (done) => {
      const glance = new Glance(mockData.config);

      fetchMock.mock(mockData.root());

      glance.version()
        .then((version) => {
          expect(version.id).toEqual('v2.3');
          done();
        })
        .catch((error) => done.fail(error));
    });

    it("Should throw an exception if no supported version is found.", (done) => {
      const glance = new Glance(mockData.config);

      // Build an invalid mock object.
      const mockOptions = mockData.root();
      mockOptions.response.versions.shift();

      fetchMock.mock(mockOptions);

      glance.version()
        .then((response) => done.fail(response))
        .catch((error) => {
          expect(error).not.toBeNull();
          done();
        });
    });

    it("Should NOT cache its results", (done) => {
      const glance = new Glance(mockData.config);
      const mockOptions = mockData.root();
      fetchMock.mock(mockOptions);

      glance.version()
        .then(() => {
          // Validate that the mock has only been invoked once
          expect(fetchMock.calls(mockOptions.name).length).toEqual(1);
          return glance.version();
        })
        .then(() => {
          expect(fetchMock.calls(mockOptions.name).length).toEqual(2);
          done();
        })
        .catch((error) => done.fail(error));
    });
  });

  describe("serviceEndpoint()", () => {

    it("Should return a valid endpoint to the glance API.", (done) => {
      const glance = new Glance(mockData.config);

      fetchMock.mock(mockData.root());

      glance.serviceEndpoint()
        .then((endpoint) => {
          expect(endpoint).toEqual('http://192.168.99.99:9292/v2/');
          done();
        })
        .catch((error) => done.fail(error));
    });

    it("Should throw an exception if no endpoint is provided.", (done) => {
      const glance = new Glance(mockData.config);

      // Build an exception payload.
      const mockOptions = mockData.root();
      mockOptions.response.versions[0].links = [];
      fetchMock.mock(mockOptions);

      glance.serviceEndpoint()
        .then((response) => done.fail(response))
        .catch((error) => {
          expect(error).not.toBeNull();
          done();
        });
    });

    it("Should throw an exception if no links array exists.", (done) => {
      const glance = new Glance(mockData.config);

      // Build an exception payload.
      const mockOptions = mockData.root();
      delete mockOptions.response.versions[0].links;
      fetchMock.mock(mockOptions);

      glance.serviceEndpoint()
        .then((response) => done.fail(response))
        .catch((error) => {
          expect(error).not.toBeNull();
          done();
        });
    });

    it("Should cache its results", (done) => {
      const glance = new Glance(mockData.config);
      const mockOptions = mockData.root();
      fetchMock.mock(mockOptions);

      glance.serviceEndpoint()
        .then(() => {
          // Validate that the mock has only been invoked once
          expect(fetchMock.calls(mockOptions.name).length).toEqual(1);
          return glance.serviceEndpoint();
        })
        .then(() => {
          expect(fetchMock.calls(mockOptions.name).length).toEqual(1);
          done();
        })
        .catch((error) => done.fail(error));
    });
  });
});
