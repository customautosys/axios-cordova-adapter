# axios-cordova-adapter

An axios adapter using cordova-plugin-advanced-http

## Copyright Notice

&copy; 2023 Wilson Foo Yu Kang. All rights reserved except as otherwise expressly provided in writing.

Licensed by Wilson Foo Yu Kang to the sole licensee Custom Automated Systems &reg; Pte Ltd on private and confidential terms which may be revoked with express written notice at any time at the sole and absolute discretion of Wilson Foo Yu Kang. By using and continuing to use this package, all parties agree that they are sub-licensing this package, including where this is pursuant to the LICENSE file containing herein, from Custom Automated Systems &reg; Pte Ltd and are not contracting directly with Wilson Foo Yu Kang, save that Wilson Foo Yu Kang shall be availed of all protections at law including all limitations of liability. Contact sales@customautosys.com for custom licensing terms.

Removal of this Copyright Notice is prohibited.

## Installation

```bash
npm i -D axios-cordova-adapter
npm i -S axios-cordova-adapter
```

## Importing

```typescript
import axiosCordovaAdapter from 'axios-cordova-adapter';
```

## Functions

```typescript
axiosCordovaAdapter(config:InternalAxiosRequestConfig):AxiosPromise
```

The axios cordova adapter function to pass into the axios call.

## Usage

```typescript
import axiosCordovaAdapter from 'axios-cordova-adapter';

axios.create({
	...
	adapter:axiosCordovaAdapter
	...
});

axios.request({
	...
	adapter:axiosCordovaAdapter
	...
});
```