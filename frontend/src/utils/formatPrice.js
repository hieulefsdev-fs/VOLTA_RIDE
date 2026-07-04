export function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

export function formatNumber(num) {
  return new Intl.NumberFormat('vi-VN').format(num);
}
