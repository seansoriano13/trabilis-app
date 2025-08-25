import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoSortDesc } from 'react-icons/go'
import ReactPaginate from 'react-paginate'
import AdminPrimaryButton from '../../components/admin/AdminPrimaryButton'
import adminClient from '../../api/adminClient.js'
import './TourPackages.css'

function TourPackages() {
    const navigate = useNavigate()
    const [tourPackages, setTourPackages] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
    const [sortOrder, setSortOrder] = useState('newest')
    const [currentPage, setCurrentPage] = useState(0)
    const itemsPerPage = 6

    useEffect(() => {
        const fetchTourPackages = async () => {
            try {
                const response = await adminClient.get('/tours')
                let sortedPackages = response.data
                if (sortOrder === 'newest') {
                    sortedPackages = sortedPackages.sort(
                        (a, b) =>
                            new Date(b.created_at) - new Date(a.created_at)
                    )
                } else {
                    sortedPackages = sortedPackages.sort(
                        (a, b) =>
                            new Date(a.created_at) - new Date(b.created_at)
                    )
                }
                setTourPackages(sortedPackages)
                setIsLoading(false)
            } catch (err) {
                setError('Failed to load tour packages')
                setIsLoading(false)
            }
        }
        fetchTourPackages()
    }, [sortOrder])

    const handleCreateTourClick = () => {
        navigate('create')
    }

    const handleEditClick = (id) => {
        navigate(`${id}`)
    }

    const handleDeleteClick = async (id) => {
        try {
            await adminClient.delete(`/tours/${id}`)
            setTourPackages(tourPackages.filter((tour) => tour.id !== id))
            setShowDeleteConfirm(null)
        } catch (err) {
            setError('Failed to delete tour package')
        }
    }

    const handleShowDeleteConfirm = (id) => {
        setShowDeleteConfirm(id)
    }

    const handleCancelDelete = () => {
        setShowDeleteConfirm(null)
    }

    const handleSortToggle = () => {
        setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))
        setCurrentPage(0)
    }

    const handlePageClick = (data) => {
        setCurrentPage(data.selected)
    }

    const offset = currentPage * itemsPerPage
    const currentPackages = tourPackages.slice(offset, offset + itemsPerPage)
    const pageCount = Math.ceil(tourPackages.length / itemsPerPage)

    if (isLoading)
        return <div className='tour-packages__loading'>Loading...</div>
    if (error) return <div className='tour-packages__error'>{error}</div>

    return (
        <div className='tour-packages'>
            <div className='tour-packages__header'>
                <AdminPrimaryButton
                    className='tour-packages__sort-button'
                    onClick={handleCreateTourClick}
                    buttonText='Add Tour Package'
                />
                <button
                    className='tour-packages__sort-button'
                    onClick={handleSortToggle}
                    title={`Sort by ${
                        sortOrder === 'newest' ? 'oldest' : 'newest'
                    }`}
                >
                    <GoSortDesc className='tour-packages__sort-icon' />
                    Sort
                </button>
            </div>
            <div className='tour-packages__list'>
                {currentPackages.map((tour) => (
                    <div
                        key={tour.id}
                        className='tour-package-card'
                    >
                        <div className='tour-package-card__image-container'>
                            {tour.main_image_url ? (
                                <img
                                    src={tour.main_image_url}
                                    alt={tour.title}
                                    className='tour-package-card__image'
                                />
                            ) : (
                                <div className='tour-package-card__image-placeholder'>
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className='tour-package-card__content'>
                            <h2 className='tour-package-card__title'>
                                {tour.title}
                            </h2>
                            <p className='tour-package-card__status'>
                                Status: {tour.status}
                            </p>
                            <p className='tour-package-card__created'>
                                Created:{' '}
                                {new Date(tour.created_at).toLocaleDateString()}
                            </p>
                            <p className='tour-package-card__created'>
                                Available slots: {tour.dates[0].available_slots}
                            </p>

                            <div className='tour-package-card__actions'>
                                <button
                                    className='tour-package-card__button tour-package-card__button--edit'
                                    onClick={() => handleEditClick(tour.id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className='tour-package-card__button tour-package-card__button--delete'
                                    onClick={() =>
                                        handleShowDeleteConfirm(tour.id)
                                    }
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        {showDeleteConfirm === tour.id && (
                            <div className='tour-package-card__delete-confirm'>
                                <p className='tour-package-card__delete-text'>
                                    Are you sure you want to delete "
                                    {tour.title}"?
                                </p>
                                <div className='tour-package-card__delete-actions'>
                                    <button
                                        className='tour-package-card__button tour-package-card__button--confirm'
                                        onClick={() =>
                                            handleDeleteClick(tour.id)
                                        }
                                    >
                                        Yes, Delete
                                    </button>
                                    <button
                                        className='tour-package-card__button tour-package-card__button--cancel'
                                        onClick={handleCancelDelete}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <ReactPaginate
                previousLabel={'← Previous'}
                nextLabel={'Next →'}
                pageCount={pageCount}
                onPageChange={handlePageClick}
                containerClassName={'tour-packages__pagination'}
                previousLinkClassName={'tour-packages__pagination-link'}
                nextLinkClassName={'tour-packages__pagination-link'}
                disabledClassName={'tour-packages__pagination--disabled'}
                activeClassName={'tour-packages__pagination--active'}
                pageClassName={'tour-packages__pagination-item'}
                breakLabel={'...'}
                breakClassName={'tour-packages__pagination-break'}
            />
        </div>
    )
}

export default TourPackages
