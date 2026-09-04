require('dotenv').config(); // Loads the .env file into process.env
const { generateShortCode, isValidUrl, isValidExpirationDays, daysToExpirationDate } = require('../src/routes/shorten');

describe('generateShortCode', function () {

  test('generates a code of the correct default length', function () {
    const code = generateShortCode()
    expect(code).toHaveLength(6)
  })

  test('generates a code of a custom length', function () {
    const code = generateShortCode(8)
    expect(code).toHaveLength(8)
  })

  test('only contains valid characters', function () {
    const code = generateShortCode()
    expect(code).toMatch(/^[a-zA-Z0-9]+$/)
  })

  test('generates unique codes', function () {
    const code1 = generateShortCode()
    const code2 = generateShortCode()
    expect(code1).not.toBe(code2)
  })

})

describe('isValidUrl', function () {

  test('returns true for a valid http URL', function () {
    expect(isValidUrl('http://google.com')).toBe(true)
  })

  test('returns true for a valid https URL', function () {
    expect(isValidUrl('https://google.com')).toBe(true)
  })

  test('returns false for a string with no protocol', function () {
    expect(isValidUrl('google.com')).toBe(false)
  })

  test('returns false for an empty string', function () {
    expect(isValidUrl('')).toBe(false)
  })

  test('returns false for a non URL string', function () {
    expect(isValidUrl('not a url at all')).toBe(false)
  })

  test('returns false for ftp protocol', function () {
    expect(isValidUrl('ftp://google.com')).toBe(false)
  })

});

describe('isValidExpirationDays', function () {

  test('returns true for 1 day', function () {
    expect(isValidExpirationDays(1)).toBe(true)
  })

  test('returns true for 5 days', function () {
    expect(isValidExpirationDays(5)).toBe(true)
  })

  test('returns false for 0 days', function () {
    expect(isValidExpirationDays(0)).toBe(false)
  })

  test('returns false for 6 days', function () {
    expect(isValidExpirationDays(6)).toBe(false)
  })

  test('returns false for negative numbers', function () {
    expect(isValidExpirationDays(-1)).toBe(false)
  })

  test('returns false for non-integers', function () {
    expect(isValidExpirationDays(2.5)).toBe(false)
  })

});

describe('daysToExpirationDate', function () {

  test('converts 1 day to a future date', function () {
    const result = new Date(daysToExpirationDate(1))
    const now = new Date()
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
    // Should be within 1 second of expected
    expect(Math.abs(result - oneDayFromNow)).toBeLessThan(1000)
  })

  test('converts 5 days to a future date', function () {
    const result = new Date(daysToExpirationDate(5))
    const now = new Date()
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
    // Should be within 1 second of expected
    expect(Math.abs(result - fiveDaysFromNow)).toBeLessThan(1000)
  })

});
