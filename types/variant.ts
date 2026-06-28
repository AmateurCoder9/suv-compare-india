export type TransmissionType = 'Manual' | 'DCT' | 'IVT' | 'CVT' | 'AT' | 'DSG'
export type FuelType = 'Petrol' | 'Petrol-Hybrid'
export type DriveType = 'FWD' | 'AWD'
export type FeatureValue = 'YES' | 'NO' | 'OPTIONAL' | string
export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type IssueFrequency = 'RARE' | 'OCCASIONAL' | 'COMMON' | 'WIDESPREAD'
export type MediaType = 'FRONT' | 'REAR' | 'SIDE' | 'INTERIOR' | 'DASHBOARD' | 'REAR_SEAT' | 'BOOT' | 'WHEEL' | 'COLOR'
export type SourceType = 'OFFICIAL' | 'REVIEW' | 'OWNER' | 'FORUM'
export type RankingCategory =
  | 'Overall' | 'Luxury' | 'Mercedes Index' | 'Comfort'
  | 'Technology' | 'Safety' | 'Value' | 'Performance'
  | 'Driver' | 'Family' | 'City' | 'Highway'
  | 'Boot' | 'Road Presence' | 'Size' | 'Reliability'
