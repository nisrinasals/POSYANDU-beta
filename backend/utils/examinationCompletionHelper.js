"use strict";

const isExaminationComplete = (examination) => Boolean(examination?.step2_completed_at && examination?.step4_completed_at && examination?.step5_completed_at);

module.exports = { isExaminationComplete };
