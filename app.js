//var templates = require('./templates');
var Fretboard = require('./models/fretboard');
var Scale = require('./models/scale');
var Progression = require('./models/progression');
var MainView = require('./views/main');
var data = require('./data.json');

var keyboard = new Keyboard({ active: true });
var fretboard = new Fretboard(22, 6, data.tunings[0].notes);
var defaultScale = new Scale(data.notes[0].id, data.chords[0].intervals, data.notes[0].name + ' ' + data.chords[0].name, '#F23C3C');
var progression = new Progression('default');

var mainView = new MainView(fretboard, defaultScale, progression, data, keyboard);