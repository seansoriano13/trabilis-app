import './ImmigrationVisaConsultancy.css'
import { useState } from 'react'
import axios from 'axios'

export default function ImmigrationVisaConsultancy() {
    const [formData, setFormData] = useState({
        visa_type: '',
        destination: '',
        full_name: '',
        mobile_number: '',
        email_address: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState('')

    const handleVisaBtn = () => {
        // Scroll to visa inquiry form
        const formElement = document.getElementById('visa-inquiry-form')
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    const handleViewDetails = (visaType) => {
        // Handle view details button click
        console.log(`View details for ${visaType}`)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const validateForm = () => {
        if (!formData.visa_type) return 'Please select a visa type'
        if (!formData.destination) return 'Please select a destination'
        if (!formData.full_name.trim()) return 'Please enter your full name'
        if (!formData.mobile_number.trim()) return 'Please enter your phone number'
        if (!formData.email_address.trim()) return 'Please enter your email address'
        if (!formData.email_address.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return 'Please enter a valid email address'
        }
        if (!formData.message.trim()) return 'Please enter your message'
        return null
    }

    const handleInquirySubmit = async (e) => {
        e.preventDefault()
        
        const validationError = validateForm()
        if (validationError) {
            setSubmitMessage({ type: 'error', text: validationError })
            return
        }

        setIsSubmitting(true)
        setSubmitMessage('')

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/visa/inquiry`,
                formData,
                { headers: { 'Content-Type': 'application/json' } }
            )

            if (response.data.success) {
                setSubmitMessage({ 
                    type: 'success', 
                    text: 'Thank you for your inquiry! We have received your request and will contact you as soon as possible.' 
                })
                // Reset form
                setFormData({
                    visa_type: '',
                    destination: '',
                    full_name: '',
                    mobile_number: '',
                    email_address: '',
                    message: ''
                })
            } else {
                throw new Error(response.data.message || 'Failed to submit inquiry')
            }
        } catch (error) {
            console.error('Error submitting visa inquiry:', error)
            setSubmitMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to submit inquiry. Please try again.' 
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="immigration-visa-consultancy">
            {/* Hero Section */}
            <section className="visa">
                <div className="visa__header-hero">
                    <img 
                        className="visa__header-background header-background" 
                        src="/images/landing-visa-cover-1080.jpg" 
                        alt="Visa consultation background"
                    />
                    <div className="visa__main-header-text">
                        <h1 className="visa__title">Your trusted partner in </h1>
                        <h1 className="visa__title visa__title--yellow">dream destinations</h1>
                        <p className="visa__description">
                            Our expert visa consultants provide a hands-on approach, <br />
                            boasting a high approval rate and saving you valuable time.
                        </p>
                        <button onClick={handleVisaBtn} className="btn__explore">
                            Avail Free Consultation
                        </button>
                    </div>
                </div>
            </section>

            {/* Visa Types Section */}
            <section className="visa-types">
                <div className="wrapper">
                    <h1 className="visa-types__header">
                        <mark className="mark__yellow">Types of Visas</mark> we cater at Lindela
                    </h1>
                    <ul className="visa-types__grid">
                        <li className="visa-types__card">
                            <div className="visa-types__card-content">
                                <div>
                                    <div className="visa-types__icon-container">
                                        <img 
                                            className="visa-types__icon" 
                                            src="/images/visa-tourist-secondary.png" 
                                            alt="Tourist Visa"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="visa-types__card-title visa__card-title--bold">Tourist Visa</p>
                                    <p className="visa-types__card-info">
                                        We offer convenient tourist visa services to a multitude of countries, 
                                        ensuring your journey is as smooth as possible.
                                    </p>
                                </div>
                            </div>
                            <div>
                                <button 
                                    className="visa-types__btn--view-details"
                                    onClick={() => handleViewDetails('Tourist Visa')}
                                >
                                    View Details
                                </button>
                            </div>
                        </li>
                        <li className="visa-types__card">
                            <div className="visa-types__card-content">
                                <div>
                                    <div className="visa-types__icon-container">
                                        <img 
                                            src="/images/visa-student-secondary.png" 
                                            alt="Student Visa"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="visa-types__card-title b">Student Visa</p>
                                    <p className="visa-types__card-info">
                                        One of our visa types covered. A lot of our clients are comprised of 
                                        Filipinos who want to go study to Canada, and also studying to work.
                                    </p>
                                </div>
                            </div>
                            <div>
                                <button 
                                    className="visa-types__btn--view-details"
                                    onClick={() => handleViewDetails('Student Visa')}
                                >
                                    View Details
                                </button>
                            </div>
                        </li>
                        <li className="visa-types__card">
                            <div className="visa-types__card-content">
                                <div>
                                    <div className="visa-types__icon-container">
                                        <img 
                                            src="/images/visa-spousal-secondary.png" 
                                            alt="Spousal Visa"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="visa-types__card-title b">Spousal Visa</p>
                                    <p className="visa-types__card-info">
                                        Our expertise empowers love to cross borders, simplifying your family 
                                        reunification journey.
                                    </p>
                                </div>
                            </div>
                            <div>
                                <button 
                                    className="visa-types__btn--view-details"
                                    onClick={() => handleViewDetails('Spousal Visa')}
                                >
                                    View Details
                                </button>
                            </div>
                        </li>
                        <li className="visa-types__card">
                            <div className="visa-types__card-content">
                                <div>
                                    <div className="visa-types__icon-container">
                                        <img 
                                            src="/images/visa-fiancee-secondary.png" 
                                            alt="Fiancee Visa"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="visa-types__card-title b">Fiancee Visa</p>
                                    <p className="visa-types__card-info">
                                        Bridge the distance and build a future together. We guide you through 
                                        the complexities of international immigration.
                                    </p>
                                </div>
                            </div>
                            <div>
                                <button 
                                    className="visa-types__btn--view-details"
                                    onClick={() => handleViewDetails('Fiancee Visa')}
                                >
                                    View Details
                                </button>
                            </div>
                        </li>
                        <li className="visa-types__card">
                            <div className="visa-types__card-content">
                                <div>
                                    <div className="visa-types__icon-container">
                                        <img 
                                            src="/images/visa-business-secondary.png" 
                                            alt="Business Visa"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p><b>Business Visa</b></p>
                                    <p className="visa-types__card-info">
                                        For those who wish to apply for a business visa, we got you covered.
                                    </p>
                                </div>
                            </div>
                            <div>
                                <button 
                                    className="visa-types__btn--view-details"
                                    onClick={() => handleViewDetails('Business Visa')}
                                >
                                    View Details
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about-us">
                <div className="wrapper">
                    <div>
                        <h4 className="about-us__mini-header">About Us</h4>
                        <h1 className="about-us__header">LINDELA IMMIGRATION VISA CONSULTANCY</h1>
                    </div>
                    <div>
                        <p className="about-us__description">
                            We pride ourselves as <b>one of the most trusted visa consultants in the Philippines</b>; 
                            thus, we guarantee you our unreserved commitment to helping you with your visa process 
                            all through. Allow our knowledgeable, professional, Friendly, and skilled visa experts 
                            to help you handle your application with the utmost care, ensuring that you feel 
                            comfortable and well-informed every step of the way.
                        </p>
                        <p className="about-us__description">
                            With our proven track in successful processing and approval of hundreds of visas daily, 
                            Lindela Immigration Visa Consultancy is your reliable partner for all your visa needs.
                        </p>
                    </div>
                    <div className="about-us__flex-container flex">
                        <div className="about-us__card">
                            <h1 className="about-us__number">12</h1>
                            <p className="about-us__label">Years of Experience</p>
                        </div>
                        <div className="about-us__card">
                            <h1 className="about-us__number"><b>84</b></h1>
                            <p className="about-us__label">Countries Visited</p>
                        </div>
                        <div className="about-us__card">
                            <h1 className="about-us__number"><b>100K+</b></h1>
                            <p className="about-us__label">Trips Organized</p>
                        </div>
                        <div className="about-us__card">
                            <h1 className="about-us__number"><b>500K+</b></h1>
                            <p className="about-us__label">Satisfied Clients</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials-visa">
                <div className="wrapper">
                    <h3 className="testimonials-visa__header">What our clients say</h3>
                    <p className="testimonials-visa__description">
                        Don't just take our word for it. Hear from those who've experienced the Lindela 
                        difference firsthand.
                    </p>
                    <div className="testimonials-visa__grid-container grid">
                        <div className="testimonials-visa__card">
                            <img src="/images/visa-client-4.jpg" alt="Client testimonial" />
                            <div className="testimonials-visa__text">
                                <p>
                                    I highly recommend this travel agency. They always send you update, the staffs 
                                    are friendly and approachable. They do their 100% to make sure your visa 
                                    application gets approved. To Ms. Melissa and Ms. Cristyl and to the rest of 
                                    the staff. Thank you so much!
                                </p>
                                <p><b>Yvette H.</b></p>
                            </div>
                        </div>
                        <div className="testimonials-visa__card">
                            <img 
                                className="testimonials-visa__image" 
                                src="/images/visa-client-5-sm.jpg" 
                                alt="Client testimonial"
                            />
                            <div className="testimonials-visa__text">
                                <p>
                                    Super happy and thankful to lindela immigration visa consultancy for my canada 
                                    visa specially to maam jove na willing e accomodate ako 24/7. I highly recommend 
                                    this visa consultancy dahil ang bilis and high approval rate.
                                </p>
                                <p><b>Teresita G.</b></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visa Inquiry Section */}
            <section className="visa-inquiry">
                <div className="wrapper">
                    <div className="visa-inquiry__container">
                        <div>
                            <form id="visa-inquiry-form" onSubmit={handleInquirySubmit}>
                                <h3 className="visa-inquiry__header">Let us know how we can assist.</h3>
                                <p>Send us a message, and we will get to you in a jiffy. We can't wait to hear from you!</p>
                                
                                {submitMessage && (
                                    <div className={`visa-inquiry__message ${submitMessage.type === 'success' ? 'visa-inquiry__message--success' : 'visa-inquiry__message--error'}`}>
                                        {submitMessage.text}
                                    </div>
                                )}

                                <div className="visa-inquiry__form-container">
                                    <label htmlFor="visa-type" className="form-label block">Visa Type</label>
                                    <select 
                                        name="visa_type" 
                                        id="visa-type"
                                        value={formData.visa_type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Which do you wish to obtain?</option>
                                        <option value="Tourist Visa">Tourist Visa</option>
                                        <option value="Student Visa">Student Visa</option>
                                        <option value="Fiancee Visa">Fiancee Visa</option>
                                        <option value="Spousal Visa">Spousal Visa</option>
                                        <option value="Business Visa">Business Visa</option>
                                    </select>
                                </div>
                                <div className="visa-inquiry__form-container">
                                    <label htmlFor="destination" className="form-label block">Destination</label>
                                    <select 
                                        name="destination" 
                                        id="destination"
                                        value={formData.destination}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Where do you want to go?</option>
                                        <option value="Schengen">Schengen</option>
                                        <option value="Argentina">Argentina</option>
                                        <option value="Canada">Canada</option>
                                        <option value="Chile">Chile</option>
                                        <option value="China">China</option>
                                        <option value="Croatia">Croatia</option>
                                        <option value="Equatorial Guinea">Equatorial Guinea</option>
                                        <option value="India">India</option>
                                        <option value="Ireland">Ireland</option>
                                        <option value="Japan">Japan</option>
                                        <option value="Mexico">Mexico</option>
                                        <option value="Monaco">Monaco</option>
                                        <option value="New Zealand">New Zealand</option>
                                        <option value="Romania">Romania</option>
                                        <option value="Russia">Russia</option>
                                        <option value="San Marino">San Marino</option>
                                        <option value="Saudi Arabia">Saudi Arabia</option>
                                        <option value="South Africa">South Africa</option>
                                        <option value="South Korea">South Korea</option>
                                        <option value="Turkey">Turkey</option>
                                        <option value="Ukraine">Ukraine</option>
                                        <option value="United Arab Emirates">United Arab Emirates</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="USA">USA</option>
                                    </select>
                                </div>
                                <div className="visa-inquiry__form-container">
                                    <label htmlFor="full-name" className="block">Name</label>
                                    <input 
                                        type="text" 
                                        name="full_name" 
                                        id="full-name"
                                        placeholder="Your name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="visa-inquiry__form-container inquiry-form-2-col">
                                    <div>
                                        <label htmlFor="phone" className="block">Phone Number</label>
                                        <input 
                                            type="text" 
                                            name="mobile_number" 
                                            id="phone"
                                            placeholder="(+63 917 704 1582)"
                                            value={formData.mobile_number}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block">Email</label>
                                        <input 
                                            type="email" 
                                            name="email_address" 
                                            id="email"
                                            placeholder="Your email address"
                                            value={formData.email_address}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="visa-inquiry__form-container">
                                    <label htmlFor="message" className="block">Message</label>
                                    <textarea 
                                        className="form-container" 
                                        name="message" 
                                        id="message"
                                        placeholder="What can we help you with?"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                    ></textarea>
                                </div>
                                <div className="visa-inquiry__form-container">
                                    <button 
                                        className="visa-inquiry-btn" 
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        <span>{isSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="visa-inquiry__image"></div>
                    </div>
                </div>
            </section>
        </div>
    )
}