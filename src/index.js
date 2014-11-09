module.exports = (R) => {
  let _ = require('lodash-next');
  return function createPlugin(storeName, dispatcherName, eventEmitterName, params) {
    params = params || {};

    _.dev(() => storeName.should.be.a.String &&
      dispatcherName.should.be.a.String &&
      eventEmitterName.should.be.a.String &&
      params.should.be.an.Object &&
      params.networks.should.be.an.Object &&
      params.oauthproxy.should.be.a.String
    );

    return R.App.createPlugin({
      displayName: 'Hello',
      networks: params.networks,

      update(hello, flux) {
        Object.keys(this.networks).forEach((network) => flux.getStore(storeName).set(`/Hello/${network}/session`, this.getSession(hello, network)));
      },

      getSession(hello, network) {
        if(!hello) {
          return null;
        }
        let session = hello(network).getAuthResponse();
        if(!(session && session.access_token && session.expires > Date.now()/1000)) {
          return null;
        }
        return session;
      },

      installInClient(flux, window) {
        let hello = require('../../bower_components/hello/dist/hello.all');
        let update = () => this.update(hello, flux);
        _.scopeAll(this, [
          'update',
          'getSession',
          'performLogin',
          'performLogout',
        ]);
        hello.init(params.networks, { oauth_proxy: params.oauthproxy });
        hello.on('auth', update);
        flux.getDispatcher(dispatcherName).addActionListener('/Hello/login', this.performLogin(hello, flux));
        flux.getDispatcher(dispatcherName).addActionListener('/Hello/logout', this.performLogout(hello, flux));
        update();
      },

      installInServer(flux, req) {
        this.update(null, flux);
      },

      performLogin(hello, flux) {
        return (params) => new Promise((resolve, reject) => {
          _.dev(() => params.should.be.an.Object);
          let network = params.network || null;
          let options = params.options || {};
          if(network !== null) {
            _.dev(() => network.should.be.a.String &&
              _.contains(this.networks, network).should.be.ok
            );
          }
          _.dev(() => options.should.be.an.Object);
          hello.login(network, options, (err, res) => err ? reject(err) : resolve(res));
        });
      },

      performLogout(hello, flux) {
        return (params) => new Promise((resolve, reject) => {
          _.dev(() => params.should.be.an.Object);
          let network = params.network || null;
          let options = params.options || {};
          if(network !== null) {
            _.dev(() => network.should.be.a.String &&
              _.contains(this.networks, network).should.be.ok
            );
          }
          _.dev(() => options.should.be.an.Object);
          hello.logout(network, options, (err, res) => err ? reject(err) : resolve(res));
        });
      },
    });
  };
};
