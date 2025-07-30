export const mockFlightOffers = {
    meta: {
        count: 30,
        links: {
            self: 'https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=SYD&destinationLocationCode=BKK&departureDate=2025-07-31&returnDate=2025-08-01&adults=3&travelClass=ECONOMY&nonStop=false&currencyCode=PHP&max=30',
        },
    },
    data: [
        {
            type: 'flight-offer',
            id: '1',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-31',
            lastTicketingDateTime: '2025-07-31',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT16H',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T21:00:00',
                            },
                            arrival: {
                                iataCode: 'HAK',
                                terminal: '2',
                                at: '2025-08-01T05:00:00',
                            },
                            carrierCode: 'HU',
                            number: '776',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'HU',
                            },
                            duration: 'PT10H',
                            id: '1',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'HAK',
                                terminal: '2',
                                at: '2025-08-01T08:40:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T10:00:00',
                            },
                            carrierCode: 'HU',
                            number: '7939',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'HU',
                            },
                            duration: 'PT2H20M',
                            id: '2',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT15H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T19:20:00',
                            },
                            arrival: {
                                iataCode: 'HAK',
                                terminal: '2',
                                at: '2025-08-01T22:45:00',
                            },
                            carrierCode: 'HU',
                            number: '722',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'HU',
                            },
                            duration: 'PT2H25M',
                            id: '55',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'HAK',
                                terminal: '2',
                                at: '2025-08-02T02:40:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T14:10:00',
                            },
                            carrierCode: 'HU',
                            number: '775',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'HU',
                            },
                            duration: 'PT9H30M',
                            id: '56',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '76680.00',
                base: '35754.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '76680.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['HU'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '25560.00',
                        base: '11918.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '1',
                            cabin: 'ECONOMY',
                            fareBasis: 'QKR779OY',
                            brandedFare: 'BAS',
                            brandedFareLabel: 'ECO BASIC',
                            class: 'Q',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG FIRST',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHECKED BAG SECOND',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE ELIGIBILITY',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BUSINESS LOUNGE ACCESS',
                                    isChargeable: true,
                                    amenityType: 'LOUNGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '2',
                            cabin: 'ECONOMY',
                            fareBasis: 'QKR779OY',
                            brandedFare: 'BAS',
                            brandedFareLabel: 'ECO BASIC',
                            class: 'X',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG FIRST',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHECKED BAG SECOND',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE ELIGIBILITY',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BUSINESS LOUNGE ACCESS',
                                    isChargeable: true,
                                    amenityType: 'LOUNGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '55',
                            cabin: 'ECONOMY',
                            fareBasis: 'QKR779OY',
                            brandedFare: 'BAS',
                            brandedFareLabel: 'ECO BASIC',
                            class: 'X',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG FIRST',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHECKED BAG SECOND',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE ELIGIBILITY',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BUSINESS LOUNGE ACCESS',
                                    isChargeable: true,
                                    amenityType: 'LOUNGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '56',
                            cabin: 'ECONOMY',
                            fareBasis: 'QKR779OY',
                            brandedFare: 'BAS',
                            brandedFareLabel: 'ECO BASIC',
                            class: 'Q',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG FIRST',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHECKED BAG SECOND',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE ELIGIBILITY',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BUSINESS LOUNGE ACCESS',
                                    isChargeable: true,
                                    amenityType: 'LOUNGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '25560.00',
                        base: '11918.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '1',
                            cabin: 'ECONOMY',
                            fareBasis: 'QKR779OY',
                            brandedFare: 'BAS',
                            brandedFareLabel: 'ECO BASIC',
                            class: 'Q',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG FIRST',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHECKED BAG SECOND',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE ELIGIBILITY',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BUSINESS LOUNGE ACCESS',
                                    isChargeable: true,
                                    amenityType: 'LOUNGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '2',
                            cabin: 'ECONOMY',
                            fareBasis: 'QKR779OY',
                            brandedFare: 'BAS',
                            brandedFareLabel: 'ECO BASIC',
                            class: 'X',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG FIRST',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHECKED BAG SECOND',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE ELIGIBILITY',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BUSINESS LOUNGE ACCESS',
                                    isChargeable: true,
                                    amenityType: 'LOUNGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '55',
                            cabin: 'ECONOMY',
                            fareBasis: 'QKR779OY',
                            brandedFare: 'BAS',
                            brandedFareLabel: 'ECO BASIC',
                            class: 'X',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG FIRST',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHECKED BAG SECOND',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE ELIGIBILITY',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BUSINESS LOUNGE ACCESS',
                                    isChargeable: true,
                                    amenityType: 'LOUNGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '56',
                            cabin: 'ECONOMY',
                            fareBasis: 'QKR779OY',
                            brandedFare: 'BAS',
                            brandedFareLabel: 'ECO BASIC',
                            class: 'Q',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG FIRST',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHECKED BAG SECOND',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE ELIGIBILITY',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BUSINESS LOUNGE ACCESS',
                                    isChargeable: true,
                                    amenityType: 'LOUNGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '25560.00',
                        base: '11918.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '1',
                            cabin: 'ECONOMY',
                            fareBasis: 'QKR779OY',
                            brandedFare: 'BAS',
                            brandedFareLabel: 'ECO BASIC',
                            class: 'Q',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG FIRST',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHECKED BAG SECOND',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE ELIGIBILITY',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BUSINESS LOUNGE ACCESS',
                                    isChargeable: true,
                                    amenityType: 'LOUNGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '2',
                            cabin: 'ECONOMY',
                            fareBasis: 'QKR779OY',
                            brandedFare: 'BAS',
                            brandedFareLabel: 'ECO BASIC',
                            class: 'X',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG FIRST',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHECKED BAG SECOND',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE ELIGIBILITY',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BUSINESS LOUNGE ACCESS',
                                    isChargeable: true,
                                    amenityType: 'LOUNGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '55',
                            cabin: 'ECONOMY',
                            fareBasis: 'QKR779OY',
                            brandedFare: 'BAS',
                            brandedFareLabel: 'ECO BASIC',
                            class: 'X',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG FIRST',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHECKED BAG SECOND',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE ELIGIBILITY',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BUSINESS LOUNGE ACCESS',
                                    isChargeable: true,
                                    amenityType: 'LOUNGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '56',
                            cabin: 'ECONOMY',
                            fareBasis: 'QKR779OY',
                            brandedFare: 'BAS',
                            brandedFareLabel: 'ECO BASIC',
                            class: 'Q',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG FIRST',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHECKED BAG SECOND',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE ELIGIBILITY',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BUSINESS LOUNGE ACCESS',
                                    isChargeable: true,
                                    amenityType: 'LOUNGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '2',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-31',
            lastTicketingDateTime: '2025-07-31',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT16H25M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T11:25:00',
                            },
                            arrival: {
                                iataCode: 'XMN',
                                terminal: '3',
                                at: '2025-07-31T18:50:00',
                            },
                            carrierCode: 'MF',
                            number: '802',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'MF',
                            },
                            duration: 'PT9H25M',
                            id: '15',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'XMN',
                                terminal: '3',
                                at: '2025-07-31T22:20:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T00:50:00',
                            },
                            carrierCode: 'MF',
                            number: '843',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'MF',
                            },
                            duration: 'PT3H30M',
                            id: '16',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT18H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T12:15:00',
                            },
                            arrival: {
                                iataCode: 'XMN',
                                terminal: '3',
                                at: '2025-08-01T16:30:00',
                            },
                            carrierCode: 'MF',
                            number: '854',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'MF',
                            },
                            duration: 'PT3H15M',
                            id: '25',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'XMN',
                                terminal: '3',
                                at: '2025-08-01T22:00:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T09:20:00',
                            },
                            carrierCode: 'MF',
                            number: '801',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'MF',
                            },
                            duration: 'PT9H20M',
                            id: '26',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '91614.00',
                base: '37569.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '91614.00',
                additionalServices: [
                    {
                        amount: '22204',
                        type: 'CHECKED_BAGS',
                    },
                ],
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['MF'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '30538.00',
                        base: '12523.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '15',
                            cabin: 'ECONOMY',
                            fareBasis: 'S3M6AAUS',
                            brandedFare: 'YSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'S',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description:
                                        'CHECKED BAG 1PC OF 23KG 158CM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '16',
                            cabin: 'ECONOMY',
                            fareBasis: 'S3M6AAUS',
                            brandedFare: 'YSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'S',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description:
                                        'CHECKED BAG 1PC OF 23KG 158CM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '25',
                            cabin: 'ECONOMY',
                            fareBasis: 'S3M6AAUS',
                            brandedFare: 'YSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'S',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description:
                                        'CHECKED BAG 1PC OF 23KG 158CM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '26',
                            cabin: 'ECONOMY',
                            fareBasis: 'S3M6AAUS',
                            brandedFare: 'YSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'S',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description:
                                        'CHECKED BAG 1PC OF 23KG 158CM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '30538.00',
                        base: '12523.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '15',
                            cabin: 'ECONOMY',
                            fareBasis: 'S3M6AAUS',
                            brandedFare: 'YSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'S',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description:
                                        'CHECKED BAG 1PC OF 23KG 158CM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '16',
                            cabin: 'ECONOMY',
                            fareBasis: 'S3M6AAUS',
                            brandedFare: 'YSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'S',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description:
                                        'CHECKED BAG 1PC OF 23KG 158CM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '25',
                            cabin: 'ECONOMY',
                            fareBasis: 'S3M6AAUS',
                            brandedFare: 'YSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'S',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description:
                                        'CHECKED BAG 1PC OF 23KG 158CM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '26',
                            cabin: 'ECONOMY',
                            fareBasis: 'S3M6AAUS',
                            brandedFare: 'YSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'S',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description:
                                        'CHECKED BAG 1PC OF 23KG 158CM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '30538.00',
                        base: '12523.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '15',
                            cabin: 'ECONOMY',
                            fareBasis: 'S3M6AAUS',
                            brandedFare: 'YSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'S',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description:
                                        'CHECKED BAG 1PC OF 23KG 158CM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '16',
                            cabin: 'ECONOMY',
                            fareBasis: 'S3M6AAUS',
                            brandedFare: 'YSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'S',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description:
                                        'CHECKED BAG 1PC OF 23KG 158CM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '25',
                            cabin: 'ECONOMY',
                            fareBasis: 'S3M6AAUS',
                            brandedFare: 'YSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'S',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description:
                                        'CHECKED BAG 1PC OF 23KG 158CM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '26',
                            cabin: 'ECONOMY',
                            fareBasis: 'S3M6AAUS',
                            brandedFare: 'YSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'S',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description:
                                        'CHECKED BAG 1PC OF 23KG 158CM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE  TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '3',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT13H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '0',
                                at: '2025-07-31T06:55:00',
                            },
                            arrival: {
                                iataCode: 'DPS',
                                terminal: 'I',
                                at: '2025-07-31T11:25:00',
                            },
                            carrierCode: 'OD',
                            number: '172',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'OD',
                            },
                            duration: 'PT6H30M',
                            id: '21',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'DPS',
                                terminal: 'D',
                                at: '2025-07-31T14:20:00',
                            },
                            arrival: {
                                iataCode: 'DMK',
                                terminal: '0',
                                at: '2025-07-31T17:45:00',
                            },
                            carrierCode: 'ID',
                            number: '7637',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'ID',
                            },
                            duration: 'PT4H25M',
                            id: '22',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT13H15M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'DMK',
                                terminal: '1',
                                at: '2025-08-01T13:50:00',
                            },
                            arrival: {
                                iataCode: 'DPS',
                                terminal: 'D',
                                at: '2025-08-01T19:15:00',
                            },
                            carrierCode: 'ID',
                            number: '7636',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'ID',
                            },
                            duration: 'PT4H25M',
                            id: '35',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'DPS',
                                terminal: 'I',
                                at: '2025-08-01T22:15:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '0',
                                at: '2025-08-02T06:05:00',
                            },
                            carrierCode: 'OD',
                            number: '171',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'OD',
                            },
                            duration: 'PT5H50M',
                            id: '36',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '103962.00',
                base: '78513.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '103962.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: false,
            },
            validatingAirlineCodes: ['GP'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '34654.00',
                        base: '26171.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '21',
                            cabin: 'ECONOMY',
                            fareBasis: 'VRTBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '22',
                            cabin: 'ECONOMY',
                            fareBasis: 'QRTID',
                            class: 'Q',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '35',
                            cabin: 'ECONOMY',
                            fareBasis: 'XRTID',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '36',
                            cabin: 'ECONOMY',
                            fareBasis: 'XRTBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '34654.00',
                        base: '26171.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '21',
                            cabin: 'ECONOMY',
                            fareBasis: 'VRTBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '22',
                            cabin: 'ECONOMY',
                            fareBasis: 'QRTID',
                            class: 'Q',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '35',
                            cabin: 'ECONOMY',
                            fareBasis: 'XRTID',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '36',
                            cabin: 'ECONOMY',
                            fareBasis: 'XRTBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '34654.00',
                        base: '26171.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '21',
                            cabin: 'ECONOMY',
                            fareBasis: 'VRTBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '22',
                            cabin: 'ECONOMY',
                            fareBasis: 'QRTID',
                            class: 'Q',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '35',
                            cabin: 'ECONOMY',
                            fareBasis: 'XRTID',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '36',
                            cabin: 'ECONOMY',
                            fareBasis: 'XRTBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '4',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-31',
            lastTicketingDateTime: '2025-07-31',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT14H40M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T10:15:00',
                            },
                            arrival: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-07-31T17:00:00',
                            },
                            carrierCode: 'PR',
                            number: '212',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'PR',
                            },
                            duration: 'PT8H45M',
                            id: '17',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-07-31T19:25:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-07-31T21:55:00',
                            },
                            carrierCode: 'PR',
                            number: '732',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'PR',
                            },
                            duration: 'PT3H30M',
                            id: '18',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT15H30M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T13:30:00',
                            },
                            arrival: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-08-01T18:00:00',
                            },
                            carrierCode: 'PR',
                            number: '731',
                            aircraft: {
                                code: '773',
                            },
                            operating: {
                                carrierCode: 'PR',
                            },
                            duration: 'PT3H30M',
                            id: '43',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-08-01T21:15:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T08:00:00',
                            },
                            carrierCode: 'PR',
                            number: '211',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'PR',
                            },
                            duration: 'PT8H45M',
                            id: '44',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '104442.00',
                base: '59055.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '104442.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['PR'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '34814.00',
                        base: '19685.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '17',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '18',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '43',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '44',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '34814.00',
                        base: '19685.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '17',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '18',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '43',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '44',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '34814.00',
                        base: '19685.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '17',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '18',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '43',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '44',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '5',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-31',
            lastTicketingDateTime: '2025-07-31',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT29H',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T10:15:00',
                            },
                            arrival: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-07-31T17:00:00',
                            },
                            carrierCode: 'PR',
                            number: '212',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'PR',
                            },
                            duration: 'PT8H45M',
                            id: '3',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-08-01T09:40:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T12:15:00',
                            },
                            carrierCode: 'PR',
                            number: '730',
                            aircraft: {
                                code: '773',
                            },
                            operating: {
                                carrierCode: 'PR',
                            },
                            duration: 'PT3H35M',
                            id: '4',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT30H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T22:55:00',
                            },
                            arrival: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-08-02T03:30:00',
                            },
                            carrierCode: 'PR',
                            number: '733',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'PR',
                            },
                            duration: 'PT3H35M',
                            id: '29',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-08-02T21:15:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-03T08:00:00',
                            },
                            carrierCode: 'PR',
                            number: '211',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'PR',
                            },
                            duration: 'PT8H45M',
                            id: '30',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '104442.00',
                base: '59055.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '104442.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['PR'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '34814.00',
                        base: '19685.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '3',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '4',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '29',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '30',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '34814.00',
                        base: '19685.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '3',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '4',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '29',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '30',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '34814.00',
                        base: '19685.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '3',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '4',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '29',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '30',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '6',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-31',
            lastTicketingDateTime: '2025-07-31',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT14H40M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T10:15:00',
                            },
                            arrival: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-07-31T17:00:00',
                            },
                            carrierCode: 'PR',
                            number: '212',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'PR',
                            },
                            duration: 'PT8H45M',
                            id: '17',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-07-31T19:25:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-07-31T21:55:00',
                            },
                            carrierCode: 'PR',
                            number: '732',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'PR',
                            },
                            duration: 'PT3H30M',
                            id: '18',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT30H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T22:55:00',
                            },
                            arrival: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-08-02T03:30:00',
                            },
                            carrierCode: 'PR',
                            number: '733',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'PR',
                            },
                            duration: 'PT3H35M',
                            id: '29',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-08-02T21:15:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-03T08:00:00',
                            },
                            carrierCode: 'PR',
                            number: '211',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'PR',
                            },
                            duration: 'PT8H45M',
                            id: '30',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '104442.00',
                base: '59055.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '104442.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['PR'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '34814.00',
                        base: '19685.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '17',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '18',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '29',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '30',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '34814.00',
                        base: '19685.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '17',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '18',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '29',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '30',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '34814.00',
                        base: '19685.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '17',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '18',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '29',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '30',
                            cabin: 'ECONOMY',
                            fareBasis: 'TBAU',
                            class: 'T',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '7',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-31',
            lastTicketingDateTime: '2025-07-31',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT12H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T16:00:00',
                            },
                            carrierCode: 'VN',
                            number: '772',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT8H45M',
                            id: '19',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T18:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-07-31T20:05:00',
                            },
                            carrierCode: 'VN',
                            number: '609',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H35M',
                            id: '20',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT17H55M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T11:20:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-01T13:05:00',
                            },
                            carrierCode: 'VN',
                            number: '600',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H45M',
                            id: '57',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-01T20:50:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T08:15:00',
                            },
                            carrierCode: 'VN',
                            number: '773',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT8H25M',
                            id: '58',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '107247.00',
                base: '60180.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '107247.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['VN'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '35749.00',
                        base: '20060.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '57',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '58',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '35749.00',
                        base: '20060.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '57',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '58',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '35749.00',
                        base: '20060.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '57',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '58',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '8',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-31',
            lastTicketingDateTime: '2025-07-31',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT27H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T16:00:00',
                            },
                            carrierCode: 'VN',
                            number: '772',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT8H45M',
                            id: '7',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-01T08:45:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T10:20:00',
                            },
                            carrierCode: 'VN',
                            number: '601',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H35M',
                            id: '8',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT17H20M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T15:55:00',
                            },
                            arrival: {
                                iataCode: 'HAN',
                                terminal: '2',
                                at: '2025-08-01T17:50:00',
                            },
                            carrierCode: 'VN',
                            number: '614',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H55M',
                            id: '39',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'HAN',
                                terminal: '2',
                                at: '2025-08-01T23:50:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T12:15:00',
                            },
                            carrierCode: 'VN',
                            number: '787',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT9H25M',
                            id: '40',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '107721.00',
                base: '60180.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '107721.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['VN'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '35907.00',
                        base: '20060.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '39',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '40',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '35907.00',
                        base: '20060.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '39',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '40',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '35907.00',
                        base: '20060.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '39',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '40',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '9',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-31',
            lastTicketingDateTime: '2025-07-31',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT12H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T16:00:00',
                            },
                            carrierCode: 'VN',
                            number: '772',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT8H45M',
                            id: '19',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T18:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-07-31T20:05:00',
                            },
                            carrierCode: 'VN',
                            number: '609',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H35M',
                            id: '20',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT17H20M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T15:55:00',
                            },
                            arrival: {
                                iataCode: 'HAN',
                                terminal: '2',
                                at: '2025-08-01T17:50:00',
                            },
                            carrierCode: 'VN',
                            number: '614',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H55M',
                            id: '39',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'HAN',
                                terminal: '2',
                                at: '2025-08-01T23:50:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T12:15:00',
                            },
                            carrierCode: 'VN',
                            number: '787',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT9H25M',
                            id: '40',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '111765.00',
                base: '60180.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '111765.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['VN'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '37255.00',
                        base: '20060.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '39',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '40',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '37255.00',
                        base: '20060.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '39',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '40',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '37255.00',
                        base: '20060.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '39',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '40',
                            cabin: 'ECONOMY',
                            fareBasis: 'RL1YAU',
                            class: 'R',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '10',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-31',
            lastTicketingDateTime: '2025-07-31',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT12H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T16:00:00',
                            },
                            carrierCode: 'VN',
                            number: '772',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT8H45M',
                            id: '19',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T18:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-07-31T20:05:00',
                            },
                            carrierCode: 'VN',
                            number: '609',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H35M',
                            id: '20',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT14H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T14:25:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-01T16:15:00',
                            },
                            carrierCode: 'VN',
                            number: '604',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H50M',
                            id: '51',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-01T20:50:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T08:15:00',
                            },
                            carrierCode: 'VN',
                            number: '773',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT8H25M',
                            id: '52',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '112872.00',
                base: '65805.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '112872.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['VN'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '37624.00',
                        base: '21935.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '51',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '52',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '37624.00',
                        base: '21935.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '51',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '52',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '37624.00',
                        base: '21935.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '51',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '52',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '11',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-31',
            lastTicketingDateTime: '2025-07-31',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT27H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T16:00:00',
                            },
                            carrierCode: 'VN',
                            number: '772',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT8H45M',
                            id: '7',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-01T08:45:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T10:20:00',
                            },
                            carrierCode: 'VN',
                            number: '601',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H35M',
                            id: '8',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT14H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T14:25:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-01T16:15:00',
                            },
                            carrierCode: 'VN',
                            number: '604',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H50M',
                            id: '51',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-01T20:50:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T08:15:00',
                            },
                            carrierCode: 'VN',
                            number: '773',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT8H25M',
                            id: '52',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '112872.00',
                base: '65805.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '112872.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['VN'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '37624.00',
                        base: '21935.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '51',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '52',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '37624.00',
                        base: '21935.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '51',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '52',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '37624.00',
                        base: '21935.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '51',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '52',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '12',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-31',
            lastTicketingDateTime: '2025-07-31',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT27H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T16:00:00',
                            },
                            carrierCode: 'VN',
                            number: '772',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT8H45M',
                            id: '7',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-01T08:45:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T10:20:00',
                            },
                            carrierCode: 'VN',
                            number: '601',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H35M',
                            id: '8',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT14H10M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T19:05:00',
                            },
                            arrival: {
                                iataCode: 'HAN',
                                terminal: '2',
                                at: '2025-08-01T21:00:00',
                            },
                            carrierCode: 'VN',
                            number: '618',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H55M',
                            id: '33',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'HAN',
                                terminal: '2',
                                at: '2025-08-01T23:50:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T12:15:00',
                            },
                            carrierCode: 'VN',
                            number: '787',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT9H25M',
                            id: '34',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '113346.00',
                base: '65805.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '113346.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['VN'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '37782.00',
                        base: '21935.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '33',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '34',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '37782.00',
                        base: '21935.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '33',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '34',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '37782.00',
                        base: '21935.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '33',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '34',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '13',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 7,
            itineraries: [
                {
                    duration: 'PT15H20M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '0',
                                at: '2025-07-31T06:55:00',
                            },
                            arrival: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-07-31T16:25:00',
                            },
                            carrierCode: 'OD',
                            number: '172',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'OD',
                            },
                            duration: 'PT11H30M',
                            stops: [
                                {
                                    iataCode: 'DPS',
                                    duration: 'PT1H50M',
                                    arrivalAt: '2025-07-31T11:25:00',
                                    departureAt: '2025-07-31T13:15:00',
                                },
                            ],
                            id: '11',
                            numberOfStops: 1,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-07-31T18:05:00',
                            },
                            arrival: {
                                iataCode: 'DMK',
                                terminal: '0',
                                at: '2025-07-31T19:15:00',
                            },
                            carrierCode: 'OD',
                            number: '522',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'OD',
                            },
                            duration: 'PT2H10M',
                            id: '12',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT13H15M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'DMK',
                                terminal: '1',
                                at: '2025-08-01T13:50:00',
                            },
                            arrival: {
                                iataCode: 'DPS',
                                terminal: 'D',
                                at: '2025-08-01T19:15:00',
                            },
                            carrierCode: 'ID',
                            number: '7636',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'ID',
                            },
                            duration: 'PT4H25M',
                            id: '35',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'DPS',
                                terminal: 'I',
                                at: '2025-08-01T22:15:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '0',
                                at: '2025-08-02T06:05:00',
                            },
                            carrierCode: 'OD',
                            number: '171',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'OD',
                            },
                            duration: 'PT5H50M',
                            id: '36',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '114099.00',
                base: '84702.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '114099.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: false,
            },
            validatingAirlineCodes: ['GP'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '38033.00',
                        base: '28234.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '11',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '12',
                            cabin: 'ECONOMY',
                            fareBasis: 'X1OBSSMY',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '35',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWTH',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '36',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '38033.00',
                        base: '28234.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '11',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '12',
                            cabin: 'ECONOMY',
                            fareBasis: 'X1OBSSMY',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '35',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWTH',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '36',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '38033.00',
                        base: '28234.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '11',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '12',
                            cabin: 'ECONOMY',
                            fareBasis: 'X1OBSSMY',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '35',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWTH',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '36',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '14',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 7,
            itineraries: [
                {
                    duration: 'PT28H20M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '0',
                                at: '2025-07-31T06:55:00',
                            },
                            arrival: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-07-31T16:25:00',
                            },
                            carrierCode: 'OD',
                            number: '172',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'OD',
                            },
                            duration: 'PT11H30M',
                            stops: [
                                {
                                    iataCode: 'DPS',
                                    duration: 'PT1H50M',
                                    arrivalAt: '2025-07-31T11:25:00',
                                    departureAt: '2025-07-31T13:15:00',
                                },
                            ],
                            id: '13',
                            numberOfStops: 1,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-01T07:05:00',
                            },
                            arrival: {
                                iataCode: 'DMK',
                                terminal: '0',
                                at: '2025-08-01T08:15:00',
                            },
                            carrierCode: 'OD',
                            number: '524',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'OD',
                            },
                            duration: 'PT2H10M',
                            id: '14',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT13H15M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'DMK',
                                terminal: '1',
                                at: '2025-08-01T13:50:00',
                            },
                            arrival: {
                                iataCode: 'DPS',
                                terminal: 'D',
                                at: '2025-08-01T19:15:00',
                            },
                            carrierCode: 'ID',
                            number: '7636',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'ID',
                            },
                            duration: 'PT4H25M',
                            id: '35',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'DPS',
                                terminal: 'I',
                                at: '2025-08-01T22:15:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '0',
                                at: '2025-08-02T06:05:00',
                            },
                            carrierCode: 'OD',
                            number: '171',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'OD',
                            },
                            duration: 'PT5H50M',
                            id: '36',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '114465.00',
                base: '84702.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '114465.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: false,
            },
            validatingAirlineCodes: ['GP'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '38155.00',
                        base: '28234.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '13',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '14',
                            cabin: 'ECONOMY',
                            fareBasis: 'X1OBSSMY',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '35',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWTH',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '36',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '38155.00',
                        base: '28234.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '13',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '14',
                            cabin: 'ECONOMY',
                            fareBasis: 'X1OBSSMY',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '35',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWTH',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '36',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '38155.00',
                        base: '28234.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '13',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '14',
                            cabin: 'ECONOMY',
                            fareBasis: 'X1OBSSMY',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '35',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWTH',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '36',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '15',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT14H20M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T20:45:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T03:10:00',
                            },
                            carrierCode: 'TR',
                            number: '13',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT8H25M',
                            id: '9',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T06:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T08:05:00',
                            },
                            carrierCode: 'TR',
                            number: '608',
                            aircraft: {
                                code: '320',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H35M',
                            id: '10',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT12H10M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T20:25:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T23:45:00',
                            },
                            carrierCode: 'TR',
                            number: '617',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H20M',
                            id: '31',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-02T02:00:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T11:35:00',
                            },
                            carrierCode: 'TR',
                            number: '2',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT7H35M',
                            id: '32',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '117234.00',
                base: '79863.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '117234.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['SQ'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '39078.00',
                        base: '26621.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '9',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '10',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '31',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '32',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '39078.00',
                        base: '26621.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '9',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '10',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '31',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '32',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '39078.00',
                        base: '26621.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '9',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '10',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '31',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '32',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '16',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT16H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T20:45:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T03:10:00',
                            },
                            carrierCode: 'TR',
                            number: '13',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT8H25M',
                            id: '5',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T08:20:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T09:50:00',
                            },
                            carrierCode: 'TR',
                            number: '624',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H30M',
                            id: '6',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT12H10M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T20:25:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T23:45:00',
                            },
                            carrierCode: 'TR',
                            number: '617',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H20M',
                            id: '31',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-02T02:00:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T11:35:00',
                            },
                            carrierCode: 'TR',
                            number: '2',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT7H35M',
                            id: '32',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '117234.00',
                base: '79863.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '117234.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['SQ'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '39078.00',
                        base: '26621.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '5',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '6',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '31',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '32',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '39078.00',
                        base: '26621.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '5',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '6',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '31',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '32',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '39078.00',
                        base: '26621.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '5',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '6',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '31',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '32',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '17',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT14H20M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T20:45:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T03:10:00',
                            },
                            carrierCode: 'TR',
                            number: '13',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT8H25M',
                            id: '9',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T06:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T08:05:00',
                            },
                            carrierCode: 'TR',
                            number: '608',
                            aircraft: {
                                code: '320',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H35M',
                            id: '10',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT14H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T17:45:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T21:05:00',
                            },
                            carrierCode: 'TR',
                            number: '611',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H20M',
                            id: '53',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-02T02:00:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T11:35:00',
                            },
                            carrierCode: 'TR',
                            number: '2',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT7H35M',
                            id: '54',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '117234.00',
                base: '79863.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '117234.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['SQ'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '39078.00',
                        base: '26621.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '9',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '10',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '53',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '54',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '39078.00',
                        base: '26621.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '9',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '10',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '53',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '54',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '39078.00',
                        base: '26621.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '9',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '10',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '53',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '54',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '18',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT16H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T20:45:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T03:10:00',
                            },
                            carrierCode: 'TR',
                            number: '13',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT8H25M',
                            id: '5',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T08:20:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T09:50:00',
                            },
                            carrierCode: 'TR',
                            number: '624',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H30M',
                            id: '6',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT14H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T17:45:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T21:05:00',
                            },
                            carrierCode: 'TR',
                            number: '611',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H20M',
                            id: '53',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-02T02:00:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T11:35:00',
                            },
                            carrierCode: 'TR',
                            number: '2',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT7H35M',
                            id: '54',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '117234.00',
                base: '79863.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '117234.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['SQ'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '39078.00',
                        base: '26621.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '5',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '6',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '53',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '54',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '39078.00',
                        base: '26621.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '5',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '6',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '53',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '54',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '39078.00',
                        base: '26621.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '5',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '6',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '53',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '54',
                            cabin: 'ECONOMY',
                            fareBasis: 'N2TR24',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '19',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-31',
            lastTicketingDateTime: '2025-07-31',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT12H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T16:00:00',
                            },
                            carrierCode: 'VN',
                            number: '772',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT8H45M',
                            id: '19',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T18:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-07-31T20:05:00',
                            },
                            carrierCode: 'VN',
                            number: '609',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H35M',
                            id: '20',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT14H10M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T19:05:00',
                            },
                            arrival: {
                                iataCode: 'HAN',
                                terminal: '2',
                                at: '2025-08-01T21:00:00',
                            },
                            carrierCode: 'VN',
                            number: '618',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H55M',
                            id: '33',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'HAN',
                                terminal: '2',
                                at: '2025-08-01T23:50:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T12:15:00',
                            },
                            carrierCode: 'VN',
                            number: '787',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT9H25M',
                            id: '34',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '117390.00',
                base: '65805.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '117390.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['VN'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '39130.00',
                        base: '21935.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '33',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '34',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '39130.00',
                        base: '21935.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '33',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '34',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '39130.00',
                        base: '21935.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TL1YAU',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '33',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '34',
                            cabin: 'ECONOMY',
                            fareBasis: 'NL1YAU',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '20',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT14H20M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T20:45:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T03:10:00',
                            },
                            carrierCode: 'TR',
                            number: '13',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT8H25M',
                            id: '9',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T06:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T08:05:00',
                            },
                            carrierCode: 'TR',
                            number: '608',
                            aircraft: {
                                code: '320',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H35M',
                            id: '10',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT20H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T20:25:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T23:45:00',
                            },
                            carrierCode: 'TR',
                            number: '617',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H20M',
                            id: '27',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-02T10:00:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T19:30:00',
                            },
                            carrierCode: 'TR',
                            number: '12',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT7H30M',
                            id: '28',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '123423.00',
                base: '86052.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '123423.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['SQ'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41141.00',
                        base: '28684.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '9',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '10',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '27',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '28',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41141.00',
                        base: '28684.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '9',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '10',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '27',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '28',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41141.00',
                        base: '28684.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '9',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '10',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '27',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '28',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '21',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT16H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T20:45:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T03:10:00',
                            },
                            carrierCode: 'TR',
                            number: '13',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT8H25M',
                            id: '5',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T08:20:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T09:50:00',
                            },
                            carrierCode: 'TR',
                            number: '624',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H30M',
                            id: '6',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT20H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T20:25:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T23:45:00',
                            },
                            carrierCode: 'TR',
                            number: '617',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H20M',
                            id: '27',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-02T10:00:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T19:30:00',
                            },
                            carrierCode: 'TR',
                            number: '12',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT7H30M',
                            id: '28',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '123423.00',
                base: '86052.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '123423.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['SQ'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41141.00',
                        base: '28684.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '5',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '6',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '27',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '28',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41141.00',
                        base: '28684.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '5',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '6',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '27',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '28',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41141.00',
                        base: '28684.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '5',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '6',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '27',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '28',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '22',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT14H20M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T20:45:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T03:10:00',
                            },
                            carrierCode: 'TR',
                            number: '13',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT8H25M',
                            id: '9',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T06:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T08:05:00',
                            },
                            carrierCode: 'TR',
                            number: '608',
                            aircraft: {
                                code: '320',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H35M',
                            id: '10',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT22H45M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T17:45:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T21:05:00',
                            },
                            carrierCode: 'TR',
                            number: '611',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H20M',
                            id: '49',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-02T10:00:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T19:30:00',
                            },
                            carrierCode: 'TR',
                            number: '12',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT7H30M',
                            id: '50',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '123423.00',
                base: '86052.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '123423.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['SQ'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41141.00',
                        base: '28684.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '9',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '10',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '49',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '50',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41141.00',
                        base: '28684.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '9',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '10',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '49',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '50',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41141.00',
                        base: '28684.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '9',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '10',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '49',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '50',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '23',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT16H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T20:45:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T03:10:00',
                            },
                            carrierCode: 'TR',
                            number: '13',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT8H25M',
                            id: '5',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T08:20:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T09:50:00',
                            },
                            carrierCode: 'TR',
                            number: '624',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H30M',
                            id: '6',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT22H45M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-08-01T17:45:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-01T21:05:00',
                            },
                            carrierCode: 'TR',
                            number: '611',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT2H20M',
                            id: '49',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-02T10:00:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T19:30:00',
                            },
                            carrierCode: 'TR',
                            number: '12',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT7H30M',
                            id: '50',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '123423.00',
                base: '86052.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '123423.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['SQ'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41141.00',
                        base: '28684.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '5',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '6',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '49',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '50',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41141.00',
                        base: '28684.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '5',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '6',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '49',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '50',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41141.00',
                        base: '28684.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '5',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '6',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '49',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '50',
                            cabin: 'ECONOMY',
                            fareBasis: 'W2TR24',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '24',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 5,
            itineraries: [
                {
                    duration: 'PT13H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '0',
                                at: '2025-07-31T06:55:00',
                            },
                            arrival: {
                                iataCode: 'DPS',
                                terminal: 'I',
                                at: '2025-07-31T11:25:00',
                            },
                            carrierCode: 'OD',
                            number: '172',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'OD',
                            },
                            duration: 'PT6H30M',
                            id: '21',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'DPS',
                                terminal: 'D',
                                at: '2025-07-31T14:20:00',
                            },
                            arrival: {
                                iataCode: 'DMK',
                                terminal: '0',
                                at: '2025-07-31T17:45:00',
                            },
                            carrierCode: 'ID',
                            number: '7637',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'ID',
                            },
                            duration: 'PT4H25M',
                            id: '22',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT15H15M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'DMK',
                                terminal: '0',
                                at: '2025-08-01T11:50:00',
                            },
                            arrival: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-01T15:00:00',
                            },
                            carrierCode: 'OD',
                            number: '521',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'OD',
                            },
                            duration: 'PT2H10M',
                            id: '37',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-01T17:50:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '0',
                                at: '2025-08-02T06:05:00',
                            },
                            carrierCode: 'OD',
                            number: '171',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'OD',
                            },
                            duration: 'PT10H15M',
                            stops: [
                                {
                                    iataCode: 'DPS',
                                    duration: 'PT1H15M',
                                    arrivalAt: '2025-08-01T21:00:00',
                                    departureAt: '2025-08-01T22:15:00',
                                },
                            ],
                            id: '38',
                            numberOfStops: 1,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '123660.00',
                base: '94263.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '123660.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: false,
            },
            validatingAirlineCodes: ['GP'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41220.00',
                        base: '31421.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '21',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '22',
                            cabin: 'ECONOMY',
                            fareBasis: 'QOWID',
                            class: 'Q',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '37',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSTH',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '38',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41220.00',
                        base: '31421.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '21',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '22',
                            cabin: 'ECONOMY',
                            fareBasis: 'QOWID',
                            class: 'Q',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '37',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSTH',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '38',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41220.00',
                        base: '31421.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '21',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '22',
                            cabin: 'ECONOMY',
                            fareBasis: 'QOWID',
                            class: 'Q',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '37',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSTH',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '38',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '25',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT13H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '0',
                                at: '2025-07-31T06:55:00',
                            },
                            arrival: {
                                iataCode: 'DPS',
                                terminal: 'I',
                                at: '2025-07-31T11:25:00',
                            },
                            carrierCode: 'OD',
                            number: '172',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'OD',
                            },
                            duration: 'PT6H30M',
                            id: '21',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'DPS',
                                terminal: 'D',
                                at: '2025-07-31T14:20:00',
                            },
                            arrival: {
                                iataCode: 'DMK',
                                terminal: '0',
                                at: '2025-07-31T17:45:00',
                            },
                            carrierCode: 'ID',
                            number: '7637',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'ID',
                            },
                            duration: 'PT4H25M',
                            id: '22',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT18H',
                    segments: [
                        {
                            departure: {
                                iataCode: 'DMK',
                                terminal: '0',
                                at: '2025-08-01T09:05:00',
                            },
                            arrival: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-01T12:15:00',
                            },
                            carrierCode: 'OD',
                            number: '525',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'OD',
                            },
                            duration: 'PT2H10M',
                            id: '23',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-01T17:50:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '0',
                                at: '2025-08-02T06:05:00',
                            },
                            carrierCode: 'OD',
                            number: '171',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'OD',
                            },
                            duration: 'PT10H15M',
                            stops: [
                                {
                                    iataCode: 'DPS',
                                    duration: 'PT1H15M',
                                    arrivalAt: '2025-08-01T21:00:00',
                                    departureAt: '2025-08-01T22:15:00',
                                },
                            ],
                            id: '24',
                            numberOfStops: 1,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '123660.00',
                base: '94263.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '123660.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: false,
            },
            validatingAirlineCodes: ['GP'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41220.00',
                        base: '31421.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '21',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '22',
                            cabin: 'ECONOMY',
                            fareBasis: 'QOWID',
                            class: 'Q',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '23',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSTH',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '24',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41220.00',
                        base: '31421.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '21',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '22',
                            cabin: 'ECONOMY',
                            fareBasis: 'QOWID',
                            class: 'Q',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '23',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSTH',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '24',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '41220.00',
                        base: '31421.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '21',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '22',
                            cabin: 'ECONOMY',
                            fareBasis: 'QOWID',
                            class: 'Q',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '23',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSTH',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '24',
                            cabin: 'ECONOMY',
                            fareBasis: 'XOWBSSAU',
                            brandedFare: 'SS',
                            brandedFareLabel: 'SUPER SAVER',
                            class: 'X',
                            includedCheckedBags: {
                                weight: 0,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'UPTO44LB 20KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO66LB 30KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO88LB40KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPTO22LB 10KG BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEALS',
                                    isChargeable: true,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '26',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 7,
            itineraries: [
                {
                    duration: 'PT12H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T16:00:00',
                            },
                            carrierCode: 'VN',
                            number: '772',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT8H45M',
                            id: '19',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T18:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-07-31T20:05:00',
                            },
                            carrierCode: 'VN',
                            number: '609',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H35M',
                            id: '20',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT15H35M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                terminal: 'I',
                                at: '2025-08-01T21:40:00',
                            },
                            arrival: {
                                iataCode: 'MEL',
                                terminal: '2',
                                at: '2025-08-02T09:20:00',
                            },
                            carrierCode: 'JQ',
                            number: '30',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT8H40M',
                            id: '47',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'AVV',
                                terminal: 'D',
                                at: '2025-08-02T14:55:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '2',
                                at: '2025-08-02T16:15:00',
                            },
                            carrierCode: 'JQ',
                            number: '608',
                            aircraft: {
                                code: '320',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT1H20M',
                            id: '48',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '130824.00',
                base: '94599.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '130824.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['VN'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '43608.00',
                        base: '31533.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TLOXAUP',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TOXVN',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '47',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW2',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '48',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '43608.00',
                        base: '31533.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TLOXAUP',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TOXVN',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '47',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW2',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '48',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '43608.00',
                        base: '31533.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TLOXAUP',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TOXVN',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '47',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW2',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '48',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '27',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT12H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T16:00:00',
                            },
                            carrierCode: 'VN',
                            number: '772',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT8H45M',
                            id: '19',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T18:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-07-31T20:05:00',
                            },
                            carrierCode: 'VN',
                            number: '609',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H35M',
                            id: '20',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT17H25M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                terminal: 'I',
                                at: '2025-08-01T21:40:00',
                            },
                            arrival: {
                                iataCode: 'MEL',
                                terminal: '2',
                                at: '2025-08-02T09:20:00',
                            },
                            carrierCode: 'JQ',
                            number: '30',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT8H40M',
                            id: '41',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'AVV',
                                terminal: 'D',
                                at: '2025-08-02T16:40:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '2',
                                at: '2025-08-02T18:05:00',
                            },
                            carrierCode: 'JQ',
                            number: '610',
                            aircraft: {
                                code: '320',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT1H25M',
                            id: '42',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '130824.00',
                base: '94599.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '130824.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['VN'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '43608.00',
                        base: '31533.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TLOXAUP',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TOXVN',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '41',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW2',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '42',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '43608.00',
                        base: '31533.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TLOXAUP',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TOXVN',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '41',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW2',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '42',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '43608.00',
                        base: '31533.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TLOXAUP',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TOXVN',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '41',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW2',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '42',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '28',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 7,
            itineraries: [
                {
                    duration: 'PT27H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T16:00:00',
                            },
                            carrierCode: 'VN',
                            number: '772',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT8H45M',
                            id: '7',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-01T08:45:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T10:20:00',
                            },
                            carrierCode: 'VN',
                            number: '601',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H35M',
                            id: '8',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT15H35M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                terminal: 'I',
                                at: '2025-08-01T21:40:00',
                            },
                            arrival: {
                                iataCode: 'MEL',
                                terminal: '2',
                                at: '2025-08-02T09:20:00',
                            },
                            carrierCode: 'JQ',
                            number: '30',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT8H40M',
                            id: '47',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'AVV',
                                terminal: 'D',
                                at: '2025-08-02T14:55:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '2',
                                at: '2025-08-02T16:15:00',
                            },
                            carrierCode: 'JQ',
                            number: '608',
                            aircraft: {
                                code: '320',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT1H20M',
                            id: '48',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '130824.00',
                base: '94599.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '130824.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['VN'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '43608.00',
                        base: '31533.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'TLOXAUP',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'TOXVN',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '47',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW2',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '48',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '43608.00',
                        base: '31533.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'TLOXAUP',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'TOXVN',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '47',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW2',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '48',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '43608.00',
                        base: '31533.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'TLOXAUP',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'TOXVN',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '47',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW2',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '48',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '29',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT27H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T16:00:00',
                            },
                            carrierCode: 'VN',
                            number: '772',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT8H45M',
                            id: '7',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-01T08:45:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T10:20:00',
                            },
                            carrierCode: 'VN',
                            number: '601',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H35M',
                            id: '8',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT17H25M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                terminal: 'I',
                                at: '2025-08-01T21:40:00',
                            },
                            arrival: {
                                iataCode: 'MEL',
                                terminal: '2',
                                at: '2025-08-02T09:20:00',
                            },
                            carrierCode: 'JQ',
                            number: '30',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT8H40M',
                            id: '41',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'AVV',
                                terminal: 'D',
                                at: '2025-08-02T16:40:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '2',
                                at: '2025-08-02T18:05:00',
                            },
                            carrierCode: 'JQ',
                            number: '610',
                            aircraft: {
                                code: '320',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT1H25M',
                            id: '42',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '130824.00',
                base: '94599.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '130824.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['VN'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '43608.00',
                        base: '31533.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'TLOXAUP',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'TOXVN',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '41',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW2',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '42',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '43608.00',
                        base: '31533.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'TLOXAUP',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'TOXVN',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '41',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW2',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '42',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '43608.00',
                        base: '31533.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'TLOXAUP',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'TOXVN',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '41',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW2',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '42',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '30',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-30',
            lastTicketingDateTime: '2025-07-30',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT12H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-07-31T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T16:00:00',
                            },
                            carrierCode: 'VN',
                            number: '772',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT8H45M',
                            id: '19',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-07-31T18:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-07-31T20:05:00',
                            },
                            carrierCode: 'VN',
                            number: '609',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VN',
                            },
                            duration: 'PT1H35M',
                            id: '20',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
                {
                    duration: 'PT13H35M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                terminal: 'I',
                                at: '2025-08-01T21:40:00',
                            },
                            arrival: {
                                iataCode: 'MEL',
                                terminal: '2',
                                at: '2025-08-02T09:20:00',
                            },
                            carrierCode: 'JQ',
                            number: '30',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT8H40M',
                            id: '45',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'MEL',
                                terminal: '4',
                                at: '2025-08-02T12:50:00',
                            },
                            arrival: {
                                iataCode: 'SYD',
                                terminal: '2',
                                at: '2025-08-02T14:15:00',
                            },
                            carrierCode: 'JQ',
                            number: '514',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT1H25M',
                            id: '46',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'PHP',
                total: '134874.00',
                base: '98649.00',
                fees: [
                    {
                        amount: '0.00',
                        type: 'SUPPLIER',
                    },
                    {
                        amount: '0.00',
                        type: 'TICKETING',
                    },
                ],
                grandTotal: '134874.00',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['VN'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '44958.00',
                        base: '32883.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TLOXAUP',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TOXVN',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '45',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW2',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '46',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '2',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '44958.00',
                        base: '32883.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TLOXAUP',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TOXVN',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '45',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW2',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '46',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
                {
                    travelerId: '3',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'PHP',
                        total: '44958.00',
                        base: '32883.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'TLOXAUP',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'TOXVN',
                            class: 'T',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '45',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW2',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '46',
                            cabin: 'ECONOMY',
                            fareBasis: 'HLOW',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                    ],
                },
            ],
        },
    ],
    dictionaries: {
        locations: {
            AVV: {
                cityCode: 'MEL',
                countryCode: 'AU',
            },
            BKK: {
                cityCode: 'BKK',
                countryCode: 'TH',
            },
            DMK: {
                cityCode: 'BKK',
                countryCode: 'TH',
            },
            KUL: {
                cityCode: 'KUL',
                countryCode: 'MY',
            },
            DPS: {
                cityCode: 'DPS',
                countryCode: 'ID',
            },
            MNL: {
                cityCode: 'MNL',
                countryCode: 'PH',
            },
            HAK: {
                cityCode: 'HAK',
                countryCode: 'CN',
            },
            HAN: {
                cityCode: 'HAN',
                countryCode: 'VN',
            },
            MEL: {
                cityCode: 'MEL',
                countryCode: 'AU',
            },
            XMN: {
                cityCode: 'XMN',
                countryCode: 'CN',
            },
            SIN: {
                cityCode: 'SIN',
                countryCode: 'SG',
            },
            SGN: {
                cityCode: 'SGN',
                countryCode: 'VN',
            },
            SYD: {
                cityCode: 'SYD',
                countryCode: 'AU',
            },
        },
        aircraft: {
            320: 'AIRBUS A320',
            321: 'AIRBUS A321',
            333: 'AIRBUS A330-300',
            359: 'AIRBUS A350-900',
            738: 'BOEING 737-800',
            773: 'BOEING 777-300',
            788: 'BOEING 787-8',
            789: 'BOEING 787-9',
        },
        currencies: {
            PHP: 'PHILIPPINE PESO',
        },
        carriers: {
            PR: 'PHILIPPINE AIRLINES',
            OD: 'BATIK AIR MALAYSIA',
            JQ: 'JETSTAR',
            VN: 'VIETNAM AIRLINES',
            MF: 'XIAMEN AIRLINES',
            ID: 'BATIK AIR INDONESIA',
            HU: 'HAINAN AIRLINES',
            TR: 'SCOOT',
        },
    },
}
