'use strict';

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

const crypto = require('crypto');
const axios = require('axios').default;

const CA_AUTHPREFIX = 'al8e4s';
const CA_AUTHCONSTANT = 'LS885ZYDA95JVFQKUIUUUV7PQNODZRDZIS4ERREDS0EED8BCWSS';
const CA_AUTHSUFFIX = 'ui893ed';
const CA_BaseURI = 'https://www.alphaess-cloud.com/';
const OA_BaseURI = 'https://openapi.alphaess.com/api';

const WriteTimeoutIntervalInS = 5;
const ReadAfterWriteTimeoutIntervalInS = 2;

const REQUEST_TIMEOUT = 10000;
const WATCHDOG_TIMER = 60000;

/**
 * Functions and definitions using the Alpha-ESS official "open" API.
 */
class OpenAPI {
    /**
     * @param {AlphaEss} adapter
     */
    constructor(adapter) {
        this.stateInfoList = [{
            Group: 'Realtime'
            , fnct: this.getLastPowerData.bind(this)
            , enabledName: 'oAEnableRealtime'
            , intervalName: 'oAIntervalRealtime'
            , intervalFactor: 1
            , states: [
                {
                    alphaAttrName: 'ppv'
                    , role: 'value.power'
                    , id: 'PV_power_total'
                    , name: 'PV power total'
                    , type: 'number'
                    , unit: 'W'
                },
                {
                    alphaAttrName: 'ppv1'
                    , role: 'value.power'
                    , id: 'PV_power_string_1'
                    , name: 'PV power string 1'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                },
                {
                    alphaAttrName: 'ppv2'
                    , role: 'value.power'
                    , id: 'PV_power_string_2'
                    , name: 'PV power string 2'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                },
                {
                    alphaAttrName: 'ppv3'
                    , role: 'value.power'
                    , id: 'PV_power_string_3'
                    , name: 'PV power string 3'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                },
                {
                    alphaAttrName: 'ppv4'
                    , role: 'value.power'
                    , id: 'PV_power_string_4'
                    , name: 'PV power string 4'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                },
                {
                    alphaAttrName: 'pmeterDc'
                    , role: 'value.power'
                    , id: 'PV_power_meter'
                    , name: 'PV power meter'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                },
                {
                    alphaAttrName: 'pload'
                    , role: 'value.power'
                    , id: 'Load_total'
                    , name: 'Load total'
                    , type: 'number'
                    , unit: 'W'
                },
                {
                    alphaAttrName: 'soc'
                    , role: 'value.battery'
                    , id: 'Battery_SOC'
                    , name: 'State of charge'
                    , type: 'number'
                    , unit: '%'
                },
                {
                    alphaAttrName: 'pmeterL1'
                    , role: 'value.power'
                    , id: 'Grid_power_L1'
                    , name: 'Grid power L1'
                    , type: 'number'
                    , unit: 'W'
                },
                {
                    alphaAttrName: 'pmeterL2'
                    , role: 'value.power'
                    , id: 'Grid_power_L2'
                    , name: 'Grid power L2'
                    , type: 'number'
                    , unit: 'W'
                },
                {
                    alphaAttrName: 'pmeterL3'
                    , role: 'value.power'
                    , id: 'Grid_power_L3'
                    , name: 'Grid power L3'
                    , type: 'number'
                    , unit: 'W'
                },
                {
                    alphaAttrName: 'pgrid'
                    , role: 'value.power'
                    , id: 'Grid_power_total'
                    , name: 'Grid power total'
                    , type: 'number'
                    , unit: 'W'
                },
                {
                    alphaAttrName: 'pbat'
                    , role: 'value.power'
                    , id: 'Battery_power'
                    , name: 'Battery power'
                    , type: 'number'
                    , unit: 'W'
                },
                {
                    alphaAttrName: 'pev'
                    , role: 'value.power'
                    , id: 'Charging_pile_power_total'
                    , name: 'Charging pile (Wallbox) power total'
                    , type: 'number'
                    , unit: 'W'
                },
                {
                    alphaAttrName: 'prealL1'
                    , role: 'value.power'
                    , id: 'Inverter_power_L1'
                    , name: 'Inverter power L1'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                },
                {
                    alphaAttrName: 'prealL2'
                    , role: 'value.power'
                    , id: 'Inverter_power_L2'
                    , name: 'Inverter power L2'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                },
                {
                    alphaAttrName: 'prealL3'
                    , role: 'value.power'
                    , id: 'Inverter_power_L3'
                    , name: 'Inverter power L3'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                },
                {
                    alphaAttrName: 'ev1Power'
                    , role: 'value.power'
                    , id: 'Charging_pile_power_1'
                    , name: 'Charging pile (Wallbox) power 1'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                },
                {
                    alphaAttrName: 'ev2Power'
                    , role: 'value.power'
                    , id: 'Charging_pile_power_2'
                    , name: 'Charging pile (Wallbox) power 2'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                },
                {
                    alphaAttrName: 'ev3Power'
                    , role: 'value.power'
                    , id: 'Charging_pile_power_3'
                    , name: 'Charging pile (Wallbox) power 3'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                },
                {
                    alphaAttrName: 'ev4Power'
                    , role: 'value.power'
                    , id: 'Charging_pile_power_4'
                    , name: 'Charging pile (Wallbox) power 4'
                    , type: 'number'
                    , unit: 'W'
                    , dayIndex: false
                }]
        },
        {
            Group: 'Energy'
            , fnct: this.getOneDateEnergyBySn.bind(this)
            , enabledName: 'oAEnableEnergy'
            , intervalName: 'oAIntervalEnergyMins'
            , intervalFactor: 60
            , states: [
                {
                    alphaAttrName: 'eCharge'
                    , role: 'value.power.consumption'
                    , id: 'Battery_charge_today'
                    , name: 'Today\'s battery charge'
                    , type: 'number'
                    , unit: 'kWh'
                },
                {
                    alphaAttrName: 'eDischarge'
                    , role: 'value.power.consumption'
                    , id: 'Battery_discharge_today'
                    , name: 'Today\'s battery discharge'
                    , type: 'number'
                    , unit: 'kWh'
                },
                {
                    alphaAttrName: 'eChargingPile'
                    , role: 'value.power.consumption'
                    , id: 'Charging_pile'
                    , name: 'Charging pile (Wallbox)'
                    , type: 'number'
                    , unit: 'kWh'
                },
                {
                    alphaAttrName: 'eGridCharge'
                    , role: 'value.power.consumption'
                    , id: 'Grid_charge'
                    , name: 'Grid charge'
                    , type: 'number'
                    , unit: 'kWh'
                },
                {
                    alphaAttrName: 'eInput'
                    , role: 'value.power.consumption'
                    , id: 'Grid_consumption_today'
                    , name: 'Today\'s grid consumption'
                    , type: 'number'
                    , unit: 'kWh'
                },
                {
                    alphaAttrName: 'eOutput'
                    , role: 'value.power.consumption'
                    , id: 'Grid_feed_in_today'
                    , name: 'Today\'s grid feed in'
                    , type: 'number'
                    , unit: 'kWh'
                },
                {
                    alphaAttrName: 'epv'
                    , role: 'value.power.consumption'
                    , id: 'Generation_today'
                    , name: 'Today\'s generation'
                    , type: 'number'
                    , unit: 'kWh'
                }]
        },
        {
            // Just a dummy to ensure that this group is deleted
            Group: 'Settings'
            , fnct: this.getSettingsDataDummy.bind(this)
            , enabledName: 'oAEnableSettings'
            , intervalName: 'oAIntervalSettingsMins'
            , intervalFactor: 60
            , states: []
        },
        {
            // Just a dummy to ensure that this group is deleted
            Group: 'StatisticsToday'
            , fnct: this.getOneDayPowerBySnDummy.bind(this)
            , enabledName: 'oAEnableStatisticsToday'
            , intervalName: 'oAIntervalStatisticsTodayMins'
            , intervalFactor: 60
            , states: []
        },
        {
            Group: 'Settings_Charge'
            , fnct: this.getChargeConfigInfo.bind(this)
            , writeFnct: this.writeConfigInfo.bind(this)
            , requestName: 'updateChargeConfigInfo'
            , enabledName: 'oAEnableSettingsCharge'
            , intervalName: 'oAIntervalSettingsChargeMins'
            , intervalFactor: 60
            , states: [
                {
                    alphaAttrName: 'gridCharge'
                    , role: 'switch.enable'
                    , id: 'Battery_Charging_enabled'
                    , name: 'Battery Charging enabled'
                    , type: 'boolean'
                    , unit: ''
                    , writeable: true
                }
                , {
                    alphaAttrName: 'timeChaf1'
                    , role: 'value'
                    , id: 'Charging_period_1_start'
                    , name: 'Charging period 1 start'
                    , type: 'string'
                    , unit: ''
                    , writeable: true
                }
                , {
                    alphaAttrName: 'timeChae1'
                    , role: 'value'
                    , id: 'Charging_period 1_end'
                    , name: 'Charging period 1 end'
                    , type: 'string'
                    , unit: ''
                    , writeable: true
                }
                , {
                    alphaAttrName: 'timeChaf2'
                    , role: 'value'
                    , id: 'Charging_period_2_start'
                    , name: 'Charging period 2 start'
                    , type: 'string'
                    , unit: ''
                    , writeable: true
                }
                , {
                    alphaAttrName: 'timeChae2'
                    , role: 'value'
                    , id: 'Charging_period_2_end'
                    , name: 'Charging period 2 end'
                    , type: 'string'
                    , unit: ''
                    , writeable: true
                }
                , {
                    alphaAttrName: 'batHighCap'
                    , role: 'value'
                    , id: 'Charging_stopps_at_SOC'
                    , name: 'Charging stopps at SOC'
                    , type: 'number'
                    , unit: '%'
                    , writeable: true
                }]
        },
        {
            Group: 'Settings_Discharge'
            , fnct: this.getDisChargeConfigInfo.bind(this)
            , writeFnct: this.writeConfigInfo.bind(this)
            , requestName: 'updateDisChargeConfigInfo'
            , enabledName: 'oAEnableSettingsDischarge'
            , intervalName: 'oAIntervalSettingsDischargeMins'
            , intervalFactor: 60
            , states: [
                {
                    alphaAttrName: 'ctrDis'
                    , role: 'switch.enable'
                    , id: 'Battery_Discharging_enabled'
                    , name: 'Battery Discharging enabled'
                    , type: 'boolean'
                    , unit: ''
                    , writeable: true
                }
                , {
                    alphaAttrName: 'timeDisf1'
                    , role: 'value'
                    , id: 'Discharging_period_1_start'
                    , name: 'Discharging period 1 start'
                    , type: 'string'
                    , unit: ''
                    , writeable: true
                }
                , {
                    alphaAttrName: 'timeDise1'
                    , role: 'value'
                    , id: 'Discharging_period_1_end'
                    , name: 'Discharging period 1 end'
                    , type: 'string'
                    , unit: ''
                    , writeable: true
                }
                , {
                    alphaAttrName: 'timeDisf2'
                    , role: 'value'
                    , id: 'Discharging_period_2_start'
                    , name: 'Discharging period 2 start'
                    , type: 'string'
                    , unit: ''
                    , writeable: true
                }
                , {
                    alphaAttrName: 'timeDise2'
                    , role: 'value'
                    , id: 'Discharging_period_2_end'
                    , name: 'Discharging period 2 end'
                    , type: 'string'
                    , unit: ''
                    , writeable: true
                }
                , {
                    alphaAttrName: 'batUseCap'
                    , role: 'value'
                    , id: 'Discharging_Cutoff_SOC'
                    , name: 'Discharging Cutoff SOC'
                    , type: 'number'
                    , unit: '%'
                    , writeable: true
                }]
        },
        {
            Group: 'Summary'
            , fnct: this.getSumDataForCustomer.bind(this)
            , enabledName: 'oAEnableSummary'
            , intervalName: 'oAIntervalSummaryMins'
            , intervalFactor: 60
            , states: [
                {
                    alphaAttrName: 'epvtoday'
                    , role: 'value.power.consumption'
                    , id: 'Generation_today'
                    , name: 'Today\'s Generation'
                    , type: 'number'
                    , unit: 'kWh'
                    , round: 3
                }
                , {
                    alphaAttrName: 'epvtotal'
                    , role: 'value.power.consumption'
                    , id: 'Generation_total'
                    , name: 'Total Generation'
                    , type: 'number'
                    , unit: 'kWh'
                    , round: 3
                }
                , {
                    alphaAttrName: 'todayIncome'
                    , role: 'value'
                    , id: 'Income_today'
                    , name: 'Today\'s Income'
                    , type: 'number'
                    , unit: '{moneyType}'
                    , round: 2
                }
                , {
                    alphaAttrName: 'totalIncome'
                    , role: 'value'
                    , id: 'Income_total'
                    , name: 'Total Profit'
                    , type: 'number'
                    , unit: '{moneyType}'
                    , round: 2
                }
                , {
                    alphaAttrName: 'eselfConsumption'
                    , role: 'value'
                    , id: 'Self_consumption_total'
                    , name: 'Total Self Consumption'
                    , type: 'number'
                    , unit: '%'
                    , factor: 100
                    , round: 1
                }
                , {
                    alphaAttrName: 'eselfSufficiency'
                    , role: 'value'
                    , id: 'Self_sufficiency_total'
                    , name: 'Total Self Sufficiency'
                    , type: 'number'
                    , unit: '%'
                    , factor: 100
                    , round: 1
                }
                , {
                    alphaAttrName: 'treeNum'
                    , role: 'value'
                    , id: 'Trees_plantet_total'
                    , name: 'Total Trees planted'
                    , type: 'number'
                    , unit: '🌳'
                    , round: 1
                }
                , {
                    alphaAttrName: 'carbonNum'
                    , role: 'value'
                    , id: 'CO2_reduction_total'
                    , name: 'Total CO₂ reduction'
                    , type: 'number'
                    , unit: 'kg'
                    , round: 1
                }
                , {
                    alphaAttrName: 'moneyType'
                    , role: 'value'
                    , id: 'Currency'
                    , name: 'Currency'
                    , type: 'string'
                    , unit: ''
                },
                {
                    alphaAttrName: 'eload'
                    , role: 'value.power.consumption'
                    , id: 'Consumption_today'
                    , name: 'Today\'s consumption'
                    , type: 'number'
                    , unit: 'kWh'
                }
                , {
                    alphaAttrName: 'eoutput'
                    , role: 'value.power.consumption'
                    , id: 'Grid_feed_in_today'
                    , name: 'Today\'s grid feed in'
                    , type: 'number'
                    , unit: 'kWh'
                }
                , {
                    alphaAttrName: 'einput'
                    , role: 'value.power.consumption'
                    , id: 'Grid_consumption_today'
                    , name: 'Today\'s grid consumption'
                    , type: 'number'
                    , unit: 'kWh'
                }
                , {
                    alphaAttrName: 'echarge'
                    , role: 'value.power.consumption'
                    , id: 'Battery_charge_today'
                    , name: 'Today\'s battery charge'
                    , type: 'number'
                    , unit: 'kWh'
                }
                , {
                    alphaAttrName: 'edischarge'
                    , role: 'value.power.consumption'
                    , id: 'Battery_discharge_today'
                    , name: 'Today\'s battery discharge'
                    , type: 'number'
                    , unit: 'kWh'
                }]
        }];
        this.adapter = adapter;
        this.emptyBody = { data: null };
    }

