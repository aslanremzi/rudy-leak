const adminIds = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [];

function isAdmin(userId) {
  return adminIds.includes(userId);
}

module.exports = isAdmin;
