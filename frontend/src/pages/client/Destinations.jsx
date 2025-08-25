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
        let filtered = tours

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

    const options = tours.map((tour) => ({
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
    }

    const offset = currentPage * toursPerPage
    const currentTours = filteredTours.slice(offset, offset + toursPerPage)
    const pageCount = Math.ceil(filteredTours.length / toursPerPage)

    return (
        <>
            <section className='destinations'>
                <img
                    className='destinations__hero-mobile'
                    src={greatPyramidOfGazaMobile}
                    alt='great-pyramid-of-giza-mobile'
                />
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
                        <b className='text-yellow-300'>Choose</b> your preferred
                        tour package
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
            </section>
            <div className='tours__card-container my-8'>
                <h3 className='text-[#333333] font-bold text-3xl lg:text-3xl mx-auto text-center'>
                    Tour Packages
                </h3>
                {isLoading ? (
                    <p className='tours__loading'>Loading tours...</p>
                ) : currentTours.length === 0 ? (
                    <p className='tours__no-results'>No tours found.</p>
                ) : (
                    currentTours.map((tour) => (
                        <div
                            key={tour.id}
                            className='tour-card'
                        >
                            <Panorama
                                id={tour.id}
                                image={tour.panellum_url}
                                preview={tour.main_image_url}
                            />
                            <div className='tour-card__content'>
                                <h3 className='tour-card__title--destinations'>
                                    {tour.title || 'Tour Title'}
                                </h3>
                                <p className='tour-card__price'>
                                    {tour.dates && tour.dates[0]?.rate_per_pax
                                        ? `PHP ${tour.dates[0].rate_per_pax.toLocaleString()}`
                                        : 'Price N/A'}
                                </p>
                                <PrimaryButton
                                    buttonText='View Details'
                                    isBold={true}
                                    style={{ padding: '0.5rem 1rem' }}
                                    onClick={() =>
                                        navigate(`tour/${tour.id}`, {
                                            state: tour,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
            <section
                id='sectionBenefits'
                className='mt-8 relative'
            >
                <div className='w-full px-4 lg:px-8 xl:px-0 xl:w-[1166px] mx-auto sm:px-8 relative'>
                    <div>
                        <h3 className='font-sans font-bold text-3xl lg:text-3xl xl:text-[32px] mx-auto text-center'>
                            What makes our tours stand out?
                        </h3>
                        <p className='w-full lg:w-1/2 mx-auto text-sm lg:text-base text-gray-400 text-center'>
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

            <TestimonialsSection />
        </>
    )
}
