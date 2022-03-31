# Changelog

## 2.0.0

### Breaking changes

* renamed `getReportUrl` to `getMeasurementReportUrl`

```diff
- sdk.getReportUrl
+ sdk.getMeasurementReportUrl
```

### Added

* Added `sdk.getPeriodicReports`
* Added `sdk.getPeriodReportPdf`
* Added `sdk.activatePrescription`

### Changed

* `sdk.postMeasurement` now takes an optional `cameraSdkVersion` parameter

```diff
- sdk.postMeasurement(measurement)
+ sdk.postMeasurement(measurement, '1.0.0')
```

### Dependencies

`@extrahorizon/javascript-sdk` was upgraded to `6.1.1`
