'use strict';

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

const crypto = require('crypto');
const axios = require('axios');

const OA_BaseURI = 'https://openapi.alphaess.com/api';

const ReadAfterWriteTimeoutIntervalInS = 6;

const REQUEST_TIMEOUT = 20000;
const WATCHDOG_TIMER = 60000;

/**
 * Functions and definitions using the Alpha-ESS official "open" API.
 */
class OpenAPI {
    /**
     * @param adapter Adapter object
     */
    constructor(adapter) {
        this.stateInfoList = [
            {
                Group: 'Realtime',
                fnct: this.getLastPowerData.bind(this),
                enabledName: 'oAEnableRealtime',
                intervalName: 'oAIntervalRealtime',
                intervalFactor: 1,
                states: [
                    {
                        alphaAttrName: 'ppv',
                        role: 'value.power',
                        id: 'PV_power_total',
                        name: 'PV power total',
                        type: 'number',
                        unit: 'W',
                    },
                    {
                        alphaAttrName: 'ppv1',
                        role: 'value.power',
                        id: 'PV_power_string_1',
                        name: 'PV power string 1',
                        type: 'number',
                        unit: 'W',
                        dayIndex: false,
                    },
                    {
                        alphaAttrName: 'ppv2',
                        role: 'value.power',
                        id: 'PV_power_string_2',
                        name: 'PV power string 2',
                        type: 'number',
                        unit: 'W',
                        dayIndex: false,
                    },
                    {
                        alphaAttrName: 'ppv3',
                        role: 'value.power',
                        id: 'PV_power_string_3',
                        name: 'PV power string 3',
                        type: 'number',
                        unit: 'W',
                        dayIndex: false,
                    },
                    {
                        alphaAttrName: 'ppv4',
                        role: 'value.power',
                        id: 'PV_power_string_4',
                        name: 'PV power string 4',
                        type: 'number',
                        unit: 'W',
                        dayIndex: false,
                    },
                    {
                        alphaAttrName: 'pmeterDc',
                        role: 'value.power',
                        id: 'PV_power_meter',
                        name: 'PV power meter',
                        type: 'number',
                        unit: 'W',
                        dayIndex: false,
                    },
                    {
                        alphaAttrName: 'pload',
                        role: 'value.power',
                        id: 'Load_total',
                        name: 'Load total',
                        type: 'number',
                        unit: 'W',
                    },
                    {
                        alphaAttrName: 'soc',
                        role: 'value.battery',
                        id: 'Battery_SOC',
                        name: 'State of charge',
                        type: 'number',
                        unit: '%',
                    },
                    {
                        alphaAttrName: 'pmeterL1',
                        role: 'value.power',
                        id: 'Grid_power_L1',
                        name: 'Grid power L1',
                        type: 'number',
                        unit: 'W',
                    },
                    {
                        alphaAttrName: 'pmeterL2',
                        role: 'value.power',
                        id: 'Grid_power_L2',
                        name: 'Grid power L2',
                        type: 'number',
                        unit: 'W',
                    },
                    {
                        alphaAttrName: 'pmeterL3',
                        role: 'value.power',
                        id: 'Grid_power_L3',
                        name: 'Grid power L3',
                        type: 'number',
                        unit: 'W',
                    },
                    {
                        alphaAttrName: 'pgrid',
                        role: 'value.power',
                        id: 'Grid_power_total',
                        name: 'Grid power total',
                        type: 'number',
                        unit: 'W',
                    },
                    {
                        alphaAttrName: 'pbat',
                        role: 'value.power',
                        id: 'Battery_power',
                        name: 'Battery power',
                        type: 'number',
                        unit: 'W',
                    },
                    {
                        alphaAttrName: 'pev',
                        role: 'value.power',
                        id: 'Charging_pile_power_total',
                        name: 'Charging pile (Wallbox) power total',
                        type: 'number',
                        unit: 'W',
                    },
                    {
                        alphaAttrName: 'prealL1',
                        role: 'value.power',
                        id: 'Inverter_power_L1',
                        name: 'Inverter power L1',
                        type: 'number',
                        unit: 'W',
                        dayIndex: false,
                    },
                    {
                        alphaAttrName: 'prealL2',
                        role: 'value.power',
                        id: 'Inverter_power_L2',
                        name: 'Inverter power L2',
                        type: 'number',
                        unit: 'W',
                        dayIndex: false,
                    },
                    {
                        alphaAttrName: 'prealL3',
                        role: 'value.power',
                        id: 'Inverter_power_L3',
                        name: 'Inverter power L3',
                        type: 'number',
                        unit: 'W',
                        dayIndex: false,
                    },
                    {
                        alphaAttrName: 'ev1Power',
                        role: 'value.power',
                        id: 'Charging_pile_power_1',
                        name: 'Charging pile (Wallbox) power 1',
                        type: 'number',
                        unit: 'W',
                        dayIndex: false,
                    },
                    {
                        alphaAttrName: 'ev2Power',
                        role: 'value.power',
                        id: 'Charging_pile_power_2',
                        name: 'Charging pile (Wallbox) power 2',
                        type: 'number',
                        unit: 'W',
                        dayIndex: false,
                    },
                    {
                        alphaAttrName: 'ev3Power',
                        role: 'value.power',
                        id: 'Charging_pile_power_3',
                        name: 'Charging pile (Wallbox) power 3',
                        type: 'number',
                        unit: 'W',
                        dayIndex: false,
                    },
                    {
                        alphaAttrName: 'ev4Power',
                        role: 'value.power',
                        id: 'Charging_pile_power_4',
                        name: 'Charging pile (Wallbox) power 4',
                        type: 'number',
                        unit: 'W',
                        dayIndex: false,
                    },
                ],
            },
            {
                Group: 'Recent',
                fnct: this.getLatestTodayPowerBySn.bind(this),
                enabledName: 'oAEnableRecent',
                intervalFactor: 1, // For scheduled group not used
                isSchedule: true,
                states: [
                    {
                        alphaAttrName: 'ppv',
                        role: 'value.power',
                        id: 'PV_power_total',
                        name: 'PV power total',
                        type: 'number',
                        unit: 'W',
                    },
                    {
                        alphaAttrName: 'load',
                        role: 'value.power',
                        id: 'Load_total',
                        name: 'Load total',
                        type: 'number',
                        unit: 'W',
                    },
                    {
                        alphaAttrName: 'cbat',
                        role: 'value.battery',
                        id: 'Battery_SOC',
                        name: 'State of charge',
                        type: 'number',
                        unit: '%',
                    },
                    {
                        alphaAttrName: 'gridCharge',
                        role: 'value.power',
                        id: 'Grid_power_total_charge',
                        name: 'Grid power total charge',
                        type: 'number',
                        unit: 'W',
                    },
                    {
                        alphaAttrName: 'feedIn',
                        role: 'value.power',
                        id: 'Grid_power_total_feedin',
                        name: 'Grid power total feedin',
                        type: 'number',
                        unit: 'W',
                    },
                    {
                        alphaAttrName: 'pchargingPile',
                        role: 'value.power',
                        id: 'Charging_pile_power_total',
                        name: 'Charging pile (Wallbox) power total',
                        type: 'number',
                        unit: 'W',
                    },
                    {
                        alphaAttrName: 'sysSn',
                        role: 'text',
                        id: 'System_SN',
                        name: 'System S/N',
                        type: 'string',
                        unit: null,
                    },
                ],
            },
            {
                Group: 'System',
                fnct: this.getEssList.bind(this),
                enabledName: 'oAEnableEssList',
                intervalName: 'oAIntervalEssList',
                intervalFactor: 1,
                states: [
                    {
                        alphaAttrName: 'cobat',
                        role: 'value.energy',
                        id: 'Battery_capacity',
                        name: 'Battery capacity',
                        type: 'number',
                        unit: 'kWh',
                    },
                    {
                        alphaAttrName: 'emsStatus',
                        role: 'text',
                        id: 'EMS_status',
                        name: 'EMS status',
                        type: 'string',
                        unit: null,
                    },
                    {
                        alphaAttrName: 'mbat',
                        role: 'text',
                        id: 'Battery_model',
                        name: 'Battery model',
                        type: 'string',
                        unit: null,
                    },
                    {
                        alphaAttrName: 'minv',
                        role: 'text',
                        id: 'Inverter_model',
                        name: 'Inverter model',
                        type: 'string',
                        unit: null,
                    },
                    {
                        alphaAttrName: 'poinv',
                        role: 'value.power',
                        id: 'Inverter_nominal_power',
                        name: 'Inverter nominal Power',
                        type: 'number',
                        unit: 'kW',
                    },
                    {
                        alphaAttrName: 'popv',
                        role: 'value.power',
                        id: 'PV_nominal_power',
                        name: 'PV nominal Power',
                        type: 'number',
                        unit: 'kW',
                    },
                    {
                        alphaAttrName: 'surplusCobat',
                        role: 'value.energy',
                        id: 'Battery_capacity_remaining',
                        name: 'Battery capacity remaining',
                        type: 'number',
                        unit: 'kWh',
                    },
                    {
                        alphaAttrName: 'usCapacity',
                        role: 'value',
                        id: 'Battery_available_percentage',
                        name: 'Battery Available Percentage',
                        type: 'number',
                        unit: '%',
                    },
                    {
                        alphaAttrName: 'sysSn',
                        role: 'text',
                        id: 'System_SN',
                        name: 'System S/N',
                        type: 'string',
                        unit: null,
                    },
                ],
            },
            {
                Group: 'Energy',
                fnct: this.getOneDateEnergyBySn.bind(this),
                enabledName: 'oAEnableEnergy',
                intervalName: 'oAIntervalEnergyMins',
                intervalFactor: 60,
                states: [
                    {
                        alphaAttrName: 'eCharge',
                        role: 'value.power.consumption',
                        id: 'Battery_charge_today',
                        name: "Today's battery charge",
                        type: 'number',
                        unit: 'kWh',
                    },
                    {
                        alphaAttrName: 'eDischarge',
                        role: 'value.power.consumption',
                        id: 'Battery_discharge_today',
                        name: "Today's battery discharge",
                        type: 'number',
                        unit: 'kWh',
                    },
                    {
                        alphaAttrName: 'eChargingPile',
                        role: 'value.power.consumption',
                        id: 'Charging_pile',
                        name: 'Charging pile (Wallbox)',
                        type: 'number',
                        unit: 'kWh',
                    },
                    {
                        alphaAttrName: 'eGridCharge',
                        role: 'value.power.consumption',
                        id: 'Grid_charge',
                        name: 'Grid charge',
                        type: 'number',
                        unit: 'kWh',
                    },
                    {
                        alphaAttrName: 'eInput',
                        role: 'value.power.consumption',
                        id: 'Grid_consumption_today',
                        name: "Today's grid consumption",
                        type: 'number',
                        unit: 'kWh',
                    },
                    {
                        alphaAttrName: 'eOutput',
                        role: 'value.power.consumption',
                        id: 'Grid_feed_in_today',
                        name: "Today's grid feed in",
                        type: 'number',
                        unit: 'kWh',
                    },
                    {
                        alphaAttrName: 'epv',
                        role: 'value.power.consumption',
                        id: 'Generation_today',
                        name: "Today's generation",
                        type: 'number',
                        unit: 'kWh',
                    },
                ],
            },
            {
                Group: 'Settings_Charge',
                fnct: this.getChargeConfigInfo.bind(this),
                writeFnct: this.writeConfigInfo.bind(this),
                writeTimeoutIntervalInS: 5,
                requestName: 'updateChargeConfigInfo',
                enabledName: 'oAEnableSettingsCharge',
                intervalName: 'oAIntervalSettingsChargeMins',
                intervalFactor: 60,
                states: [
                    {
                        alphaAttrName: 'gridCharge',
                        role: 'switch.enable',
                        id: 'Battery_Charging_enabled',
                        name: 'Battery Charging enabled',
                        type: 'boolean',
                        unit: '',
                        writeable: true,
                    },
                    {
                        alphaAttrName: 'timeChaf1',
                        role: 'value',
                        id: 'Charging_period_1_start',
                        name: 'Charging period 1 start',
                        type: 'string',
                        unit: '',
                        writeable: true,
                    },
                    {
                        alphaAttrName: 'timeChae1',
                        role: 'value',
                        id: 'Charging_period 1_end',
                        name: 'Charging period 1 end',
                        type: 'string',
                        unit: '',
                        writeable: true,
                    },
                    {
                        alphaAttrName: 'timeChaf2',
                        role: 'value',
                        id: 'Charging_period_2_start',
                        name: 'Charging period 2 start',
                        type: 'string',
                        unit: '',
                        writeable: true,
                    },
                    {
                        alphaAttrName: 'timeChae2',
                        role: 'value',
                        id: 'Charging_period_2_end',
                        name: 'Charging period 2 end',
                        type: 'string',
                        unit: '',
                        writeable: true,
                    },
                    {
                        alphaAttrName: 'batHighCap',
                        role: 'value',
                        id: 'Charging_stopps_at_SOC',
                        name: 'Charging stopps at SOC',
                        type: 'number',
                        unit: '%',
                        writeable: true,
                    },
                ],
            },
            {
                Group: 'Settings_Discharge',
                fnct: this.getDisChargeConfigInfo.bind(this),
                writeFnct: this.writeConfigInfo.bind(this),
                writeTimeoutIntervalInS: 5,
                requestName: 'updateDisChargeConfigInfo',
                enabledName: 'oAEnableSettingsDischarge',
                intervalName: 'oAIntervalSettingsDischargeMins',
                intervalFactor: 60,
                states: [
                    {
                        alphaAttrName: 'ctrDis',
                        role: 'switch.enable',
                        id: 'Battery_Discharging_enabled',
                        name: 'Battery Discharging enabled',
                        type: 'boolean',
                        unit: '',
                        writeable: true,
                    },
                    {
                        alphaAttrName: 'timeDisf1',
                        role: 'value',
                        id: 'Discharging_period_1_start',
                        name: 'Discharging period 1 start',
                        type: 'string',
                        unit: '',
                        writeable: true,
                    },
                    {
                        alphaAttrName: 'timeDise1',
                        role: 'value',
                        id: 'Discharging_period_1_end',
                        name: 'Discharging period 1 end',
                        type: 'string',
                        unit: '',
                        writeable: true,
                    },
                    {
                        alphaAttrName: 'timeDisf2',
                        role: 'value',
                        id: 'Discharging_period_2_start',
                        name: 'Discharging period 2 start',
                        type: 'string',
                        unit: '',
                        writeable: true,
                    },
                    {
                        alphaAttrName: 'timeDise2',
                        role: 'value',
                        id: 'Discharging_period_2_end',
                        name: 'Discharging period 2 end',
                        type: 'string',
                        unit: '',
                        writeable: true,
                    },
                    {
                        alphaAttrName: 'batUseCap',
                        role: 'value',
                        id: 'Discharging_Cutoff_SOC',
                        name: 'Discharging Cutoff SOC',
                        type: 'number',
                        unit: '%',
                        writeable: true,
                    },
                ],
            },
            {
                Group: 'Summary',
                fnct: this.getSumDataForCustomer.bind(this),
                enabledName: 'oAEnableSummary',
                intervalName: 'oAIntervalSummaryMins',
                intervalFactor: 60,
                states: [
                    {
                        alphaAttrName: 'epvtoday',
                        role: 'value.power.consumption',
                        id: 'Generation_today',
                        name: "Today's Generation",
                        type: 'number',
                        unit: 'kWh',
                        round: 3,
                    },
                    {
                        alphaAttrName: 'epvtotal',
                        role: 'value.power.consumption',
                        id: 'Generation_total',
                        name: 'Total Generation',
                        type: 'number',
                        unit: 'kWh',
                        round: 3,
                    },
                    {
                        alphaAttrName: 'todayIncome',
                        role: 'value',
                        id: 'Income_today',
                        name: "Today's Income",
                        type: 'number',
                        unit: '{moneyType}',
                        round: 2,
                    },
                    {
                        alphaAttrName: 'totalIncome',
                        role: 'value',
                        id: 'Income_total',
                        name: 'Total Profit',
                        type: 'number',
                        unit: '{moneyType}',
                        round: 2,
                    },
                    {
                        alphaAttrName: 'eselfConsumption',
                        role: 'value',
                        id: 'Self_consumption_total',
                        name: 'Total Self Consumption',
                        type: 'number',
                        unit: '%',
                        factor: 100,
                        round: 1,
                    },
                    {
                        alphaAttrName: 'eselfSufficiency',
                        role: 'value',
                        id: 'Self_sufficiency_total',
                        name: 'Total Self Sufficiency',
                        type: 'number',
                        unit: '%',
                        factor: 100,
                        round: 1,
                    },
                    {
                        alphaAttrName: 'treeNum',
                        role: 'value',
                        id: 'Trees_plantet_total',
                        name: 'Total Trees planted',
                        type: 'number',
                        unit: '🌳',
                        round: 1,
                    },
                    {
                        alphaAttrName: 'carbonNum',
                        role: 'value',
                        id: 'CO2_reduction_total',
                        name: 'Total CO₂ reduction',
                        type: 'number',
                        unit: 'kg',
                        round: 1,
                    },
                    {
                        alphaAttrName: 'moneyType',
                        role: 'value',
                        id: 'Currency',
                        name: 'Currency',
                        type: 'string',
                        unit: '',
                    },
                    {
                        alphaAttrName: 'eload',
                        role: 'value.power.consumption',
                        id: 'Consumption_today',
                        name: "Today's consumption",
                        type: 'number',
                        unit: 'kWh',
                    },
                    {
                        alphaAttrName: 'eoutput',
                        role: 'value.power.consumption',
                        id: 'Grid_feed_in_today',
                        name: "Today's grid feed in",
                        type: 'number',
                        unit: 'kWh',
                    },
                    {
                        alphaAttrName: 'einput',
                        role: 'value.power.consumption',
                        id: 'Grid_consumption_today',
                        name: "Today's grid consumption",
                        type: 'number',
                        unit: 'kWh',
                    },
                    {
                        alphaAttrName: 'echarge',
                        role: 'value.power.consumption',
                        id: 'Battery_charge_today',
                        name: "Today's battery charge",
                        type: 'number',
                        unit: 'kWh',
                    },
                    {
                        alphaAttrName: 'edischarge',
                        role: 'value.power.consumption',
                        id: 'Battery_discharge_today',
                        name: "Today's battery discharge",
                        type: 'number',
                        unit: 'kWh',
                    },
                ],
            },
            {
                Group: 'Wallbox',
                fnct: this.getWallboxData.bind(this),
                writeFnct: this.writeWallboxChargerControl.bind(this),
                writeTimeoutIntervalInS: 0,
                requestName: 'remoteControlEvCharger',
                enabledName: 'oAEnableWallbox',
                intervalName: 'oAIntervalWallboxMins',
                intervalFactor: 60,
                states: [
                    {
                        alphaAttrName: 'evchargerSn',
                        role: 'value',
                        id: 'SN',
                        name: 'Wallbox serial number',
                        type: 'string',
                        unit: '',
                        isStatic: true,
                    },
                    {
                        alphaAttrName: 'evchargerModel',
                        role: 'value',
                        id: 'Model',
                        name: 'Wallbox model',
                        type: 'string',
                        unit: '',
                        isStatic: true,
                    },
                    {
                        alphaAttrName: 'remoteControlEvChargerStart',
                        role: 'button.start',
                        id: 'Charging_Start',
                        name: 'Charging Start',
                        type: 'boolean',
                        unit: '',
                        isStatic: true,
                        writeable: true,
                        readable: false,
                    },
                    {
                        alphaAttrName: 'remoteControlEvChargerStop',
                        role: 'button.stop',
                        id: 'Charging_Stop',
                        name: 'Charging Stop',
                        type: 'boolean',
                        unit: '',
                        isStatic: true,
                        writeable: true,
                        readable: false,
                    },
                    {
                        alphaAttrName: 'evchargerStatus',
                        role: 'value',
                        id: 'Status',
                        name: 'Wallbox status',
                        type: 'number',
                        unit: '',
                        states: {
                            0: '0 - Unknown',
                            1: '1 - Available state (not plugged in)',
                            2: '2 - Preparing state of insertion (plugged in and not activated)',
                            3: '3 - Charging state (charging with power output)',
                            4: '4 - SuspendedEVSE pile Suspended at the terminal (already started but no available power)',
                            5: '5 - SuspendedEV Suspended at the vehicle end (with available power, waiting for the car to respond)',
                            6: '6 - Finishing The charging end state (actively swiping the card to stop or EMS stop control)',
                            7: '7 - Unknown',
                            8: '8 - Unknown',
                            9: '9 - Faulted fault state (pile failure)',
                        },
                    },
                ],
            },
        ];

        this.adapter = adapter;
        this.emptyBody = { data: null };
    }

