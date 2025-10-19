export const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
        case 'scheduled':
            return 'bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1 rounded-md text-xs font-medium'
        case 'departed':
            return 'bg-blue-100 text-blue-700 border border-blue-300 px-3 py-1 rounded-md text-xs font-medium'
        case 'arrived':
            return 'bg-green-100 text-green-700 border border-green-300 px-3 py-1 rounded-md text-xs font-medium'
        case 'estimated':
            return 'bg-yellow-100 text-yellow-700 border border-yellow-300 px-3 py-1 rounded-md text-xs font-medium'
        case 'cancelled':
            return 'bg-red-100 text-red-700 border border-red-300 px-3 py-1 rounded-md text-xs font-medium font-bold'
        case 'pending_payment':
            return 'bg-orange-100 text-orange-700 border border-orange-300 px-3 py-1 rounded-md text-xs font-medium'
        case 'paid_pending_booking':
            return 'bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1 rounded-md text-xs font-medium'
        case 'ticketed':
            return 'bg-green-100 text-green-700 border border-green-300 px-3 py-1 rounded-md text-xs font-medium'
        case 'booked':
            return 'bg-cyan-100 text-cyan-700 border border-cyan-300 px-3 py-1 rounded-md text-xs font-medium'
        default:
            return 'bg-gray-200 text-gray-600 px-3 py-1 rounded-md text-xs font-medium'
    }
}
