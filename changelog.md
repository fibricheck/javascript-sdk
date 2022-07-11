# Changelog

## 3.0.0

### Breaking changes

* `postMeasurement`now throws a `NoActivePrescriptionError` when no active prescription is active when trying to post a measurement

### Added

* Symptom severity score can now be added to a measurement context
* `sdk.canPerformMeasurement`: check if you have an active prescription
* `sdk.updateMeasurementContext`: update the measurement context after a measurement has already been posted
* `sdk.updateProfile`: update profile information

### Changed

* Errors thrown by `sdk.activePrescription` are now more clear -> `NoActivePrescriptionError` & `AlreadyActivatedError`

### Dependencies

`@extrahorizon/javascript-sdk` was upgraded to `7.0.0`

## 2.0.0

### Breaking changes

* renamed `getReportUrl` to `getMeasurementReportUrl`

```diff
- sdk.getReportUrl
+ sdk.getMeasurementReportUrl
```

### Added

* `sdk.getPeriodicReports`: gets a list of periodic reports
* `sdk.getPeriodicReportPdf`: get the pdf of a periodic report
* `sdk.activatePrescription`: activate a prescription hash, so the user can perform a measurement

### Changed

* `sdk.postMeasurement` now takes an optional `cameraSdkVersion` parameter

```diff
- sdk.postMeasurement(measurement)
+ sdk.postMeasurement(measurement, '1.0.0')
```

### Dependencies

`@extrahorizon/javascript-sdk` was upgraded to `6.1.1`