    /**
    * @param {number} timestamp
    */
    getSignature(timestamp) {
        return crypto.createHash('sha512').update(this.adapter.config.appID + this.adapter.config.appSecret + timestamp).digest('hex');
    }

    /**
    * @param {{ [x: string]: string; }} headers
    */
    async addAuthHeaders(headers) {
        const timestamp = Math.floor(Date.now() / 1000);
        const sign = this.getSignature(timestamp);
        headers['appId'] = this.adapter.config.appID;
        headers['timestamp'] = '' + timestamp;
        headers['sign'] = sign;

        return headers;
    }

    /**
    * @param {string} path
    * @param {{}} headers
    */
    async getRequest(path, headers) {
        try {
            const url = `${OA_BaseURI}/${path}`;
            headers = await this.addAuthHeaders(headers);

            const res = await axios.get(url,
                {
                    timeout: REQUEST_TIMEOUT,
                    headers: headers
                });
            return res;
        }
        catch (e) {
            this.adapter.log.error('Error prforming get request ' + path + ': ' + e);
            return this.emptyBody;
        }
    }

    /**
     * @param {string} path
     * @param {{ sysSn: any; }} sndBody
     * @param {{ [x: string]: string; }} headers
     */
    async postRequest(path, sndBody, headers) {
        try {
            const url = `${OA_BaseURI}/${path}`;
            headers = await this.addAuthHeaders(headers);

            const res = await axios.post(url,
                sndBody,
                {
                    timeout: REQUEST_TIMEOUT,
                    headers: headers
                });

            return res;
        }
        catch (e) {
            this.adapter.log.error('Error prforming post request ' + path + ': ' + e);
            return this.emptyBody;
        }
    }

    /**
     * @param {string} group
     */
    async getLastPowerData(group) {
        try {
            this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug('Fetching ' + group + ' data...');

            const res = await this.getRequest(`getLastPowerData?sysSn=${this.adapter.config.systemId}`, {});
            if (res && res['status'] == 200 && res.data && res.data.data) {
                await this.adapter.createAndUpdateStates(group, res.data.data);
            }
            else {
                await this.handleError(res, group);
            }
        }
        catch (e) {
            this.adapter.log.error('Reading data for group ' + group + ': Exception occurred: ' + e);
            await this.handleError(this.emptyBody, group);
        }
        await this.startGroupTimeout(group);
    }

