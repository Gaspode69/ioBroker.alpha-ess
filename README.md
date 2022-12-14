![Logo](admin/alpha-ess.png)
# ioBroker.alpha-ess

![Number of Installations (latest)](http://iobroker.live/badges/alpha-ess-installed.svg)
![Number of Installations (stable)](http://iobroker.live/badges/alpha-ess-stable.svg)
[![NPM version](http://img.shields.io/npm/v/iobroker.alpha-ess.svg)](https://www.npmjs.com/package/iobroker.alpha-ess)

[![Downloads](https://img.shields.io/npm/dm/iobroker.alpha-ess.svg)](https://www.npmjs.com/package/iobroker.alpha-ess)
[![Known Vulnerabilities](https://snyk.io/test/github/Gaspode69/ioBroker.alpha-ess/badge.svg)](https://snyk.io/test/github/Gaspode69/ioBroker.alpha-ess)

## alpha-ess adapter for ioBroker

This adapter logs into the web API of [Alpha ESS](https://www.alphaess.com/) and retrieves information for your Alpha ESS equipment.\
Depending on your Alpha ESS product, it is possible to get realtime data and configuration data for your equipment. Which data points are returned by the API depends on your Alpha ESS equipment.

This adapter is based on the great work of [Charles Gillanders](https://github.com/CharlesGillanders/alphaess), who reverse engineered the Alpha ESS Web API. This is an internal API which may be changed at any time by Alpha ESS.

Currently this adapter creates a state with a hopefully self explaining name for each data point, which I was able to identify.\
All other data points are ignored. During adapter start these data points are logged as info message.

Basically, it is possible to change selected configuration settings using the Alpha ESS Web API. This is not implemented yet.

## Settings:
**Username:** The username of your Alpha ESS Account\
**Password:** The password of your Alpha ESS Account\
**Alpha ESS System ID:** The system Identifier of your Alpha ESS equipment\
**Interval to read realtime data:** Unit: seconds.\
**Interval to read energy data:** Unit: seconds.\
**Interval to read settings data:** Unit: seconds.

It is possible to use a demo account provided by Alpha ESS. The credentials (user name, system id) are set as default values within the adapter.
The password is stored encrypted and must therefore be entered manually: demo

## Disclaimer
**All product and company names or logos are trademarks??? or registered?? trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them or any associated subsidiaries! This personal project is maintained in spare time and has no business goal.**

## Changelog
### 0.0.6-beta.5 (2023-01-07)
* (Gaspode) Slow down requests in case of permanent errors

### 0.0.6-beta.4 (2023-01-03)
* (Gaspode) Changed adapter type from metering to energy

### 0.0.6-beta.3 (2023-01-02)
* (Gaspode) Correction for NPM

### 0.0.6-beta.2 (2023-01-02)
* (Gaspode) Enable NPM

### 0.0.5
* (Gaspode) Use meaningful state names
* (Gaspode) Use suitable state roles
* (Gaspode) Added new state for Alpha ESS settings parameter 'upsReserve'

### 0.0.4
* (Gaspode) use axios to perform Alpha ESS API calls instead of deprecated request
* (Gaspode) New option "Update unchanged states" added

### 0.0.3
* (Gaspode) refactored API calls, added daily energy values

### 0.0.2
* (Gaspode) corrected api call for realtime data

### 0.0.1
* (Gaspode) initial release

## License
MIT License

Copyright (c) 2023 Gaspode <gaspode69@online.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.