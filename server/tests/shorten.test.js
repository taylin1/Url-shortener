require('dotenv').config(); // Loads the .env file into process.env
const { generateShortCode, isValidUrl } = require('../src/routes/shorten');

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
