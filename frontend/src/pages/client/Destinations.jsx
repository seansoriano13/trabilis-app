import { useEffect, useState } from 'react'
import greatPyramidOfGazaMobile from '../../assets/great-pyramid-of-giza-mobile.jpg'
import Select from 'react-select'
import { reactSelectStyles } from '../../styles/client/reactSelectStyles'
import PrimaryButton from '../../components/client/PrimaryButton'
import ReactPaginate from 'react-paginate'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Destinations.css'
import Panorama from '../../components/client/Panorama'
import TestimonialsSection from '../../components/client/TestimonialsSection'
import greatPyramidOfGazaDesktop from '/images/great-pyramid.jpg'

export default function Destinations() {
    const [tours, setTours] = useState([])
    const [filteredTours, setFilteredTours] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isTourSearchErr, setIsTourSearchErr] = useState(false)
    const [selectedTour, setSelectedTour] = useState(null)
    const [searchQuery] = useState('')
    const [priceRange] = useState(null)
    const [currentPage, setCurrentPage] = useState(0)

    

    const toursPerPage = 6

    useEffect(() => {
        const fetchTours = async () => {
            setIsLoading(true)
            try {
                const response = await axios.get(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/api/v1/destinations/tours`
                )
                setTours(response.data)
                setFilteredTours(response.data)
            } catch (error) {
                console.error('Failed to fetch tours:', error)
                setIsTourSearchErr(true)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTours()
    }, [])

    useEffect(() => {
        let filtered = tours.filter((tour) => tour.status === 'PUBLISHED')

        if (searchQuery) {
            filtered = filtered.filter((tour) =>
                tour.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (priceRange) {
            filtered = filtered.filter((tour) => {
                const price = tour.dates && tour.dates[0]?.rate_per_pax
                if (!price) return false
                return price >= priceRange.min && price <= priceRange.max
            })
        }

        setFilteredTours(filtered)
        setCurrentPage(0)
    }, [searchQuery, priceRange, tours])

    const options = tours
        .filter((tour) => tour.status === 'PUBLISHED')
        .map((tour) => ({
            value: tour.title.toLowerCase(),
            label: tour.title,
            id: tour.id,
        }))

    const navigate = useNavigate()

    const handleCheck = () => {
        const selected = tours.find((tour) => tour.id === selectedTour?.id)
        if (selected) {
            navigate(`tour/${selectedTour.id}`, { state: selected })
        }
    }

    const handlePageClick = (data) => {
        setCurrentPage(data.selected)
        
        // Scroll to the tour grid section with navbar offset
        const tourGridElement = document.getElementById('tour-grid')
        if (tourGridElement) {
            const navbarHeight = 120 // Adjust this value based on your navbar height
            const elementPosition = tourGridElement.offsetTop - navbarHeight
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            })
        }
    }

    const offset = currentPage * toursPerPage
    const currentTours = filteredTours.slice(offset, offset + toursPerPage)
    const pageCount = Math.ceil(filteredTours.length / toursPerPage)

    return (
        <>
            <section className='destinations'>
                <picture>
                    {/* Desktop */}
                    <source
                        srcSet={greatPyramidOfGazaDesktop}
                        media='(min-width: 1024px)'
                    />

                    {/* Mobile fallback */}
                    <img
                        className='destinations__hero-mobile'
                        src={greatPyramidOfGazaMobile}
                        alt='great-pyramid-of-giza'
                    />
                </picture>
                <div className='max-w-[1200px] mx-auto'>
                    <div className='tours__promo'>
                        <h1>
                            Let us take you to your{' '}
                            <span className='text-yellow-300'>
                                dream destinations
                            </span>
                        </h1>
                    </div>
                    <form className='tours__form mt-6'>
                        <div className='tours__form-header text-center text-white'>
                            <b className='text-yellow-300'>Choose</b> your
                            preferred tour package
                        </div>
                        <div className='tours__form-row'>
                            <Select
                                required
                                options={options}
                                value={selectedTour}
                                onChange={(option) => setSelectedTour(option)}
                                name='tourSearch'
                                placeholder={
                                    isLoading ? 'Loading...' : 'Choose One'
                                }
                                styles={reactSelectStyles()}
                                isSearchable
                            />
                        </div>
                        <PrimaryButton
                            type='button'
                            onClick={handleCheck}
                            buttonText='Check Availability'
                            isBold={true}
                            style={{ padding: '1rem 2rem' }}
                            loading={isLoading}
                        />
                        {isTourSearchErr && (
                            <p className='tours__search-error'>
                                <b>Error Searching Tours.</b>
                            </p>
                        )}
                    </form>
                </div>
            </section>
            <div id='tour-grid' className='max-w-[1200px] px-5 my-8 mx-auto grid gap-8'>
                <h3 className='text-[#333] font-bold text-3xl lg:text-4xl mx-auto text-center mb-8'>
                    Tour Packages
                </h3>

                {isLoading ? (
                    <div className='flex justify-center items-center py-12'>
                        <div className='flex items-center gap-3 text-gray-600'>
                            <i className='bi-arrow-clockwise animate-spin text-2xl'></i>
                            <span className='text-lg'>Loading tours...</span>
                        </div>
                    </div>
                ) : currentTours.length === 0 ? (
                    <div className='text-center py-12'>
                        <i className='bi-compass text-6xl text-gray-300 mb-4'></i>
                        <p className='text-lg text-gray-600'>No tours found.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {currentTours.map((tour) => (
                            <div
                                key={tour.id}
                                className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-yellow-200 transform hover:-translate-y-2 tour-card-enhanced h-full flex flex-col'
                            >
                                        {/* Image Section */}
                                        <div className='relative h-64 overflow-hidden'>
                                            <div className='tour-card-image h-full'>
                                                <Panorama
                                                    id={tour.id}
                                                    image={tour.panellum_url}
                                                    preview={
                                                        tour.main_image_url
                                                    }
                                                    aspectRatio='16/9'
                                                />
                                            </div>
                                            <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'></div>
                                            <div className='absolute top-4 left-4 pointer-events-none'>
                                                <div className='tour-card-badge rounded-full px-3 py-1 text-xs font-semibold text-gray-700 shadow-lg'>
                                                    <i className='bi-calendar-check mr-1'></i>
                                                    {tour.dates?.length || 0}{' '}
                                                    dates
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className='p-6 flex flex-col flex-1'>
                                            {/* Title */}
                                            <h3 className='text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-yellow-600 transition-colors duration-200 tour-card-title'>
                                                {tour.title || 'Tour Title'}
                                            </h3>

                                            {/* Description */}
                                            <p className='text-gray-600 text-sm mb-4 line-clamp-2 tour-card-desc'>
                                                {tour.description ||
                                                    'Discover amazing destinations with our carefully crafted tour packages.'}
                                            </p>

                                            {/* Available Dates */}
                                            <div className='mb-4'>
                                                <div className='flex items-center gap-2 mb-2'>
                                                    <i className='bi-calendar-event text-yellow-500'></i>
                                                    <span className='text-sm font-semibold text-gray-700'>
                                                        Available Dates
                                                    </span>
                                                </div>
                                                <div className='space-y-1 max-h-20 overflow-y-auto'>
                                                    {tour.dates
                                                        ?.slice(0, 3)
                                                        .map((date, index) => (
                                                            <div
                                                                key={index}
                                                                className='flex items-center gap-2 text-xs text-gray-600'
                                                            >
                                                                <div className='w-1.5 h-1.5 bg-yellow-400 rounded-full'></div>
                                                                <span>
                                                                    {new Date(
                                                                        date.start_date
                                                                    ).toLocaleDateString()}{' '}
                                                                    -{' '}
                                                                    {new Date(
                                                                        date.end_date
                                                                    ).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    {tour.dates?.length > 3 && (
                                                        <div className='text-xs text-yellow-600 font-medium'>
                                                            +
                                                            {tour.dates.length -
                                                                3}{' '}
                                                            more dates
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Price and Duration */}
                                            <div className='flex items-center justify-between mb-6'>
                                                <div className='flex items-center gap-2'>
                                                    <i className='bi-clock text-gray-400'></i>
                                                    <span className='text-sm text-gray-600'>
                                                        {tour.dates?.[0]
                                                            ? Math.ceil(
                                                                  (new Date(
                                                                      tour.dates[0].end_date
                                                                  ) -
                                                                      new Date(
                                                                          tour.dates[0].start_date
                                                                      )) /
                                                                      (1000 *
                                                                          60 *
                                                                          60 *
                                                                          24)
                                                              ) + 1
                                                            : 'N/A'}{' '}
                                                        days
                                                    </span>
                                                </div>
                                                <div className='text-right'>
                                                    <div className='text-2xl font-bold tour-card-price'>
                                                        {tour.dates &&
                                                        tour.dates[0]
                                                            ?.rate_per_pax
                                                            ? `₱${tour.dates[0].rate_per_pax.toLocaleString()}`
                                                            : 'Price N/A'}
                                                    </div>
                                                    <div className='text-xs text-gray-500'>
                                                        per person
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `tour/${tour.id}`,
                                                        {
                                                            state: tour,
                                                        }
                                                    )
                                                }
                                                className='w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group/btn tour-card-button mt-auto'
                                            >
                                                <span>View Details</span>
                                                <i className='bi-arrow-right group-hover/btn:translate-x-1 transition-transform duration-200'></i>
                                            </button>
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className='absolute inset-0 bg-gradient-to-t from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'></div>
                                    </div>
                        ))}
                    </div>
                )}
            </div>

            {pageCount > 1 && (
                <ReactPaginate
                    previousLabel={'← Previous'}
                    nextLabel={'Next →'}
                    pageCount={pageCount}
                    onPageChange={handlePageClick}
                    containerClassName={'tours__pagination'}
                    previousLinkClassName={'tours__pagination-link'}
                    nextLinkClassName={'tours__pagination-link'}
                    disabledClassName={'tours__pagination--disabled'}
                    activeClassName={'tours__pagination--active'}
                    pageClassName={'tours__pagination-page'}
                    breakLabel={'...'}
                    breakClassName={'tours__pagination-break'}
                />
            )}

            <section
                id='sectionBenefits'
                className='mt-8 relative'
            >
                <div className='w-full px-4 lg:px-8 xl:px-0 xl:w-[1166px] mx-auto sm:px-8 relative'>
                    <div>
                        <h3 className='font-sans font-bold text-3xl lg:text-3xl xl:text-[32px] mx-auto text-center'>
                            What makes our tours stand out?
                        </h3>
                        <p className='w-full mx-auto text-sm lg:text-base text-gray-400 text-center'>
                            There are a lot of good things we are eager to tell
                            you, and we'd love to be part of your journey.
                        </p>
                    </div>

                    <div className='my-8 w-full flex flex-col lg:flex-row lg:gap-5'>
                        {[
                            {
                                img: 'https://lindelatravel.com/images/icons/tours-affordable.png',
                                title: 'AFFORDABLE',
                                desc: 'Great deals at a decent price. There’s nowhere else can you find these hot deals.',
                            },
                            {
                                img: 'https://lindelatravel.com/images/icons/tours-luxurious.png',
                                title: 'LUXURIOUS',
                                desc: 'Experience the grandeur of adventurous, peaceful, and breathtaking places with our delicately arranged tours.',
                            },
                            {
                                img: 'https://lindelatravel.com/images/icons/tours-comfortable.png',
                                title: 'COMFORTABLE',
                                desc: 'Worry less and enjoy more as we provide you with a loving service from start to finish.',
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className='flex-1 xl:border border-gray-300 bg-gray-100 rounded-lg py-5 px-0 xl:px-5 flex xl:flex-col items-start xl:items-center justify-center gap-4 xl:gap-0 group'
                            >
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className='h-16 object-center object-contain group-hover:rotate-6 transition-all'
                                />
                                <div>
                                    <div className='font-bold text-base lg:text-lg underline decoration-8 underline-offset-4 decoration-yellow-300/40 group-hover:decoration-yellow-300 text-left xl:text-center xl:mt-2'>
                                        {item.title}
                                    </div>
                                    <p className='text-xs lg:text-sm xl:text-base mt-4 text-left xl:text-center'>
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <TestimonialsSection />
        </>
    )
}
