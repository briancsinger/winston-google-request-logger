// Create a mock server to test with and include any dependencies for the
// test suite.
const connect = require('connect'), 
    should = require('should'),
    request = require('supertest'),
    sinon = require('sinon'),
    fakeLogger = { 
        write: () => {}, 
        entry: () => {}
    };

// Helper method to create a fake Connect server with our middleware and
// logger options.
var createServer = function (logger, options) {
    var expApp = connect();

    // Instantiate our logger as middleware.
    expApp.use(require('../lib/google-request-logger').create(logger, options));

    // Use Connect's static middleware so we can make a dummy request.
    expApp.use(connect.static(__dirname));

    return expApp;
};

var sandbox = sinon.sandbox.create();

// And on to the tests!
describe('google-request-logger', function () {
    describe('logger', function () {
        beforeEach(function() {
            sandbox.restore();
        })
        it('should log request with default data', function (done) {

            // Bootstrap our environment
            const entry = sandbox.spy(fakeLogger, 'entry'),
                write = sandbox.spy(fakeLogger, 'write'),
                app = createServer(fakeLogger, {});

            // Make our dummy request.
            request(app)
              .get(__filename.replace(__dirname, ''))
              .end(function() {
                
                    const [{severity, httpRequest}, payload] = entry.args[0];
                    
                    payload.should.be.empty;
                    severity.should.equal(200)
                    httpRequest.should.have.property('latency');
                    httpRequest.should.have.property('remoteIp');
                    httpRequest.should.have.property('requestMethod');
                    httpRequest.should.have.property('referer');
                    httpRequest.should.have.property('requestSize');
                    httpRequest.should.have.property('responseSize');
                    httpRequest.should.have.property('status');
                    httpRequest.should.have.property('requestUrl');
                    httpRequest.should.have.property('userAgent');
                    sinon.assert.calledOnce(entry);
                    sinon.assert.calledOnce(write);
                    done();
                
              });
        });
        it('should log request with chosen log level', function (done) {

            // Bootstrap our environment
            const entry = sandbox.spy(fakeLogger, 'entry'),
                write = sandbox.spy(fakeLogger, 'write'),
                app = createServer(fakeLogger, {level: 100});

            // Make our dummy request.
            request(app)
              .get(__filename.replace(__dirname, ''))
              .end(function() {
                
                    const [{severity, httpRequest}, payload] = entry.args[0];
                    
                    payload.should.be.empty;
                    severity.should.equal(100)
                    httpRequest.should.have.property('latency');
                    httpRequest.should.have.property('remoteIp');
                    httpRequest.should.have.property('requestMethod');
                    httpRequest.should.have.property('referer');
                    httpRequest.should.have.property('requestSize');
                    httpRequest.should.have.property('responseSize');
                    httpRequest.should.have.property('status');
                    httpRequest.should.have.property('requestUrl');
                    httpRequest.should.have.property('userAgent');
                    sinon.assert.calledOnce(entry);
                    sinon.assert.calledOnce(write);
                    done();
                
              });
        });        

    });
});
