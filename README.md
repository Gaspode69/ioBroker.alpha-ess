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

Currently this adapter creates and updates one state for each data point returned by the Alpha ESS Web API.

Basically, it is possible to change selected configuration settings using the Alpha ESS Web API. This is not implemented yet.

## Settings:
**Username:** The username of your Alpha ESS Account\
**Password:** The password of your Alpha ESS Account\
**Alpha ESS System ID:** The system Identifier of your Alpha ESS equipment\
**Interval to read realtime data:** 0 means disabled. Values smaller than 10 are treated as 10. Unit: seconds.\
**Interval to read settings data:** 0 means disabled. Values smaller than 60 are treated as 60. Unit: seconds.

It is possible to use a demo account provided by Alpha ESS. The credentials (user name, system id) are set as default values within the adapter.
The password is stored encrypted and must therefore be entered manually: demo

## Disclaimer
**All product and company names or logos are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them or any associated subsidiaries! This personal project is maintained in spare time and has no business goal.**

## Changelog

### 0.0.1
* (Gaspode) initial release

### 0.0.2
* (Gaspode) corrected api call for realtime data

## License
MIT License

Copyright (c) 2022 Gaspode <gaspode69@online.de>

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