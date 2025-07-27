import Amadeus from 'amadeus'
import dotenv from 'dotenv'

dotenv.config()

export const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_API_KEY,
    clientSecret: process.env.AMADEUS_API_SECRET,
})
