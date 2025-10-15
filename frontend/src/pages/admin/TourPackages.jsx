import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    FiPlus, 
    FiArrowUp, 
    FiArrowDown, 
    FiEdit3, 
    FiEye, 
    FiEyeOff, 
    FiTrash2, 
    FiPackage,
    FiCalendar,
    FiUsers,
    FiRefreshCw,
    FiTrendingUp,
    FiImage,
    FiMoreVertical
} from 'react-icons/fi'
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
    const [publishingTours, setPublishingTours] = useState(new Set())
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' })
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
            } catch (_err) {
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
        } catch (_err) {
            setError('Failed to delete tour package')
        }
    }

    const handleShowDeleteConfirm = (id) => {
        setShowDeleteConfirm(id)
    }

    const handleCancelDelete = () => {
        setShowDeleteConfirm(null)
    }

    const showSnackbar = (message, type = 'success') => {
        setSnackbar({ show: true, message, type })
        setTimeout(() => {
            setSnackbar({ show: false, message: '', type: 'success' })
        }, 3000)
    }

    const handlePublishClick = async (id) => {
        setPublishingTours(prev => new Set(prev).add(id))
        try {
            // Find the tour to get its current data
            const tour = tourPackages.find(t => t.id === id)
            if (!tour) {
                setError('Tour not found')
                return
            }

            // Send minimal required data for status update
            const updateData = {
                title: tour.title,
                description: tour.description,
                status: 'PUBLISHED',
                main_image_url: tour.main_image_url,
                panellum_url: tour.panellum_url,
                dates: tour.dates || [] // Ensure dates is an array
            }

            await adminClient.put(`/tours/${id}`, updateData)
            setTourPackages(tourPackages.map(tour => 
                tour.id === id ? { ...tour, status: 'PUBLISHED' } : tour
            ))
            showSnackbar('Tour published successfully!', 'success')
        } catch (err) {
            console.error('Publish error:', err.response?.data || err.message)
            setError(`Failed to publish tour package: ${err.response?.data?.error || err.message}`)
        } finally {
            setPublishingTours(prev => {
                const newSet = new Set(prev)
                newSet.delete(id)
                return newSet
            })
        }
    }

    const handleUnpublishClick = async (id) => {
        setPublishingTours(prev => new Set(prev).add(id))
        try {
            // Find the tour to get its current data
            const tour = tourPackages.find(t => t.id === id)
            if (!tour) {
                setError('Tour not found')
                return
            }

            // Send minimal required data for status update
            const updateData = {
                title: tour.title,
                description: tour.description,
                status: 'DRAFT',
                main_image_url: tour.main_image_url,
                panellum_url: tour.panellum_url,
                dates: tour.dates || [] // Ensure dates is an array
            }

            await adminClient.put(`/tours/${id}`, updateData)
            setTourPackages(tourPackages.map(tour => 
                tour.id === id ? { ...tour, status: 'DRAFT' } : tour
            ))
            showSnackbar('Tour unpublished successfully!', 'success')
        } catch (err) {
            console.error('Unpublish error:', err.response?.data || err.message)
            setError(`Failed to unpublish tour package: ${err.response?.data?.error || err.message}`)
        } finally {
            setPublishingTours(prev => {
                const newSet = new Set(prev)
                newSet.delete(id)
                return newSet
            })
        }
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
                <div className='tour-packages__header-content'>
                    <div className='tour-packages__header-icon'>
                        <FiPackage size={32} />
                    </div>
                    <div className='tour-packages__header-text'>
                        <h1>Tour Packages Management</h1>
                        <p>Create, manage, and publish tour packages</p>
                    </div>
                </div>
                <div className='tour-packages__header-actions'>
                    <button
                        className='tour-packages__action-btn tour-packages__action-btn--sort'
                        onClick={handleSortToggle}
                        title={`Sort by ${sortOrder === 'newest' ? 'oldest' : 'newest'}`}
                    >
                        {sortOrder === 'newest' ? <FiArrowDown size={16} /> : <FiArrowUp size={16} />}
                        Sort {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                    </button>
                    <AdminPrimaryButton
                        className='tour-packages__action-btn tour-packages__action-btn--create'
                        onClick={handleCreateTourClick}
                        buttonText='Add Tour Package'
                    />
                </div>
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
                                    <FiImage size={32} />
                                    <span>No Image</span>
                                </div>
                            )}
                            <div className='tour-package-card__status-badge'>
                                <span className={`tour-package-card__status tour-package-card__status--${(tour.status || 'draft').toLowerCase()}`}>
                                    {tour.status || 'DRAFT'}
                                </span>
                            </div>
                        </div>
                        <div className='tour-package-card__content'>
                            <div className='tour-package-card__header'>
                                <h2 className='tour-package-card__title'>
                                    {tour.title}
                                </h2>
                                <button className='tour-package-card__menu-btn'>
                                    <FiMoreVertical size={16} />
                                </button>
                            </div>
                            
                            <div className='tour-package-card__info'>
                                <div className='tour-package-card__info-item'>
                                    <FiCalendar size={16} />
                                    <span>Created: {new Date(tour.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className='tour-package-card__info-item'>
                                    <FiUsers size={16} />
                                    <span>Available slots: {tour.dates?.[0]?.available_slots || 0}</span>
                                </div>
                            </div>

                            <div className='tour-package-card__actions'>
                                <button
                                    className='tour-package-card__button tour-package-card__button--edit'
                                    onClick={() => handleEditClick(tour.id)}
                                    title='Edit Package'
                                >
                                    <FiEdit3 size={16} />
                                    Edit
                                </button>
                                {(tour.status || 'DRAFT') === 'DRAFT' && (
                                    <button
                                        className='tour-package-card__button tour-package-card__button--publish'
                                        onClick={() => handlePublishClick(tour.id)}
                                        disabled={publishingTours.has(tour.id)}
                                        title='Publish Package'
                                    >
                                        {publishingTours.has(tour.id) ? (
                                            <>
                                                <FiRefreshCw size={16} className='spinning' />
                                                Publishing...
                                            </>
                                        ) : (
                                            <>
                                                <FiEye size={16} />
                                                Publish
                                            </>
                                        )}
                                    </button>
                                )}
                                {(tour.status || 'DRAFT') === 'PUBLISHED' && (
                                    <button
                                        className='tour-package-card__button tour-package-card__button--unpublish'
                                        onClick={() => handleUnpublishClick(tour.id)}
                                        disabled={publishingTours.has(tour.id)}
                                        title='Unpublish Package'
                                    >
                                        {publishingTours.has(tour.id) ? (
                                            <>
                                                <FiRefreshCw size={16} className='spinning' />
                                                Unpublishing...
                                            </>
                                        ) : (
                                            <>
                                                <FiEyeOff size={16} />
                                                Unpublish
                                            </>
                                        )}
                                    </button>
                                )}
                                <button
                                    className='tour-package-card__button tour-package-card__button--delete'
                                    onClick={() => handleShowDeleteConfirm(tour.id)}
                                    title='Delete Package'
                                >
                                    <FiTrash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                        {showDeleteConfirm === tour.id && (
                            <div className='tour-package-card__delete-confirm'>
                                <div className='tour-package-card__delete-content'>
                                    <div className='tour-package-card__delete-icon'>
                                        <FiTrash2 size={24} />
                                    </div>
                                    <h3>Delete Package</h3>
                                    <p className='tour-package-card__delete-text'>
                                        Are you sure you want to delete "<strong>{tour.title}</strong>"? This action cannot be undone.
                                    </p>
                                    <div className='tour-package-card__delete-actions'>
                                        <button
                                            className='tour-package-card__button tour-package-card__button--confirm'
                                            onClick={() => handleDeleteClick(tour.id)}
                                        >
                                            <FiTrash2 size={16} />
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
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className='tour-packages__pagination-container'>
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

            {/* Snackbar */}
            {snackbar.show && (
                <div className={`tour-packages__snackbar tour-packages__snackbar--${snackbar.type}`}>
                    <span className="tour-packages__snackbar-message">{snackbar.message}</span>
                    <button 
                        className="tour-packages__snackbar-close"
                        onClick={() => setSnackbar({ show: false, message: '', type: 'success' })}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    )
}

export default TourPackages