    /**
     * @param timestamp Timestamp for signature calculation
     */
    getSignature(timestamp) {
        return crypto
            .createHash('sha512')
            .update(this.adapter.config.appID + this.adapter.config.appSecret + timestamp)
            .digest('hex');
    }

    /**
     * @param headers Initial header attributes
     */
    async addAuthHeaders(headers) {
        const timestamp = Math.floor(Date.now() / 1000);
        const sign = this.getSignature(timestamp);
        headers['appId'] = this.adapter.config.appID;
        headers['timestamp'] = `${timestamp}`;
        headers['sign'] = sign;

        return headers;
    }

    /**
     * @param path Path for request
     * @param headers Headers for request
     */
    async getRequest(path, headers) {
        try {
            const url = `${OA_BaseURI}/${path}`;
            headers = await this.addAuthHeaders(headers);

            const res = await axios.get(url, {
                timeout: REQUEST_TIMEOUT,
                headers: headers,
            });
            return res;
        } catch (e) {
            this.adapter.log.debug(`Error performing get request ${path}: ${e}`);
            return this.emptyBody;
        }
    }

    /**
     * @param path Path for request
     * @param sndBody Body for request
     * @param headers Headers for request
     */
    async postRequest(path, sndBody, headers) {
        try {
            const url = `${OA_BaseURI}/${path}`;
            headers = await this.addAuthHeaders(headers);

            const res = await axios.post(url, sndBody, {
                timeout: REQUEST_TIMEOUT,
                headers: headers,
            });

            return res;
        } catch (e) {
            this.adapter.log.error(`Error performing post request ${path}: ${e}`);
            return this.emptyBody;
        }
    }

