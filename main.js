'use strict';

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

const crypto = require('crypto');
const request = require('request');

/** @typedef {'Realtime'|'Settings'} FETCH_TYPES */

const AUTHPREFIX = 'al8e4s';
const AUTHCONSTANT = 'LS885ZYDA95JVFQKUIUUUV7PQNODZRDZIS4ERREDS0EED8BCWSS';
const AUTHSUFFIX = 'ui893ed';
const BaseURI = 'https://cloud.alphaess.com/';

class AlphaEss extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {

        super({
            ...options,
            name: 'alpha-ess',
        });

        this.realtimeDataTimeoutHandle = null;
        this.settingsDataTimeoutHandle = null;
        this.wrongCredentials = false;

        this.Auth =
        {
            username: '',
            password: '',
            AccessToken: '',
            Expires: 0,
            RefreshToken: ''
        };

        this.firstRound =
        {
            'Realtime': true,
            'Settings': true
        };

        this.intervalRealtimedata = 60;
        this.intervalSettingsdata = 0;


        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        // this.on('objectChange', this.onObjectChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        try {
            // Reset the connection indicator during startup
            await this.setStateAsync('info.connection', false, true);

            this.intervalRealtimedata = Number(this.config.intervalRealtimedata);
            if (Number.isNaN(this.intervalRealtimedata)) {
                this.log.warn('Invalid interval for realtime data in config');
                this.intervalRealtimedata = 0;
            }

            this.intervalSettingsdata = Number(this.config.intervalSettingsdata);
            if (Number.isNaN(this.intervalSettingsdata)) {
                this.log.warn('Invalid interval for settings data in config');
                this.intervalSettingsdata = 0;
            }

            if (!this.config.enableRealtimedata) {
                this.intervalRealtimedata = 0;
            }

            if (!this.config.enableSettingsdata) {
                this.intervalSettingsdata = 0;
            }

            // Ensure minimal poll interval for realtime data and settings data:
            if (this.intervalRealtimedata != 0 && this.intervalRealtimedata < 10) {
                this.log.warn('Interval for realtime data too small. Setting it to 10 seconds');
                this.intervalRealtimedata = 10;
            }
            if (this.intervalSettingsdata != 0 && this.intervalSettingsdata < 60) {
                this.log.warn('Interval for settings data too small. Setting it to 60 seconds');
                this.intervalSettingsdata = 60;
            }

            this.log.debug('config username:             ' + this.config.username);
            this.log.debug('config password:             ' + this.config.password);
            this.log.debug('config systemId:             ' + this.config.systemId);
            this.log.debug('config intervalRealtimedata: ' + this.intervalRealtimedata);
            this.log.debug('config intervalSettingsdata: ' + this.intervalSettingsdata);

            this.firstRound['Realtime'] = true;
            this.firstRound['Settings'] = true;

            this.wrongCredentials = false;

            await this.resetAuth();

