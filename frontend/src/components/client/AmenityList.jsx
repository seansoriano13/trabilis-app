import React from 'react'
import { capitalizeWords } from '../../utils/stringUtils'

const AmenityList = ({ amenities }) => {
    if (!amenities || amenities.length === 0) return null

    return (
        <ul className='flight-amenities__list'>
            {amenities.map((amenity, i) => (
                <li
                    key={i}
                    className='flight-amenities__item'
                >
                    {capitalizeWords(amenity.description)}
                </li>
            ))}
        </ul>
    )
}

export default AmenityList
