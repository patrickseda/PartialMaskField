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
 */
var supportedByThisPlatform = (Ti.Platform.osname !== 'android');

exports.PartialMaskField = function(textField, startPos, numShowing) {
	// Ensure the native masking is in the proper state.
	if (supportedByThisPlatform) {
		textField.passwordMask = false;
	} else {
		textField.passwordMask = true;
	}

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
				maskedValue += '\u2022';
			}
		}
		textField.value = maskedValue;
	};
	
	var finalMaskTimer = null;
	var killTimer = function() {
		if (finalMaskTimer) {
			clearTimeout(finalMaskTimer);
			finalMaskTimer = null;
		}
	}
	var handleChangeEvent = function(e) {
		if (!supportedByThisPlatform) {
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
		if (supportedByThisPlatform) {
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
