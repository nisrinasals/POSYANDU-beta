const { ScreeningConfig } = require("../models");
const { createAuditLog, AUDIT_ACTIONS } = require("../utils/auditLogHelper");
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
  let transaction = null;

  try {
    transaction = await ScreeningConfig.sequelize.transaction();
    const updates = req.body;

    const keys = Object.keys(updates);

    if (keys.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Tidak ada konfigurasi yang diperbarui",
      });
    }

    const config = await ScreeningConfig.findByPk(req.params.id, {
      transaction,
    });

    if (!config) {
      await transaction.rollback();
      transaction = null;

      return res.status(404).json({
        success: false,
        message: "Konfigurasi screening tidak ditemukan",
      });
    }

    if (!Object.prototype.hasOwnProperty.call(updates, config.key)) {
      await transaction.rollback();
      transaction = null;
      return res.status(400).json({
        success: false,
        message: "Body konfigurasi tidak sesuai dengan konfigurasi yang dipilih",
      });
    }

    const oldValue = screeningConfigSnapshot(config);
    await config.update({ value: updates[config.key] }, { transaction });
    const newValue = screeningConfigSnapshot(config);

    await transaction.commit();
    transaction = null;

    await createAuditLog({
      userId: req.user?.id ?? null,
      action: AUDIT_ACTIONS.SCREENING_CONFIG_UPDATE,
      tableName: "screening_config",
      recordId: config.id,
      oldValue,
      newValue,
    });

    return res.status(200).json({
      success: true,
      message: "Konfigurasi screening berhasil diperbarui",
    });
  } catch (error) {
    if (transaction) await transaction.rollback();

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