            if (this.config.password && this.config.username && this.config.systemId) {
                if (this.intervalRealtimedata > 0) {
                    this.fetchRealtimeData();
                }
                else {
                    this.log.info('Realtime data disabled! Adapter won\'t fetch realtime data.');
                }

                if (this.intervalSettingsdata > 0) {
                    // We delay the first start for 5 seconds
                    const _this = this;
                    this.settingsDataTimeoutHandle = setTimeout(function () { _this.fetchSettingsData(); }, 5000);
                }
                else {
                    this.log.info('Settings data disabled! Adapter won\'t fetch settings data.');
                }
            }
            else {
                this.log.error('No username, password and/or system ID set! Adapter won\'t fetch any data.');
            }
        }
        catch (e) {
            this.log.error('onReady Exception occurred: ' + e);
        }
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            if (this.realtimeDataTimeoutHandle) {
                clearTimeout(this.realtimeDataTimeoutHandle);
                this.realtimeDataTimeoutHandle = null;
            }
            if (this.settingsDataTimeoutHandle) {
                clearTimeout(this.settingsDataTimeoutHandle);
                this.settingsDataTimeoutHandle = null;
            }
            this.resetAuth();

            callback();
        } catch (e) {
            callback();
        }
    }

    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    // /**
    //  * Is called if a subscribed object changes
    //  * @param {string} id
    //  * @param {ioBroker.Object | null | undefined} obj
    //  */
    // onObjectChange(id, obj) {
    //     if (obj) {
    //         // The object was changed
    //         this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
    //     } else {
    //         // The object was deleted
    //         this.log.info(`object ${id} deleted`);
    //     }
    // }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
    //  * @param {ioBroker.Message} obj
    //  */
    // onMessage(obj) {
    //     if (typeof obj === 'object' && obj.message) {
    //         if (obj.command === 'send') {
    //             // e.g. send email or pushover or whatever
    //             this.log.info('send command');

    //             // Send response in callback if required
    //             if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
    //         }
    //     }
    // }


    async checkAuthentication() {
        try {
            if (this.Auth.Token && this.Auth.RefreshToken && this.Auth.Expires) {
                if (Date.now() < this.Auth.Expires) {
                    this.log.debug('Authentication token still valid.');
                    return true;
                }
                else {
                    // First we try to refresh the token:
                    if (await this.authenticate(true)) {
                        return true;
                    }
                    else {
                        // If refresh fails we log in again
                        return (await this.authenticate(false));
                    }
                }
            }
            else {
                return (await this.authenticate(false));
            }
        }
        catch (e) {
            this.log.error('checkAuthentication Exception occurred: ' + e);
        }
    }


    /**
     * @param {boolean} [refresh]
     */
    async authenticate(refresh) {
        try {
            return new Promise((resolve) => {

                let LoginData = undefined;

                if (refresh) {
                    this.log.info('Try to refresh authentication token');
                    LoginData =
                    {
                        'username': this.Auth.username,
                        'accesstoken': this.Auth.Token,
                        'refreshtokenkey': this.Auth.RefreshToken
                    };
                }
                else {
                    this.log.info('Try to login');
                    LoginData =
                    {
                        'username': this.Auth.username,
                        'password': this.Auth.password
                    };
                }

                this.log.debug('Login data: ' + JSON.stringify(LoginData));

                request({
                    gzip: true,
                    method: 'POST',
                    url: BaseURI + 'api/' + (refresh ? 'Account/RefreshToken' : 'Account/Login'
                    ),
                    headers: this.headers(null),
                    body: JSON.stringify(LoginData)
                }, async (myError, myResponse) => {
                    if (myError) {
                        this.log.warn('Error occurred during authentication: ' + myError);
                        resolve(false);
                    }
                    else {
                        let body;
                        try {
                            body = JSON.parse(myResponse.body);

                            //log(body);

                            this.Auth.Token = body.data.AccessToken;
                            this.Auth.Expires = Date.now() + ((body.data.ExpiresIn - 3600) * 1000); // Set expire time one hour earlier to be sure
                            this.Auth.RefreshToken = body.data.RefreshTokenKey;

                            this.log.info(refresh ? 'Token succesfully refreshed' : 'Login succesful');
                            this.log.debug('Auth.Token:        ' + this.Auth.Token);
                            this.log.debug('Auth.RefreshToken: ' + this.Auth.RefreshToken);
                            this.log.debug('Auth.Expires:      ' + new Date(this.Auth.Expires));
                            resolve(true);
                            return;
                        }
                        catch (myError) {
                            if (body && body.code && body.code == 5) {
                                this.log.error('Alpha ESS Api returns \'Invalid username or password\'! Adapter won\'t try again to fetch any data.');
                                this.wrongCredentials = true;
                            }
                            else {
                                this.log.warn('Error occurred during authentication: ' + myError);
                                this.log.debug('Wrong authentication body returned: ' + myResponse.body);
                            }
                            resolve(false);
                        }
                    }
                });
            });
        }
        catch (e) {
            this.log.error('authenticate Exception occurred: ' + e);
        }
    }

    fetchRealtimeData() {
        if (this.realtimeDataTimeoutHandle) {
            clearTimeout(this.realtimeDataTimeoutHandle);
            this.realtimeDataTimeoutHandle = null;
        }

        this.fetchData('Realtime');

        if (!this.realtimeDataTimeoutHandle) {
            const _this = this;
            this.realtimeDataTimeoutHandle = setTimeout(function () { _this.fetchRealtimeData(); }, this.intervalRealtimedata * 1000);
        }
    }

    fetchSettingsData() {
        if (this.settingsDataTimeoutHandle) {
            clearTimeout(this.settingsDataTimeoutHandle);
            this.settingsDataTimeoutHandle = null;
        }

        this.fetchData('Settings');

        if (!this.settingsDataTimeoutHandle) {
            const _this = this;
            this.settingsDataTimeoutHandle = setTimeout(function () { _this.fetchSettingsData(); }, this.intervalSettingsdata * 1000);
        }
    }

    /**
     * @param { FETCH_TYPES } fetchType
     */
    async fetchData(fetchType) {
        try {
            if (this.wrongCredentials) {
                return;
            }
            if (!await this.checkAuthentication()) {
                this.log.warn('Error in Authorization');
                this.resetAuth();
                await this.setStateAsync('info.connection', false, true);
                return;
            }

            let uri;
            if (fetchType === 'Realtime') {
                this.log.debug('Fetching realtime data...');
                uri = BaseURI + 'api/ESS/GetLastPowerDataBySN?sys_sn=' + this.config.systemId + '&noLoading=true';
            }
            else {
                this.log.debug('Fetching settings data...');
                uri = BaseURI + 'api/Account/GetCustomUseESSSetting?sys_sn=' + this.config.systemId + '&noLoading=true';
            }

            this.log.debug('Uri: ' + uri);

            request({
                gzip: true,
                method: 'GET',
                url: uri,
                headers: this.headers({ 'Authorization': 'Bearer ' + this.Auth.Token })
            }, async (myError, myResponse) => {
                try {
                    if (myError) {
                        this.log.error('Error (1) when fetching data for ' + this.config.systemId + ': ' + myError);
                        this.handleError();
                    }
                    else {
                        let body;
                        try {
                            this.log.debug('fetchData, body received: ' + myResponse.body);

                            body = JSON.parse(myResponse.body);

                            if (this.firstRound[fetchType]) {
                                this.log.info('Fetching data structure: ' + fetchType);
                                for (const [stateName] of Object.entries(body.data)) {
                                    await this.setObjectNotExistsAsync(fetchType + '.' + this.osn(stateName), {
                                        type: 'state',
                                        common: {
                                            name: fetchType + '.' + this.osn(stateName),
                                            type: 'string',
                                            role: 'state',
                                            read: true,
                                            write: false,
                                        },
                                        native: {},
                                    });
                                }
                                this.firstRound[fetchType] = false;
                            }
                            for (const [stateName, value] of Object.entries(body.data)) {
                                this.log.silly(stateName + ':' + value);
                                await this.setStateChangedAsync(fetchType + '.' + this.osn(stateName), '' + value, true);
                            }

                            this.setStateAsync('info.connection', true, true);
                        }
                        catch (myError) {
                            body = { data: null };
                            this.log.error('Error (1) when fetching data for ' + this.config.systemId + ': ' + myError);
                        }

                        if (body.data === null) {
                            this.log.error('Error (3) when fetching data for ' + this.config.systemId + ': Malformed or empty response!');
                            this.handleError();
                        }
                    }
                }
                catch (e) {
                    this.log.error('fetchData Exception occurred: ' + e);
                }
            });
        }
        catch (e) {
            this.log.error('fetchData Exception occurred: ' + e);
        }
    }

    async resetAuth() {
        try {
            await this.setStateAsync('info.connection', false, true);
            return new Promise((resolve) => {
                this.Auth =
                {
                    username: this.config.username,
                    password: this.config.password,
                    AccessToken: '',
                    Expires: 0,
                    RefreshToken: ''
                };
                this.log.debug('Reset authentication data');
                resolve(true);
            });
        }
        catch (e) {
            this.log.error('resetAuth Exception occurred: ' + e);
        }
    }

    /**
     * @param {any} extraHeaders
     */
    headers(extraHeaders) {
        const timestamp = ((new Date).getTime() / 1000);
        const data = AUTHCONSTANT + timestamp;
        const hash = crypto.createHash('sha512').update(data).digest('hex');

        const stdHeaders = {
            'Content-Type': 'application/json',
            'Connection': 'keep-alive',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate',
            'Cache-Control': 'no-cache',
            'AuthTimestamp': '' + timestamp,
            'AuthSignature': AUTHPREFIX + hash + AUTHSUFFIX
        };

        return Object.assign({}, stdHeaders, extraHeaders);
    }

    async handleError() {
        try {

            // Probably to be improved with a retry stategy ...
            await this.resetAuth();
        }
        catch (e) {
            this.log.error('handleError Exception occurred: ' + e);
        }
    }


    /** otimize statename (i.e. remove forbidden characters for state names)
     * @param {string} sn
     */
    osn(sn) {
        return sn.replace(/[*,?,",',[,\]]/g, '_');
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new AlphaEss(options);
} else {
    // otherwise start the instance directly
    new AlphaEss();
}