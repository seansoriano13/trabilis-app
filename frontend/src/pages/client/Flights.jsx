import 'flatpickr/dist/themes/airbnb.css'
import flightsHeroMobile from '../../assets/flights-hero-mobile.jpeg'
import { BsFillAirplaneFill } from 'react-icons/bs'
import { AiOutlineSwap } from 'react-icons/ai'
import Select from 'react-select'
import './Flights.css'
import { useState, useRef, useEffect } from 'react'
import Flatpickr from 'react-flatpickr'
import PrimaryButton from '../../components/client/PrimaryButton'
import {reactSelectStyles} from '../../styles/client/reactSelectStyles'

export default function Flights() {
	// Constants
	const AIRPORTS_URL =
		'https://raw.githubusercontent.com/mwgg/Airports/master/airports.json'

	const tripTypeOptions = [
		{ value: 'round-trip', label: 'Round-trip' },
		{ value: 'one-way', label: 'One-way' },
	]

	// States
	const [options, setOptions] = useState([])
	const [date, setDate] = useState([])
	const [origin, setOrigin] = useState(null)
	const [destination, setDestination] = useState(null)
	const [tripType, setTripType] = useState(tripTypeOptions[0])

	const datepickerRef = useRef()

	const selectStyles = reactSelectStyles

	const handleSwapOrigin = () => {
		setOrigin(destination)
		setDestination(origin)
	}

	useEffect(() => {
		fetch(AIRPORTS_URL)
			.then(res => res.json())
			.then(data => {
				const filteredOptions = Object.entries(data)
					.filter(([, airport]) => airport.iata && airport.name && airport.city && airport.country)
					.map(([code, airport]) => ({
						value: code,
						label: `${airport.name} (${airport.iata}) - ${airport.city}, ${airport.country}`
					}))
					.sort((a, b) => a.label.localeCompare(b.label))
				setOptions(filteredOptions)
			})
			.catch(err => console.error('Failed to fetch airports: ', err))
	},[] )

	return (
		<section className="flights">
			<img
				className="flights__hero-mobile"
				src={flightsHeroMobile}
				alt="flightsHeroMobile"
			/>

			<form className="flights__form">
				<div className="flights__form-header">
					<p>
						<b>Get started</b> by searching for flights.
					</p>
				</div>

				<div className="flights__form-row">
					<Select
						defaultValue={tripType}
						isSearchable={false}
						options={tripTypeOptions}
						onChange={(tripType) => setTripType(tripType)}
						styles={selectStyles()}
					/>

					<Flatpickr
						name="flightDate"
						ref={datepickerRef}
						placeholder="Dates"
						value={date}
						onChange={(selectedDate) => {
							setDate(selectedDate)
							if (
								selectedDate.length === 1 &&
								tripType.value === 'round-trip'
							) {
								setTimeout(() => {
									datepickerRef.current.flatpickr.open()
								}, 0)
							}
						}}
						options={{
							mode:
								tripType.value === 'round-trip'
									? 'range'
									: 'single',
							dateFormat: 'M j, Y',
							disableMobile: true,
							closeOnSelect: false,
							minDate: 'today',
						}}
					/>
				</div>
				<div className="">
					<div>
						<div className="flights__route">
							<Select
								value={origin}
								onChange={setOrigin}
								options={options}
								placeholder="Select Origin"
								isSearchable={true}
								styles={selectStyles()}
							/>
							<button
								onClick={handleSwapOrigin}
								type="button"
								className="flights__swap-btn"
							>
								<AiOutlineSwap />
							</button>
							<Select
								value={destination}
								onChange={setDestination}
								options={options}
								placeholder="Select Destination"
								styles={selectStyles()}
							/>
						</div>
					</div>
				</div>

				<PrimaryButton
					buttonText="Search Flights"
					isBold={false}
					style={{ padding: '1rem 2rem' }}
				/>
			</form>

			<div className="flights__description">
				<h3 className="flights__tagline">Flights</h3>
				<h1 className="flights__headline">Travel smart, save time.</h1>
				<p className="flights__text">
					Lindela provides tailored assistance for airline ticketing,
					helping you secure flights that match your schedule, budget
					and preferences.
				</p>
				<p className="flights__text flights__text--highlight">
					320,170 flights booked and counting
				</p>
				{/* Add plane icon with ::before via CSS */}
			</div>
		</section>
	)
}