    /**
     * @param group Group name
     */
    async getLastPowerData(group) {
        try {
            await this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug(`Fetching ${group} data...`);

            const res = await this.getRequest(`getLastPowerData?sysSn=${this.adapter.config.systemId}`, {});
            if (res && res['status'] == 200 && res.data && res.data.data) {
                await this.adapter.createAndUpdateStates(group, res.data.data);
            } else {
                await this.handleError(res, group);
            }
        } catch (e) {
            this.adapter.log.error(`Fetching data for group ${group}: Exception occurred: ${e}`);
            await this.handleError(this.emptyBody, group);
        }
        await this.startGroupTimeout(group);
    }

    /**
     * @param group Group name
     */
    async getLatestTodayPowerBySn(group) {
        try {
            await this.adapter.stopGroupTimeout(group);
            this.adapter.log.debug(`Fetching ${group} data...`);

            const dt = new Date();
            const dts = `${dt.getFullYear()}-${`0${dt.getMonth() + 1}`.slice(-2)}-${`0${dt.getDate()}`.slice(-2)}`;
            const res = await this.getRequest(
                `getOneDayPowerBySn?sysSn=${this.adapter.config.systemId}&queryDate=${dts}`,
                {},
            );
            if (res && res['status'] == 200 && res.data && res.data.data) {
                const latestEntry = res.data.data.reduce((latest, current) => {
                    return new Date(current.uploadTime) > new Date(latest.uploadTime) ? current : latest;
                });
                if (latestEntry.uploadTime != null) {
                    const deliveredTs = new Date(latestEntry.uploadTime.replace(' ', 'T')).getTime();
                    if (Date.now() - deliveredTs < 300000) {
                        // ensure that the data is not older than 5 minutes
                        await this.adapter.createAndUpdateStates(group, latestEntry);
                    } else {
                        this.adapter.log.error(
                            `Time received for data of group ${group} is too old or invalid (${latestEntry.uploadTime})! States not updated!`,
                        );
                    }
                } else {
                    this.adapter.log.error(`No time received for data of group ${group}! States not updated!`);
                }
            } else {
                await this.handleError(res, group);
            }
        } catch (e) {
            this.adapter.log.error(`Fetching data for group ${group}: Exception occurred: ${e}`);
            await this.handleError(this.emptyBody, group);
        }
        await this.startGroupTimeout(group);
    }

