import './Footer.css'

export default function Footer() {
    return (
        <footer className='footer'>
            <div className='footer__grid'>
                {/* Logo + Description */}
                <div className='footer__text'>
                    <div className='footer__logo'>
                        <img
                            src={/* logoImg */ ''}
                            alt='Lindela Travel & Tours Logo'
                        />
                    </div>
                    <div className='footer__description'>
                        <p>
                            Seeing the world can be a transformative experience.
                            We'd love to explore the world with you.
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <div>
                    <p className='footer__category'>
                        <b>NAVIGATE</b>
                    </p>
                    <ul>
                        <li>
                            <a
                                href='index.php?page=homepage'
                                className='footer__li'
                            >
                                Home
                            </a>
                        </li>
                        <li>
                            <a
                                href='index.php?page=about-us'
                                className='footer__li'
                            >
                                About Us
                            </a>
                        </li>
                        <li>
                            <a
                                href='index.php?page=contact-us'
                                className='footer__li'
                            >
                                Contact Us
                            </a>
                        </li>
                        <li>
                            <a
                                href='index.php?page=privacy-policy'
                                className='footer__li'
                            >
                                Privacy Policy
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Services */}
                <div>
                    <p className='footer__category'>
                        <b>SERVICES</b>
                    </p>
                    <ul>
                        <li>
                            <a
                                href='index.php?page=tour-packages'
                                className='footer__li'
                            >
                                Destinations
                            </a>
                        </li>
                        <li>
                            <a
                                href='index.php?page=visa'
                                className='footer__li'
                            >
                                Immigration Visa Consultancy
                            </a>
                        </li>
                        <li>
                            <a
                                href='index.php?page=flights'
                                className='footer__li'
                            >
                                Airline Tickets
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Address + Socials */}
                <div>
                    <div>
                        <p className='footer__category'>
                            <b>ADDRESS</b>
                        </p>
                        <p className='footer__address'>
                            3rd floor Valero One Center, 102 Valero St., Salcedo
                            Village, Makati City, Philippines
                        </p>
                    </div>

                    <div className='footer__socials'>
                        {/* Lindela Travel */}
                        <div>
                            <p className='footer__category'>
                                <b>LINDELA TRAVEL</b>
                            </p>
                            <ul>
                                <li className='footer__li'>
                                    <a
                                        href='#'
                                        aria-label='Facebook'
                                    >
                                        <img
                                            src={/* fbTravel */ ''}
                                            alt='Facebook'
                                        />
                                    </a>
                                </li>
                                <li className='footer__li'>
                                    <a
                                        href='#'
                                        aria-label='YouTube'
                                    >
                                        <img
                                            src={/* ytTravel */ ''}
                                            alt='YouTube'
                                        />
                                    </a>
                                </li>
                                <li className='footer__li'>
                                    <a
                                        href='#'
                                        aria-label='TikTok'
                                    >
                                        <img
                                            src={/* tiktokTravel */ ''}
                                            alt='TikTok'
                                        />
                                    </a>
                                </li>
                                <li className='footer__li'>
                                    <a
                                        href='#'
                                        aria-label='Instagram'
                                    >
                                        <img
                                            src={/* igTravel */ ''}
                                            alt='Instagram'
                                        />
                                    </a>
                                </li>
                                <li className='footer__li'>
                                    <a
                                        href='#'
                                        aria-label='Twitter'
                                    >
                                        <img
                                            src={/* twitterTravel */ ''}
                                            alt='Twitter'
                                        />
                                    </a>
                                </li>
                                <li className='footer__li'>
                                    <a
                                        href='#'
                                        aria-label='LinkedIn'
                                    >
                                        <img
                                            src={/* linkedinTravel */ ''}
                                            alt='LinkedIn'
                                        />
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Lindela Visa */}
                        <div>
                            <p className='footer__category'>
                                <b>LINDELA VISA</b>
                            </p>
                            <ul>
                                <li className='footer__li'>
                                    <a
                                        href='#'
                                        aria-label='Facebook'
                                    >
                                        <img
                                            src={/* fbVisa */ ''}
                                            alt='Facebook'
                                        />
                                    </a>
                                </li>
                                <li className='footer__li'>
                                    <a
                                        href='#'
                                        aria-label='Instagram'
                                    >
                                        <img
                                            src={/* igVisa */ ''}
                                            alt='Instagram'
                                        />
                                    </a>
                                </li>
                                <li className='footer__li'>
                                    <a
                                        href='#'
                                        aria-label='TikTok'
                                    >
                                        <img
                                            src={/* tiktokVisa */ ''}
                                            alt='TikTok'
                                        />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className='footer__copyright'>
                <p>
                    © {new Date().getFullYear()} Lindela Travel and Tours. All
                    Rights Reserved.
                </p>
            </div>
        </footer>
    )
}