    /**
     * @param {string} group
     */
    async getOneDateEnergyBySn(group) {
        try {
            this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug('Fetching ' + group + ' data...');

            const dt = new Date();
            const dts = (dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2));
            const res = await this.getRequest(`getOneDateEnergyBySn?sysSn=${this.adapter.config.systemId}&queryDate=${dts}`, {});
            if (res && res['status'] == 200 && res.data && res.data.data) {
                await this.adapter.createAndUpdateStates(group, res.data.data);
            }
            else {
                await this.handleError(res, group);
            }
        }
        catch (e) {
            this.adapter.log.error('Reading data for group ' + group + ': Exception occurred: ' + e);
            await this.handleError(this.emptyBody, group);
        }
        await this.startGroupTimeout(group);
    }

    /**
     * @param {any} group
     */
    async getOneDayPowerBySnDummy(group) {
        this.adapter.log.warn(`Internal error (group ${group}): function getOneDayPowerBySnDummy should never be called.`);
    }

    /**
     * @param {any} group
     */
    async getSettingsDataDummy(group) {
        this.adapter.log.warn(`Internal error (group ${group}): function getSettingsDataDummy should never be called.`);
    }

    /**
     * @param {string} group
     */
    async getChargeConfigInfo(group) {
        try {
            this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug('Fetching ' + group + ' data...');

            const res = await this.getRequest(`getChargeConfigInfo?sysSn=${this.adapter.config.systemId}`, {});
            if (res && res['status'] == 200 && res.data && res.data.data) {
                await this.adapter.createAndUpdateStates(group, res.data.data);
            }
            else {
                await this.handleError(res, group);
            }
        }
        catch (e) {
            this.adapter.log.error('Reading data for group ' + group + ': Exception occurred: ' + e);
            await this.handleError(this.emptyBody, group);
        }
        await this.startGroupTimeout(group);
    }

    /**
     * @param {string} group
     */
    async getDisChargeConfigInfo(group) {
        try {
            this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug('Fetching ' + group + ' data...');

            const res = await this.getRequest(`getDisChargeConfigInfo?sysSn=${this.adapter.config.systemId}`, {});
            if (res && res['status'] == 200 && res.data && res.data.data) {
                await this.adapter.createAndUpdateStates(group, res.data.data);
            }
            else {
                await this.handleError(res, group);
            }
        }
        catch (e) {
            this.adapter.log.error('Reading data for group ' + group + ': Exception occurred: ' + e);
            await this.handleError(this.emptyBody, group);
        }
        await this.startGroupTimeout(group);
    }

    /**
     * @param {string} group
     */
    async getSumDataForCustomer(group) {
        try {
            this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug('Fetching ' + group + ' data...');

            const dt = new Date();
            const dts = (dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2));
            const res = await this.getRequest(`getSumDataForCustomer?sysSn=${this.adapter.config.systemId}&queryDate=${dts}`, {});
            if (res && res['status'] == 200 && res.data && res.data.data) {
                await this.adapter.createAndUpdateStates(group, res.data.data);
            }
            else {
                await this.handleError(res, group);
            }
        }
        catch (e) {
            this.adapter.log.error('Reading data for group ' + group + ': Exception occurred: ' + e);
            await this.handleError(this.emptyBody, group);
        }
        await this.startGroupTimeout(group);
    }

    /**
     * @param {string} group
     */
    async writeConfigInfo(group) {
        const nextReadTimeout = ReadAfterWriteTimeoutIntervalInS;
        try {
            this.adapter.stopGroupWriteTimeout(group);
            this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug('Writing ' + group + ' data...');

            const body = {};
            const gidx = this.stateInfoList.findIndex((/** @type {{ Group: string; }} */ i) => i.Group == group);
            if (gidx >= 0) {

                // The openAPI (and closedAPI anyway) allows smaller intervals again to read data.
                // Therefore we do no more need to wait the complete intarval to read back the changed value.
                // const groupInfo = this.stateInfoList[gidx];
                // nextReadTimeout = this.adapter.jsonConfig.items[groupInfo.intervalName].min * groupInfo.intervalFactor;

                const groupStates = this.stateInfoList[gidx].states;
                for (let i = 0; i < groupStates.length; i++) {
                    // Ensure that watchdog does not fire, because timeout may be delayed
                    groupStates[i].lastUpdateTs = Date.now();
                    this.adapter.log.debug('State ' + group + '.' + groupStates[i].alphaAttrName + ' - ' + groupStates[i].id);
                    const state = await this.adapter.getStateAsync(group + '.' + groupStates[i].id);
                    let value = null;
                    if (state) {
                        value = state.val;
                    }
                    body[groupStates[i].alphaAttrName] = groupStates[i].type != 'boolean' ? value : value ? 1 : 0;
                }
            }
            body['sysSn'] = this.adapter.config.systemId;

            this.adapter.log.debug(`Write group ${group}: ${JSON.stringify(body)}`);

            const res = await this.postRequest(this.adapter.getStateInfoList()[gidx].requestName, body, {});
            if (res && res['status'] == 200 && res.data) {
                this.adapter.log.info('Written values fror group ' + group);
            }
            else {
                await this.handleError(res, group);
            }
        }
        catch (e) {
            this.adapter.log.error('Writing data for group ' + group + ': Exception occurred: ' + e);
            await this.handleError(this.emptyBody, group);
        }
        this.adapter.startGroupTimeout(nextReadTimeout, group);
    }

    /**
     * @param {string} group
     */
    async startGroupTimeout(group) {
        if (!this.adapter.wrongCredentials) {
            const gidx = this.stateInfoList.findIndex(i => i.Group == group);
            if (gidx >= 0 && this.stateInfoList[gidx].interval > 0) {
                const intervalInS = this.stateInfoList[gidx].interval;
                this.adapter.startGroupTimeout(intervalInS, group);
            }
            else {
                this.adapter.log.error('Internal Error for group ' + group + ': No timeout configuration found!');
                await this.handleError(this.emptyBody, group);
            }
        }
        else {
            this.adapter.log.debug('Group ' + group + ': No new timer started, wrong credentials!');
        }
    }

    /**
     * @param {import("axios").AxiosResponse<any, any> | { data: null; }} res
     * @param {string} group
     */
    async handleError(res, group) {
        await this.adapter.setStateChangedAsync('info.connection', false, true);
        this.adapter.errorCount++;
        if (res.data && res.data.code && res.data.code != 0) {
            this.adapter.log.error('Alpha ESS Api returns an error!');
            switch (res.data.code) {
                case 6001: this.adapter.log.error(`Error: ${res.data.code} - Parameter error (#${this.adapter.errorCount})`); break;
                case 6002: this.adapter.log.error(`Error: ${res.data.code} - The SN is not bound to the user (#${this.adapter.errorCount})`); break;
                case 6003: this.adapter.log.error(`Error: ${res.data.code} - You have bound this SN (#${this.adapter.errorCount})`); break;
                case 6004: this.adapter.log.error(`Error: ${res.data.code} - CheckCode error (#${this.adapter.errorCount})`); break;
                case 6005: this.adapter.log.error(`Error: ${res.data.code} - This appId is not bound to the SN (#${this.adapter.errorCount})`); break;
                case 6006: this.adapter.log.error(`Error: ${res.data.code} - Timestamp error (#${this.adapter.errorCount})`); break;
                case 6007: this.adapter.log.error(`Error: ${res.data.code} - Sign verification error (#${this.adapter.errorCount})`); break;
                case 6008: this.adapter.log.error(`Error: ${res.data.code} - Set failed (#${this.adapter.errorCount})`); break;
                case 6009: this.adapter.log.error(`Error: ${res.data.code} - Whitelist verification failed (#${this.adapter.errorCount})`); break;
                case 6010: this.adapter.log.error(`Error: ${res.data.code} - Sign is empty (#${this.adapter.errorCount})`); break;
                case 6011: this.adapter.log.error(`Error: ${res.data.code} - timestamp is empty (#${this.adapter.errorCount})`); break;
                case 6012: this.adapter.log.error(`Error: ${res.data.code} - AppId is empty (#${this.adapter.errorCount})`); break;
                case 6026: this.adapter.log.error(`Error: ${res.data.code} - Internal Error (#${this.adapter.errorCount})`); break;
                case 6046: this.adapter.log.error(`Error: ${res.data.code} - Verification code error (#${this.adapter.errorCount})`); break;
                case 6053: this.adapter.log.error(`Error: ${res.data.code} - The request was too fast, please try again later (#${this.adapter.errorCount})`); break;
                default: this.adapter.log.error(`Error: ${res.data.code} - Unknown error (#${this.adapter.errorCount})`);
            }
            if (res.data.code == 6002 ||
                res.data.code == 6003 ||
                res.data.code == 6005 ||
                res.data.code == 6007 ||
                res.data.code == 6010 ||
                res.data.code == 6011 ||
                res.data.code == 6012 ||
                res.data.code == 6046) {
                this.adapter.log.error(' Adapter won\'t try again to fetch any data.');
                this.adapter.wrongCredentials = true;
            }
        }
        else {
            this.adapter.log.error(`Unknown error occurred: ${JSON.stringify(res.data)} (#${this.adapter.errorCount})`);
        }
        await this.adapter.setQualityForGroup(group, 0x44);
    }
}