    async getEssList(group) {
        try {
            await this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug(`Fetching ${group} data...`);

            const res = await this.getRequest('getEssList', {});
            if (res && res['status'] == 200 && res.data && res.data.data) {
                await this.adapter.createAndUpdateStates(group, res.data.data);
            } else {
                await this.handleError(res, group);
            }
        } catch (e) {
            this.adapter.log.error(`Fetching data for group ${group}: Exception occurred: ${e}`);
            await this.handleError(this.emptyBody, group);
        }
        await this.startGroupTimeout(group);
    }

    /**
     * @param group Group name
     */
    async getOneDateEnergyBySn(group) {
        try {
            await this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug(`Fetching ${group} data...`);

            const dt = new Date();
            const dts = `${dt.getFullYear()}-${`0${dt.getMonth() + 1}`.slice(-2)}-${`0${dt.getDate()}`.slice(-2)}`;
            const res = await this.getRequest(
                `getOneDateEnergyBySn?sysSn=${this.adapter.config.systemId}&queryDate=${dts}`,
                {},
            );
            if (res && res['status'] == 200 && res.data && res.data.data) {
                await this.adapter.createAndUpdateStates(group, res.data.data);
            } else {
                await this.handleError(res, group);
            }
        } catch (e) {
            this.adapter.log.error(`Fetching data for group ${group}: Exception occurred: ${e}`);
            await this.handleError(this.emptyBody, group);
        }
        await this.startGroupTimeout(group);
    }

    /**
     * @param group Group name
     */
    async getChargeConfigInfo(group) {
        try {
            await this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug(`Fetching ${group} data...`);

            const res = await this.getRequest(`getChargeConfigInfo?sysSn=${this.adapter.config.systemId}`, {});
            if (res && res['status'] == 200 && res.data && res.data.data) {
                await this.adapter.createAndUpdateStates(group, res.data.data);
            } else {
                await this.handleError(res, group);
            }
        } catch (e) {
            this.adapter.log.error(`Fetching data for group ${group}: Exception occurred: ${e}`);
            await this.handleError(this.emptyBody, group);
        }
        await this.startGroupTimeout(group);
    }

    /**
     * @param group Group name to fetch data for
     */
    async getDisChargeConfigInfo(group) {
        try {
            await this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug(`Fetching ${group} data...`);

            const res = await this.getRequest(`getDisChargeConfigInfo?sysSn=${this.adapter.config.systemId}`, {});
            if (res && res['status'] == 200 && res.data && res.data.data) {
                await this.adapter.createAndUpdateStates(group, res.data.data);
            } else {
                await this.handleError(res, group);
            }
        } catch (e) {
            this.adapter.log.error(`Fetching data for group ${group}: Exception occurred: ${e}`);
            await this.handleError(this.emptyBody, group);
        }
        await this.startGroupTimeout(group);
    }

    /**
     * @param group Group name
     */
    async getSumDataForCustomer(group) {
        try {
            await this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug(`Fetching ${group} data...`);

            const dt = new Date();
            const dts = `${dt.getFullYear()}-${`0${dt.getMonth() + 1}`.slice(-2)}-${`0${dt.getDate()}`.slice(-2)}`;
            const res = await this.getRequest(
                `getSumDataForCustomer?sysSn=${this.adapter.config.systemId}&queryDate=${dts}`,
                {},
            );
            if (res && res['status'] == 200 && res.data && res.data.data) {
                await this.adapter.createAndUpdateStates(group, res.data.data);
            } else {
                await this.handleError(res, group);
            }
        } catch (e) {
            this.adapter.log.error(`Fetching data for group ${group}: Exception occurred: ${e}`);
            await this.handleError(this.emptyBody, group);
        }
        await this.startGroupTimeout(group);
    }

    /**
     * @param group Group name
     */
    async getWallboxData(group) {
        try {
            await this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug(`Fetching ${group} data...`);
            // First we need to get SN if not already done:
            let snState = await this.adapter.getStateAsync(`${group}.SN`);
            if (!snState || (typeof snState.val === 'string' && snState.val.length == 0)) {
                await this.getWallboxSn(group);
                snState = await this.adapter.getStateAsync(`${group}.SN`);
                // In this special case we reset the created indicator because more states must be created for this group in the next step
                this.adapter.createdStates[group] = false;
            }

            if (snState && typeof snState.val === 'string' && snState.val.length > 0) {
                this.adapter.log.debug(`Using Wallbox SN: ${snState.val}`);
                const res = await this.getRequest(
                    `getEvChargerStatusBySn?sysSn=${this.adapter.config.systemId}&evchargerSn=${snState.val}`,
                    {},
                );
                if (res && res['status'] == 200 && res.data && res.data.data) {
                    await this.adapter.createAndUpdateStates(group, res.data.data);
                } else {
                    await this.handleError(res, group);
                }
            } else {
                this.adapter.log.error('No wallbox SN could be  found!');
            }
        } catch (e) {
            this.adapter.log.error(`Fetching data for group ${group}: Exception occurred: ${e}`);
            await this.handleError(this.emptyBody, group);
        }
        await this.startGroupTimeout(group);
    }

    /**
     * @param group Group name
     */
    async getWallboxSn(group) {
        try {
            this.adapter.log.debug('Fetching Wallbox SN ...');

            const res = await this.getRequest(`getEvChargerConfigList?sysSn=${this.adapter.config.systemId}`, {});
            if (res && res['status'] == 200 && res.data && res.data.data) {
                if (res.data.data.length > 1) {
                    this.adapter.log.warn(
                        'More than one wallbox found! Only the first wallbox is currently supported by this adapter!',
                    );
                }
                await this.adapter.createAndUpdateStates(group, res.data.data[0]);
            } else {
                await this.handleError(res, group);
            }
        } catch (e) {
            this.adapter.log.error(`Fetching Wallbox SN: Exception occurred: ${e}`);
            await this.handleError(this.emptyBody, group);
        }
    }

