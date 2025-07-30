export const flightResultMockDataOneWay = {
    meta: {
        count: 55,
        links: {
            self: 'https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=SYD&destinationLocationCode=BKK&departureDate=2025-08-02&adults=1&nonStop=false&max=250',
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
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 5,
            itineraries: [
                {
                    duration: 'PT26H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T11:25:00',
                            },
                            arrival: {
                                iataCode: 'XMN',
                                terminal: '3',
                                at: '2025-08-02T18:50:00',
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
                            id: '102',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'XMN',
                                terminal: '3',
                                at: '2025-08-03T08:50:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T11:15:00',
                            },
                            carrierCode: 'MF',
                            number: '853',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'MF',
                            },
                            duration: 'PT3H25M',
                            id: '103',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '211.96',
                base: '67.00',
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
                grandTotal: '211.96',
                additionalServices: [
                    {
                        amount: '166.33',
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
                        currency: 'EUR',
                        total: '211.96',
                        base: '67.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '102',
                            cabin: 'ECONOMY',
                            fareBasis: 'SOW6AAUS',
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
                            segmentId: '103',
                            cabin: 'ECONOMY',
                            fareBasis: 'SOW6AAUS',
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
            id: '2',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT16H',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T21:00:00',
                            },
                            arrival: {
                                iataCode: 'HAK',
                                terminal: '2',
                                at: '2025-08-03T05:00:00',
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
                            id: '5',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'HAK',
                                terminal: '2',
                                at: '2025-08-03T08:40:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T10:00:00',
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
                            id: '6',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '259.12',
                base: '145.00',
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
                grandTotal: '259.12',
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
                        currency: 'EUR',
                        total: '259.12',
                        base: '145.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '5',
                            cabin: 'ECONOMY',
                            fareBasis: 'NKO779OY',
                            brandedFare: 'BAS',
                            brandedFareLabel: 'ECO BASIC',
                            class: 'N',
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
                            segmentId: '6',
                            cabin: 'ECONOMY',
                            fareBasis: 'NKO779OY',
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
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT24H15M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T21:00:00',
                            },
                            arrival: {
                                iataCode: 'HAK',
                                terminal: '2',
                                at: '2025-08-03T05:00:00',
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
                            id: '33',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'HAK',
                                terminal: '2',
                                at: '2025-08-03T16:45:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T18:15:00',
                            },
                            carrierCode: 'HU',
                            number: '721',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'HU',
                            },
                            duration: 'PT2H30M',
                            id: '34',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '259.12',
                base: '145.00',
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
                grandTotal: '259.12',
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
                        currency: 'EUR',
                        total: '259.12',
                        base: '145.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '33',
                            cabin: 'ECONOMY',
                            fareBasis: 'NKO779OY',
                            brandedFare: 'BAS',
                            brandedFareLabel: 'ECO BASIC',
                            class: 'N',
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
                            segmentId: '34',
                            cabin: 'ECONOMY',
                            fareBasis: 'NKO779OY',
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
                    duration: 'PT16H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T20:45:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-03T03:10:00',
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
                            id: '17',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-03T08:20:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T09:50:00',
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
                            id: '18',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '275.33',
                base: '172.00',
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
                grandTotal: '275.33',
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
                        currency: 'EUR',
                        total: '275.33',
                        base: '172.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '17',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '18',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
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
                    duration: 'PT24H',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T12:50:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-02T19:15:00',
                            },
                            carrierCode: 'TR',
                            number: '3',
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
                                at: '2025-08-03T08:20:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T09:50:00',
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
                            id: '10',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '275.33',
                base: '172.00',
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
                grandTotal: '275.33',
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
                        currency: 'EUR',
                        total: '275.33',
                        base: '172.00',
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
                                at: '2025-08-02T06:55:00',
                            },
                            arrival: {
                                iataCode: 'DPS',
                                terminal: 'I',
                                at: '2025-08-02T11:25:00',
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
                            id: '90',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'DPS',
                                terminal: 'D',
                                at: '2025-08-02T14:20:00',
                            },
                            arrival: {
                                iataCode: 'DMK',
                                terminal: '0',
                                at: '2025-08-02T17:45:00',
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
                            id: '91',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '290.57',
                base: '217.00',
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
                grandTotal: '290.57',
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
                        currency: 'EUR',
                        total: '290.57',
                        base: '217.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '90',
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
                        {
                            segmentId: '91',
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
                    duration: 'PT14H20M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T20:45:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-03T03:10:00',
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
                            id: '39',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-03T06:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T08:05:00',
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
                            id: '40',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '303.33',
                base: '200.00',
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
                grandTotal: '303.33',
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
                        currency: 'EUR',
                        total: '303.33',
                        base: '200.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '39',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '40',
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
                    duration: 'PT22H15M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T12:50:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-02T19:15:00',
                            },
                            carrierCode: 'TR',
                            number: '3',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'TR',
                            },
                            duration: 'PT8H25M',
                            id: '31',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '1',
                                at: '2025-08-03T06:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T08:05:00',
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
                            id: '32',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '303.33',
                base: '200.00',
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
                grandTotal: '303.33',
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
                        currency: 'EUR',
                        total: '303.33',
                        base: '200.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '31',
                            cabin: 'ECONOMY',
                            fareBasis: 'O2TR24',
                            class: 'O',
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
            id: '9',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT34H45M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T11:45:00',
                            },
                            arrival: {
                                iataCode: 'CGK',
                                terminal: '3',
                                at: '2025-08-02T16:30:00',
                            },
                            carrierCode: 'GA',
                            number: '713',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'GA',
                            },
                            duration: 'PT7H45M',
                            id: '85',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'CGK',
                                terminal: '3',
                                at: '2025-08-03T15:55:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T19:30:00',
                            },
                            carrierCode: 'GA',
                            number: '868',
                            aircraft: {
                                code: '738',
                            },
                            operating: {
                                carrierCode: 'GA',
                            },
                            duration: 'PT3H35M',
                            id: '86',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '323.54',
                base: '179.00',
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
                grandTotal: '323.54',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['GA'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '323.54',
                        base: '179.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '85',
                            cabin: 'ECONOMY',
                            fareBasis: 'HOXNWAUS',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '86',
                            cabin: 'ECONOMY',
                            fareBasis: 'HOXNWAUS',
                            class: 'H',
                            includedCheckedBags: {
                                weight: 30,
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
                    duration: 'PT26H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-02T16:45:00',
                            },
                            carrierCode: 'H1',
                            number: '4212',
                            aircraft: {
                                code: '330',
                            },
                            operating: {
                                carrierCode: 'VJ',
                            },
                            duration: 'PT9H30M',
                            id: '96',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-03T08:35:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T10:05:00',
                            },
                            carrierCode: 'H1',
                            number: '4014',
                            aircraft: {
                                code: '32S',
                            },
                            operating: {
                                carrierCode: 'VJ',
                            },
                            duration: 'PT1H30M',
                            id: '97',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '328.55',
                base: '153.00',
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
                grandTotal: '328.55',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['HR'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '328.55',
                        base: '153.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '96',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWVJ',
                            class: 'V',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '97',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWVJ',
                            class: 'V',
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
                    duration: 'PT29H30M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-02T16:45:00',
                            },
                            carrierCode: 'H1',
                            number: '4212',
                            aircraft: {
                                code: '330',
                            },
                            operating: {
                                carrierCode: 'VJ',
                            },
                            duration: 'PT9H30M',
                            id: '67',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-03T11:15:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T12:45:00',
                            },
                            carrierCode: 'H1',
                            number: '2185',
                            aircraft: {
                                code: '32S',
                            },
                            operating: {
                                carrierCode: 'VJ',
                            },
                            duration: 'PT1H30M',
                            id: '68',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '328.55',
                base: '153.00',
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
                grandTotal: '328.55',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['HR'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '328.55',
                        base: '153.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '67',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWVJ',
                            class: 'V',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '68',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOWVJ',
                            class: 'V',
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
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 1,
            itineraries: [
                {
                    duration: 'PT23H20M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T20:20:00',
                            },
                            arrival: {
                                iataCode: 'TFU',
                                terminal: '1',
                                at: '2025-08-03T05:25:00',
                            },
                            carrierCode: '3U',
                            number: '3892',
                            aircraft: {
                                code: '332',
                            },
                            operating: {
                                carrierCode: '3U',
                            },
                            duration: 'PT11H5M',
                            id: '43',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'TFU',
                                terminal: '1',
                                at: '2025-08-03T14:40:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T16:40:00',
                            },
                            carrierCode: '3U',
                            number: '3935',
                            aircraft: {
                                code: '32B',
                            },
                            operating: {
                                carrierCode: '3U',
                            },
                            duration: 'PT3H',
                            id: '44',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '332.22',
                base: '169.00',
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
                grandTotal: '332.22',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['3U'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '332.22',
                        base: '169.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '43',
                            cabin: 'ECONOMY',
                            fareBasis: 'N1ADDA76',
                            class: 'N',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '44',
                            cabin: 'ECONOMY',
                            fareBasis: 'N1ADDA76',
                            class: 'B',
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
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT26H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-02T16:45:00',
                            },
                            carrierCode: 'W2',
                            number: '4086',
                            aircraft: {
                                code: '330',
                            },
                            operating: {
                                carrierCode: 'VJ',
                            },
                            duration: 'PT9H30M',
                            id: '98',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-03T08:35:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T10:05:00',
                            },
                            carrierCode: 'W2',
                            number: '4801',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VJ',
                            },
                            duration: 'PT1H30M',
                            id: '99',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '337.05',
                base: '153.00',
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
                grandTotal: '337.05',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['W2'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '337.05',
                        base: '153.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '98',
                            cabin: 'ECONOMY',
                            fareBasis: 'EW2VJ',
                            class: 'E',
                            includedCheckedBags: {
                                weight: 40,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '99',
                            cabin: 'ECONOMY',
                            fareBasis: 'EW2VJ',
                            class: 'E',
                            includedCheckedBags: {
                                weight: 40,
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
            id: '14',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT29H30M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-02T16:45:00',
                            },
                            carrierCode: 'W2',
                            number: '4086',
                            aircraft: {
                                code: '330',
                            },
                            operating: {
                                carrierCode: 'VJ',
                            },
                            duration: 'PT9H30M',
                            id: '69',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-03T11:15:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T12:45:00',
                            },
                            carrierCode: 'W2',
                            number: '4803',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VJ',
                            },
                            duration: 'PT1H30M',
                            id: '70',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '337.05',
                base: '153.00',
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
                grandTotal: '337.05',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['W2'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '337.05',
                        base: '153.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '69',
                            cabin: 'ECONOMY',
                            fareBasis: 'EW2VJ',
                            class: 'E',
                            includedCheckedBags: {
                                weight: 40,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '70',
                            cabin: 'ECONOMY',
                            fareBasis: 'EW2VJ',
                            class: 'E',
                            includedCheckedBags: {
                                weight: 40,
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
            id: '15',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT12H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-02T16:00:00',
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
                            id: '88',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-02T18:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-02T20:05:00',
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
                            id: '89',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '345.54',
                base: '218.00',
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
                grandTotal: '345.54',
                additionalServices: [
                    {
                        amount: '127.53',
                        type: 'CHECKED_BAGS',
                    },
                ],
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
                        currency: 'EUR',
                        total: '345.54',
                        base: '218.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '88',
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
                            segmentId: '89',
                            cabin: 'ECONOMY',
                            fareBasis: 'ROXVN',
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
            id: '16',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT13H',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T13:05:00',
                            },
                            arrival: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-02T20:00:00',
                            },
                            carrierCode: 'MH',
                            number: '122',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'MH',
                            },
                            duration: 'PT8H55M',
                            id: '3',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-02T21:45:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-02T23:05:00',
                            },
                            carrierCode: 'MH',
                            number: '796',
                            aircraft: {
                                code: '73H',
                            },
                            operating: {
                                carrierCode: 'MH',
                            },
                            duration: 'PT2H20M',
                            id: '4',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '353.82',
                base: '271.00',
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
                grandTotal: '353.82',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['MH'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '353.82',
                        base: '271.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '3',
                            cabin: 'ECONOMY',
                            fareBasis: 'OGSBXOAU',
                            brandedFare: 'BASIC',
                            brandedFareLabel: 'BASIC',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 25,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: false,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SNACK',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHILD DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'INFANT DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
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
                                    description: 'CHANGE AFTER DEPARTURE',
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
                            ],
                        },
                        {
                            segmentId: '4',
                            cabin: 'ECONOMY',
                            fareBasis: 'OGSBXOAU',
                            brandedFare: 'BASIC',
                            brandedFareLabel: 'BASIC',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 25,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: false,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SNACK',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHILD DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'INFANT DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
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
                                    description: 'CHANGE AFTER DEPARTURE',
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
                            ],
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
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT15H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T22:10:00',
                            },
                            arrival: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-03T05:00:00',
                            },
                            carrierCode: 'MH',
                            number: '140',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'MH',
                            },
                            duration: 'PT8H50M',
                            id: '15',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-03T09:00:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T10:15:00',
                            },
                            carrierCode: 'MH',
                            number: '784',
                            aircraft: {
                                code: '73H',
                            },
                            operating: {
                                carrierCode: 'MH',
                            },
                            duration: 'PT2H15M',
                            id: '16',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '353.82',
                base: '271.00',
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
                grandTotal: '353.82',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['MH'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '353.82',
                        base: '271.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '15',
                            cabin: 'ECONOMY',
                            fareBasis: 'OGSBXOAU',
                            brandedFare: 'BASIC',
                            brandedFareLabel: 'BASIC',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 25,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: false,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SNACK',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHILD DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'INFANT DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
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
                                    description: 'CHANGE AFTER DEPARTURE',
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
                            ],
                        },
                        {
                            segmentId: '16',
                            cabin: 'ECONOMY',
                            fareBasis: 'OGSBXOAU',
                            brandedFare: 'BASIC',
                            brandedFareLabel: 'BASIC',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 25,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: false,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SNACK',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHILD DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'INFANT DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
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
                                    description: 'CHANGE AFTER DEPARTURE',
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
                            ],
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
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT18H15M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T22:10:00',
                            },
                            arrival: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-03T05:00:00',
                            },
                            carrierCode: 'MH',
                            number: '140',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'MH',
                            },
                            duration: 'PT8H50M',
                            id: '29',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-03T12:10:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T13:25:00',
                            },
                            carrierCode: 'MH',
                            number: '788',
                            aircraft: {
                                code: '73H',
                            },
                            operating: {
                                carrierCode: 'MH',
                            },
                            duration: 'PT2H15M',
                            id: '30',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '353.82',
                base: '271.00',
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
                grandTotal: '353.82',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['MH'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '353.82',
                        base: '271.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '29',
                            cabin: 'ECONOMY',
                            fareBasis: 'OGSBXOAU',
                            brandedFare: 'BASIC',
                            brandedFareLabel: 'BASIC',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 25,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: false,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SNACK',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHILD DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'INFANT DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
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
                                    description: 'CHANGE AFTER DEPARTURE',
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
                            ],
                        },
                        {
                            segmentId: '30',
                            cabin: 'ECONOMY',
                            fareBasis: 'OGSBXOAU',
                            brandedFare: 'BASIC',
                            brandedFareLabel: 'BASIC',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 25,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: false,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SNACK',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHILD DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'INFANT DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
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
                                    description: 'CHANGE AFTER DEPARTURE',
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
                            ],
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
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT24H10M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T13:05:00',
                            },
                            arrival: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-02T20:00:00',
                            },
                            carrierCode: 'MH',
                            number: '122',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'MH',
                            },
                            duration: 'PT8H55M',
                            id: '25',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-03T09:00:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T10:15:00',
                            },
                            carrierCode: 'MH',
                            number: '784',
                            aircraft: {
                                code: '73H',
                            },
                            operating: {
                                carrierCode: 'MH',
                            },
                            duration: 'PT2H15M',
                            id: '26',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '355.65',
                base: '271.00',
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
                grandTotal: '355.65',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['MH'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '355.65',
                        base: '271.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '25',
                            cabin: 'ECONOMY',
                            fareBasis: 'OGSBXOAU',
                            brandedFare: 'BASIC',
                            brandedFareLabel: 'BASIC',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 25,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: false,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SNACK',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHILD DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'INFANT DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
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
                                    description: 'CHANGE AFTER DEPARTURE',
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
                            ],
                        },
                        {
                            segmentId: '26',
                            cabin: 'ECONOMY',
                            fareBasis: 'OGSBXOAU',
                            brandedFare: 'BASIC',
                            brandedFareLabel: 'BASIC',
                            class: 'O',
                            includedCheckedBags: {
                                weight: 25,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'PRE RESERVED SEAT ASSIGNMENT',
                                    isChargeable: false,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SNACK',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHILD DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'INFANT DISCOUNT',
                                    isChargeable: false,
                                    amenityType: 'TRAVEL_SERVICES',
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
                                    description: 'CHANGE AFTER DEPARTURE',
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
                            ],
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
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT14H40M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T10:15:00',
                            },
                            arrival: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-08-02T17:00:00',
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
                            id: '79',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-08-02T19:25:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-02T21:55:00',
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
                            id: '80',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '356.35',
                base: '233.00',
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
                grandTotal: '356.35',
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
                        currency: 'EUR',
                        total: '356.35',
                        base: '233.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '79',
                            cabin: 'ECONOMY',
                            fareBasis: 'EOBAU',
                            class: 'E',
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
                            segmentId: '80',
                            cabin: 'ECONOMY',
                            fareBasis: 'EOBAU',
                            class: 'E',
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
            id: '21',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT29H',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T10:15:00',
                            },
                            arrival: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-08-02T17:00:00',
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
                            id: '11',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'MNL',
                                terminal: '1',
                                at: '2025-08-03T09:40:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T12:15:00',
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
                            id: '12',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '356.35',
                base: '233.00',
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
                grandTotal: '356.35',
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
                        currency: 'EUR',
                        total: '356.35',
                        base: '233.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '11',
                            cabin: 'ECONOMY',
                            fareBasis: 'EOBAU',
                            class: 'E',
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
                            segmentId: '12',
                            cabin: 'ECONOMY',
                            fareBasis: 'EOBAU',
                            class: 'E',
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
            id: '22',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT13H25M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T07:35:00',
                            },
                            arrival: {
                                iataCode: 'HKG',
                                terminal: '1',
                                at: '2025-08-02T15:05:00',
                            },
                            carrierCode: 'CX',
                            number: '110',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'CX',
                            },
                            duration: 'PT9H30M',
                            id: '47',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'HKG',
                                terminal: '1',
                                at: '2025-08-02T15:55:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-02T18:00:00',
                            },
                            carrierCode: 'CX',
                            number: '701',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'CX',
                            },
                            duration: 'PT3H5M',
                            id: '48',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '367.56',
                base: '210.00',
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
                grandTotal: '367.56',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['CX'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '367.56',
                        base: '210.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '47',
                            cabin: 'ECONOMY',
                            fareBasis: 'SR21AUKO',
                            brandedFare: 'ECONLIGHT',
                            brandedFareLabel: 'ECONOMY LIGHT',
                            class: 'S',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: '1PC MAX 23KG 158LCM EACH',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '1PC MAX 15LB 7KG 115LCM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MILEAGE ACCRUAL',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '48',
                            cabin: 'ECONOMY',
                            fareBasis: 'SR21AUKO',
                            brandedFare: 'ECONLIGHT',
                            brandedFareLabel: 'ECONOMY LIGHT',
                            class: 'S',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: '1PC MAX 23KG 158LCM EACH',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '1PC MAX 15LB 7KG 115LCM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MILEAGE ACCRUAL',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
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
            id: '23',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 4,
            itineraries: [
                {
                    duration: 'PT29H30M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-02T16:45:00',
                            },
                            carrierCode: 'VJ',
                            number: '86',
                            aircraft: {
                                code: '330',
                            },
                            operating: {
                                carrierCode: 'VJ',
                            },
                            duration: 'PT9H30M',
                            id: '71',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-03T11:15:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T12:45:00',
                            },
                            carrierCode: 'VJ',
                            number: '803',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VJ',
                            },
                            duration: 'PT1H30M',
                            id: '72',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '377.13',
                base: '239.00',
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
                grandTotal: '377.13',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['GP'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '377.13',
                        base: '239.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '71',
                            cabin: 'ECONOMY',
                            fareBasis: 'ESPAU',
                            class: 'E',
                            includedCheckedBags: {
                                weight: 40,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '72',
                            cabin: 'ECONOMY',
                            fareBasis: 'LSP',
                            class: 'L',
                            includedCheckedBags: {
                                weight: 40,
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
            id: '24',
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
                    duration: 'PT13H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '2',
                                at: '2025-08-02T08:50:00',
                            },
                            arrival: {
                                iataCode: 'MEL',
                                terminal: '4',
                                at: '2025-08-02T10:25:00',
                            },
                            carrierCode: 'JQ',
                            number: '515',
                            aircraft: {
                                code: '320',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT1H35M',
                            id: '92',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'MEL',
                                terminal: '2',
                                at: '2025-08-02T13:20:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                terminal: 'I',
                                at: '2025-08-02T19:40:00',
                            },
                            carrierCode: 'JQ',
                            number: '29',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT9H20M',
                            id: '93',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '380.22',
                base: '266.00',
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
                grandTotal: '380.22',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['HR'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '380.22',
                        base: '266.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '92',
                            cabin: 'ECONOMY',
                            fareBasis: 'CLOW',
                            class: 'C',
                            includedCheckedBags: {
                                weight: 20,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '93',
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
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT28H25M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T11:45:00',
                            },
                            arrival: {
                                iataCode: 'CGK',
                                terminal: '3',
                                at: '2025-08-02T16:30:00',
                            },
                            carrierCode: 'GA',
                            number: '713',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'GA',
                            },
                            duration: 'PT7H45M',
                            id: '57',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'CGK',
                                terminal: '3',
                                at: '2025-08-03T09:45:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T13:10:00',
                            },
                            carrierCode: 'GA',
                            number: '866',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'GA',
                            },
                            duration: 'PT3H25M',
                            id: '58',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '386.54',
                base: '242.00',
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
                grandTotal: '386.54',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['GA'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '386.54',
                        base: '242.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '57',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOXNWAUS',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '58',
                            cabin: 'ECONOMY',
                            fareBasis: 'VOXNWAUS',
                            class: 'V',
                            includedCheckedBags: {
                                weight: 30,
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
            id: '26',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 5,
            itineraries: [
                {
                    duration: 'PT16H25M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T11:25:00',
                            },
                            arrival: {
                                iataCode: 'XMN',
                                terminal: '3',
                                at: '2025-08-02T18:50:00',
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
                            id: '51',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'XMN',
                                terminal: '3',
                                at: '2025-08-02T22:20:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T00:50:00',
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
                            id: '52',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '386.96',
                base: '242.00',
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
                grandTotal: '386.96',
                additionalServices: [
                    {
                        amount: '166.33',
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
                        currency: 'EUR',
                        total: '386.96',
                        base: '242.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '51',
                            cabin: 'ECONOMY',
                            fareBasis: 'SOW6AAUT',
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
                            segmentId: '52',
                            cabin: 'ECONOMY',
                            fareBasis: 'SOW6AAUT',
                            brandedFare: 'YSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'T',
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
                    duration: 'PT15H20M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '0',
                                at: '2025-08-02T06:55:00',
                            },
                            arrival: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-02T16:25:00',
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
                                    arrivalAt: '2025-08-02T11:25:00',
                                    departureAt: '2025-08-02T13:15:00',
                                },
                            ],
                            id: '41',
                            numberOfStops: 1,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-02T18:05:00',
                            },
                            arrival: {
                                iataCode: 'DMK',
                                terminal: '0',
                                at: '2025-08-02T19:15:00',
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
                            id: '42',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '393.59',
                base: '231.00',
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
                grandTotal: '393.59',
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
                        currency: 'EUR',
                        total: '393.59',
                        base: '231.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '41',
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
                        {
                            segmentId: '42',
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
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT9H20M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T10:00:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-02T16:20:00',
                            },
                            carrierCode: 'TG',
                            number: '476',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'TG',
                            },
                            duration: 'PT9H20M',
                            id: '37',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '394.18',
                base: '324.00',
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
                grandTotal: '394.18',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['TG'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '394.18',
                        base: '324.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '37',
                            cabin: 'ECONOMY',
                            fareBasis: 'WLOSV',
                            brandedFare: 'ECOSV1',
                            brandedFareLabel: 'ECOSAVE1',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 23,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description:
                                        'EXTRA BAGGAGE PER ONE KILOGRAM',
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
                                    description: 'HOT MEAL',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'NAME CORRECTION',
                                    isChargeable: true,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BASIC SEAT',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '25 PERCENT MILES EARNED',
                                    isChargeable: false,
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
            id: '29',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT9H20M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T14:50:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-02T21:10:00',
                            },
                            carrierCode: 'TG',
                            number: '472',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'TG',
                            },
                            duration: 'PT9H20M',
                            id: '38',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '394.18',
                base: '324.00',
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
                grandTotal: '394.18',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['TG'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '394.18',
                        base: '324.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '38',
                            cabin: 'ECONOMY',
                            fareBasis: 'WLOSV',
                            brandedFare: 'ECOSV1',
                            brandedFareLabel: 'ECOSAVE1',
                            class: 'W',
                            includedCheckedBags: {
                                weight: 23,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description:
                                        'EXTRA BAGGAGE PER ONE KILOGRAM',
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
                                    description: 'HOT MEAL',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'NAME CORRECTION',
                                    isChargeable: true,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BASIC SEAT',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '25 PERCENT MILES EARNED',
                                    isChargeable: false,
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
                    duration: 'PT28H20M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '0',
                                at: '2025-08-02T06:55:00',
                            },
                            arrival: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-02T16:25:00',
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
                                    arrivalAt: '2025-08-02T11:25:00',
                                    departureAt: '2025-08-02T13:15:00',
                                },
                            ],
                            id: '45',
                            numberOfStops: 1,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'KUL',
                                terminal: '1',
                                at: '2025-08-03T07:05:00',
                            },
                            arrival: {
                                iataCode: 'DMK',
                                terminal: '0',
                                at: '2025-08-03T08:15:00',
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
                            id: '46',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '395.42',
                base: '231.00',
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
                grandTotal: '395.42',
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
                        currency: 'EUR',
                        total: '395.42',
                        base: '231.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '45',
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
                        {
                            segmentId: '46',
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
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '31',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT19H25M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T08:05:00',
                            },
                            arrival: {
                                iataCode: 'PVG',
                                terminal: '2',
                                at: '2025-08-02T16:05:00',
                            },
                            carrierCode: 'HO',
                            number: '1670',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'HO',
                            },
                            duration: 'PT10H',
                            id: '55',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'PVG',
                                terminal: '2',
                                at: '2025-08-02T21:05:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T00:30:00',
                            },
                            carrierCode: 'HO',
                            number: '1357',
                            aircraft: {
                                code: '320',
                            },
                            operating: {
                                carrierCode: 'HO',
                            },
                            duration: 'PT4H25M',
                            id: '56',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '400.94',
                base: '199.00',
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
                grandTotal: '400.94',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['HO'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '400.94',
                        base: '199.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '55',
                            cabin: 'ECONOMY',
                            fareBasis: 'KNN0N9CZ',
                            class: 'K',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '56',
                            cabin: 'ECONOMY',
                            fareBasis: 'KNN0N9CZ',
                            class: 'B',
                            includedCheckedBags: {
                                quantity: 2,
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
            id: '32',
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
                    duration: 'PT14H25M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '2',
                                at: '2025-08-02T08:15:00',
                            },
                            arrival: {
                                iataCode: 'MEL',
                                terminal: '4',
                                at: '2025-08-02T09:55:00',
                            },
                            carrierCode: 'JQ',
                            number: '507',
                            aircraft: {
                                code: '320',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT1H40M',
                            id: '49',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'MEL',
                                terminal: '2',
                                at: '2025-08-02T13:20:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                terminal: 'I',
                                at: '2025-08-02T19:40:00',
                            },
                            carrierCode: 'JQ',
                            number: '29',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT9H20M',
                            id: '50',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '401.22',
                base: '287.00',
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
                grandTotal: '401.22',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['HR'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '401.22',
                        base: '287.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '49',
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
                        {
                            segmentId: '50',
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
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '33',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 4,
            itineraries: [
                {
                    duration: 'PT26H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-02T16:45:00',
                            },
                            carrierCode: 'VJ',
                            number: '86',
                            aircraft: {
                                code: '330',
                            },
                            operating: {
                                carrierCode: 'VJ',
                            },
                            duration: 'PT9H30M',
                            id: '100',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-03T08:35:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T10:05:00',
                            },
                            carrierCode: 'VJ',
                            number: '801',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'VJ',
                            },
                            duration: 'PT1H30M',
                            id: '101',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '404.13',
                base: '266.00',
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
                grandTotal: '404.13',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['GP'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '404.13',
                        base: '266.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '100',
                            cabin: 'ECONOMY',
                            fareBasis: 'ESPAU',
                            class: 'E',
                            includedCheckedBags: {
                                weight: 40,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                        },
                        {
                            segmentId: '101',
                            cabin: 'ECONOMY',
                            fareBasis: 'NSP',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 40,
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
            id: '34',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT17H55M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T11:00:00',
                            },
                            arrival: {
                                iataCode: 'PVG',
                                terminal: '1',
                                at: '2025-08-02T19:15:00',
                            },
                            carrierCode: 'MU',
                            number: '562',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'MU',
                            },
                            duration: 'PT10H15M',
                            id: '106',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'PVG',
                                terminal: '1',
                                at: '2025-08-02T21:55:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T01:55:00',
                            },
                            carrierCode: 'MU',
                            number: '8607',
                            aircraft: {
                                code: '73M',
                            },
                            operating: {
                                carrierCode: 'FM',
                            },
                            duration: 'PT5H',
                            id: '107',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '423.69',
                base: '259.00',
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
                grandTotal: '423.69',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['MU'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '423.69',
                        base: '259.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '106',
                            cabin: 'ECONOMY',
                            fareBasis: 'SSE0WCSR',
                            class: 'S',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '107',
                            cabin: 'ECONOMY',
                            fareBasis: 'SSE0WCSR',
                            class: 'B',
                            includedCheckedBags: {
                                quantity: 2,
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
            id: '35',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-31',
            lastTicketingDateTime: '2025-07-31',
            numberOfBookableSeats: 1,
            itineraries: [
                {
                    duration: 'PT26H35M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '2',
                                at: '2025-08-02T20:05:00',
                            },
                            arrival: {
                                iataCode: 'BNE',
                                terminal: 'D',
                                at: '2025-08-02T21:35:00',
                            },
                            carrierCode: 'JQ',
                            number: '824',
                            aircraft: {
                                code: '32Q',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT1H30M',
                            id: '77',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'BNE',
                                terminal: 'I',
                                at: '2025-08-03T13:50:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                terminal: 'I',
                                at: '2025-08-03T19:40:00',
                            },
                            carrierCode: 'JQ',
                            number: '65',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT8H50M',
                            id: '78',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '426.70',
                base: '301.00',
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
                grandTotal: '426.70',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['HR'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '426.70',
                        base: '301.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '77',
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
                        {
                            segmentId: '78',
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
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '36',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-07-31',
            lastTicketingDateTime: '2025-07-31',
            numberOfBookableSeats: 1,
            itineraries: [
                {
                    duration: 'PT28H15M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '2',
                                at: '2025-08-02T18:25:00',
                            },
                            arrival: {
                                iataCode: 'BNE',
                                terminal: 'D',
                                at: '2025-08-02T19:55:00',
                            },
                            carrierCode: 'JQ',
                            number: '822',
                            aircraft: {
                                code: '321',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT1H30M',
                            id: '35',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'BNE',
                                terminal: 'I',
                                at: '2025-08-03T13:50:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                terminal: 'I',
                                at: '2025-08-03T19:40:00',
                            },
                            carrierCode: 'JQ',
                            number: '65',
                            aircraft: {
                                code: '788',
                            },
                            operating: {
                                carrierCode: 'JQ',
                            },
                            duration: 'PT8H50M',
                            id: '36',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '426.70',
                base: '301.00',
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
                grandTotal: '426.70',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['HR'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '426.70',
                        base: '301.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '35',
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
                        {
                            segmentId: '36',
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
                    ],
                },
            ],
        },
        {
            type: 'flight-offer',
            id: '37',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT27H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T10:15:00',
                            },
                            arrival: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-02T16:00:00',
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
                            id: '21',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SGN',
                                terminal: '2',
                                at: '2025-08-03T08:45:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T10:20:00',
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
                            id: '22',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '428.54',
                base: '301.00',
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
                grandTotal: '428.54',
                additionalServices: [
                    {
                        amount: '127.53',
                        type: 'CHECKED_BAGS',
                    },
                ],
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
                        currency: 'EUR',
                        total: '428.54',
                        base: '301.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '21',
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
                            segmentId: '22',
                            cabin: 'ECONOMY',
                            fareBasis: 'SOXVN',
                            class: 'S',
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
            id: '38',
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
                    duration: 'PT9H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T09:50:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-02T16:40:00',
                            },
                            carrierCode: 'QF',
                            number: '295',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierName: 'FINNAIR FOR QANTAS',
                            },
                            duration: 'PT9H50M',
                            id: '87',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '459.18',
                base: '395.00',
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
                grandTotal: '459.18',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['QF'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '459.18',
                        base: '395.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '87',
                            cabin: 'ECONOMY',
                            fareBasis: 'NLATDO',
                            brandedFare: 'ECSL',
                            brandedFareLabel: 'ECONOMY SALE',
                            class: 'N',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'PRE PAID BAGGAGE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '40KG BAGGAGE ALLOWANCE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '50KG BAGGAGE ALLOWANCE',
                                    isChargeable: true,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'COMPLIMENTARY BEVERAGES',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MEAL OR SNACK',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'USB POWER',
                                    isChargeable: false,
                                    amenityType: 'ENTERTAINMENT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'STANDARD SEATING',
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
            id: '39',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT16H55M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T21:45:00',
                            },
                            arrival: {
                                iataCode: 'CAN',
                                terminal: '2',
                                at: '2025-08-03T05:25:00',
                            },
                            carrierCode: 'CZ',
                            number: '302',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'CZ',
                            },
                            duration: 'PT9H40M',
                            id: '104',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'CAN',
                                terminal: '2',
                                at: '2025-08-03T09:40:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T11:40:00',
                            },
                            carrierCode: 'CZ',
                            number: '8079',
                            aircraft: {
                                code: '7M8',
                            },
                            operating: {
                                carrierCode: 'CZ',
                            },
                            duration: 'PT3H',
                            id: '105',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '476.06',
                base: '365.00',
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
                grandTotal: '476.06',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['CZ'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '476.06',
                        base: '365.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '104',
                            cabin: 'ECONOMY',
                            fareBasis: 'E2LSRSPX',
                            class: 'E',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '105',
                            cabin: 'ECONOMY',
                            fareBasis: 'E2LSRSPX',
                            class: 'E',
                            includedCheckedBags: {
                                quantity: 2,
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
            id: '40',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT18H25M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T10:05:00',
                            },
                            arrival: {
                                iataCode: 'CAN',
                                terminal: '2',
                                at: '2025-08-02T18:00:00',
                            },
                            carrierCode: 'CZ',
                            number: '326',
                            aircraft: {
                                code: '350',
                            },
                            operating: {
                                carrierCode: 'CZ',
                            },
                            duration: 'PT9H55M',
                            id: '53',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'CAN',
                                terminal: '2',
                                at: '2025-08-02T23:35:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T01:30:00',
                            },
                            carrierCode: 'CZ',
                            number: '3035',
                            aircraft: {
                                code: '7M8',
                            },
                            operating: {
                                carrierCode: 'CZ',
                            },
                            duration: 'PT2H55M',
                            id: '54',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '476.06',
                base: '365.00',
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
                grandTotal: '476.06',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['CZ'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '476.06',
                        base: '365.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '53',
                            cabin: 'ECONOMY',
                            fareBasis: 'E2LSRSPX',
                            class: 'E',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                        },
                        {
                            segmentId: '54',
                            cabin: 'ECONOMY',
                            fareBasis: 'E2LSRSPX',
                            class: 'E',
                            includedCheckedBags: {
                                quantity: 2,
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
            id: '41',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT16H45M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T10:05:00',
                            },
                            arrival: {
                                iataCode: 'HKG',
                                terminal: '1',
                                at: '2025-08-02T17:35:00',
                            },
                            carrierCode: 'CX',
                            number: '162',
                            aircraft: {
                                code: '77W',
                            },
                            operating: {
                                carrierCode: 'CX',
                            },
                            duration: 'PT9H30M',
                            id: '81',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'HKG',
                                terminal: '1',
                                at: '2025-08-02T21:50:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-02T23:50:00',
                            },
                            carrierCode: 'CX',
                            number: '617',
                            aircraft: {
                                code: '32Q',
                            },
                            operating: {
                                carrierCode: 'CX',
                            },
                            duration: 'PT3H',
                            id: '82',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '520.56',
                base: '363.00',
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
                grandTotal: '520.56',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['CX'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '520.56',
                        base: '363.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '81',
                            cabin: 'ECONOMY',
                            fareBasis: 'MR21AUKO',
                            brandedFare: 'ECONLIGHT',
                            brandedFareLabel: 'ECONOMY LIGHT',
                            class: 'M',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: '1PC MAX 23KG 158LCM EACH',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '1PC MAX 15LB 7KG 115LCM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MILEAGE ACCRUAL',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '82',
                            cabin: 'ECONOMY',
                            fareBasis: 'MR21AUKO',
                            brandedFare: 'ECONLIGHT',
                            brandedFareLabel: 'ECONOMY LIGHT',
                            class: 'M',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: '1PC MAX 23KG 158LCM EACH',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '1PC MAX 15LB 7KG 115LCM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MILEAGE ACCRUAL',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
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
            id: '42',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT15H10M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T21:50:00',
                            },
                            arrival: {
                                iataCode: 'HKG',
                                terminal: '1',
                                at: '2025-08-03T05:10:00',
                            },
                            carrierCode: 'CX',
                            number: '138',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'CX',
                            },
                            duration: 'PT9H20M',
                            id: '23',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'HKG',
                                terminal: '1',
                                at: '2025-08-03T08:00:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T10:00:00',
                            },
                            carrierCode: 'CX',
                            number: '705',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'CX',
                            },
                            duration: 'PT3H',
                            id: '24',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '543.56',
                base: '386.00',
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
                grandTotal: '543.56',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['CX'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '543.56',
                        base: '386.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '23',
                            cabin: 'ECONOMY',
                            fareBasis: 'MR21AUKO',
                            brandedFare: 'ECONLIGHT',
                            brandedFareLabel: 'ECONOMY LIGHT',
                            class: 'M',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: '1PC MAX 23KG 158LCM EACH',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '1PC MAX 15LB 7KG 115LCM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MILEAGE ACCRUAL',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '24',
                            cabin: 'ECONOMY',
                            fareBasis: 'MR21AUKO',
                            brandedFare: 'ECONLIGHT',
                            brandedFareLabel: 'ECONOMY LIGHT',
                            class: 'M',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: '1PC MAX 23KG 158LCM EACH',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '1PC MAX 15LB 7KG 115LCM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MILEAGE ACCRUAL',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
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
            id: '43',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT16H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T21:50:00',
                            },
                            arrival: {
                                iataCode: 'HKG',
                                terminal: '1',
                                at: '2025-08-03T05:10:00',
                            },
                            carrierCode: 'CX',
                            number: '138',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'CX',
                            },
                            duration: 'PT9H20M',
                            id: '19',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'HKG',
                                terminal: '1',
                                at: '2025-08-03T09:00:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T10:55:00',
                            },
                            carrierCode: 'CX',
                            number: '717',
                            aircraft: {
                                code: '333',
                            },
                            operating: {
                                carrierCode: 'CX',
                            },
                            duration: 'PT2H55M',
                            id: '20',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '543.56',
                base: '386.00',
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
                grandTotal: '543.56',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['CX'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '543.56',
                        base: '386.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '19',
                            cabin: 'ECONOMY',
                            fareBasis: 'MR21AUKO',
                            brandedFare: 'ECONLIGHT',
                            brandedFareLabel: 'ECONOMY LIGHT',
                            class: 'M',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: '1PC MAX 23KG 158LCM EACH',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '1PC MAX 15LB 7KG 115LCM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MILEAGE ACCRUAL',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '20',
                            cabin: 'ECONOMY',
                            fareBasis: 'MR21AUKO',
                            brandedFare: 'ECONLIGHT',
                            brandedFareLabel: 'ECONOMY LIGHT',
                            class: 'M',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: '1PC MAX 23KG 158LCM EACH',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '1PC MAX 15LB 7KG 115LCM',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT ASSIGNMENT',
                                    isChargeable: true,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'MILEAGE ACCRUAL',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
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
            id: '44',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT18H15M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T07:55:00',
                            },
                            arrival: {
                                iataCode: 'ICN',
                                terminal: '2',
                                at: '2025-08-02T17:35:00',
                            },
                            carrierCode: 'KE',
                            number: '402',
                            aircraft: {
                                code: '77W',
                            },
                            operating: {
                                carrierCode: 'KE',
                            },
                            duration: 'PT10H40M',
                            id: '27',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'ICN',
                                terminal: '1',
                                at: '2025-08-02T19:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-02T23:10:00',
                            },
                            carrierCode: 'OZ',
                            number: '741',
                            aircraft: {
                                code: '388',
                            },
                            operating: {
                                carrierCode: 'OZ',
                            },
                            duration: 'PT5H40M',
                            id: '28',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '787.35',
                base: '658.00',
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
                grandTotal: '787.35',
                additionalServices: [
                    {
                        amount: '110.53',
                        type: 'CHECKED_BAGS',
                    },
                ],
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['KE'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '787.35',
                        base: '658.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '27',
                            cabin: 'ECONOMY',
                            fareBasis: 'ELE00RZS',
                            brandedFare: 'EYSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'E',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'MEAL',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '28',
                            cabin: 'ECONOMY',
                            fareBasis: 'ELE00RZS',
                            brandedFare: 'EYSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'Q',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'MEAL',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
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
            id: '45',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT18H30M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T07:55:00',
                            },
                            arrival: {
                                iataCode: 'ICN',
                                terminal: '2',
                                at: '2025-08-02T17:35:00',
                            },
                            carrierCode: 'KE',
                            number: '402',
                            aircraft: {
                                code: '77W',
                            },
                            operating: {
                                carrierCode: 'KE',
                            },
                            duration: 'PT10H40M',
                            id: '63',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'ICN',
                                terminal: '2',
                                at: '2025-08-02T19:45:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-02T23:25:00',
                            },
                            carrierCode: 'KE',
                            number: '659',
                            aircraft: {
                                code: '773',
                            },
                            operating: {
                                carrierCode: 'KE',
                            },
                            duration: 'PT5H40M',
                            id: '64',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '787.39',
                base: '658.00',
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
                grandTotal: '787.39',
                additionalServices: [
                    {
                        amount: '110.53',
                        type: 'CHECKED_BAGS',
                    },
                ],
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['KE'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '787.39',
                        base: '658.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '63',
                            cabin: 'ECONOMY',
                            fareBasis: 'ELE00RZS',
                            brandedFare: 'EYSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'E',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'MEAL',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '64',
                            cabin: 'ECONOMY',
                            fareBasis: 'ELE00RZS',
                            brandedFare: 'EYSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'E',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'MEAL',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
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
            id: '46',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 7,
            itineraries: [
                {
                    duration: 'PT18H50M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T07:55:00',
                            },
                            arrival: {
                                iataCode: 'ICN',
                                terminal: '2',
                                at: '2025-08-02T17:35:00',
                            },
                            carrierCode: 'KE',
                            number: '402',
                            aircraft: {
                                code: '77W',
                            },
                            operating: {
                                carrierCode: 'KE',
                            },
                            duration: 'PT10H40M',
                            id: '94',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'ICN',
                                at: '2025-08-02T19:55:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-02T23:45:00',
                            },
                            carrierCode: 'KE',
                            number: '5065',
                            aircraft: {
                                code: '7M8',
                            },
                            operating: {
                                carrierCode: 'LJ',
                            },
                            duration: 'PT5H50M',
                            id: '95',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '787.39',
                base: '658.00',
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
                grandTotal: '787.39',
                additionalServices: [
                    {
                        amount: '110.53',
                        type: 'CHECKED_BAGS',
                    },
                ],
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['KE'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '787.39',
                        base: '658.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '94',
                            cabin: 'ECONOMY',
                            fareBasis: 'ELE00RZS',
                            brandedFare: 'EYSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'E',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'MEAL',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '95',
                            cabin: 'ECONOMY',
                            fareBasis: 'ELE00RZS',
                            brandedFare: 'EYSTANDARD',
                            brandedFareLabel: 'ECONOMY STANDARD',
                            class: 'E',
                            includedCheckedBags: {
                                quantity: 1,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'MEAL',
                                    isChargeable: false,
                                    amenityType: 'MEAL',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
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
            id: '47',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT25H30M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T19:40:00',
                            },
                            arrival: {
                                iataCode: 'PEK',
                                terminal: '3',
                                at: '2025-08-03T05:25:00',
                            },
                            carrierCode: 'CA',
                            number: '174',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'CA',
                            },
                            duration: 'PT11H45M',
                            id: '65',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'PEK',
                                terminal: '3',
                                at: '2025-08-03T14:00:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T18:10:00',
                            },
                            carrierCode: 'CA',
                            number: '959',
                            aircraft: {
                                code: '7M8',
                            },
                            operating: {
                                carrierCode: 'CA',
                            },
                            duration: 'PT5H10M',
                            id: '66',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '870.65',
                base: '719.00',
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
                grandTotal: '870.65',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['CA'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '870.65',
                        base: '719.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '65',
                            cabin: 'ECONOMY',
                            fareBasis: 'QLRCOAU6',
                            brandedFare: 'FLEXECO',
                            brandedFareLabel: 'ECONOMY FLEX',
                            class: 'Q',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '66',
                            cabin: 'ECONOMY',
                            fareBasis: 'QLRCOAU6',
                            brandedFare: 'FLEXECO',
                            brandedFareLabel: 'ECONOMY FLEX',
                            class: 'Q',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
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
            id: '48',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT31H30M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T19:40:00',
                            },
                            arrival: {
                                iataCode: 'PEK',
                                terminal: '3',
                                at: '2025-08-03T05:25:00',
                            },
                            carrierCode: 'CA',
                            number: '174',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'CA',
                            },
                            duration: 'PT11H45M',
                            id: '73',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'PEK',
                                terminal: '3',
                                at: '2025-08-03T20:05:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-04T00:10:00',
                            },
                            carrierCode: 'CA',
                            number: '979',
                            aircraft: {
                                code: '7M8',
                            },
                            operating: {
                                carrierCode: 'CA',
                            },
                            duration: 'PT5H5M',
                            id: '74',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '870.65',
                base: '719.00',
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
                grandTotal: '870.65',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['CA'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '870.65',
                        base: '719.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '73',
                            cabin: 'ECONOMY',
                            fareBasis: 'QLRCOAU6',
                            brandedFare: 'FLEXECO',
                            brandedFareLabel: 'ECONOMY FLEX',
                            class: 'Q',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '74',
                            cabin: 'ECONOMY',
                            fareBasis: 'QLRCOAU6',
                            brandedFare: 'FLEXECO',
                            brandedFareLabel: 'ECONOMY FLEX',
                            class: 'Q',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'REFUNDABLE TICKET',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGEABLE TICKET',
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
            id: '49',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT12H',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T11:00:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '0',
                                at: '2025-08-02T17:30:00',
                            },
                            carrierCode: 'SQ',
                            number: '232',
                            aircraft: {
                                code: '388',
                            },
                            operating: {
                                carrierCode: 'SQ',
                            },
                            duration: 'PT8H30M',
                            id: '1',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '2',
                                at: '2025-08-02T18:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-02T20:00:00',
                            },
                            carrierCode: 'SQ',
                            number: '720',
                            aircraft: {
                                code: '787',
                            },
                            operating: {
                                carrierCode: 'SQ',
                            },
                            duration: 'PT2H30M',
                            id: '2',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '2170.72',
                base: '2079.00',
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
                grandTotal: '2170.72',
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
                        currency: 'EUR',
                        total: '2170.72',
                        base: '2079.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '1',
                            cabin: 'ECONOMY',
                            fareBasis: 'YIFSQ',
                            brandedFare: 'YCLFLEXI',
                            brandedFareLabel: 'ECONOMY FLEXI',
                            class: 'Y',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'NO SHOW',
                                    isChargeable: true,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION STANDARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CANCELLATION',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BOOKING CHANGE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION FORWARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '100 PERCENT KF MILES EARNED',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE WITH MILES PWM',
                                    isChargeable: true,
                                    amenityType: 'UPGRADES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '2',
                            cabin: 'ECONOMY',
                            fareBasis: 'YIFSQ',
                            brandedFare: 'YCLFLEXI',
                            brandedFareLabel: 'ECONOMY FLEXI',
                            class: 'Y',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'NO SHOW',
                                    isChargeable: true,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION STANDARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CANCELLATION',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BOOKING CHANGE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION FORWARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '100 PERCENT KF MILES EARNED',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE WITH MILES PWM',
                                    isChargeable: true,
                                    amenityType: 'UPGRADES',
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
            id: '50',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT12H30M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T07:55:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '0',
                                at: '2025-08-02T14:15:00',
                            },
                            carrierCode: 'SQ',
                            number: '212',
                            aircraft: {
                                code: '77W',
                            },
                            operating: {
                                carrierCode: 'SQ',
                            },
                            duration: 'PT8H20M',
                            id: '59',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '2',
                                at: '2025-08-02T16:00:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-02T17:25:00',
                            },
                            carrierCode: 'SQ',
                            number: '712',
                            aircraft: {
                                code: '787',
                            },
                            operating: {
                                carrierCode: 'SQ',
                            },
                            duration: 'PT2H25M',
                            id: '60',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '2170.72',
                base: '2079.00',
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
                grandTotal: '2170.72',
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
                        currency: 'EUR',
                        total: '2170.72',
                        base: '2079.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '59',
                            cabin: 'ECONOMY',
                            fareBasis: 'YIFSQ',
                            brandedFare: 'YCLFLEXI',
                            brandedFareLabel: 'ECONOMY FLEXI',
                            class: 'Y',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'NO SHOW',
                                    isChargeable: true,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION STANDARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CANCELLATION',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BOOKING CHANGE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION FORWARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '100 PERCENT KF MILES EARNED',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE WITH MILES PWM',
                                    isChargeable: true,
                                    amenityType: 'UPGRADES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '60',
                            cabin: 'ECONOMY',
                            fareBasis: 'YIFSQ',
                            brandedFare: 'YCLFLEXI',
                            brandedFareLabel: 'ECONOMY FLEXI',
                            class: 'Y',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'NO SHOW',
                                    isChargeable: true,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION STANDARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CANCELLATION',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BOOKING CHANGE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION FORWARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '100 PERCENT KF MILES EARNED',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE WITH MILES PWM',
                                    isChargeable: true,
                                    amenityType: 'UPGRADES',
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
            id: '51',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT14H5M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T07:55:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '0',
                                at: '2025-08-02T14:15:00',
                            },
                            carrierCode: 'SQ',
                            number: '212',
                            aircraft: {
                                code: '77W',
                            },
                            operating: {
                                carrierCode: 'SQ',
                            },
                            duration: 'PT8H20M',
                            id: '13',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '2',
                                at: '2025-08-02T17:30:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-02T19:00:00',
                            },
                            carrierCode: 'SQ',
                            number: '714',
                            aircraft: {
                                code: '787',
                            },
                            operating: {
                                carrierCode: 'SQ',
                            },
                            duration: 'PT2H30M',
                            id: '14',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '2170.72',
                base: '2079.00',
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
                grandTotal: '2170.72',
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
                        currency: 'EUR',
                        total: '2170.72',
                        base: '2079.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '13',
                            cabin: 'ECONOMY',
                            fareBasis: 'YIFSQ',
                            brandedFare: 'YCLFLEXI',
                            brandedFareLabel: 'ECONOMY FLEXI',
                            class: 'Y',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'NO SHOW',
                                    isChargeable: true,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION STANDARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CANCELLATION',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BOOKING CHANGE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION FORWARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '100 PERCENT KF MILES EARNED',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE WITH MILES PWM',
                                    isChargeable: true,
                                    amenityType: 'UPGRADES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '14',
                            cabin: 'ECONOMY',
                            fareBasis: 'YIFSQ',
                            brandedFare: 'YCLFLEXI',
                            brandedFareLabel: 'ECONOMY FLEXI',
                            class: 'Y',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'NO SHOW',
                                    isChargeable: true,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION STANDARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CANCELLATION',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BOOKING CHANGE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION FORWARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '100 PERCENT KF MILES EARNED',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE WITH MILES PWM',
                                    isChargeable: true,
                                    amenityType: 'UPGRADES',
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
            id: '52',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT17H30M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T18:05:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                terminal: '0',
                                at: '2025-08-03T00:20:00',
                            },
                            carrierCode: 'SQ',
                            number: '242',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'SQ',
                            },
                            duration: 'PT8H15M',
                            id: '61',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'SIN',
                                terminal: '2',
                                at: '2025-08-03T07:10:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T08:35:00',
                            },
                            carrierCode: 'SQ',
                            number: '706',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'SQ',
                            },
                            duration: 'PT2H25M',
                            id: '62',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '2170.72',
                base: '2079.00',
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
                grandTotal: '2170.72',
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
                        currency: 'EUR',
                        total: '2170.72',
                        base: '2079.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '61',
                            cabin: 'ECONOMY',
                            fareBasis: 'YIFSQ',
                            brandedFare: 'YCLFLEXI',
                            brandedFareLabel: 'ECONOMY FLEXI',
                            class: 'Y',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'NO SHOW',
                                    isChargeable: true,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION STANDARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CANCELLATION',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BOOKING CHANGE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION FORWARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '100 PERCENT KF MILES EARNED',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE WITH MILES PWM',
                                    isChargeable: true,
                                    amenityType: 'UPGRADES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '62',
                            cabin: 'ECONOMY',
                            fareBasis: 'YIFSQ',
                            brandedFare: 'YCLFLEXI',
                            brandedFareLabel: 'ECONOMY FLEXI',
                            class: 'Y',
                            includedCheckedBags: {
                                weight: 30,
                                weightUnit: 'KG',
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'NO SHOW',
                                    isChargeable: true,
                                    amenityType: 'TRAVEL_SERVICES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION STANDARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CANCELLATION',
                                    isChargeable: true,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'BOOKING CHANGE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'SEAT SELECTION FORWARD ZONE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: '100 PERCENT KF MILES EARNED',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'UPGRADE WITH MILES PWM',
                                    isChargeable: true,
                                    amenityType: 'UPGRADES',
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
            id: '53',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT18H45M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T12:50:00',
                            },
                            arrival: {
                                iataCode: 'HND',
                                terminal: '0',
                                at: '2025-08-02T21:35:00',
                            },
                            carrierCode: 'NH',
                            number: '890',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'NH',
                            },
                            duration: 'PT9H45M',
                            id: '83',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'HND',
                                terminal: '0',
                                at: '2025-08-03T00:05:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T04:35:00',
                            },
                            carrierCode: 'NH',
                            number: '849',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'NH',
                            },
                            duration: 'PT6H30M',
                            id: '84',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '5551.37',
                base: '5285.00',
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
                grandTotal: '5551.37',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['NH'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '5551.37',
                        base: '5285.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '83',
                            cabin: 'ECONOMY',
                            fareBasis: 'YFA0WQOY',
                            brandedFare: 'ECOFULFLX',
                            brandedFareLabel: 'ECO I FULLFLEX 2F',
                            class: 'Y',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG 2 PCS 23 KG EACH',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE SEAT ASSIGNMENT',
                                    isChargeable: false,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE AFTER DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND AFTER DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '84',
                            cabin: 'ECONOMY',
                            fareBasis: 'Y2WOWA1',
                            brandedFare: 'ECOFULFLX',
                            brandedFareLabel: 'ECO I FULLFLEX 2F',
                            class: 'Y',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG 2 PCS 23 KG EACH',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE SEAT ASSIGNMENT',
                                    isChargeable: false,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE AFTER DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND AFTER DEPARTURE',
                                    isChargeable: false,
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
            id: '54',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    duration: 'PT21H35M',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T20:55:00',
                            },
                            arrival: {
                                iataCode: 'HND',
                                terminal: '0',
                                at: '2025-08-03T05:45:00',
                            },
                            carrierCode: 'NH',
                            number: '880',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'NH',
                            },
                            duration: 'PT9H50M',
                            id: '75',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'HND',
                                terminal: '0',
                                at: '2025-08-03T10:50:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T15:30:00',
                            },
                            carrierCode: 'NH',
                            number: '847',
                            aircraft: {
                                code: '781',
                            },
                            operating: {
                                carrierCode: 'NH',
                            },
                            duration: 'PT6H40M',
                            id: '76',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '5596.37',
                base: '5330.00',
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
                grandTotal: '5596.37',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['NH'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '5596.37',
                        base: '5330.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '75',
                            cabin: 'ECONOMY',
                            fareBasis: 'YFA0WQOY',
                            brandedFare: 'ECOFULFLX',
                            brandedFareLabel: 'ECO I FULLFLEX 2F',
                            class: 'Y',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG 2 PCS 23 KG EACH',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE SEAT ASSIGNMENT',
                                    isChargeable: false,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE AFTER DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND AFTER DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '76',
                            cabin: 'ECONOMY',
                            fareBasis: 'Y2WOWA1',
                            brandedFare: 'ECOFULFLX',
                            brandedFareLabel: 'ECO I FULLFLEX 2F',
                            class: 'Y',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG 2 PCS 23 KG EACH',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE SEAT ASSIGNMENT',
                                    isChargeable: false,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE AFTER DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND AFTER DEPARTURE',
                                    isChargeable: false,
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
            id: '55',
            source: 'GDS',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: '2025-08-02',
            lastTicketingDateTime: '2025-08-02',
            numberOfBookableSeats: 4,
            itineraries: [
                {
                    duration: 'PT19H',
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                terminal: '1',
                                at: '2025-08-02T12:50:00',
                            },
                            arrival: {
                                iataCode: 'HND',
                                terminal: '0',
                                at: '2025-08-02T21:35:00',
                            },
                            carrierCode: 'NH',
                            number: '890',
                            aircraft: {
                                code: '789',
                            },
                            operating: {
                                carrierCode: 'NH',
                            },
                            duration: 'PT9H45M',
                            id: '7',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                        {
                            departure: {
                                iataCode: 'HND',
                                terminal: '3',
                                at: '2025-08-03T00:20:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-03T04:50:00',
                            },
                            carrierCode: 'NH',
                            number: '5965',
                            aircraft: {
                                code: '359',
                            },
                            operating: {
                                carrierCode: 'TG',
                            },
                            duration: 'PT6H30M',
                            id: '8',
                            numberOfStops: 0,
                            blacklistedInEU: false,
                        },
                    ],
                },
            ],
            price: {
                currency: 'EUR',
                total: '5597.71',
                base: '5330.00',
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
                grandTotal: '5597.71',
            },
            pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
            },
            validatingAirlineCodes: ['NH'],
            travelerPricings: [
                {
                    travelerId: '1',
                    fareOption: 'STANDARD',
                    travelerType: 'ADULT',
                    price: {
                        currency: 'EUR',
                        total: '5597.71',
                        base: '5330.00',
                    },
                    fareDetailsBySegment: [
                        {
                            segmentId: '7',
                            cabin: 'ECONOMY',
                            fareBasis: 'YFA0WQOY',
                            brandedFare: 'ECOFULFLX',
                            brandedFareLabel: 'ECO I FULLFLEX 2F',
                            class: 'Y',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                quantity: 1,
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG 2 PCS 23 KG EACH',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE SEAT ASSIGNMENT',
                                    isChargeable: false,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE AFTER DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND AFTER DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                            ],
                        },
                        {
                            segmentId: '8',
                            cabin: 'ECONOMY',
                            fareBasis: 'Y2WOWA1',
                            brandedFare: 'ECOFULFLX',
                            brandedFareLabel: 'ECO I FULLFLEX 2F',
                            class: 'Y',
                            includedCheckedBags: {
                                quantity: 2,
                            },
                            includedCabinBags: {
                                weight: 7,
                                weightUnit: 'KG',
                            },
                            amenities: [
                                {
                                    description: 'CHECKED BAG 2 PCS 23 KG EACH',
                                    isChargeable: false,
                                    amenityType: 'BAGGAGE',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'PRE SEAT ASSIGNMENT',
                                    isChargeable: false,
                                    amenityType: 'PRE_RESERVED_SEAT',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE BEFORE DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'CHANGE AFTER DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND BEFORE DEPARTURE',
                                    isChargeable: false,
                                    amenityType: 'BRANDED_FARES',
                                    amenityProvider: {
                                        name: 'BrandedFare',
                                    },
                                },
                                {
                                    description: 'REFUND AFTER DEPARTURE',
                                    isChargeable: false,
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
    ],
    dictionaries: {
        locations: {
            PVG: {
                cityCode: 'SHA',
                countryCode: 'CN',
            },
            TFU: {
                cityCode: 'CTU',
                countryCode: 'CN',
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
            HKG: {
                cityCode: 'HKG',
                countryCode: 'HK',
            },
            DPS: {
                cityCode: 'DPS',
                countryCode: 'ID',
            },
            CGK: {
                cityCode: 'JKT',
                countryCode: 'ID',
            },
            MNL: {
                cityCode: 'MNL',
                countryCode: 'PH',
            },
            CAN: {
                cityCode: 'CAN',
                countryCode: 'CN',
            },
            HAK: {
                cityCode: 'HAK',
                countryCode: 'CN',
            },
            MEL: {
                cityCode: 'MEL',
                countryCode: 'AU',
            },
            ICN: {
                cityCode: 'SEL',
                countryCode: 'KR',
            },
            PEK: {
                cityCode: 'BJS',
                countryCode: 'CN',
            },
            XMN: {
                cityCode: 'XMN',
                countryCode: 'CN',
            },
            BNE: {
                cityCode: 'BNE',
                countryCode: 'AU',
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
            HND: {
                cityCode: 'TYO',
                countryCode: 'JP',
            },
        },
        aircraft: {
            320: 'AIRBUS A320',
            321: 'AIRBUS A321',
            330: 'AIRBUS INDUSTRIE A330',
            332: 'AIRBUS A330-200',
            333: 'AIRBUS A330-300',
            350: 'AIRBUS INDUSTRIE A350',
            359: 'AIRBUS A350-900',
            388: 'AIRBUS A380-800',
            738: 'BOEING 737-800',
            773: 'BOEING 777-300',
            781: 'BOEING 787-10',
            787: '787  ALL SERIES PASSENGER',
            788: 'BOEING 787-8',
            789: 'BOEING 787-9',
            '7M8': 'BOEING 737 MAX 8',
            '32B': 'AIRBUS A321 (SHARKLETS)',
            '73H': 'BOEING 737-800 (WINGLETS)',
            '73M': 'BOEING 737-200 MIXED CONFIGURATION',
            '32Q': 'AIRBUS A321NEO',
            '32S': 'AIRBUS INDUSTRIE A318/A319/A320/A321',
            '77W': 'BOEING 777-300ER',
        },
        currencies: {
            EUR: 'EURO',
        },
        carriers: {
            '3U': 'SICHUAN AIRLINES',
            PR: 'PHILIPPINE AIRLINES',
            JQ: 'JETSTAR',
            HO: 'JUNEYAO AIRLINES',
            FM: 'SHANGHAI AIRLINES',
            HU: 'HAINAN AIRLINES',
            OD: 'BATIK AIR MALAYSIA',
            QF: 'QANTAS AIRWAYS',
            MF: 'XIAMEN AIRLINES',
            GA: 'GARUDA INDONESIA',
            KE: 'KOREAN AIR',
            ID: 'BATIK AIR INDONESIA',
            MH: 'MALAYSIA AIRLINES',
            CA: 'AIR CHINA',
            SQ: 'SINGAPORE AIRLINES',
            MU: 'CHINA EASTERN AIRLINES',
            H1: 'HAHN AIR SYSTEMS',
            OZ: 'ASIANA AIRLINES',
            TG: 'THAI AIRWAYS INTERNATIONAL',
            VJ: 'VIETJET AVIATION',
            CX: 'CATHAY PACIFIC',
            CZ: 'CHINA SOUTHERN AIRLINES',
            VN: 'VIETNAM AIRLINES',
            NH: 'ALL NIPPON AIRWAYS',
            W2: 'FLEXFLIGHT',
            TR: 'SCOOT',
            LJ: 'JIN AIR',
        },
    },
}
