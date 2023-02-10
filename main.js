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

class AlphaEss extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {

        super({
            ...options,
            name: 'alpha-ess',
        });

        this.stateInfoList = [{
            Group: 'Realtime'
            , fnct: this.fetchRealtimeData.bind(this)
            , enabledName: 'enableRealtimedata'
            , states: [
                {
                    alphaAttrName: 'pbat'
                    , role: 'value.power'
                    , id: 'Battery_power'
                    , name: 'Battery power'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'pmeter_l1'
                    , role: 'value.power'
                    , id: 'Grid_L1_power'
                    , name: 'Grid L1 power'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'pmeter_l2'
                    , role: 'value.power'
                    , id: 'Grid_L2_power'
                    , name: 'Grid L2 power'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'pmeter_l3'
                    , role: 'value.power'
                    , id: 'Grid_L3_power'
                    , name: 'Grid L3 power'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'ppv1'
                    , role: 'value.power'
                    , id: 'PV_string_1_power'
                    , name: 'PV string 1 power'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'ppv2'
                    , role: 'value.power'
                    , id: 'PV_string_2_power'
                    , name: 'PV string 2 power'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'ppv3'
                    , role: 'value.power'
                    , id: 'PV_string_3_power'
                    , name: 'PV string 3 power'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'ppv4'
                    , role: 'value.power'
                    , id: 'PV_string_4_power'
                    , name: 'PV string 4 power'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'preal_l1'
                    , role: 'value.power'
                    , id: 'Inverter_L1_power'
                    , name: 'Inverter L1 power'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'preal_l2'
                    , role: 'value.power'
                    , id: 'Inverter_L2_power'
                    , name: 'Inverter L2 power'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'preal_l3'
                    , role: 'value.power'
                    , id: 'Inverter_L3_power'
                    , name: 'Inverter L3 power'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'ev1_power'
                    , role: 'value.power'
                    , id: 'EV1_power'
                    , name: 'Wallbox Power 1'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'ev2_power'
                    , role: 'value.power'
                    , id: 'EV2_power'
                    , name: 'Wallbox Power 2'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'ev3_power'
                    , role: 'value.power'
                    , id: 'EV3_power'
                    , name: 'Wallbox Power 3'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'ev4_power'
                    , role: 'value.power'
                    , id: 'EV4_power'
                    , name: 'Wallbox Power 4'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'soc'
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
            , fnct: this.fetchSettingsData.bind(this)
            , enabledName: 'enableSettingsdata'
            , states: [
                {
                    alphaAttrName: 'ctr_dis'
                    , role: 'switch.enable'
                    , id: 'Battery_Discharging_enabled'
                    , name: 'Battery Discharging enabled'
                    , type: 'boolean'
                    , unit: ''
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'time_disf1a'
                    , role: 'value'
                    , id: 'Discharging_period_1_start'
                    , name: 'Discharging period 1 start'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'time_dise1a'
                    , role: 'value'
                    , id: 'Discharging_period_1_end'
                    , name: 'Discharging period 1 end'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'time_disf2a'
                    , role: 'value'
                    , id: 'Discharging_period_2_start'
                    , name: 'Discharging period 2 start'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'time_dise2a'
                    , role: 'value'
                    , id: 'Discharging_period_2_end'
                    , name: 'Discharging period 2 end'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'bat_use_cap'
                    , role: 'value'
                    , id: 'Discharging_Cutoff_SOC'
                    , name: 'Discharging Cutoff SOC'
                    , type: 'number'
                    , unit: '%'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'grid_charge'
                    , role: 'switch.enable'
                    , id: 'Battery_Charging_enabled'
                    , name: 'Battery Charging enabled'
                    , type: 'boolean'
                    , unit: ''
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'time_chaf1a'
                    , role: 'value'
                    , id: 'Charging_period_1_start'
                    , name: 'Charging period 1 start'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'time_chae1a'
                    , role: 'value'
                    , id: 'Charging_period 1_end'
                    , name: 'Charging period 1 end'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'time_chaf2a'
                    , role: 'value'
                    , id: 'Charging_period_2_start'
                    , name: 'Charging period 2 start'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'time_chae2a'
                    , role: 'value'
                    , id: 'Charging_period_2_end'
                    , name: 'Charging period 2 end'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'bat_high_cap'
                    , role: 'value'
                    , id: 'Charging_stopps_at_SOC'
                    , name: 'Charging stopps at SOC'
                    , type: 'number'
                    , unit: '%'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'upsReserve'
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
            , fnct: this.fetchEnergyData.bind(this)
            , enabledName: 'enableEnergydata'
            , states: [
                {
                    alphaAttrName: 'Eloads'
                    , role: 'value.power.consumption'
                    , id: 'Consumption_today'
                    , name: 'Today\'s consumption'
                    , type: 'number'
                    , unit: 'kWh'
                    , dayIndex: true
                }
                , {
                    alphaAttrName: 'Epvs'
                    , role: 'value.power.consumption'
                    , id: 'Generation_today'
                    , name: 'Today\'s generation'
                    , type: 'number'
                    , unit: 'kWh'
                    , dayIndex: true
                }
                , {
                    alphaAttrName: 'Eoutputs'
                    , role: 'value.power.consumption'
                    , id: 'Grid_feed_in_today'
                    , name: 'Today\'s grid feed in'
                    , type: 'number'
                    , unit: 'kWh'
                    , dayIndex: true
                }
                , {
                    alphaAttrName: 'Einputs'
                    , role: 'value.power.consumption'
                    , id: 'Grid_consumption_today'
                    , name: 'Today\'s grid consumption'
                    , type: 'number'
                    , unit: 'kWh'
                    , dayIndex: true
                }
                , {
                    alphaAttrName: 'ECharge'
                    , role: 'value.power.consumption'
                    , id: 'Battery_charge_today'
                    , name: 'Today\'s battery charge'
                    , type: 'number'
                    , unit: 'kWh'
                    , dayIndex: true
                }
                , {
                    alphaAttrName: 'EDischarge'
                    , role: 'value.power.consumption'
                    , id: 'Battery_discharge_today'
                    , name: 'Today\'s battery discharge'
                    , type: 'number'
                    , unit: 'kWh'
                    , dayIndex: true
                }]
        },
        {
            Group: 'StatisticsToday'
            , fnct: this.fetchStatisticalTodayData.bind(this)
            , enabledName: 'enableStatisticalTodaydata'
            , states: [
                {
                    alphaAttrName: 'EpvT'
                    , role: 'value.power.consumption'
                    , id: 'PV_power_generation'
                    , name: 'PV power generation'
                    , type: 'number'
                    , unit: 'kWh'
                    , round: 3
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'Eout'
                    , role: 'value.power.consumption'
                    , id: 'Feed_in'
                    , name: 'Feed in'
                    , type: 'number'
                    , unit: 'kWh'
                    , round: 3
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'Echarge'
                    , role: 'value.power.consumption'
                    , id: 'Charge'
                    , name: 'Charge'
                    , type: 'number'
                    , unit: 'kWh'
                    , round: 3
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'Epv2load'
                    , role: 'value.power.consumption'
                    , id: 'PV_charging_the_loads'
                    , name: 'PV charging the loads'
                    , type: 'number'
                    , unit: 'kWh'
                    , round: 3
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'Epvcharge'
                    , role: 'value.power.consumption'
                    , id: 'PV_charging_the_the_storage_system'
                    , name: 'PV charging the the storage system'
                    , type: 'number'
                    , unit: 'kWh'
                    , round: 3
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'Eload'
                    , role: 'value.power.consumption'
                    , id: 'Load'
                    , name: 'Load'
                    , type: 'number'
                    , unit: 'kWh'
                    , round: 3
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'EHomeLoad'
                    , role: 'value.power.consumption'
                    , id: 'Other_load_cosumption'
                    , name: 'Other load cosumption'
                    , type: 'number'
                    , unit: 'kWh'
                    , round: 3
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'EChargingPile'
                    , role: 'value.power.consumption'
                    , id: 'EV_charger_consumption'
                    , name: 'EV-charger consumption (Wallbox)'
                    , type: 'number'
                    , unit: 'kWh'
                    , round: 3
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'EGridCharge'
                    , role: 'value.power.consumption'
                    , id: 'Grid_connection_battery_charging/discharging'
                    , name: 'Grid connection-battery charging/discharging'
                    , type: 'number'
                    , unit: 'kWh'
                    , round: 3
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'EGrid2Load'
                    , role: 'value.power.consumption'
                    , id: 'Grid_charging_the_loads'
                    , name: 'Grid charging the loads'
                    , type: 'number'
                    , unit: 'kWh'
                    , round: 3
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'Einput'
                    , role: 'value.power.consumption'
                    , id: 'Grid_consumption'
                    , name: 'Grid consumption'
                    , type: 'number'
                    , unit: 'kWh'
                    , round: 3
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'hasChargingPile'
                    , role: 'value'
                    , id: 'Charging pile'
                    , name: 'Charging pile (Wallbox)'
                    , type: 'boolean'
                    , unit: ''
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'EselfSufficiency'
                    , role: 'value'
                    , id: 'Self_sufficiency'
                    , name: 'Self sufficiency'
                    , type: 'number'
                    , unit: '%'
                    , factor: 100
                    , round: 1
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'EselfConsumption'
                    , role: 'value'
                    , id: 'Self_consumption'
                    , name: 'Self consumption'
                    , type: 'number'
                    , unit: '%'
                    , factor: 100
                    , round: 1
                    , dayIndex: false
                }]
        },
        {
            Group: 'Summary'
            , fnct: this.fetchSummaryData.bind(this)
            , enabledName: 'enableSummarydata'
            , states: [
                {
                    alphaAttrName: 'Epvtoday'
                    , role: 'value.power.consumption'
                    , id: 'Generation_today'
                    , name: 'Today\'s Generation'
                    , type: 'number'
                    , unit: 'kWh'
                    , round: 3
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'Epvtotal'
                    , role: 'value.power.consumption'
                    , id: 'Generation_total'
                    , name: 'Total Generation'
                    , type: 'number'
                    , unit: 'kWh'
                    , round: 3
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'TodayIncome'
                    , role: 'value'
                    , id: 'Income_today'
                    , name: 'Today\'s Income'
                    , type: 'number'
                    , unit: '{money_type}'
                    , round: 2
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'ToalIncome'
                    , role: 'value'
                    , id: 'Income_total'
                    , name: 'Total Profit'
                    , type: 'number'
                    , unit: '{money_type}'
                    , round: 2
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'EselfConsumption'
                    , role: 'value'
                    , id: 'Self_consumption_total'
                    , name: 'Total Self Consumption'
                    , type: 'number'
                    , unit: '%'
                    , factor: 100
                    , round: 1
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'EselfSufficiency'
                    , role: 'value'
                    , id: 'Self_sufficiency_total'
                    , name: 'Total Self Sufficiency'
                    , type: 'number'
                    , unit: '%'
                    , factor: 100
                    , round: 1
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'TreeNum'
                    , role: 'value'
                    , id: 'Trees_plantet_total'
                    , name: 'Total Trees planted'
                    , type: 'number'
                    , unit: '🌳'
                    , round: 1
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'CarbonNum'
                    , role: 'value'
                    , id: 'CO2_reduction_total'
                    , name: 'Total CO₂ reduction'
                    , type: 'number'
                    , unit: 'kg'
                    , round: 1
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'money_type'
                    , role: 'value'
                    , id: 'Currency'
                    , name: 'Currency'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                }]
        }];

        this.Auth =
        {
            username: '',
            password: '',
            AccessToken: '',
            Expires: 0,
            RefreshToken: ''
        };

        this.createdStates = [];

        this.errorCount = 0;

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        try {
            // Reset the connection indicator during startup
            await this.setStateChangedAsync('info.connection', false, true);

            this.log.debug('config username:                         ' + this.config.username);
            this.log.debug('config systemId:                         ' + this.config.systemId);
            this.log.debug('config intervalRealtimedata:             ' + this.config.intervalRealtimedata);
            this.log.debug('config intervalSettingsdataMins          ' + this.config.intervalSettingsdataMins);
            this.log.debug('config intervalEnergydataMins:           ' + this.config.intervalEnergydataMins);
            this.log.debug('config intervalStatisticalTodaydataMins: ' + this.config.intervalStatisticalTodaydataMins);
            this.log.debug('config intervalSummarydataMins:          ' + this.config.intervalSummarydataMins);
            this.log.debug('config enableRealtimedata:               ' + this.config.enableRealtimedata);
            this.log.debug('config enableSettingsdata:               ' + this.config.enableSettingsdata);
            this.log.debug('config enableEnergydata:                 ' + this.config.enableEnergydata);
            this.log.debug('config enableStatisticalTodaydata:       ' + this.config.enableStatisticalTodaydata);
            this.log.debug('config enableSummarydata:                ' + this.config.enableSummarydata);
            this.log.debug('config updateUnchangedStates:            ' + this.config.updateUnchangedStates);

            this.wrongCredentials = false;

            await this.resetAuth();

            if (this.config.password && this.config.username && this.config.systemId) {

                for (const gidx of Object.keys(this.stateInfoList)) {
                    const group = this.stateInfoList[gidx];
                    if (this.config[group.enabledName]) {
                        await group.fnct(group.Group);
                    }
                    else {
                        this.log.info(group.Group + ' data disabled! Adapter won\'t fetch ' + group.Group + ' data. According states deleted.');
                        await this.deleteStatesForGroup(group.Group);
                    }
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
            // Clear all timers
            for (const gidx of Object.keys(this.stateInfoList)) {
                this.stopGroupTimeout(this.stateInfoList[gidx].Group);
            }

            this.resetAuth();

            callback();
        } catch (e) {
            callback();
        }
    }

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

    /**
     * Delete all states for a given group (async, so it can be used in a Promise)
     * @param {string} group
     */
    async deleteStatesForGroupAsync(group) {
        const states = await this.getStatesAsync(group + '.*');
        for (const id in states) {
            this.log.info(id + ': ' + JSON.stringify(states[id]));
            await this.delObjectAsync(id);
        }
    }

    /**
     * Delete all states for a given group
     * @param {string} group
     */
    deleteStatesForGroup(group) {
        return new Promise((resolve) => {
            this.deleteStatesForGroupAsync(group).then(() => {
                resolve(true);
            }).catch(e => {
                this.log.warn('Error: ' + e + '. Deletion of group ' + group + ' failed!');
                resolve(false);
            });
        });
    }

    /** Stop a timer for a given group
     *
     * @param {string} group
     */
    stopGroupTimeout(group) {
        const gidx = this.stateInfoList.findIndex(i => i.Group == group);
        if (this.stateInfoList[gidx].timeoutHandle) {
            this.log.debug('Timeout cleared for group ' + group);
            clearTimeout(this.stateInfoList[gidx].timeoutHandle);
            this.stateInfoList[gidx].timeoutHandle = 0;
        }
    }

    /**
     * Start a timer for a given group
     * @param {number} intervalInS
     * @param {string} group
     */
    startGroupTimeout(intervalInS, group) {
        const gidx = this.stateInfoList.findIndex(i => i.Group == group);
        if (!this.stateInfoList[gidx].timeoutHandle) {
            const interval = this.calculateIntervalInMs(intervalInS, group);
            this.log.debug('Timeout with interval ' + interval + ' ms started for group ' + group);
            this.stateInfoList[gidx].timeoutHandle = setTimeout(() => { this.stateInfoList[gidx].fnct(group); }, interval);
        }
    }

    /**
     * Check alpha-ess authentcation. Decides if login or refresh has to be performed
     * @returns true in case of success, otherwise false
     */
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
     * Perform alpha-ess authentication
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

    /**
     * Get realtime data from alpha-ess and start timer for next execution
     * @param {string} group
     */
    async fetchRealtimeData(group) {
        try {
            this.stopGroupTimeout(group);

            this.log.debug('Fetching realtime data...');

            const body = await this.getData(BaseURI + 'api/ESS/GetLastPowerDataBySN?sys_sn=' + this.config.systemId + '&noLoading=true');
            await this.createAndUpdateStates(group, body.data);

            this.startGroupTimeout(this.config.intervalRealtimedata, group);
        }
        catch (e) {
            this.log.error('fetchRealtimeData Exception occurred: ' + e);
        }
    }

    /**
     * Get energy data from alpha-ess and start timer for next execution
     * @param {string} group
     */
    async fetchEnergyData(group) {
        try {
            this.stopGroupTimeout(group);

            this.log.debug('Fetching energy data...');

            const dt = new Date();
            const dts = (dt.getFullYear() + '-0' + (dt.getMonth() + 1) + '-01');
            const json = {
                'statisticBy': 'month',
                'sDate': dts,
                'isOEM': 0,
                'sn': this.config.systemId,
                'userId': '',
            };
            const body = await this.postData(BaseURI + 'api/Statistic/SystemStatistic', JSON.stringify(json));
            await this.createAndUpdateStates(group, body.data);

            this.startGroupTimeout(this.config.intervalEnergydataMins * 60, group);
        }
        catch (e) {
            this.log.error('fetchEnergyData Exception occurred: ' + e);
        }
    }

    /**
     * Get settings data from alpha-ess and start timer for next execution
     * @param {string} group
     */
    async fetchSettingsData(group) {
        try {
            this.stopGroupTimeout(group);

            this.log.debug('Fetching settings data...');

            const body = await this.getData(BaseURI + 'api/Account/GetCustomUseESSSetting?sys_sn=' + this.config.systemId + '&noLoading=true');
            await this.createAndUpdateStates(group, body.data);

            this.startGroupTimeout(this.config.intervalSettingsdataMins * 60, group);
        }
        catch (e) {
            this.log.error('fetchSettingsData Exception occurred: ' + e);
        }
    }

    /**
     * Get statistical data for today from alpha-ess and start timer for next execution
     * @param {string} group
     */
    async fetchStatisticalTodayData(group) {
        try {
            this.stopGroupTimeout(group);

            this.log.debug('Fetching statistical data...');

            const dt = new Date();
            const dts = (dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate());

            const body = await this.getData(BaseURI + 'api/Power/SticsByPeriod?beginDay=' + dts + '&endDay=' + dts +
                '&tDay=' + dts + '&SN=' + this.config.systemId + '&noLoading=true');

            await this.createAndUpdateStates(group, body.data);

            this.startGroupTimeout(this.config.intervalStatisticalTodaydataMins * 60, group);
        }
        catch (e) {
            this.log.error('fetchStatisticalTodayData Exception occurred: ' + e);
        }
    }

    /**
     * Get summary data for today from alpha-ess and start timer for next execution
     * @param {string} group
     */
    async fetchSummaryData(group) {
        try {
            this.stopGroupTimeout(group);

            this.log.debug('Fetching summary data...');

            const dt = new Date();
            const dts = (dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate());

            const body = await this.getData(BaseURI + 'api/ESS/SticsSummeryDataForCustomer?sn=' + this.config.systemId +
                '&tday=' + dts + '&noLoading=true');

            await this.createAndUpdateStates(group, body.data);

            // Configuration is in minutes, so multiply with 60
            this.startGroupTimeout(this.config.intervalSummarydataMins * 60, group);
        }
        catch (e) {
            this.log.error('fetchSummaryData Exception occurred: ' + e);
        }
    }

    /**
     * Create states when called the first time, update state values in each call
     * @param {string} groupName
     * @param {{ [s: string]: any; }} data
     */
    async createAndUpdateStates(groupName, data) {
        try {
            if (data) {
                const idx = new Date().getDate() - 1;

                for (const [alphaAttrName, rawValue] of Object.entries(data)) {
                    const stateInfo = this.getStateInfo(groupName, alphaAttrName);
                    if (stateInfo) {
                        if (!this.createdStates[groupName]) {
                            await this.setObjectNotExistsAsync(groupName + '.' + this.osn(stateInfo.id), {
                                type: 'state',
                                common: {
                                    name: stateInfo.name + ' [' + stateInfo.alphaAttrName + ']'
                                    , type: stateInfo.type
                                    , role: stateInfo.role
                                    // @ts-ignore
                                    , read: true
                                    , write: false
                                    , unit: stateInfo.unit === '{money_type}' ? data['money_type'] : stateInfo.unit
                                    , desc: stateInfo.alphaAttrName
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
                                if (stateInfo.factor) {
                                    tvalue *= stateInfo.factor;
                                }
                                if (stateInfo.round) {
                                    tvalue = (Math.round(tvalue * (10 ** stateInfo.round))) / (10 ** stateInfo.round);
                                }
                                break;
                            case 'boolean':
                                if (value.toString().toLowerCase() === 'true') {
                                    tvalue = true;
                                }
                                else if (value.toString().toLowerCase() === 'false') {
                                    tvalue = false;
                                }
                                else {
                                    tvalue = Number.parseInt(value) != 0;
                                }
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
                        this.log.debug('Received object ' + groupName + '.' + this.osn(stateInfo.alphaAttrName) + ' with value ' + rawValue);
                    }
                    else {
                        if (!this.createdStates[groupName]) {
                            this.log.info('Skipped object ' + groupName + '.' + alphaAttrName + ' with value ' + rawValue);
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
     * Perform a get request and return the received body.
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
     * Perform a post request and return the received body.
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

    /**
     * Reset authentication data to defaults. Login must be performed afterwards.
     */
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
     * Answer alpha-ess specific headers for web requests
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

    /**
     * Will be called if during any request an error occurs
     */
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
     * Answer the state description object for a given group and alpha-ess attribute name
     * @param {string} Group
     * @param {string} alphaAttrName
     */
    getStateInfo(Group, alphaAttrName) {
        try {
            const gidx = this.stateInfoList.findIndex(i => i.Group == Group);
            if (gidx >= 0) {
                const currentList = this.stateInfoList[gidx].states;
                const sidx = currentList.findIndex(i => i.alphaAttrName == alphaAttrName);
                if (sidx >= 0) {
                    return currentList[sidx];
                }
            }
            return null;
        }
        catch (e) {
            this.log.error('getStateInfo Exception occurred: ' + e);
            this.log.info('Group: ' + Group);
            this.log.info('alphaAttrName: ' + alphaAttrName);
            return null;
        }
    }

    /**
     *  otimize state name (i.e. remove forbidden characters for ioBroker state names)
     * @param {string} sn
     */
    osn(sn) {
        return sn.replace(/[*,?,",',[,\]]/g, '_');
    }

    /**
     * calculate interval time in dependency of error count.
     * This is to avoid too many requests and flooding the ioBroker log file with messages
     * @param {number} timeInS
     * @param {string} txt
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