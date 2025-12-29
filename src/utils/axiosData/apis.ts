// section1: authentication apis
// section2: active faults


// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// section1: authentication apis
export const LOGIN_USER_API= "/v1/auth/login"
export const CHECK_TOKEN_VALIDITY_RENDER= "/v1/testing/validate"
export const LOGOUT="/auth/logout"

// section2: active faults  
export const FETCH_ACTIVE_FAULTS_TABLE_DATA= '/v1/faultbrowser/active-traps'
export const FETCH_HISTORICAL_FAULTS_TABLE_DATA= '/v1/faultbrowserhist/historical-traps'
export const CLEAR_OR_ACK_ACTIVE_TRAP_API= '/v1/faultbrowser/clearOrAck';

export const DISTINCT_Adapter_LIST_API = '/v1/faultbrowser/distinctAdapter';
export const DISTINCT_TRAP_TYPES_LIST_API = '/v1/faultbrowser/distinctTrapTypes';
export const DISTINCT_GROUP_TRAP_Adapter_LIST_API = '/v1/faultbrowser/groupTrapAdapterList';
export const CREATE_OR_UPDATE_FAV_GROUP= '/v1/faultbrowser/createOrUpdateGroup'

// section3: ticketing
export const FETCH_TICKETING_TABLE_DATA= `/v1/faultbrowserticketing/ticketing`


// section4: Inventory(MCP(CIENA))
export const FETCH_INVENTORY_NE_LIST_REPORT_DATA=`/v1/apacreport/ne-list-report`
export const FETCH_INVENTORY_CHANNEL_REPORT_DATA= `/v1/apacreport/channel-details-report`;
export const FETCH_INVENTORY_EQUIPMENT_REPORT_DATA= `/v1/apacreport/equipment-details-report`;

// export const FETCH_INVENTORY_TABLE_DATA= `/circuit-inventory`;

// section5: Inventory(NFMT(NOKIA))

export const FETCH_INVENTORY_NFMT_DEVICE_DETAILS_DATA=`/v1/nfmt/device-report`;
export const FETCH_INVENTORY_NFMT_EQUIPMENT_REPORT_DATA= `/v1/nfmt/equipment-report`;


// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

//Graph data
export const FETCH_GRAPH_DATA_API=(adapName:string,st:string,ed:string)=> `/v1/faultbrowser/active-traps/graphtrend?AdapterName=${adapName}&dateStart=${st}&dateEnd=${ed}`

//------------------------------------------------------------------------------------
export const AUTO_TT_ALARMS_API ='http://10.27.144.225:8080/indiabackend/v1/faultbrowser/auto-tt-alarms';



