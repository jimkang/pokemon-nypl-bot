var fs = require('fs');
var async = require('async');
var probable = require('probable');
var callNextTick = require('call-next-tick');
var pokemonForIds = require('./pokemon-for-ids');

var pokemonFilesDir = __dirname + '/static/pokemon/';

var pokemonCountTable = probable.createTableFromDef({
  '0-79': 1,
  '80-98': 2,
  '99-99': 3
});

function getPokemonImage(done) {
  async.waterfall(
    [
      getPokemonFiles,
      pickPokemonFiles,
      wrapFilesInMetadata      
    ],
    done
  );
}

function getPokemonFiles(done) {
  fs.readdir(pokemonFilesDir, done);
}

function pickPokemonFiles(files, done) {
  var numberOfPokemon = pokemonCountTable.roll();
  var pickedFiles = [];
  for (var i = 0; i < numberOfPokemon; ++i) {
    pickedFiles.push(probable.pickFromArray(files));
  }
  callNextTick(done, null, pickedFiles);
}

function wrapFilesInMetadata(pokemonFiles, done) {
  callNextTick(done, null, pokemonFiles.map(wrapFileInMetadata));
}

function wrapFileInMetadata(pokemonFile) {
  var pokemonId = pokemonFile.replace('.png', '');
  pokemonId = pokemonId.replace('-mega', '');
  return {
    filepath: pokemonFilesDir + pokemonFile,
    name: pokemonForIds[pokemonId],
    pokemonId: pokemonId
  };
}

module.exports = getPokemonImage;
