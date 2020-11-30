<p align="center"><br><img src="https://avatars3.githubusercontent.com/u/41448329?s=200&v=4" width="128" height="128" /></p>
<h3 align="center">E-goi push</h3>
<p align="center"><strong><code>@E-goi/push-ionic-lib</code></strong></p>
<p align="center">
  E-goi Push Lib for Capacitor apps
</p>

## Installation

#### Basic setup

###### 1. Install the plugin using NPM

```shell
```
<br>

###### 2. Import from @capacitor/core
```ts
import { EgoiPush } from '@egoi/push-ionic';
```

###### 3. Set your publishable key
```ts
EgoiPush.register(apiKey: 'your api here', appId: 'your app id here', os: 'android|ios', twoStepsField: 'the field to set on new/edit register (e.g. id, email) (optional)', twoStepsValue: 'the field value to set on new/edit register (optional)', deepLinkHandler: 'link handler to redirect the user on notification open (optional)');
```