    /**
     * @param group Group name
     * @param _updState Not used
     * @param _updStateInfo Not used
     */
    async writeConfigInfo(group, _updState, _updStateInfo) {
        try {
            this.adapter.stopGroupWriteTimeout(group);
            await this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug(`Writing ${group} data...`);

            const body = {};
            const gidx = this.stateInfoList.findIndex(i => i.Group == group);
            if (gidx >= 0) {
                const groupStates = this.stateInfoList[gidx].states;
                for (let i = 0; i < groupStates.length; i++) {
                    // Ensure that watchdog does not fire, because timeout may be delayed
                    groupStates[i].lastUpdateTs = Date.now();
                    this.adapter.log.debug(`State ${group}.${groupStates[i].alphaAttrName} - ${groupStates[i].id}`);
                    const state = await this.adapter.getStateAsync(`${group}.${groupStates[i].id}`);
                    let value = null;
                    if (state) {
                        value = state.val;
                    }
                    body[groupStates[i].alphaAttrName] = groupStates[i].type != 'boolean' ? value : value ? 1 : 0;
                }
            }
            body['sysSn'] = this.adapter.config.systemId;

            this.adapter.log.debug(`Write group ${group}: ${JSON.stringify(body)}`);

            const requestName = this.adapter.getStateInfoList()[gidx].requestName;
            if (requestName) {
                const res = await this.postRequest(requestName, body, {});
                if (res && res['status'] == 200 && res.data) {
                    this.adapter.log.info(`Written values fror group ${group}`);
                } else {
                    await this.handleError(res, group);
                }
            } else {
                this.adapter.log.error(`Internal Error for group ${group}: No requestName found!`);
            }
        } catch (e) {
            this.adapter.log.error(`Writing data for group ${group}: Exception occurred: ${e}`);
            await this.handleError(this.emptyBody, group);
        }
        this.adapter.startGroupTimeout(ReadAfterWriteTimeoutIntervalInS, group);
    }

    /**
     * @param group Group name
     * @param _updState Not used
     * @param updStateInfo Info object for state
     */
    async writeWallboxChargerControl(group, _updState, updStateInfo) {
        try {
            this.adapter.stopGroupWriteTimeout(group);
            await this.adapter.stopGroupTimeout(group);

            this.adapter.log.debug(`Writing ${group} data...`);

            const gidx = this.stateInfoList.findIndex(i => i.Group == group);
            if (gidx >= 0) {
                const chargerSnState = await this.adapter.getStateAsync(`${group}.SN`);

                if (chargerSnState) {
                    this.adapter.log.debug(`Using Wallbox SN: ${chargerSnState.val}`);

                    const body = {};

                    if (updStateInfo.role == 'button.start') {
                        body['controlMode'] = 1;
                    } else {
                        body['controlMode'] = 0;
                    }

                    body['sysSn'] = this.adapter.config.systemId;
                    body['evchargerSn'] = chargerSnState.val;

                    this.adapter.log.debug(`Write group ${group}: ${JSON.stringify(body)}`);

                    const requestName = this.adapter.getStateInfoList()[gidx].requestName;
                    if (requestName) {
                        const res = await this.postRequest(requestName, body, {});
                        if (res && res['status'] == 200 && res.data) {
                            this.adapter.log.info(`Written values fror group ${group}`);
                        } else {
                            await this.handleError(res, group);
                        }
                    } else {
                        this.adapter.log.error(`Internal Error for group ${group}: No requestName found!`);
                    }
                } else {
                    this.adapter.log.error(`State ${group}.evchargerSn not found!`);
                }
            }
        } catch (e) {
            this.adapter.log.error(`Writing data for group ${group}: Exception occurred: ${e}`);
            await this.handleError(this.emptyBody, group);
        }
        this.adapter.startGroupTimeout(ReadAfterWriteTimeoutIntervalInS, group);
    }

    /**
     * @param group Group name
     */
    async startGroupTimeout(group) {
        if (!this.adapter.wrongCredentials) {
            const gidx = this.stateInfoList.findIndex(i => i.Group == group);
            if (gidx >= 0 && this.stateInfoList[gidx].interval > 0) {
                const intervalInS = this.stateInfoList[gidx].interval;
                this.adapter.startGroupTimeout(intervalInS, group);
            } else {
                this.adapter.log.error(`Internal Error for group ${group}: No timeout configuration found!`);
                await this.handleError(this.emptyBody, group);
            }
        } else {
            this.adapter.log.debug(`Group ${group}: No new timer started, wrong credentials!`);
        }
    }

