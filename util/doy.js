
module.exports = function getDOY() {
  const now = new Date();
  const year = now.getFullYear();
  // 本年1月1日 0点
  const start = new Date(year, 0, 1);
  // 毫秒差
  const diffMs = now - start;
  const oneDayMs = 24 * 60 * 60 * 1000;
  // 计算天数，+1 因为1月1日是第1天
  const doy = Math.floor(diffMs / oneDayMs) + 1;
  return doy;
}

// 使用
const doy = getDOY();
console.log("当前DOY：", doy);
