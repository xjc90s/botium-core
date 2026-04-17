/**
 * Converts a value to a boolean.
 * Similar to the 'boolean' npm package implementation.
 *
 * @param {*} value - The value to convert to boolean
 * @returns {boolean} The boolean representation of the value
 */
function boolean (value) {
  // Handle null and undefined
  if (value == null) {
    return false
  }

  // Handle boolean values
  if (typeof value === 'boolean') {
    return value
  }

  // Handle numbers
  if (typeof value === 'number') {
    return value !== 0 && !isNaN(value)
  }

  // Handle strings
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === 'yes' || normalized === 'on' || normalized === '1') {
      return true
    }
    if (normalized === 'false' || normalized === 'no' || normalized === 'off' || normalized === '0' || normalized === '') {
      return false
    }
  }

  // For all other values, use JavaScript's truthiness
  return Boolean(value)
}

module.exports = { boolean }
