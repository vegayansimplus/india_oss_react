 export interface LocationNode {
  location: string;
  count: number;
}

export interface ChartData {
  name: string;
  value: number;
}


// export interface configStatus {
//   Circle: string;
//   City: string;
//   "Node Type": string;
//   "Vendor Name": string;
//   "Node Name": string;
//   "Node IP": string;
//   "Backup Status": string;
//   Time: string;   
// }

export interface AlarmDetail {
  "Trap Type": string;
  "Sub Trap Type": string;
  "Alarm Entity": string;
  "Trap Severity": string;
  "Node IP": string;
  "Node Name": string;
  "Interface Name": string;
  "Alarm Recieved Time": string;
  "Alarm Value": string;
  "Alarm Description": string;
  "Trap Source": string;
}

export interface LinkDetail {
  LinkType: string;
  TotalLinkCnt: number;
  DownLinkCnt: number;
}

export type DynamicTableRow = Record<string, any>;
