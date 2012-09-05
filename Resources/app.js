/**
 * Sample Titanium app demonstrating the usage of the PartialMaskField module.
 */
var win = Ti.UI.createWindow({
	backgroundColor : '#ddd',
	layout : 'vertical'
});

var label1 = Ti.UI.createLabel({
	left : 20, right : 20, top : 20, height : 25,
	color : '#444', text : 'Partially Masked TextField:'
});
var textField = Ti.UI.createTextField({
	left : 30, right : 20, top : 0, height : 40,
	backgroundColor : '#fff', color : '#000',
	hintText : 'password',
	borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED
});

var label2 = Ti.UI.createLabel({
	left : 20, right : 20, top : 30, height : 25,
	color : '#444', text : '(Value behind mask)'
});
var mirrorLabel = Ti.UI.createLabel({
	left : 30, right : 20, top : 0, height : 30,
	backgroundColor : '#fff', color : '#000', text : ''
});

var button = Ti.UI.createButton({
	left : 50, right : 50, top : 80, height : 40,
	title : 'Try This: Force Populate'
});
button.addEventListener('click', function(e) {
	// Programmatically set the value.
	partialMaskField.force('16273849-X');
});

win.add(label1);
win.add(textField);
win.add(label2);
win.add(mirrorLabel);
win.add(button);

// Instantiate the module and wrap the TextField.
var PartialMaskField = require('PartialMaskField').PartialMaskField;
var partialMaskField = new PartialMaskField(textField, 3, 4);

// At any time you can ask for the real value.
// For this sample app, poll to keep the UI mirror updated.
setInterval(function(e) {
	mirrorLabel.text = partialMaskField.value();
}, 300);


win.open();
