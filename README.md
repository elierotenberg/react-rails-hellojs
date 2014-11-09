React on Rails plugin for adding HelloJS to your project.

See the HelloJS project page for more info.

Usage:

````js
let R = require('react-rails');
let Hello = require('react-rails-hellojs')(R);

let App = R.App.createApp({
  ...
  plugins: {
    'Hello': Hello('memory', 'memory', 'memory', {
      networks: {
        'facebook': 'MY_FACEBOOK_CLIENT_ID',
        'twitter': 'MY_TWITTER_CLIENT_ID',
        ...
      },
      oauthproxy: 'https://my-oauth-proxy-server',
    }),
  }
});
```
