module.exports = new Class({

	Implements: Events,
	//Bind routines to use the class instance for 'this'
	Binds: ['drawNotes', 'compileScale', 'drawBoard', 'addChord', 'nextChord',
			'renderProgression', 'removeChord', 'clearProgression', 'subDraw'],
	
	/*Active elements*/
    rootSelect: $('root-select'),
    chordSelect: $('chord-select'),
    addChordButton: $('add-chord-button'),
    fbContainer: $('fb-container'),
	chordList: $('chord-list'),
	clearProgressionButton: $('clear-progression-button'),
	
	prevScale: ['null'], //Set this to empty array so the first chord shows up when the app starts

    initialize: function(fretboard, scale, progression, data, keyboard){

		//Set up models
        this.fretboard = fretboard;
		this.scale = scale;
		this.progression = progression;
		this.data = data;
		this.keyboard = keyboard;
		
		//Declare contexts
		var ctx = document.getElementById('fretboard').getContext('2d');
		var ntx = document.getElementById('notes').getContext('2d');
        
        //Render Routines
        this.drawBoard(ctx);
        this.renderForm(data.notes, data.chords);
		
		//Form Events
		$$('select').addEvent('change', this.compileScale);
		this.addChordButton.addEvent('click', this.addChord);
		
		//Scale Events
		this.scale.addEvent('change', this.drawNotes.bind(this, ntx, this.scale));
		
		//Progression Events
		this.progression.addEvent('change', this.renderProgression);
		this.clearProgressionButton.addEvent('click', this.clearProgression);
		
		//Set up keyboard events... So keys 0 - 9 map to indecies of the progression
		//So for the time being, you can only have 10 chords in a progression
		for (var i=0; i<10; i++){
			var val = i - 1;
			if (i === 0) { val = 9; }
			this.keyboard.addEvent(String.from(i), this.nextChord.bind(this, ntx, val));
		}
		
		//Fire scale change event so the A major shows on startup
		this.scale.fireEvent('change');
    },
	
	//Since there is this default scale that cycles until it's cloned, this also sets the name
	compileScale: function(){
		this.scale.name = this.data.notes[this.rootSelect.value - 1].name + ' ' + this.data.chords[this.chordSelect.value].name;
		this.scale.compile(this.rootSelect.value.toInt(), this.data.chords[this.chordSelect.value].intervals);
	},
	
	addChord: function(){
		//Limiting this to 10 for the time being
		if (this.progression.chords.length < 10){
			this.progression.add(Object.clone(this.scale));
		}
	},
	
	nextChord: function(ctx, index){
		if (this.progression.chords[index]){
			this.drawNotes(ctx,this.progression.chords[index]);
			this.progression.select(index);
		}
	},
	
	renderProgression: function(){
		this.chordList.set('html', '');
		this.progression.chords.forEach(function(chord, idx){
			var li = new Element('li', {'class': 'clickable', text: chord.name});
			
			if (chord.selected === true) {
				li.addClass('selected');
			}
			
			li.inject('chord-list');
			li.addEvent('click', this.removeChord.bind(this, idx));
		}, this);
	},
	
	clearProgression: function(){
		this.progression.clear();
	},
	
	removeChord: function(index){
		this.progression.remove(index);
	},
	
	drawNotes: function(ctx, scale){
	this.alpha = 0;
	this.timer = this.subDraw.periodical(40, this, [ctx, scale]);
	},
	
	subDraw: function(ctx, scale){
		ctx.clearRect(0,0,this.fretboard.xScale,this.fretboard.yScale); //Clear so the notes reset

		for(var i=0, l=scale.scale.length; i < l; i++) {
		var tmpAlpha = this.alpha;//This will be overwritten below if necessary
		var noteId = scale.scale[i];
		
		if (this.prevScale.contains(noteId)) {
			//Can't continue here because the note won't even show up
			//Need to just set the alpha to 1
			tmpAlpha = 1;
		}
		
			this.fretboard.matrix[noteId - 1].forEach(function(string, idx){
				string.forEach(function(val){

					ctx.beginPath();
					ctx.arc(val,this.fretboard.yValues[idx],6,0,2*Math.PI);
					ctx.globalAlpha = tmpAlpha;
					ctx.fillStyle = scale.color;
					ctx.fill();
					
				}, this);
			}, this);
		}
		
		this.alpha+=0.05;
		if (this.alpha >= 1) {
			clearInterval(this.timer);
			this.prevScale = scale.scale;
		}
	},
	/*
	Populates the root and chord options
	The root values will be the noteId
	The chord values will be the index of the chord array
	*/
    renderForm: function(notes, chords){
    
        notes.forEach(function(note){
            var option = new Element('option', {value: note.id, text: note.name});
            option.inject('root-select');
        });
        
        chords.forEach(function(chord, index){
            var option = new Element('option', {value: index, text: chord.name});
            option.inject('chord-select');
        });
        
    },

    drawBoard: function(ctx){
        //------------
        //Draw the nut
        //------------
        ctx.beginPath();
		ctx.lineWidth = 4;
        ctx.moveTo(this.fretboard.nutOffset, 0);
		ctx.lineTo(this.fretboard.nutOffset, this.fretboard.yScale);
		ctx.strokeStyle = this.fretboard.colors.nut;
        ctx.stroke();
        
        //--------------
        //Draw the frets
        //--------------
        this.fretboard.fretValues.forEach(function(x){
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.yScale);
        ctx.strokeStyle = this.colors.fret;
        ctx.stroke();
        }, this.fretboard);
        
        //---------------
        //Draw the inlays
        //---------------
        for (var i = 0, l = this.fretboard.inlays.length; i < l; i++) {
        
        //Manage the amount of frets that are shown
        if (this.fretboard.inlays[i] > this.fretboard.frets) { break; }
        
        var xInlay = this.fretboard.getNoteX(this.fretboard.inlays[i]);
        
        if (this.fretboard.inlays[i] == 12) {
            //Draw two
            ctx.beginPath();
            ctx.arc(xInlay,this.fretboard.yScale*(1/3),5,0,2*Math.PI);
            ctx.fillStyle = this.fretboard.colors.inlay;
			ctx.fill();
            
            ctx.beginPath();
            ctx.arc(xInlay,this.fretboard.yScale*(2/3),5,0,2*Math.PI);
            ctx.fillStyle = this.fretboard.colors.inlay;
            ctx.fill();
        }
        else { 
            ctx.beginPath();
            ctx.arc(xInlay,this.fretboard.yScale/2,5,0,2*Math.PI); 
            ctx.fillStyle = this.fretboard.colors.inlay;
            ctx.fill();
        }
        
        }
        
        //------------
        //Draw strings
        //------------
        this.fretboard.yValues.forEach(function(y){

            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(0, y);
            ctx.lineTo(this.xScale, y);
            ctx.strokeStyle = this.colors.string;
            ctx.stroke();
            }, this.fretboard);
    }
});