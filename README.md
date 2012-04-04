# PartialMaskField.js

### _A CommonJS module for Titanium mobile applications._

This module provides the ability to have partial password masking on a Titanium `TextField` object. This may be desirable in certain applications which may want to reveal only the last few digits of a Social Security Number or a Drivers License number.


This [Screen Capture](http://www.screencast.com/t/VbLZkIi4h0bJ) shows a sample app using the `PartialMaskField` module.
> __NOTE: This module does NOT support partial masking for Android.__
Technical Reason: _When programmatically updating the value of a `TextField`, Android will place the cursor at position 0 instead of after the last position (where it would be expected). This affects the ability to perform dynamic `TextField` updates internally within this module.
But, there is a feature request in for this functionality under [TIMOB-6006](https://jira.appcelerator.org/browse/TIMOB-6006)._

>_The behavior on Android will mimic the native functionality of a having a fully masked `TextField` with the setting `passwordMask:true`._