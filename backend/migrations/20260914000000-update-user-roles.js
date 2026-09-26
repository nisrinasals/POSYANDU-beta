"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeConstraint("users", "chk_users_role");
    await queryInterface.addConstraint("users", {
      fields: ["role"],
      type: "check",
      name: "chk_users_role",
      where: { role: ["kader", "puskesmas", "puskesmasAdmin", "dinkes", "dinkesAdmin", "sa"] },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("users", "chk_users_role");
    await queryInterface.addConstraint("users", {
      fields: ["role"],
      type: "check",
      name: "chk_users_role",
      where: { role: ["kader", "puskesmas", "dinkes", "sa"] },
    });
  },
};
