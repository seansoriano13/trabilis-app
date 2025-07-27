export const mockFlightOffers = {
    data: [
        {
            id: '1',
            numberOfBookableSeats: 9,
            itineraries: [
                {
                    segments: [
                        {
                            departure: {
                                iataCode: 'SYD',
                                at: '2025-07-31T11:25:00',
                            },
                            arrival: {
                                iataCode: 'XMN',
                                at: '2025-07-31T18:50:00',
                            },
                            duration: 'PT9H25M',
                        },
                        {
                            departure: {
                                iataCode: 'XMN',
                                at: '2025-07-31T22:20:00',
                            },
                            arrival: {
                                iataCode: 'BKK',
                                at: '2025-08-01T00:50:00',
                            },
                            duration: 'PT3H30M',
                        },
                    ],
                },
            ],
            price: { total: '229.47' },
        },
        {
            id: '2',
            numberOfBookableSeats: 5,
            itineraries: [
                {
                    segments: [
                        {
                            departure: {
                                iataCode: 'MNL',
                                at: '2025-07-31T08:00:00',
                            },
                            arrival: {
                                iataCode: 'NRT',
                                at: '2025-07-31T13:00:00',
                            },
                            duration: 'PT5H',
                        },
                    ],
                },
            ],
            price: { total: '310.00' },
        },
        {
            id: '3',
            numberOfBookableSeats: 3,
            itineraries: [
                {
                    segments: [
                        {
                            departure: {
                                iataCode: 'MNL',
                                at: '2025-07-31T12:00:00',
                            },
                            arrival: {
                                iataCode: 'SIN',
                                at: '2025-07-31T15:00:00',
                            },
                            duration: 'PT3H',
                        },
                    ],
                },
            ],
            price: { total: '180.00' },
        },
        {
            id: '4',
            numberOfBookableSeats: 7,
            itineraries: [
                {
                    segments: [
                        {
                            departure: {
                                iataCode: 'DXB',
                                at: '2025-07-31T09:30:00',
                            },
                            arrival: {
                                iataCode: 'LHR',
                                at: '2025-07-31T14:30:00',
                            },
                            duration: 'PT7H',
                        },
                    ],
                },
            ],
            price: { total: '420.00' },
        },
        {
            id: '5',
            numberOfBookableSeats: 2,
            itineraries: [
                {
                    segments: [
                        {
                            departure: {
                                iataCode: 'JFK',
                                at: '2025-07-31T06:45:00',
                            },
                            arrival: {
                                iataCode: 'CDG',
                                at: '2025-07-31T20:00:00',
                            },
                            duration: 'PT7H15M',
                        },
                    ],
                },
            ],
            price: { total: '390.00' },
        },
        {
            id: '6',
            numberOfBookableSeats: 4,
            itineraries: [
                {
                    segments: [
                        {
                            departure: {
                                iataCode: 'LAX',
                                at: '2025-07-31T15:00:00',
                            },
                            arrival: {
                                iataCode: 'JFK',
                                at: '2025-07-31T23:30:00',
                            },
                            duration: 'PT5H30M',
                        },
                    ],
                },
            ],
            price: { total: '250.00' },
        },
        {
            id: '7',
            numberOfBookableSeats: 6,
            itineraries: [
                {
                    segments: [
                        {
                            departure: {
                                iataCode: 'ICN',
                                at: '2025-07-31T13:00:00',
                            },
                            arrival: {
                                iataCode: 'HND',
                                at: '2025-07-31T15:30:00',
                            },
                            duration: 'PT2H30M',
                        },
                    ],
                },
            ],
            price: { total: '140.00' },
        },
        {
            id: '8',
            numberOfBookableSeats: 10,
            itineraries: [
                {
                    segments: [
                        {
                            departure: {
                                iataCode: 'BKK',
                                at: '2025-07-31T20:00:00',
                            },
                            arrival: {
                                iataCode: 'HKG',
                                at: '2025-07-31T23:00:00',
                            },
                            duration: 'PT1H',
                        },
                    ],
                },
            ],
            price: { total: '160.00' },
        },
    ],
}
