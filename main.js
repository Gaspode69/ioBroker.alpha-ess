'use strict';

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

const crypto = require('crypto');
const axios = require('axios');

const AUTHPREFIX = 'al8e4s';
const AUTHCONSTANT = 'LS885ZYDA95JVFQKUIUUUV7PQNODZRDZIS4ERREDS0EED8BCWSS';
const AUTHSUFFIX = 'ui893ed';
const BaseURI = 'https://cloud.alphaess.com/';

const REQUEST_TIMEOUT = 10000;

const stateList = [{
    Group: 'Realtime'
    , states: [
        {
            stateName: 'createtime'
            , role: 'date'
            , id: 'Last_update'
            , name: 'Last update'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'pbat'
            , role: 'value.power'
            , id: 'Battery_power'
            , name: 'Battery power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'pmeter_l1'
            , role: 'value.power'
            , id: 'Grid_L1_power'
            , name: 'Grid L1 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'pmeter_l2'
            , role: 'value.power'
            , id: 'Grid_L2_power'
            , name: 'Grid L2 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'pmeter_l3'
            , role: 'value.power'
            , id: 'Grid_L3_power'
            , name: 'Grid L3 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'ppv1'
            , role: 'value.power'
            , id: 'PV_string_1_power'
            , name: 'PV string 1 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'ppv2'
            , role: 'value.power'
            , id: 'PV_string_2_power'
            , name: 'PV string 2 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'ppv3'
            , role: 'value.power'
            , id: 'PV_string_3_power'
            , name: 'PV string 3 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'ppv4'
            , role: 'value.power'
            , id: 'PV_string_4_power'
            , name: 'PV string 4 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'preal_l1'
            , role: 'value.power'
            , id: 'Inverter_L1_power'
            , name: 'Inverter L1 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'preal_l2'
            , role: 'value.power'
            , id: 'Inverter_L2_power'
            , name: 'Inverter L2 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'preal_l3'
            , role: 'value.power'
            , id: 'Inverter_L3_power'
            , name: 'Inverter L3 power'
            , type: 'number'
            , unit: 'W'
            , dayIndex: false
        }
        , {
            stateName: 'soc'
            , role: 'value.battery'
            , id: 'Battery_SOC'
            , name: 'State of charge'
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
            , role: 'switch.enable'
            , id: 'Battery_Discharging_enabled'
            , name: 'Battery Discharging enabled'
            , type: 'boolean'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_disf1a'
            , role: 'value'
            , id: 'Discharging_period_1_start'
            , name: 'Discharging period 1 start'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_dise1a'
            , role: 'value'
            , id: 'Discharging_period_1_end'
            , name: 'Discharging period 1 end'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_disf2a'
            , role: 'value'
            , id: 'Discharging_period_2_start'
            , name: 'Discharging period 2 start'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_dise2a'
            , role: 'value'
            , id: 'Discharging_period_2_end'
            , name: 'Discharging period 2 end'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'bat_use_cap'
            , role: 'value'
            , id: 'Discharging_Cutoff_SOC'
            , name: 'Discharging Cutoff SOC'
            , type: 'number'
            , unit: '%'
            , dayIndex: false
        }
        , {
            stateName: 'grid_charge'
            , role: 'switch.enable'
            , id: 'Battery_Charging_enabled'
            , name: 'Battery Charging enabled'
            , type: 'boolean'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_chaf1a'
            , role: 'value'
            , id: 'Charging_period_1_start'
            , name: 'Charging period 1 start'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_chae1a'
            , role: 'value'
            , id: 'Charging_period 1_end'
            , name: 'Charging period 1 end'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_chaf2a'
            , role: 'value'
            , id: 'Charging_period_2_start'
            , name: 'Charging period 2 start'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'time_chae2a'
            , role: 'value'
            , id: 'Charging_period_2_end'
            , name: 'Charging period 2 end'
            , type: 'string'
            , unit: ''
            , dayIndex: false
        }
        , {
            stateName: 'bat_high_cap'
            , role: 'value'
            , id: 'Charging_stopps_at_SOC'
            , name: 'Charging stopps at SOC'
            , type: 'number'
            , unit: '%'
            , dayIndex: false
        }
        , {
            stateName: 'upsReserve'
            , role: 'switch.enable'
            , id: 'UPS_Reserve'
            , name: 'Load to cut-off SOC from grid after power failure'
            , type: 'boolean'
            , unit: ''
            , dayIndex: false
        }]
},
{
    Group: 'Energy'
    , states: [
        {
            stateName: 'Eloads'
            , role: 'value.power.consumption '
            , id: 'Consumption_today'
            , name: 'Today\'s consumption'
            , type: 'number'
            , unit: 'kWh'
            , dayIndex: true
        }
        , {
            stateName: 'Epvs'
            , role: 'value.power.consumption '
            , id: 'Generation_today'
            , name: 'Today\'s generation'
            , type: 'number'
            , unit: 'kWh'
            , dayIndex: true
        }
        , {
            stateName: 'Eoutputs'
            , role: 'value.power.consumption '
            , id: 'Grid_feed_in_today'
            , name: 'Today\'s grid feed in'
            , type: 'number'
            , unit: 'kWh'
            , dayIndex: true
        }
        , {
            stateName: 'Einputs'
            , role: 'value.power.consumption '
            , id: 'Grid_consumption_today'
            , name: 'Today\'s grid consumption'
            , type: 'number'
            , unit: 'kWh'
            , dayIndex: true
        }
        , {
            stateName: 'ECharge'
            , role: 'value.power.consumption '
            , id: 'Battery_charge_today'
            , name: 'Today\'s battery charge'
            , type: 'number'
            , unit: 'kWh'
            , dayIndex: true
        }
        , {
            stateName: 'EDischarge'
            , role: 'value.power.consumption '
            , id: 'Battery_discharge_today'
            , name: 'Today\'s battery discharge'
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
        this.errorCount = 0;

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
            await this.setStateChangedAsync('info.connection', false, true);

            this.log.debug('config username:             ' + this.config.username);
            this.log.debug('config systemId:             ' + this.config.systemId);
            this.log.debug('config intervalRealtimedata: ' + this.config.intervalRealtimedata);
            this.log.debug('config intervalSettingsdata: ' + this.config.intervalSettingsdata);
            this.log.debug('config enableRealtimedata:   ' + this.config.enableRealtimedata);
            this.log.debug('config enableSettingsdata:   ' + this.config.enableSettingsdata);
            this.log.debug('config updateUnchangedStates:' + this.config.updateUnchangedStates);

            this.wrongCredentials = false;

            await this.resetAuth();

            if (this.config.password && this.config.username && this.config.systemId) {
                if (this.config.enableRealtimedata) {
                    await this.fetchRealtimeData();
                }
                else {
                    this.log.info('Realtime data disabled! Adapter won\'t fetch realtime data.');
                }

                if (this.config.enableEnergydata) {
                    await this.fetchEnergyData();
                }
                else {
                    this.log.info('Energydata data disabled! Adapter won\'t fetch energy data.');
                }

                if (this.config.enableSettingsdata) {
                    await this.fetchSettingsData();
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

            // @ts-ignore
            const res = await axios.post(BaseURI + 'api/' + (refresh ? 'Account/RefreshToken' : 'Account/Login'),
                JSON.stringify(LoginData),
                {
                    timeout: REQUEST_TIMEOUT,
                    headers: this.headers(null)
                });

            if (res.status == 200) {
                if (res.data && res.data.code && res.data.code == 5) {
                    this.log.error('Alpha ESS Api returns \'Invalid username or password\'! Adapter won\'t try again to fetch any data.');
                    this.wrongCredentials = true;
                    return false;
                }
                else {
                    this.Auth.Token = res.data.data.AccessToken;
                    this.Auth.Expires = Date.now() + ((res.data.data.ExpiresIn - 3600) * 1000); // Set expire time one hour earlier to be sure
                    this.Auth.RefreshToken = res.data.data.RefreshTokenKey;

                    this.log.info(refresh ? 'Token succesfully refreshed' : 'Login succesful');
                    this.log.debug('Auth.Token:        ' + this.Auth.Token);
                    this.log.debug('Auth.RefreshToken: ' + this.Auth.RefreshToken);
                    this.log.debug('Auth.Expires:      ' + new Date(this.Auth.Expires));
                    this.errorCount = 0;
                    return true;
                }
            }
            else {
                this.log.info('Error during authentication, status: ' + res.status);
                return false;
            }
        }
        catch (e) {
            this.log.error('authenticate Exception occurred: ' + e);
            return false;
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
                this.realtimeDataTimeoutHandle = setTimeout(() => this.fetchRealtimeData(), this.calculateIntervalInMs(this.config.intervalRealtimedata, groupName));
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
                this.energyDataTimeoutHandle = setTimeout(() => this.fetchEnergyData(), this.calculateIntervalInMs(this.config.intervalEnergydata, groupName));
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
                this.settingsDataTimeoutHandle = setTimeout(() => this.fetchSettingsData(), this.calculateIntervalInMs(this.config.intervalSettingsdata, groupName));
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
                            await this.setObjectNotExistsAsync(groupName + '.' + this.osn(stateInfo.id), {
                                type: 'state',
                                common: {
                                    name: stateInfo.name
                                    , type: stateInfo.type
                                    , role: stateInfo.role
                                    // @ts-ignore
                                    , read: true
                                    , write: false
                                    , unit: stateInfo.unit
                                    , desc: stateInfo.description
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
                        this.log.silly(groupName + '.' + this.osn(stateInfo.id) + ':' + value);
                        let tvalue;
                        switch (stateInfo.type) {
                            case 'number':
                                tvalue = Number.parseFloat(value);
                                break;
                            case 'boolean':
                                tvalue = Number.parseInt(value) != 0;
                                break;
                            default:
                                tvalue = value;
                        }

                        if (this.config.updateUnchangedStates) {
                            await this.setStateAsync(groupName + '.' + this.osn(stateInfo.id), tvalue, true);
                        }
                        else {
                            await this.setStateChangedAsync(groupName + '.' + this.osn(stateInfo.id), tvalue, true);
                        }
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
        const emptyBody = { data: null };
        try {
            if (this.wrongCredentials) {
                return emptyBody;
            }
            if (!await this.checkAuthentication()) {
                await this.handleError();
                this.log.warn('Error in Authorization (error count: ' + this.errorCount + ')');
                await this.setStateChangedAsync('info.connection', false, true);
                return emptyBody;
            }

            this.log.debug('getData Uri: ' + uri);

            // @ts-ignore
            const res = await axios.get(uri,
                {
                    timeout: REQUEST_TIMEOUT,
                    headers: this.headers({ 'Authorization': 'Bearer ' + this.Auth.Token })
                });

            if (res.status == 200) {
                await this.setStateChangedAsync('info.connection', true, true);
                return res.data;
            }
            else {
                await this.handleError();
                this.log.error('Error when fetching data for ' + this.config.systemId + ', status code: ' + res.status + ' (error count: ' + this.errorCount + ')');
                return emptyBody;
            }
        }
        catch (e) {
            await this.handleError();
            this.log.error('fetchData Exception occurred: ' + e + ' (error count: ' + this.errorCount + ')');
            return emptyBody;
        }
    }

    /**
    * @param {string} uri
    * @param {string} sndBody
    */
    async postData(uri, sndBody) {
        const emptyBody = { data: null };
        try {
            if (this.wrongCredentials) {
                return emptyBody;
            }
            if (!await this.checkAuthentication()) {
                await this.handleError();
                this.log.warn('Error in Authorization (error count: ' + this.errorCount + ')');
                await this.setStateChangedAsync('info.connection', false, true);
                return emptyBody;
            }

            this.log.debug('postData Uri: ' + uri);

            // @ts-ignore
            const res = await axios.post(uri,
                sndBody,
                {
                    timeout: REQUEST_TIMEOUT,
                    headers: this.headers({ 'Authorization': 'Bearer ' + this.Auth.Token })
                });

            if (res.status == 200) {
                await this.setStateChangedAsync('info.connection', true, true);
                return res.data;
            }
            else {
                await this.handleError();
                this.log.error('Error when fetching data for ' + this.config.systemId + ', status code: ' + res.status + ' (error count: ' + this.errorCount + ')');
                return emptyBody;
            }
        }
        catch (e) {
            await this.handleError();
            this.log.error('fetchData Exception occurred: ' + e + ' (error count: ' + this.errorCount + ')');
            return emptyBody;
        }
    }

    async resetAuth() {
        try {
            await this.setStateChangedAsync('info.connection', false, true);
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
            return false;
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
            // Increase error count, will be reset with the next successful connection
            this.errorCount++;
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
            this.log.error('getStateInfo Exception occurred: ' + e);
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

    /**
     * calculate interval time in dependency of error count.
     * This is to avoid too many requests and flooding the ioBroker log file with messages
     * @param {number} timeInS
     */
    calculateIntervalInMs(timeInS, txt) {
        if (this.errorCount < 5) {
            return timeInS * 1000;
        }
        else {
            if (timeInS < 300000) { // 5 minutes
                this.log.warn(txt + ': Five or more errors occurred, next request in 5 minutes.');
                return 300000;
            }
            else {
                return timeInS * 1000;
            }
        }
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