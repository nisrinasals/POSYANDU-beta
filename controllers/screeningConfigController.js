const { ScreeningConfig } = require("../models");
const { createAuditLog } = require("../utils/auditLog");
const { AUDIT_ACTIONS } = require("../constants/audit");

const screeningConfigSnapshot = (sc) => ({
  id: sc.id,
  key: sc.key,
  value: sc.value,
});

const getScreeningConfig = async (req, res) => {
  try {
    const configs = await ScreeningConfig.findAll({
      order: [["key", "ASC"]],
    });

    const data = {};

    for (const config of configs) {
      data[config.key] = {
        value: config.value,
      };
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("getScreeningConfig error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil konfigurasi screening",
    });
  }
};

const updateScreeningConfig = async (req, res) => {
  const transaction = await ScreeningConfig.sequelize.transaction();

  try {
    const updates = req.body;

    const keys = Object.keys(updates);

    if (keys.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Tidak ada konfigurasi yang diperbarui",
      });
    }

    const configs = await ScreeningConfig.findAll({
      where: {
        key: keys,
      },
      transaction,
    });

    const existingKeys = new Set(configs.map((config) => config.key));

    const invalidKeys = keys.filter((key) => !existingKeys.has(key));

    if (invalidKeys.length > 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Terdapat konfigurasi yang tidak dikenal",
        invalid_keys: invalidKeys,
      });
    }

    for (const config of configs) {
      const newValue = updates[config.key];

      if (newValue === undefined) {
        continue;
      }

      const oldValue = screeningConfigSnapshot(config);

      await config.update(
        {
          value: newValue,
        },
        {
          transaction,
        },
      );

      const newValueSnapshot = screeningConfigSnapshot(config);

      await createAuditLog({
        userId: req.user?.id ?? null,
        action: created ? AUDIT_ACTIONS.SCREENING_CONFIG_CREATE : SCREENING_CONFIG_UPDATE,
        tableName: "screening_config",
        recordId: config.id,
        oldValue,
        newValue: newValueSnapshot,
        transaction,
      });
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Konfigurasi screening berhasil diperbarui",
    });
  } catch (error) {
    await transaction.rollback();

    console.error("updateScreeningConfig error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui konfigurasi screening",
    });
  }
};

module.exports = {
  getScreeningConfig,
  updateScreeningConfig,
};
