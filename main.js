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

const stateList = [{
    Group: 'Realtime'
    , states: [
        {
            stateName: 'createtime'
            , name: 'Last_update'
            , description: 'Last update'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'pbat'
            , name: 'Battery_power'
            , description: 'Battery power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'pmeter_l1'
            , name: 'Grid_L1_power'
            , description: 'Grid L1 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'pmeter_l2'
            , name: 'Grid_L2_power'
            , description: 'Grid L2 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'pmeter_l3'
            , name: 'Grid_L3_power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'ppv1'
            , name: 'PV_string_1_power'
            , description: 'PV string 1 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'ppv2'
            , name: 'PV_string_2_power'
            , description: 'PV string 2 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'ppv3'
            , name: 'PV_string_3_power'
            , description: 'PV string 3 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'ppv4'
            , name: 'PV_string_4_power'
            , description: 'PV string 4 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'preal_l1'
            , name: 'Inverter_L1_power'
            , description: 'Inverter L1 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'preal_l2'
            , name: 'Inverter_L2_power'
            , description: 'Inverter L2 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'preal_l3'
            , name: 'Inverter_L3_power'
            , description: 'Inverter L3 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'soc'
            , name: 'Bttery_SOC'
            , description: 'State of charge'
            , type: 'number'
            , unit: '%'
            , dayIndex: false
        }]
},
{
    Group: 'Settings'
    , states: [
        {
            stateName: 'ctr_dis'
            , name: 'Battery_Discharging_enabled'
            , description: 'Battery Discharging enabled'
            , type: 'number'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_disf1a'
            , name: 'Discharging_period_1_start'
            , description: 'Discharging period 1 start'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_dise1a'
            , name: 'Discharging_period_1_end'
            , description: 'Discharging period 1 end'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_disf2a'
            , name: 'Discharging_period_2_start'
            , description: 'Discharging period 2 start'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_dise2a'
            , name: 'Discharging_period_2_end'
            , description: 'Discharging period 2 end'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'bat_use_cap'
            , name: 'Discharging_Cutoff_SOC'
            , description: 'Discharging Cutoff SOC'
            , type: 'number'
            , unit: '%'
            , dayIndex: false
        }
        , {
            stateName: 'grid_charge'
            , name: 'Battery_Charging_enabled'
            , description: 'Battery Charging enabled'
            , type: 'number'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_chaf1a'
            , name: 'Charging_period_1_start'
            , description: 'Charging period 1 start'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_chae1a'
            , name: 'Charging_period 1_end'
            , description: 'Charging period 1 end'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_chaf2a'
            , name: 'Charging_period_2_start'
            , description: 'Charging period 2 start'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_chae2a'
            , name: 'Charging_period_2_end'
            , description: 'Charging period 2 end'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'bat_high_cap'
            , name: 'Charging_stopps_at_SOC'
            , description: 'Charging stopps at SOC'
            , type: 'number'
            , unit: '%'
            , dayIndex: false
        }]
},
{
    Group: 'Energy'
    , states: [
        {
            stateName: 'Eloads'
            , name: 'Consumption_today'
            , description: 'Today\'s consumption'
            , type: 'number'
            , unit: 'kWh'
            , dayIndex: true
        }
        , {
            stateName: 'Epvs'
            , name: 'Generation_today'
            , description: 'Today\'s generation'
            , type: 'number'
            , unit: 'kWh'
            , dayIndex: true
        }
        , {
            stateName: 'Eoutputs'
            , name: 'Grid_feed_in_today'
            , description: 'Today\'s grid feed in'
            , type: 'number'
            , unit: 'kWh'
            , dayIndex: true
        }
        , {
            stateName: 'Einputs'
            , name: 'Grid_consumption_today'
            , description: 'Today\'s grid consumption'
            , type: 'number'
            , unit: 'kWh'
            , dayIndex: true
        }
        , {
            stateName: 'ECharge'
            , name: 'Battery_charge_today'
            , description: 'Today\'s battery charge'
            , type: 'number'
            , unit: 'kWh'
            , dayIndex: true
        }
        , {
            stateName: 'EDischarge'
            , name: 'Battery_discharge_today'
            , description: 'Today\'s battery discharge'
            , type: 'number'
            , unit: 'kWh'
            , dayIndex: true
        }]
}];

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
        this.energyDataTimeoutHandle = null;
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

        this.createdStates = [];
        this.results = {};

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

            this.log.debug('config username:             ' + this.config.username);
            this.log.debug('config password:             ' + this.config.password);
            this.log.debug('config systemId:             ' + this.config.systemId);
            this.log.debug('config intervalRealtimedata: ' + this.config.intervalRealtimedata);
            this.log.debug('config intervalSettingsdata: ' + this.config.intervalSettingsdata);
            this.log.debug('config enableRealtimedata:   ' + this.config.enableRealtimedata);
            this.log.debug('config enableSettingsdata:   ' + this.config.enableSettingsdata);

            this.wrongCredentials = false;

            await this.resetAuth();

            if (this.config.password && this.config.username && this.config.systemId) {
                if (this.config.enableRealtimedata) {
                    this.fetchRealtimeData();
                }
                else {
                    this.log.info('Realtime data disabled! Adapter won\'t fetch realtime data.');
                }

                if (this.config.enableEnergydata) {
                    // We delay the first start for 3 seconds
                    const _this = this;
                    this.settingsDataTimeoutHandle = setTimeout(function () { _this.fetchEnergyData(); }, 3000);
                }
                else {
                    this.log.info('Energydata data disabled! Adapter won\'t fetch energy data.');
                }

                if (this.config.enableSettingsdata) {
                    // We delay the first start for 6 seconds
                    const _this = this;
                    this.settingsDataTimeoutHandle = setTimeout(function () { _this.fetchSettingsData(); }, 6000);
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
            if (this.energyDataTimeoutHandle) {
                clearTimeout(this.energyDataTimeoutHandle);
                this.energyDataTimeoutHandle = null;
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

    async fetchRealtimeData() {
        try {
            if (this.realtimeDataTimeoutHandle) {
                clearTimeout(this.realtimeDataTimeoutHandle);
                this.realtimeDataTimeoutHandle = null;
            }

            const groupName = 'Realtime';

            this.log.debug('Fetching realtime data...');
            const body = await this.getData(BaseURI + 'api/ESS/GetLastPowerDataBySN?sys_sn=' + this.config.systemId + '&noLoading=true');
            this.createAndUpdateStates(groupName, body.data);

            if (!this.realtimeDataTimeoutHandle) {
                const _this = this;
                this.realtimeDataTimeoutHandle = setTimeout(function () { _this.fetchRealtimeData(); }, this.config.intervalRealtimedata * 1000);
            }
        }
        catch (e) {
            this.log.error('fetchRealtimeData Exception occurred: ' + e);
        }
    }

    async fetchEnergyData() {
        try {
            if (this.energyDataTimeoutHandle) {
                clearTimeout(this.energyDataTimeoutHandle);
                this.energyDataTimeoutHandle = null;
            }
            const groupName = 'Energy';

            this.log.debug('Fetching energy data...');

            const dt = new Date();
            const dts = (dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-01');
            const json = {
                'statisticBy': 'month',
                'sDate': dts,
                'isOEM': 0,
                'sn': this.config.systemId,
                'userId': '',
            };
            const body = await this.postData(BaseURI + 'api/Statistic/SystemStatistic', JSON.stringify(json));
            this.createAndUpdateStates(groupName, body.data);

            if (!this.energyDataTimeoutHandle) {
                const _this = this;
                this.energyDataTimeoutHandle = setTimeout(function () { _this.fetchEnergyData(); }, this.config.intervalEnergydata * 1000);
            }
        }
        catch (e) {
            this.log.error('fetchEnergyData Exception occurred: ' + e);
        }
    }

    async fetchSettingsData() {
        try {
            if (this.settingsDataTimeoutHandle) {
                clearTimeout(this.settingsDataTimeoutHandle);
                this.settingsDataTimeoutHandle = null;
            }

            const groupName = 'Settings';

            this.log.debug('Fetching settings data...');
            const body = await this.getData(BaseURI + 'api/Account/GetCustomUseESSSetting?sys_sn=' + this.config.systemId + '&noLoading=true');
            this.createAndUpdateStates(groupName, body.data);

            if (!this.settingsDataTimeoutHandle) {
                const _this = this;
                this.settingsDataTimeoutHandle = setTimeout(function () { _this.fetchSettingsData(); }, this.config.intervalSettingsdata * 1000);
            }
        }
        catch (e) {
            this.log.error('fetchSettingsData Exception occurred: ' + e);
        }
    }

    /**
     * @param {string} groupName
     * @param {{ [s: string]: any; }} data
     */
    async createAndUpdateStates(groupName, data,) {
        try {
            if (data) {
                const idx = new Date().getDate() - 1;

                for (const [stateName, rawValue] of Object.entries(data)) {
                    const stateInfo = this.getStateInfo(groupName, stateName);
                    if (stateInfo) {
                        if (!this.createdStates[groupName]) {
                            await this.setObjectNotExistsAsync(groupName + '.' + this.osn(stateInfo.name), {
                                type: 'state',
                                common: {
                                    name: groupName + '.' + this.osn(stateInfo.name),
                                    type: stateInfo.type,
                                    role: 'state',
                                    // @ts-ignore
                                    read: true,
                                    write: false,
                                    unit: stateInfo.unit,
                                    desc: stateInfo.description,
                                },
                                native: {},
                            });
                        }
                        let value = '';
                        if (stateInfo.dayIndex) {
                            value = rawValue[idx];
                        }
                        else {
                            value = rawValue;
                        }
                        this.log.silly(groupName + '.' + this.osn(stateInfo.name) + ':' + value);
                        await this.setStateChangedAsync(groupName + '.' + this.osn(stateInfo.name), '' + stateInfo.type == 'number' ? Number.parseFloat(value) : value, true);
                    }
                    else {
                        if (!this.createdStates[groupName]) {
                            this.log.info('Skipped object ' + groupName + '.' + stateName + ' with value ' + rawValue);
                        }
                    }
                }
                if (!this.createdStates[groupName]) {
                    this.log.info('Created states for : ' + groupName);
                    this.createdStates[groupName] = true;
                }
            }
        }
        catch (e) {
            this.log.error('createAndUpdateStates Exception occurred: ' + e);
        }
    }

    /**
     * @param {string} uri
     */
    async getData(uri) {
        try {
            let body = { data: null };

            if (this.wrongCredentials) {
                return body;
            }
            if (!await this.checkAuthentication()) {
                this.log.warn('Error in Authorization');
                this.resetAuth();
                await this.setStateAsync('info.connection', false, true);
                return body;
            }

            this.log.debug('getData Uri: ' + uri);

            return new Promise((resolve) => {
                request({
                    gzip: true,
                    method: 'GET',
                    url: uri,
                    headers: this.headers({ 'Authorization': 'Bearer ' + this.Auth.Token })
                }, (myError, myResponse) => {
                    try {
                        if (myError) {
                            this.log.error('Error (1) when fetching data for ' + this.config.systemId + ': ' + myError);
                            this.handleError();
                        }
                        else {
                            try {
                                this.log.debug('getData, body received: ' + myResponse.body);

                                body = JSON.parse(myResponse.body);
                                this.setStateAsync('info.connection', true, true);
                            }
                            catch (myError) {
                                this.log.error('Error (1) when fetching data for ' + this.config.systemId + ': ' + myError);
                            }

                            if (body.data === null) {
                                this.log.error('Error (3) when fetching data for ' + this.config.systemId + ': Malformed or empty response!');
                                this.handleError();
                            }
                        }
                    }
                    catch (e) {
                        this.log.error('getData Exception occurred: ' + e);
                    }

                    resolve(body);
                });
            });
        }
        catch (e) {
            this.log.error('fetchData Exception occurred: ' + e);
        }
    }

    /**
    * @param {string} uri
    * @param {string} sndBody
    */
    async postData(uri, sndBody) {
        try {
            let body = { data: null };

            if (this.wrongCredentials) {
                return body;
            }
            if (!await this.checkAuthentication()) {
                this.log.warn('Error in Authorization');
                this.resetAuth();
                await this.setStateAsync('info.connection', false, true);
                return body;
            }

            this.log.debug('getData Uri: ' + uri);

            return new Promise((resolve) => {
                request({
                    gzip: true,
                    method: 'POST',
                    url: uri,
                    headers: this.headers({ 'Authorization': 'Bearer ' + this.Auth.Token }),
                    body: sndBody
                }, (myError, myResponse) => {
                    try {
                        if (myError) {
                            this.log.error('Error (1) when fetching data for ' + this.config.systemId + ': ' + myError);
                            this.handleError();
                        }
                        else {
                            try {
                                this.log.debug('getData, body received: ' + myResponse.body);

                                body = JSON.parse(myResponse.body);
                                this.setStateAsync('info.connection', true, true);
                            }
                            catch (myError) {
                                this.log.error('Error (1) when fetching data for ' + this.config.systemId + ': ' + myError);
                            }

                            if (body.data === null) {
                                this.log.error('Error (3) when fetching data for ' + this.config.systemId + ': Malformed or empty response!');
                                this.handleError();
                            }
                        }
                    }
                    catch (e) {
                        this.log.error('getData Exception occurred: ' + e);
                    }

                    resolve(body);
                });
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

    /**
     * @param {string} Group
     * @param {string} StateName
     */
    getStateInfo(Group, StateName) {
        try {
            const gidx = stateList.findIndex(i => i.Group == Group);
            if (gidx >= 0) {
                const currentList = stateList[gidx].states;
                const sidx = currentList.findIndex(i => i.stateName == StateName);
                if (sidx >= 0) {
                    return currentList[sidx];
                }
            }
            return null;
        }
        catch (e) {
            this.log.error('handleError Exception occurred: ' + e);
            this.log.info('Group: ' + Group);
            this.log.info('Statename: ' + StateName);
            return null;
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