    /**
     * @param res Result object of performed request operation
     * @param group Group name
     */
    async handleError(res, group) {
        await this.adapter.setStateChangedAsync('info.connection', false, true);
        this.adapter.errorCount++;
        if (res.data && res.data.code && res.data.code != 0) {
            this.adapter.log.error(`Alpha ESS Api returns an error! Group: ${group}`);
            switch (res.data.code) {
                case 6001:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - Parameter error (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6002:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - The SN is not bound to the user (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6003:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - You have bound this SN (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6004:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - CheckCode error (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6005:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - This appId is not bound to the SN (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6006:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - Timestamp error (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6007:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - Sign verification error (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6008:
                    this.adapter.log.error(`Error code: ${res.data.code} - Set failed (#${this.adapter.errorCount})`);
                    break;
                case 6009:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - Whitelist verification failed (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6010:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - Sign is empty (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6011:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - timestamp is empty (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6012:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - AppId is empty (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6016:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - Data does not exist or has been deleted (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6026:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - Internal Error (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6029:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - operation failed (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6038:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - system sn does not exist (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6042:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - system offline (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6046:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - Verification code error (#${this.adapter.errorCount})`,
                    );
                    break;
                case 6053:
                    this.adapter.log.error(
                        `Error code: ${res.data.code} - The request was too fast, please try again later (#${this.adapter.errorCount})`,
                    );
                    break;
                default:
                    this.adapter.log.info(`Error code: ${res.data.code} - Unknown error (#${this.adapter.errorCount})`);
            }
            if (
                res.data.code == 6002 ||
                res.data.code == 6003 ||
                res.data.code == 6005 ||
                res.data.code == 6007 ||
                res.data.code == 6010 ||
                res.data.code == 6011 ||
                res.data.code == 6012 ||
                res.data.code == 6046
            ) {
                this.adapter.log.error(" Adapter won't try again to fetch any data.");
                this.adapter.wrongCredentials = true;
            }
            await this.adapter.setQualityForGroup(group, 0x44);
        } else {
            this.adapter.log.debug(
                `Unknown error occurred: ${JSON.stringify(res.data)} (#${this.adapter.errorCount}) Group:${group}`,
            );
            await this.adapter.setQualityForGroup(group, 0x2);
        }
    }
}

class AlphaEss extends utils.Adapter {
    /**
     * @param [options] Options
     */
    constructor(options) {
        super({
            ...options,
            name: 'alpha-ess',
        });

        this.jsonConfig = require('./admin/jsonConfig.json');

        this.openApi = new OpenAPI(this);

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

            this.log.debug('Used API:                              Open API');
            this.log.debug(`config appID:                          ${this.config.appID}`);
            this.log.debug(`config systemId:                       ${this.config.systemId}`);
            this.log.debug(`config oAIntervalRealtime:             ${this.config.oAIntervalRealtime}`);
            this.log.debug(`config oAIntervalEnergyMins:           ${this.config.oAIntervalEnergyMins}`);
            this.log.debug(`config oAIntervalEnergyMins:           ${this.config.oAIntervalEssList}`);
            this.log.debug(`config oAIntervalSettingsChargeMins    ${this.config.oAIntervalSettingsChargeMins}`);
            this.log.debug(`config oAIntervalSettingsDischargeMins ${this.config.oAIntervalSettingsDischargeMins}`);
            this.log.debug(`config oAIntervalSummaryMins:          ${this.config.oAIntervalSummaryMins}`);
            this.log.debug(`config oAIntervalWallboxMins:          ${this.config.oAIntervalWallboxMins}`);
            this.log.debug(`config oAEnableRealtime:               ${this.config.oAEnableRealtime}`);
            this.log.debug(`config oAEnableRealtime:               ${this.config.oAEnableRecent}`);
            this.log.debug(`config oAEnableEnergy:                 ${this.config.oAEnableEnergy}`);
            this.log.debug(`config oAEnableEnergy:                 ${this.config.oAEnableEssList}`);
            this.log.debug(`config oAEnableSettingsCharge:         ${this.config.oAEnableSettingsCharge}`);
            this.log.debug(`config oAEnableSettingsCharge:         ${this.config.oAEnableSettingsCharge}`);
            this.log.debug(`config oAEnableSettingsDischarge:      ${this.config.oAEnableSettingsDischarge}`);
            this.log.debug(`config oAEnableSummary:                ${this.config.oAEnableSummary}`);
            this.log.debug(`config oAEnableWallbox:                ${this.config.oAEnableWallbox}`);
            this.log.debug(`config updateUnchangedStates:          ${this.config.updateUnchangedStates}`);

            this.wrongCredentials = false;

            await this.setObjectNotExistsAsync('info.version', {
                type: 'state',
                common: {
                    name: 'Adapter Version',
                    type: 'string',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });

            if (await this.isMigrationNecessary()) {
                this.log.info('States will be migrated.');

                // Remove no longer supported groups:
                await this.delObjectAsync('Settings', { recursive: true });
                await this.delObjectAsync('StatisticsToday', { recursive: true });

                if (this.config['apiType'] == 0) {
                    this.log.error(
                        'ClosedAPI is not longer supported! Please enter OpenAPI credentials in settings dialog if not already done!',
                    );
                }
            }

            if (this.config.appID && this.config.appSecret && this.config.systemId) {
                for (const gidx of Object.keys(this.getStateInfoList())) {
                    const groupInfo = this.getStateInfoList()[gidx];

                    if (groupInfo.isSchedule) {
                        groupInfo.interval = 300; // 5 Minutes, used for watchdog only
                    } else {
                        groupInfo.interval = this.config[groupInfo.intervalName] * groupInfo.intervalFactor;
                        this.log.debug(`${groupInfo.intervalName}: ${groupInfo.interval}`);

                        if (
                            this.jsonConfig.items[groupInfo.intervalName] &&
                            this.jsonConfig.items[groupInfo.intervalName].min
                        ) {
                            if (
                                groupInfo.interval <
                                this.jsonConfig.items[groupInfo.intervalName].min * groupInfo.intervalFactor
                            ) {
                                const oldVal = groupInfo.interval;
                                groupInfo.interval =
                                    this.jsonConfig.items[groupInfo.intervalName].min * groupInfo.intervalFactor;
                                if (this.config[groupInfo.enabledName]) {
                                    this.log.warn(
                                        `Configured interval ${oldVal} for ${groupInfo.Group} no longer supported. Changed to ${groupInfo.interval}. Please change your configuration!`,
                                    );
                                }
                            }
                        }
                    }
                    if (this.config[groupInfo.enabledName]) {
                        await this.setQualityForGroup(groupInfo.Group, 0x2);
                        await groupInfo.fnct(groupInfo.Group);
                    } else {
                        this.log.info(
                            `${groupInfo.Group} data disabled! Adapter won't fetch ${
                                groupInfo.Group
                            } data. According states deleted.`,
                        );
                        await this.delObjectAsync(groupInfo.Group, { recursive: true });
                    }
                }
            } else {
                this.log.error("Open API: No appID, appSecret and/or system ID set! Adapter won't fetch any data.");
            }
            this.watchDogIntervalHandle = this.setInterval(this.watchDogFunction, WATCHDOG_TIMER);
            this.log.debug('Watchdog interval started!');

            await this.setState('info.version', `${this.version}`, true);
        } catch (e) {
            this.log.error(`onReady Exception occurred: ${e}`);
        }
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback Callback
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

            callback();
        } catch {
            callback();
        }
    }

    /**
     * Is called if a subscribed state changes
     *
     * @param id Id of the state
     * @param state state
     */
    onStateChange(id, state) {
        if (state) {
            if (!state.ack) {
                const lastIdx = id.lastIndexOf('.');
                const group = id.substring(id.lastIndexOf('.', lastIdx - 1) + 1, lastIdx);
                const attribute = id.substring(lastIdx + 1);
                this.log.debug(
                    `group: ${group}, attribute: ${attribute}, state ${id} changed: ${state.val} (ack = ${state.ack})`,
                );

                const stateInfo = this.getStateInfoById(group, attribute);
                if (stateInfo) {
                    if (!stateInfo['validationInProgress']) {
                        this.log.debug(`Validate ${id}`);
                        this.stopGroupTimeout(group);
                        this.stopGroupWriteTimeout(group);

                        this.verifyValue(state.val, group, stateInfo);

                        const gidx = this.getStateInfoList().findIndex(i => i.Group == group);

                        if (gidx >= 0) {
                            const writeTimeOut = this.getStateInfoList()[gidx].writeTimeoutIntervalInS;
                            this.startGroupWriteTimeout(writeTimeOut ? writeTimeOut : 0, group, state, stateInfo);
                        }
                    } else {
                        this.log.debug(`Validation already in progress: ${id}`);
                        stateInfo['validationInProgress'] = false;
                    }
                } else {
                    this.log.warn(`Internal problem: No definition for ${group}.${id} found!`);
                }
            }
        } else {
            // The state was deleted
            this.log.debug(`state ${id} deleted`);
        }
    }

    /**
     * @param value Value
     * @param group Group name
     * @param stateInfo Info object belonging to the state
     */
    verifyValue(value, group, stateInfo) {
        if (stateInfo.unit == '%') {
            let newValue = Math.round(value);
            if (newValue > 100) {
                newValue = 100;
            } else if (newValue < 5) {
                newValue = 5;
            }
            if (value != newValue) {
                stateInfo['validationInProgress'] = true;
                this.setState(`${group}.${this.osn(stateInfo.id)}`, newValue, false);
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
                    } else if (hour > 23) {
                        hour = 23;
                    }
                }
                if (parts.length > 1) {
                    // at least two partes, we use the first two parts and ignore the rest
                    const minute = parseInt(parts[1]);
                    if (!isNaN(minute)) {
                        if (minute <= 7) {
                            minuteStr = '00';
                        } else if (minute > 7 && minute <= 22) {
                            minuteStr = '15';
                        } else if (minute <= 37 && minute > 22) {
                            minuteStr = '30';
                        } else {
                            minuteStr = '45';
                        }
                    }
                }
                newValue = `${`0${hour}`.slice(-2)}:${minuteStr}`;
                if (value != newValue) {
                    stateInfo['validationInProgress'] = true;
                    this.setState(`${group}.${this.osn(stateInfo.id)}`, newValue, false);
                    this.log.debug(`Replaced value ${value} with ${newValue} for ${group}.${this.osn(stateInfo.id)}`);
                }
            }
        }
    }

    getStateInfoList() {
        return this.openApi.stateInfoList;
    }

    /**
     * Stop a timer for a given group
     *
     * @param group Group name
     */
    stopGroupTimeout(group) {
        const gidx = this.getStateInfoList().findIndex(i => i.Group == group);
        if (this.getStateInfoList()[gidx].timeoutHandle) {
            this.log.debug(`Timeout cleared for group ${group}`);
            this.clearTimeout(this.getStateInfoList()[gidx].timeoutHandle);
            this.getStateInfoList()[gidx].timeoutHandle = 0;
        }
    }

    /**
     * Start a timer for a given group
     *
     * @param intervalInS Interval in seconds
     * @param group Group name
     */
    startGroupTimeout(intervalInS, group) {
        const gidx = this.getStateInfoList().findIndex(i => i.Group == group);
        const groupInfo = this.getStateInfoList()[gidx];
        if (!groupInfo.timeoutHandle) {
            const interval = this.calculateIntervalInMs(intervalInS, groupInfo);
            this.log.debug(`Timeout with interval ${interval} ms started for group ${group}`);
            groupInfo.timeoutHandle = this.setTimeout(() => {
                groupInfo.fnct(group);
            }, interval);
        }
    }

    /**
     * Stop a timer for a given group
     *
     * @param group Group name
     */
    stopGroupWriteTimeout(group) {
        const gidx = this.getStateInfoList().findIndex(i => i.Group == group);
        if (this.getStateInfoList()[gidx].writeTimeoutHandle) {
            this.log.debug(`Write Timeout cleared for group ${group}`);
            this.clearTimeout(this.getStateInfoList()[gidx].writeTimeoutHandle);
            this.getStateInfoList()[gidx].writeTimeoutHandle = 0;
        }
    }

    /**
     * Start a timer for a given group
     *
     * @param intervalInS Interval in seconds
     * @param group Group name
     * @param updState State
     * @param updStateInfo Info object of the state
     */
    startGroupWriteTimeout(intervalInS, group, updState, updStateInfo) {
        const gidx = this.getStateInfoList().findIndex(i => i.Group == group);
        if (!this.getStateInfoList()[gidx].writeTimeoutHandle) {
            const interval = intervalInS * 1000;
            this.log.debug(`Write Timeout with interval ${interval} ms started for group ${group}`);
            const wf = this.getStateInfoList()[gidx].writeFnct;
            if (wf) {
                this.getStateInfoList()[gidx].writeTimeoutHandle = this.setTimeout(() => {
                    wf(group, updState, updStateInfo);
                }, interval);
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
            const oldVersion = `${oldVersionState.val}`;
            const vParts = oldVersion.split('.');
            if (vParts.length >= 4) {
                // more than 3 parts mean alpha or beta version, we migrate these everytime
                return true;
            }
            if (vParts.length >= 3) {
                const major = Number.parseInt(vParts[0]);
                //const minor = Number.parseInt(vParts[1]);
                if (major >= 2) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Create states when called the first time, update state values in each call
     *
     * @param group Group name
     * @param data Data received
     */
    async createAndUpdateStates(group, data) {
        try {
            if (data) {
                await this.setStateChangedAsync('info.connection', true, true);
                this.errorCount = 0;

                const idx = new Date().getDate() - 1;

                if (!this.createdStates[group]) {
                    const setObjectFunc = (await this.isMigrationNecessary())
                        ? this.setObjectMigrationAsync
                        : this.setObjectNormalAsync;

                    // Delete no longer supported states for this group
                    const gidx = this.getStateInfoList().findIndex(i => i.Group == group);
                    if (gidx >= 0) {
                        const groupStateList = this.getStateInfoList()[gidx].states;
                        const states = await this.getStatesAsync(`${group}.*`);
                        for (const sid in states) {
                            const parts = sid.split('.');
                            const id = parts[parts.length - 1];
                            if (groupStateList.findIndex(i => i.id == id) == -1) {
                                this.log.info(`State ${group}.${id} removed, no longer supported.`);
                                await this.delObjectAsync(`${group}.${id}`);
                            }
                        }
                    }

                    // Create the folder for this group
                    await setObjectFunc(group, {
                        type: 'folder',
                        common: {
                            name: group,
                            read: true,
                            write: false,
                        },
                        native: {},
                    });

                    // Create all static states:
                    const groupStateList = this.getStateInfoList()[gidx].states;
                    if (!this.createdStates[group]) {
                        for (const stateInfo of groupStateList) {
                            if (stateInfo.isStatic) {
                                await this.createStateForAttribute(
                                    group,
                                    data,
                                    stateInfo.alphaAttrName,
                                    stateInfo,
                                    setObjectFunc,
                                );
                            }
                        }
                    }

                    // Create all states for received elements
                    for (const [alphaAttrName] of Object.entries(data)) {
                        const stateInfo = await this.getStateInfoByAlphaAttrName(group, alphaAttrName);
                        if (typeof data[alphaAttrName] !== 'object') {
                            await this.createStateForAttribute(group, data, alphaAttrName, stateInfo, setObjectFunc);
                        } else {
                            // Look for subvalues:
                            if (data[alphaAttrName]) {
                                for (const [alphaAttrName2] of Object.entries(data[alphaAttrName])) {
                                    const stateInfo2 = await this.getStateInfoByAlphaAttrName(group, alphaAttrName2);
                                    await this.createStateForAttribute(
                                        group,
                                        data[alphaAttrName],
                                        alphaAttrName2,
                                        stateInfo2,
                                        setObjectFunc,
                                    );
                                }
                            }
                        }
                    }

                    this.log.info(`Initialized states for : ${group}`);
                    this.createdStates[group] = true;
                }

                // Set values for received states
                for (const [alphaAttrName, rawValue] of Object.entries(data)) {
                    const stateInfo = await this.getStateInfoByAlphaAttrName(group, alphaAttrName);
                    if (typeof data[alphaAttrName] !== 'object') {
                        await this.setValueForAttribute(group, rawValue, stateInfo, idx);
                    } else {
                        // Look for subvalues:
                        if (data[alphaAttrName]) {
                            for (const [alphaAttrName2, rawValue2] of Object.entries(data[alphaAttrName])) {
                                const stateInfo2 = await this.getStateInfoByAlphaAttrName(group, alphaAttrName2);
                                await this.setValueForAttribute(group, rawValue2, stateInfo2, idx);
                            }
                        }
                    }
                }
            }
        } catch (e) {
            this.log.error(`createAndUpdateStates Exception occurred: ${e}`);
        }
    }

    /**
     *
     *create the state for the received element
     *
     * @param group Group name
     * @param data Data received
     * @param alphaAttrName Attribute name at Alpha-ESS
     * @param stateInfo Info object for state
     * @param setObjectFunc Setter function
     */
    async createStateForAttribute(group, data, alphaAttrName, stateInfo, setObjectFunc) {
        if (stateInfo) {
            // The type checker has a problem with type: stateInfo.type. I have no clue why.
            // All possible types are correct and valid. To get rid of the type checker error, we check for valid types:
            if (stateInfo.type == 'string' || stateInfo.type == 'boolean' || stateInfo.type == 'number') {
                await setObjectFunc(`${group}.${this.osn(stateInfo.id)}`, {
                    type: 'state',
                    common: {
                        name: `${stateInfo.name} [${stateInfo.alphaAttrName}]`,
                        type: stateInfo.type,
                        role: stateInfo.role,
                        read: stateInfo.readable != null ? stateInfo.readable : true,
                        write: stateInfo.writeable ? stateInfo.writeable : false,
                        unit:
                            stateInfo.unit === '{money_type}' && data
                                ? data['money_type']
                                : stateInfo.unit === '{moneyType}' && data
                                  ? data['moneyType']
                                  : stateInfo.unit,
                        desc: stateInfo.alphaAttrName,
                        states: stateInfo.states,
                    },
                    native: {},
                });
                this.log.debug(`Created object ${group}.${this.osn(stateInfo.alphaAttrName)}`);
                if (stateInfo.writeable) {
                    await this.subscribeStatesAsync(`${group}.${stateInfo.id}`);
                    this.log.debug(`Subscribed State: ${group}.${stateInfo.id}`);
                }
            } else {
                this.log.error(
                    `Internal error: Skipped object ${group}.${alphaAttrName} because of invalid type definition!`,
                );
            }
        } else {
            if (alphaAttrName == 'sysSn' || alphaAttrName == 'theDate') {
                this.log.debug(`Skipped object ${group}.${alphaAttrName}`);
            } else {
                this.log.warn(`Skipped object ${group}.${alphaAttrName}`);
            }
        }
    }

    /**
     * @param group Group name
     * @param rawValue Value as delivered from API
     * @param stateInfo State info object
     * @param idx Index of attribute
     */
    async setValueForAttribute(group, rawValue, stateInfo, idx) {
        if (stateInfo) {
            let value = '';
            if (stateInfo.dayIndex) {
                value = rawValue[idx];
            } else {
                value = rawValue;
            }
            this.log.silly(`${group}.${this.osn(stateInfo.id)}:${value}`);
            let tvalue;
            switch (stateInfo.type) {
                case 'number':
                    tvalue = Number.parseFloat(value);
                    if (stateInfo.factor) {
                        tvalue *= stateInfo.factor;
                    }
                    if (stateInfo.round) {
                        tvalue = Math.round(tvalue * 10 ** stateInfo.round) / 10 ** stateInfo.round;
                    }
                    break;
                case 'boolean':
                    if (value.toString().toLowerCase() === 'true') {
                        tvalue = true;
                    } else if (value.toString().toLowerCase() === 'false') {
                        tvalue = false;
                    } else {
                        tvalue = Number.parseInt(value) != 0;
                    }
                    break;
                default:
                    tvalue = value;
            }
            if (this.config.updateUnchangedStates) {
                await this.setState(`${group}.${this.osn(stateInfo.id)}`, { val: tvalue, q: 0 }, true);
            } else {
                await this.setStateChangedAsync(`${group}.${this.osn(stateInfo.id)}`, { val: tvalue, q: 0 }, true);
            }
            stateInfo.lastUpdateTs = Date.now();
            this.log.silly(`Received object ${group}.${this.osn(stateInfo.alphaAttrName)} with value ${rawValue}`);
        }
    }

    /**
     * Answer the state description object for a given group and alpha-ess attribute name
     *
     * @param Group Group name
     * @param alphaAttrName Attribute name at Alpha-ESS
     */
    async getStateInfoByAlphaAttrName(Group, alphaAttrName) {
        try {
            const gidx = this.getStateInfoList().findIndex(i => i.Group == Group);
            if (gidx >= 0) {
                const currentList = this.getStateInfoList()[gidx].states;
                const sidx = currentList.findIndex(i => i.alphaAttrName == alphaAttrName);
                if (sidx >= 0) {
                    return currentList[sidx];
                }
            }
            return null;
        } catch (e) {
            this.log.error(`getStateInfo Exception occurred: ${e}`);
            this.log.info(`Group: ${Group}`);
            this.log.info(`alphaAttrName: ${alphaAttrName}`);
            return null;
        }
    }

    /**
     * Answer the state description object for a given group and id
     *
     * @param group Group name
     * @param id Id of the state info
     */
    getStateInfoById(group, id) {
        try {
            const gidx = this.getStateInfoList().findIndex(i => i.Group == group);
            if (gidx >= 0) {
                const currentList = this.getStateInfoList()[gidx].states;
                const sidx = currentList.findIndex(i => i.id == id);
                if (sidx >= 0) {
                    return currentList[sidx];
                }
            }
            return null;
        } catch (e) {
            this.log.error(`getStateInfo Exception occurred: ${e}`);
            this.log.info(`Group: ${group}`);
            this.log.info(`alphaAttrName: ${id}`);
            return null;
        }
    }

    /**
     * Set quality for all existing states of given group
     *
     * @param group Group name
     * @param q Qualifier
     */
    async setQualityForGroup(group, q) {
        try {
            const gidx = this.getStateInfoList().findIndex(i => i.Group == group);
            if (gidx >= 0) {
                const groupInfo = this.getStateInfoList()[gidx];
                const groupStates = groupInfo.states;
                for (let i = 0; i < groupStates.length; i++) {
                    if (!groupStates[i].isStatic) {
                        const newState = await this.getStateAsync(`${groupInfo.Group}.${groupStates[i].id}`);
                        if (newState) {
                            if (newState.q != q && newState.ack) {
                                newState.q = q;
                                this.log.debug(
                                    `Set state ${groupInfo.Group}.${groupStates[i].id} to val: ${newState.val}; q: ${newState.q}; ack: ${newState.ack}`,
                                );
                                await this.setState(`${groupInfo.Group}.${groupStates[i].id}`, newState, true);
                            } else {
                                if (!newState.ack) {
                                    this.log.silly(
                                        `Set state ${groupInfo.Group}.${groupStates[i].id} NOT to val: ${newState.val}; q: ${newState.q} because ack of this state is ${newState.ack}`,
                                    );
                                } else {
                                    this.log.silly(
                                        `Set state ${groupInfo.Group}.${groupStates[i].id} NOT to val: ${newState.val}; q: ${newState.q} because quality is unchanged ${newState.q}`,
                                    );
                                }
                            }
                        }
                    }
                }
            }
        } catch (e) {
            this.log.error(`setQualityForGroup Exception occurred: ${e}`);
            this.log.info(`Group: ${group}`);
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
                if (groupStates[i].lastUpdateTs && !groupStates[i].isStatic) {
                    if (Date.now() - groupStates[i].lastUpdateTs > groupInfo.interval * 1000 + REQUEST_TIMEOUT) {
                        const newState = await this.getStateAsync(`${groupInfo.Group}.${groupStates[i].id}`);
                        if (newState) {
                            if (newState.q == 0 && newState.ack) {
                                // Change quality only if it was OK before
                                newState.q = 0x01;
                                this.log.warn(
                                    `Watchdog: State ${groupInfo.Group}.${groupStates[i].id} not updated for ${Date.now() - groupStates[i].lastUpdateTs} ms`,
                                );
                                this.log.debug(
                                    `Watchdog: Set state ${groupInfo.Group}.${groupStates[i].id} to val: ${newState.val}; q: ${newState.q}`,
                                );
                                await this.setState(`${groupInfo.Group}.${groupStates[i].id}`, newState, true);
                            } else {
                                if (!newState.ack) {
                                    this.log.silly(
                                        `Set state ${groupInfo.Group}.${groupStates[i].id} NOT to val: ${newState.val}; q: ${newState.q} because ack of this state is ${newState.ack}`,
                                    );
                                } else {
                                    this.log.silly(
                                        `Set state ${groupInfo.Group}.${groupStates[i].id} NOT to val: ${newState.val}; q: ${newState.q} because quality is already not OK: ${newState.q}`,
                                    );
                                }
                            }
                        } else {
                            this.log.warn(`Watchdog: State ${groupInfo.Group}.${groupStates[i].id} not found!`);
                        }
                    } else {
                        this.log.silly(
                            `Watchdog: State ${groupInfo.Group}.${groupStates[i].id} last updated ${Date.now() - groupStates[i].lastUpdateTs} ms ago`,
                        );
                    }
                }
            }
        }
    }

    //   lastUpdateTs

    /**
     * Otimize state name (i.e. remove forbidden characters for ioBroker state names)
     *
     * @param sn State name
     */
    osn(sn) {
        return sn.replace(/[*,?,",',[,\]]/g, '_');
    }

    /**
     * calculate interval time in dependency of error count.
     * This is to avoid too many requests and flooding the ioBroker log file with messages
     *
     * @param timeInS Interval time in seconds
     * @param groupInfo Group Info
     */
    calculateIntervalInMs(timeInS, groupInfo) {
        if (groupInfo.isSchedule) {
            // In this case we calculate the seconds until the next full 5 minutes plus 10 seconds
            const now = new Date();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const nextFullFiveMinute = Math.ceil((minutes + 1) / 5) * 5;
            const remainingMinutes = nextFullFiveMinute - minutes - 1;
            const remainingSeconds = 60 - seconds;

            timeInS = remainingMinutes * 60 + remainingSeconds + 10;
        } else {
            if (this.errorCount < 5) {
                return timeInS * 1000;
            }

            if (timeInS < 300000) {
                // 5 minutes
                this.log.error(`${groupInfo.Group}: Five or more errors occurred, next request in 5 minutes.`);
                return 300000;
            }
        }

        return timeInS * 1000;
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param [options] Options
     */
    module.exports = options => new AlphaEss(options);
} else {
    // otherwise start the instance directly
    new AlphaEss();
}
