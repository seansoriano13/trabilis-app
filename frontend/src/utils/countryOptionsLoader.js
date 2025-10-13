import countryCodes from '../data/CountryCodes.json'

// Countries that require visa processing
const VISA_REQUIRED_COUNTRIES = [
    // Schengen Area Countries (replaced single "Schengen" entry)
    'Austria',
    'Belgium',
    'Cyprus',
    'Czech Republic',
    'Denmark',
    'Estonia',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Hungary',
    'Iceland',
    'Italy',
    'Latvia',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Malta',
    'Netherlands',
    'Norway',
    'Poland',
    'Portugal',
    'Slovakia',
    'Slovenia',
    'Spain',
    'Sweden',
    'Switzerland',
    
    // Other countries requiring visas
    'Argentina',
    'Australia',
    'Bangladesh',
    'Brazil',
    'Canada',
    'Chile',
    'China',
    'Croatia',
    'Equatorial Guinea',
    'India',
    'Indonesia',
    'Ireland',
    'Israel',
    'Japan',
    'Malaysia',
    'Mexico',
    'Monaco',
    'Myanmar',
    'Nepal',
    'New Zealand',
    'Pakistan',
    'Romania',
    'Russia',
    'San Marino',
    'Saudi Arabia',
    'Singapore',
    'South Africa',
    'Korea, Republic of South Korea',
    'Sri Lanka',
    'Thailand',
    'Turkey',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Vietnam'
]

// Transform country codes to react-select format
const transformCountries = (countries) => {
    return countries.map(country => ({
        value: country.name,
        label: country.name,
        code: country.code,
        dial_code: country.dial_code,
        requiresVisa: VISA_REQUIRED_COUNTRIES.includes(country.name)
    }))
}

// Load all countries
export const loadAllCountries = () => {
    return transformCountries(countryCodes)
}

// Async search function for react-select
export const loadCountryOptions = (inputValue) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const filteredCountries = countryCodes.filter(country =>
                country.name.toLowerCase().includes(inputValue.toLowerCase())
            )
            resolve(transformCountries(filteredCountries))
        }, 300)
    })
}

// Check if a country requires visa
export const checkVisaRequirement = (countryName) => {
    return VISA_REQUIRED_COUNTRIES.includes(countryName)
}

// Get country by name
export const getCountryByName = (countryName) => {
    return countryCodes.find(country => country.name === countryName)
}
