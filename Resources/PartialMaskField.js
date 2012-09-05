/**
 * Provides the ability to have partial password masking on a TextField.
 * The original TextField is created and placed in the app like normal,
 * then wrapped by an instance of this module to provide the masking behavior.
 * A position range is specified for which section of characters remains unmasked.
 * 
 * This module does NOT support partial masking for Android, as described below.
 * (The behavior will mimic a fully masked TextField, with passwordMask:true)
 *
 * Sample usage:
 *     // Create a normal TextField in your app.
 *     var textField = Ti.UI.createTextField({
 *         top:20, left:20, width:200, height:40, hintText:'Type something'
 *     });
 * 
 *     // Load the module and create an instance with your TextField, the
 *     // starting position, and length of the unmasked characters.
 *     // e.g.
 *     //   - PartialMaskField(textField, 0, 4) behaves like:  'pass****'
 *     //   - PartialMaskField(textField, 2, 3) behaves like:  '**821**'
 *     //   - PartialMaskField(textField) behaves natively:    '*********'
 *     var PartialMaskField = require('PartialMaskField').PartialMaskField;
 *     var ssnField = new PartialMaskField(textField, 5, 4);
 * 
 *     // At any time you can ask for the actual value. (Don't EVER use textField.value!)
 *     var ssn = ssnField.value();
 * 
 *     // Populate the field programmatically. (Don't EVER use textField.value!)
 *     ssnField.force('123456789');
 *
 * @author Patrick Seda
 */

/**
 * NOTE: This module does NOT support partial masking for Android.
 * Why not? - When programmatically updating the value of a TextField, Android
 * will place the cursor at position 0 instead of at the end (where it would
 * be expected). This screws with the ability to perform dynamic TextField
 * updates within this module.
 * But, there is a feature request in for this functionality under TIMOB-6006.
 * 
 * UPDATE (5 Sept 2012): This functionality has been introduced in Titanium SDK 2.1.2
 * and this module has been modifed to work correctly using 2.1.2 and newer.
 */
var isAndroid = Ti.Platform.osname === 'android';
var isSupported = true;

// Not supported on Android before Titanium 2.1.2.
if (isAndroid) {
	var tiVersion = Ti.version.split('.');
	var primary = parseInt(tiVersion[0], 10);
	var secondary = parseInt(tiVersion[1], 10);
	var tertiary = (tiVersion[2] !== undefined) ? parseInt(tiVersion[2], 10) : null;
	if ((primary < 2) ||
		((primary === 2) && (secondary < 1)) ||
		((primary === 2) && (secondary === 1) && (tertiary !== null) && (tertiary < 2))) {
		isSupported = false;
	}
}

exports.PartialMaskField = function(textField, startPos, numShowing) {
	// Ensure the native masking is in the proper state.
	textField.passwordMask = !isSupported;

	var startUnmasked = (startPos > 0) ? startPos : 0;
	var numUnmasked = (numShowing > 0) ? numShowing : 0;
	var actualValue = '';
	
	var setMaskedValue = function(showLastChar) {
		var maskedValue = '';
		var showLast = (showLastChar === true) || false;
		for (var i = 0, len = actualValue.length; i < len; i++) {
			if (((i >= startUnmasked) && (i < (startUnmasked + numUnmasked))) || (showLast && (i === len-1))) {
				maskedValue += actualValue.charAt(i);
			} else {
				maskedValue += '\u25CF';
			}
		}
		textField.value = maskedValue;
		
		// Manually move the cursor on Android.
		isAndroid && isSupported && textField.setSelection(actualValue.length, actualValue.length);
	};
	
	var finalMaskTimer = null;
	var killTimer = function() {
		if (finalMaskTimer) {
			clearTimeout(finalMaskTimer);
			finalMaskTimer = null;
		}
	}
	var handleChangeEvent = function(e) {
		if (!isSupported) {
			actualValue = textField.value;
			return;
		}
		var newLen = textField.value.length;
		if (newLen === actualValue.length) {
			// Ignore transient events.
			return;
		}
		
		killTimer();
		if (newLen > actualValue.length) {
			// A character was added.
			actualValue += textField.value.charAt(newLen - 1);
			
			// Show the last character as unmasked.
			setMaskedValue(true);
			
			// Create a timer so the last character will eventually get masked.
			finalMaskTimer = setTimeout(function() {
				setMaskedValue();
				finalMaskTimer = null;
			}, 2000);
		} else {
			// A character was removed.
			actualValue = actualValue.substr(0, newLen);
			setMaskedValue();
		}
	};
	
	// Register event handlers.
	textField.addEventListener('change', handleChangeEvent);
	textField.addEventListener('blur', function() {
		killTimer();
		setMaskedValue();
	});
	
	// Override the TextField value and apply masking.
	var force = function(newValue) {
		actualValue = newValue ? ('' + newValue) : '';
		setMaskedValue();
		if (isSupported) {
			setMaskedValue();
		} else {
			textField.value = actualValue;
		}
	};

	var value = function() {
		return actualValue;
	};
	
	// Public API.
	return {
		value : value,
		force : force
	};
};
