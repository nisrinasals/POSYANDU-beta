const { ScreeningConfig } = require('../models');

const getScreeningConfig = async () => {
  const configs = await ScreeningConfig.findAll({
    attributes: [
      'key',
      'value',
    ],
  });

  const config = {};

  for (const item of configs) {
    config[item.key] = item.value;
  }

  return config;
};

module.exports = {
  getScreeningConfig,
};