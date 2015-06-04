module.exports = new Class({
    
    //A scale is just going to be an array of note values
    //It's also going to contain the function necessary to compile it though
    //This means accepting a rootId and an array of chord intervals
    //It will then determine the note values based on that
    //A scale is agnostic to which ids map to which notes, and even which scale it's compiling
    //It's up to the program to pass in a name, maybe you want the chord to be called "IV" or "A Major"
    
    Implements: Events,
    
    scale: [],
    selected: false,
    
    initialize: function(rootId,intervals,name,color){
        this.name = name;
        this.color = color;
        this.compile(rootId,intervals);
    },
    
    //Compiles the noteIds based off a root and array of intervals
    compile: function(rootId,intervals){
        var notes = [rootId];
        
		intervals.forEach(function(interval) { 
        
            var noteId = rootId + interval;
            if (noteId > 12) { noteId -= 12; }
            
            notes.push(noteId);
        });

        this.scale = notes;
        this.fireEvent('change');
    }
});
