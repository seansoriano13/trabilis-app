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
                <form className='tours__form mt-6'>
                    <div className='tours__form-header text-center text-white'>
                        <b>Book</b> your preferred tour package
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
                <div className='tours__promo'>
                    <h1>Let us take you to your dream destinations</h1>
                    <p>
                        Treat yourself and the family to the exciting new
                        adventure we have set up for you.
                    </p>
                    <PrimaryButton
                        buttonText='Destinations'
                        isBold={true}
                        style={{
                            padding: '1rem 2rem',
                            background: 'transparent',
                            border: '1px solid rgb(247 209 0)',
                            color: 'rgb(247 209 0)',
                        }}
                    />
                </div>
            </section>
            <div className='tours__card-container'>
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
                                image={tour.panellum_url}
                                preview={tour.main_image_url}
                            />
                            <div className='tour-card__content'>
                                <h3 className='tour-card__title'>
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
        </>
    )
}
