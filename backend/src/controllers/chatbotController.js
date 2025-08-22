// backend/controllers/chatbotController.js
import dotenv from 'dotenv'
dotenv.config()

const FRONTEND_URL = 'https://trabilis.vercel.app'

// --- KNOWLEDGE BASE ---
// Expanded knowledgeBase
const knowledgeBase = [
    // Flights
    {
        patterns: [
            /flight/i,
            /book.*flight/i,
            /airfare/i,
            /ticket/i,
            /airplane/i,
        ],
        answer: `Go to ${FRONTEND_URL}/flights to browse and book your flights.`,
    },
    {
        patterns: [
            /cheap.*flight/i,
            /affordable.*flight/i,
            /budget.*flight/i,
            /low.*cost.*flight/i,
        ],
        answer: `Check out affordable flight options at ${FRONTEND_URL}/destinations.`,
    },
    {
        patterns: [/flight.*status/i, /check.*flight/i, /flight.*update/i],
        answer: `You can check your flight status by visiting ${FRONTEND_URL}/flights/status or contacting our support team.`,
    },
    {
        patterns: [/international.*flight/i, /flights.*abroad/i],
        answer: `Explore international flight options at ${FRONTEND_URL}/flights/international.`,
    },

    // Tours
    {
        patterns: [/tour/i, /book.*tour/i, /travel package/i, /guided.*tour/i],
        answer: `Find exciting tours and travel packages at ${FRONTEND_URL}/destinations.`,
    },
    {
        patterns: [/group.*tour/i, /family.*tour/i, /private.*tour/i],
        answer: `We offer group, family, and private tours! Browse options at ${FRONTEND_URL}/destinations/tours.`,
    },
    {
        patterns: [/adventure.*tour/i, /outdoor.*tour/i, /extreme.*tour/i],
        answer: `Discover adventure tours at ${FRONTEND_URL}/destinations/adventure.`,
    },

    // Visa
    {
        patterns: [/visa/i, /travel document/i, /visa.*application/i],
        answer: `We offer assistance with certain visa applications. Visit ${FRONTEND_URL}/visa or contact support@trabilis.com for details.`,
    },
    {
        patterns: [/visa.*requirements/i, /visa.*rules/i],
        answer: `Visa requirements vary by destination. Check details at ${FRONTEND_URL}/visa/requirements or reach out to our support team.`,
    },

    // Payment
    {
        patterns: [
            /payment/i,
            /pay.*method/i,
            /credit card/i,
            /debit card/i,
            /e-wallet/i,
        ],
        answer: `We accept major credit cards, debit cards, and selected e-wallet payments. View details at ${FRONTEND_URL}/payment.`,
    },
    {
        patterns: [/installment/i, /pay.*later/i, /payment.*plan/i],
        answer: `We offer installment plans for select bookings. Learn more at ${FRONTEND_URL}/payment/options.`,
    },

    // Policies
    {
        patterns: [/cancel.*policy/i, /refund/i, /cancellation/i],
        answer: `Our cancellation and refund policies depend on the airline or tour operator. Visit ${FRONTEND_URL}/policies or contact support@trabilis.com for specifics.`,
    },
    {
        patterns: [/change.*booking/i, /modify.*reservation/i],
        answer: `You can modify your booking at ${FRONTEND_URL}/manage-booking, subject to terms and conditions.`,
    },

    // Contact
    {
        patterns: [
            /contact/i,
            /reach.*you/i,
            /phone number/i,
            /email/i,
            /support/i,
        ],
        answer: `Reach us via email at support@trabilis.com, call +1-800-TRABILIS, or message us on our social media channels.`,
    },
    {
        patterns: [/live.*chat/i, /talk.*agent/i],
        answer: `Start a live chat with our team at ${FRONTEND_URL}/support/chat.`,
    },

    // About
    {
        patterns: [/about/i, /what.*trabilis/i, /company/i, /who.*are.*you/i],
        answer: `Trabilis is your trusted partner for flights, tours, and visa services, making travel seamless and enjoyable. Learn more at ${FRONTEND_URL}/about.`,
    },

    // Greetings
    {
        patterns: [
            /hello/i,
            /hi\b/i,
            /hey/i,
            /good.*morning/i,
            /good.*evening/i,
        ],
        answer: `Hi! How can I assist you with your travel plans today?`,
    },

    // Destinations
    {
        patterns: [/destination/i, /where.*travel/i, /popular.*place/i],
        answer: `Explore top destinations and travel ideas at ${FRONTEND_URL}/destinations.`,
    },
    {
        patterns: [/beach.*destination/i, /vacation.*beach/i],
        answer: `Find amazing beach destinations at ${FRONTEND_URL}/destinations/beach.`,
    },
    {
        patterns: [/city.*break/i, /urban.*tour/i, /city.*destination/i],
        answer: `Discover exciting city breaks at ${FRONTEND_URL}/destinations/city.`,
    },

    // Loyalty Program
    {
        patterns: [/loyalty/i, /rewards/i, /points/i, /membership/i],
        answer: `Join our Trabilis Rewards program to earn points on bookings! Sign up at ${FRONTEND_URL}/rewards.`,
    },

    // Travel Insurance
    {
        patterns: [/insurance/i, /travel.*insurance/i, /coverage/i],
        answer: `We offer travel insurance options for your peace of mind. Learn more at ${FRONTEND_URL}/insurance.`,
    },

    // FAQs
    {
        patterns: [/faq/i, /frequently.*asked/i, /common.*question/i],
        answer: `Find answers to common questions at ${FRONTEND_URL}/faq.`,
    },

    // Promotions
    {
        patterns: [/deal/i, /discount/i, /promo/i, /offer/i],
        answer: `Check out our latest deals and promotions at ${FRONTEND_URL}/deals.`,
    },

    // Booking Confirmation
    {
        patterns: [
            /confirmation/i,
            /booking.*status/i,
            /reservation.*details/i,
        ],
        answer: `View your booking confirmation and details at ${FRONTEND_URL}/manage-booking.`,
    },

    // Travel Tips
    {
        patterns: [/travel.*tip/i, /advice.*travel/i, /how.*prepare.*travel/i],
        answer: `Get helpful travel tips and guides at ${FRONTEND_URL}/travel-tips.`,
    },

    // Default
    {
        patterns: [/.*/],
        answer: `I’m not sure about that, but you can explore our services at ${FRONTEND_URL} or contact support@trabilis.com for assistance.`,
    },
]

// --- MATCH FUNCTION ---
function findAnswer(userMessage) {
    const cleaned = userMessage.toLowerCase().trim()

    for (const entry of knowledgeBase) {
        for (const pattern of entry.patterns) {
            if (pattern.test(cleaned)) {
                return entry.answer
            }
        }
    }

    return (
        'I’m not sure about that, but you can check our services at ' +
        FRONTEND_URL
    )
}

// --- CONTROLLER ---
export const chatbotController = (req, res) => {
    const { message } = req.body

    if (!message) {
        return res.status(400).json({ reply: 'Please send a message.' })
    }

    const reply = findAnswer(message)
    return res.json({ reply })
}
