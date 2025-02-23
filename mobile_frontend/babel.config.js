module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // Corrected "preset" to "presets"
  };
};