/**
 * Functions and definitions using the Alpha-ESS inofficial "closed" API.
 */
class ClosedAPI {
    /**
     * @param {AlphaEss} adapter
     */
    constructor(adapter) {
        this.stateInfoList = [{
            Group: 'Realtime'
            , fnct: this.fetchRealtimeData.bind(this)
            , enabledName: 'enableRealtimedata'
            , intervalName: 'intervalRealtimedata'
            , intervalFactor: 1
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
                    alphaAttrName: 'pmeter_dc'
                    , role: 'value.power'
                    , id: 'PV_meter_power'
                    , name: 'PV meter power'
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
            , writeFnct: this.writeSettingsData.bind(this)
            , enabledName: 'enableSettingsdata'
            , intervalName: 'intervalSettingsdataMins'
            , intervalFactor: 60
            , states: [
                {
                    alphaAttrName: 'ctr_dis'
                    , role: 'switch.enable'
                    , id: 'Battery_Discharging_enabled'
                    , name: 'Battery Discharging enabled'
                    , type: 'boolean'
                    , unit: ''
                    , dayIndex: false
                    , writeable: true
                }
                , {
                    alphaAttrName: 'time_disf1a'
                    , role: 'value'
                    , id: 'Discharging_period_1_start'
                    , name: 'Discharging period 1 start'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                    , writeable: true
                }
                , {
                    alphaAttrName: 'time_dise1a'
                    , role: 'value'
                    , id: 'Discharging_period_1_end'
                    , name: 'Discharging period 1 end'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                    , writeable: true
                }
                , {
                    alphaAttrName: 'time_disf2a'
                    , role: 'value'
                    , id: 'Discharging_period_2_start'
                    , name: 'Discharging period 2 start'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                    , writeable: true
                }
                , {
                    alphaAttrName: 'time_dise2a'
                    , role: 'value'
                    , id: 'Discharging_period_2_end'
                    , name: 'Discharging period 2 end'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                    , writeable: true
                }
                , {
                    alphaAttrName: 'bat_use_cap'
                    , role: 'value'
                    , id: 'Discharging_Cutoff_SOC'
                    , name: 'Discharging Cutoff SOC'
                    , type: 'number'
                    , unit: '%'
                    , dayIndex: false
                    , writeable: true
                }
                , {
                    alphaAttrName: 'grid_charge'
                    , role: 'switch.enable'
                    , id: 'Battery_Charging_enabled'
                    , name: 'Battery Charging enabled'
                    , type: 'boolean'
                    , unit: ''
                    , dayIndex: false
                    , writeable: true
                }
                , {
                    alphaAttrName: 'time_chaf1a'
                    , role: 'value'
                    , id: 'Charging_period_1_start'
                    , name: 'Charging period 1 start'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                    , writeable: true
                }
                , {
                    alphaAttrName: 'time_chae1a'
                    , role: 'value'
                    , id: 'Charging_period 1_end'
                    , name: 'Charging period 1 end'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                    , writeable: true
                }
                , {
                    alphaAttrName: 'time_chaf2a'
                    , role: 'value'
                    , id: 'Charging_period_2_start'
                    , name: 'Charging period 2 start'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                    , writeable: true
                }
                , {
                    alphaAttrName: 'time_chae2a'
                    , role: 'value'
                    , id: 'Charging_period_2_end'
                    , name: 'Charging period 2 end'
                    , type: 'string'
                    , unit: ''
                    , dayIndex: false
                    , writeable: true
                }
                , {
                    alphaAttrName: 'bat_high_cap'
                    , role: 'value'
                    , id: 'Charging_stopps_at_SOC'
                    , name: 'Charging stopps at SOC'
                    , type: 'number'
                    , unit: '%'
                    , dayIndex: false
                    , writeable: true
                }
                , {
                    alphaAttrName: 'upsReserve'
                    , role: 'switch.enable'
                    , id: 'UPS_Reserve'
                    , name: 'Load to cut-off SOC from grid after power failure'
                    , type: 'boolean'
                    , unit: ''
                    , dayIndex: false
                    , writeable: true
                }]
        },
        {
            // Just a dummy to ensure that this group is deleted
            Group: 'Settings_Charge'
            , fnct: this.fetchSettingsChargeDataDummy.bind(this)
            , enabledName: 'enableSettingsCharge'
            , intervalName: 'intervalSettingsChargeMins'
            , intervalFactor: 60
            , states: []
        },
        {
            // Just a dummy to ensure that this group is deleted
            Group: 'Settings_Discharge'
            , fnct: this.fetchSettingsDischargeDataDummy.bind(this)
            , enabledName: 'enableSettingsDisCharge'
            , intervalName: 'intervalSettingsDisChargeMins'
            , intervalFactor: 60
            , states: []
        },
        {
            Group: 'Energy'
            , fnct: this.fetchEnergyData.bind(this)
            , enabledName: 'enableEnergydata'
            , intervalName: 'intervalEnergydataMins'
            , intervalFactor: 60
            , states: [
                {
                    alphaAttrName: 'Eload'
                    , role: 'value.power.consumption'
                    , id: 'Consumption_today'
                    , name: 'Today\'s consumption'
                    , type: 'number'
                    , unit: 'kWh'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'Epvtoday'
                    , role: 'value.power.consumption'
                    , id: 'Generation_today'
                    , name: 'Today\'s generation'
                    , type: 'number'
                    , unit: 'kWh'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'Eoutput'
                    , role: 'value.power.consumption'
                    , id: 'Grid_feed_in_today'
                    , name: 'Today\'s grid feed in'
                    , type: 'number'
                    , unit: 'kWh'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'Einput'
                    , role: 'value.power.consumption'
                    , id: 'Grid_consumption_today'
                    , name: 'Today\'s grid consumption'
                    , type: 'number'
                    , unit: 'kWh'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'Echarge'
                    , role: 'value.power.consumption'
                    , id: 'Battery_charge_today'
                    , name: 'Today\'s battery charge'
                    , type: 'number'
                    , unit: 'kWh'
                    , dayIndex: false
                }
                , {
                    alphaAttrName: 'EDisCharge'
                    , role: 'value.power.consumption'
                    , id: 'Battery_discharge_today'
                    , name: 'Today\'s battery discharge'
                    , type: 'number'
                    , unit: 'kWh'
                    , dayIndex: false
                }]
        },
        {
            Group: 'StatisticsToday'
            , fnct: this.fetchStatisticalTodayData.bind(this)
            , enabledName: 'enableStatisticalTodaydata'
            , intervalName: 'intervalStatisticalTodaydataMins'
            , intervalFactor: 60
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
                    , id: 'Grid_charge'
                    , name: 'Grid charge'
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
            , intervalName: 'intervalSummarydataMins'
            , intervalFactor: 60
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
        this.system_id = '';
        this.adapter = adapter;
    }

    /**
     * Check alpha-ess authentcation. Decides if login or refresh has to be performed
     * @returns true in case of success, otherwise false
     */
    async checkAuthentication() {
        try {
            if (this.Auth.Token && this.Auth.RefreshToken && this.Auth.Expires) {
                if (Date.now() < this.Auth.Expires) {
                    this.adapter.log.debug('Authentication token still valid.');
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
            this.adapter.log.error('checkAuthentication Exception occurred: ' + e);
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
                this.adapter.log.info('Try to refresh authentication token');
                LoginData =
                {
                    'username': this.Auth.username,
                    'accesstoken': this.Auth.Token,
                    'refreshtokenkey': this.Auth.RefreshToken
                };
            }
            else {
                this.adapter.log.info('Try to login');
                LoginData =
                {
                    'username': this.Auth.username,
                    'password': this.Auth.password
                };
            }

            const res = await axios.post(CA_BaseURI + 'api/' + (refresh ? 'Account/RefreshToken' : 'Account/Login'),
                JSON.stringify(LoginData),
                {
                    timeout: REQUEST_TIMEOUT,
                    headers: this.headers(null)
                });

            if (res.status == 200) {
                if (res.data && res.data.code && res.data.code == 5) {
                    this.adapter.log.error('Alpha ESS Api returns \'Invalid username or password\'! Adapter won\'t try again to fetch any data.');
                    this.adapter.wrongCredentials = true;
                    return false;
                }
                else {
                    this.Auth.Token = res.data.data.AccessToken;
                    this.Auth.Expires = Date.now() + ((res.data.data.ExpiresIn - 3600) * 1000); // Set expire time one hour earlier to be sure
                    this.Auth.RefreshToken = res.data.data.RefreshTokenKey;

                    this.adapter.log.info(refresh ? 'Token succesfully refreshed' : 'Login succesful');
                    this.adapter.log.debug('Auth.Token:        ' + this.Auth.Token);
                    this.adapter.log.debug('Auth.RefreshToken: ' + this.Auth.RefreshToken);
                    this.adapter.log.debug('Auth.Expires:      ' + new Date(this.Auth.Expires));
                    this.adapter.errorCount = 0;
                    return true;
                }
            }
            else {
                this.adapter.log.info('Error during authentication, status: ' + res.status);
                return false;
            }
        }
        catch (e) {
            this.adapter.log.error('authenticate Exception occurred: ' + e);
            return false;
        }
    }

    /**
     * Perform a get request and return the received body.
     * @param {string} uri
     * @param {string} group
     */
    async getData(uri, group) {
        const emptyBody = { data: null };
        try {
            if (this.adapter.wrongCredentials) {
                return emptyBody;
            }
            if (!await this.checkAuthentication()) {
                await this.handleError(group);
                this.adapter.log.warn('Error in Authorization (error count: ' + this.adapter.errorCount + ')');
                await this.adapter.setStateChangedAsync('info.connection', false, true);
                return emptyBody;
            }

            this.adapter.log.debug('getData Uri: ' + uri);

            const res = await axios.get(uri,
                {
                    timeout: REQUEST_TIMEOUT,
                    headers: this.headers({ 'Authorization': 'Bearer ' + this.Auth.Token })
                });

            if (res.status == 200) {
                await this.adapter.setStateChangedAsync('info.connection', true, true);
                return res.data;
            }
            else {
                await this.handleError(group);
                this.adapter.log.error('Error when fetching data for ' + this.adapter.config.systemId + ', status code: ' + res.status + ' (error count: ' + this.adapter.errorCount + ')');
                return emptyBody;
            }
        }
        catch (e) {
            await this.handleError(group);
            this.adapter.log.error('fetchData Exception occurred: ' + e + ' (error count: ' + this.adapter.errorCount + ')');
            return emptyBody;
        }
    }

    /**
     * Perform a post request and return the received body.
    * @param {string} uri
    * @param {string} sndBody
    * @param {string} group
    */
    async postData(uri, sndBody, group) {
        const emptyBody = { data: null };
        try {
            if (this.adapter.wrongCredentials) {
                return emptyBody;
            }
            if (!await this.checkAuthentication()) {
                await this.handleError(group);
                this.adapter.log.warn('Error in Authorization (error count: ' + this.adapter.errorCount + ')');
                await this.adapter.setStateChangedAsync('info.connection', false, true);
                return emptyBody;
            }

            this.adapter.log.debug('postData Uri: ' + uri);

            const res = await axios.post(uri,
                sndBody,
                {
                    timeout: REQUEST_TIMEOUT,
                    headers: this.headers({ 'Authorization': 'Bearer ' + this.Auth.Token })
                });

            if (res.status == 200) {
                await this.adapter.setStateChangedAsync('info.connection', true, true);
                return res.data;
            }
            else {
                await this.handleError(group);
                this.adapter.log.error('Error when fetching data for ' + this.adapter.config.systemId + ', status code: ' + res.status + ' (error count: ' + this.adapter.errorCount + ')');
                return emptyBody;
            }
        }
        catch (e) {
            await this.handleError(group);
            this.adapter.log.error('fetchData Exception occurred: ' + e + ' (error count: ' + this.adapter.errorCount + ')');
            return emptyBody;
        }
    }


    /**
     * Reset authentication data to defaults. Login must be performed afterwards.
     */
    async resetAuth() {
        try {
            await this.adapter.setStateChangedAsync('info.connection', false, true);
            return new Promise((resolve) => {
                this.Auth =
                {
                    username: this.adapter.config.username,
                    password: this.adapter.config.password,
                    AccessToken: '',
                    Expires: 0,
                    RefreshToken: ''
                };
                this.adapter.log.debug('Reset authentication data');
                resolve(true);
            });
        }
        catch (e) {
            this.adapter.log.error('resetAuth Exception occurred: ' + e);
            return false;
        }
    }

    /**
     * Answer alpha-ess specific headers for web requests
     * @param {any} extraHeaders
     */
    headers(extraHeaders) {
        const timestamp = ((new Date).getTime() / 1000);
        const data = CA_AUTHCONSTANT + timestamp;
        const hash = crypto.createHash('sha512').update(data).digest('hex');

        const stdHeaders = {
            'Content-Type': 'application/json',
            'Connection': 'keep-alive',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate',
            'Cache-Control': 'no-cache',
            'AuthTimestamp': '' + timestamp,
            'AuthSignature': CA_AUTHPREFIX + hash + CA_AUTHSUFFIX
        };

        return Object.assign({}, stdHeaders, extraHeaders);
    }

    /**
     * Will be called if during any request an error occurs
     * @param {string} group
     */
    async handleError(group) {
        try {
            // Increase error count, will be reset with the next successful connection
            this.adapter.errorCount++;
            await this.adapter.setQualityForGroup(group, 0x44);
            await this.resetAuth();
        }
        catch (e) {
            this.adapter.log.error('handleError Exception occurred: ' + e);
        }
    }

    /**
     * @param {string} group
     */
    async fetchSettingsChargeDataDummy(group) {
        this.adapter.log.warn(`Internal error (group ${group}): function fetchSettingsChargeDataDummy should never be called.`);
    }

    /**
     * @param {string} group
     */
    async fetchSettingsDischargeDataDummy(group) {
        this.adapter.log.warn(`Internal error (group ${group}): function fetchSettingsDischargeDataDummy should never be called.`);
    }

    /**
     * Get realtime data from alpha-ess and start timer for next execution
     * @param {string} group
     */
    async fetchRealtimeData(group) {
        try {
            this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug('Fetching ' + group + ' data...');

            const body = await this.getData(CA_BaseURI + 'api/ESS/GetLastPowerDataBySN?sys_sn=' + this.adapter.config.systemId + '&noLoading=true', group);
            await this.adapter.createAndUpdateStates(group, body.data);

            this.startGroupTimeout(group);
        }
        catch (e) {
            this.adapter.log.error('fetchRealtimeData Exception occurred: ' + e);
        }
    }

    /**
     * Get energy data from alpha-ess and start timer for next execution
     * @param {string} group
     */
    async fetchEnergyData(group) {
        try {
            this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug('Fetching summary data...');

            const dt = new Date();
            const dts = (dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate());

            const body = await this.getData(CA_BaseURI + 'api/ESS/SticsSummeryDataForCustomer?sn=' + this.adapter.config.systemId +
                '&tday=' + dts + '&noLoading=true', group);

            await this.adapter.createAndUpdateStates(group, body.data);

            // Configuration is in minutes, so multiply with 60
            this.startGroupTimeout(group);
        }
        catch (e) {
            this.adapter.log.error('fetchEnergyData Exception occurred: ' + e);
        }
    }

    /**
     * Get settings data from alpha-ess and start timer for next execution
     * @param {string} group
     */
    async fetchSettingsData(group) {
        try {
            this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug('Fetching ' + group + ' data...');

            const body = await this.getData(CA_BaseURI + 'api/Account/GetCustomUseESSSetting?sys_sn=' + this.adapter.config.systemId + '&noLoading=true', group);
            await this.adapter.createAndUpdateStates(group, body.data);

            this.startGroupTimeout(group);
        }
        catch (e) {
            this.adapter.log.error('fetchSettingsData Exception occurred: ' + e);
        }
    }

    /**
     * Get statistical data for today from alpha-ess and start timer for next execution
     * @param {string} group
     */
    async fetchStatisticalTodayData(group) {
        try {
            this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug('Fetching ' + group + ' data...');

            const dt = new Date();
            const dts = (dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate());

            const body = await this.getData(CA_BaseURI + 'api/Power/SticsByPeriod?beginDay=' + dts + '&endDay=' + dts +
                '&tDay=' + dts + '&SN=' + this.adapter.config.systemId + '&noLoading=true', group);

            await this.adapter.createAndUpdateStates(group, body.data);

            this.startGroupTimeout(group);
        }
        catch (e) {
            this.adapter.log.error('fetchStatisticalTodayData Exception occurred: ' + e);
        }
    }

    /**
     * Get summary data for today from alpha-ess and start timer for next execution
     * @param {string} group
     */
    async fetchSummaryData(group) {
        try {
            this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug('Fetching summary data...');

            const dt = new Date();
            const dts = (dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate());

            const body = await this.getData(CA_BaseURI + 'api/ESS/SticsSummeryDataForCustomer?sn=' + this.adapter.config.systemId +
                '&tday=' + dts + '&noLoading=true', group);

            await this.adapter.createAndUpdateStates(group, body.data);

            // Configuration is in minutes, so multiply with 60
            this.startGroupTimeout(group);
        }
        catch (e) {
            this.adapter.log.error('fetchSummaryData Exception occurred: ' + e);
        }
    }

    /**
     * @param {string} group
     */
    async writeSettingsData(group) {
        try {
            this.adapter.stopGroupWriteTimeout(group);
            this.adapter.stopGroupTimeout(group);

            this.adapter.log.info('Writing ' + group + ' data...');

            // We need the system id here
            if (this.system_id.length == 0) {
                const custListBody = await this.getData(CA_BaseURI + 'api/Account/GetCustomUseESSList?noLoading=true', group);
                if (custListBody && custListBody.data) {
                    for (let i = 0; i < custListBody.data.length; i++) {
                        if (custListBody.data[i].sys_sn === this.adapter.config.systemId) {
                            this.system_id = custListBody.data[i].system_id;
                            this.adapter.log.debug(`Found system_id ${this.system_id}`);
                            break;
                        }
                    }
                }
            }

            if (this.system_id.length > 0) {
                // First we read the whole data set and update our values:
                const body = await this.getData(CA_BaseURI + 'api/Account/GetCustomUseESSSetting?sys_sn=' + this.adapter.config.systemId + '&noLoading=true', group);
                if (body && body.data) {
                    const data = body.data;
                    const gidx = this.adapter.getStateInfoList().findIndex((/** @type {{ Group: string; }} */ i) => i.Group == group);
                    if (gidx >= 0) {
                        const groupStates = this.adapter.getStateInfoList()[gidx].states;
                        for (let i = 0; i < groupStates.length; i++) {
                            if (groupStates[i].writeable) {
                                this.adapter.log.debug('State ' + group + '.' + groupStates[i].alphaAttrName + ' - ' + groupStates[i].id);
                                const state = await this.adapter.getStateAsync(group + '.' + groupStates[i].id);
                                let value = null;
                                if (state) {
                                    value = state.val;
                                }
                                data[groupStates[i].alphaAttrName] = groupStates[i].type != 'boolean' ? value : value ? 1 : 0;
                            }
                        }
                    }
                    data['system_id'] = this.system_id;

                    this.adapter.log.debug(`Write group ${group}: ${JSON.stringify(data)}`);

                    const res = await this.postData(CA_BaseURI + 'api/Account/CustomUseESSSetting', JSON.stringify(data), group);
                    if (res && res['code'] == 200) {
                        this.adapter.log.debug('Written values fror group ' + group);
                    }
                    else {
                        this.adapter.log.error('Error writing settings data for group ' + group + 'Status: ' + res['status']);
                    }
                }
                else {
                    this.adapter.log.error('Error writing settings data for group ' + group + ' (unable to get data)');
                }
            }
            else {
                this.adapter.log.error('Error writing settings data for group ' + group + ' (unable to find system id for sys_sn ' + this.adapter.config.systemId + ')');
            }
        }
        catch (e) {
            this.adapter.log.error('Writing settings data for group ' + group + ': Exception occurred: ' + e);
        }
        this.adapter.startGroupTimeout(ReadAfterWriteTimeoutIntervalInS, group);
    }

    /**
     * @param {string} group
     */
    async startGroupTimeout(group) {
        if (!this.adapter.wrongCredentials) {
            const gidx = this.stateInfoList.findIndex(i => i.Group == group);
            if (gidx >= 0 && this.stateInfoList[gidx].interval > 0) {
                const intervalInS = this.stateInfoList[gidx].interval;
                this.adapter.startGroupTimeout(intervalInS, group);
            }
            else {
                this.adapter.log.error('Internal Error for group ' + group + ': No timeout configuration found!');
                await this.handleError(group);
            }
        }
        else {
            this.adapter.log.debug('Group ' + group + ': No new timer started, wrong credentials!');
        }
    }
}

class AlphaEss extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {

        super({
            ...options,
            name: 'alpha-ess',
        });

        this.jsonConfig = require('./admin/jsonConfig.json');

        this.openApi = new OpenAPI(this);
        this.closedApi = new ClosedAPI(this);

        this.setObjectNormalAsync = this.setObjectNotExistsAsync.bind(this);
        this.setObjectMigrationAsync = this.setObjectAsync.bind(this);

        this.watchDogFunction = this.watchDog.bind(this);

        this.createdStates = [];

        this.errorCount = 0;

        this.wrongCredentials = false;

        this.watchDogIntervalHandle = null;

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

            if (this.config.apiType == 0) {
                this.log.debug('Used API:                                Closed API');
                this.log.debug('config username:                         ' + this.config.username);
                this.log.debug('config systemId:                         ' + this.config.systemId);
                this.log.debug('config intervalRealtimedata:             ' + this.config.intervalRealtimedata);
                this.log.debug('config intervalEnergydataMins:           ' + this.config.intervalEnergydataMins);
                this.log.debug('config intervalSettingsdataMins          ' + this.config.intervalSettingsdataMins);
                this.log.debug('config intervalStatisticalTodaydataMins: ' + this.config.intervalStatisticalTodaydataMins);
                this.log.debug('config intervalSummarydataMins:          ' + this.config.intervalSummarydataMins);
                this.log.debug('config enableRealtimedata:               ' + this.config.enableRealtimedata);
                this.log.debug('config enableSettingsdata:               ' + this.config.enableSettingsdata);
                this.log.debug('config enableEnergydata:                 ' + this.config.enableEnergydata);
                this.log.debug('config enableStatisticalTodaydata:       ' + this.config.enableStatisticalTodaydata);
                this.log.debug('config enableSummarydata:                ' + this.config.enableSummarydata);
                this.log.debug('config updateUnchangedStates:            ' + this.config.updateUnchangedStates);
            }
            else {
                this.log.debug('Used API:                              Open API');
                this.log.debug('config appID:                          ' + this.config.appID);
                this.log.debug('config systemId:                       ' + this.config.systemId);
                this.log.debug('config oAIntervalRealtime:             ' + this.config.oAIntervalRealtime);
                this.log.debug('config oAIntervalEnergyMins:           ' + this.config.oAIntervalEnergyMins);
                this.log.debug('config oAIntervalSettingsChargeMins    ' + this.config.oAIntervalSettingsChargeMins);
                this.log.debug('config oAIntervalSettingsDischargeMins ' + this.config.oAIntervalSettingsDischargeMins);
                this.log.debug('config oAIntervalSummaryMins:          ' + this.config.oAIntervalSummaryMins);
                this.log.debug('config enableRealtimedata:             ' + this.config.oAEnableRealtime);
                this.log.debug('config enableEnergydata:               ' + this.config.oAEnableEnergy);
                this.log.debug('config enableSettingsdata:             ' + this.config.oAEnableSettingsCharge);
                this.log.debug('config enableStatisticalTodaydata:     ' + this.config.oAEnableSettingsDischarge);
                this.log.debug('config enableSummarydata:              ' + this.config.oAEnableSettingsDischarge);
                this.log.debug('config enableSummarydata:              ' + this.config.oAEnableSummary);
                this.log.debug('config updateUnchangedStates:          ' + this.config.updateUnchangedStates);
            }

            this.wrongCredentials = false;

            await this.setObjectNotExistsAsync('info.version', {
                type: 'state',
                common: {
                    name: 'Adapter Version'
                    , type: 'string'
                    , role: 'value'
                    , read: true
                    , write: false
                },
                native: {},
            });

            if (await this.isMigrationNecessary()) {
                this.log.info('States will be migrated.');
            }

            if (this.config.apiType == 3) { // For future possibility to disable Closed API
                this.log.error('Closed API: Sorry, Closed API currently not supported because of changes by Alpha-ESS.');
            }
            else {
                await this.closedApi.resetAuth();

                if (this.config.apiType == 0 && this.config.password && this.config.username && this.config.systemId ||
                    this.config.apiType == 1 && this.config.appID && this.config.appSecret && this.config.systemId) {

                    for (const gidx of Object.keys(this.getStateInfoList())) {
                        const groupInfo = this.getStateInfoList()[gidx];

                        groupInfo.interval = this.config[groupInfo.intervalName] * groupInfo.intervalFactor;
                        this.log.debug(`${groupInfo.intervalName}: ${groupInfo.interval}`);

                        if (this.jsonConfig.items[groupInfo.intervalName] && this.jsonConfig.items[groupInfo.intervalName].min) {
                            if (groupInfo.interval < this.jsonConfig.items[groupInfo.intervalName].min * groupInfo.intervalFactor) {
                                const oldVal = groupInfo.interval;
                                groupInfo.interval = this.jsonConfig.items[groupInfo.intervalName].min * groupInfo.intervalFactor;
                                if (this.config[groupInfo.enabledName]) {
                                    this.log.warn(`Configured interval ${oldVal} for ${groupInfo.Group} no longer supported. Changed to ${groupInfo.interval}. Please change your configuration!`);
                                }
                            }
                        }

                        if (this.config[groupInfo.enabledName]) {
                            await this.setQualityForGroup(groupInfo.Group, 0x2);
                            await groupInfo.fnct(groupInfo.Group);
                        }
                        else {
                            this.log.info(groupInfo.Group + ' data disabled! Adapter won\'t fetch ' + groupInfo.Group + ' data. According states deleted.');
                            await this.delObjectAsync(groupInfo.Group, { recursive: true });
                        }
                    }
                }
                else {
                    if (this.config.apiType == 0) {
                        this.log.error('Closed API: No username, password and/or system ID set! Adapter won\'t fetch any data.');
                    }
                    else {
                        this.log.error('Open API: No appID, appSecret and/or system ID set! Adapter won\'t fetch any data.');
                    }
                }
                this.watchDogIntervalHandle = this.setInterval(this.watchDogFunction, WATCHDOG_TIMER);
                this.log.debug('Watchdog interval started!');
            }
            await this.setStateAsync('info.version', '' + this.version, true);
        }
        catch (e) {
            this.log.error('onReady Exception occurred: ' + e);
        }
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    async onUnload(callback) {
        try {
            // Clear all timers
            for (const gidx of Object.keys(this.getStateInfoList())) {
                const group = this.getStateInfoList()[gidx].Group;
                this.stopGroupTimeout(group);
                this.stopGroupWriteTimeout(group);
                await this.setQualityForGroup(group, 0x12);
            }

            if (this.watchDogIntervalHandle) {
                this.clearInterval(this.watchDogIntervalHandle);
                this.watchDogIntervalHandle = null;
                this.log.debug('Watchdog interval cleared!');
            }

            this.closedApi.resetAuth();

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
            if (!state.ack) {
                const lastIdx = id.lastIndexOf('.');
                const group = id.substring(id.lastIndexOf('.', lastIdx - 1) + 1, lastIdx);
                const attribute = id.substring(lastIdx + 1);
                this.log.debug(`group: ${group}, attribute: ${attribute}, state ${id} changed: ${state.val} (ack = ${state.ack})`);

                const stateInfo = this.getStateInfoById(group, attribute);
                if (stateInfo) {

                    if (!stateInfo['validationInProgress']) {
                        this.log.debug(`Validate ${id}`);
                        this.stopGroupTimeout(group);
                        this.stopGroupWriteTimeout(group);

                        this.verifyValue(state.val, group, stateInfo);

                        this.startGroupWriteTimeout(WriteTimeoutIntervalInS, group);
                    }
                    else {
                        this.log.debug(`Validation already in progress: ${id}`);
                        stateInfo['validationInProgress'] = false;
                    }
                }
                else {
                    this.log.warn(`Internal problem: No definition for ${group}.${id} found!`);
                }
            }
        }
        else {
            // The state was deleted
            this.log.debug(`state ${id} deleted`);
        }
    }

    /**
     * @param {any} value
     * @param {string} group
     * @param {{ alphaAttrName: string; role: string; id: string; name: string; type: string; unit: string; writeable: boolean; } | { alphaAttrName: string; role: string; id: string; name: string; type: string; unit: string; round: number; factor?: undefined; } | { alphaAttrName: string; role: string; id: string; name: string; type: string; unit: string; factor: number; round: number; } | { alphaAttrName: string; role: string; id: string; name: string; type: string; unit: string; round?: undefined; factor?: undefined; }} stateInfo
     */
    verifyValue(value, group, stateInfo) {
        if (stateInfo.unit == '%') {
            let newValue = Math.round(value);
            if (newValue > 100) {
                newValue = 100;
            }
            else if (newValue < 5) {
                newValue = 5;
            }
            if (value != newValue) {
                stateInfo['validationInProgress'] = true;
                this.setStateAsync(`${group}.${this.osn(stateInfo.id)}`, newValue, false);
                this.log.debug(`Replaced value ${value} with ${newValue} for ${group}.${this.osn(stateInfo.id)}`);
            }
        } else if (stateInfo.alphaAttrName.indexOf('time') == 0) {
            const parts = value.split(':');
            let newValue = '00:00';
            if (parts.length > 0) {
                // only one part, we assume thats the hour
                let hour = parseInt(parts[0]);
                let minuteStr = '00';
                if (!isNaN(hour)) {
                    if (hour < 0) {
                        hour = 0;
                    }
                    else if (hour > 23) {
                        hour = 23;
                    }
                }
                if (parts.length > 1) {
                    // at least two partes, we use the first two parts and ignore the rest
                    const minute = parseInt(parts[1]);
                    if (!isNaN(minute)) {
                        if (minute <= 7) {
                            minuteStr = '00';
                        }
                        else if (minute > 7 && minute <= 22) {
                            minuteStr = '15';
                        }
                        else if (minute <= 37 && minute > 22) {
                            minuteStr = '30';
                        }
                        else {
                            minuteStr = '45';
                        }
                    }
                }
                newValue = ('0' + hour).slice(-2) + ':' + minuteStr;
                if (value != newValue) {
                    stateInfo['validationInProgress'] = true;
                    this.setStateAsync(`${group}.${this.osn(stateInfo.id)}`, newValue, false);
                    this.log.debug(`Replaced value ${value} with ${newValue} for ${group}.${this.osn(stateInfo.id)}`);
                }
            }
        }
    }

    getStateInfoList() {
        if (this.config.apiType == 0) {
            return this.closedApi.stateInfoList;
        }
        else {
            return this.openApi.stateInfoList;
        }
    }

    /**
     * Stop a timer for a given group
     *
     * @param {string} group
     */
    stopGroupTimeout(group) {
        const gidx = this.getStateInfoList().findIndex((/** @type {{ Group: string; }} */ i) => i.Group == group);
        if (this.getStateInfoList()[gidx].timeoutHandle) {
            this.log.debug('Timeout cleared for group ' + group);
            this.clearTimeout(this.getStateInfoList()[gidx].timeoutHandle);
            this.getStateInfoList()[gidx].timeoutHandle = 0;
        }
    }

    /**
     * Start a timer for a given group
     * @param {number} intervalInS
     * @param {string} group
     */
    startGroupTimeout(intervalInS, group) {
        const gidx = this.getStateInfoList().findIndex((/** @type {{ Group: string; }} */ i) => i.Group == group);
        if (!this.getStateInfoList()[gidx].timeoutHandle) {
            const interval = this.calculateIntervalInMs(intervalInS, group);
            this.log.debug('Timeout with interval ' + interval + ' ms started for group ' + group);
            this.getStateInfoList()[gidx].timeoutHandle = this.setTimeout(() => { this.getStateInfoList()[gidx].fnct(group); }, interval);
        }
    }

    /**
     * Stop a timer for a given group
     *
     * @param {string} group
     */
    stopGroupWriteTimeout(group) {
        const gidx = this.getStateInfoList().findIndex((/** @type {{ Group: string; }} */ i) => i.Group == group);
        if (this.getStateInfoList()[gidx].writeTimeoutHandle) {
            this.log.debug('Write Timeout cleared for group ' + group);
            this.clearTimeout(this.getStateInfoList()[gidx].writeTimeoutHandle);
            this.getStateInfoList()[gidx].writeTimeoutHandle = 0;
        }
    }

    /**
     * Start a timer for a given group
     * @param {number} intervalInS
     * @param {string} group
     */
    startGroupWriteTimeout(intervalInS, group) {
        const gidx = this.getStateInfoList().findIndex((/** @type {{ Group: string; }} */ i) => i.Group == group);
        if (!this.getStateInfoList()[gidx].writeTimeoutHandle) {
            const interval = intervalInS * 1000;
            this.log.debug('Write Timeout with interval ' + interval + ' ms started for group ' + group);
            const wf = this.getStateInfoList()[gidx].writeFnct;
            if (wf) {
                this.getStateInfoList()[gidx].writeTimeoutHandle = this.setTimeout(() => { wf(group); }, interval);
            }
        }
    }

    /**
     * Answer if the states shall be migrated, i.e. overwritten.
     * This is called a few times at startup only.
     */
    async isMigrationNecessary() {
        const oldVersionState = await this.getStateAsync('info.version');
        if (oldVersionState) {
            const oldVersion = '' + oldVersionState.val;
            const vParts = oldVersion.split('.');
            if (vParts.length >= 4) {
                // more than 3 parts mean alpha or beta version, we migrate these everytime
                return true;
            }
            if (vParts.length >= 3) {
                const major = Number.parseInt(vParts[0]);
                const minor = Number.parseInt(vParts[1]);
                if (major == 0 && minor > 4 || major > 0) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Create states when called the first time, update state values in each call
     * @param {string} group
     * @param {{ [s: string]: any; }} data
     */
    async createAndUpdateStates(group, data) {
        try {
            if (data) {
                await this.setStateChangedAsync('info.connection', true, true);
                this.errorCount = 0;

                const idx = new Date().getDate() - 1;

                if (!this.createdStates[group]) {

                    // Delete no longer supported states for this group
                    const gidx = this.getStateInfoList().findIndex((/** @type {{ Group: string; }} */ i) => i.Group == group);
                    if (gidx >= 0) {
                        const groupStateList = this.getStateInfoList()[gidx].states;
                        const states = await this.getStatesAsync(group + '.*');
                        for (const sid in states) {
                            const parts = sid.split('.');
                            const id = parts[parts.length - 1];
                            if (groupStateList.findIndex((/** @type {{ id: string; }} */ i) => i.id == id) == -1) {
                                this.log.info('State ' + group + '.' + id + ' removed, no longer supported.');
                                await this.delObjectAsync(group + '.' + id);
                            }
                        }
                    }

                    const setObjectFunc = await this.isMigrationNecessary() ? this.setObjectMigrationAsync : this.setObjectNormalAsync;

                    // Create the folder for this group
                    await setObjectFunc(group, {
                        type: 'folder',
                        common: {
                            name: group
                            , read: true
                            , write: false
                        },
                        native: {}
                    });

                    // Create all states for received elements
                    for (const [alphaAttrName, rawValue] of Object.entries(data)) {
                        const stateInfo = this.getStateInfoByAlphaAttrName(group, alphaAttrName);
                        if (typeof data[alphaAttrName] !== 'object') {
                            this.createStateForAttribute(group, data, rawValue, alphaAttrName, stateInfo, setObjectFunc);
                        }
                        else {
                            // Look for subvalues:
                            for (const [alphaAttrName2, rawValue2] of Object.entries(data[alphaAttrName])) {
                                const stateInfo2 = this.getStateInfoByAlphaAttrName(group, alphaAttrName2);
                                this.createStateForAttribute(group, data[alphaAttrName], rawValue2, alphaAttrName2, stateInfo2, setObjectFunc);
                            }
                        }
                    }
                    this.log.info('Initialized states for : ' + group);
                    this.createdStates[group] = true;
                }

                // Set values for received states
                for (const [alphaAttrName, rawValue] of Object.entries(data)) {
                    const stateInfo = this.getStateInfoByAlphaAttrName(group, alphaAttrName);
                    if (typeof data[alphaAttrName] !== 'object') {
                        this.setValueForAttribute(group, rawValue, stateInfo, idx);
                    }
                    else {
                        // Look for subvalues:
                        for (const [alphaAttrName2, rawValue2] of Object.entries(data[alphaAttrName])) {
                            const stateInfo2 = this.getStateInfoByAlphaAttrName(group, alphaAttrName2);
                            this.setValueForAttribute(group, rawValue2, stateInfo2, idx);
                        }
                    }
                }
            }
        }
        catch (e) {
            this.log.error('createAndUpdateStates Exception occurred: ' + e);
        }
    }

    /**
     *
     * create the state for the received element
     * @param {string} group
     * @param {{[x: string]: any;}} data
     * @param {string} rawValue
     * @param {string} alphaAttrName
     */
    async createStateForAttribute(group, data, rawValue, alphaAttrName, stateInfo, setObjectFunc) {
        if (stateInfo) {
            // The type checker has a problem with type: stateInfo.type. I have no clue why.
            // All possible types are correct and valid. To get rid of the type checker error, we check for valid types:
            if (stateInfo.type == 'string' || stateInfo.type == 'boolean' || stateInfo.type == 'number') {
                await setObjectFunc(group + '.' + this.osn(stateInfo.id), {
                    type: 'state',
                    common: {
                        name: stateInfo.name + ' [' + stateInfo.alphaAttrName + ']'
                        , type: stateInfo.type
                        , role: stateInfo.role
                        , read: true
                        , write: stateInfo.writeable ? stateInfo.writeable : false
                        , unit: stateInfo.unit === '{money_type}' ? data['money_type'] : stateInfo.unit === '{moneyType}' ? data['moneyType'] : stateInfo.unit
                        , desc: stateInfo.alphaAttrName
                    },
                    native: {},
                });
                if (stateInfo.writeable) {
                    await this.subscribeStatesAsync(`${group}.${stateInfo.id}`);
                    this.log.debug(`Subscribed State: ${group}.${stateInfo.id}`);
                }
            }
            else {
                this.log.error('Internal error: Skipped object ' + group + '.' + alphaAttrName + ' with value ' + rawValue + ' because of invalid type definition!');
            }
        }
        else {
            if (alphaAttrName == 'sysSn' || alphaAttrName == 'theDate') {
                this.log.debug('Skipped object ' + group + '.' + alphaAttrName + ' with value ' + rawValue);
            }
            else {
                this.log.warn('Skipped object ' + group + '.' + alphaAttrName + ' with value ' + rawValue);
            }
        }
    }

    /**
     * @param {string} group
     * @param {string} rawValue
     */
    async setValueForAttribute(group, rawValue, stateInfo, idx) {
        if (stateInfo) {
            let value = '';
            if (stateInfo.dayIndex) {
                value = rawValue[idx];
            }
            else {
                value = rawValue;
            }
            this.log.silly(group + '.' + this.osn(stateInfo.id) + ':' + value);
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
                await this.setStateAsync(group + '.' + this.osn(stateInfo.id), { val: tvalue, q: 0 }, true);
            }
            else {
                await this.setStateChangedAsync(group + '.' + this.osn(stateInfo.id), { val: tvalue, q: 0 }, true);
            }
            stateInfo.lastUpdateTs = Date.now();
            this.log.debug('Received object ' + group + '.' + this.osn(stateInfo.alphaAttrName) + ' with value ' + rawValue);
        }
    }

    /**
     * Answer the state description object for a given group and alpha-ess attribute name
     * @param {string} Group
     * @param {string} alphaAttrName
     */
    getStateInfoByAlphaAttrName(Group, alphaAttrName) {
        try {
            const gidx = this.getStateInfoList().findIndex((/** @type {{ Group: string; }} */ i) => i.Group == Group);
            if (gidx >= 0) {
                const currentList = this.getStateInfoList()[gidx].states;
                const sidx = currentList.findIndex((/** @type {{ alphaAttrName: string; }} */ i) => i.alphaAttrName == alphaAttrName);
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
     * Answer the state description object for a given group and id
     * @param {string} Group
     * @param {string} id
     */
    getStateInfoById(Group, id) {
        try {
            const gidx = this.getStateInfoList().findIndex((/** @type {{ Group: string; }} */ i) => i.Group == Group);
            if (gidx >= 0) {
                const currentList = this.getStateInfoList()[gidx].states;
                const sidx = currentList.findIndex((/** @type {{ id: string; }} */ i) => i.id == id);
                if (sidx >= 0) {
                    return currentList[sidx];
                }
            }
            return null;
        }
        catch (e) {
            this.log.error('getStateInfo Exception occurred: ' + e);
            this.log.info('Group: ' + Group);
            this.log.info('alphaAttrName: ' + id);
            return null;
        }
    }

    /**
     * Set quality for all existing states of given group
     * @param {string} group
     * @param {number} q
     */
    async setQualityForGroup(group, q) {
        try {
            const states = await this.getStatesAsync(group + '.*');
            for (const sid in states) {
                const newState = states[sid];
                if (newState.ack) {
                    newState.q = q;
                    this.log.debug(`Set state ${sid} to val: ${newState.val}; q: ${newState.q}; ack: ${newState.ack}`);
                    await this.setStateAsync(sid, newState, true);
                }
                else {
                    this.log.debug(`Set state ${sid} NOT to val: ${newState.val}; q: ${newState.q} because ack of this state is ${newState.ack}`);
                }
            }
        }
        catch (e) {
            this.log.error('setQualityForGroup Exception occurred: ' + e);
            this.log.info('Group: ' + group);
            return null;
        }
    }

    /**
     * Called to verify if states were fetched in given intervals
     * Set quality to 0x01 if not
     */
    async watchDog() {
        this.log.debug('Watchdog check ...');
        for (const gidx of Object.keys(this.getStateInfoList())) {
            const groupInfo = this.getStateInfoList()[gidx];
            const groupStates = groupInfo.states;
            for (let i = 0; i < groupStates.length; i++) {
                if (groupStates[i].lastUpdateTs) {
                    if (Date.now() - groupStates[i].lastUpdateTs > (groupInfo.interval * 1000 + REQUEST_TIMEOUT)) {
                        const newState = await this.getStateAsync(`${groupInfo.Group}.${groupStates[i].id}`);
                        if (newState) {
                            if (newState.q != 0 && newState.ack) {
                                // Change quality only if it was OK before
                                newState.q = 0x01;
                                this.log.warn(`Watchdog: State ${groupInfo.Group}.${groupStates[i].id} not updated for ${Date.now() - groupStates[i].lastUpdateTs} ms`);
                                this.log.debug(`Watchdog: Set state ${groupInfo.Group}.${groupStates[i].id} to val: ${newState.val}; q: ${newState.q}`);
                                await this.setStateAsync(`${groupInfo.Group}.${groupStates[i].id}`, newState, true);
                            }
                            else {
                                this.log.silly(`Watchdog: Quality of state ${groupInfo.Group}.${groupStates[i].id} not changed, was already set to ${newState.q} and ack is ${newState.ack}!`);
                            }
                        }
                        else {
                            this.log.warn(`Watchdog: State ${groupInfo.Group}.${groupStates[i].id} not found!`);
                        }
                    }
                    else {
                        this.log.silly(`Watchdog: State ${groupInfo.Group}.${groupStates[i].id} last updated ${Date.now() - groupStates[i].lastUpdateTs} ms ago`);
                    }
                }
            }
        }
    }

    //   lastUpdateTs

    /**
     * Otimize state name (i.e. remove forbidden characters for ioBroker state names)
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

