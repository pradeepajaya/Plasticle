module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // Corrected "preset" to "presets"
    //plugins: [
      //['module:react-native-dotenv', {
       // moduleName: '@env',
       // path: '.env',
      //}],
    //],
  };
};
